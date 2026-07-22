import os
import time
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("currency-proxy")

# Load environment variables
load_dotenv()

# Configuration variables
API_KEY = os.getenv("EXCHANGE_RATE_API_KEY", "").strip()
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "7200"))  # default: 2 hours
ALLOWED_ORIGINS_STR = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:8000,http://127.0.0.1:8000,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500"
)
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()]

app = FastAPI(
    title="Antigravity Currency Proxy API",
    description="A secure and cached proxy API for currency conversion",
    version="1.0.0"
)

# Enforce CORS whitelist
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Custom TTL Cache Implementation
class TTLMemoryCache:
    def __init__(self, ttl_seconds: int):
        self.ttl = ttl_seconds
        # Structure: {base_currency: (cache_timestamp, rates_dict)}
        self.cache: Dict[str, tuple[float, Dict[str, float]]] = {}

    def get(self, base: str) -> Optional[Dict[str, float]]:
        base = base.upper()
        if base not in self.cache:
            return None
        timestamp, rates = self.cache[base]
        if time.time() - timestamp > self.ttl:
            logger.info(f"Cache expired for base currency: {base}")
            del self.cache[base]
            return None
        logger.info(f"Cache hit for base currency: {base}")
        return rates

    def set(self, base: str, rates: Dict[str, float]):
        base = base.upper()
        self.cache[base] = (time.time(), rates)
        logger.info(f"Cached rates for base currency: {base} (TTL: {self.ttl}s)")

# Initialize cache
rates_cache = TTLMemoryCache(ttl_seconds=CACHE_TTL)

async def fetch_rates_from_api(base: str) -> Dict[str, float]:
    """
    Fetches the exchange rates from the upstream API.
    Uses custom key endpoint if API_KEY is provided, else falls back to open endpoint.
    """
    base = base.upper()
    if API_KEY:
        url = f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{base}"
        logger.info(f"Fetching rates using API_KEY for base: {base}")
    else:
        url = f"https://open.er-api.com/v6/latest/{base}"
        logger.info(f"Fetching rates using Free Open API for base: {base}")

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from upstream API: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=502,
                detail=f"Upstream currency API returned status code {e.response.status_code}"
            )
        except httpx.RequestError as e:
            logger.error(f"Request error connecting to upstream API: {e}")
            raise HTTPException(
                status_code=502,
                detail="Failed to connect to upstream currency API"
            )

    # Check for success result in API response
    if data.get("result") != "success":
        logger.error(f"Upstream API reported failure: {data}")
        error_type = data.get("error-type", "unknown")
        raise HTTPException(
            status_code=502,
            detail=f"Upstream API error: {error_type}"
        )

    # Rates can be in "conversion_rates" (v6 key API) or "rates" (free API)
    rates = data.get("conversion_rates") or data.get("rates")
    if not rates:
        logger.error("Upstream API response did not contain rates mapping")
        raise HTTPException(
            status_code=502,
            detail="Invalid response format from upstream API"
        )

    return rates

@app.get("/convert")
async def convert_currency(
    base: str = Query(..., description="Base currency code (e.g., USD)", min_length=3, max_length=3),
    target: str = Query(..., description="Target currency code (e.g., EUR)", min_length=3, max_length=3),
    amount: float = Query(..., description="Amount of base currency to convert", gt=0)
):
    base = base.upper()
    target = target.upper()

    # Try fetching rates from cache
    rates = rates_cache.get(base)
    is_cached = True

    if rates is None:
        # Cache miss, fetch fresh rates
        rates = await fetch_rates_from_api(base)
        rates_cache.set(base, rates)
        is_cached = False

    # Check if the target currency exists in rates
    if target not in rates:
        raise HTTPException(
            status_code=400,
            detail=f"Target currency code '{target}' not supported or not found"
        )

    rate = rates[target]
    converted_amount = round(amount * rate, 2)

    return {
        "base": base,
        "target": target,
        "amount": amount,
        "rate": rate,
        "converted_amount": converted_amount,
        "cached": is_cached,
        "timestamp": int(time.time())
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "cache_ttl_seconds": CACHE_TTL,
        "origins_allowed": ALLOWED_ORIGINS
    }

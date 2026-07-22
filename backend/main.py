import os
import time
import logging
import random
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
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
    description="A secure and cached proxy API for currency conversion and trends",
    version="1.1.0"
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
        # Structure: {key: (cache_timestamp, value)}
        self.cache: Dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        key = key.upper()
        if key not in self.cache:
            return None
        timestamp, value = self.cache[key]
        if time.time() - timestamp > self.ttl:
            logger.info(f"Cache expired for key: {key}")
            del self.cache[key]
            return None
        logger.info(f"Cache hit for key: {key}")
        return value

    def set(self, key: str, value: Any):
        key = key.upper()
        self.cache[key] = (time.time(), value)
        logger.info(f"Cached data for key: {key} (TTL: {self.ttl}s)")

# Initialize caches
rates_cache = TTLMemoryCache(ttl_seconds=CACHE_TTL)
history_cache = TTLMemoryCache(ttl_seconds=43200)  # 12 hours cache for historical rates

FRANKFURTER_CURRENCIES = {
    "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD",
    "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD",
    "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR"
}

def get_date_range() -> tuple[str, str]:
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=7)
    return start_date.isoformat(), end_date.isoformat()

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

@app.get("/history")
async def get_currency_history(
    base: str = Query(..., description="Base currency code (e.g., USD)", min_length=3, max_length=3),
    target: str = Query(..., description="Target currency code (e.g., EUR)", min_length=3, max_length=3)
):
    base = base.upper()
    target = target.upper()

    cache_key = f"{base}:{target}"
    cached_history = history_cache.get(cache_key)
    
    if cached_history is not None:
        return cached_history

    start_date, end_date = get_date_range()
    
    use_mock = False
    # If either currency isn't supported by Frankfurter, generate a mock walk
    if base not in FRANKFURTER_CURRENCIES or target not in FRANKFURTER_CURRENCIES:
        use_mock = True
        logger.info(f"Currency pair {base} -> {target} not supported by Frankfurter API. Generating mock history.")
        
    history_points = []
    
    if not use_mock:
        url = f"https://api.frankfurter.app/{start_date}..{end_date}?from={base}&to={target}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    rates_data = data.get("rates", {})
                    # Parse rates
                    for date_str, rate_mapping in sorted(rates_data.items()):
                        if target in rate_mapping:
                            history_points.append({
                                "date": date_str,
                                "rate": float(rate_mapping[target])
                            })
                else:
                    logger.warning(f"Frankfurter API returned status {response.status_code}. Falling back to mock.")
                    use_mock = True
            except Exception as e:
                logger.error(f"Error fetching from Frankfurter API: {e}. Falling back to mock.")
                use_mock = True

    # Generate deterministic mock history ending at current rate if needed
    if use_mock or len(history_points) == 0:
        # Get baseline current rate
        current_rates = rates_cache.get(base)
        if current_rates is None:
            try:
                current_rates = await fetch_rates_from_api(base)
                rates_cache.set(base, current_rates)
            except Exception as e:
                raise HTTPException(
                    status_code=502,
                    detail=f"Failed to fetch current rate for history baseline: {str(e)}"
                )
        
        current_rate = current_rates.get(target)
        if not current_rate:
            raise HTTPException(
                status_code=400,
                detail=f"Currency rate from '{base}' to '{target}' is unavailable."
            )
            
        # Seed randomizer based on date and currency codes to keep path stable during the day
        random.seed(f"{base}-{target}-{start_date}")
        history_points = []
        current = current_rate
        # Generate 8 points (7 intervals)
        for i in range(8):
            day = datetime.utcnow().date() - timedelta(days=7 - i)
            date_str = day.isoformat()
            # Random walk variation
            change = random.uniform(-0.012, 0.012)
            current = current * (1.0 + change)
            history_points.append({
                "date": date_str,
                "rate": round(current, 6)
            })
            
        # Adjust so the last point matches the current rate exactly
        final_mock = history_points[-1]["rate"]
        ratio = current_rate / final_mock if final_mock > 0 else 1.0
        for p in history_points:
            p["rate"] = round(p["rate"] * ratio, 6)

    result = {
        "base": base,
        "target": target,
        "start_date": start_date,
        "end_date": end_date,
        "history": history_points,
        "is_mock": use_mock
    }
    
    history_cache.set(cache_key, result)
    return result

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "cache_ttl_seconds": CACHE_TTL,
        "origins_allowed": ALLOWED_ORIGINS
    }

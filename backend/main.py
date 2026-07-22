import os
import time
import logging
import sqlite3
import random
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
DB_PATH = "database.db"

app = FastAPI(
    title="SS Labz Currency Proxy API",
    description="A secure and cached proxy API with dynamic whitelisting",
    version="1.2.0"
)

# SQLite whitelist database initialization
def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS whitelist (
                origin TEXT PRIMARY KEY,
                client_name TEXT,
                created_at TEXT
            )
        """)
        
        # Seed database with initial default CORS origins if empty
        cursor.execute("SELECT COUNT(*) FROM whitelist")
        if cursor.fetchone()[0] == 0:
            logger.info("Initializing whitelist database with default origins...")
            default_origins = [
                ("http://localhost:8000", "Local API Dev", datetime.utcnow().isoformat()),
                ("http://127.0.0.1:8000", "Local API Dev", datetime.utcnow().isoformat()),
                ("http://localhost:3000", "React Dev Server", datetime.utcnow().isoformat()),
                ("http://127.0.0.1:3000", "React Dev Server", datetime.utcnow().isoformat()),
                ("http://localhost:5500", "Frontend Dev Server", datetime.utcnow().isoformat()),
                ("http://127.0.0.1:5500", "Frontend Dev Server", datetime.utcnow().isoformat()),
            ]
            cursor.executemany("INSERT INTO whitelist VALUES (?, ?, ?)", default_origins)
            conn.commit()
            
        conn.close()
        logger.info("Whitelist database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize whitelist database: {e}")

@app.on_event("startup")
def startup_event():
    init_db()

# Custom Dynamic CORSMiddleware subclass checking origins against SQLite database
class DynamicCORSMiddleware(CORSMiddleware):
    def is_allowed_origin(self, origin: str) -> bool:
        # Check SQLite db
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            # Wildcard '*' whitelist override check
            cursor.execute("SELECT 1 FROM whitelist WHERE origin = ? OR origin = '*'", (origin,))
            allowed = cursor.fetchone() is not None
            conn.close()
            if allowed:
                return True
        except Exception as e:
            logger.error(f"Error reading SQLite whitelist: {e}")
            
        # Fallback to local static configurations list
        return origin in self.allow_origins

# Register Dynamic CORSMiddleware
app.add_middleware(
    DynamicCORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Pydantic models for admin endpoints
class WhitelistCreate(BaseModel):
    origin: str
    client_name: str

class TTLMemoryCache:
    def __init__(self, ttl_seconds: int):
        self.ttl = ttl_seconds
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
history_cache = TTLMemoryCache(ttl_seconds=43200)  # 12 hours

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

    if data.get("result") != "success":
        logger.error(f"Upstream API reported failure: {data}")
        error_type = data.get("error-type", "unknown")
        raise HTTPException(
            status_code=502,
            detail=f"Upstream API error: {error_type}"
        )

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

    rates = rates_cache.get(base)
    is_cached = True

    if rates is None:
        rates = await fetch_rates_from_api(base)
        rates_cache.set(base, rates)
        is_cached = False

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

    if use_mock or len(history_points) == 0:
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
            
        random.seed(f"{base}-{target}-{start_date}")
        history_points = []
        current = current_rate
        for i in range(8):
            day = datetime.utcnow().date() - timedelta(days=7 - i)
            date_str = day.isoformat()
            change = random.uniform(-0.012, 0.012)
            current = current * (1.0 + change)
            history_points.append({
                "date": date_str,
                "rate": round(current, 6)
            })
            
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

# Whitelist Dynamic Management Endpoint
@app.post("/whitelist", status_code=201)
def add_origin_to_whitelist(
    payload: WhitelistCreate,
    x_admin_token: Optional[str] = Header(None)
):
    ADMIN_TOKEN = os.getenv("ADMIN_SECRET_TOKEN", "admin_secret").strip()
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized. Invalid or missing X-Admin-Token header."
        )

    origin = payload.origin.strip().lower()
    client_name = payload.client_name.strip()

    if not origin:
        raise HTTPException(status_code=400, detail="Origin cannot be empty.")

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO whitelist (origin, client_name, created_at) VALUES (?, ?, ?)",
            (origin, client_name, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
        logger.info(f"Dynamically whitelisted origin: {origin} ({client_name})")
        return {"status": "success", "message": f"Origin {origin} added to whitelist."}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail=f"Origin {origin} already whitelisted.")
    except Exception as e:
        logger.error(f"Whitelist DB insertion error: {e}")
        raise HTTPException(status_code=500, detail="Database write error.")

@app.get("/health")
def health_check():
    # Return count of whitelisted origins in db
    whitelist_count = 0
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM whitelist")
        whitelist_count = cursor.fetchone()[0]
        conn.close()
    except Exception:
        pass

    return {
        "status": "healthy",
        "cache_ttl_seconds": CACHE_TTL,
        "origins_allowed_static": ALLOWED_ORIGINS,
        "dynamic_whitelist_count": whitelist_count
    }

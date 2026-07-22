# SS Labz Currency Converter Widget

A secure, isolated, and embeddable B2B currency converter widget designed for websites, hotel portals, and dashboards.

This project is structured in two parts:
1. **FastAPI Proxy Backend**: Handles currency rates, implements Time-to-Live (TTL) in-memory caching to save operational costs, and enforces domain whitelisting (CORS) against an SQLite or PostgreSQL database.
2. **Vanilla Web Component Frontend**: A completely self-contained Custom Element utilizing the Shadow DOM to isolate styles and prevent collisions with the host page. Features presets, custom theme override, and a dynamic Bezier spline trend chart.

---

## Features

- **Isolated Styling**: Encapsulated styling guarantees that host page styles (like Bootstrap, Tailwind, or WordPress layouts) will never break the widget.
- **Theme Presets**: Ready-to-use themes: `dark` (default), `light`, `glass`, and `midnight`.
- **CSS Branding Override**: Exposes CSS Custom Properties for deep styling customization (colors, borders, shadows) from the parent page.
- **Auto-Location Detection**: Automatically geolocates the visitor's IP address and sets the target currency to their national currency (stored in 24-hour browser `localStorage` cache).
- **Interactive 7-Day Trend Chart**: An accordion drawer at the bottom of the card expands to show a glowing Bezier spline trend curve generated dynamically via SVG.
- **Intelligent Caching proxy**: Reduces upstream API key usage by caching baseline conversion rates (2 hours) and historical ranges (12 hours) in memory.
- **Hybrid Database Connection Engine**: Swaps between PostgreSQL in production (e.g. Neon.tech) and SQLite local fallback depending on environmental settings.

---

## Directory Structure

```text
├── backend/
│   ├── main.py            # FastAPI proxy server, caches, and SQLite/PostgreSQL CORS middleware
│   ├── requirements.txt   # Python dependency declarations
│   ├── Dockerfile         # Backend container definition
│   ├── database.db        # SQLite local database registry (development fallback)
│   └── test_proxy.py      # Integration testing script
├── frontend/
│   ├── widget.js          # Encapsulated Web Component source
│   ├── index.html         # Dashboard & Themes preview portal
│   ├── widget-demo.html   # Widget integrations in mock checkout/booking cards
│   ├── analytics.html     # Caching analytics and SVG traffic bar chart
│   └── docs.html          # Split-pane developer manuals
├── Embeddable-Currency-Converter-Widget-Integration.md # Checkout integration & presentation manual
├── docker-compose.yml     # Multi-container orchestration tool
└── README.md              # Documentation
```

---

## Database Architecture
The backend is designed to run in both local development and cloud production environments with zero-config database swaps:

- **Local Fallback (SQLite)**: If the `DATABASE_URL` environment variable is not defined, the server initializes `database.db` locally. Connection queries automatically adapt to SQLite parameters (`?` placeholders) and implement a 30-second connection timeout to prevent concurrency blocks.
- **Cloud Production (PostgreSQL)**: If the `DATABASE_URL` environment variable is set (e.g., from Neon.tech), the server connects to PostgreSQL and translates queries to use standard PostgreSQL placeholders (`%s`).

---

## Proxy Backend Installation & Setup

### Requirements
- Python 3.10+
- Or Docker & Docker Compose

### 1. Manual Setup with Virtual Environment
Navigate to the project directory and create a virtual environment:

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

#### Running the Server
Start the server using `uvicorn`:
```bash
# Navigate to backend and start
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The API proxy will be available at `http://127.0.0.1:8000`. Documentation is accessible at `http://127.0.0.1:8000/docs`.

### 2. Docker Compose Deployment
Build and start the backend service in one step:
```bash
docker-compose up --build -d
```

---

## Environment Variables Configuration

Create a `.env` file in the `backend/` directory or pass these variables to your cloud containers:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `EXCHANGE_RATE_API_KEY` | Optional. Upstream ExchangeRate-API Key. Falls back to Free Open API if blank. | `""` (Open API) |
| `CACHE_TTL_SECONDS` | TTL for currency rate caching (seconds). | `7200` (2 Hours) |
| `ALLOWED_ORIGINS` | Comma-separated list of fallback whitelisted B2B client domains. | Localhost hosts |
| `ADMIN_SECRET_TOKEN` | Administration API key to authenticate whitelisting edits. | `"admin_secret"` |
| `DATABASE_URL` | Cloud database URL (PostgreSQL URI format). If empty, SQLite is used. | `""` |

---

## API Proxy Endpoints

### 1. Conversion Rate
`GET /convert?base={curr}&target={curr}&amount={val}`
- **Response**:
  ```json
  {
    "base": "USD",
    "target": "EUR",
    "amount": 100.0,
    "rate": 0.8767,
    "converted_amount": 87.67,
    "cached": true,
    "timestamp": 1784706032
  }
  ```

### 2. Historical Rate Range
`GET /history?base={base}&target={target}`
- **Response**: Returns a 7-day conversion rate timeline. Falls back deterministically to random-walk curves if currency isn't supported by the historical provider.

### 3. Dynamic CORS Domain Registration
`POST /whitelist`
- **Headers**: `X-Admin-Token: <ADMIN_SECRET_TOKEN>`
- **Payload**:
  ```json
  {
    "origin": "https://my-client.com",
    "client_name": "Production Checkout Client"
  }
  ```

### 4. Server Health & Database Metrics
`GET /health`
- **Response**: Reports caching configurations, active whitelisted client count, and active database driver type (`sqlite` or `postgresql`).

---

## Frontend Integration & Customization

Include the script and place the custom element tag anywhere in your HTML document:

```html
<!-- Load isolated script -->
<script src="widget.js"></script>

<!-- Place Converter -->
<currency-converter 
  api-url="http://localhost:8000" 
  theme="midnight" 
  default-amount="150" 
  default-base="USD" 
  default-target="auto">
</currency-converter>
```

---

## Multi-Page B2B Portal

The frontend folder contains a complete multi-page portal layout demonstrating SS Labz integrations:
- **`index.html` (Dashboard)**: Showcases five preconfigured widget visual configurations side-by-side.
- **`widget-demo.html` (Widgets Demo)**: Embeds independent widgets in mock payment pages, hotel booking cards, and expense summaries.
- **`analytics.html` (Analytics Page)**: Dynamically checks FastAPI server endpoints and outputs real-time cache rates and custom SVG hourly request graphs.
- **`docs.html` (Developer Documentation)**: A dual-pane user guide highlighting quick integration steps, attribute APIs, and CLI commands.

---

## Production Deployment Guide

Deploy your stack completely for free without card locks using the following configuration:

### 1. Neon.tech (Database Setup)
1. Sign up for a free account at [Neon.tech](https://neon.tech) (no credit card required).
2. Create a new project and copy your connection string (e.g. `postgresql://user:password@host/dbname?sslmode=require`).

### 2. Render.com (FastAPI Web Service)
1. Import your GitHub repository into Render.
2. Select **New > Web Service**.
3. Select your repository, configure name and select the **Free Instance Type** (no card required).
4. Add environment variables in the Render dashboard:
   - `DATABASE_URL` = `<Your Neon Connection URI>`
   - `ADMIN_SECRET_TOKEN` = `your_secure_admin_key`
5. Deploy. Render will serve your API (e.g., `https://ss-labz-api.onrender.com`).

### 3. Cloudflare Pages (Frontend Web Hosting)
1. Log in to Cloudflare dashboard and select **Pages > Connect to Git**.
2. Select your repository and choose the `frontend/` directory as the build root.
3. Deploy. Cloudflare will serve your pages (e.g., `https://ss-labz.pages.dev`).
4. Copy your pages URL, and send a `POST /whitelist` request to your Render API with your `X-Admin-Token` to dynamically register the domain in the Neon whitelist registry!

---

## Verification
You can execute automated checks using the python testing suite:
```bash
# Execute integration test
.venv\Scripts\python backend/test_proxy.py
```
To preview the widget layout locally, run a static server in your `frontend/` directory (e.g., `python -m http.server 5500`) and navigate to `http://localhost:5500`.

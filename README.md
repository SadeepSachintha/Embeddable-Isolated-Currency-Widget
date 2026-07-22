# SS Labz Currency Converter Widget

A secure, isolated, and embeddable B2B currency converter widget designed for websites, hotel portals, and dashboards. 

This project is structured in two parts:
1. **FastAPI Proxy Backend**: Handles currency rates, implements Time-to-Live (TTL) in-memory caching to save operational costs, and enforces domain whitelisting (CORS) against an SQLite database to safeguard endpoints.
2. **Vanilla Web Component Frontend**: A completely self-contained Custom Element utilizing the Shadow DOM to isolate styles and prevent collisions with the host page. Features presets, custom theme override, and a dynamic Bezier spline trend chart.

---

## Features

- **Isolated Styling**: Encapsulated styling guarantees that host page styles (like Bootstrap, Tailwind, or WordPress layouts) will never break the widget.
- **Theme Presets**: Ready-to-use themes: `dark` (default), `light`, `glass`, and `midnight`.
- **CSS Branding Override**: Exposes CSS Custom Properties for deep styling customization (colors, borders, shadows) from the parent page.
- **Auto-Location Detection**: Automatically geolocates the visitor's IP address and sets the target currency to their national currency (stored in 24-hour browser `localStorage` cache).
- **Interactive 7-Day Trend Chart**: An accordion drawer at the bottom of the card expands to show a glowing Bezier spline trend curve generated dynamically via SVG.
- **Intelligent Caching proxy**: Reduces upstream API key usage by caching baseline conversion rates (2 hours) and historical ranges (12 hours) in memory.
- **Dynamic Whitelisting via Database**: Resolves B2B client CORS requests dynamically against a local SQLite database, allowing on-the-fly origin registrations without restarting services.

---

## Directory Structure

```text
├── backend/
│   ├── main.py            # FastAPI proxy server, caches, and SQLite CORS middleware
│   ├── requirements.txt   # Python dependency declarations
│   ├── Dockerfile         # Backend container definition
│   ├── database.db        # SQLite whitelisting domain registry
│   └── test_proxy.py      # Integration testing script
├── frontend/
│   ├── widget.js          # Encapsulated Web Component source
│   ├── index.html         # Dashboard & Themes preview portal
│   ├── widget-demo.html   # Widget integrations in mock checkout/booking cards
│   ├── analytics.html     # Caching analytics and SVG traffic bar chart
│   └── docs.html          # Split-pane developer manuals
├── docker-compose.yml     # Multi-container orchestration tool
└── README.md              # Documentation
```

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

Create a `.env` file in the `backend/` directory or pass these variables to your docker containers:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `EXCHANGE_RATE_API_KEY` | Optional. Upstream ExchangeRate-API Key. Falls back to Free Open API if blank. | `""` (Open API) |
| `CACHE_TTL_SECONDS` | TTL for currency rate caching (seconds). | `7200` (2 Hours) |
| `ALLOWED_ORIGINS` | Comma-separated list of fallback whitelisted B2B client domains. | Localhost hosts |
| `ADMIN_SECRET_TOKEN` | Administration API key to authenticate whitelisting edits. | `"admin_secret"` |

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
    "origin": "http://dynamic-client.lk",
    "client_name": "Dynamic Boutique Checkout"
  }
  ```

### 4. Server Health & Database Metrics
`GET /health`
- **Response**: Reports caching configurations and active whitelisted client count.

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

### HTML Attributes

- **`api-url`**: Point this to your FastAPI proxy server (e.g. `https://api.yourdomain.com`).
- **`theme`**: Preset theme layouts: `dark`, `light`, `glass`, or `midnight`.
- **`default-amount`**: The starting amount displayed inside the input box (default: `100`).
- **`default-base`**: Currency code to convert from (default: `USD`).
- **`default-target`**: Currency code to convert to. Specify `"auto"` to trigger IP-based geolocation (default: `"auto"`).

### Custom Style Overrides

You can override colors, borders, and rounded edges from your main stylesheet without breaking internal elements. Target the element and set custom properties:

```css
currency-converter.my-brand-theme {
  --converter-primary: #ec4899;        /* Hover outlines and primary buttons */
  --converter-primary-hover: #db2777;  /* Active button backgrounds */
  --converter-bg: #1e1b4b;             /* Core background color */
  --converter-border: #fbcfe8;         /* Outlines and grid dividers */
  --converter-radius: 24px;            /* Border corners smoothness */
  --converter-shadow: 0 10px 30px rgba(236, 72, 153, 0.25);
}
```

---

## Multi-Page B2B Portal

The frontend folder contains a complete multi-page portal layout demonstrating SS Labz integrations:
- **`index.html` (Dashboard)**: Showcases five preconfigured widget visual configurations side-by-side.
- **`widget-demo.html` (Widgets Demo)**: Embeds independent widgets in mock payment pages, hotel booking cards, and expense summaries.
- **`analytics.html` (Analytics Page)**: Dynamically checks FastAPI server endpoints and outputs real-time cache rates and custom SVG hourly request graphs.
- **`docs.html` (Developer Documentation)**: A dual-pane user guide highlighting quick integration steps, attribute APIs, and CLI commands.

---

## Verification
You can execute automated checks using the python testing suite:
```bash
# Execute integration test
.venv\Scripts\python backend/test_proxy.py
```
To preview the widget layout locally, run a static server in your `frontend/` directory (e.g., `python -m http.server 5500`) and navigate to `http://localhost:5500`.

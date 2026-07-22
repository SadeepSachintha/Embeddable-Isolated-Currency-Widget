# Project Integration & Viva Cheat Sheet: B2B Currency Widget
Use this guide to explain the architecture, implementation choices, and integration steps of the currency converter widget for your Hotel Management System viva/presentation.

---

## 1. Project Concept & Architecture
This project is an **Enterprise-Grade, Isolated Currency Conversion Tool**. Instead of loading generic, layout-breaking widgets, it operates on a secure **Proxy & Custom Element** pattern:

```text
  [ Client Browser ]                              [ SS Labz Proxy API ]
┌──────────────────────────────────────┐        ┌──────────────────────────────────┐
│ Hotel Booking Page (Host Layout)     │        │ FastAPI Web Server               │
│                                      │        │                                  │
│ ┌──────────────────────────────────┐ │        │ ┌──────────────────────────────┐ │
│ │ <currency-converter> Widget      │ │        │ │ TTL Memory Cache             │ │
│ │ (Isolated styling in Shadow DOM) │ │        │ │ (Exchanges: 2h / History: 12h│ │
│ │                                  │ │        │ └──────────────────────────────┘ │
│ │  - Fetches Rates Offline/Online  │─┼───────>│                                  │
│ │  - Generates SVG Bezier Chart    │ │        │ ┌──────────────────────────────┐ │
│ └──────────────────────────────────┘ │        │ │ Dynamic SQLite/PostgreSQL    │ │
└──────────────────────────────────────┘        │ │ CORS Whitelist Database      │ │
                                                │ └──────────────────────────────┘ │
                                                └──────────────────────────────────┘
```

### Key Technical Talking Points for Examiners:
1. **Shadow DOM Encapsulation**: The widget styling is isolated from the host page. No matter what custom styles or CSS resets are used in the parent Hotel System (e.g., Bootstrap, Tailwind, custom styles), they will not leak in, nor will the widget styles break the hotel checkout layout.
2. **Caching Proxy Backend**: To avoid hitting API key limits and running up developer costs, a FastAPI backend acts as a proxy. It caches currency conversion results for **2 hours** and historical data for **12 hours** in memory.
3. **Dynamic CORS Whitelisting**: Secures your API. B2B client sites must be whitelisted in the SQLite/PostgreSQL database to prevent copycats from stealing your API backend limits.
4. **SVG Spline Engine**: Renders a custom glowing Bezier spline chart dynamically using tangent calculations from past dates. It does not load heavy external graphing libraries (like Chart.js or D3), keeping the page load time close to instant.

---

## 2. Step-by-Step Integration in Hotel Management Checkout
To integrate the currency options into your **Room Booking Confirmation** page, include the script and use the custom HTML tag:

```html
<!-- =========================================================================
     STEP 1: Import the self-contained Web Component Script
     Put this at the bottom of your HTML body before the closing </body> tag.
     ========================================================================= -->
<script src="widget.js"></script>

<!-- =========================================================================
     STEP 2: Embed the Currency Converter element into your layout.
     Configure via HTML attributes:
     - api-url: Points to your hosted SS Labz backend proxy server.
     - theme: Choose light/dark/glass/midnight to match your checkout design.
     - default-amount: Pre-fills widget input with the room reservation bill total.
     - default-base: The currency the hotel bills in (e.g., USD or EUR).
     - default-target="auto": Uses IP Geolocation to automatically select
       the visitor's home currency on startup.
     ========================================================================= -->
<div class="booking-checkout-box">
  <h3>Select Currency:</h3>
  <currency-converter 
    api-url="https://ss-labz-currency-api.onrender.com" 
    theme="light"
    default-amount="750" 
    default-base="USD" 
    default-target="auto">
  </currency-converter>
</div>

<!-- =========================================================================
     STEP 3 (Optional): Styling Customization
     If you want the widget to match your hotel brand colors (e.g., Hot Pink),
     override CSS variables from your host stylesheet:
     ========================================================================= -->
<style>
  currency-converter {
    --converter-primary: #db2777;        /* Pink borders on hover and inputs */
    --converter-primary-hover: #be185d;  /* Active theme colors */
    --converter-bg: #fff5f7;             /* Soft pink container background */
    --converter-radius: 12px;            /* Aligns rounded corners with checkout buttons */
  }
</style>
```

---

## 3. High-Frequency Viva Questions & Answers

### Q1: How does "Shadow DOM" prevent styling conflicts?
> **Answer**: The Shadow DOM allows a component to have its own isolated DOM subtree. Global CSS stylesheets on the host page cannot select elements inside the Shadow Root, and styles declared inside the Shadow Root do not leak out. This makes the component fully portable and "style-safe".

### Q2: What is the benefit of the Dynamic Whitelist (CORS) check?
> **Answer**: In a typical API, CORS headers are static. If we want to dynamically onboard client hotels, we would have to restart the backend container to reload env variables. By subclassing `CORSMiddleware` to query SQLite/PostgreSQL at runtime, client domains can be whitelisted on-the-fly via a secure `/whitelist` API endpoint, providing a flexible B2B SaaS model.

### Q3: How is the SVG trend curve made "smooth" without external libraries?
> **Answer**: Jagged lines look basic and unprofessional. Instead, we use an **Opposed-Line Spline Curve** algorithm. For each historical data coordinate $(x_i, y_i)$, we calculate a tangent slope based on the preceding and succeeding points:
> $$\text{angle} = \text{atan2}(y_{next} - y_{prev}, x_{next} - x_{prev})$$
> We use this angle to construct cubic Bezier curve segments (`C` parameters in the SVG path definition), resulting in a smooth, premium neon wave layout.

### Q4: How does the system behave if the client is offline?
> **Answer**: 
> 1. **Fonts & Layout**: Standard CSS fallbacks are declared (e.g., `-apple-system`, `Segoe UI`, `Arial`), so the browser uses local OS fonts when offline.
> 2. **IP Location**: If the geolocation API is unreachable, the JavaScript catches the error and assigns a fallback currency (`LKR`), avoiding console failures.
> 3. **Conversions & Charts**: The local database adapter implements a 30-second timeout. If the database is locked or offline, local memory caching handles rate resolutions.

### Q5: Why is uvicorn/FastAPI used on the backend?
> **Answer**: FastAPI is built on ASGI (Asynchronous Server Gateway Interface), making it significantly faster than WSGI frameworks like Django or Flask when executing concurrent requests. It automatically handles async tasks, yields high throughput, and auto-generates Swagger API documentation at `/docs`.

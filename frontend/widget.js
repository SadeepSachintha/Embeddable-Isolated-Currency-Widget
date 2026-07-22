(function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      :host {
        display: block;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        --primary: var(--converter-primary, #6366f1);
        --primary-hover: var(--converter-primary-hover, #4f46e5);
        --bg-glass: var(--converter-bg, rgba(17, 24, 39, 0.95));
        --border-glass: var(--converter-border, rgba(255, 255, 255, 0.08));
        --text-primary: var(--converter-text-primary, #f3f4f6);
        --text-secondary: var(--converter-text-secondary, #9ca3af);
        --text-muted: var(--converter-text-muted, #6b7280);
        --accent-success: var(--converter-success, #10b981);
        --accent-error: var(--converter-error, #ef4444);
        --border-radius: var(--converter-radius, 16px);
        --box-shadow: var(--converter-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3));
        max-width: 400px;
        width: 100%;
        margin: 0 auto;
      }

      .widget-container {
        background: var(--bg-glass);
        border: 1px solid var(--border-glass);
        border-radius: var(--border-radius);
        padding: 24px;
        box-shadow: var(--box-shadow);
        box-sizing: border-box;
        color: var(--text-primary);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border-color 0.3s ease;
        display: flex;
        flex-direction: column;
      }

      .widget-container:hover {
        box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.4), 0 12px 15px -8px rgba(0, 0, 0, 0.4);
      }

      /* ================= THEMES CONFIGURATIONS ================= */
      
      /* Theme: Dark (Default) */
      .widget-container.theme-dark {
        --bg-glass: var(--converter-bg, rgba(17, 24, 39, 0.95));
        --border-glass: var(--converter-border, rgba(255, 255, 255, 0.08));
        --text-primary: var(--converter-text-primary, #f3f4f6);
        --text-secondary: var(--converter-text-secondary, #9ca3af);
        --text-muted: var(--converter-text-muted, #6b7280);
        --primary: var(--converter-primary, #6366f1);
        --primary-hover: var(--converter-primary-hover, #4f46e5);
      }

      /* Theme: Light */
      .widget-container.theme-light {
        --bg-glass: var(--converter-bg, #ffffff);
        --border-glass: var(--converter-border, rgba(0, 0, 0, 0.08));
        --text-primary: var(--converter-text-primary, #1f2937);
        --text-secondary: var(--converter-text-secondary, #4b5563);
        --text-muted: var(--converter-text-muted, #9ca3af);
        --primary: var(--converter-primary, #4f46e5);
        --primary-hover: var(--converter-primary-hover, #3730a3);
        --box-shadow: var(--converter-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05));
      }

      .widget-container.theme-light .title {
        background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .widget-container.theme-light .currency-select option {
        background-color: #ffffff;
        color: #1f2937;
      }

      .widget-container.theme-light .currency-input,
      .widget-container.theme-light .currency-select,
      .widget-container.theme-light .swap-btn {
        background: rgba(0, 0, 0, 0.03);
      }

      .widget-container.theme-light .result-container {
        background: rgba(79, 70, 229, 0.04);
        border-color: rgba(79, 70, 229, 0.12);
      }

      /* Theme: Glassmorphic */
      .widget-container.theme-glass {
        --bg-glass: var(--converter-bg, rgba(255, 255, 255, 0.06));
        --border-glass: var(--converter-border, rgba(255, 255, 255, 0.12));
        --text-primary: var(--converter-text-primary, #ffffff);
        --text-secondary: var(--converter-text-secondary, rgba(255, 255, 255, 0.7));
        --text-muted: var(--converter-text-muted, rgba(255, 255, 255, 0.45));
        --primary: var(--converter-primary, #818cf8);
        --primary-hover: var(--converter-primary-hover, #6366f1);
      }

      .widget-container.theme-glass .currency-select option {
        background-color: #1f2937;
        color: #ffffff;
      }

      .widget-container.theme-glass .result-container {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.1);
      }

      /* Theme: Midnight Blue */
      .widget-container.theme-midnight {
        --bg-glass: var(--converter-bg, #0b1329);
        --border-glass: var(--converter-border, rgba(56, 189, 248, 0.15));
        --text-primary: var(--converter-text-primary, #f8fafc);
        --text-secondary: var(--converter-text-secondary, #94a3b8);
        --text-muted: var(--converter-text-muted, #64748b);
        --primary: var(--converter-primary, #38bdf8);
        --primary-hover: var(--converter-primary-hover, #0ea5e9);
        --box-shadow: var(--converter-shadow, 0 10px 25px -5px rgba(56, 189, 248, 0.15));
      }

      .widget-container.theme-midnight .title {
        background: linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .widget-container.theme-midnight .currency-select option {
        background-color: #0b1329;
        color: #f8fafc;
      }

      .widget-container.theme-midnight .result-container {
        background: rgba(56, 189, 248, 0.05);
        border-color: rgba(56, 189, 248, 0.15);
      }

      /* ========================================================= */

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .title {
        font-size: 1.1rem;
        font-weight: 600;
        letter-spacing: -0.025em;
        margin: 0;
        background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .logo-icon {
        width: 24px;
        height: 24px;
        color: var(--primary);
      }

      .form-group {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .currency-input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-glass);
        border-radius: 10px;
        color: var(--text-primary);
        font-size: 1.05rem;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .currency-input:focus {
        outline: none;
        border-color: var(--primary);
        background: rgba(255, 255, 255, 0.05);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      }

      .currency-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .select-wrapper {
        position: relative;
      }

      .currency-select {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-glass);
        border-radius: 10px;
        color: var(--text-primary);
        font-size: 0.95rem;
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        appearance: none;
        -webkit-appearance: none;
        box-sizing: border-box;
      }

      .currency-select:focus {
        outline: none;
        border-color: var(--primary);
        background: rgba(255, 255, 255, 0.05);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      }

      /* Option element styling inside dropdown */
      .currency-select option {
        background-color: #111827;
        color: #f3f4f6;
      }

      .swap-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 18px;
      }

      .swap-btn:hover {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
        transform: rotate(180deg);
      }

      .swap-btn svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }

      .result-container {
        background: rgba(99, 102, 241, 0.05);
        border: 1px solid rgba(99, 102, 241, 0.15);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        min-height: 76px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        transition: opacity 0.2s ease, background 0.3s ease, border-color 0.3s ease;
      }

      .result-value {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 4px 0;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .result-rate {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin: 0;
      }

      .result-source {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 4px;
      }

      .error-msg {
        color: var(--accent-error);
        font-size: 0.85rem;
        margin-top: 8px;
        display: none;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        padding: 10px;
        border-radius: 8px;
        text-align: center;
      }

      /* Spinner animation */
      .loader {
        display: none;
        width: 24px;
        height: 24px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: var(--primary);
        animation: spin 0.8s linear infinite;
        position: absolute;
        top: 26px;
        left: calc(50% - 12px);
      }

      .result-container.loading .result-content {
        opacity: 0.2;
      }

      .result-container.loading .loader {
        display: block;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Styling placeholder arrows for custom select on desktop */
      .select-wrapper::after {
        content: "▼";
        font-size: 0.65rem;
        color: var(--text-secondary);
        position: absolute;
        right: 14px;
        top: calc(50% - 4px);
        pointer-events: none;
      }

      /* ================= OPTION A: ACCORDION FOOTER STYLING ================= */

      .trend-footer-toggle {
        width: calc(100% + 48px);
        background: rgba(255, 255, 255, 0.015);
        border: none;
        border-top: 1px solid var(--border-glass);
        color: var(--text-secondary);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        padding: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
        margin: 16px -24px -24px -24px;
        border-bottom-left-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
        box-sizing: border-box;
      }

      .trend-footer-toggle:hover {
        background: rgba(255, 255, 255, 0.04);
        color: var(--primary);
      }

      .chevron-icon {
        width: 14px;
        height: 14px;
        fill: currentColor;
        transition: transform 0.3s ease;
      }

      .widget-container.expanded-trend .chevron-icon {
        transform: rotate(180deg);
      }

      .widget-container.expanded-trend .trend-footer-toggle {
        margin: 16px -24px 0 -24px;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      .trend-container {
        max-height: 0;
        overflow: hidden;
        width: calc(100% + 48px);
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        position: relative;
        transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease;
      }

      .widget-container.expanded-trend .trend-container {
        max-height: 170px;
        margin: 0 -24px -24px -24px;
        padding: 16px 24px 24px 24px;
        border-top: 1px dashed var(--border-glass);
      }

      .widget-container.theme-light .trend-footer-toggle {
        background: rgba(0, 0, 0, 0.005);
      }
      
      .widget-container.theme-light .trend-footer-toggle:hover {
        background: rgba(0, 0, 0, 0.03);
      }

      .trend-loader {
        display: none;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: var(--primary);
        animation: spin 0.8s linear infinite;
        position: absolute;
        top: 55px;
        left: calc(50% - 10px);
      }

      .trend-container.loading .trend-loader {
        display: block;
      }

      .trend-container.loading .trend-chart-wrapper {
        opacity: 0.1;
      }

      .trend-chart-wrapper {
        width: 100%;
        height: 130px;
        transition: opacity 0.2s ease;
      }

      #trend-svg text {
        font-family: inherit;
        font-size: 8px;
        fill: var(--text-secondary);
        user-select: none;
      }

      #trend-svg .grid-line {
        stroke: var(--border-glass);
        stroke-width: 0.8;
        stroke-opacity: 0.5;
        stroke-dasharray: 2,4;
      }

      #trend-svg .anchor-line {
        stroke: var(--border-glass);
        stroke-width: 0.8;
        stroke-opacity: 0.3;
        stroke-dasharray: 1,3;
      }
      
      #trend-svg .axis-label {
        font-size: 7.5px;
        fill: var(--text-muted);
      }
      
      #trend-svg .rate-value-label {
        font-weight: 600;
        font-size: 8.5px;
        fill: var(--text-primary);
      }

      @media (max-width: 480px) {
        :host {
          max-width: 100%;
        }
        .widget-container {
          padding: 16px;
        }
      }
    </style>

    <div class="widget-container">
      <div class="header">
        <h3 class="title">Currency Converter</h3>
        <svg class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>

      <div class="form-group">
        <label class="label" for="amount">Amount</label>
        <div class="input-wrapper">
          <input type="number" id="amount" class="currency-input" min="0.01" step="any" placeholder="Enter amount">
        </div>
      </div>

      <div class="currency-row">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="label" for="from-currency">From</label>
          <div class="select-wrapper">
            <select id="from-currency" class="currency-select"></select>
          </div>
        </div>

        <button type="button" class="swap-btn" id="swap-btn" title="Swap Currencies">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
          </svg>
        </button>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="label" for="to-currency">To</label>
          <div class="select-wrapper">
            <select id="to-currency" class="currency-select"></select>
          </div>
        </div>
      </div>

      <div class="result-container" id="result-box">
        <div class="loader"></div>
        <div class="result-content" id="result-content">
          <p class="result-value" id="result-value">-</p>
          <p class="result-rate" id="result-rate">Loading exchange rates...</p>
          <p class="result-source" id="result-source"></p>
        </div>
      </div>

      <button type="button" class="trend-footer-toggle" id="trend-toggle" title="Show/Hide 7-Day Trend">
        <span>Show 7-Day Trend</span>
        <svg class="chevron-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      <div class="trend-container" id="trend-container">
        <div class="trend-loader"></div>
        <div class="trend-chart-wrapper" id="trend-chart-wrapper">
          <svg id="trend-svg" viewBox="0 0 320 130" width="100%" height="130"></svg>
        </div>
      </div>

      <div class="error-msg" id="error-msg"></div>
    </div>
  `;

  // Standard curated list of global currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'LKR', name: 'Sri Lankan Rupee' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'ZAR', name: 'South African Rand' }
  ];

  class CurrencyConverter extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      // Elements
      this.amountInput = this.shadowRoot.getElementById('amount');
      this.fromSelect = this.shadowRoot.getElementById('from-currency');
      this.toSelect = this.shadowRoot.getElementById('to-currency');
      this.swapBtn = this.shadowRoot.getElementById('swap-btn');
      this.resultBox = this.shadowRoot.getElementById('result-box');
      this.resultContent = this.shadowRoot.getElementById('result-content');
      this.resultValue = this.shadowRoot.getElementById('result-value');
      this.resultRate = this.shadowRoot.getElementById('result-rate');
      this.resultSource = this.shadowRoot.getElementById('result-source');
      this.errorMsg = this.shadowRoot.getElementById('error-msg');

      // Trend elements
      this.trendToggle = this.shadowRoot.getElementById('trend-toggle');
      this.trendContainer = this.shadowRoot.getElementById('trend-container');
      this.trendSvg = this.shadowRoot.getElementById('trend-svg');

      this.debounceTimeout = null;
      this.cachedHistoryData = null;
    }

    static get observedAttributes() {
      return ['theme'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'theme' && oldValue !== newValue) {
        const container = this.shadowRoot.querySelector('.widget-container');
        if (container) {
          const themes = ['dark', 'light', 'glass', 'midnight'];
          themes.forEach(t => container.classList.remove(`theme-${t}`));
          if (newValue) {
            container.classList.add(`theme-${newValue.toLowerCase()}`);
          }
        }
      }
    }

    async connectedCallback() {
      const defaultAmount = this.getAttribute('default-amount') || '100';
      const defaultBase = (this.getAttribute('default-base') || 'USD').toUpperCase();
      let defaultTarget = this.getAttribute('default-target') || 'auto';
      const theme = (this.getAttribute('theme') || 'dark').toLowerCase();

      const container = this.shadowRoot.querySelector('.widget-container');
      container.classList.add(`theme-${theme}`);

      this.apiUrl = this.getAttribute('api-url') || 'http://localhost:8000';

      this.amountInput.value = defaultAmount;

      // Geolocation Target Currency Detection
      if (defaultTarget.toLowerCase() === 'auto') {
        defaultTarget = await this.detectLocalCurrency();
      }

      // Populate Select Dropdowns
      this.populateDropdowns(defaultBase, defaultTarget);

      // Event Listeners
      this.amountInput.addEventListener('input', () => this.handleInputDebounce());
      this.fromSelect.addEventListener('change', () => this.handleCurrencyChange());
      this.toSelect.addEventListener('change', () => this.handleCurrencyChange());
      this.swapBtn.addEventListener('click', () => this.swapCurrencies());
      this.trendToggle.addEventListener('click', () => this.toggleTrend());

      // Initial Fetch
      this.fetchConversion();
    }

    async detectLocalCurrency() {
      const cacheKey = 'currency-converter-local-currency';
      const cacheTimeKey = 'currency-converter-local-currency-timestamp';
      
      const cachedCurrency = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      const cacheTTL = 86400000; // 24 hours TTL

      if (cachedCurrency && cachedTime && (Date.now() - parseInt(cachedTime, 10) < cacheTTL)) {
        console.log(`Using cached visitor currency: ${cachedCurrency}`);
        return cachedCurrency;
      }

      try {
        console.log("Fetching visitor country geolocation...");
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error('Geolocation API failed');
        }
        const data = await response.json();
        
        if (data && data.currency) {
          const detected = data.currency.toUpperCase();
          const isSupported = currencies.some(c => c.code === detected);
          
          if (isSupported) {
            localStorage.setItem(cacheKey, detected);
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            console.log(`Auto-detected local currency: ${detected}`);
            return detected;
          }
        }
      } catch (e) {
        console.error('Failed to auto-detect local currency, falling back to LKR:', e);
      }

      return 'LKR'; // Sensible fallback
    }

    populateDropdowns(defaultBase, defaultTarget) {
      this.fromSelect.innerHTML = '';
      this.toSelect.innerHTML = '';

      currencies.forEach(currency => {
        const optionFrom = document.createElement('option');
        optionFrom.value = currency.code;
        optionFrom.textContent = `${currency.code} - ${currency.name}`;
        if (currency.code === defaultBase) optionFrom.selected = true;
        this.fromSelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = currency.code;
        optionTo.textContent = `${currency.code} - ${currency.name}`;
        if (currency.code === defaultTarget) optionTo.selected = true;
        this.toSelect.appendChild(optionTo);
      });
    }

    swapCurrencies() {
      const temp = this.fromSelect.value;
      this.fromSelect.value = this.toSelect.value;
      this.toSelect.value = temp;
      this.handleCurrencyChange();
    }

    handleCurrencyChange() {
      this.cachedHistoryData = null; // Reset cache on currency changes
      this.fetchConversion();
    }

    handleInputDebounce() {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.fetchConversion();
      }, 400);
    }

    async fetchConversion() {
      const amount = parseFloat(this.amountInput.value);
      const base = this.fromSelect.value;
      const target = this.toSelect.value;

      if (isNaN(amount) || amount <= 0) {
        this.showError('Please enter a valid amount greater than 0');
        return;
      }

      this.hideError();
      this.resultBox.classList.add('loading');

      try {
        const url = `${this.apiUrl}/convert?base=${base}&target=${target}&amount=${amount}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Server returned error status ${response.status}`);
        }

        const data = await response.json();
        this.updateUI(data);

        // If the trend chart is expanded, fetch history updates dynamically
        const container = this.shadowRoot.querySelector('.widget-container');
        if (container.classList.contains('expanded-trend')) {
          this.fetchHistory();
        }
      } catch (err) {
        console.error('Currency converter error:', err);
        this.showError(`Error: ${err.message || 'Could not fetch rates from server'}`);
      } finally {
        this.resultBox.classList.remove('loading');
      }
    }

    updateUI(data) {
      const formatter = new Intl.NumberFormat(navigator.language || 'en-US', {
        style: 'currency',
        currency: data.target,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const formattedVal = formatter.format(data.converted_amount);
      const baseAmountStr = `${data.amount} ${data.base}`;

      this.resultValue.textContent = formattedVal;
      this.resultRate.textContent = `1 ${data.base} = ${data.rate.toFixed(4)} ${data.target}`;
      
      const cacheInfo = data.cached ? ' (Cached Proxy Rate)' : ' (Fresh Rate)';
      this.resultSource.textContent = `${baseAmountStr}${cacheInfo}`;
    }

    toggleTrend() {
      const container = this.shadowRoot.querySelector('.widget-container');
      const isExpanded = container.classList.contains('expanded-trend');
      const textSpan = this.trendToggle.querySelector('span');

      if (isExpanded) {
        container.classList.remove('expanded-trend');
        if (textSpan) textSpan.textContent = 'Show 7-Day Trend';
      } else {
        container.classList.add('expanded-trend');
        if (textSpan) textSpan.textContent = 'Hide 7-Day Trend';
        this.fetchHistory();
      }
    }

    async fetchHistory() {
      const base = this.fromSelect.value;
      const target = this.toSelect.value;

      if (this.cachedHistoryData && this.cachedHistoryData.base === base && this.cachedHistoryData.target === target) {
        this.renderTrendChart(this.cachedHistoryData);
        return;
      }

      this.trendContainer.classList.add('loading');
      this.trendSvg.innerHTML = '';

      try {
        const url = `${this.apiUrl}/history?base=${base}&target=${target}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Could not fetch rates history');
        }

        const data = await response.json();
        this.cachedHistoryData = data;
        this.renderTrendChart(data);
      } catch (err) {
        console.error('History fetch error:', err);
        this.trendSvg.innerHTML = `<text x="160" y="65" text-anchor="middle" fill="var(--accent-error)">Could not load trend data</text>`;
      } finally {
        this.trendContainer.classList.remove('loading');
      }
    }

    renderTrendChart(data) {
      const history = data.history;
      if (!history || history.length === 0) return;

      const svg = this.trendSvg;
      svg.innerHTML = '';

      const width = 320;
      const height = 130;
      const padding = { top: 20, bottom: 20, left: 35, right: 35 };

      const rates = history.map(p => p.rate);
      let minRate = Math.min(...rates);
      let maxRate = Math.max(...rates);

      if (minRate === maxRate) {
        minRate = minRate * 0.99;
        maxRate = maxRate * 1.01;
      }

      const diff = maxRate - minRate;
      const yMin = minRate - diff * 0.15;
      const yMax = maxRate + diff * 0.15;

      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      const points = history.map((p, i) => {
        const x = padding.left + (i * (chartW / (history.length - 1)));
        const y = padding.top + chartH - (((p.rate - yMin) / (yMax - yMin)) * chartH);
        return { x, y, date: p.date, rate: p.rate };
      });

      const controlPoint = (current, previous, next, reverse) => {
        const p = previous || current;
        const n = next || current;
        const smoothing = 0.15;
        
        const lengthX = n.x - p.x;
        const lengthY = n.y - p.y;
        
        const angle = Math.atan2(lengthY, lengthX) + (reverse ? Math.PI : 0);
        const length = Math.sqrt(lengthX * lengthX + lengthY * lengthY) * smoothing;
        
        const x = current.x + Math.cos(angle) * length;
        const y = current.y + Math.sin(angle) * length;
        return [x, y];
      };

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <linearGradient id="chart-gradient-${this.fromSelect.value}-${this.toSelect.value}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.25"></stop>
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"></stop>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="var(--primary)" flood-opacity="0.2"></feDropShadow>
        </filter>
      `;
      svg.appendChild(defs);

      // Horizontal reference grid lines
      const gridLevels = 3;
      for (let i = 0; i < gridLevels; i++) {
        const yGrid = padding.top + (i * (chartH / (gridLevels - 1)));
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', yGrid);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', yGrid);
        line.setAttribute('class', 'grid-line');
        svg.appendChild(line);
      }

      // Vertical reference anchor lines
      points.forEach((pt) => {
        const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        anchor.setAttribute('x1', pt.x);
        anchor.setAttribute('y1', padding.top);
        anchor.setAttribute('x2', pt.x);
        anchor.setAttribute('y2', padding.top + chartH);
        anchor.setAttribute('class', 'anchor-line');
        svg.appendChild(anchor);
      });

      // Generate smooth bezier curve coordinates
      let dLine = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const cp1 = controlPoint(points[i], points[i-1], points[i+1], false);
        const cp2 = controlPoint(points[i+1], points[i], points[i+2], true);
        dLine += ` C ${cp1[0]} ${cp1[1]}, ${cp2[0]} ${cp2[1]}, ${points[i+1].x} ${points[i+1].y}`;
      }
      
      const dArea = `${dLine} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      areaPath.setAttribute('d', dArea);
      areaPath.setAttribute('fill', `url(#chart-gradient-${this.fromSelect.value}-${this.toSelect.value})`);
      svg.appendChild(areaPath);

      const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      linePath.setAttribute('d', dLine);
      linePath.setAttribute('fill', 'none');
      linePath.setAttribute('stroke', 'var(--primary)');
      linePath.setAttribute('stroke-width', '2.5');
      linePath.setAttribute('stroke-linecap', 'round');
      linePath.setAttribute('stroke-linejoin', 'round');
      linePath.setAttribute('filter', 'url(#glow)');
      svg.appendChild(linePath);

      points.forEach((pt, idx) => {
        if (idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2)) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', pt.x);
          circle.setAttribute('cy', pt.y);
          circle.setAttribute('r', '3.5');
          circle.setAttribute('fill', 'var(--primary)');
          circle.setAttribute('stroke', 'var(--bg-glass)');
          circle.setAttribute('stroke-width', '1.5');
          
          const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
          title.textContent = `${pt.date}: ${pt.rate.toFixed(4)}`;
          circle.appendChild(title);
          
          svg.appendChild(circle);
        }
      });

      const maxPt = points.reduce((prev, curr) => (prev.rate > curr.rate) ? prev : curr);
      const minPt = points.reduce((prev, curr) => (prev.rate < curr.rate) ? prev : curr);

      const maxText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      maxText.setAttribute('x', maxPt.x);
      maxText.setAttribute('y', maxPt.y - 6);
      maxText.setAttribute('text-anchor', 'middle');
      maxText.setAttribute('class', 'rate-value-label');
      maxText.textContent = maxPt.rate.toFixed(4);
      svg.appendChild(maxText);

      const minText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      minText.setAttribute('x', minPt.x);
      minText.setAttribute('y', minPt.y + 10);
      minText.setAttribute('text-anchor', 'middle');
      minText.setAttribute('class', 'rate-value-label');
      minText.textContent = minPt.rate.toFixed(4);
      svg.appendChild(minText);

      const startDateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      startDateText.setAttribute('x', padding.left);
      startDateText.setAttribute('y', height - 4);
      startDateText.setAttribute('text-anchor', 'start');
      startDateText.setAttribute('class', 'axis-label');
      startDateText.textContent = this.formatChartDate(points[0].date);
      svg.appendChild(startDateText);

      const endDateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      endDateText.setAttribute('x', width - padding.right);
      endDateText.setAttribute('y', height - 4);
      endDateText.setAttribute('text-anchor', 'end');
      endDateText.setAttribute('class', 'axis-label');
      endDateText.textContent = this.formatChartDate(points[points.length - 1].date);
      svg.appendChild(endDateText);
      
      const sourceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sourceText.setAttribute('x', width / 2);
      sourceText.setAttribute('y', height - 4);
      sourceText.setAttribute('text-anchor', 'middle');
      sourceText.setAttribute('class', 'axis-label');
      sourceText.textContent = data.is_mock ? '7-Day Trend (Estimated)' : '7-Day Trend (Live)';
      svg.appendChild(sourceText);
    }

    formatChartDate(dateStr) {
      try {
        const [_, month, day] = dateStr.split('-');
        return `${month}/${day}`;
      } catch (e) {
        return dateStr;
      }
    }

    showError(message) {
      this.errorMsg.textContent = message;
      this.errorMsg.style.display = 'block';
      this.resultValue.textContent = '-';
      this.resultRate.textContent = 'Conversion failed';
      this.resultSource.textContent = '';
      
      const container = this.shadowRoot.querySelector('.widget-container');
      container.classList.remove('expanded-trend');
      
      const textSpan = this.trendToggle.querySelector('span');
      if (textSpan) textSpan.textContent = 'Show 7-Day Trend';
    }

    hideError() {
      this.errorMsg.style.display = 'none';
    }
  }

  customElements.define('currency-converter', CurrencyConverter);
})();

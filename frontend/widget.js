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

      /* Option element styling inside dark dropdown */
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
        top: calc(50% - 12px);
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

      this.debounceTimeout = null;
    }

    static get observedAttributes() {
      return ['theme'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'theme' && oldValue !== newValue) {
        const container = this.shadowRoot.querySelector('.widget-container');
        if (container) {
          // Remove old theme classes
          const themes = ['dark', 'light', 'glass', 'midnight'];
          themes.forEach(t => container.classList.remove(`theme-${t}`));
          
          // Add new theme class
          if (newValue) {
            container.classList.add(`theme-${newValue.toLowerCase()}`);
          }
        }
      }
    }

    connectedCallback() {
      // Load configurations from attributes or defaults
      const defaultAmount = this.getAttribute('default-amount') || '100';
      const defaultBase = (this.getAttribute('default-base') || 'USD').toUpperCase();
      const defaultTarget = (this.getAttribute('default-target') || 'LKR').toUpperCase();
      const theme = (this.getAttribute('theme') || 'dark').toLowerCase();

      // Initialize theme class
      const container = this.shadowRoot.querySelector('.widget-container');
      container.classList.add(`theme-${theme}`);

      this.apiUrl = this.getAttribute('api-url') || 'http://localhost:8000';

      this.amountInput.value = defaultAmount;

      // Populate Select Dropdowns
      this.populateDropdowns(defaultBase, defaultTarget);

      // Event Listeners
      this.amountInput.addEventListener('input', () => this.handleInputDebounce());
      this.fromSelect.addEventListener('change', () => this.fetchConversion());
      this.toSelect.addEventListener('change', () => this.fetchConversion());
      this.swapBtn.addEventListener('click', () => this.swapCurrencies());

      // Initial Fetch
      this.fetchConversion();
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
      this.fetchConversion();
    }

    handleInputDebounce() {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.fetchConversion();
      }, 400); // 400ms debounce
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
      } catch (err) {
        console.error('Currency converter error:', err);
        this.showError(`Error: ${err.message || 'Could not fetch rates from server'}`);
      } finally {
        this.resultBox.classList.remove('loading');
      }
    }

    updateUI(data) {
      // Format number display based on locale
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

    showError(message) {
      this.errorMsg.textContent = message;
      this.errorMsg.style.display = 'block';
      this.resultValue.textContent = '-';
      this.resultRate.textContent = 'Conversion failed';
      this.resultSource.textContent = '';
    }

    hideError() {
      this.errorMsg.style.display = 'none';
    }
  }

  // Register Custom Element
  customElements.define('currency-converter', CurrencyConverter);
})();

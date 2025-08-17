// SIDEBAR TOKEN TRACKER
console.log('🚀 SIDEBAR TRACKER LOADING... URL:', window.location.href);
console.log('🚀 SIDEBAR: Script loaded successfully at', new Date().toLocaleTimeString());

class SidebarTokenTracker {
  constructor() {
    this.totalTokens = 0;
    this.queries = 0;
    this.carbonGrams = 0;
    this.energyWh = 0;
    this.waterMl = 0;
    
    // Streaming response detection
    this.isResponseStreaming = false;
    this.streamingTimeout = null;
    this.lastStreamingUpdate = 0;
    
    // Sidebar elements
    this.sidebar = null;
    
    console.log('🎨 Creating sidebar and starting tracking...');
    this.initializeSidebar();
    this.startTracking();
    this.setupStorageListener();
  }
  
  async initializeSidebar() {
    // Check if sidebar was previously closed
    try {
      const result = await chrome.storage.local.get(['sidebarClosed']);
      if (result.sidebarClosed) {
        console.log('🚫 SIDEBAR: Previously closed, not showing until clicked');
        return; // Don't create sidebar if it was closed
      }
    } catch (error) {
      console.log('⚠️ Could not check sidebar state, showing sidebar');
    }
    
    this.createSidebar();
  }
  
  createSidebar() {
    // Create the sidebar container
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'llm-impact-sidebar';
    
    // Create sidebar HTML
    this.sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-title">
          <span class="sidebar-icon">🌱</span>
          <span class="sidebar-text">AI Impact Tracker</span>
        </div>
        <div class="sidebar-controls">
          <button class="sidebar-reset" title="Reset counts">🔄</button>
          <button class="sidebar-close" title="Close sidebar">✕</button>
        </div>
      </div>
      <div class="sidebar-content">
        <div class="impact-level">
          <div class="level-indicator" id="sidebar-level-indicator"></div>
          <span class="level-text" id="sidebar-level-text">Low Impact</span>
        </div>
        <div class="metrics-container">
          <div class="metric-row">
            <span class="metric-icon">🔢</span>
            <span class="metric-value" id="sidebar-queries">0</span>
            <span class="metric-label">queries</span>
          </div>
          <div class="metric-row">
            <span class="metric-icon">⚡</span>
            <span class="metric-value" id="sidebar-energy">0</span>
            <span class="metric-label">Wh</span>
          </div>
          <div class="metric-row">
            <span class="metric-icon">🌍</span>
            <span class="metric-value" id="sidebar-carbon">0</span>
            <span class="metric-label">g CO₂</span>
          </div>
          <div class="metric-row">
            <span class="metric-icon">💧</span>
            <span class="metric-value" id="sidebar-water">0</span>
            <span class="metric-label">ml</span>
          </div>
        </div>
        <div class="comparison-section">
          <div class="comparison-row">
            <span class="comparison-icon">🚗</span>
            <span class="comparison-text">
              <span id="sidebar-car-miles">0</span> miles driven
            </span>
          </div>
          <div class="comparison-row">
            <span class="comparison-icon">🌳</span>
            <span class="comparison-text">
              <span id="sidebar-trees">0</span> trees needed
            </span>
          </div>
          <div class="comparison-row">
            <span class="comparison-icon">📱</span>
            <span class="comparison-text">
              <span id="sidebar-phone">0</span> phone charges
            </span>
          </div>
        </div>
        <div class="sidebar-footer">
          <span id="sidebar-last-updated">Never</span>
        </div>
      </div>
    `;
    
    // Add CSS styles for the sidebar
    const style = document.createElement('style');
    style.textContent = `
      #llm-impact-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: 320px;
        height: 100vh;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-left: 2px solid #e2e8f0;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1a202c;
        z-index: 2147483647;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        overflow-y: auto;
        resize: horizontal;
        min-width: 280px;
        max-width: 500px;
      }
      

      
      .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e2e8f0;
        background: white;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      
      .sidebar-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 16px;
        color: #2d5a27;
      }
      
      .sidebar-icon {
        font-size: 20px;
      }
      
      .sidebar-text {
        transition: opacity 0.3s ease;
      }
      
      .sidebar-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      .sidebar-close, .sidebar-reset {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .sidebar-close:hover, .sidebar-reset:hover {
        background: #f1f5f9;
      }
      
      .sidebar-close:hover {
        background: #fee2e2;
        color: #dc2626;
      }
      
      .sidebar-content {
        padding: 16px;
        transition: opacity 0.3s ease;
      }
      
      .impact-level {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .level-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #4caf50;
        box-shadow: 0 0 8px rgba(76, 175, 80, 0.4);
        transition: all 0.3s ease;
      }
      
      .level-indicator.medium {
        background-color: #ff9800;
        box-shadow: 0 0 8px rgba(255, 152, 0, 0.4);
      }
      
      .level-indicator.high {
        background-color: #f44336;
        box-shadow: 0 0 8px rgba(244, 67, 54, 0.4);
      }
      
      .level-text {
        font-weight: 600;
        font-size: 14px;
      }
      
      .metrics-container {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .metric-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .metric-row:last-child {
        margin-bottom: 0;
      }
      
      .metric-icon {
        font-size: 18px;
        width: 24px;
      }
      
      .metric-value {
        font-weight: 700;
        font-size: 16px;
        color: #2563eb;
        min-width: 40px;
      }
      
      .metric-label {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
      }
      
      .comparison-section {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .comparison-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        font-size: 13px;
      }
      
      .comparison-row:last-child {
        margin-bottom: 0;
      }
      
      .comparison-icon {
        font-size: 16px;
        width: 20px;
      }
      
      .comparison-text {
        color: #64748b;
      }
      
      .sidebar-footer {
        background: white;
        border-radius: 8px;
        padding: 12px 16px;
        text-align: center;
        font-size: 11px;
        color: #64748b;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      /* Animations */
      .metric-value.updated {
        animation: valueUpdate 0.6s ease;
      }
      
      @keyframes valueUpdate {
        0% { background-color: #fef3cd; }
        100% { background-color: transparent; }
      }
      
      @keyframes flash {
        0%, 100% { box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1); }
        50% { box-shadow: -4px 0 30px rgba(59, 130, 246, 0.5); }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.sidebar);
    
    // Setup event listeners
    this.setupSidebarEventListeners();
    
    console.log('✅ Sidebar created and styled');
  }
  
  setupSidebarEventListeners() {
    const closeBtn = this.sidebar.querySelector('.sidebar-close');
    const resetBtn = this.sidebar.querySelector('.sidebar-reset');
    
    // Close button - completely hides the sidebar
    closeBtn.addEventListener('click', () => {
      console.log('🚫 SIDEBAR: Closing sidebar');
      this.sidebar.style.display = 'none';
      
      // Store closed state so it doesn't reappear on refresh
      try {
        chrome.storage.local.set({ sidebarClosed: true });
      } catch (error) {
        console.log('⚠️ Could not save sidebar state');
      }
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
      this.resetCounts();
    });
  }
  
  setupStorageListener() {
    // Listen for changes in storage to update sidebar in real-time
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.dailyData) {
          console.log('📨 SIDEBAR: Storage changed, updating display...');
          this.syncWithBackground();
        }
        
        // Listen for show sidebar command
        if (changes.showSidebar && changes.showSidebar.newValue) {
          console.log('👀 SIDEBAR: Show command received');
          this.showSidebar();
          // Clear the command
          chrome.storage.local.remove(['showSidebar']);
        }
      }
    });
  }
  
  showSidebar() {
    if (!this.sidebar) {
      console.log('📱 SIDEBAR: Creating sidebar on demand');
      this.createSidebar();
    } else {
      console.log('📱 SIDEBAR: Showing existing sidebar');
      this.sidebar.style.display = 'block';
    }
    
    // Clear the closed state
    try {
      chrome.storage.local.remove(['sidebarClosed']);
    } catch (error) {
      console.log('⚠️ Could not clear sidebar state');
    }
    
    // Flash to draw attention
    if (this.sidebar) {
      this.sidebar.style.animation = 'none';
      this.sidebar.offsetHeight; // Trigger reflow
      this.sidebar.style.animation = 'flash 1s ease-in-out';
    }
  }
  
  async syncWithBackground() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getDailyData' });
      if (response) {
        console.log('🔄 SIDEBAR: Syncing with background data:', response);
        
        this.queries = response.queries || 0;
        this.totalTokens = response.totalTokens || 0;
        this.energyWh = response.energyWh || 0;
        this.carbonGrams = response.carbonGrams || 0;
        this.waterMl = response.waterMl || 0;
        
        this.updateSidebar();
      }
    } catch (error) {
      console.log('⚠️ SIDEBAR: Could not sync with background (normal in some cases)');
    }
  }
  
  updateStats(tokens, source, isNewQuery = false) {
    this.totalTokens += tokens;
    
    if (isNewQuery || source === 'new_response') {
      this.queries++;
    }
    
    const impact = this.calculateImpact(tokens);
    this.energyWh += impact.energyWh;
    this.carbonGrams += impact.carbonGrams;
    this.waterMl += impact.waterMl;
    
    this.updateSidebar();
    
    console.log(`🎯 SIDEBAR: Updated - ${tokens} tokens from ${source} (query: ${isNewQuery})`);
    console.log(`📊 SIDEBAR: Totals - ${this.queries} queries, ${this.totalTokens} tokens, ${this.carbonGrams.toFixed(1)}g CO₂`);
    
    this.sendToBackground({
      type: 'tokens_tracked',
      provider: 'ChatGPT',
      responseTokens: tokens,
      totalTokens: this.totalTokens,
      sessionQueries: this.queries,
      source: source,
      isNewQuery: isNewQuery
    });
  }
  
  updateSidebar() {
    // Update metrics
    this.updateElement('sidebar-queries', this.queries);
    this.updateElement('sidebar-energy', this.formatNumber(this.energyWh, 2));
    this.updateElement('sidebar-carbon', this.formatNumber(this.carbonGrams, 1));
    this.updateElement('sidebar-water', this.formatNumber(this.waterMl, 1));
    
    // Update impact level
    this.updateImpactLevel();
    
    // Update comparisons
    this.updateComparisons();
    
    // Update footer
    const lastUpdated = document.getElementById('sidebar-last-updated');
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.textContent = `Updated ${now.toLocaleTimeString()}`;
    }
  }
  
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      const oldValue = element.textContent;
      element.textContent = value;
      
      if (oldValue !== value.toString()) {
        element.classList.add('updated');
        setTimeout(() => {
          element.classList.remove('updated');
        }, 600);
      }
    }
  }
  
  updateImpactLevel() {
    const indicator = document.getElementById('sidebar-level-indicator');
    const text = document.getElementById('sidebar-level-text');
    
    if (!indicator || !text) return;
    
    let level = 'low';
    let levelText = 'Low Impact';
    
    if (this.carbonGrams > 200) {
      level = 'high';
      levelText = 'High Impact';
    } else if (this.carbonGrams > 100) {
      level = 'medium';
      levelText = 'Medium Impact';
    }
    
    indicator.className = `level-indicator ${level}`;
    text.textContent = levelText;
  }
  
  updateComparisons() {
    // Simple comparison calculations
    const carMiles = (this.carbonGrams / 404).toFixed(2); // grams CO2 per mile
    const treesNeeded = (this.carbonGrams / 21000).toFixed(3); // grams CO2 absorbed per tree per year
    const phoneCharges = (this.energyWh / 0.0185).toFixed(1); // Wh per phone charge
    
    this.updateElement('sidebar-car-miles', carMiles);
    this.updateElement('sidebar-trees', treesNeeded);
    this.updateElement('sidebar-phone', phoneCharges);
  }
  
  resetCounts() {
    this.totalTokens = 0;
    this.queries = 0;
    this.carbonGrams = 0;
    this.energyWh = 0;
    this.waterMl = 0;
    
    this.isResponseStreaming = false;
    if (this.streamingTimeout) {
      clearTimeout(this.streamingTimeout);
      this.streamingTimeout = null;
    }
    
    this.updateSidebar();
    
    console.log('🔄 SIDEBAR: Stats reset to zero');
    
    this.sendToBackground({
      type: 'stats_reset',
      provider: 'ChatGPT',
      timestamp: Date.now()
    });
  }
  
  calculateImpact(tokens) {
    const ENERGY_PER_TOKEN_WH = 0.001;
    const CARBON_PER_TOKEN_GRAMS = 0.5;
    const WATER_PER_TOKEN_ML = 0.1;
    
    return {
      energyWh: tokens * ENERGY_PER_TOKEN_WH,
      carbonGrams: tokens * CARBON_PER_TOKEN_GRAMS,
      waterMl: tokens * WATER_PER_TOKEN_ML
    };
  }
  
  formatNumber(num, decimals = 1) {
    if (num === 0) return '0';
    if (num < 1) return num.toFixed(decimals + 1);
    if (num < 1000) return num.toFixed(decimals);
    if (num < 1000000) return (num / 1000).toFixed(decimals) + 'K';
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  
  estimateTokens(text) {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words * 1.3);
  }
  
  startTracking() {
    // Initial sync with background
    setTimeout(() => {
      this.syncWithBackground();
    }, 1000);
    
    // Track existing content but don't count as queries
    setTimeout(() => {
      const content = document.body.textContent || '';
      const tokens = this.estimateTokens(content);
      console.log(`🔍 SIDEBAR: Found ${tokens} tokens on page load (not counting as query)`);
      this.updateStats(tokens, 'page_load', false);
    }, 2000);
    
    // Monitor for new content with streaming detection
    let lastLength = 0;
    
    setTimeout(() => {
      lastLength = (document.body.textContent || '').length;
      console.log(`📏 SIDEBAR: Initial content length set to ${lastLength}`);
    }, 3000);
    
    setInterval(() => {
      const currentContent = document.body.textContent || '';
      const currentLength = currentContent.length;
      
      console.log(`📊 SIDEBAR: Content check - ${lastLength} -> ${currentLength} chars`);
      
      if (currentLength > lastLength + 50) {
        this.handleContentIncrease(currentLength, lastLength, currentContent);
        lastLength = currentLength;
      }
    }, 2000);
    
    console.log('🔄 SIDEBAR: Tracking started');
  }
  
  handleContentIncrease(currentLength, lastLength, currentContent) {
    const contentDiff = currentLength - lastLength;
    const newText = currentContent.substring(lastLength);
    const newTokens = this.estimateTokens(newText);
    
    console.log(`📝 SIDEBAR: Content increased by ${contentDiff} chars, ${newTokens} tokens`);
    
    if (contentDiff > 100 && !this.isResponseStreaming) {
      console.log(`🎬 SIDEBAR: New response started`);
      this.isResponseStreaming = true;
      this.lastStreamingUpdate = Date.now();
      
      this.updateStats(newTokens, 'new_response', true);
      this.setStreamingTimeout();
      
    } else if (this.isResponseStreaming) {
      console.log(`📺 SIDEBAR: Streaming continues`);
      this.lastStreamingUpdate = Date.now();
      this.updateStats(newTokens, 'streaming_update', false);
      this.setStreamingTimeout();
      
    } else {
      console.log(`📝 SIDEBAR: Minor update`);
      this.updateStats(newTokens, 'content_update', false);
    }
  }
  
  setStreamingTimeout() {
    if (this.streamingTimeout) {
      clearTimeout(this.streamingTimeout);
    }
    
    this.streamingTimeout = setTimeout(() => {
      console.log(`⏹️ SIDEBAR: Streaming ended`);
      this.isResponseStreaming = false;
      this.streamingTimeout = null;
    }, 5000);
  }
  
  sendToBackground(data) {
    try {
      chrome.storage.local.set({
        contentScriptData: {
          ...data,
          timestamp: Date.now(),
          url: window.location.href
        }
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('❌ SIDEBAR: Error sending data:', chrome.runtime.lastError);
        } else {
          console.log('✅ SIDEBAR: Data sent to background');
        }
      });
    } catch (error) {
      console.error('❌ SIDEBAR: Error sending data:', error);
    }
  }
}

// Initialize the sidebar tracker
console.log('🚀 SIDEBAR: Starting sidebar token tracker...');
new SidebarTokenTracker();

console.log('✅ SIDEBAR: Sidebar tracker fully loaded');

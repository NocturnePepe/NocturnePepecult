// PWA.js - Progressive Web App Manager for NocturneSwap
// Handles PWA installation, offline support, push notifications, and performance monitoring

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.installButton = null;
    this.notificationPermission = 'default';
    this.performanceMetrics = {
      slowOperations: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.init();
  }

  init() {
    this.checkInstallStatus();
    this.setupEventListeners();
    this.setupNotifications();
    this.createInstallUI();
    this.monitorPerformance();
    this.setupOfflineSupport();
  }

  // Installation Management
  checkInstallStatus() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('🌙 NocturneSwap PWA is installed');
    }

    // Check if running in browser tab
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('🌙 NocturneSwap PWA is running in standalone mode');
    }
  }

  setupEventListeners() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('🌙 PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('🌙 NocturneSwap PWA installed successfully');
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showInstallSuccess();
    });

    // Monitor network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNetworkStatus('🟢 Back online - syncing data...', 'success');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNetworkStatus('🔴 Offline mode - limited functionality', 'warning');
    });

    // Service Worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          this.showUpdatePrompt();
        }
      });
    }
  }

  // Install UI Management
  createInstallUI() {
    if (this.isInstalled) return;

    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.className = 'pwa-install-banner';
    installBanner.innerHTML = `
      <div class="install-content">
        <div class="install-icon">🌙</div>
        <div class="install-text">
          <h3>Install NocturneSwap</h3>
          <p>Get the full app experience with offline support</p>
        </div>
        <div class="install-actions">
          <button class="install-btn" id="pwa-install-btn">Install</button>
          <button class="dismiss-btn" id="pwa-dismiss-btn">✕</button>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(installBanner);

    // Setup button handlers
    this.installButton = document.getElementById('pwa-install-btn');
    this.installButton.addEventListener('click', () => this.installApp());
    
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      this.hideInstallPrompt();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (!this.isInstalled) {
        this.hideInstallPrompt();
      }
    }, 10000);
  }

  showInstallPrompt() {
    const banner = document.querySelector('.pwa-install-banner');
    if (banner) {
      banner.classList.add('show');
    }
  }

  hideInstallPrompt() {
    const banner = document.querySelector('.pwa-install-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('🌙 Install prompt not available');
      return;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('🌙 User accepted the install prompt');
      } else {
        console.log('🌙 User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('🌙 Install error:', error);
    }
  }

  showInstallSuccess() {
    this.showNotification('🎉 NocturneSwap installed successfully!', 'success');
  }

  // Push Notifications
  setupNotifications() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      
      if (this.notificationPermission === 'default') {
        this.requestNotificationPermission();
      }
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        console.log('🌙 Notification permission granted');
        this.setupPushSubscription();
      }
    } catch (error) {
      console.error('🌙 Notification permission error:', error);
    }
  }

  async setupPushSubscription() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
        });
        
        console.log('🌙 Push subscription successful');
        // Send subscription to server
        this.sendSubscriptionToServer(subscription);
      } catch (error) {
        console.error('🌙 Push subscription error:', error);
      }
    }
  }

  sendSubscriptionToServer(subscription) {
    // In production, send to your push service
    console.log('🌙 Push subscription:', subscription);
    localStorage.setItem('nocturne_push_subscription', JSON.stringify(subscription));
  }

  // Local Notifications
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `pwa-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">✕</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto-remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });
  }

  // Price Alerts
  sendPriceAlert(token, price, change) {
    if (this.notificationPermission === 'granted') {
      new Notification(`🌙 ${token} Price Alert`, {
        body: `Price: $${price} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'price-alert',
        requireInteraction: true,
        actions: [
          { action: 'trade', title: 'Trade Now' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }
  }

  // Transaction Notifications
  sendTransactionNotification(type, status, hash) {
    const messages = {
      swap: {
        pending: '🔄 Swap transaction pending...',
        success: '✅ Swap completed successfully!',
        failed: '❌ Swap transaction failed'
      },
      liquidity: {
        pending: '🔄 Liquidity transaction pending...',
        success: '✅ Liquidity added successfully!',
        failed: '❌ Liquidity transaction failed'
      }
    };

    const message = messages[type]?.[status] || '📱 Transaction update';
    this.showNotification(message, status === 'success' ? 'success' : status === 'failed' ? 'error' : 'info');
  }

  // Offline Support
  setupOfflineSupport() {
    // Cache essential data
    this.cacheEssentialData();
    
    // Setup offline UI
    this.createOfflineIndicator();
  }

  cacheEssentialData() {
    const essentialData = {
      tokens: JSON.parse(localStorage.getItem('nocturne_tokens') || '[]'),
      pools: JSON.parse(localStorage.getItem('nocturne_pools') || '[]'),
      userSettings: JSON.parse(localStorage.getItem('nocturne_settings') || '{}'),
      achievements: JSON.parse(localStorage.getItem('nocturne_user_stats') || '{}')
    };

    localStorage.setItem('nocturne_offline_cache', JSON.stringify({
      ...essentialData,
      timestamp: Date.now()
    }));

    this.performanceMetrics.cacheHits++;
  }

  getOfflineData(key) {
    try {
      const cache = JSON.parse(localStorage.getItem('nocturne_offline_cache') || '{}');
      return cache[key] || null;
    } catch (error) {
      this.performanceMetrics.cacheMisses++;
      return null;
    }
  }

  syncOfflineData() {
    // When back online, sync any pending transactions or data
    const pendingActions = JSON.parse(localStorage.getItem('nocturne_pending_actions') || '[]');
    
    if (pendingActions.length > 0) {
      this.showNotification(`🔄 Syncing ${pendingActions.length} pending actions...`, 'info');
      
      // Process pending actions
      pendingActions.forEach(action => this.processPendingAction(action));
      
      // Clear pending actions
      localStorage.removeItem('nocturne_pending_actions');
    }
  }

  processPendingAction(action) {
    // Process actions that were queued while offline
    console.log('🌙 Processing pending action:', action);
    
    switch (action.type) {
      case 'price_alert_subscription':
        // Re-subscribe to price alerts
        break;
      case 'settings_update':
        // Sync settings changes
        break;
      case 'achievement_unlock':
        // Sync achievement progress
        break;
    }
  }

  createOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'offline-indicator';
    indicator.innerHTML = `
      <div class="offline-content">
        <span class="offline-icon">📡</span>
        <span class="offline-text">Offline Mode</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
    
    if (!this.isOnline) {
      indicator.classList.add('show');
    }
  }

  showNetworkStatus(message, type) {
    this.showNotification(message, type, 3000);
    
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
      if (this.isOnline) {
        indicator.classList.remove('show');
      } else {
        indicator.classList.add('show');
      }
    }
  }

  // Performance Monitoring
  monitorPerformance() {
    // Monitor slow operations
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        if (duration > 3000) { // 3 seconds threshold
          this.performanceMetrics.slowOperations++;
          this.showNotification('⚠️ Slow network detected - optimizing...', 'warning', 3000);
        }
        
        return response;
      } catch (error) {
        this.performanceMetrics.cacheMisses++;
        throw error;
      }
    };

    // Report performance metrics periodically
    setInterval(() => {
      if (this.performanceMetrics.slowOperations > 5) {
        this.showNotification('💡 Consider switching to a faster network', 'info', 4000);
        this.performanceMetrics.slowOperations = 0; // Reset counter
      }
    }, 60000); // Check every minute
  }

  // App Sharing
  async shareApp() {
    const shareData = {
      title: 'NocturneSwap - Mystical DeFi Trading',
      text: 'Join the cult of decentralized trading with NocturneSwap!',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('🌙 App shared successfully');
      } catch (error) {
        console.log('🌙 Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.url);
      this.showNotification('🔗 App link copied to clipboard!', 'success');
    }
  }

  // Update Management
  showUpdatePrompt() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <div class="update-icon">🔄</div>
        <div class="update-text">
          <h3>Update Available</h3>
          <p>New features and improvements are ready</p>
        </div>
        <div class="update-actions">
          <button class="update-btn" id="pwa-update-btn">Update</button>
          <button class="dismiss-btn" id="pwa-update-dismiss">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(updateBanner);
    setTimeout(() => updateBanner.classList.add('show'), 100);

    document.getElementById('pwa-update-btn').addEventListener('click', () => {
      this.updateApp();
    });

    document.getElementById('pwa-update-dismiss').addEventListener('click', () => {
      updateBanner.classList.remove('show');
      setTimeout(() => updateBanner.remove(), 300);
    });
  }

  async updateApp() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }

  // Utility Functions
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Public API
  getMetrics() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      notificationPermission: this.notificationPermission,
      performance: this.performanceMetrics
    };
  }

  sendNotification(title, options = {}) {
    if (this.notificationPermission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      });
    }
  }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Export for global access
window.nocturneSwapPWA = pwaManager;

export default pwaManager;

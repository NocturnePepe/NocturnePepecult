// PWA.js - Progressive Web App utilities and features
import { cultSounds } from './SoundEffects.js';

class PWAManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isInstalled = this.checkIfInstalled();
    this.installPrompt = null;
    this.notificationPermission = Notification.permission;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Network status monitoring
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNetworkStatus('🌐 Back online! Syncing data...', 'success');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNetworkStatus('📡 Offline mode - Limited functionality', 'warning');
    });

    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallBanner();
    });

    // App installed detection
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showNetworkStatus('🎉 NocturneSwap installed successfully!', 'success');
      cultSounds.playRitualCompleteSound();
    });
  }

  checkIfInstalled() {
    // Check if app is running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }

  async requestInstall() {
    if (!this.installPrompt) {
      this.showNetworkStatus('⚠️ Install not available on this device', 'warning');
      return false;
    }

    try {
      await cultSounds.playHoverSound();
      const result = await this.installPrompt.prompt();
      const outcome = await result.userChoice;
      
      if (outcome === 'accepted') {
        this.showNetworkStatus('📱 Installing NocturneSwap...', 'success');
      } else {
        this.showNetworkStatus('❌ Installation cancelled', 'info');
      }
      
      this.installPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install error:', error);
      this.showNetworkStatus('❌ Installation failed', 'error');
      return false;
    }
  }

  async requestNotificationPermission() {
    if (this.notificationPermission === 'granted') {
      return true;
    }

    if (this.notificationPermission === 'denied') {
      this.showNetworkStatus('🔕 Notifications blocked - Enable in browser settings', 'warning');
      return false;
    }

    try {
      await cultSounds.playHoverSound();
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        this.showNetworkStatus('🔔 Notifications enabled!', 'success');
        this.sendTestNotification();
        return true;
      } else {
        this.showNetworkStatus('🔕 Notifications denied', 'warning');
        return false;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  sendTestNotification() {
    if (this.notificationPermission !== 'granted') return;

    new Notification('🌙 NocturneSwap', {
      body: 'Notifications are now enabled! You\'ll receive price alerts and transaction updates.',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjUwIiB5PSI3MCIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlkNGVkZCI+8J+MmTwvdGV4dD48L3N2Zz4=',
      tag: 'test-notification',
      requireInteraction: false,
      silent: false
    });
  }

  sendPriceAlert(token, price, change) {
    if (this.notificationPermission !== 'granted') return;

    const isPositive = change >= 0;
    const emoji = isPositive ? '📈' : '📉';
    const direction = isPositive ? 'up' : 'down';
    
    new Notification(`${emoji} ${token} Price Alert`, {
      body: `${token} is ${direction} ${Math.abs(change).toFixed(2)}% to $${price}`,
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjUwIiB5PSI3MCIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlkNGVkZCI+8J+MmTwvdGV4dD48L3N2Zz4=',
      tag: `price-alert-${token}`,
      requireInteraction: true,
      actions: [
        { action: 'view', title: '👁️ View Chart' },
        { action: 'trade', title: '⚡ Trade Now' }
      ]
    });
  }

  sendTransactionNotification(type, status, hash, amount, token) {
    if (this.notificationPermission !== 'granted') return;

    const emoji = status === 'success' ? '✅' : status === 'pending' ? '⏳' : '❌';
    const statusText = status === 'success' ? 'completed' : status === 'pending' ? 'pending' : 'failed';
    
    new Notification(`${emoji} Transaction ${statusText}`, {
      body: `${type} ${amount} ${token} - ${hash.slice(0, 8)}...${hash.slice(-8)}`,
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjUwIiB5PSI3MCIgZm9udC1zaXplPSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlkNGVkZCI+8J+MmTwvdGV4dD48L3N2Zz4=',
      tag: `transaction-${hash}`,
      requireInteraction: status !== 'pending',
      actions: status === 'success' ? [
        { action: 'view', title: '🔍 View on Explorer' }
      ] : []
    });
  }

  showInstallBanner() {
    if (this.isInstalled) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="install-content">
        <div class="install-icon">📱</div>
        <div class="install-text">
          <h4>Install NocturneSwap</h4>
          <p>Get the full app experience</p>
        </div>
        <div class="install-actions">
          <button id="pwa-install-btn" class="install-btn">Install</button>
          <button id="pwa-dismiss-btn" class="dismiss-btn">✕</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Event listeners
    document.getElementById('pwa-install-btn').addEventListener('click', () => {
      this.requestInstall();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      this.hideInstallBanner();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideInstallBanner();
    }, 10000);
  }

  hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  showNetworkStatus(message, type = 'info') {
    // Remove existing status
    const existing = document.querySelector('.network-status');
    if (existing) existing.remove();

    const status = document.createElement('div');
    status.className = `network-status ${type}`;
    status.innerHTML = `
      <div class="status-content">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;

    document.body.appendChild(status);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (status.parentElement) {
        status.remove();
      }
    }, 5000);
  }

  // Offline data management
  saveOfflineData(key, data) {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  getOfflineData(key, maxAge = 60000 * 5) { // 5 minutes default
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (!stored) return null;

      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  async syncOfflineData() {
    if (!this.isOnline) return;

    try {
      // Sync any pending transactions, alerts, etc.
      const pendingData = this.getOfflineData('pending_sync');
      if (pendingData) {
        console.log('🔄 Syncing offline data...');
        // Process pending data here
        localStorage.removeItem('offline_pending_sync');
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Performance monitoring
  measurePerformance(label, fn) {
    if (!this.isOnline) return fn();

    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`⚡ ${label}: ${(end - start).toFixed(2)}ms`);
    
    // Report slow operations
    if (end - start > 1000) {
      this.showNetworkStatus(`⚠️ Slow operation detected: ${label}`, 'warning');
    }
    
    return result;
  }

  // Feature detection
  getCapabilities() {
    return {
      offline: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      install: this.installPrompt !== null,
      share: 'share' in navigator,
      vibrate: 'vibrate' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement,
      orientation: 'orientation' in screen,
      battery: 'getBattery' in navigator,
      connection: 'connection' in navigator
    };
  }

  // Share functionality
  async shareApp() {
    if (!('share' in navigator)) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.showNetworkStatus('🔗 Link copied to clipboard!', 'success');
      } catch (error) {
        this.showNetworkStatus('❌ Share failed', 'error');
      }
      return;
    }

    try {
      await navigator.share({
        title: 'NocturneSwap - Dark Cult DEX',
        text: 'Trade Solana tokens with the most immersive DEX experience',
        url: window.location.href
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Auto-initialize PWA features
document.addEventListener('DOMContentLoaded', () => {
  // Request notification permission after user interaction
  document.addEventListener('click', () => {
    if (pwaManager.notificationPermission === 'default') {
      setTimeout(() => {
        pwaManager.requestNotificationPermission();
      }, 2000);
    }
  }, { once: true });
});

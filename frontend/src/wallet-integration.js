// Real Wallet Integration for NocturneSwap
// Multi-wallet support with transaction handling

class WalletIntegration {
  constructor() {
    this.supportedWallets = [
      {
        name: 'Phantom',
        icon: '👻',
        adapter: 'phantom',
        website: 'https://phantom.app',
        detected: false
      },
      {
        name: 'Solflare',
        icon: '☀️',
        adapter: 'solflare',
        website: 'https://solflare.com',
        detected: false
      },
      {
        name: 'Backpack',
        icon: '🎒',
        adapter: 'backpack',
        website: 'https://backpack.app',
        detected: false
      },
      {
        name: 'Glow',
        icon: '✨',
        adapter: 'glow',
        website: 'https://glow.app',
        detected: false
      },
      {
        name: 'Slope',
        icon: '📈',
        adapter: 'slope',
        website: 'https://slope.finance',
        detected: false
      }
    ];
    
    this.currentWallet = null;
    this.isConnected = false;
    this.publicKey = null;
    this.balance = 0;
    this.tokenBalances = new Map();
    this.transactionHistory = [];
    this.callbacks = new Map();
  }

  async initialize() {
    try {
      this.detectWallets();
      this.setupEventListeners();
      await this.checkExistingConnection();
      console.log('🌙 Wallet integration initialized');
      return true;
    } catch (error) {
      console.error('❌ Wallet initialization failed:', error);
      return false;
    }
  }

  detectWallets() {
    // Check for Phantom
    if (window.solana && window.solana.isPhantom) {
      this.supportedWallets[0].detected = true;
      this.supportedWallets[0].provider = window.solana;
    }

    // Check for Solflare
    if (window.solflare && window.solflare.isSolflare) {
      this.supportedWallets[1].detected = true;
      this.supportedWallets[1].provider = window.solflare;
    }

    // Check for Backpack
    if (window.backpack && window.backpack.isBackpack) {
      this.supportedWallets[2].detected = true;
      this.supportedWallets[2].provider = window.backpack;
    }

    // Check for Glow
    if (window.glow && window.glow.isGlow) {
      this.supportedWallets[3].detected = true;
      this.supportedWallets[3].provider = window.glow;
    }

    // Check for Slope
    if (window.Slope && window.Slope.isSlope) {
      this.supportedWallets[4].detected = true;
      this.supportedWallets[4].provider = window.Slope;
    }

    console.log('🔍 Detected wallets:', this.supportedWallets.filter(w => w.detected).map(w => w.name));
  }

  setupEventListeners() {
    // Listen for wallet events
    window.addEventListener('wallet-state-change', (event) => {
      this.handleWalletStateChange(event.detail);
    });

    // Setup provider-specific listeners
    this.supportedWallets.forEach(wallet => {
      if (wallet.detected && wallet.provider) {
        this.setupProviderListeners(wallet);
      }
    });
  }

  setupProviderListeners(wallet) {
    const provider = wallet.provider;
    
    if (provider.on) {
      provider.on('connect', (publicKey) => {
        this.handleWalletConnect(wallet, publicKey);
      });

      provider.on('disconnect', () => {
        this.handleWalletDisconnect();
      });

      provider.on('accountChanged', (publicKey) => {
        this.handleAccountChanged(publicKey);
      });
    }
  }

  async connectWallet(walletName) {
    try {
      const wallet = this.supportedWallets.find(w => w.name === walletName);
      if (!wallet || !wallet.detected) {
        throw new Error(`${walletName} wallet not detected`);
      }

      const provider = wallet.provider;
      
      // Connect to wallet
      const response = await provider.connect();
      const publicKey = response.publicKey || provider.publicKey;
      
      if (!publicKey) {
        throw new Error('Failed to get public key from wallet');
      }

      this.currentWallet = wallet;
      this.isConnected = true;
      this.publicKey = publicKey;

      // Get wallet info
      await this.refreshWalletInfo();

      // Store connection preference
      localStorage.setItem('nocturne-wallet-preference', walletName);

      // Emit connection event
      this.emitWalletEvent('connected', {
        wallet: walletName,
        publicKey: publicKey.toString()
      });

      console.log(`✅ Connected to ${walletName} wallet`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to ${walletName}:`, error);
      throw error;
    }
  }

  async disconnectWallet() {
    try {
      if (this.currentWallet && this.currentWallet.provider) {
        await this.currentWallet.provider.disconnect();
      }

      this.currentWallet = null;
      this.isConnected = false;
      this.publicKey = null;
      this.balance = 0;
      this.tokenBalances.clear();
      this.transactionHistory = [];

      // Clear stored preference
      localStorage.removeItem('nocturne-wallet-preference');

      // Emit disconnection event
      this.emitWalletEvent('disconnected', {});

      console.log('🔌 Wallet disconnected');
      return true;
    } catch (error) {
      console.error('❌ Failed to disconnect wallet:', error);
      throw error;
    }
  }

  async checkExistingConnection() {
    const preference = localStorage.getItem('nocturne-wallet-preference');
    if (preference) {
      const wallet = this.supportedWallets.find(w => w.name === preference);
      if (wallet && wallet.detected && wallet.provider) {
        try {
          if (wallet.provider.isConnected) {
            await this.connectWallet(preference);
          }
        } catch (error) {
          console.warn('Failed to restore wallet connection:', error);
        }
      }
    }
  }

  async refreshWalletInfo() {
    if (!this.isConnected || !this.publicKey) return;

    try {
      // Get SOL balance
      if (window.solanaRPC && window.solanaRPC.connection) {
        this.balance = await window.solanaRPC.getSOLBalance(this.publicKey.toString());
      }

      // Get token balances
      await this.refreshTokenBalances();

      // Get transaction history
      await this.refreshTransactionHistory();

      // Emit balance update event
      this.emitWalletEvent('balance-updated', {
        solBalance: this.balance,
        tokenBalances: Object.fromEntries(this.tokenBalances)
      });
    } catch (error) {
      console.error('❌ Failed to refresh wallet info:', error);
    }
  }

  async refreshTokenBalances() {
    if (!this.isConnected || !this.publicKey) return;

    try {
      const popularTokens = window.jupiterIntegration ? 
        window.jupiterIntegration.getPopularTokens() : {};

      for (const [symbol, mintAddress] of Object.entries(popularTokens)) {
        if (window.jupiterIntegration) {
          const balance = await window.jupiterIntegration.getTokenBalance(
            mintAddress, 
            this.publicKey.toString()
          );
          this.tokenBalances.set(symbol, balance);
        }
      }
    } catch (error) {
      console.error('❌ Failed to refresh token balances:', error);
    }
  }

  async refreshTransactionHistory() {
    if (!this.isConnected || !this.publicKey) return;

    try {
      if (window.solanaRPC) {
        this.transactionHistory = await window.solanaRPC.getTransactionHistory(
          this.publicKey.toString(), 
          20
        );
      }
    } catch (error) {
      console.error('❌ Failed to refresh transaction history:', error);
    }
  }

  async signTransaction(transaction) {
    if (!this.isConnected || !this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedTransaction = await this.currentWallet.provider.signTransaction(transaction);
      return signedTransaction;
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error);
      throw error;
    }
  }

  async signAllTransactions(transactions) {
    if (!this.isConnected || !this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedTransactions = await this.currentWallet.provider.signAllTransactions(transactions);
      return signedTransactions;
    } catch (error) {
      console.error('❌ Failed to sign transactions:', error);
      throw error;
    }
  }

  async signMessage(message) {
    if (!this.isConnected || !this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.currentWallet.provider.signMessage(message);
      return signature;
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw error;
    }
  }

  // Event handling
  handleWalletConnect(wallet, publicKey) {
    this.currentWallet = wallet;
    this.isConnected = true;
    this.publicKey = publicKey;
    this.refreshWalletInfo();
  }

  handleWalletDisconnect() {
    this.disconnectWallet();
  }

  handleAccountChanged(publicKey) {
    this.publicKey = publicKey;
    this.refreshWalletInfo();
  }

  handleWalletStateChange(state) {
    // Handle wallet state changes
    console.log('Wallet state changed:', state);
  }

  emitWalletEvent(eventType, data) {
    const event = new CustomEvent(`nocturne-wallet-${eventType}`, {
      detail: data
    });
    window.dispatchEvent(event);
  }

  // Utility methods
  getConnectedWalletInfo() {
    return {
      name: this.currentWallet?.name || null,
      publicKey: this.publicKey?.toString() || null,
      balance: this.balance,
      tokenBalances: Object.fromEntries(this.tokenBalances),
      isConnected: this.isConnected
    };
  }

  getDetectedWallets() {
    return this.supportedWallets.filter(w => w.detected);
  }

  formatPublicKey(publicKey, length = 8) {
    const key = publicKey.toString();
    return `${key.slice(0, length)}...${key.slice(-length)}`;
  }

  on(eventType, callback) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }
    this.callbacks.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.callbacks.has(eventType)) {
      const callbacks = this.callbacks.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(eventType, data) {
    if (this.callbacks.has(eventType)) {
      this.callbacks.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Callback error:', error);
        }
      });
    }
  }
}

// Initialize wallet integration
const walletIntegration = new WalletIntegration();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WalletIntegration;
} else {
  window.WalletIntegration = WalletIntegration;
  window.walletIntegration = walletIntegration;
}

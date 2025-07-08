// Real-time Solana RPC Integration for NocturneSwap
// Live blockchain data and wallet connections

class SolanaRPCIntegration {
  constructor() {
    this.rpcEndpoints = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ];
    this.connection = null;
    this.currentEndpoint = 0;
    this.isConnected = false;
    this.subscriptions = new Map();
  }

  async initialize() {
    try {
      await this.connectToRPC();
      await this.setupEventListeners();
      console.log('🌙 Solana RPC integration initialized');
      return true;
    } catch (error) {
      console.error('❌ RPC initialization failed:', error);
      return false;
    }
  }

  async connectToRPC() {
    for (let i = 0; i < this.rpcEndpoints.length; i++) {
      try {
        const endpoint = this.rpcEndpoints[this.currentEndpoint];
        this.connection = new solanaWeb3.Connection(endpoint, 'confirmed');
        
        // Test connection
        const version = await this.connection.getVersion();
        console.log(`🔗 Connected to Solana RPC: ${endpoint}`);
        console.log(`📡 Solana version: ${version['solana-core']}`);
        
        this.isConnected = true;
        return true;
      } catch (error) {
        console.warn(`⚠️ Failed to connect to ${this.rpcEndpoints[this.currentEndpoint]}`);
        this.currentEndpoint = (this.currentEndpoint + 1) % this.rpcEndpoints.length;
      }
    }
    throw new Error('Failed to connect to any RPC endpoint');
  }

  async setupEventListeners() {
    // Listen for slot changes (new blocks)
    this.connection.onSlotChange((slotInfo) => {
      this.handleSlotChange(slotInfo);
    });

    // Listen for account changes
    this.setupAccountChangeListeners();
  }

  handleSlotChange(slotInfo) {
    const event = new CustomEvent('solana-slot-change', {
      detail: {
        slot: slotInfo.slot,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }

  async subscribeToAccount(accountPubkey, callback) {
    try {
      const subscriptionId = this.connection.onAccountChange(
        new solanaWeb3.PublicKey(accountPubkey),
        (accountInfo, context) => {
          callback(accountInfo, context);
        },
        'confirmed'
      );
      
      this.subscriptions.set(accountPubkey, subscriptionId);
      return subscriptionId;
    } catch (error) {
      console.error('❌ Failed to subscribe to account:', error);
      return null;
    }
  }

  async unsubscribeFromAccount(accountPubkey) {
    const subscriptionId = this.subscriptions.get(accountPubkey);
    if (subscriptionId) {
      await this.connection.removeAccountChangeListener(subscriptionId);
      this.subscriptions.delete(accountPubkey);
    }
  }

  async getAccountInfo(publicKey) {
    try {
      const accountInfo = await this.connection.getAccountInfo(
        new solanaWeb3.PublicKey(publicKey)
      );
      return accountInfo;
    } catch (error) {
      console.error('❌ Failed to get account info:', error);
      return null;
    }
  }

  async getTransactionHistory(publicKey, limit = 50) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        new solanaWeb3.PublicKey(publicKey),
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await this.connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            });
            return {
              signature: sig.signature,
              timestamp: sig.blockTime,
              status: sig.err ? 'failed' : 'success',
              transaction: tx
            };
          } catch (error) {
            return {
              signature: sig.signature,
              timestamp: sig.blockTime,
              status: 'error',
              error: error.message
            };
          }
        })
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      console.error('❌ Failed to get transaction history:', error);
      return [];
    }
  }

  async getCurrentSlot() {
    try {
      return await this.connection.getSlot();
    } catch (error) {
      console.error('❌ Failed to get current slot:', error);
      return 0;
    }
  }

  async getBlockTime(slot) {
    try {
      return await this.connection.getBlockTime(slot);
    } catch (error) {
      console.error('❌ Failed to get block time:', error);
      return null;
    }
  }

  async getTokenSupply(mintAddress) {
    try {
      const supply = await this.connection.getTokenSupply(
        new solanaWeb3.PublicKey(mintAddress)
      );
      return supply.value;
    } catch (error) {
      console.error('❌ Failed to get token supply:', error);
      return null;
    }
  }

  async getMultipleAccounts(publicKeys) {
    try {
      const accounts = await this.connection.getMultipleAccountsInfo(
        publicKeys.map(pk => new solanaWeb3.PublicKey(pk))
      );
      return accounts;
    } catch (error) {
      console.error('❌ Failed to get multiple accounts:', error);
      return [];
    }
  }

  async simulateTransaction(transaction) {
    try {
      const simulation = await this.connection.simulateTransaction(transaction);
      return simulation;
    } catch (error) {
      console.error('❌ Transaction simulation failed:', error);
      return null;
    }
  }

  async sendTransaction(transaction, signers = []) {
    try {
      const signature = await this.connection.sendTransaction(
        transaction, 
        signers, 
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        }
      );
      
      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        signature, 
        'confirmed'
      );
      
      return {
        signature,
        success: !confirmation.value.err,
        error: confirmation.value.err
      };
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  async getRecentPerformanceSamples(limit = 5) {
    try {
      const samples = await this.connection.getRecentPerformanceSamples(limit);
      return samples;
    } catch (error) {
      console.error('❌ Failed to get performance samples:', error);
      return [];
    }
  }

  async getHealth() {
    try {
      const health = await this.connection.getHealth();
      return health;
    } catch (error) {
      console.error('❌ Failed to get RPC health:', error);
      return 'unknown';
    }
  }

  // Network status monitoring
  async getNetworkStatus() {
    try {
      const [slot, blockTime, performance, health] = await Promise.all([
        this.getCurrentSlot(),
        this.getBlockTime(await this.getCurrentSlot()),
        this.getRecentPerformanceSamples(1),
        this.getHealth()
      ]);

      return {
        currentSlot: slot,
        blockTime,
        health,
        performance: performance[0] || null,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to get network status:', error);
      return null;
    }
  }

  // Utility methods
  formatLamports(lamports) {
    return lamports / solanaWeb3.LAMPORTS_PER_SOL;
  }

  formatTokenAmount(amount, decimals) {
    return amount / Math.pow(10, decimals);
  }

  isValidPublicKey(publicKey) {
    try {
      new solanaWeb3.PublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  async setupAccountChangeListeners() {
    // This will be called when specific accounts need monitoring
    // Individual components can subscribe to specific accounts
  }
}

// Initialize Solana RPC integration
const solanaRPC = new SolanaRPCIntegration();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SolanaRPCIntegration;
} else {
  window.SolanaRPCIntegration = SolanaRPCIntegration;
  window.solanaRPC = solanaRPC;
}

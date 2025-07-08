// NocturneSwap Integration Layer
// This file connects Jupiter API, Analytics, and Live Price Feeds

class NocturneSwapIntegration {
  constructor() {
    this.jupiterAPI = 'https://quote-api.jup.ag/v6';
    this.priceAPI = 'https://api.coinbase.com/v2/exchange-rates';
    this.solanaRPC = 'https://api.mainnet-beta.solana.com';
    this.connection = null;
    this.priceCache = new Map();
    this.priceCacheExpiry = 30000; // 30 seconds
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize Solana connection
      if (window.solanaWeb3) {
        this.connection = new window.solanaWeb3.Connection(this.solanaRPC, 'confirmed');
      }

      // Initialize Jupiter integration
      if (window.jupiterIntegration) {
        await window.jupiterIntegration.initialize();
      }

      // Initialize analytics
      if (window.nocturneAnalytics) {
        console.log('🌙 Analytics initialized');
      }

      this.isInitialized = true;
      console.log('🌙 NocturneSwap integration initialized successfully');
      
      // Start price feed updates
      this.startPriceFeedUpdates();
      
      return true;
    } catch (error) {
      console.error('❌ NocturneSwap integration failed:', error);
      return false;
    }
  }

  // Enhanced price feed with multiple sources
  async getLivePrice(tokenMint, forceRefresh = false) {
    const cacheKey = `price_${tokenMint}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.priceCacheExpiry) {
      return cached.price;
    }

    try {
      let price = 0;
      
      // Try Jupiter price API first
      if (window.jupiterIntegration) {
        price = await window.jupiterIntegration.getTokenPrice(tokenMint);
        if (price > 0) {
          this.cachePrice(cacheKey, price);
          
          // Track price feed update
          if (window.nocturneAnalytics) {
            window.nocturneAnalytics.trackPriceFeed({
              token: tokenMint,
              price: price,
              source: 'jupiter',
              timestamp: Date.now()
            });
          }
          
          return price;
        }
      }
      
      // Fallback to other price sources
      price = await this.fetchPriceFromCoinbase(tokenMint);
      if (price > 0) {
        this.cachePrice(cacheKey, price);
        return price;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Failed to get live price:', error);
      return 0;
    }
  }

  async fetchPriceFromCoinbase(tokenMint) {
    try {
      // Map Solana token addresses to Coinbase symbols
      const tokenMap = {
        'So11111111111111111111111111111111111111112': 'SOL',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT'
      };

      const symbol = tokenMap[tokenMint];
      if (!symbol) return 0;

      const response = await fetch(`${this.priceAPI}?currency=${symbol}`);
      const data = await response.json();
      
      return parseFloat(data.data.rates.USD) || 0;
    } catch (error) {
      console.error('❌ Coinbase price fetch failed:', error);
      return 0;
    }
  }

  cachePrice(key, price) {
    this.priceCache.set(key, {
      price: price,
      timestamp: Date.now()
    });
  }

  // Enhanced token balance fetching with caching
  async getTokenBalance(tokenMint, walletAddress) {
    if (!this.connection || !walletAddress) return 0;

    const startTime = Date.now();
    
    try {
      let balance = 0;
      
      if (tokenMint === 'So11111111111111111111111111111111111111112') {
        // SOL balance
        const walletBalance = await this.connection.getBalance(
          new window.solanaWeb3.PublicKey(walletAddress)
        );
        balance = walletBalance / window.solanaWeb3.LAMPORTS_PER_SOL;
      } else {
        // SPL token balance
        const tokenAccounts = await this.connection.getTokenAccountsByOwner(
          new window.solanaWeb3.PublicKey(walletAddress),
          { mint: new window.solanaWeb3.PublicKey(tokenMint) }
        );

        if (tokenAccounts.value.length > 0) {
          const tokenBalance = await this.connection.getTokenAccountBalance(
            tokenAccounts.value[0].pubkey
          );
          balance = tokenBalance.value.uiAmount || 0;
        }
      }

      // Track RPC performance
      if (window.nocturneAnalytics) {
        window.nocturneAnalytics.trackRPCCall({
          method: 'getTokenBalance',
          startTime: startTime,
          success: true,
          endpoint: this.solanaRPC
        });
      }

      return balance;
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      
      // Track RPC error
      if (window.nocturneAnalytics) {
        window.nocturneAnalytics.trackRPCCall({
          method: 'getTokenBalance',
          startTime: startTime,
          success: false,
          endpoint: this.solanaRPC
        });
      }
      
      return 0;
    }
  }

  // Enhanced swap quote with better error handling
  async getSwapQuote(inputMint, outputMint, amount, slippageBps = 50) {
    if (!window.jupiterIntegration) {
      throw new Error('Jupiter integration not available');
    }

    const startTime = Date.now();
    
    try {
      const quote = await window.jupiterIntegration.getQuote(
        inputMint,
        outputMint,
        amount,
        slippageBps
      );

      // Track quote performance
      if (window.nocturneAnalytics) {
        window.nocturneAnalytics.trackEvent('quote_request', {
          inputMint,
          outputMint,
          amount,
          slippageBps,
          responseTime: Date.now() - startTime,
          success: true
        });
      }

      return quote;
    } catch (error) {
      // Track quote error
      if (window.nocturneAnalytics) {
        window.nocturneAnalytics.trackEvent('quote_request', {
          inputMint,
          outputMint,
          amount,
          slippageBps,
          responseTime: Date.now() - startTime,
          success: false,
          error: error.message
        });
      }
      
      throw error;
    }
  }

  // Enhanced swap execution with comprehensive tracking
  async executeSwap(quote, wallet, additionalData = {}) {
    if (!window.jupiterIntegration) {
      throw new Error('Jupiter integration not available');
    }

    const startTime = Date.now();
    
    try {
      const result = await window.jupiterIntegration.executeSwap(quote, wallet);

      if (result.success) {
        // Track successful swap
        if (window.nocturneAnalytics) {
          window.nocturneAnalytics.trackSwap({
            tokenIn: additionalData.tokenInMint,
            tokenOut: additionalData.tokenOutMint,
            amountIn: additionalData.amountIn,
            amountOut: additionalData.amountOut,
            signature: result.signature,
            priceImpact: quote.priceImpact,
            slippage: additionalData.slippage,
            route: quote.marketInfos?.map(m => m.label).join(' → '),
            executionTime: Date.now() - startTime
          });
        }
      }

      return result;
    } catch (error) {
      // Track swap error
      if (window.nocturneAnalytics) {
        window.nocturneAnalytics.trackEvent('swap_failed', {
          error: error.message,
          quote: quote,
          executionTime: Date.now() - startTime
        });
      }
      
      throw error;
    }
  }

  // Start periodic price feed updates
  startPriceFeedUpdates() {
    // Popular tokens to track
    const tokensToTrack = [
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', // RAY
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
      'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'  // WIF
    ];

    // Update prices every 30 seconds
    setInterval(async () => {
      for (const token of tokensToTrack) {
        await this.getLivePrice(token, true);
      }
    }, 30000);
  }

  // Get comprehensive dashboard data
  async getDashboardData() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [analyticsMetrics, priceData] = await Promise.all([
        this.getAnalyticsMetrics(),
        this.getAllPrices()
      ]);

      return {
        analytics: analyticsMetrics,
        prices: priceData,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to get dashboard data:', error);
      return null;
    }
  }

  getAnalyticsMetrics() {
    if (window.nocturneAnalytics) {
      return window.nocturneAnalytics.getAnalyticsMetrics();
    }
    return {
      totalSwaps: 0,
      uniqueUsers: 0,
      totalVolume: 0,
      totalFees: 0,
      avgSwapSize: 0,
      topTokens: []
    };
  }

  async getAllPrices() {
    const tokens = [
      'So11111111111111111111111111111111111111112',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'
    ];

    const prices = {};
    
    for (const token of tokens) {
      prices[token] = await this.getLivePrice(token);
    }

    return prices;
  }

  // Health check for all integrations
  async healthCheck() {
    const health = {
      jupiter: false,
      analytics: false,
      rpc: false,
      priceFeeds: false,
      timestamp: Date.now()
    };

    try {
      // Check Jupiter integration
      if (window.jupiterIntegration) {
        health.jupiter = true;
      }

      // Check Analytics
      if (window.nocturneAnalytics) {
        health.analytics = true;
      }

      // Check RPC connection
      if (this.connection) {
        const slot = await this.connection.getSlot();
        health.rpc = slot > 0;
      }

      // Check price feeds
      const testPrice = await this.getLivePrice('So11111111111111111111111111111111111111112');
      health.priceFeeds = testPrice > 0;

    } catch (error) {
      console.error('❌ Health check failed:', error);
    }

    return health;
  }
}

// Initialize the integration
const nocturneSwapIntegration = new NocturneSwapIntegration();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NocturneSwapIntegration;
} else {
  window.NocturneSwapIntegration = NocturneSwapIntegration;
  window.nocturneSwapIntegration = nocturneSwapIntegration;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  nocturneSwapIntegration.initialize();
});

// Jupiter Aggregator Integration for NocturneSwap
// Real token swapping functionality

class JupiterIntegration {
  constructor() {
    this.jupiterApi = 'https://quote-api.jup.ag/v6';
    this.solanaRpc = 'https://api.mainnet-beta.solana.com';
    this.connection = null;
    this.wallet = null;
  }

  async initialize() {
    try {
      // Initialize Solana connection
      this.connection = new solanaWeb3.Connection(this.solanaRpc, 'confirmed');
      
      // Check if wallet is available
      if (window.solana && window.solana.isPhantom) {
        this.wallet = window.solana;
        console.log('🌙 Jupiter integration initialized with Phantom wallet');
      } else if (window.solflare && window.solflare.isSolflare) {
        this.wallet = window.solflare;
        console.log('🌙 Jupiter integration initialized with Solflare wallet');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Jupiter initialization failed:', error);
      return false;
    }
  }

  async getTokenPrice(mintAddress) {
    try {
      const response = await fetch(`${this.jupiterApi}/price?ids=${mintAddress}`);
      const data = await response.json();
      return data.data[mintAddress]?.price || 0;
    } catch (error) {
      console.error('❌ Failed to get token price:', error);
      return 0;
    }
  }

  async getQuote(inputMint, outputMint, amount, slippageBps = 50) {
    try {
      const url = `${this.jupiterApi}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
      const response = await fetch(url);
      const quote = await response.json();
      
      if (quote.error) {
        throw new Error(quote.error);
      }
      
      return {
        ...quote,
        priceImpact: this.calculatePriceImpact(quote),
        minimumReceived: this.calculateMinimumReceived(quote, slippageBps)
      };
    } catch (error) {
      console.error('❌ Failed to get quote:', error);
      throw error;
    }
  }

  calculatePriceImpact(quote) {
    if (!quote.marketInfos || quote.marketInfos.length === 0) return 0;
    
    const totalPriceImpact = quote.marketInfos.reduce((sum, market) => {
      return sum + (market.priceImpactPct || 0);
    }, 0);
    
    return Math.abs(totalPriceImpact);
  }

  calculateMinimumReceived(quote, slippageBps) {
    const slippageMultiplier = 1 - (slippageBps / 10000);
    return Math.floor(quote.outAmount * slippageMultiplier);
  }

  async executeSwap(quote, wallet) {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Get swap transaction
      const swapResponse = await fetch(`${this.jupiterApi}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: wallet.publicKey.toString(),
          wrapUnwrapSOL: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto'
        })
      });

      const swapData = await swapResponse.json();
      
      if (swapData.error) {
        throw new Error(swapData.error);
      }

      // Deserialize transaction
      const transaction = solanaWeb3.Transaction.from(
        Buffer.from(swapData.swapTransaction, 'base64')
      );

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      return {
        signature,
        success: !confirmation.value.err,
        error: confirmation.value.err
      };
    } catch (error) {
      console.error('❌ Swap execution failed:', error);
      throw error;
    }
  }

  // Popular token addresses for NocturneSwap
  getPopularTokens() {
    return {
      SOL: 'So11111111111111111111111111111111111111112',
      USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      PEPE: 'BnYXGUGmMJu6mzwcYSsKCAhKxMDNLdqr8A9nC6oQeVyq'
    };
  }

  async getTokenBalance(mintAddress, walletAddress) {
    try {
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        new solanaWeb3.PublicKey(walletAddress),
        { mint: new solanaWeb3.PublicKey(mintAddress) }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = await this.connection.getTokenAccountBalance(
        tokenAccounts.value[0].pubkey
      );

      return balance.value.uiAmount || 0;
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      return 0;
    }
  }

  async getSOLBalance(walletAddress) {
    try {
      const balance = await this.connection.getBalance(
        new solanaWeb3.PublicKey(walletAddress)
      );
      return balance / solanaWeb3.LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('❌ Failed to get SOL balance:', error);
      return 0;
    }
  }
}

// Initialize Jupiter integration
const jupiterIntegration = new JupiterIntegration();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JupiterIntegration;
} else {
  window.JupiterIntegration = JupiterIntegration;
  window.jupiterIntegration = jupiterIntegration;
}

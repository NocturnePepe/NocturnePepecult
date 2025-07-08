// Jupiter React Hook - CDN Version
// This provides a React hook interface for Jupiter when the npm package isn't available

class JupiterReactHook {
  constructor() {
    this.jupiterAPI = 'https://quote-api.jup.ag/v6';
    this.quotes = new Map();
  }

  // React hook for Jupiter integration
  useJupiter(config) {
    const [quote, setQuote] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Get quote when config changes
    React.useEffect(() => {
      if (!config.amount || config.amount === 0) {
        setQuote(null);
        return;
      }

      const getQuote = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `${this.jupiterAPI}/quote?` + 
            `inputMint=${config.inputMint.toString()}&` +
            `outputMint=${config.outputMint.toString()}&` +
            `amount=${config.amount}&` +
            `slippageBps=${config.slippageBps || 50}`
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const quoteData = await response.json();
          setQuote(quoteData);
        } catch (err) {
          console.error('Jupiter quote error:', err);
          setError(err.message);
          setQuote(null);
        } finally {
          setLoading(false);
        }
      };

      const debounceTimer = setTimeout(getQuote, 500);
      return () => clearTimeout(debounceTimer);
    }, [config.inputMint?.toString(), config.outputMint?.toString(), config.amount, config.slippageBps]);

    // Exchange function
    const exchange = React.useCallback(async (params) => {
      if (!quote) {
        throw new Error('No quote available');
      }

      try {
        // Get swap transaction
        const swapResponse = await fetch(`${this.jupiterAPI}/swap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: params.wallet.publicKey.toString(),
            wrapUnwrapSOL: true,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: 'auto'
          })
        });

        const swapData = await swapResponse.json();

        if (swapData.error) {
          throw new Error(swapData.error);
        }

        // Deserialize and sign transaction
        const transaction = solanaWeb3.Transaction.from(
          Buffer.from(swapData.swapTransaction, 'base64')
        );

        const signedTransaction = await params.wallet.signTransaction(transaction);
        
        // Send transaction
        const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          { skipPreflight: false, preflightCommitment: 'confirmed' }
        );

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (params.onTransaction) {
          params.onTransaction(signature);
        }

        return {
          txid: signature,
          success: !confirmation.value.err
        };

      } catch (error) {
        console.error('Jupiter swap error:', error);
        throw error;
      }
    }, [quote]);

    return {
      quote,
      exchange,
      loading,
      error
    };
  }
}

// Create global instance
const jupiterReactHook = new JupiterReactHook();

// Export the hook function
window.useJupiter = jupiterReactHook.useJupiter.bind(jupiterReactHook);

console.log('🌙 Jupiter React Hook initialized (CDN version)');

import React, { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';

// Jupiter Hook (from CDN)
declare global {
  interface Window {
    useJupiter: any;
  }
}

// Token definitions
const TOKENS = {
  SOL: {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  USDC: {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
};

const SwapInterface: React.FC = () => {
  const { publicKey, connected, signTransaction } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  // Default SOL -> USDC pair
  const [inputToken, setInputToken] = useState(TOKENS.SOL);
  const [outputToken, setOutputToken] = useState(TOKENS.USDC);

  // Jupiter integration (fallback if CDN not loaded)
  const useJupiter = window?.useJupiter || (() => ({
    quote: null,
    exchange: async () => {},
    loading: false,
    error: null
  }));

  // Jupiter configuration
  const jupiterConfig = useMemo(() => ({
    inputMint: new PublicKey(inputToken.address),
    outputMint: new PublicKey(outputToken.address),
    amount: inputAmount ? Math.floor(parseFloat(inputAmount) * Math.pow(10, inputToken.decimals)) : 0,
    slippageBps: 100, // 1% slippage
  }), [inputToken, outputToken, inputAmount]);

  const { quote, exchange, loading } = useJupiter(jupiterConfig);

  // Update output amount when quote changes
  React.useEffect(() => {
    if (quote?.outAmount) {
      const output = quote.outAmount / Math.pow(10, outputToken.decimals);
      setOutputAmount(output.toFixed(6));
    } else {
      setOutputAmount('');
    }
  }, [quote, outputToken.decimals]);

  // Swap tokens
  const handleSwapTokens = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount('');
  }, [inputToken, outputToken, outputAmount]);

  // Execute swap
  const handleSwap = useCallback(async () => {
    if (!connected || !publicKey || !quote) {
      console.error('❌ Wallet not connected or no quote available');
      return;
    }

    setIsSwapping(true);
    
    try {
      console.log('🌙 Starting Jupiter swap...');
      console.log('From:', inputAmount, inputToken.symbol);
      console.log('To:', outputAmount, outputToken.symbol);
      
      const result = await exchange({
        wallet: { publicKey, signTransaction },
        onTransaction: (txid: string) => {
          console.log('🔄 Transaction submitted:', txid);
        }
      });

      if (result?.txid) {
        console.log('✅ Swap successful!');
        console.log('Transaction ID:', result.txid);
        console.log('Explorer:', `https://solscan.io/tx/${result.txid}`);
        
        // Reset form
        setInputAmount('');
        setOutputAmount('');
        
        // Track with analytics
        if (window.nocturneAnalytics) {
          window.nocturneAnalytics.trackSwap({
            tokenIn: inputToken.symbol,
            tokenOut: outputToken.symbol,
            amountIn: inputAmount,
            amountOut: outputAmount,
            signature: result.txid
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Swap failed:', error);
      console.error('Error details:', error.message || error);
    } finally {
      setIsSwapping(false);
    }
  }, [connected, publicKey, quote, exchange, inputAmount, outputAmount, inputToken, outputToken]);

  return (
    <div className="swap-interface">
      <div className="swap-container">
        <div className="swap-header">
          <h2>🌙 NocturneSwap</h2>
          <p>Jupiter-powered token swapping</p>
        </div>

        <div className="wallet-connection">
          <WalletMultiButton />
        </div>

        <div className="swap-form">
          {/* Input Token */}
          <div className="token-input">
            <div className="token-input-header">
              <label>From</label>
              <div className="token-selector">
                <img src={inputToken.logoURI} alt={inputToken.symbol} width="20" height="20" />
                <span>{inputToken.symbol}</span>
              </div>
            </div>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              className="amount-input"
            />
          </div>

          {/* Swap Button */}
          <div className="swap-arrow">
            <button 
              onClick={handleSwapTokens}
              className="swap-tokens-btn"
              type="button"
            >
              ⇅
            </button>
          </div>

          {/* Output Token */}
          <div className="token-input">
            <div className="token-input-header">
              <label>To</label>
              <div className="token-selector">
                <img src={outputToken.logoURI} alt={outputToken.symbol} width="20" height="20" />
                <span>{outputToken.symbol}</span>
              </div>
            </div>
            <input
              type="number"
              value={outputAmount}
              readOnly
              placeholder={loading ? 'Loading...' : '0.0'}
              className="amount-input readonly"
            />
          </div>

          {/* Quote Info */}
          {quote && (
            <div className="quote-info">
              <div className="quote-detail">
                <span>Rate</span>
                <span>
                  1 {inputToken.symbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount) || 0).toFixed(4)} {outputToken.symbol}
                </span>
              </div>
              <div className="quote-detail">
                <span>Slippage</span>
                <span>1%</span>
              </div>
              {quote.priceImpactPct && (
                <div className="quote-detail">
                  <span>Price Impact</span>
                  <span className={quote.priceImpactPct > 5 ? 'high-impact' : 'low-impact'}>
                    {quote.priceImpactPct.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!connected || !quote || isSwapping || !inputAmount}
            className="swap-button"
          >
            {!connected ? 'Connect Wallet' :
             isSwapping ? 'Swapping...' :
             !quote ? 'Enter Amount' :
             'Swap Tokens'}
          </button>
        </div>

        <div className="swap-info">
          <p>⚡ Powered by Jupiter Aggregator</p>
          <p>🔒 Best rates across all Solana DEXs</p>
          <p>💀 NocturnePepe approved swaps</p>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface;

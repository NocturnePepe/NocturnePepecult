import React, { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import './SwapInterface.css';

// Jupiter Hook (from CDN)
declare global {
  interface Window {
    useJupiter: any;
  }
}

interface SwapInterfaceProps {
  connection: any;
  program: any;
}

const SwapInterface: React.FC<SwapInterfaceProps> = () => {
  const { publicKey, connected, signTransaction } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState('');

  // Jupiter integration (fallback if CDN not loaded)
  const useJupiter = window?.useJupiter || (() => ({
    quote: null,
    exchange: async () => {},
    loading: false,
    error: null
  }));

  // Default SOL -> USDC configuration
  const jupiterConfig = useMemo(() => ({
    inputMint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
    outputMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC
    amount: inputAmount ? Math.floor(parseFloat(inputAmount) * 1e9) : 0, // Convert to lamports
    slippageBps: 100, // 1% slippage
  }), [inputAmount]);

  const { quote, exchange, loading } = useJupiter(jupiterConfig);

  // Update output amount when quote changes
  React.useEffect(() => {
    if (quote?.outAmount) {
      const output = quote.outAmount / 1e6; // USDC has 6 decimals
      setOutputAmount(output.toFixed(6));
    } else {
      setOutputAmount('');
    }
  }, [quote]);

  // Execute swap
  const handleSwap = useCallback(async () => {
    if (!connected || !publicKey || !quote) {
      setSwapError('Please connect wallet and enter amount');
      return;
    }

    setIsSwapping(true);
    setSwapError('');
    
    try {
      console.log('🌙 Starting Jupiter swap...');
      console.log('From:', inputAmount, 'SOL');
      console.log('To:', outputAmount, 'USDC');
      
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
            tokenIn: 'SOL',
            tokenOut: 'USDC',
            amountIn: inputAmount,
            amountOut: outputAmount,
            signature: result.txid
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Swap failed:', error);
      setSwapError(`Swap failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSwapping(false);
    }
  }, [connected, publicKey, quote, exchange, inputAmount, outputAmount]);

  return (
    <div className="swap-interface">
      <div className="swap-container">
        <div className="swap-header">
          <h2>🌙 NocturneSwap</h2>
          <p>Jupiter-powered SOL ⇄ USDC swapping</p>
        </div>

        <div className="wallet-connection">
          <WalletMultiButton />
        </div>

        {swapError && (
          <div className="error-message">
            ⚠️ {swapError}
          </div>
        )}

        <div className="swap-form">
          {/* Input Token - SOL */}
          <div className="token-input">
            <div className="token-input-header">
              <label>From</label>
              <div className="token-selector">
                <span>🔮 SOL</span>
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

          {/* Swap Arrow */}
          <div className="swap-arrow">
            <button className="swap-tokens-btn" type="button">
              ⇅
            </button>
          </div>

          {/* Output Token - USDC */}
          <div className="token-input">
            <div className="token-input-header">
              <label>To</label>
              <div className="token-selector">
                <span>💵 USDC</span>
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
          {quote && inputAmount && (
            <div className="quote-info">
              <div className="quote-detail">
                <span>Rate</span>
                <span>
                  1 SOL = {(parseFloat(outputAmount) / parseFloat(inputAmount) || 0).toFixed(4)} USDC
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
              <div className="quote-detail">
                <span>Route</span>
                <span>Jupiter Aggregator</span>
              </div>
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
             loading ? 'Getting Quote...' :
             !quote ? 'Enter Amount' :
             'Swap Tokens'}
          </button>
        </div>

        <div className="swap-info">
          <p>⚡ Powered by Jupiter Aggregator</p>
          <p>🔒 Best rates across all Solana DEXs</p>
          <p>💀 NocturnePepe referrer bonus</p>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface;

import React, { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { useJupiterQuotes, POPULAR_TOKENS, formatTokenAmount, toRawAmount } from './hooks/useJupiterQuotes';
import './SwapInterface.css';

interface SwapInterfaceProps {
  connection: any;
  program: any;
}

const SwapInterface = ({ connection, program }: SwapInterfaceProps) => {
  const { publicKey, connected, signTransaction } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [swapError, setSwapError] = useState('');
  
  // Token selection (you can make this dynamic later)
  const [inputToken] = useState(POPULAR_TOKENS.SOL);
  const [outputToken] = useState(POPULAR_TOKENS.USDC);

  // Calculate raw amount for Jupiter API
  const rawInputAmount = useMemo(() => {
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return 0;
    return toRawAmount(inputAmount, inputToken.decimals);
  }, [inputAmount, inputToken.decimals]);

  // Use our mobile-friendly Jupiter hook
  const { 
    quote, 
    loading, 
    error, 
    priceImpact, 
    rate, 
    routes 
  } = useJupiterQuotes({
    inputMint: inputToken.mint,
    outputMint: outputToken.mint,
    amount: rawInputAmount,
    slippageBps: 100 // 1% slippage
  });

  // Calculate output amount from quote
  const outputAmount = useMemo(() => {
    if (!quote) return '';
    return formatTokenAmount(quote.outAmount, outputToken.decimals).toFixed(6);
  }, [quote, outputToken.decimals]);

  // Handle swap execution (placeholder for now - just show quote details)
  const handleSwap = useCallback(() => {
    if (!connected || !publicKey || !quote) {
      setSwapError('Please connect wallet and enter amount');
      return;
    }

    // For now, just log the quote details
    console.log('🌙 Jupiter Quote Details:');
    console.log('Input:', inputAmount, inputToken.symbol);
    console.log('Output:', outputAmount, outputToken.symbol);
    console.log('Rate:', rate.toFixed(6), `${outputToken.symbol} per ${inputToken.symbol}`);
    console.log('Price Impact:', priceImpact.toFixed(2) + '%');
    console.log('Routes:', routes);
    console.log('Raw Quote:', quote);
    
    setSwapError(''); // Clear any previous errors
    alert(`Quote Preview:\n${inputAmount} ${inputToken.symbol} → ${outputAmount} ${outputToken.symbol}\nRate: ${rate.toFixed(4)}\nPrice Impact: ${priceImpact.toFixed(2)}%`);
  }, [connected, publicKey, quote, inputAmount, outputAmount, rate, priceImpact, routes, inputToken, outputToken]);

  return (
    <div className="swap-interface">
      <div className="swap-container">
        <div className="swap-header">
          <h2>🌙 NocturneSwap</h2>
          <p>Live Jupiter quotes • {inputToken.symbol} ⇄ {outputToken.symbol}</p>
        </div>

        <div className="wallet-connection">
          <WalletMultiButton />
        </div>

        {swapError && (
          <div className="error-message">
            ⚠️ {swapError}
          </div>
        )}

        {error && (
          <div className="error-message">
            🔴 Quote Error: {error}
          </div>
        )}

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

          {/* Swap Arrow */}
          <div className="swap-arrow">
            <button className="swap-tokens-btn" type="button">
              ⇅
            </button>
          </div>

          {/* Output Token */}
          <div className="token-input">
            <div className="token-input-header">
              <label>To (Jupiter Quote)</label>
              <div className="token-selector">
                <img src={outputToken.logoURI} alt={outputToken.symbol} width="20" height="20" />
                <span>{outputToken.symbol}</span>
              </div>
            </div>
            <input
              type="number"
              value={outputAmount}
              readOnly
              placeholder={loading ? 'Getting quote...' : '0.0'}
              className={`amount-input readonly ${loading ? 'loading' : ''}`}
            />
          </div>

          {/* Live Quote Details */}
          {quote && inputAmount && (
            <div className="quote-info">
              <div className="quote-header">
                <h4>📊 Live Jupiter Quote</h4>
                <span className="quote-timestamp">
                  Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="quote-detail">
                <span>Exchange Rate</span>
                <span className="rate-value">
                  1 {inputToken.symbol} = {rate.toFixed(4)} {outputToken.symbol}
                </span>
              </div>
              
              <div className="quote-detail">
                <span>Price Impact</span>
                <span className={`impact-value ${priceImpact > 5 ? 'high-impact' : 'low-impact'}`}>
                  {priceImpact.toFixed(3)}%
                </span>
              </div>
              
              <div className="quote-detail">
                <span>Slippage Protection</span>
                <span>1.0%</span>
              </div>
              
              {routes.length > 0 && (
                <div className="quote-detail">
                  <span>Route</span>
                  <span className="route-info">
                    {routes.slice(0, 2).join(' → ')}
                    {routes.length > 2 && ` +${routes.length - 2} more`}
                  </span>
                </div>
              )}
              
              <div className="quote-detail">
                <span>Minimum Received</span>
                <span>
                  {(parseFloat(outputAmount) * 0.99).toFixed(6)} {outputToken.symbol}
                </span>
              </div>
              
              <div className="quote-stats">
                <small>
                  📈 Jupiter found {quote.routePlan?.length || 1} route(s) • 
                  Response time: {quote.timeTaken}ms
                </small>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && inputAmount && (
            <div className="loading-quote">
              <div className="loading-spinner"></div>
              <span>Fetching best rate from Jupiter...</span>
            </div>
          )}

          {/* Quote Preview Button */}
          <button
            onClick={handleSwap}
            disabled={!connected || !quote || loading || !inputAmount}
            className="swap-button"
          >
            {!connected ? 'Connect Wallet' :
             loading ? 'Getting Quote...' :
             !quote ? 'Enter Amount' :
             '🔍 Preview Quote Details'}
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

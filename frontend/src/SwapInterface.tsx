import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { useJupiterQuotes, POPULAR_TOKENS, formatTokenAmount, toRawAmount } from './hooks/useJupiterQuotes';
import { useJupiterSwap } from './hooks/useJupiterSwap';
import { usePriceData, formatPrice, formatChange, formatLargeNumber } from './hooks/usePriceData';
import { TokenSelector, EXTENDED_TOKEN_LIST } from './components/TokenSelector';
import PriceChart from './components/PriceChart';
import PriceAlert from './components/PriceAlert';
import Portfolio from './components/Portfolio';
import { cultSounds } from './SoundEffects.js';
import './SwapInterface.css';

interface SwapInterfaceProps {
  connection: any;
  program: any;
}

interface RitualModalProps {
  inputAmount: string;
  inputToken: any;
  outputAmount: string;
  outputToken: any;
  rate: number;
  priceImpact: number;
  quote: any;
  onClose: () => void;
  onExecuteSwap: (quote: any) => Promise<void>;
  swapLoading: boolean;
  txHash: string | null;
  swapError: string | null;
}

const RitualModal = ({
  inputAmount,
  inputToken,
  outputAmount,
  outputToken,
  rate,
  priceImpact,
  quote,
  onClose,
  onExecuteSwap,
  swapLoading,
  txHash,
  swapError
}: RitualModalProps) => {
  const [step, setStep] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const steps = [
    "🔮 Initiating ancient swap ritual...",
    "⚡ Connecting to the void networks...",
    "🌙 Jupiter spirits are calculating optimal routes...", 
    "💀 Summoning liquidity from shadow pools...",
    "🕯️ Executing mystical transaction...",
    "✨ Ritual complete! The exchange has been blessed."
  ];

  const handleExecuteSwap = useCallback(async () => {
    if (!quote || isExecuting) return;
    
    setIsExecuting(true);
    setStep(4); // Move to execution step
    await onExecuteSwap(quote);
    setIsExecuting(false);
    
    // Move to completion step after execution
    setTimeout(() => setStep(5), 1000);
  }, [quote, onExecuteSwap, isExecuting]);

  useEffect(() => {
    const typeText = async () => {
      const text = steps[step];
      setTypewriterText('');
      
      // Play mystical sound for each step
      if (step === 0) await cultSounds.playSwapSound();
      else await cultSounds.playHoverSound();
      
      for (let i = 0; i <= text.length; i++) {
        setTypewriterText(text.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (step < 3) {
        setStep(prev => prev + 1);
      } else if (step === 3) {
        // Wait for user to click execute
        // Step 4 (execution) and 5 (completion) are handled by button clicks
      }
    };

    if (step < 4) {
      typeText();
    }
  }, [step]);

  // Handle actual swap execution
  const executeRealSwap = useCallback(async () => {
    await handleExecuteSwap();
  }, [handleExecuteSwap]);

  return (
    <div className="ritual-modal-overlay">
      <div className="ritual-modal">
        <div className="ritual-header">
          <h3>🌙 Nocturne Ritual</h3>
          <button className="ritual-close" onClick={onClose}>×</button>
        </div>
        
        <div className="ritual-content">
          <div className="ritual-typewriter">
            <p>{typewriterText}</p>
            <span className="cursor">|</span>
          </div>
          
          <div className="ritual-details">
            <div className="ritual-trade">
              <span>{inputAmount} {inputToken.symbol}</span>
              <span className="ritual-arrow">→</span>
              <span>{outputAmount} {outputToken.symbol}</span>
            </div>
            
            <div className="ritual-stats">
              <div>Rate: {rate.toFixed(4)} {outputToken.symbol}/{inputToken.symbol}</div>
              <div>Impact: {priceImpact.toFixed(2)}%</div>
              <div>TX: {txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-8)}` : 'Pending...'}</div>
              {swapError && <div style={{color: '#ff6b6b'}}>Error: {swapError}</div>}
            </div>
          </div>
          
          {step === 3 && !isExecuting && (
            <button 
              className="ritual-execute-btn"
              onClick={executeRealSwap}
              disabled={swapLoading}
              onMouseEnter={() => cultSounds.playHoverSound()}
            >
              {swapLoading ? '🕯️ Executing...' : '⚡ Execute Swap'}
            </button>
          )}
          
          {(step === 5 || txHash) && (
            <button 
              className="ritual-complete-btn"
              onClick={async () => {
                await cultSounds.playConnectSound();
                onClose();
              }}
              onMouseEnter={() => cultSounds.playHoverSound()}
            >
              Close Ritual
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SwapInterface = ({ connection, program }: SwapInterfaceProps) => {
  const { publicKey, connected, signTransaction } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [swapError, setSwapError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('24h');
  const [showChart, setShowChart] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(false);
  
  // Token selection - now dynamic!
  const [inputToken, setInputToken] = useState(EXTENDED_TOKEN_LIST[0]); // SOL
  const [outputToken, setOutputToken] = useState(EXTENDED_TOKEN_LIST[1]); // USDC

  // Real-time price data for both tokens
  const inputPriceData = usePriceData(inputToken.symbol);
  const outputPriceData = usePriceData(outputToken.symbol);

  // Calculate raw amount for Jupiter API
  const rawInputAmount = useMemo(() => {
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return 0;
    return toRawAmount(inputAmount, inputToken.decimals);
  }, [inputAmount, inputToken.decimals]);

  // Use our mobile-friendly Jupiter hooks
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

  const { 
    executeSwap, 
    loading: swapLoading, 
    error: swapExecutionError, 
    txHash 
  } = useJupiterSwap();

  // Calculate output amount from quote
  const outputAmount = useMemo(() => {
    if (!quote) return '';
    return formatTokenAmount(quote.outAmount, outputToken.decimals).toFixed(6);
  }, [quote, outputToken.decimals]);

  // Handle swap execution with modal
  const handleSwap = useCallback(async () => {
    if (!connected || !publicKey || !quote) {
      setSwapError('Please connect wallet and enter amount');
      await cultSounds.playErrorSound();
      return;
    }

    setSwapError('');
    setModalStep(0);
    setShowModal(true);
    setSwapSuccess(false);
    await cultSounds.playConnectSound();
  }, [connected, publicKey, quote]);

  // Handle token swapping
  const handleTokenSwap = useCallback(async () => {
    const tempToken = inputToken;
    setInputToken(outputToken);
    setOutputToken(tempToken);
    setInputAmount(''); // Clear amount when swapping
    await cultSounds.playSwapSound();
  }, [inputToken, outputToken]);

  // Handle token selection
  const handleInputTokenSelect = useCallback(async (token: any) => {
    setInputToken(token);
    await cultSounds.playHoverSound();
  }, []);

  const handleOutputTokenSelect = useCallback(async (token: any) => {
    setOutputToken(token);
    await cultSounds.playHoverSound();
  }, []);

  // Handle actual swap execution
  const handleExecuteSwap = useCallback(async (quoteToExecute: any) => {
    try {
      const result = await executeSwap(quoteToExecute);
      if (result) {
        setSwapSuccess(true);
        await cultSounds.playRitualCompleteSound();
      }
    } catch (error) {
      console.error('Swap execution failed:', error);
      await cultSounds.playErrorSound();
    }
  }, [executeSwap]);

  return (
    <div className="swap-interface">
      <div className="swap-container">
        <div className="swap-header">
          <h2>🌙 NocturneSwap</h2>
          <p>Live Jupiter quotes • {inputToken.symbol} ⇄ {outputToken.symbol}</p>
          <div className="header-actions">
            <button 
              className="chart-toggle-btn"
              onClick={() => setShowChart(!showChart)}
              onMouseEnter={() => cultSounds.playHoverSound()}
            >
              {showChart ? '📈 Hide Chart' : '📊 Show Chart'}
            </button>
            <button 
              className="portfolio-btn"
              onClick={() => setShowPortfolio(true)}
              onMouseEnter={() => cultSounds.playHoverSound()}
            >
              🏦 Portfolio
            </button>
          </div>
        </div>

        {/* Real-time Price Data */}
        <div className="price-data-section">
          <div className="token-price-card">
            <div className="price-card-header">
              <span className="token-symbol">{inputToken.symbol}</span>
              <span className="token-name">{inputToken.name}</span>
            </div>
            {inputPriceData.loading ? (
              <div className="price-loading">Loading...</div>
            ) : inputPriceData.priceData ? (
              <div className="price-details">
                <div className="current-price">
                  {formatPrice(inputPriceData.priceData.price)}
                </div>
                <div className={`price-change ${inputPriceData.priceData.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(inputPriceData.priceData.change24h)}
                </div>
                <div className="price-stats">
                  <span>Vol: {formatLargeNumber(inputPriceData.priceData.volume24h)}</span>
                  <span>MCap: {formatLargeNumber(inputPriceData.priceData.marketCap)}</span>
                </div>
              </div>
            ) : (
              <div className="price-unavailable">Price data unavailable</div>
            )}
          </div>

          <div className="price-divider">⇄</div>

          <div className="token-price-card">
            <div className="price-card-header">
              <span className="token-symbol">{outputToken.symbol}</span>
              <span className="token-name">{outputToken.name}</span>
            </div>
            {outputPriceData.loading ? (
              <div className="price-loading">Loading...</div>
            ) : outputPriceData.priceData ? (
              <div className="price-details">
                <div className="current-price">
                  {formatPrice(outputPriceData.priceData.price)}
                </div>
                <div className={`price-change ${outputPriceData.priceData.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(outputPriceData.priceData.change24h)}
                </div>
                <div className="price-stats">
                  <span>Vol: {formatLargeNumber(outputPriceData.priceData.volume24h)}</span>
                  <span>MCap: {formatLargeNumber(outputPriceData.priceData.marketCap)}</span>
                </div>
              </div>
            ) : (
              <div className="price-unavailable">Price data unavailable</div>
            )}
          </div>
        </div>

        {/* Price Chart Section */}
        {showChart && inputPriceData.priceData && (
          <PriceChart
            tokenSymbol={inputToken.symbol}
            currentPrice={inputPriceData.priceData.price}
            change24h={inputPriceData.priceData.change24h}
            timeframe={chartTimeframe as '1h' | '24h' | '7d' | '30d'}
            onTimeframeChange={(tf) => setChartTimeframe(tf)}
          />
        )}

        {/* Price Alert Section */}
        {inputPriceData.priceData && (
          <PriceAlert
            tokenSymbol={inputToken.symbol}
            currentPrice={inputPriceData.priceData.price}
            onAlertTriggered={(alert) => {
              console.log('Alert triggered:', alert);
              // Could show a notification modal here
            }}
          />
        )}

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
            <TokenSelector
              selectedToken={inputToken}
              onTokenSelect={handleInputTokenSelect}
              otherToken={outputToken}
              label="From"
            />
            <div className="amount-input-container">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                className="amount-input"
              />
              {inputAmount && inputPriceData.priceData && (
                <div className="usd-value">
                  ≈ {formatPrice(parseFloat(inputAmount) * inputPriceData.priceData.price)}
                </div>
              )}
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="swap-arrow">
            <button 
              className="swap-tokens-btn" 
              type="button"
              onClick={handleTokenSwap}
              onMouseEnter={() => cultSounds.playHoverSound()}
            >
              ⇅
            </button>
          </div>

          {/* Output Token */}
          <div className="token-input">
            <TokenSelector
              selectedToken={outputToken}
              onTokenSelect={handleOutputTokenSelect}
              otherToken={inputToken}
              label="To (Jupiter Quote)"
            />
            <div className="amount-input-container">
              <input
                type="number"
                value={outputAmount}
                readOnly
                placeholder={loading ? 'Getting quote...' : '0.0'}
                className={`amount-input readonly ${loading ? 'loading' : ''}`}
              />
              {outputAmount && outputPriceData.priceData && (
                <div className="usd-value">
                  ≈ {formatPrice(parseFloat(outputAmount) * outputPriceData.priceData.price)}
                </div>
              )}
            </div>
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
            onMouseEnter={() => cultSounds.playHoverSound()}
            disabled={!connected || !quote || loading || !inputAmount}
            className="swap-button"
          >
            {!connected ? 'Connect Wallet' :
             loading ? 'Getting Quote...' :
             !quote ? 'Enter Amount' :
             '� Begin Ritual'}
          </button>
        </div>

        <div className="swap-info">
          <p>⚡ Powered by Jupiter Aggregator</p>
          <p>🔒 Best rates across all Solana DEXs</p>
          <p>💀 NocturnePepe referrer bonus</p>
        </div>
      </div>

      {/* Custom Cult Ritual Modal */}
      {showModal && <RitualModal 
        inputAmount={inputAmount}
        inputToken={inputToken}
        outputAmount={outputAmount}
        outputToken={outputToken}
        rate={rate}
        priceImpact={priceImpact}
        quote={quote}
        onClose={() => setShowModal(false)}
        onExecuteSwap={handleExecuteSwap}
        swapLoading={swapLoading}
        txHash={txHash}
        swapError={swapExecutionError}
      />}

      {/* Portfolio Modal */}
      <Portfolio 
        connection={connection}
        isVisible={showPortfolio}
        onClose={() => setShowPortfolio(false)}
      />
    </div>
  );
};

export default SwapInterface;

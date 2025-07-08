import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import './SwapInterface.css';

// Import Jupiter integration
declare global {
  interface Window {
    jupiterIntegration: any;
  }
}

interface SwapInterfaceProps {
  connection: Connection;
  program: Program | null;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ connection, program }) => {
  const { publicKey, signTransaction } = useWallet();
  const [tokenAAmount, setTokenAAmount] = useState<string>('');
  const [tokenBAmount, setTokenBAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState<number>(1); // 1% default slippage
  const [tokenAMint, setTokenAMint] = useState<string>('');
  const [tokenBMint, setTokenBMint] = useState<string>('');
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [quote, setQuote] = useState<any>(null);
  const [tokenABalance, setTokenABalance] = useState<number>(0);
  const [tokenBBalance, setTokenBBalance] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [swapError, setSwapError] = useState<string>('');
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  // Jupiter-compatible token list
  const POPULAR_TOKENS = {
    'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana', decimals: 9 },
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether', decimals: 6 },
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'RAY', name: 'Raydium', decimals: 6 },
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk', decimals: 5 },
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': { symbol: 'WIF', name: 'dogwifhat', decimals: 6 },
  };

  // Initialize Jupiter integration
  useEffect(() => {
    if (window.jupiterIntegration) {
      window.jupiterIntegration.initialize();
    }
  }, []);

  // Fetch token balances when wallet connects
  useEffect(() => {
    if (publicKey && tokenAMint && window.jupiterIntegration) {
      fetchTokenBalance(tokenAMint, 'A');
    }
  }, [publicKey, tokenAMint]);

  useEffect(() => {
    if (publicKey && tokenBMint && window.jupiterIntegration) {
      fetchTokenBalance(tokenBMint, 'B');
    }
  }, [publicKey, tokenBMint]);

  const fetchTokenBalance = async (mint: string, tokenType: 'A' | 'B') => {
    if (!publicKey || !window.jupiterIntegration) return;

    try {
      let balance = 0;
      if (mint === 'So11111111111111111111111111111111111111112') {
        // SOL balance
        balance = await window.jupiterIntegration.getSOLBalance(publicKey.toString());
      } else {
        // SPL token balance
        balance = await window.jupiterIntegration.getTokenBalance(mint, publicKey.toString());
      }
      
      if (tokenType === 'A') {
        setTokenABalance(balance);
      } else {
        setTokenBBalance(balance);
      }
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
    }
  };

  // Get quote from Jupiter
  const getJupiterQuote = async (inputMint: string, outputMint: string, amount: string) => {
    if (!amount || !inputMint || !outputMint || !window.jupiterIntegration) return null;

    setIsQuoteLoading(true);
    setSwapError('');

    try {
      const inputToken = POPULAR_TOKENS[inputMint as keyof typeof POPULAR_TOKENS];
      const amountInLamports = Math.floor(parseFloat(amount) * Math.pow(10, inputToken.decimals));
      
      const jupiterQuote = await window.jupiterIntegration.getQuote(
        inputMint,
        outputMint,
        amountInLamports,
        slippage * 100 // Convert to basis points
      );

      const outputToken = POPULAR_TOKENS[outputMint as keyof typeof POPULAR_TOKENS];
      const outputAmount = jupiterQuote.outAmount / Math.pow(10, outputToken.decimals);

      setQuote(jupiterQuote);
      setPriceImpact(jupiterQuote.priceImpact);
      
      return outputAmount.toFixed(6);
    } catch (error) {
      console.error('Failed to get Jupiter quote:', error);
      setSwapError('Failed to get price quote');
      return null;
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleTokenAChange = async (value: string) => {
    setTokenAAmount(value);
    
    if (value && tokenAMint && tokenBMint) {
      const calculatedB = await getJupiterQuote(tokenAMint, tokenBMint, value);
      if (calculatedB) {
        setTokenBAmount(calculatedB);
      }
    } else {
      setTokenBAmount('');
      setQuote(null);
    }
  };

  const handleSwap = async () => {
    if (!publicKey || !tokenAAmount || !tokenBAmount || !quote) {
      setSwapError('Please connect wallet and enter amounts');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeSwap = async () => {
    if (!publicKey || !quote || !window.jupiterIntegration) return;

    setIsLoading(true);
    setSwapError('');
    
    try {
      // Use Jupiter for actual swap execution
      const result = await window.jupiterIntegration.executeSwap(quote, { 
        publicKey, 
        signTransaction 
      });

      if (result.success) {
        // Success! Reset form
        setTokenAAmount('');
        setTokenBAmount('');
        setQuote(null);
        setShowConfirmModal(false);
        
        // Refresh balances
        if (tokenAMint) fetchTokenBalance(tokenAMint, 'A');
        if (tokenBMint) fetchTokenBalance(tokenBMint, 'B');
        
        // Track successful swap
        if (window.nocturneAnalytics) {
          window.nocturneAnalytics.trackSwap({
            tokenIn: tokenAMint,
            tokenOut: tokenBMint,
            amountIn: tokenAAmount,
            amountOut: tokenBAmount,
            signature: result.signature
          });
        }
      } else {
        setSwapError(`Swap failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Swap execution failed:', error);
      setSwapError('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Swap confirmation modal component
  const SwapConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="modal-overlay">
        <div className="swap-confirm-modal">
          <div className="modal-header">
            <h3>🌙 Confirm Swap</h3>
            <button 
              className="close-button"
              onClick={() => setShowConfirmModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="swap-details-modal">
            <div className="swap-route">
              <div className="token-info">
                <span className="amount">{tokenAAmount}</span>
                <span className="symbol">
                  {POPULAR_TOKENS[tokenAMint as keyof typeof POPULAR_TOKENS]?.symbol}
                </span>
              </div>
              <div className="arrow">→</div>
              <div className="token-info">
                <span className="amount">{tokenBAmount}</span>
                <span className="symbol">
                  {POPULAR_TOKENS[tokenBMint as keyof typeof POPULAR_TOKENS]?.symbol}
                </span>
              </div>
            </div>
            
            <div className="swap-metrics">
              <div className="metric">
                <span>Price Impact</span>
                <span className={priceImpact > 5 ? 'high-impact' : 'low-impact'}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="metric">
                <span>Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
              <div className="metric">
                <span>Minimum Received</span>
                <span>
                  {quote?.minimumReceived ? 
                    (quote.minimumReceived / Math.pow(10, POPULAR_TOKENS[tokenBMint as keyof typeof POPULAR_TOKENS]?.decimals || 6)).toFixed(6) : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              className="cancel-button"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
            <button 
              className="confirm-button"
              onClick={executeSwap}
              disabled={isLoading}
            >
              {isLoading ? 'Swapping...' : 'Confirm Swap'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="swap-interface">
      <SwapConfirmModal />
      
      <div className="swap-container">
        <div className="swap-header">
          <h2>🌙 NocturneSwap</h2>
          <p>Cult-powered token swapping via Jupiter</p>
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
          <div className="token-input">
            <label>
              From 
              {tokenABalance > 0 && (
                <span className="balance">Balance: {tokenABalance.toFixed(6)}</span>
              )}
            </label>
            <div className="input-group">
              <input
                type="number"
                value={tokenAAmount}
                onChange={(e) => handleTokenAChange(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                max={tokenABalance}
              />
              <select 
                value={tokenAMint} 
                onChange={(e) => setTokenAMint(e.target.value)}
                className="token-select"
              >
                <option value="">Select Token</option>
                {Object.entries(POPULAR_TOKENS).map(([mint, token]) => (
                  <option key={mint} value={mint}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="swap-arrow">
            <button onClick={() => {
              const tempMint = tokenAMint;
              const tempAmount = tokenAAmount;
              setTokenAMint(tokenBMint);
              setTokenBMint(tempMint);
              setTokenAAmount(tokenBAmount);
              setTokenBAmount(tempAmount);
            }}>
              ⇅
            </button>
          </div>

          <div className="token-input">
            <label>
              To
              {tokenBBalance > 0 && (
                <span className="balance">Balance: {tokenBBalance.toFixed(6)}</span>
              )}
            </label>
            <div className="input-group">
              <input
                type="number"
                value={tokenBAmount}
                readOnly
                placeholder={isQuoteLoading ? 'Loading...' : '0.0'}
                className={isQuoteLoading ? 'loading' : ''}
              />
              <select 
                value={tokenBMint} 
                onChange={(e) => setTokenBMint(e.target.value)}
                className="token-select"
              >
                <option value="">Select Token</option>
                {Object.entries(POPULAR_TOKENS).map(([mint, token]) => (
                  <option key={mint} value={mint}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="swap-details">
            <div className="detail-row">
              <span>Slippage Tolerance</span>
              <div className="slippage-controls">
                <button 
                  className={slippage === 0.5 ? 'active' : ''} 
                  onClick={() => setSlippage(0.5)}
                >
                  0.5%
                </button>
                <button 
                  className={slippage === 1 ? 'active' : ''} 
                  onClick={() => setSlippage(1)}
                >
                  1%
                </button>
                <button 
                  className={slippage === 2 ? 'active' : ''} 
                  onClick={() => setSlippage(2)}
                >
                  2%
                </button>
                <input 
                  type="number" 
                  value={slippage} 
                  onChange={(e) => setSlippage(Number(e.target.value))}
                  step="0.1"
                  min="0.1"
                  max="50"
                />
              </div>
            </div>
            
            {priceImpact > 0 && (
              <div className="detail-row">
                <span>Price Impact</span>
                <span className={priceImpact > 5 ? 'high-impact' : 'low-impact'}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
            )}

            {quote && (
              <div className="detail-row">
                <span>Route</span>
                <span className="route-info">
                  {quote.marketInfos?.length || 1} hop(s) via Jupiter
                </span>
              </div>
            )}
          </div>

          <button 
            className="swap-button" 
            onClick={handleSwap}
            disabled={!publicKey || isLoading || !tokenAAmount || !tokenBAmount || !quote || isQuoteLoading}
          >
            {isLoading ? 'Swapping...' : 
             isQuoteLoading ? 'Getting Quote...' : 
             !quote ? 'Enter Amount' : 
             'Swap Tokens'}
          </button>
        </div>

        <div className="swap-info">
          <p>⚡ Fast Jupiter-powered swaps</p>
          <p>🔒 Secure on-chain execution</p>
          <p>💀 Cult-approved interface</p>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface;

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useJupiter } from '@jup-ag/react-hook';
import { PublicKey } from '@solana/web3.js';
import './SwapInterface.css';

// Token mints for SOL and USDC
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

interface SwapInterfaceProps {
  // Remove unused props - Jupiter handles connection internally
}

const SwapInterface: React.FC<SwapInterfaceProps> = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState('');

  // Set default swap pair: SOL -> USDC
  const [inputMint, setInputMint] = useState(SOL_MINT);
  const [outputMint, setOutputMint] = useState(USDC_MINT);

  // Jupiter hook configuration
  const jupiterConfig = useMemo(() => ({
    amount: inputAmount ? Number(inputAmount) * 1e9 : 0, // Convert to lamports
    inputMint: new PublicKey(inputMint),
    outputMint: new PublicKey(outputMint),
    slippage: 1, // 1% slippage
    debounceTime: 250,
  }), [inputAmount, inputMint, outputMint]);

  // Initialize Jupiter hook
  const {
    routeMap,
    routes,
    loading: routesLoading,
    exchange,
    error: jupiterError,
  } = useJupiter(jupiterConfig);

  // Update output amount when routes change
  useEffect(() => {
    if (routes && routes.length > 0 && routes[0].outAmount) {
      const bestRoute = routes[0];
      const outputInDecimals = bestRoute.outAmount / 1e6; // USDC has 6 decimals
      setOutputAmount(outputInDecimals.toFixed(6));
    } else {
      setOutputAmount('');
    }
  }, [routes]);

  // Handle swap execution
  const handleSwap = async () => {
    if (!publicKey || !sendTransaction || !routes || routes.length === 0) {
      setSwapError('Please connect wallet and enter a valid amount');
      return;
    }

    setIsLoading(true);
    setSwapError('');
    setSwapSuccess('');

    try {
      console.log('🚀 Starting swap execution...');
      
      // Execute swap through Jupiter
      const result = await exchange({
        routeInfo: routes[0],
        userPublicKey: publicKey,
      });

      if (result.txid) {
        setSwapSuccess(`Swap successful! Transaction: ${result.txid}`);
        console.log('✅ Swap completed successfully:', result.txid);
        
        // Reset form
        setInputAmount('');
        setOutputAmount('');
      } else {
        throw new Error('Swap failed - no transaction ID returned');
      }
    } catch (error) {
      console.error('❌ Swap failed:', error);
      setSwapError(`Swap failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Token swap direction handler
  const handleSwapDirection = () => {
    setInputMint(outputMint);
    setOutputMint(inputMint);
    setInputAmount(outputAmount);
    setOutputAmount('');
  };

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

        {swapError && (
          <div className="error-message">
            ⚠️ {swapError}
          </div>
        )}

        {swapSuccess && (
          <div className="success-message">
            ✅ {swapSuccess}
          </div>
        )}

        <div className="swap-form">
          <div className="token-input">
            <label>From</label>
            <div className="input-group">
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
              />
              <div className="token-symbol">
                {inputMint === SOL_MINT ? 'SOL' : 'USDC'}
              </div>
            </div>
          </div>

          <div className="swap-arrow">
            <button onClick={handleSwapDirection}>
              ⇅
            </button>
          </div>

          <div className="token-input">
            <label>To</label>
            <div className="input-group">
              <input
                type="number"
                value={outputAmount}
                readOnly
                placeholder={routesLoading ? 'Loading...' : '0.0'}
                className={routesLoading ? 'loading' : ''}
              />
              <div className="token-symbol">
                {outputMint === SOL_MINT ? 'SOL' : 'USDC'}
              </div>
            </div>
          </div>

          <div className="swap-details">
            <div className="detail-row">
              <span>Slippage Tolerance</span>
              <span>1%</span>
            </div>
            
            {routes && routes.length > 0 && (
              <div className="detail-row">
                <span>Route</span>
                <span className="route-info">
                  {routes[0].marketInfos?.length || 1} hop(s) via Jupiter
                </span>
              </div>
            )}
          </div>

          <button 
            className="swap-button" 
            onClick={handleSwap}
            disabled={!publicKey || isLoading || !inputAmount || !outputAmount || routesLoading}
          >
            {isLoading ? 'Swapping...' : 
             routesLoading ? 'Getting Quote...' : 
             !publicKey ? 'Connect Wallet' :
             !inputAmount ? 'Enter Amount' : 
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

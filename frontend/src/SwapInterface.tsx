import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import './SwapInterface.css';

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

  // Mock token pairs for demo - in production, fetch from API
  const TOKEN_PAIRS = [
    {
      tokenA: { symbol: 'NCTP', mint: '11111111111111111111111111111111' },
      tokenB: { symbol: 'SOL', mint: '22222222222222222222222222222222' }
    },
    {
      tokenA: { symbol: 'USDC', mint: '33333333333333333333333333333333' },
      tokenB: { symbol: 'NCTP', mint: '11111111111111111111111111111111' }
    }
  ];

  const calculateTokenBAmount = (amountA: string) => {
    if (!amountA || isNaN(Number(amountA))) return '';
    
    // Mock price calculation - in production, fetch from Solana RPC
    const mockPrice = 0.85; // 1 NCTP = 0.85 SOL
    const calculatedAmount = Number(amountA) * mockPrice;
    const impact = (Number(amountA) / 1000) * 0.1; // Mock price impact
    
    setPriceImpact(impact);
    return calculatedAmount.toFixed(6);
  };

  const handleTokenAChange = (value: string) => {
    setTokenAAmount(value);
    const calculatedB = calculateTokenBAmount(value);
    setTokenBAmount(calculatedB);
  };

  const handleSwap = async () => {
    if (!publicKey || !program || !tokenAAmount || !tokenBAmount) {
      alert('Please connect wallet and enter amounts');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get pool account
      const [poolPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from('pool'),
          new PublicKey(tokenAMint).toBuffer(),
          new PublicKey(tokenBMint).toBuffer()
        ],
        program.programId
      );

      // Get user token accounts
      const userTokenAAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenAMint),
        publicKey
      );

      const userTokenBAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenBMint),
        publicKey
      );

      // Get vault accounts (these should be fetched from the pool account)
      const vaultAAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenAMint),
        poolPda,
        true
      );

      const vaultBAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenBMint),
        poolPda,
        true
      );

      const amountIn = new BN(Number(tokenAAmount) * 1e9); // Convert to lamports
      const minAmountOut = new BN(Number(tokenBAmount) * 1e9 * (1 - slippage / 100));

      // Execute swap
      const tx = await program.methods
        .swap(amountIn, minAmountOut, true)
        .accounts({
          user: publicKey,
          pool: poolPda,
          userTokenIn: userTokenAAccount,
          userTokenOut: userTokenBAccount,
          vaultIn: vaultAAccount,
          vaultOut: vaultBAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert(`Swap successful! Transaction: ${tx}`);
      
      // Reset form
      setTokenAAmount('');
      setTokenBAmount('');
      
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="swap-interface">
      <div className="swap-container">
        <div className="swap-header">
          <h2>🌙 NocturneSwap</h2>
          <p>Cult-powered token swapping</p>
        </div>

        <div className="wallet-connection">
          <WalletMultiButton />
        </div>

        <div className="swap-form">
          <div className="token-input">
            <label>From</label>
            <div className="input-group">
              <input
                type="number"
                value={tokenAAmount}
                onChange={(e) => handleTokenAChange(e.target.value)}
                placeholder="0.0"
                step="0.000001"
              />
              <select 
                value={tokenAMint} 
                onChange={(e) => setTokenAMint(e.target.value)}
                className="token-select"
              >
                <option value="">Select Token</option>
                {TOKEN_PAIRS.map((pair, index) => (
                  <option key={index} value={pair.tokenA.mint}>
                    {pair.tokenA.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="swap-arrow">
            <button onClick={() => {
              const tempA = tokenAAmount;
              const tempB = tokenBAmount;
              setTokenAAmount(tempB);
              setTokenBAmount(tempA);
            }}>
              ⇅
            </button>
          </div>

          <div className="token-input">
            <label>To</label>
            <div className="input-group">
              <input
                type="number"
                value={tokenBAmount}
                readOnly
                placeholder="0.0"
              />
              <select 
                value={tokenBMint} 
                onChange={(e) => setTokenBMint(e.target.value)}
                className="token-select"
              >
                <option value="">Select Token</option>
                {TOKEN_PAIRS.map((pair, index) => (
                  <option key={index} value={pair.tokenB.mint}>
                    {pair.tokenB.symbol}
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
          </div>

          <button 
            className="swap-button" 
            onClick={handleSwap}
            disabled={!publicKey || isLoading || !tokenAAmount || !tokenBAmount}
          >
            {isLoading ? 'Swapping...' : 'Swap Tokens'}
          </button>
        </div>

        <div className="swap-info">
          <p>⚡ Fast Solana-native swaps</p>
          <p>🔒 Secure smart contract</p>
          <p>💀 Cult-approved interface</p>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface;

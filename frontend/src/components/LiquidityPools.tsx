// LiquidityPools.tsx - Comprehensive liquidity pool interface with cult theme
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { cultSounds } from '../SoundEffects.js';
import './LiquidityPools.css';

interface LiquidityPool {
  id: string;
  tokenA: {
    symbol: string;
    name: string;
    mint: string;
    logoUri?: string;
  };
  tokenB: {
    symbol: string;
    name: string;
    mint: string;
    logoUri?: string;
  };
  apy: number;
  tvl: number;
  volume24h: number;
  fees24h: number;
  userLpBalance: number;
  userLpValue: number;
  poolShare: number;
  isStaked: boolean;
}

interface LiquidityPoolsProps {
  connection: Connection;
  isVisible: boolean;
  onClose: () => void;
}

const LiquidityPools = ({ connection, isVisible, onClose }: LiquidityPoolsProps) => {
  const { publicKey, connected } = useWallet();
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'myPools' | 'stake'>('explore');
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);
  const [showRemoveLiquidity, setShowRemoveLiquidity] = useState(false);
  const [addAmountA, setAddAmountA] = useState('');
  const [addAmountB, setAddAmountB] = useState('');
  const [removePercentage, setRemovePercentage] = useState(25);
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'volume'>('apy');

  // Mock liquidity pools data
  const mockPools: LiquidityPool[] = [
    {
      id: 'sol-usdc',
      tokenA: { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
      tokenB: { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
      apy: 15.4,
      tvl: 125000000,
      volume24h: 8500000,
      fees24h: 25500,
      userLpBalance: 1250.75,
      userLpValue: 1487.23,
      poolShare: 0.0012,
      isStaked: true
    },
    {
      id: 'sol-bonk',
      tokenA: { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
      tokenB: { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
      apy: 45.2,
      tvl: 15000000,
      volume24h: 2100000,
      fees24h: 6300,
      userLpBalance: 0,
      userLpValue: 0,
      poolShare: 0,
      isStaked: false
    },
    {
      id: 'usdc-usdt',
      tokenA: { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
      tokenB: { symbol: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
      apy: 8.7,
      tvl: 85000000,
      volume24h: 12000000,
      fees24h: 36000,
      userLpBalance: 500.25,
      userLpValue: 502.13,
      poolShare: 0.0006,
      isStaked: false
    },
    {
      id: 'sol-wif',
      tokenA: { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
      tokenB: { symbol: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
      apy: 67.8,
      tvl: 8500000,
      volume24h: 1800000,
      fees24h: 5400,
      userLpBalance: 0,
      userLpValue: 0,
      poolShare: 0,
      isStaked: false
    }
  ];

  // Load pools data
  useEffect(() => {
    if (isVisible) {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setPools(mockPools);
        setLoading(false);
      }, 1000);
    }
  }, [isVisible]);

  // Sort pools
  const sortedPools = [...pools].sort((a, b) => {
    switch (sortBy) {
      case 'apy':
        return b.apy - a.apy;
      case 'tvl':
        return b.tvl - a.tvl;
      case 'volume':
        return b.volume24h - a.volume24h;
      default:
        return 0;
    }
  });

  // Filter pools for "My Pools" tab
  const myPools = sortedPools.filter(pool => pool.userLpBalance > 0);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(2)}B`;
    } else if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(2)}M`;
    } else if (amount >= 1e3) {
      return `$${(amount / 1e3).toFixed(2)}K`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const handleAddLiquidity = useCallback(async () => {
    if (!selectedPool || !addAmountA || !addAmountB) {
      await cultSounds.playErrorSound();
      return;
    }

    setLoading(true);
    try {
      // Simulate add liquidity transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update pool data
      const updatedPools = pools.map(pool => {
        if (pool.id === selectedPool.id) {
          return {
            ...pool,
            userLpBalance: pool.userLpBalance + parseFloat(addAmountA) * 0.5,
            userLpValue: pool.userLpValue + parseFloat(addAmountA) * 119.15 + parseFloat(addAmountB),
            poolShare: (pool.userLpBalance + parseFloat(addAmountA) * 0.5) / (pool.tvl / 100000)
          };
        }
        return pool;
      });
      
      setPools(updatedPools);
      setAddAmountA('');
      setAddAmountB('');
      setShowAddLiquidity(false);
      await cultSounds.playRitualCompleteSound();
    } catch (error) {
      console.error('Add liquidity failed:', error);
      await cultSounds.playErrorSound();
    } finally {
      setLoading(false);
    }
  }, [selectedPool, addAmountA, addAmountB, pools]);

  const handleRemoveLiquidity = useCallback(async () => {
    if (!selectedPool || removePercentage <= 0) {
      await cultSounds.playErrorSound();
      return;
    }

    setLoading(true);
    try {
      // Simulate remove liquidity transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update pool data
      const removalRatio = removePercentage / 100;
      const updatedPools = pools.map(pool => {
        if (pool.id === selectedPool.id) {
          return {
            ...pool,
            userLpBalance: pool.userLpBalance * (1 - removalRatio),
            userLpValue: pool.userLpValue * (1 - removalRatio),
            poolShare: pool.poolShare * (1 - removalRatio)
          };
        }
        return pool;
      });
      
      setPools(updatedPools);
      setRemovePercentage(25);
      setShowRemoveLiquidity(false);
      await cultSounds.playRitualCompleteSound();
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      await cultSounds.playErrorSound();
    } finally {
      setLoading(false);
    }
  }, [selectedPool, removePercentage, pools]);

  const handleStakeLP = useCallback(async (pool: LiquidityPool) => {
    if (pool.userLpBalance <= 0) {
      await cultSounds.playErrorSound();
      return;
    }

    setLoading(true);
    try {
      // Simulate stake transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update pool staking status
      const updatedPools = pools.map(p => 
        p.id === pool.id ? { ...p, isStaked: true } : p
      );
      
      setPools(updatedPools);
      await cultSounds.playConnectSound();
    } catch (error) {
      console.error('Staking failed:', error);
      await cultSounds.playErrorSound();
    } finally {
      setLoading(false);
    }
  }, [pools]);

  const handleUnstakeLP = useCallback(async (pool: LiquidityPool) => {
    if (!pool.isStaked) {
      await cultSounds.playErrorSound();
      return;
    }

    setLoading(true);
    try {
      // Simulate unstake transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update pool staking status
      const updatedPools = pools.map(p => 
        p.id === pool.id ? { ...p, isStaked: false } : p
      );
      
      setPools(updatedPools);
      await cultSounds.playHoverSound();
    } catch (error) {
      console.error('Unstaking failed:', error);
      await cultSounds.playErrorSound();
    } finally {
      setLoading(false);
    }
  }, [pools]);

  if (!isVisible) return null;

  return (
    <div className="liquidity-pools-overlay">
      <div className="liquidity-pools-modal">
        <div className="pools-header">
          <h3>💧 Nocturne Liquidity Pools</h3>
          <button 
            className="pools-close"
            onClick={async () => {
              await cultSounds.playHoverSound();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {!connected ? (
          <div className="pools-connect">
            <p>🔗 Connect your wallet to interact with liquidity pools</p>
          </div>
        ) : (
          <>
            <div className="pools-tabs">
              <button
                className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('explore');
                  await cultSounds.playHoverSound();
                }}
              >
                🔍 Explore Pools
              </button>
              <button
                className={`tab-btn ${activeTab === 'myPools' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('myPools');
                  await cultSounds.playHoverSound();
                }}
              >
                💰 My Pools ({myPools.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'stake' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('stake');
                  await cultSounds.playHoverSound();
                }}
              >
                ⚡ LP Staking
              </button>
            </div>

            <div className="pools-controls">
              <div className="sort-controls">
                <label>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'apy' | 'tvl' | 'volume')}
                  className="sort-select"
                >
                  <option value="apy">APY</option>
                  <option value="tvl">TVL</option>
                  <option value="volume">Volume</option>
                </select>
              </div>
            </div>

            <div className="pools-content">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>Loading pools data...</span>
                </div>
              ) : (
                <div className="pools-list">
                  {(activeTab === 'myPools' ? myPools : sortedPools).map((pool) => (
                    <div key={pool.id} className="pool-card">
                      <div className="pool-header">
                        <div className="pool-tokens">
                          <span className="token-pair">
                            {pool.tokenA.symbol}/{pool.tokenB.symbol}
                          </span>
                          <span className="pool-names">
                            {pool.tokenA.name} • {pool.tokenB.name}
                          </span>
                        </div>
                        <div className="pool-apy">
                          <span className="apy-label">APY</span>
                          <span className="apy-value">{formatPercentage(pool.apy)}</span>
                        </div>
                      </div>

                      <div className="pool-stats">
                        <div className="stat-item">
                          <span className="stat-label">TVL</span>
                          <span className="stat-value">{formatCurrency(pool.tvl)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">24h Volume</span>
                          <span className="stat-value">{formatCurrency(pool.volume24h)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">24h Fees</span>
                          <span className="stat-value">{formatCurrency(pool.fees24h)}</span>
                        </div>
                      </div>

                      {pool.userLpBalance > 0 && (
                        <div className="user-position">
                          <div className="position-header">Your Position</div>
                          <div className="position-stats">
                            <div className="position-item">
                              <span>LP Tokens: {pool.userLpBalance.toFixed(6)}</span>
                              <span>Value: {formatCurrency(pool.userLpValue)}</span>
                            </div>
                            <div className="position-item">
                              <span>Pool Share: {formatPercentage(pool.poolShare)}</span>
                              <span className={`stake-status ${pool.isStaked ? 'staked' : 'unstaked'}`}>
                                {pool.isStaked ? '⚡ Staked' : '⏸️ Unstaked'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pool-actions">
                        <button
                          className="action-btn add-liquidity"
                          onClick={async () => {
                            setSelectedPool(pool);
                            setShowAddLiquidity(true);
                            await cultSounds.playHoverSound();
                          }}
                        >
                          ➕ Add Liquidity
                        </button>

                        {pool.userLpBalance > 0 && (
                          <>
                            <button
                              className="action-btn remove-liquidity"
                              onClick={async () => {
                                setSelectedPool(pool);
                                setShowRemoveLiquidity(true);
                                await cultSounds.playHoverSound();
                              }}
                            >
                              ➖ Remove
                            </button>

                            {pool.isStaked ? (
                              <button
                                className="action-btn unstake"
                                onClick={() => handleUnstakeLP(pool)}
                                disabled={loading}
                              >
                                ⏸️ Unstake
                              </button>
                            ) : (
                              <button
                                className="action-btn stake"
                                onClick={() => handleStakeLP(pool)}
                                disabled={loading}
                              >
                                ⚡ Stake LP
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Liquidity Modal */}
      {showAddLiquidity && selectedPool && (
        <div className="liquidity-action-modal">
          <div className="action-modal-content">
            <div className="action-header">
              <h4>➕ Add Liquidity to {selectedPool.tokenA.symbol}/{selectedPool.tokenB.symbol}</h4>
              <button onClick={() => setShowAddLiquidity(false)}>✕</button>
            </div>
            
            <div className="input-section">
              <div className="token-input">
                <label>{selectedPool.tokenA.symbol} Amount</label>
                <input
                  type="number"
                  value={addAmountA}
                  onChange={(e) => setAddAmountA(e.target.value)}
                  placeholder="0.0"
                  step="0.000001"
                />
              </div>
              
              <div className="plus-divider">+</div>
              
              <div className="token-input">
                <label>{selectedPool.tokenB.symbol} Amount</label>
                <input
                  type="number"
                  value={addAmountB}
                  onChange={(e) => setAddAmountB(e.target.value)}
                  placeholder="0.0"
                  step="0.000001"
                />
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="confirm-btn"
                onClick={handleAddLiquidity}
                disabled={loading || !addAmountA || !addAmountB}
              >
                {loading ? '⏳ Adding...' : '✨ Add Liquidity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Liquidity Modal */}
      {showRemoveLiquidity && selectedPool && (
        <div className="liquidity-action-modal">
          <div className="action-modal-content">
            <div className="action-header">
              <h4>➖ Remove Liquidity from {selectedPool.tokenA.symbol}/{selectedPool.tokenB.symbol}</h4>
              <button onClick={() => setShowRemoveLiquidity(false)}>✕</button>
            </div>
            
            <div className="percentage-section">
              <label>Remove Percentage: {removePercentage}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={removePercentage}
                onChange={(e) => setRemovePercentage(parseInt(e.target.value))}
                className="percentage-slider"
              />
              <div className="percentage-buttons">
                {[25, 50, 75, 100].map(percent => (
                  <button
                    key={percent}
                    className={`percent-btn ${removePercentage === percent ? 'active' : ''}`}
                    onClick={() => setRemovePercentage(percent)}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            <div className="removal-preview">
              <div>You will receive approximately:</div>
              <div className="token-amounts">
                <span>{((selectedPool.userLpBalance * removePercentage / 100) * 2).toFixed(6)} {selectedPool.tokenA.symbol}</span>
                <span>{((selectedPool.userLpValue * removePercentage / 100) * 0.5).toFixed(2)} {selectedPool.tokenB.symbol}</span>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="confirm-btn remove"
                onClick={handleRemoveLiquidity}
                disabled={loading}
              >
                {loading ? '⏳ Removing...' : '🔥 Remove Liquidity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidityPools;

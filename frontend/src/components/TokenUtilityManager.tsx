// TokenUtilityManager.tsx - NCTP token utility and access control system
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { cultSounds } from '../SoundEffects.js';
import './TokenUtilityManager.css';

interface TokenUtilityProps {
  connection: Connection;
  onAccessChange?: (hasAccess: boolean, tier: string) => void;
}

interface NCTPBalance {
  balance: number;
  tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  features: string[];
  multiplier: number;
}

interface UtilityFeature {
  name: string;
  description: string;
  requiredBalance: number;
  tier: string;
  icon: string;
  enabled: boolean;
}

const NCTP_MINT = 'NCTPTokenMintAddressPlaceholder'; // In production, use real NCTP mint
const UTILITY_TIERS = {
  none: { min: 0, max: 999, multiplier: 1.0, color: '#666666' },
  bronze: { min: 1000, max: 4999, multiplier: 1.1, color: '#cd7f32' },
  silver: { min: 5000, max: 19999, multiplier: 1.25, color: '#c0c0c0' },
  gold: { min: 20000, max: 49999, multiplier: 1.5, color: '#ffd700' },
  platinum: { min: 50000, max: 99999, multiplier: 2.0, color: '#e5e4e2' },
  diamond: { min: 100000, max: Infinity, multiplier: 3.0, color: '#b9f2ff' }
};

const UTILITY_FEATURES: UtilityFeature[] = [
  {
    name: 'Basic Swap',
    description: 'Standard token swapping',
    requiredBalance: 0,
    tier: 'none',
    icon: '🔄',
    enabled: true
  },
  {
    name: 'Price Alerts',
    description: 'Set custom price alerts',
    requiredBalance: 1000,
    tier: 'bronze',
    icon: '🔔',
    enabled: false
  },
  {
    name: 'Advanced Charts',
    description: 'Access to TradingView charts',
    requiredBalance: 1000,
    tier: 'bronze',
    icon: '📈',
    enabled: false
  },
  {
    name: 'Portfolio Analytics',
    description: 'Detailed portfolio insights',
    requiredBalance: 5000,
    tier: 'silver',
    icon: '📊',
    enabled: false
  },
  {
    name: 'Limit Orders',
    description: 'Set limit orders',
    requiredBalance: 5000,
    tier: 'silver',
    icon: '🎯',
    enabled: false
  },
  {
    name: 'DCA Strategies',
    description: 'Dollar-cost averaging',
    requiredBalance: 20000,
    tier: 'gold',
    icon: '⚡',
    enabled: false
  },
  {
    name: 'Governance Voting',
    description: 'Vote on protocol changes',
    requiredBalance: 20000,
    tier: 'gold',
    icon: '🗳️',
    enabled: false
  },
  {
    name: 'Fee Discounts',
    description: 'Reduced trading fees',
    requiredBalance: 50000,
    tier: 'platinum',
    icon: '💎',
    enabled: false
  },
  {
    name: 'Priority Support',
    description: 'Premium customer support',
    requiredBalance: 50000,
    tier: 'platinum',
    icon: '🎧',
    enabled: false
  },
  {
    name: 'VIP Access',
    description: 'Early access to new features',
    requiredBalance: 100000,
    tier: 'diamond',
    icon: '👑',
    enabled: false
  }
];

const TokenUtilityManager: React.FC<TokenUtilityProps> = ({ connection, onAccessChange }) => {
  const { publicKey, connected } = useWallet();
  const [nctpBalance, setNctpBalance] = useState<NCTPBalance>({
    balance: 0,
    tier: 'none',
    features: [],
    multiplier: 1.0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [simulationMode, setSimulationMode] = useState(true); // For demo purposes
  const [simulatedBalance, setSimulatedBalance] = useState(0);

  // Calculate tier based on balance
  const calculateTier = useCallback((balance: number): keyof typeof UTILITY_TIERS => {
    for (const [tier, config] of Object.entries(UTILITY_TIERS)) {
      if (balance >= config.min && balance <= config.max) {
        return tier as keyof typeof UTILITY_TIERS;
      }
    }
    return 'none';
  }, []);

  // Get enabled features based on balance
  const getEnabledFeatures = useCallback((balance: number): string[] => {
    return UTILITY_FEATURES
      .filter(feature => balance >= feature.requiredBalance)
      .map(feature => feature.name);
  }, []);

  // Fetch NCTP balance (simulated for demo)
  const fetchNCTPBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setNctpBalance({
        balance: 0,
        tier: 'none',
        features: [],
        multiplier: 1.0
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let balance = 0;
      
      if (simulationMode) {
        // Use simulated balance for demo
        balance = simulatedBalance;
      } else {
        // In production, fetch real NCTP balance
        // const tokenAccounts = await connection.getTokenAccountsByOwner(
        //   publicKey,
        //   { mint: new PublicKey(NCTP_MINT) }
        // );
        // 
        // if (tokenAccounts.value.length > 0) {
        //   const tokenBalance = await connection.getTokenAccountBalance(
        //     tokenAccounts.value[0].pubkey
        //   );
        //   balance = tokenBalance.value.uiAmount || 0;
        // }
        
        // Mock balance for demo
        balance = Math.floor(Math.random() * 150000);
      }

      const tier = calculateTier(balance);
      const features = getEnabledFeatures(balance);
      const multiplier = UTILITY_TIERS[tier].multiplier;

      const newBalance: NCTPBalance = {
        balance,
        tier,
        features,
        multiplier
      };

      setNctpBalance(newBalance);

      // Notify parent component of access changes
      if (onAccessChange) {
        onAccessChange(balance > 0, tier);
      }

      // Play sound effect
      if (cultSounds && balance > 0) {
        cultSounds.playUtilityUnlock();
      }

    } catch (error) {
      console.error('Failed to fetch NCTP balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, connection, simulationMode, simulatedBalance, calculateTier, getEnabledFeatures, onAccessChange]);

  // Effect to fetch balance when wallet connects
  useEffect(() => {
    fetchNCTPBalance();
  }, [fetchNCTPBalance]);

  // Check if user has access to a feature
  const hasAccess = useCallback((featureName: string): boolean => {
    return nctpBalance.features.includes(featureName);
  }, [nctpBalance.features]);

  // Get tier color
  const getTierColor = (tier: string): string => {
    return UTILITY_TIERS[tier as keyof typeof UTILITY_TIERS]?.color || '#666666';
  };

  // Format balance display
  const formatBalance = (balance: number): string => {
    if (balance >= 1000000) return `${(balance / 1000000).toFixed(1)}M`;
    if (balance >= 1000) return `${(balance / 1000).toFixed(1)}K`;
    return balance.toFixed(0);
  };

  // Simulate balance change (for demo)
  const simulateBalanceChange = (newBalance: number) => {
    setSimulatedBalance(newBalance);
    setTimeout(() => {
      fetchNCTPBalance();
    }, 100);
  };

  return (
    <>
      {/* NCTP Balance Display */}
      <div className="nctp-balance-widget">
        <div className="balance-header">
          <div className="balance-info">
            <div className="balance-amount">
              {formatBalance(nctpBalance.balance)} NCTP
            </div>
            <div 
              className="balance-tier"
              style={{ color: getTierColor(nctpBalance.tier) }}
            >
              {nctpBalance.tier.toUpperCase()} TIER
            </div>
          </div>
          <button 
            className="utility-info-btn"
            onClick={() => setShowUtilityModal(true)}
            title="View NCTP Utility"
          >
            💎
          </button>
        </div>
        
        {isLoading && (
          <div className="balance-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {/* Utility Modal */}
      {showUtilityModal && (
        <div className="utility-modal-overlay" onClick={() => setShowUtilityModal(false)}>
          <div className="utility-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🌙 NCTP Token Utility</h2>
              <button 
                className="close-modal"
                onClick={() => setShowUtilityModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {/* Current Status */}
              <div className="current-status">
                <div className="status-card">
                  <div className="status-balance">
                    {formatBalance(nctpBalance.balance)} NCTP
                  </div>
                  <div 
                    className="status-tier"
                    style={{ color: getTierColor(nctpBalance.tier) }}
                  >
                    {nctpBalance.tier.toUpperCase()} TIER
                  </div>
                  <div className="status-multiplier">
                    {nctpBalance.multiplier}x Fee Multiplier
                  </div>
                </div>

                {simulationMode && (
                  <div className="simulation-controls">
                    <h4>Demo Mode - Simulate Balance:</h4>
                    <div className="simulation-buttons">
                      {[0, 1000, 5000, 20000, 50000, 100000].map(amount => (
                        <button 
                          key={amount}
                          className={`sim-btn ${simulatedBalance === amount ? 'active' : ''}`}
                          onClick={() => simulateBalanceChange(amount)}
                        >
                          {formatBalance(amount)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tier Breakdown */}
              <div className="tier-breakdown">
                <h3>💎 Tier Benefits</h3>
                <div className="tier-grid">
                  {Object.entries(UTILITY_TIERS).map(([tier, config]) => (
                    <div 
                      key={tier}
                      className={`tier-item ${nctpBalance.tier === tier ? 'current' : ''}`}
                      style={{ borderColor: config.color }}
                    >
                      <div className="tier-name" style={{ color: config.color }}>
                        {tier.toUpperCase()}
                      </div>
                      <div className="tier-requirement">
                        {config.min === 0 ? 'No requirement' : `${formatBalance(config.min)}+ NCTP`}
                      </div>
                      <div className="tier-multiplier">
                        {config.multiplier}x Multiplier
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Access */}
              <div className="feature-access">
                <h3>🚀 Feature Access</h3>
                <div className="features-grid">
                  {UTILITY_FEATURES.map((feature) => {
                    const userHasAccess = hasAccess(feature.name);
                    return (
                      <div 
                        key={feature.name}
                        className={`feature-item ${userHasAccess ? 'unlocked' : 'locked'}`}
                      >
                        <div className="feature-icon">{feature.icon}</div>
                        <div className="feature-info">
                          <div className="feature-name">{feature.name}</div>
                          <div className="feature-description">{feature.description}</div>
                          <div className="feature-requirement">
                            {feature.requiredBalance === 0 ? 
                              'Free' : 
                              `Requires ${formatBalance(feature.requiredBalance)} NCTP`
                            }
                          </div>
                        </div>
                        <div className="feature-status">
                          {userHasAccess ? '✅' : '🔒'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How to Get NCTP */}
              <div className="how-to-get">
                <h3>💰 How to Get NCTP</h3>
                <div className="acquisition-methods">
                  <div className="method">
                    <div className="method-icon">💸</div>
                    <div className="method-info">
                      <div className="method-name">Trade & Earn</div>
                      <div className="method-description">Earn NCTP rewards for trading volume</div>
                    </div>
                  </div>
                  <div className="method">
                    <div className="method-icon">🏊</div>
                    <div className="method-info">
                      <div className="method-name">Liquidity Mining</div>
                      <div className="method-description">Provide liquidity to earn NCTP</div>
                    </div>
                  </div>
                  <div className="method">
                    <div className="method-icon">🗳️</div>
                    <div className="method-info">
                      <div className="method-name">Governance</div>
                      <div className="method-description">Participate in governance to earn rewards</div>
                    </div>
                  </div>
                  <div className="method">
                    <div className="method-icon">🎁</div>
                    <div className="method-info">
                      <div className="method-name">Referrals</div>
                      <div className="method-description">Refer friends to earn NCTP bonuses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TokenUtilityManager;

// Export utility functions for use in other components
export const useNCTPUtility = (connection: Connection) => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);
  const [tier, setTier] = useState<keyof typeof UTILITY_TIERS>('none');

  const checkAccess = useCallback((featureName: string): boolean => {
    const feature = UTILITY_FEATURES.find(f => f.name === featureName);
    return feature ? balance >= feature.requiredBalance : false;
  }, [balance]);

  const getMultiplier = useCallback((): number => {
    return UTILITY_TIERS[tier].multiplier;
  }, [tier]);

  return {
    balance,
    tier,
    checkAccess,
    getMultiplier,
    isConnected: connected && !!publicKey
  };
};

import React, { useState, useEffect } from 'react';
import './TokenUtilityManager.css';

interface TokenUtility {
  id: string;
  name: string;
  description: string;
  type: 'staking' | 'governance' | 'fee_discount' | 'access' | 'rewards' | 'burn';
  isActive: boolean;
  requirements: {
    minBalance: number;
    stakingPeriod?: number;
    tier?: string;
  };
  benefits: string[];
  metrics: {
    totalUsers: number;
    totalTokensLocked: number;
    apr?: number;
    successRate?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface StakingPool {
  id: string;
  name: string;
  tokenSymbol: string;
  apr: number;
  totalStaked: number;
  minStake: number;
  lockPeriod: number;
  isActive: boolean;
  maxStakers: number;
  currentStakers: number;
}

interface FeeStructure {
  tier: string;
  minBalance: number;
  tradingFeeDiscount: number;
  liquidityFeeDiscount: number;
  withdrawalFeeDiscount: number;
  color: string;
}

const TokenUtilityManager: React.FC = () => {
  const [utilities, setUtilities] = useState<TokenUtility[]>([]);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([]);
  const [selectedUtility, setSelectedUtility] = useState<TokenUtility | null>(null);
  const [showCreateUtility, setShowCreateUtility] = useState(false);
  const [activeTab, setActiveTab] = useState<'utilities' | 'staking' | 'fees' | 'analytics'>('utilities');

  useEffect(() => {
    loadUtilityData();
  }, []);

  const loadUtilityData = () => {
    // Mock token utilities
    const mockUtilities: TokenUtility[] = [
      {
        id: 'util-001',
        name: 'Premium Trading Access',
        description: 'Access to advanced trading features and priority execution',
        type: 'access',
        isActive: true,
        requirements: {
          minBalance: 1000,
          tier: 'premium'
        },
        benefits: ['Advanced charts', 'Priority execution', 'Exclusive signals', 'Reduced slippage'],
        metrics: {
          totalUsers: 2456,
          totalTokensLocked: 2456000,
          successRate: 98.5
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'util-002',
        name: 'Governance Voting Power',
        description: 'Stake tokens to gain voting power in platform governance',
        type: 'governance',
        isActive: true,
        requirements: {
          minBalance: 500,
          stakingPeriod: 30
        },
        benefits: ['Voting rights', 'Proposal creation', 'Fee revenue sharing', 'Priority support'],
        metrics: {
          totalUsers: 8923,
          totalTokensLocked: 15680000,
          apr: 12.5
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'util-003',
        name: 'Fee Discount Tiers',
        description: 'Reduce trading fees based on token holdings',
        type: 'fee_discount',
        isActive: true,
        requirements: {
          minBalance: 100
        },
        benefits: ['Up to 50% fee reduction', 'Tiered benefits', 'Compound savings', 'VIP status'],
        metrics: {
          totalUsers: 15234,
          totalTokensLocked: 8950000,
          successRate: 99.2
        },
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'util-004',
        name: 'Liquidity Mining Rewards',
        description: 'Earn additional rewards for providing liquidity',
        type: 'rewards',
        isActive: true,
        requirements: {
          minBalance: 250,
          stakingPeriod: 14
        },
        benefits: ['Extra yield', 'Token airdrops', 'Early access', 'Compounding rewards'],
        metrics: {
          totalUsers: 5678,
          totalTokensLocked: 12340000,
          apr: 18.7
        },
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Mock staking pools
    const mockStakingPools: StakingPool[] = [
      {
        id: 'pool-001',
        name: 'NOCTURNE Governance Pool',
        tokenSymbol: 'NOCTURNE',
        apr: 15.5,
        totalStaked: 5680000,
        minStake: 100,
        lockPeriod: 30,
        isActive: true,
        maxStakers: 10000,
        currentStakers: 7234
      },
      {
        id: 'pool-002',
        name: 'Premium Access Pool',
        tokenSymbol: 'NOCTURNE',
        apr: 12.0,
        totalStaked: 2340000,
        minStake: 500,
        lockPeriod: 90,
        isActive: true,
        maxStakers: 5000,
        currentStakers: 2456
      },
      {
        id: 'pool-003',
        name: 'Long-term Holders Pool',
        tokenSymbol: 'NOCTURNE',
        apr: 22.5,
        totalStaked: 8950000,
        minStake: 1000,
        lockPeriod: 365,
        isActive: true,
        maxStakers: 2500,
        currentStakers: 1834
      }
    ];

    // Mock fee structure
    const mockFeeStructure: FeeStructure[] = [
      {
        tier: 'Bronze',
        minBalance: 0,
        tradingFeeDiscount: 0,
        liquidityFeeDiscount: 0,
        withdrawalFeeDiscount: 0,
        color: '#CD7F32'
      },
      {
        tier: 'Silver',
        minBalance: 100,
        tradingFeeDiscount: 10,
        liquidityFeeDiscount: 5,
        withdrawalFeeDiscount: 0,
        color: '#C0C0C0'
      },
      {
        tier: 'Gold',
        minBalance: 500,
        tradingFeeDiscount: 25,
        liquidityFeeDiscount: 15,
        withdrawalFeeDiscount: 10,
        color: '#FFD700'
      },
      {
        tier: 'Platinum',
        minBalance: 2500,
        tradingFeeDiscount: 40,
        liquidityFeeDiscount: 30,
        withdrawalFeeDiscount: 25,
        color: '#E5E4E2'
      },
      {
        tier: 'Diamond',
        minBalance: 10000,
        tradingFeeDiscount: 50,
        liquidityFeeDiscount: 45,
        withdrawalFeeDiscount: 40,
        color: '#9d4edd'
      }
    ];

    setUtilities(mockUtilities);
    setStakingPools(mockStakingPools);
    setFeeStructure(mockFeeStructure);
  };

  const getUtilityIcon = (type: string) => {
    switch (type) {
      case 'staking': return '🔒';
      case 'governance': return '🏛️';
      case 'fee_discount': return '💰';
      case 'access': return '🔑';
      case 'rewards': return '🎁';
      case 'burn': return '🔥';
      default: return '⚡';
    }
  };

  const getUtilityColor = (type: string) => {
    switch (type) {
      case 'staking': return '#4ade80';
      case 'governance': return '#9d4edd';
      case 'fee_discount': return '#fbbf24';
      case 'access': return '#3b82f6';
      case 'rewards': return '#f59e0b';
      case 'burn': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const toggleUtility = (utilityId: string) => {
    setUtilities(prev => prev.map(utility => 
      utility.id === utilityId 
        ? { ...utility, isActive: !utility.isActive, updatedAt: new Date().toISOString() }
        : utility
    ));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="token-utility-manager">
      <div className="utility-header">
        <div className="header-content">
          <h1 className="ember-glow">⚡ Token Utility Manager</h1>
          <p>Configure and manage NOCTURNE token utilities and benefits</p>
        </div>
        <button 
          className="glow-btn"
          onClick={() => setShowCreateUtility(true)}
        >
          Create Utility
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="utility-tabs">
        {(['utilities', 'staking', 'fees', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'utilities' && '⚡ Utilities'}
            {tab === 'staking' && '🔒 Staking'}
            {tab === 'fees' && '💰 Fee Structure'}
            {tab === 'analytics' && '📊 Analytics'}
          </button>
        ))}
      </div>

      {/* Utilities Tab */}
      {activeTab === 'utilities' && (
        <div className="utilities-content">
          <div className="utilities-grid">
            {utilities.map(utility => (
              <div key={utility.id} className="utility-card holo-card">
                <div className="utility-header">
                  <div className="utility-icon-name">
                    <span 
                      className="utility-icon"
                      style={{ color: getUtilityColor(utility.type) }}
                    >
                      {getUtilityIcon(utility.type)}
                    </span>
                    <div className="utility-info">
                      <h3>{utility.name}</h3>
                      <span className={`utility-type ${utility.type}`}>
                        {utility.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="utility-status">
                    <button
                      className={`status-toggle ${utility.isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleUtility(utility.id)}
                    >
                      {utility.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <div className="utility-description">
                  {utility.description}
                </div>

                <div className="utility-requirements">
                  <h4>Requirements:</h4>
                  <div className="requirement-item">
                    <span>Min Balance:</span>
                    <span>{formatNumber(utility.requirements.minBalance)} NOCTURNE</span>
                  </div>
                  {utility.requirements.stakingPeriod && (
                    <div className="requirement-item">
                      <span>Staking Period:</span>
                      <span>{utility.requirements.stakingPeriod} days</span>
                    </div>
                  )}
                  {utility.requirements.tier && (
                    <div className="requirement-item">
                      <span>Tier:</span>
                      <span>{utility.requirements.tier}</span>
                    </div>
                  )}
                </div>

                <div className="utility-benefits">
                  <h4>Benefits:</h4>
                  <div className="benefits-list">
                    {utility.benefits.map((benefit, index) => (
                      <span key={index} className="benefit-tag">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="utility-metrics">
                  <div className="metric-item">
                    <span>Users:</span>
                    <span>{formatNumber(utility.metrics.totalUsers)}</span>
                  </div>
                  <div className="metric-item">
                    <span>Tokens Locked:</span>
                    <span>{formatNumber(utility.metrics.totalTokensLocked)}</span>
                  </div>
                  {utility.metrics.apr && (
                    <div className="metric-item">
                      <span>APR:</span>
                      <span className="apr">{utility.metrics.apr}%</span>
                    </div>
                  )}
                </div>

                <div className="utility-actions">
                  <button
                    className="edit-btn"
                    onClick={() => setSelectedUtility(utility)}
                  >
                    Edit
                  </button>
                  <button className="view-details-btn">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staking Tab */}
      {activeTab === 'staking' && (
        <div className="staking-content">
          <div className="staking-pools">
            {stakingPools.map(pool => (
              <div key={pool.id} className="staking-pool-card holo-card">
                <div className="pool-header">
                  <div className="pool-info">
                    <h3>{pool.name}</h3>
                    <span className="pool-token">{pool.tokenSymbol}</span>
                  </div>
                  <div className="pool-apr">
                    <span className="apr-label">APR</span>
                    <span className="apr-value">{pool.apr}%</span>
                  </div>
                </div>

                <div className="pool-stats">
                  <div className="stat-item">
                    <span>Total Staked:</span>
                    <span>{formatNumber(pool.totalStaked)} {pool.tokenSymbol}</span>
                  </div>
                  <div className="stat-item">
                    <span>Min Stake:</span>
                    <span>{formatNumber(pool.minStake)} {pool.tokenSymbol}</span>
                  </div>
                  <div className="stat-item">
                    <span>Lock Period:</span>
                    <span>{pool.lockPeriod} days</span>
                  </div>
                  <div className="stat-item">
                    <span>Stakers:</span>
                    <span>{formatNumber(pool.currentStakers)} / {formatNumber(pool.maxStakers)}</span>
                  </div>
                </div>

                <div className="pool-utilization">
                  <div className="utilization-label">
                    Pool Utilization: {((pool.currentStakers / pool.maxStakers) * 100).toFixed(1)}%
                  </div>
                  <div className="utilization-bar">
                    <div 
                      className="utilization-fill"
                      style={{ width: `${(pool.currentStakers / pool.maxStakers) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pool-actions">
                  <button className="manage-btn">Manage Pool</button>
                  <button 
                    className={`toggle-pool-btn ${pool.isActive ? 'active' : 'inactive'}`}
                  >
                    {pool.isActive ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee Structure Tab */}
      {activeTab === 'fees' && (
        <div className="fees-content">
          <div className="fee-tiers">
            {feeStructure.map(tier => (
              <div key={tier.tier} className="fee-tier-card holo-card">
                <div className="tier-header">
                  <div 
                    className="tier-icon"
                    style={{ color: tier.color }}
                  >
                    💎
                  </div>
                  <div className="tier-info">
                    <h3 style={{ color: tier.color }}>{tier.tier}</h3>
                    <span className="tier-requirement">
                      {formatNumber(tier.minBalance)} NOCTURNE minimum
                    </span>
                  </div>
                </div>

                <div className="tier-benefits">
                  <div className="benefit-item">
                    <span>Trading Fee Discount:</span>
                    <span className="discount-value">{tier.tradingFeeDiscount}%</span>
                  </div>
                  <div className="benefit-item">
                    <span>Liquidity Fee Discount:</span>
                    <span className="discount-value">{tier.liquidityFeeDiscount}%</span>
                  </div>
                  <div className="benefit-item">
                    <span>Withdrawal Fee Discount:</span>
                    <span className="discount-value">{tier.withdrawalFeeDiscount}%</span>
                  </div>
                </div>

                <div className="tier-actions">
                  <button className="edit-tier-btn">Edit Tier</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <div className="analytics-grid">
            <div className="analytics-card holo-card">
              <h3 className="ember-glow">Token Distribution</h3>
              <div className="distribution-stats">
                <div className="stat-row">
                  <span>Total Supply:</span>
                  <span>100M NOCTURNE</span>
                </div>
                <div className="stat-row">
                  <span>Circulating:</span>
                  <span>67.5M NOCTURNE</span>
                </div>
                <div className="stat-row">
                  <span>Staked:</span>
                  <span>23.2M NOCTURNE (34.4%)</span>
                </div>
                <div className="stat-row">
                  <span>In Utilities:</span>
                  <span>15.8M NOCTURNE (23.4%)</span>
                </div>
              </div>
            </div>

            <div className="analytics-card holo-card">
              <h3 className="ember-glow">Utility Performance</h3>
              <div className="performance-metrics">
                <div className="metric-row">
                  <span>Total Utility Users:</span>
                  <span>32.3K</span>
                </div>
                <div className="metric-row">
                  <span>Average Stake Duration:</span>
                  <span>127 days</span>
                </div>
                <div className="metric-row">
                  <span>Utility Adoption Rate:</span>
                  <span>78.9%</span>
                </div>
                <div className="metric-row">
                  <span>Fee Savings Generated:</span>
                  <span>$2.4M</span>
                </div>
              </div>
            </div>

            <div className="analytics-card holo-card">
              <h3 className="ember-glow">Revenue Impact</h3>
              <div className="revenue-stats">
                <div className="stat-row">
                  <span>Monthly Staking Revenue:</span>
                  <span>$156K</span>
                </div>
                <div className="stat-row">
                  <span>Utility Access Fees:</span>
                  <span>$89K</span>
                </div>
                <div className="stat-row">
                  <span>Governance Participation:</span>
                  <span>$34K</span>
                </div>
                <div className="stat-row total">
                  <span>Total Monthly Revenue:</span>
                  <span>$279K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenUtilityManager;

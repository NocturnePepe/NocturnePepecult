import React, { useState, useEffect } from 'react';
import './BridgeProtocols.css';

interface BridgeProtocol {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  website: string;
  type: 'lock-mint' | 'liquidity' | 'optimistic' | 'zk-proof';
  supportedChains: string[];
  supportedAssets: string[];
  fees: {
    fixed: number;
    percentage: number;
  };
  bridgeTime: {
    min: number;
    max: number;
  };
  security: {
    audited: boolean;
    tvl: number;
    incidents: number;
    lastAudit: string;
  };
  features: string[];
  status: 'active' | 'maintenance' | 'deprecated';
}

interface BridgeStats {
  protocolId: string;
  volume24h: number;
  volumeWeek: number;
  transactions24h: number;
  averageBridgeTime: number;
  successRate: number;
  activeRoutes: number;
}

const BridgeProtocols: React.FC = () => {
  const [protocols] = useState<BridgeProtocol[]>([
    {
      id: 'wormhole',
      name: 'Wormhole',
      icon: '🌀',
      color: '#8B5CF6',
      description: 'Cross-chain protocol for transferring tokens and messages between blockchains',
      website: 'https://wormhole.com',
      type: 'lock-mint',
      supportedChains: ['solana', 'ethereum', 'bsc', 'polygon', 'avalanche', 'arbitrum'],
      supportedAssets: ['SOL', 'ETH', 'USDC', 'USDT', 'BNB', 'MATIC', 'AVAX'],
      fees: { fixed: 0, percentage: 0.1 },
      bridgeTime: { min: 5, max: 15 },
      security: {
        audited: true,
        tvl: 500000000,
        incidents: 1,
        lastAudit: '2024-01-15'
      },
      features: ['Message Passing', 'NFT Support', 'Multi-Chain', 'Fast Finality'],
      status: 'active'
    },
    {
      id: 'allbridge',
      name: 'Allbridge',
      icon: '🌉',
      color: '#00D4FF',
      description: 'Simple, modern, and reliable way to transfer assets between blockchains',
      website: 'https://allbridge.io',
      type: 'liquidity',
      supportedChains: ['solana', 'ethereum', 'bsc', 'polygon', 'avalanche'],
      supportedAssets: ['SOL', 'ETH', 'USDC', 'USDT', 'BNB', 'MATIC', 'AVAX'],
      fees: { fixed: 0, percentage: 0.3 },
      bridgeTime: { min: 2, max: 8 },
      security: {
        audited: true,
        tvl: 150000000,
        incidents: 0,
        lastAudit: '2024-02-20'
      },
      features: ['Liquidity Pools', 'Low Fees', 'Fast Transfers', 'Stablecoin Focus'],
      status: 'active'
    },
    {
      id: 'portal',
      name: 'Portal Token Bridge',
      icon: '🌌',
      color: '#FF6B6B',
      description: 'Powered by Wormhole, Portal connects blockchains to enable cross-chain transfers',
      website: 'https://portalbridge.com',
      type: 'lock-mint',
      supportedChains: ['solana', 'ethereum', 'bsc', 'polygon', 'avalanche', 'arbitrum'],
      supportedAssets: ['SOL', 'ETH', 'USDC', 'USDT', 'BNB', 'MATIC', 'AVAX', 'WBTC'],
      fees: { fixed: 0.01, percentage: 0.05 },
      bridgeTime: { min: 3, max: 12 },
      security: {
        audited: true,
        tvl: 300000000,
        incidents: 0,
        lastAudit: '2024-01-30'
      },
      features: ['Wrapped Assets', 'Guardian Network', 'Decentralized', 'Multi-Asset'],
      status: 'active'
    },
    {
      id: 'multichain',
      name: 'Multichain',
      icon: '⚡',
      color: '#4ADE80',
      description: 'Cross-chain router protocol enabling cross-chain interactions',
      website: 'https://multichain.org',
      type: 'liquidity',
      supportedChains: ['ethereum', 'bsc', 'polygon', 'avalanche', 'arbitrum'],
      supportedAssets: ['ETH', 'USDC', 'USDT', 'BNB', 'MATIC', 'AVAX', 'WBTC'],
      fees: { fixed: 0.1, percentage: 0.1 },
      bridgeTime: { min: 10, max: 30 },
      security: {
        audited: true,
        tvl: 1200000000,
        incidents: 2,
        lastAudit: '2023-12-10'
      },
      features: ['Router Protocol', 'Cross-Chain Swaps', 'Anyswap Technology', 'High Liquidity'],
      status: 'maintenance'
    },
    {
      id: 'hop',
      name: 'Hop Protocol',
      icon: '🐰',
      color: '#B794F6',
      description: 'Scalable rollup-to-rollup general token bridge',
      website: 'https://hop.exchange',
      type: 'optimistic',
      supportedChains: ['ethereum', 'polygon', 'arbitrum', 'optimism'],
      supportedAssets: ['ETH', 'USDC', 'USDT', 'DAI', 'MATIC'],
      fees: { fixed: 0, percentage: 0.04 },
      bridgeTime: { min: 1, max: 5 },
      security: {
        audited: true,
        tvl: 180000000,
        incidents: 0,
        lastAudit: '2024-02-05'
      },
      features: ['Layer 2 Focus', 'AMM Model', 'Fast Exits', 'Ethereum Ecosystem'],
      status: 'active'
    },
    {
      id: 'cbridge',
      name: 'cBridge',
      icon: '🔗',
      color: '#F59E0B',
      description: 'Multi-chain network that enables instant, low-cost value transfers',
      website: 'https://cbridge.celer.network',
      type: 'liquidity',
      supportedChains: ['ethereum', 'bsc', 'polygon', 'avalanche', 'arbitrum'],
      supportedAssets: ['ETH', 'USDC', 'USDT', 'BNB', 'MATIC', 'AVAX', 'CELR'],
      fees: { fixed: 0, percentage: 0.04 },
      bridgeTime: { min: 1, max: 20 },
      security: {
        audited: true,
        tvl: 250000000,
        incidents: 0,
        lastAudit: '2024-01-20'
      },
      features: ['State Channel', 'Instant Finality', 'Low Fees', 'High Throughput'],
      status: 'active'
    }
  ]);

  const [bridgeStats, setBridgeStats] = useState<BridgeStats[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterChain, setFilterChain] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('tvl');
  const [showInactive, setShowInactive] = useState<boolean>(false);

  useEffect(() => {
    loadBridgeStats();
    const interval = setInterval(loadBridgeStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadBridgeStats = async () => {
    // Simulate loading bridge statistics
    const stats: BridgeStats[] = protocols.map(protocol => ({
      protocolId: protocol.id,
      volume24h: Math.random() * 50000000 + 1000000,
      volumeWeek: Math.random() * 300000000 + 10000000,
      transactions24h: Math.floor(Math.random() * 5000 + 100),
      averageBridgeTime: Math.random() * 10 + 2,
      successRate: 95 + Math.random() * 5,
      activeRoutes: Math.floor(Math.random() * 50 + 10)
    }));

    setBridgeStats(stats);
  };

  const getFilteredAndSortedProtocols = () => {
    let filtered = protocols.filter(protocol => {
      // Filter by type
      if (filterType !== 'all' && protocol.type !== filterType) {
        return false;
      }

      // Filter by chain
      if (filterChain !== 'all' && !protocol.supportedChains.includes(filterChain)) {
        return false;
      }

      // Show/hide inactive protocols
      if (!showInactive && protocol.status !== 'active') {
        return false;
      }

      return true;
    });

    // Sort protocols
    filtered.sort((a, b) => {
      const aStats = bridgeStats.find(s => s.protocolId === a.id);
      const bStats = bridgeStats.find(s => s.protocolId === b.id);

      switch (sortBy) {
        case 'tvl':
          return b.security.tvl - a.security.tvl;
        case 'volume':
          return (bStats?.volume24h || 0) - (aStats?.volume24h || 0);
        case 'transactions':
          return (bStats?.transactions24h || 0) - (aStats?.transactions24h || 0);
        case 'success-rate':
          return (bStats?.successRate || 0) - (aStats?.successRate || 0);
        case 'speed':
          return a.bridgeTime.min - b.bridgeTime.min;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(decimals)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(decimals)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(decimals)}K`;
    }
    return num.toFixed(decimals);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'deprecated':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lock-mint':
        return '#8b5cf6';
      case 'liquidity':
        return '#06b6d4';
      case 'optimistic':
        return '#f59e0b';
      case 'zk-proof':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getSecurityScore = (protocol: BridgeProtocol) => {
    let score = 70; // Base score
    
    if (protocol.security.audited) score += 15;
    if (protocol.security.incidents === 0) score += 10;
    if (protocol.security.tvl > 100000000) score += 5;
    
    const daysSinceAudit = Math.floor((new Date().getTime() - new Date(protocol.security.lastAudit).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceAudit < 90) score += 5;
    else if (daysSinceAudit > 365) score -= 10;

    return Math.min(100, Math.max(0, score));
  };

  return (
    <div className="bridge-protocols">
      <div className="protocols-header">
        <h2 className="protocols-title">🌉 Bridge Protocols</h2>
        <p className="protocols-subtitle">Compare and choose the best cross-chain bridge</p>
      </div>

      {/* Filters and Controls */}
      <div className="protocols-controls">
        <div className="filter-section">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="lock-mint">Lock & Mint</option>
            <option value="liquidity">Liquidity Pools</option>
            <option value="optimistic">Optimistic</option>
            <option value="zk-proof">ZK Proof</option>
          </select>

          <select
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Chains</option>
            <option value="solana">🔮 Solana</option>
            <option value="ethereum">⚡ Ethereum</option>
            <option value="polygon">🟣 Polygon</option>
            <option value="bsc">🟡 BSC</option>
            <option value="arbitrum">🔵 Arbitrum</option>
            <option value="avalanche">🔺 Avalanche</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="tvl">Sort by TVL</option>
            <option value="volume">Sort by Volume</option>
            <option value="transactions">Sort by Transactions</option>
            <option value="success-rate">Sort by Success Rate</option>
            <option value="speed">Sort by Speed</option>
            <option value="name">Sort by Name</option>
          </select>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show Inactive
          </label>
        </div>
      </div>

      {/* Protocols Grid */}
      <div className="protocols-content">
        <div className="protocols-grid">
          {getFilteredAndSortedProtocols().map(protocol => {
            const stats = bridgeStats.find(s => s.protocolId === protocol.id);
            const securityScore = getSecurityScore(protocol);
            
            return (
              <div
                key={protocol.id}
                className={`protocol-card ${selectedProtocol === protocol.id ? 'selected' : ''}`}
                onClick={() => setSelectedProtocol(selectedProtocol === protocol.id ? '' : protocol.id)}
                style={{ '--protocol-color': protocol.color } as React.CSSProperties}
              >
                <div className="protocol-header">
                  <div className="protocol-icon" style={{ color: protocol.color }}>
                    {protocol.icon}
                  </div>
                  <div className="protocol-info">
                    <h3 className="protocol-name">{protocol.name}</h3>
                    <div className="protocol-badges">
                      <span 
                        className="type-badge"
                        style={{ backgroundColor: getTypeColor(protocol.type) }}
                      >
                        {protocol.type.replace('-', ' ')}
                      </span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(protocol.status) }}
                      >
                        {protocol.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="protocol-description">{protocol.description}</p>

                <div className="protocol-metrics">
                  <div className="metric">
                    <span className="metric-label">TVL</span>
                    <span className="metric-value">{formatUSD(protocol.security.tvl)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">24h Volume</span>
                    <span className="metric-value">{formatUSD(stats?.volume24h || 0)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Success Rate</span>
                    <span className="metric-value">{(stats?.successRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Bridge Time</span>
                    <span className="metric-value">{protocol.bridgeTime.min}-{protocol.bridgeTime.max}m</span>
                  </div>
                </div>

                <div className="security-score">
                  <div className="score-header">
                    <span>Security Score</span>
                    <span className="score-value">{securityScore}/100</span>
                  </div>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${securityScore}%`,
                        backgroundColor: securityScore > 80 ? '#10b981' : securityScore > 60 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>

                <div className="supported-chains">
                  <span className="chains-label">Supported Chains ({protocol.supportedChains.length})</span>
                  <div className="chains-list">
                    {protocol.supportedChains.slice(0, 4).map(chain => (
                      <span key={chain} className="chain-icon">
                        {chain === 'solana' && '🔮'}
                        {chain === 'ethereum' && '⚡'}
                        {chain === 'polygon' && '🟣'}
                        {chain === 'bsc' && '🟡'}
                        {chain === 'arbitrum' && '🔵'}
                        {chain === 'avalanche' && '🔺'}
                      </span>
                    ))}
                    {protocol.supportedChains.length > 4 && (
                      <span className="chains-more">+{protocol.supportedChains.length - 4}</span>
                    )}
                  </div>
                </div>

                {selectedProtocol === protocol.id && (
                  <div className="protocol-details-expanded">
                    <div className="details-section">
                      <h4>🔧 Features</h4>
                      <div className="features-list">
                        {protocol.features.map(feature => (
                          <span key={feature} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>💰 Fee Structure</h4>
                      <div className="fee-details">
                        <div className="fee-item">
                          <span>Fixed Fee:</span>
                          <span>{protocol.fees.fixed === 0 ? 'None' : `$${protocol.fees.fixed}`}</span>
                        </div>
                        <div className="fee-item">
                          <span>Percentage Fee:</span>
                          <span>{protocol.fees.percentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>🛡️ Security Details</h4>
                      <div className="security-details">
                        <div className="security-item">
                          <span>Audited:</span>
                          <span className={protocol.security.audited ? 'positive' : 'negative'}>
                            {protocol.security.audited ? '✅ Yes' : '❌ No'}
                          </span>
                        </div>
                        <div className="security-item">
                          <span>Security Incidents:</span>
                          <span className={protocol.security.incidents === 0 ? 'positive' : 'negative'}>
                            {protocol.security.incidents}
                          </span>
                        </div>
                        <div className="security-item">
                          <span>Last Audit:</span>
                          <span>{new Date(protocol.security.lastAudit).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>🪙 Supported Assets</h4>
                      <div className="assets-list">
                        {protocol.supportedAssets.map(asset => (
                          <span key={asset} className="asset-tag">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="protocol-actions">
                      <button className="use-bridge-btn">
                        🌉 Use {protocol.name}
                      </button>
                      <a 
                        href={protocol.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="visit-website-btn"
                      >
                        🌐 Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BridgeProtocols;

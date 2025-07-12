import React, { useState, useEffect } from 'react';
import './ChainSelector.css';

interface ChainNetwork {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  icon: string;
  color: string;
  testnet?: boolean;
  tvl?: number;
  gasPrice?: number;
  blockTime?: number;
  features: string[];
  dexes: string[];
  bridges: string[];
}

interface ChainMetrics {
  chainId: string;
  gasPrice: number;
  blockTime: number;
  tvl: number;
  activeUsers: number;
  transactions24h: number;
  bridgeVolume: number;
  status: 'healthy' | 'warning' | 'congested' | 'maintenance';
}

// Enhanced supported chains configuration
const SUPPORTED_CHAINS: ChainNetwork[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    chainId: 101,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    blockExplorer: 'https://solscan.io',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    icon: '🔮',
    color: '#9945FF',
    tvl: 1250000000,
    gasPrice: 0.000005,
    blockTime: 400,
    features: ['Fast', 'Low Fees', 'NFTs', 'DeFi'],
    dexes: ['Jupiter', 'Raydium', 'Orca', 'Serum'],
    bridges: ['Wormhole', 'Allbridge', 'Portal']
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    icon: '⚡',
    color: '#627EEA',
    tvl: 25000000000,
    gasPrice: 25,
    blockTime: 12000,
    features: ['Smart Contracts', 'DeFi', 'NFTs', 'L2s'],
    dexes: ['Uniswap', 'SushiSwap', '1inch', 'Curve'],
    bridges: ['Wormhole', 'Portal', 'Multichain', 'Hop']
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
    icon: '🟣',
    color: '#8247E5',
    tvl: 2800000000,
    gasPrice: 1,
    blockTime: 2000,
    features: ['L2', 'Low Fees', 'EVM Compatible', 'Carbon Neutral'],
    dexes: ['QuickSwap', 'SushiSwap', 'Balancer', 'Curve'],
    bridges: ['Polygon Bridge', 'Hop', 'Multichain', 'cBridge']
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    icon: '🟡',
    color: '#F3BA2F',
    tvl: 4200000000,
    gasPrice: 5,
    blockTime: 3000,
    features: ['Fast', 'Low Fees', 'EVM Compatible'],
    dexes: ['PancakeSwap', 'Biswap', 'MDEX', 'Venus'],
    bridges: ['Wormhole', 'Multichain', 'cBridge', 'Anyswap']
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    icon: '🔺',
    color: '#E84142',
    tvl: 1800000000,
    gasPrice: 25,
    blockTime: 2000,
    features: ['Fast', 'Subnets', 'EVM Compatible', 'Eco-friendly'],
    dexes: ['Trader Joe', 'Pangolin', 'SushiSwap', 'Curve'],
    bridges: ['Avalanche Bridge', 'Multichain', 'Wormhole', 'cBridge']
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    icon: '🔵',
    color: '#28A0F0',
    tvl: 3200000000,
    gasPrice: 0.5,
    blockTime: 1000,
    features: ['L2', 'Low Fees', 'EVM Compatible', 'Optimistic Rollup'],
    dexes: ['Uniswap V3', 'SushiSwap', 'Balancer', 'Curve'],
    bridges: ['Arbitrum Bridge', 'Hop', 'Multichain', 'cBridge']
  }
];

interface ChainSelectorProps {
  selectedChain?: string;
  onChainChange?: (chainId: string) => void;
  className?: string;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ 
  selectedChain: propSelectedChain, 
  onChainChange, 
  className = '' 
}) => {
  const [selectedChain, setSelectedChain] = useState<string>(propSelectedChain || 'solana');
  const [chainMetrics, setChainMetrics] = useState<ChainMetrics[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('tvl');
  const [showTestnets, setShowTestnets] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadChainMetrics();
    const interval = setInterval(loadChainMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadChainMetrics = async () => {
    // Simulate loading real-time chain metrics
    const metrics: ChainMetrics[] = SUPPORTED_CHAINS.map(chain => ({
      chainId: chain.id,
      gasPrice: chain.gasPrice! + (Math.random() - 0.5) * chain.gasPrice! * 0.2,
      blockTime: chain.blockTime!,
      tvl: chain.tvl! * (1 + (Math.random() - 0.5) * 0.1),
      activeUsers: Math.floor(Math.random() * 100000 + 10000),
      transactions24h: Math.floor(Math.random() * 1000000 + 100000),
      bridgeVolume: Math.floor(Math.random() * 50000000 + 5000000),
      status: Math.random() > 0.8 ? 'warning' : 'healthy'
    }));

    setChainMetrics(metrics);
  };

  const getFilteredAndSortedChains = () => {
    let filtered = SUPPORTED_CHAINS.filter(chain => {
      // Search filter
      if (searchTerm && !chain.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !chain.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Testnet filter
      if (!showTestnets && chain.testnet) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all') {
        switch (filterCategory) {
          case 'mainnet':
            return !chain.testnet;
          case 'l2':
            return chain.features.includes('L2');
          case 'evm':
            return chain.features.includes('EVM Compatible');
          case 'low-fee':
            return chain.features.includes('Low Fees');
          default:
            return true;
        }
      }

      return true;
    });

    // Sort chains
    filtered.sort((a, b) => {
      const aMetrics = chainMetrics.find(m => m.chainId === a.id);
      const bMetrics = chainMetrics.find(m => m.chainId === b.id);

      switch (sortBy) {
        case 'tvl':
          return (bMetrics?.tvl || 0) - (aMetrics?.tvl || 0);
        case 'gas':
          return (aMetrics?.gasPrice || 0) - (bMetrics?.gasPrice || 0);
        case 'speed':
          return (aMetrics?.blockTime || 0) - (bMetrics?.blockTime || 0);
        case 'volume':
          return (bMetrics?.bridgeVolume || 0) - (aMetrics?.bridgeVolume || 0);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'congested':
        return '#ef4444';
      case 'maintenance':
        return '#6b7280';
      default:
        return '#10b981';
    }
  };

  const getSelectedChainDetails = () => {
    return SUPPORTED_CHAINS.find(chain => chain.id === selectedChain);
  };

  const handleChainSelect = (chainId: string) => {
    setSelectedChain(chainId);
    if (onChainChange) {
      onChainChange(chainId);
    }
  };

  return (
    <div className={`chain-selector ${className}`}>
      <div className="selector-header">
        <h2 className="selector-title">🔗 Chain Selector</h2>
        <p className="selector-subtitle">Choose your blockchain network</p>
      </div>

      {/* Search and Filters */}
      <div className="selector-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search chains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Networks</option>
            <option value="mainnet">Mainnet Only</option>
            <option value="l2">Layer 2</option>
            <option value="evm">EVM Compatible</option>
            <option value="low-fee">Low Fees</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="tvl">Sort by TVL</option>
            <option value="gas">Sort by Gas Price</option>
            <option value="speed">Sort by Speed</option>
            <option value="volume">Sort by Bridge Volume</option>
            <option value="name">Sort by Name</option>
          </select>

          <label className="testnet-toggle">
            <input
              type="checkbox"
              checked={showTestnets}
              onChange={(e) => setShowTestnets(e.target.checked)}
            />
            Show Testnets
          </label>
        </div>
      </div>

      <div className="selector-content">
        {/* Chain Grid */}
        <div className="chains-grid">
          {getFilteredAndSortedChains().map(chain => {
            const metrics = chainMetrics.find(m => m.chainId === chain.id);
            return (
              <div
                key={chain.id}
                className={`chain-card ${selectedChain === chain.id ? 'selected' : ''}`}
                onClick={() => handleChainSelect(chain.id)}
                style={{ '--chain-color': chain.color } as React.CSSProperties}
              >
                <div className="chain-header">
                  <div className="chain-icon">{chain.icon}</div>
                  <div className="chain-info">
                    <h3 className="chain-name">{chain.name}</h3>
                    <span className="chain-symbol">{chain.symbol}</span>
                  </div>
                  <div 
                    className="chain-status"
                    style={{ backgroundColor: getStatusColor(metrics?.status || 'healthy') }}
                  />
                </div>

                <div className="chain-metrics">
                  <div className="metric">
                    <span className="metric-label">TVL</span>
                    <span className="metric-value">${formatNumber(metrics?.tvl || chain.tvl || 0)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Gas</span>
                    <span className="metric-value">{(metrics?.gasPrice || chain.gasPrice || 0).toFixed(4)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Speed</span>
                    <span className="metric-value">{((metrics?.blockTime || chain.blockTime || 0) / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">24h Vol</span>
                    <span className="metric-value">${formatNumber(metrics?.bridgeVolume || 0)}</span>
                  </div>
                </div>

                <div className="chain-features">
                  {chain.features.slice(0, 3).map(feature => (
                    <span key={feature} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                  {chain.features.length > 3 && (
                    <span className="feature-more">+{chain.features.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Chain Details */}
        <div className="selected-chain-details">
          {getSelectedChainDetails() && (
            <div className="chain-details">
              <h3 className="details-title">
                {getSelectedChainDetails()!.icon} {getSelectedChainDetails()!.name} Details
              </h3>

              <div className="details-grid">
                <div className="detail-section">
                  <h4>Network Information</h4>
                  <div className="detail-item">
                    <span>Chain ID:</span>
                    <span>{getSelectedChainDetails()!.chainId}</span>
                  </div>
                  <div className="detail-item">
                    <span>Native Token:</span>
                    <span>{getSelectedChainDetails()!.nativeCurrency.symbol}</span>
                  </div>
                  <div className="detail-item">
                    <span>Block Explorer:</span>
                    <a href={getSelectedChainDetails()!.blockExplorer} target="_blank" rel="noopener noreferrer">
                      View Explorer
                    </a>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Live Metrics</h4>
                  {chainMetrics.find(m => m.chainId === selectedChain) && (
                    <>
                      <div className="detail-item">
                        <span>Active Users:</span>
                        <span>{formatNumber(chainMetrics.find(m => m.chainId === selectedChain)!.activeUsers, 0)}</span>
                      </div>
                      <div className="detail-item">
                        <span>24h Transactions:</span>
                        <span>{formatNumber(chainMetrics.find(m => m.chainId === selectedChain)!.transactions24h, 0)}</span>
                      </div>
                      <div className="detail-item">
                        <span>Bridge Volume:</span>
                        <span>${formatNumber(chainMetrics.find(m => m.chainId === selectedChain)!.bridgeVolume)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Supported DEXes</h4>
                  <div className="dex-list">
                    {getSelectedChainDetails()!.dexes.map(dex => (
                      <span key={dex} className="dex-tag">{dex}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Bridge Protocols</h4>
                  <div className="bridge-list">
                    {getSelectedChainDetails()!.bridges.map(bridge => (
                      <span key={bridge} className="bridge-tag">{bridge}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chain-actions">
                <button className="connect-btn">
                  🔗 Connect to {getSelectedChainDetails()!.name}
                </button>
                <button className="add-network-btn">
                  ➕ Add to Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChainSelector;

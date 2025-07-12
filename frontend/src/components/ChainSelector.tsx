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
    status: 'coming-soon',
    features: ['swap', 'liquidity']
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    icon: '◈',
    color: '#F3BA2F',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    status: 'coming-soon',
    features: ['swap', 'liquidity']
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    icon: '🔷',
    color: '#28A0F0',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    status: 'coming-soon',
    features: ['swap', 'liquidity']
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    icon: '🔴',
    color: '#FF0420',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    status: 'coming-soon',
    features: ['swap']
  }
};

interface ChainSelectorProps {
  selectedChain: string;
  onChainChange: (chainId: string) => void;
  className?: string;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ 
  selectedChain, 
  onChainChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chainStats, setChainStats] = useState<any>({});

  useEffect(() => {
    // Load chain statistics (mock data for now)
    const mockStats = {
      solana: {
        tvl: '$2.4B',
        volume24h: '$145M',
        users24h: '12.5K',
        avgFees: '$0.01'
      },
      ethereum: {
        tvl: '$45B',
        volume24h: '$1.2B', 
        users24h: '85K',
        avgFees: '$15.00'
      },
      polygon: {
        tvl: '$1.8B',
        volume24h: '$95M',
        users24h: '25K',
        avgFees: '$0.05'
      },
      bsc: {
        tvl: '$3.2B',
        volume24h: '$180M',
        users24h: '35K',
        avgFees: '$0.30'
      },
      arbitrum: {
        tvl: '$2.1B',
        volume24h: '$120M',
        users24h: '18K',
        avgFees: '$2.50'
      },
      optimism: {
        tvl: '$800M',
        volume24h: '$65M',
        users24h: '8K',
        avgFees: '$1.20'
      }
    };
    setChainStats(mockStats);
  }, []);

  const handleChainSelect = (chainId: string) => {
    const chain = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
    if (chain.status === 'active') {
      onChainChange(chainId);
      setIsOpen(false);
      
      // Store selected chain
      localStorage.setItem('nocturne_selected_chain', chainId);
      
      // Emit chain change event
      window.dispatchEvent(new CustomEvent('nocturne_chain_changed', {
        detail: { chainId, chain }
      }));
    }
  };

  const currentChain = SUPPORTED_CHAINS[selectedChain as keyof typeof SUPPORTED_CHAINS];

  return (
    <div className={`chain-selector ${className}`}>
      <button
        className="chain-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="current-chain">
          <span 
            className="chain-icon" 
            style={{ color: currentChain.color }}
          >
            {currentChain.icon}
          </span>
          <span className="chain-name">{currentChain.name}</span>
          <span className="chain-symbol">({currentChain.symbol})</span>
        </div>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="chain-dropdown">
          <div className="dropdown-header">
            <h3>🌐 Select Network</h3>
            <button 
              className="close-dropdown"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chains-list">
            {Object.entries(SUPPORTED_CHAINS).map(([chainId, chain]) => {
              const isSelected = chainId === selectedChain;
              const isActive = chain.status === 'active';
              const stats = chainStats[chainId];

              return (
                <div
                  key={chainId}
                  className={`chain-option ${isSelected ? 'selected' : ''} ${!isActive ? 'disabled' : ''}`}
                  onClick={() => handleChainSelect(chainId)}
                >
                  <div className="chain-main-info">
                    <div className="chain-header">
                      <span 
                        className="chain-icon large"
                        style={{ color: chain.color }}
                      >
                        {chain.icon}
                      </span>
                      <div className="chain-details">
                        <h4>{chain.name}</h4>
                        <span className="chain-symbol">{chain.symbol}</span>
                      </div>
                      <div className="chain-status">
                        {isActive ? (
                          <span className="status-active">🟢 Live</span>
                        ) : (
                          <span className="status-coming-soon">🔶 Soon</span>
                        )}
                      </div>
                    </div>

                    {isActive && stats && (
                      <div className="chain-stats">
                        <div className="stat">
                          <span className="stat-label">TVL</span>
                          <span className="stat-value">{stats.tvl}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">24h Volume</span>
                          <span className="stat-value">{stats.volume24h}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Users</span>
                          <span className="stat-value">{stats.users24h}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Avg Fees</span>
                          <span className="stat-value">{stats.avgFees}</span>
                        </div>
                      </div>
                    )}

                    <div className="chain-features">
                      {chain.features.map(feature => (
                        <span key={feature} className="feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="selected-indicator">
                      <span>✓ Connected</span>
                    </div>
                  )}

                  {!isActive && (
                    <div className="coming-soon-overlay">
                      <span>Coming Soon</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="dropdown-footer">
            <div className="multichain-info">
              🔗 <strong>Cross-Chain Bridge:</strong> Transfer assets between networks seamlessly
            </div>
            <div className="roadmap-info">
              📅 <strong>Roadmap:</strong> All networks launching Q2 2025
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="chain-selector-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ChainSelector;

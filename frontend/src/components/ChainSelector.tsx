import React, { useState, useEffect } from 'react';
import './ChainSelector.css';

interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'live' | 'coming-soon' | 'testnet';
  description: string;
  features: string[];
  rpcUrl?: string;
  explorer?: string;
}

interface ChainSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onChainSelect?: (chainId: string) => void;
}

const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 'solana',
    name: 'Solana',
    icon: '⚡',
    color: '#9945FF',
    status: 'live',
    description: 'Ultra-fast, low-cost transactions with massive ecosystem',
    features: ['Native Integration', 'Jupiter Aggregation', '0.3% Fees', 'Instant Settlements'],
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://solscan.io'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '💎',
    color: '#627EEA',
    status: 'coming-soon',
    description: 'The original smart contract platform with massive liquidity',
    features: ['ERC-20 Support', 'Uniswap Integration', 'Layer 2 Support', 'DeFi Protocols'],
    explorer: 'https://etherscan.io'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '🔷',
    color: '#8247E5',
    status: 'coming-soon',
    description: 'Ethereum-compatible with faster and cheaper transactions',
    features: ['Low Fees', 'Fast Finality', 'Ethereum Compatible', 'Growing Ecosystem'],
    explorer: 'https://polygonscan.com'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    icon: '🌀',
    color: '#28A0F0',
    status: 'coming-soon',
    description: 'Ethereum Layer 2 with near-instant transactions',
    features: ['L2 Scaling', 'Ethereum Security', 'Low Costs', 'Fast Withdrawals'],
    explorer: 'https://arbiscan.io'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    icon: '🏔️',
    color: '#E84142',
    status: 'coming-soon',
    description: 'High-performance blockchain for DeFi applications',
    features: ['Sub-second Finality', 'EVM Compatible', 'High Throughput', 'Eco-friendly'],
    explorer: 'https://snowtrace.io'
  },
  {
    id: 'base',
    name: 'Base',
    icon: '🔵',
    color: '#0052FF',
    status: 'coming-soon',
    description: 'Coinbase L2 built on Optimism with seamless fiat integration',
    features: ['Coinbase Integration', 'Optimism Stack', 'Fiat On-ramps', 'Enterprise Ready'],
    explorer: 'https://basescan.org'
  }
];

const ChainSelector = ({ isVisible, onClose, onChainSelect }: ChainSelectorProps) => {
  const [currentChain, setCurrentChain] = useState('solana');
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Load saved chain preference
    const savedChain = localStorage.getItem('nocturne_selected_chain');
    if (savedChain) {
      setCurrentChain(savedChain);
    }
  }, []);

  const handleChainSelect = (chainId: string) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    
    if (chain?.status === 'live') {
      setCurrentChain(chainId);
      localStorage.setItem('nocturne_selected_chain', chainId);
      
      if (onChainSelect) {
        onChainSelect(chainId);
      }
      
      // Update global chain state
      window.dispatchEvent(new CustomEvent('chainChanged', { detail: chain }));
    } else {
      alert(`${chain?.name} support is coming soon! Join our newsletter for updates.`);
    }
  };

  const getFilteredChains = () => {
    if (selectedFilter === 'all') return SUPPORTED_CHAINS;
    return SUPPORTED_CHAINS.filter(chain => chain.status === selectedFilter);
  };

  const getCurrentChainData = () => {
    return SUPPORTED_CHAINS.find(chain => chain.id === currentChain);
  };

  if (!isVisible) return null;

  return (
    <div className="chain-selector-modal">
      <div className="chain-selector-backdrop" onClick={onClose} />
      <div className="chain-selector-container">
        <div className="chain-selector-header">
          <h2>🌐 Multichain Interface</h2>
          <p>Select your preferred blockchain network</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Current Chain Display */}
        <div className="current-chain-section">
          <div className="current-chain-header">
            <h3>Currently Connected</h3>
            <button 
              className="roadmap-btn"
              onClick={() => setShowRoadmap(!showRoadmap)}
            >
              📅 Roadmap
            </button>
          </div>
          
          <div className="current-chain-card">
            <div 
              className="chain-icon"
              style={{ backgroundColor: getCurrentChainData()?.color }}
            >
              {getCurrentChainData()?.icon}
            </div>
            <div className="chain-info">
              <h4>{getCurrentChainData()?.name}</h4>
              <p>{getCurrentChainData()?.description}</p>
              <div className="chain-status">
                <span className={`status-badge ${getCurrentChainData()?.status}`}>
                  {getCurrentChainData()?.status === 'live' ? '🟢 Live' : 
                   getCurrentChainData()?.status === 'testnet' ? '🟡 Testnet' : '🔵 Coming Soon'}
                </span>
                {getCurrentChainData()?.explorer && (
                  <a 
                    href={getCurrentChainData()?.explorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="explorer-link"
                  >
                    🔍 Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chain Filters */}
        <div className="chain-filters">
          <button 
            className={selectedFilter === 'all' ? 'active' : ''}
            onClick={() => setSelectedFilter('all')}
          >
            All Networks
          </button>
          <button 
            className={selectedFilter === 'live' ? 'active' : ''}
            onClick={() => setSelectedFilter('live')}
          >
            Live
          </button>
          <button 
            className={selectedFilter === 'coming-soon' ? 'active' : ''}
            onClick={() => setSelectedFilter('coming-soon')}
          >
            Coming Soon
          </button>
        </div>

        {/* Chain Grid */}
        <div className="chains-grid">
          {getFilteredChains().map((chain) => (
            <div
              key={chain.id}
              className={`chain-card ${chain.id === currentChain ? 'selected' : ''} ${chain.status}`}
              onClick={() => handleChainSelect(chain.id)}
            >
              <div className="chain-card-header">
                <div 
                  className="chain-avatar"
                  style={{ backgroundColor: chain.color }}
                >
                  {chain.icon}
                </div>
                <div className="chain-title">
                  <h5>{chain.name}</h5>
                  <span className={`status-indicator ${chain.status}`}>
                    {chain.status === 'live' ? '🟢' : 
                     chain.status === 'testnet' ? '🟡' : '🔵'}
                  </span>
                </div>
              </div>
              
              <p className="chain-description">{chain.description}</p>
              
              <div className="chain-features">
                {chain.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
              
              {chain.id === currentChain && (
                <div className="selected-indicator">
                  ✅ Current Network
                </div>
              )}
              
              {chain.status !== 'live' && (
                <div className="coming-soon-overlay">
                  <span>Coming Soon</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Roadmap Section */}
        {showRoadmap && (
          <div className="roadmap-section">
            <h4>🗺️ Multichain Roadmap</h4>
            <div className="roadmap-timeline">
              <div className="roadmap-item completed">
                <div className="roadmap-date">Q1 2025</div>
                <div className="roadmap-content">
                  <h5>✅ Solana Integration</h5>
                  <p>Native Solana support with Jupiter aggregation</p>
                </div>
              </div>
              
              <div className="roadmap-item current">
                <div className="roadmap-date">Q2 2025</div>
                <div className="roadmap-content">
                  <h5>🔄 Ethereum Integration</h5>
                  <p>ETH and ERC-20 support with Uniswap integration</p>
                </div>
              </div>
              
              <div className="roadmap-item upcoming">
                <div className="roadmap-date">Q3 2025</div>
                <div className="roadmap-content">
                  <h5>🚀 Layer 2 Expansion</h5>
                  <p>Polygon, Arbitrum, and Base support</p>
                </div>
              </div>
              
              <div className="roadmap-item upcoming">
                <div className="roadmap-date">Q4 2025</div>
                <div className="roadmap-content">
                  <h5>🌐 Cross-Chain Bridge</h5>
                  <p>Seamless asset bridging between networks</p>
                </div>
              </div>
            </div>
            
            <div className="newsletter-signup">
              <h5>📧 Get Updates</h5>
              <p>Subscribe to receive multichain integration updates</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email..."
                  className="email-input"
                />
                <button className="subscribe-btn">Subscribe</button>
              </div>
            </div>
          </div>
        )}

        <div className="chain-selector-footer">
          <p>More networks will be added based on community demand and market conditions.</p>
          <p>Current focus: Maximum security and optimal user experience per chain.</p>
        </div>
      </div>
    </div>
  );
};

export default ChainSelector;

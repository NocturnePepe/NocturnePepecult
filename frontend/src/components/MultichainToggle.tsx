// MultichainToggle.tsx - Future multichain support UI
import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { cultSounds } from '../SoundEffects.js';
import './MultichainToggle.css';

interface MultichainProps {
  onChainSelect?: (chain: SupportedChain) => void;
  currentChain?: SupportedChain;
}

interface SupportedChain {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  rpcUrl: string;
  explorerUrl: string;
  enabled: boolean;
  comingSoon?: boolean;
  description: string;
}

const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '⚡',
    color: '#9945FF',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    enabled: true,
    description: 'High-performance blockchain with low fees'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '🔷',
    color: '#627EEA',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    enabled: false,
    comingSoon: true,
    description: 'World\'s largest smart contract platform'
  },
  {
    id: 'binance',
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: '🟡',
    color: '#F3BA2F',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    enabled: false,
    comingSoon: true,
    description: 'Fast and low-cost transactions'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '🟣',
    color: '#8247E5',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    enabled: false,
    comingSoon: true,
    description: 'Ethereum scaling solution'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    icon: '🔺',
    color: '#E84142',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    enabled: false,
    comingSoon: true,
    description: 'Fastest smart contracts platform'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    icon: '🔵',
    color: '#28A0F0',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    enabled: false,
    comingSoon: true,
    description: 'Ethereum Layer 2 scaling'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    icon: '🔘',
    color: '#0052FF',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    enabled: false,
    comingSoon: true,
    description: 'Coinbase\'s Layer 2 network'
  }
];

const MultichainToggle: React.FC<MultichainProps> = ({ 
  onChainSelect,
  currentChain = SUPPORTED_CHAINS[0] // Default to Solana
}) => {
  const { connected } = useWallet();
  const [selectedChain, setSelectedChain] = useState<SupportedChain>(currentChain);
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChainSelect = useCallback(async (chain: SupportedChain) => {
    if (!chain.enabled) {
      // Show coming soon message
      if (cultSounds) {
        cultSounds.playError();
      }
      return;
    }

    if (chain.id === selectedChain.id) {
      setShowChainSelector(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate chain switching delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSelectedChain(chain);
      setShowChainSelector(false);
      
      if (onChainSelect) {
        onChainSelect(chain);
      }

      if (cultSounds) {
        cultSounds.playSuccess();
      }

    } catch (error) {
      console.error('Failed to switch chain:', error);
      if (cultSounds) {
        cultSounds.playError();
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedChain, onChainSelect]);

  const toggleChainSelector = useCallback(() => {
    setShowChainSelector(!showChainSelector);
    if (cultSounds) {
      cultSounds.playClick();
    }
  }, [showChainSelector]);

  return (
    <div className="multichain-toggle">
      {/* Current Chain Display */}
      <button 
        className="current-chain-btn"
        onClick={toggleChainSelector}
        disabled={isLoading}
        title={`Current: ${selectedChain.name}`}
      >
        <div className="chain-info">
          <span 
            className="chain-icon"
            style={{ color: selectedChain.color }}
          >
            {selectedChain.icon}
          </span>
          <span className="chain-name">{selectedChain.name}</span>
        </div>
        <span className={`dropdown-arrow ${showChainSelector ? 'open' : ''}`}>
          ▼
        </span>
        {isLoading && (
          <div className="chain-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </button>

      {/* Chain Selector Dropdown */}
      {showChainSelector && (
        <div className="chain-selector-overlay" onClick={() => setShowChainSelector(false)}>
          <div className="chain-selector" onClick={(e) => e.stopPropagation()}>
            <div className="selector-header">
              <h3>🌐 Select Network</h3>
              <button 
                className="close-selector"
                onClick={() => setShowChainSelector(false)}
              >
                ×
              </button>
            </div>

            <div className="chains-list">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  className={`chain-option ${
                    chain.id === selectedChain.id ? 'selected' : ''
                  } ${!chain.enabled ? 'disabled' : ''}`}
                  onClick={() => handleChainSelect(chain)}
                  disabled={!chain.enabled}
                >
                  <div className="chain-option-info">
                    <div className="chain-header">
                      <span 
                        className="chain-option-icon"
                        style={{ color: chain.color }}
                      >
                        {chain.icon}
                      </span>
                      <div className="chain-details">
                        <div className="chain-option-name">{chain.name}</div>
                        <div className="chain-symbol">{chain.symbol}</div>
                      </div>
                    </div>
                    <div className="chain-description">{chain.description}</div>
                  </div>

                  <div className="chain-status">
                    {chain.enabled ? (
                      <span className="status-live">✅ Live</span>
                    ) : (
                      <span className="status-coming-soon">🚧 Coming Soon</span>
                    )}
                  </div>

                  {chain.id === selectedChain.id && (
                    <div className="selected-indicator">
                      <span>🌙</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Multichain Benefits */}
            <div className="multichain-benefits">
              <h4>🚀 Coming Soon Features</h4>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <span className="benefit-icon">🔄</span>
                  <span>Cross-chain swaps</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🌉</span>
                  <span>Bridge assets</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💎</span>
                  <span>Multi-chain liquidity</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Best price routing</span>
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="multichain-roadmap">
              <h4>📅 Development Roadmap</h4>
              <div className="roadmap-items">
                <div className="roadmap-item completed">
                  <div className="roadmap-status">✅</div>
                  <div className="roadmap-info">
                    <div className="roadmap-title">Solana Integration</div>
                    <div className="roadmap-date">Completed</div>
                  </div>
                </div>
                <div className="roadmap-item in-progress">
                  <div className="roadmap-status">🔄</div>
                  <div className="roadmap-info">
                    <div className="roadmap-title">Cross-chain Infrastructure</div>
                    <div className="roadmap-date">Q2 2024</div>
                  </div>
                </div>
                <div className="roadmap-item planned">
                  <div className="roadmap-status">📋</div>
                  <div className="roadmap-info">
                    <div className="roadmap-title">Ethereum Support</div>
                    <div className="roadmap-date">Q3 2024</div>
                  </div>
                </div>
                <div className="roadmap-item planned">
                  <div className="roadmap-status">📋</div>
                  <div className="roadmap-info">
                    <div className="roadmap-title">Layer 2 Networks</div>
                    <div className="roadmap-date">Q4 2024</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="multichain-newsletter">
              <h4>🔔 Get Notified</h4>
              <p>Be the first to know when new chains are supported!</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">Notify Me</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {connected && (
        <div className="connection-indicator">
          <div 
            className="connection-dot"
            style={{ backgroundColor: selectedChain.color }}
            title={`Connected to ${selectedChain.name}`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default MultichainToggle;

// Export utility functions
export const getChainInfo = (chainId: string): SupportedChain | undefined => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

export const getEnabledChains = (): SupportedChain[] => {
  return SUPPORTED_CHAINS.filter(chain => chain.enabled);
};

export const getComingSoonChains = (): SupportedChain[] => {
  return SUPPORTED_CHAINS.filter(chain => chain.comingSoon);
};

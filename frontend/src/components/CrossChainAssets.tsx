import React, { useState, useEffect } from 'react';
import './CrossChainAssets.css';

interface AssetBalance {
  symbol: string;
  name: string;
  icon: string;
  balances: {
    [chainId: string]: {
      amount: number;
      usdValue: number;
      contractAddress: string;
      decimals: number;
    };
  };
  totalUsdValue: number;
  price: number;
  priceChange24h: number;
}

interface ChainInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CrossChainAssets: React.FC = () => {
  const [supportedChains] = useState<ChainInfo[]>([
    { id: 'solana', name: 'Solana', icon: '🔮', color: '#9945FF' },
    { id: 'ethereum', name: 'Ethereum', icon: '⚡', color: '#627EEA' },
    { id: 'polygon', name: 'Polygon', icon: '🟣', color: '#8247E5' },
    { id: 'bsc', name: 'BSC', icon: '🟡', color: '#F3BA2F' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', color: '#28A0F0' },
    { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: '#E84142' }
  ]);

  const [assetBalances, setAssetBalances] = useState<AssetBalance[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [totalPortfolioValue, setTotalPortfolioValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterChain, setFilterChain] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('value');
  const [showZeroBalances, setShowZeroBalances] = useState<boolean>(false);

  useEffect(() => {
    loadAssetBalances();
  }, []);

  const loadAssetBalances = async () => {
    setIsLoading(true);
    
    // Simulate loading cross-chain asset balances
    const mockBalances: AssetBalance[] = [
      {
        symbol: 'SOL',
        name: 'Solana',
        icon: '🔮',
        balances: {
          solana: { amount: 25.5, usdValue: 2550, contractAddress: 'native', decimals: 9 },
          ethereum: { amount: 8.2, usdValue: 820, contractAddress: '0x...', decimals: 9 },
          polygon: { amount: 3.1, usdValue: 310, contractAddress: '0x...', decimals: 9 }
        },
        totalUsdValue: 3680,
        price: 100,
        priceChange24h: 5.2
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        icon: '💵',
        balances: {
          solana: { amount: 1250, usdValue: 1250, contractAddress: '4zMMC...', decimals: 6 },
          ethereum: { amount: 850, usdValue: 850, contractAddress: '0xA0b...', decimals: 6 },
          polygon: { amount: 420, usdValue: 420, contractAddress: '0x279...', decimals: 6 },
          bsc: { amount: 300, usdValue: 300, contractAddress: '0x8AC...', decimals: 6 },
          arbitrum: { amount: 180, usdValue: 180, contractAddress: '0xFF9...', decimals: 6 }
        },
        totalUsdValue: 3000,
        price: 1.00,
        priceChange24h: 0.1
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        icon: '⚡',
        balances: {
          ethereum: { amount: 0.85, usdValue: 2125, contractAddress: 'native', decimals: 18 },
          polygon: { amount: 0.32, usdValue: 800, contractAddress: '0x7ce...', decimals: 18 },
          arbitrum: { amount: 0.24, usdValue: 600, contractAddress: 'native', decimals: 18 }
        },
        totalUsdValue: 3525,
        price: 2500,
        priceChange24h: -2.8
      },
      {
        symbol: 'MATIC',
        name: 'Polygon',
        icon: '🟣',
        balances: {
          polygon: { amount: 850, usdValue: 680, contractAddress: 'native', decimals: 18 },
          ethereum: { amount: 320, usdValue: 256, contractAddress: '0x7D1...', decimals: 18 }
        },
        totalUsdValue: 936,
        price: 0.8,
        priceChange24h: 8.1
      },
      {
        symbol: 'BNB',
        name: 'BNB',
        icon: '🟡',
        balances: {
          bsc: { amount: 3.2, usdValue: 960, contractAddress: 'native', decimals: 18 },
          ethereum: { amount: 0.8, usdValue: 240, contractAddress: '0xB8c...', decimals: 18 }
        },
        totalUsdValue: 1200,
        price: 300,
        priceChange24h: 3.5
      },
      {
        symbol: 'AVAX',
        name: 'Avalanche',
        icon: '🔺',
        balances: {
          avalanche: { amount: 12.5, usdValue: 500, contractAddress: 'native', decimals: 18 },
          ethereum: { amount: 7.5, usdValue: 300, contractAddress: '0x85f...', decimals: 18 }
        },
        totalUsdValue: 800,
        price: 40,
        priceChange24h: -1.2
      }
    ];

    setAssetBalances(mockBalances);
    setTotalPortfolioValue(mockBalances.reduce((sum, asset) => sum + asset.totalUsdValue, 0));
    setIsLoading(false);
  };

  const getFilteredAndSortedAssets = () => {
    let filtered = assetBalances.filter(asset => {
      // Filter by chain
      if (filterChain !== 'all') {
        return asset.balances[filterChain];
      }

      // Show/hide zero balances
      if (!showZeroBalances) {
        return asset.totalUsdValue > 0;
      }

      return true;
    });

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalUsdValue - a.totalUsdValue;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'change':
          return Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getChainInfo = (chainId: string) => {
    return supportedChains.find(chain => chain.id === chainId);
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  };

  const getAssetAllocation = (asset: AssetBalance) => {
    return Object.entries(asset.balances).map(([chainId, balance]) => ({
      chainId,
      chainInfo: getChainInfo(chainId)!,
      balance,
      percentage: (balance.usdValue / asset.totalUsdValue) * 100
    })).sort((a, b) => b.balance.usdValue - a.balance.usdValue);
  };

  if (isLoading) {
    return (
      <div className="cross-chain-assets loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading cross-chain assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cross-chain-assets">
      <div className="assets-header">
        <h2 className="assets-title">🌐 Cross-Chain Assets</h2>
        <div className="portfolio-summary">
          <div className="total-value">
            <span className="total-label">Total Portfolio Value</span>
            <span className="total-amount">{formatUSD(totalPortfolioValue)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="assets-controls">
        <div className="filter-section">
          <select
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Chains</option>
            {supportedChains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.icon} {chain.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="value">Sort by Value</option>
            <option value="name">Sort by Name</option>
            <option value="change">Sort by Change</option>
          </select>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showZeroBalances}
              onChange={(e) => setShowZeroBalances(e.target.checked)}
            />
            Show Zero Balances
          </label>
        </div>
      </div>

      {/* Assets List */}
      <div className="assets-content">
        <div className="assets-list">
          {getFilteredAndSortedAssets().map(asset => (
            <div
              key={asset.symbol}
              className={`asset-item ${selectedAsset === asset.symbol ? 'selected' : ''}`}
              onClick={() => setSelectedAsset(selectedAsset === asset.symbol ? '' : asset.symbol)}
            >
              <div className="asset-main-info">
                <div className="asset-header">
                  <div className="asset-icon">{asset.icon}</div>
                  <div className="asset-details">
                    <h3 className="asset-name">{asset.name}</h3>
                    <span className="asset-symbol">{asset.symbol}</span>
                  </div>
                  <div className="asset-price">
                    <span className="price">{formatUSD(asset.price)}</span>
                    <span 
                      className="price-change"
                      style={{ color: getPriceChangeColor(asset.priceChange24h) }}
                    >
                      {asset.priceChange24h > 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="asset-summary">
                  <div className="total-balance">
                    <span className="balance-label">Total Balance</span>
                    <span className="balance-value">{formatUSD(asset.totalUsdValue)}</span>
                  </div>
                  <div className="chain-count">
                    <span>{Object.keys(asset.balances).length} chains</span>
                  </div>
                </div>
              </div>

              {selectedAsset === asset.symbol && (
                <div className="asset-details-expanded">
                  <div className="chain-balances">
                    <h4>Chain Distribution</h4>
                    <div className="balances-list">
                      {getAssetAllocation(asset).map(({ chainId, chainInfo, balance, percentage }) => (
                        <div key={chainId} className="chain-balance-item">
                          <div className="chain-info">
                            <span className="chain-icon" style={{ color: chainInfo.color }}>
                              {chainInfo.icon}
                            </span>
                            <span className="chain-name">{chainInfo.name}</span>
                          </div>
                          <div className="balance-info">
                            <div className="balance-amounts">
                              <span className="token-amount">
                                {formatNumber(balance.amount, balance.decimals > 6 ? 4 : 2)} {asset.symbol}
                              </span>
                              <span className="usd-amount">{formatUSD(balance.usdValue)}</span>
                            </div>
                            <div className="percentage-bar">
                              <div 
                                className="percentage-fill"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: chainInfo.color 
                                }}
                              />
                            </div>
                            <span className="percentage-text">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="asset-actions">
                    <button className="action-btn bridge-btn">
                      🌉 Bridge {asset.symbol}
                    </button>
                    <button className="action-btn swap-btn">
                      🔄 Swap {asset.symbol}
                    </button>
                    <button className="action-btn send-btn">
                      📤 Send {asset.symbol}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Portfolio Overview */}
        <div className="portfolio-overview">
          <h3>📊 Portfolio Overview</h3>
          
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-label">Total Assets</span>
              <span className="stat-value">{assetBalances.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Chains</span>
              <span className="stat-value">{supportedChains.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">24h Change</span>
              <span 
                className="stat-value"
                style={{ color: getPriceChangeColor(2.5) }}
              >
                +2.5%
              </span>
            </div>
          </div>

          <div className="chain-distribution">
            <h4>Distribution by Chain</h4>
            <div className="chain-distribution-chart">
              {supportedChains.map(chain => {
                const chainValue = assetBalances.reduce((sum, asset) => {
                  const balance = asset.balances[chain.id];
                  return sum + (balance ? balance.usdValue : 0);
                }, 0);
                const percentage = (chainValue / totalPortfolioValue) * 100;

                if (percentage < 0.1) return null;

                return (
                  <div key={chain.id} className="chain-distribution-item">
                    <div className="chain-info">
                      <span className="chain-icon" style={{ color: chain.color }}>
                        {chain.icon}
                      </span>
                      <span className="chain-name">{chain.name}</span>
                    </div>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: chain.color 
                        }}
                      />
                    </div>
                    <div className="distribution-stats">
                      <span className="distribution-value">{formatUSD(chainValue)}</span>
                      <span className="distribution-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="quick-actions-grid">
              <button className="quick-action-btn">
                🔄 Rebalance Portfolio
              </button>
              <button className="quick-action-btn">
                📈 View Analytics
              </button>
              <button className="quick-action-btn">
                💰 Add Funds
              </button>
              <button className="quick-action-btn">
                📤 Withdraw All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossChainAssets;

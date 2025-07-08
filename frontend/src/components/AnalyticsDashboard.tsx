// AnalyticsDashboard.tsx - Complete trading analytics and market intelligence
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { cultSounds } from '../SoundEffects.js';
import './AnalyticsDashboard.css';

interface TradingMetrics {
  totalVolume: number;
  totalTrades: number;
  winRate: number;
  avgTradeSize: number;
  profitLoss: number;
  bestTrade: number;
  worstTrade: number;
  activeTokens: number;
}

interface MarketData {
  topGainers: Array<{
    symbol: string;
    change24h: number;
    volume: number;
    price: number;
  }>;
  topLosers: Array<{
    symbol: string;
    change24h: number;
    volume: number;
    price: number;
  }>;
  trending: Array<{
    symbol: string;
    volume: number;
    searches: number;
  }>;
}

interface VolumeData {
  date: string;
  volume: number;
  trades: number;
  uniqueUsers: number;
}

interface TokenAnalytics {
  symbol: string;
  totalVolume: number;
  trades: number;
  avgPrice: number;
  priceChange: number;
  userCount: number;
  liquidity: number;
}

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onClose: () => void;
  connection: any;
}

const AnalyticsDashboard = ({ isVisible, onClose, connection }: AnalyticsDashboardProps) => {
  const { publicKey, connected } = useWallet();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tradingMetrics, setTradingMetrics] = useState({
    totalVolume: 0,
    totalTrades: 0,
    winRate: 0,
    avgTradeSize: 0,
    profitLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
    activeTokens: 0
  });
  
  const [marketData, setMarketData] = useState({
    topGainers: [],
    topLosers: [],
    trending: []
  });
  
  const [volumeHistory, setVolumeHistory] = useState([]);
  const [tokenAnalytics, setTokenAnalytics] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 15420,
    dailyVolume: 2850000,
    totalTVL: 18500000,
    activeSwaps: 1250
  });

  // Load analytics data
  useEffect(() => {
    if (isVisible) {
      loadAnalyticsData();
    }
  }, [isVisible, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    await cultSounds.playHoverSound();
    
    // Simulate API loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock personal trading metrics
    const mockTradingMetrics = {
      totalVolume: 125000 + Math.random() * 50000,
      totalTrades: 45 + Math.floor(Math.random() * 30),
      winRate: 65 + Math.random() * 20,
      avgTradeSize: 2500 + Math.random() * 1000,
      profitLoss: 5250 + Math.random() * 2000,
      bestTrade: 8500 + Math.random() * 5000,
      worstTrade: -(1200 + Math.random() * 800),
      activeTokens: 8 + Math.floor(Math.random() * 5)
    };
    setTradingMetrics(mockTradingMetrics);
    
    // Mock market data
    const tokens = ['SOL', 'BONK', 'WIF', 'JUP', 'RENDER', 'PYTH', 'RAY', 'ORCA'];
    const mockMarketData = {
      topGainers: tokens.slice(0, 5).map(symbol => ({
        symbol,
        change24h: 5 + Math.random() * 25,
        volume: 100000 + Math.random() * 500000,
        price: Math.random() * 100
      })),
      topLosers: tokens.slice(3, 8).map(symbol => ({
        symbol,
        change24h: -(2 + Math.random() * 15),
        volume: 100000 + Math.random() * 500000,
        price: Math.random() * 100
      })),
      trending: tokens.slice(0, 6).map(symbol => ({
        symbol,
        volume: 50000 + Math.random() * 200000,
        searches: 1000 + Math.random() * 5000
      }))
    };
    setMarketData(mockMarketData);
    
    // Mock volume history
    const mockVolumeHistory = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      volume: 50000 + Math.random() * 100000,
      trades: 100 + Math.random() * 200,
      uniqueUsers: 50 + Math.random() * 100
    }));
    setVolumeHistory(mockVolumeHistory);
    
    // Mock token analytics
    const mockTokenAnalytics = tokens.map(symbol => ({
      symbol,
      totalVolume: 500000 + Math.random() * 1000000,
      trades: 500 + Math.random() * 1000,
      avgPrice: Math.random() * 100,
      priceChange: -20 + Math.random() * 40,
      userCount: 100 + Math.random() * 500,
      liquidity: 100000 + Math.random() * 500000
    }));
    setTokenAnalytics(mockTokenAnalytics);
    
    setIsLoading(false);
    await cultSounds.playConnectSound();
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value) => {
    const color = value >= 0 ? '#00ff88' : '#ff4444';
    const prefix = value >= 0 ? '+' : '';
    return <span style={{ color }}>{prefix}{value.toFixed(2)}%</span>;
  };

  const renderOverviewTab = () => (
    <div className="overview-tab">
      {/* Personal Trading Metrics */}
      <div className="metrics-section">
        <h4>📊 Your Trading Performance</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-info">
              <span className="metric-value">{formatCurrency(tradingMetrics.totalVolume)}</span>
              <span className="metric-label">Total Volume</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">🔄</div>
            <div className="metric-info">
              <span className="metric-value">{tradingMetrics.totalTrades}</span>
              <span className="metric-label">Total Trades</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-info">
              <span className="metric-value">{tradingMetrics.winRate.toFixed(1)}%</span>
              <span className="metric-label">Win Rate</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-info">
              <span className="metric-value" style={{ color: tradingMetrics.profitLoss >= 0 ? '#00ff88' : '#ff4444' }}>
                {tradingMetrics.profitLoss >= 0 ? '+' : ''}{formatCurrency(tradingMetrics.profitLoss)}
              </span>
              <span className="metric-label">P&L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="platform-section">
        <h4>🏛️ Platform Overview</h4>
        <div className="platform-grid">
          <div className="platform-stat">
            <span className="stat-icon">👥</span>
            <div className="stat-details">
              <span className="stat-number">{platformStats.totalUsers.toLocaleString()}</span>
              <span className="stat-desc">Active Users</span>
            </div>
          </div>
          
          <div className="platform-stat">
            <span className="stat-icon">💹</span>
            <div className="stat-details">
              <span className="stat-number">{formatCurrency(platformStats.dailyVolume)}</span>
              <span className="stat-desc">24h Volume</span>
            </div>
          </div>
          
          <div className="platform-stat">
            <span className="stat-icon">🏦</span>
            <div className="stat-details">
              <span className="stat-number">{formatCurrency(platformStats.totalTVL)}</span>
              <span className="stat-desc">Total TVL</span>
            </div>
          </div>
          
          <div className="platform-stat">
            <span className="stat-icon">⚡</span>
            <div className="stat-details">
              <span className="stat-number">{platformStats.activeSwaps}</span>
              <span className="stat-desc">Active Swaps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Movers */}
      <div className="market-movers-section">
        <div className="movers-grid">
          <div className="movers-card">
            <h5>📈 Top Gainers</h5>
            <div className="movers-list">
              {marketData.topGainers.map((token, index) => (
                <div key={index} className="mover-item">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-change">{formatPercent(token.change24h)}</span>
                  <span className="token-volume">{formatCurrency(token.volume)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="movers-card">
            <h5>📉 Top Losers</h5>
            <div className="movers-list">
              {marketData.topLosers.map((token, index) => (
                <div key={index} className="mover-item">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-change">{formatPercent(token.change24h)}</span>
                  <span className="token-volume">{formatCurrency(token.volume)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVolumeTab = () => (
    <div className="volume-tab">
      <div className="volume-chart-section">
        <h4>📊 Volume Analysis</h4>
        <div className="chart-container">
          <div className="volume-chart">
            {volumeHistory.map((data, index) => (
              <div 
                key={index} 
                className="volume-bar"
                style={{ 
                  height: `${(data.volume / Math.max(...volumeHistory.map(d => d.volume))) * 100}%`,
                  backgroundColor: `hsl(${Math.random() * 60 + 320}, 70%, 60%)`
                }}
                title={`${data.date}: ${formatCurrency(data.volume)}`}
              />
            ))}
          </div>
          <div className="chart-labels">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>
      
      <div className="volume-stats">
        <div className="volume-summary">
          <h5>Summary</h5>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Peak Volume</span>
              <span className="summary-value">{formatCurrency(Math.max(...volumeHistory.map(d => d.volume)))}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Volume</span>
              <span className="summary-value">{formatCurrency(volumeHistory.reduce((sum, d) => sum + d.volume, 0) / volumeHistory.length)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Trades</span>
              <span className="summary-value">{volumeHistory.reduce((sum, d) => sum + d.trades, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTokensTab = () => (
    <div className="tokens-tab">
      <h4>🪙 Token Analytics</h4>
      <div className="tokens-table">
        <div className="table-header">
          <span>Token</span>
          <span>Volume</span>
          <span>Trades</span>
          <span>Price Change</span>
          <span>Users</span>
          <span>Liquidity</span>
        </div>
        
        {tokenAnalytics.map((token, index) => (
          <div key={index} className="table-row">
            <span className="token-cell">
              <span className="token-icon">🌙</span>
              {token.symbol}
            </span>
            <span className="volume-cell">{formatCurrency(token.totalVolume)}</span>
            <span className="trades-cell">{token.trades.toLocaleString()}</span>
            <span className="change-cell">{formatPercent(token.priceChange)}</span>
            <span className="users-cell">{token.userCount}</span>
            <span className="liquidity-cell">{formatCurrency(token.liquidity)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="trends-tab">
      <h4>🔥 Market Trends</h4>
      
      <div className="trending-section">
        <h5>📱 Trending Tokens</h5>
        <div className="trending-grid">
          {marketData.trending.map((token, index) => (
            <div key={index} className="trending-card">
              <div className="trending-rank">#{index + 1}</div>
              <div className="trending-info">
                <span className="trending-symbol">{token.symbol}</span>
                <span className="trending-volume">{formatCurrency(token.volume)}</span>
                <span className="trending-searches">{token.searches.toLocaleString()} searches</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="insights-section">
        <h5>💡 Market Insights</h5>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🚀</div>
            <div className="insight-content">
              <h6>High Momentum</h6>
              <p>SOL showing strong upward momentum with 15% gain in 24h. Consider position sizing.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <h6>Risk Alert</h6>
              <p>Unusual whale activity detected in BONK. Monitor for potential price volatility.</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h6>Volume Spike</h6>
              <p>JUP experiencing 3x normal volume. Potential breakout pattern forming.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="analytics-modal-overlay">
      <div className="analytics-modal">
        <div className="analytics-header">
          <h2>📊 Analytics Dashboard</h2>
          <div className="header-controls">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
            <button className="refresh-btn" onClick={loadAnalyticsData}>
              🔄 Refresh
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <span>Loading analytics data...</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="analytics-tabs">
          <button 
            className={selectedTab === 'overview' ? 'active' : ''}
            onClick={() => setSelectedTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={selectedTab === 'volume' ? 'active' : ''}
            onClick={() => setSelectedTab('volume')}
          >
            📈 Volume
          </button>
          <button 
            className={selectedTab === 'tokens' ? 'active' : ''}
            onClick={() => setSelectedTab('tokens')}
          >
            🪙 Tokens
          </button>
          <button 
            className={selectedTab === 'trends' ? 'active' : ''}
            onClick={() => setSelectedTab('trends')}
          >
            🔥 Trends
          </button>
        </div>

        <div className="analytics-content">
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'volume' && renderVolumeTab()}
          {selectedTab === 'tokens' && renderTokensTab()}
          {selectedTab === 'trends' && renderTrendsTab()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

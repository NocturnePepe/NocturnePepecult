import React, { useState, useEffect } from 'react';
import './AnalyticsPage.css';

interface AnalyticsData {
  totalVolume: number;
  totalTrades: number;
  uniqueUsers: number;
  averageTradeSize: number;
  topTokens: TokenAnalytics[];
  recentActivity: TradeActivity[];
  performanceMetrics: PerformanceData;
}

interface TokenAnalytics {
  symbol: string;
  volume: number;
  trades: number;
  change24h: number;
  price: number;
}

interface TradeActivity {
  timestamp: string;
  type: string;
  amount: number;
  token: string;
  txId: string;
}

interface PerformanceData {
  successRate: number;
  averageTime: number;
  totalFees: number;
  slippageAvg: number;
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string>('volume');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      totalVolume: Math.floor(Math.random() * 10000000) + 1000000,
      totalTrades: Math.floor(Math.random() * 50000) + 10000,
      uniqueUsers: Math.floor(Math.random() * 5000) + 1000,
      averageTradeSize: parseFloat((Math.random() * 5000 + 500).toFixed(2)),
      topTokens: [
        { symbol: 'SOL', volume: 2500000, trades: 12500, change24h: 5.4, price: 142.35 },
        { symbol: 'USDC', volume: 1800000, trades: 8900, change24h: -0.1, price: 1.00 },
        { symbol: 'RAY', volume: 950000, trades: 5600, change24h: 12.8, price: 3.45 },
        { symbol: 'SRM', volume: 780000, trades: 4200, change24h: -3.2, price: 0.58 },
        { symbol: 'COPE', volume: 650000, trades: 3800, change24h: 8.9, price: 0.12 }
      ],
      recentActivity: generateRecentActivity(),
      performanceMetrics: {
        successRate: 98.7,
        averageTime: 2.3,
        totalFees: 15420.50,
        slippageAvg: 0.15
      }
    };
    
    setAnalyticsData(mockData);
    setIsLoading(false);
  };

  const generateRecentActivity = (): TradeActivity[] => {
    const activities = [];
    const tokens = ['SOL', 'USDC', 'RAY', 'SRM', 'COPE'];
    const types = ['Swap', 'Add Liquidity', 'Remove Liquidity'];
    
    for (let i = 0; i < 10; i++) {
      activities.push({
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        type: types[Math.floor(Math.random() * types.length)],
        amount: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
        token: tokens[Math.floor(Math.random() * tokens.length)],
        txId: Math.random().toString(36).substring(2, 15)
      });
    }
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const getTimeAgo = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="mystical-loader"></div>
          <div className="loading-text holo-text">Analyzing mystical data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header holo-card">
        <h1 className="holo-text">📊 Analytics Scrying</h1>
        <p className="font-mystical">Peer into the depths of trading data and market mysteries</p>
        
        <div className="timeframe-selector">
          {['1h', '24h', '7d', '30d'].map(period => (
            <button
              key={period}
              className={`timeframe-btn ${timeframe === period ? 'active' : ''}`}
              onClick={() => setTimeframe(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-content">
        {/* Key Metrics */}
        <div className="metrics-overview">
          <div className="metric-card holo-card">
            <div className="metric-icon">💰</div>
            <div className="metric-value holo-text">{formatCurrency(analyticsData?.totalVolume || 0)}</div>
            <div className="metric-label">Total Volume</div>
            <div className="metric-change positive">+12.5%</div>
          </div>
          
          <div className="metric-card holo-card">
            <div className="metric-icon">🔄</div>
            <div className="metric-value holo-text">{formatNumber(analyticsData?.totalTrades || 0)}</div>
            <div className="metric-label">Total Trades</div>
            <div className="metric-change positive">+8.3%</div>
          </div>
          
          <div className="metric-card holo-card">
            <div className="metric-icon">👥</div>
            <div className="metric-value holo-text">{formatNumber(analyticsData?.uniqueUsers || 0)}</div>
            <div className="metric-label">Unique Users</div>
            <div className="metric-change positive">+15.7%</div>
          </div>
          
          <div className="metric-card holo-card">
            <div className="metric-icon">📈</div>
            <div className="metric-value holo-text">{formatCurrency(analyticsData?.averageTradeSize || 0)}</div>
            <div className="metric-label">Avg Trade Size</div>
            <div className="metric-change negative">-2.1%</div>
          </div>
        </div>

        <div className="analytics-grid">
          {/* Top Tokens */}
          <div className="top-tokens holo-card">
            <h2 className="ember-glow">Top Tokens by Volume</h2>
            <div className="tokens-list">
              {analyticsData?.topTokens.map((token, index) => (
                <div key={token.symbol} className="token-row">
                  <div className="token-rank">#{index + 1}</div>
                  <div className="token-info">
                    <div className="token-symbol">{token.symbol}</div>
                    <div className="token-price">{formatCurrency(token.price)}</div>
                  </div>
                  <div className="token-stats">
                    <div className="token-volume">{formatCurrency(token.volume)}</div>
                    <div className="token-trades">{formatNumber(token.trades)} trades</div>
                  </div>
                  <div className={`token-change ${token.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="performance-metrics holo-card">
            <h2 className="ember-glow">Performance Insights</h2>
            <div className="performance-grid">
              <div className="performance-item">
                <div className="performance-label">Success Rate</div>
                <div className="performance-value holo-text">
                  {analyticsData?.performanceMetrics.successRate}%
                </div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill success" 
                    style={{ width: `${analyticsData?.performanceMetrics.successRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="performance-item">
                <div className="performance-label">Avg Execution Time</div>
                <div className="performance-value holo-text">
                  {analyticsData?.performanceMetrics.averageTime}s
                </div>
                <div className="performance-indicator fast">⚡ Fast</div>
              </div>
              
              <div className="performance-item">
                <div className="performance-label">Total Fees Collected</div>
                <div className="performance-value holo-text">
                  {formatCurrency(analyticsData?.performanceMetrics.totalFees || 0)}
                </div>
                <div className="performance-trend">📈 +5.2%</div>
              </div>
              
              <div className="performance-item">
                <div className="performance-label">Average Slippage</div>
                <div className="performance-value holo-text">
                  {analyticsData?.performanceMetrics.slippageAvg}%
                </div>
                <div className="performance-indicator excellent">✨ Excellent</div>
              </div>
            </div>
          </div>

          {/* Volume Chart Placeholder */}
          <div className="volume-chart holo-card">
            <h2 className="ember-glow">Volume Trends</h2>
            <div className="chart-placeholder">
              <div className="chart-bars">
                {Array.from({ length: 24 }, (_, i) => (
                  <div 
                    key={i} 
                    className="chart-bar" 
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
              <div className="chart-label">24h Volume Distribution</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity holo-card">
            <h2 className="ember-glow">Recent Activity</h2>
            <div className="activity-list">
              {analyticsData?.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'Swap' ? '🔄' : 
                     activity.type === 'Add Liquidity' ? '➕' : '➖'}
                  </div>
                  <div className="activity-details">
                    <div className="activity-type">{activity.type}</div>
                    <div className="activity-amount">
                      {activity.amount} {activity.token}
                    </div>
                  </div>
                  <div className="activity-meta">
                    <div className="activity-time">{getTimeAgo(activity.timestamp)}</div>
                    <div className="activity-tx">
                      {activity.txId.slice(0, 6)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="export-section holo-card">
          <h2 className="ember-glow">Export Mystical Data</h2>
          <div className="export-buttons">
            <button className="glow-btn">📊 Download CSV</button>
            <button className="glow-btn">📋 Copy to Clipboard</button>
            <button className="glow-btn">📧 Email Report</button>
            <button className="glow-btn">🔗 Share Link</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

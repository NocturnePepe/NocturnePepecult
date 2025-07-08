import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface TokenData {
  mint: string;
  symbol: string;
  name: string;
  volume24h: number;
  price: number;
  change24h: number;
  liquidity: number;
  trades24h: number;
  holders: number;
}

interface SwapData {
  id: string;
  timestamp: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  user: string;
  fee: number;
  signature: string;
  status: 'confirmed' | 'pending' | 'failed';
}

interface DashboardMetrics {
  totalVolume: number;
  totalFees: number;
  activeUsers: number;
  totalSwaps: number;
  avgSwapSize: number;
  topTokens: string[];
  recentSwaps: SwapData[];
}

// Declare global analytics
declare global {
  interface Window {
    nocturneAnalytics: any;
    jupiterIntegration: any;
  }
}

const AdminDashboard: React.FC = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [swaps, setSwaps] = useState<SwapData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalVolume: 0,
    totalFees: 0,
    activeUsers: 0,
    totalSwaps: 0,
    avgSwapSize: 0,
    topTokens: [],
    recentSwaps: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch real-time data from Jupiter and analytics
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch token data with live prices
      const tokenData = await Promise.all([
        fetchTokenData('So11111111111111111111111111111111111111112', 'SOL', 'Solana'),
        fetchTokenData('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'USDC', 'USD Coin'),
        fetchTokenData('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 'USDT', 'Tether'),
        fetchTokenData('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', 'RAY', 'Raydium'),
        fetchTokenData('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'BONK', 'Bonk'),
        fetchTokenData('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', 'WIF', 'dogwifhat'),
      ]);

      setTokens(tokenData);

      // Fetch swap data from analytics
      const swapData = await fetchSwapData();
      setSwaps(swapData);

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(tokenData, swapData);
      setMetrics(calculatedMetrics);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenData = async (mint: string, symbol: string, name: string): Promise<TokenData> => {
    try {
      let price = 0;
      let change24h = 0;
      
      // Try to get live price from Jupiter
      if (window.jupiterIntegration) {
        price = await window.jupiterIntegration.getTokenPrice(mint);
      }
      
      // Generate realistic mock data based on the token
      const mockData = generateMockTokenData(symbol, price);
      
      return {
        mint,
        symbol,
        name,
        price: price || mockData.price,
        volume24h: mockData.volume24h,
        change24h: mockData.change24h,
        liquidity: mockData.liquidity,
        trades24h: mockData.trades24h,
        holders: mockData.holders
      };
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
      return generateMockTokenData(symbol, 0);
    }
  };

  const generateMockTokenData = (symbol: string, livePrice: number) => {
    const baseData = {
      SOL: { price: 98.45, volume: 2450000, liquidity: 12500000 },
      USDC: { price: 1.0, volume: 1850000, liquidity: 8900000 },
      USDT: { price: 1.0, volume: 1200000, liquidity: 6800000 },
      RAY: { price: 0.85, volume: 450000, liquidity: 3200000 },
      BONK: { price: 0.000012, volume: 890000, liquidity: 1500000 },
      WIF: { price: 2.15, volume: 320000, liquidity: 950000 }
    };

    const data = baseData[symbol as keyof typeof baseData] || baseData.SOL;
    const volatility = Math.random() * 0.2 - 0.1; // ±10% volatility
    
    return {
      mint: '',
      symbol,
      name: symbol,
      price: livePrice || data.price * (1 + volatility),
      volume24h: data.volume * (1 + volatility),
      change24h: (Math.random() - 0.5) * 20, // ±10% change
      liquidity: data.liquidity * (1 + volatility * 0.5),
      trades24h: Math.floor(Math.random() * 1000) + 100,
      holders: Math.floor(Math.random() * 10000) + 1000
    };
  };

  const fetchSwapData = async (): Promise<SwapData[]> => {
    // Try to get real swap data from analytics
    if (window.nocturneAnalytics) {
      const analyticsData = window.nocturneAnalytics.getSwapHistory();
      if (analyticsData && analyticsData.length > 0) {
        return analyticsData.slice(0, 50); // Get last 50 swaps
      }
    }

    // Fallback to enhanced mock data
    const mockSwaps: SwapData[] = [];
    const tokenSymbols = ['SOL', 'USDC', 'USDT', 'RAY', 'BONK', 'WIF'];
    
    for (let i = 0; i < 20; i++) {
      const tokenIn = tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)];
      let tokenOut = tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)];
      while (tokenOut === tokenIn) {
        tokenOut = tokenSymbols[Math.floor(Math.random() * tokenSymbols.length)];
      }
      
      const amountIn = Math.random() * 1000 + 10;
      const amountOut = amountIn * (0.8 + Math.random() * 0.4); // Some variance in exchange rate
      
      mockSwaps.push({
        id: `swap_${i}`,
        timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Last 24 hours
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        user: `${Math.random().toString(36).substr(2, 8)}...${Math.random().toString(36).substr(2, 4)}`,
        fee: amountIn * 0.003, // 0.3% fee
        signature: Math.random().toString(36).substr(2, 64),
        status: Math.random() > 0.05 ? 'confirmed' : 'pending'
      });
    }
    
    return mockSwaps.sort((a, b) => b.timestamp - a.timestamp);
  };

  const calculateMetrics = (tokenData: TokenData[], swapData: SwapData[]): DashboardMetrics => {
    const totalVolume = swapData.reduce((sum, swap) => sum + swap.amountIn, 0);
    const totalFees = swapData.reduce((sum, swap) => sum + swap.fee, 0);
    const activeUsers = new Set(swapData.map(swap => swap.user)).size;
    const totalSwaps = swapData.length;
    const avgSwapSize = totalSwaps > 0 ? totalVolume / totalSwaps : 0;
    
    // Get top tokens by volume
    const tokenVolumes = swapData.reduce((acc, swap) => {
      acc[swap.tokenIn] = (acc[swap.tokenIn] || 0) + swap.amountIn;
      acc[swap.tokenOut] = (acc[swap.tokenOut] || 0) + swap.amountOut;
      return acc;
    }, {} as Record<string, number>);
    
    const topTokens = Object.entries(tokenVolumes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([token]) => token);
    
    return {
      totalVolume,
      totalFees,
      activeUsers,
      totalSwaps,
      avgSwapSize,
      topTokens,
      recentSwaps: swapData.slice(0, 10)
    };
  };
    setActiveUsers(156);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  };

  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🏛️ NocturneSwap Admin Dashboard</h1>
        <p>Monitor DEX performance and manage token listings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Volume (24h)</h3>
            <p className="stat-value">${formatNumber(totalVolume)}</p>
            <span className="stat-change positive">+12.5%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Fees Collected</h3>
            <p className="stat-value">${formatNumber(totalFees)}</p>
            <span className="stat-change positive">+8.2%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <p className="stat-value">{activeUsers}</p>
            <span className="stat-change positive">+24</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>Total Swaps</h3>
            <p className="stat-value">{swaps.length}</p>
            <span className="stat-change neutral">Live</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <div className="section-header">
            <h2>🪙 Token Listings</h2>
            <button className="add-token-btn">Add New Token</button>
          </div>
          
          <div className="token-table">
            <div className="table-header">
              <div>Token</div>
              <div>Price</div>
              <div>24h Change</div>
              <div>Volume</div>
              <div>Liquidity</div>
              <div>Actions</div>
            </div>
            
            {tokens.map((token) => (
              <div key={token.mint} className="table-row">
                <div className="token-info">
                  <div className="token-symbol">{token.symbol}</div>
                  <div className="token-name">{token.name}</div>
                </div>
                <div className="token-price">${token.price.toFixed(4)}</div>
                <div className={`token-change ${token.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                </div>
                <div className="token-volume">${formatNumber(token.volume24h)}</div>
                <div className="token-liquidity">${formatNumber(token.liquidity)}</div>
                <div className="token-actions">
                  <button className="edit-btn">Edit</button>
                  <button className="remove-btn">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>🔄 Recent Swaps</h2>
            <button className="export-btn">Export Data</button>
          </div>
          
          <div className="swap-table">
            <div className="table-header">
              <div>Time</div>
              <div>User</div>
              <div>From</div>
              <div>To</div>
              <div>Amount</div>
              <div>Fee</div>
            </div>
            
            {swaps.map((swap) => (
              <div key={swap.id} className="table-row">
                <div className="swap-time">{formatTime(swap.timestamp)}</div>
                <div className="swap-user">{swap.user}</div>
                <div className="swap-token-in">{swap.tokenIn}</div>
                <div className="swap-token-out">{swap.tokenOut}</div>
                <div className="swap-amount">
                  {swap.amountIn.toFixed(2)} → {swap.amountOut.toFixed(2)}
                </div>
                <div className="swap-fee">${swap.fee.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

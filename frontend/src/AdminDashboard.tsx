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
}

const AdminDashboard: React.FC = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [swaps, setSwaps] = useState<SwapData[]>([]);
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [totalFees, setTotalFees] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);

  // Mock data - in production, fetch from Solana RPC and your backend
  useEffect(() => {
    const mockTokens: TokenData[] = [
      {
        mint: '11111111111111111111111111111111',
        symbol: 'NCTP',
        name: 'NocturnePepe',
        volume24h: 125000,
        price: 0.0023,
        change24h: 15.6,
        liquidity: 850000
      },
      {
        mint: '22222222222222222222222222222222',
        symbol: 'SOL',
        name: 'Solana',
        volume24h: 2450000,
        price: 98.45,
        change24h: -2.1,
        liquidity: 12500000
      },
      {
        mint: '33333333333333333333333333333333',
        symbol: 'USDC',
        name: 'USD Coin',
        volume24h: 1850000,
        price: 1.0,
        change24h: 0.1,
        liquidity: 8900000
      }
    ];

    const mockSwaps: SwapData[] = [
      {
        id: 'swap1',
        timestamp: Date.now() - 300000,
        tokenIn: 'NCTP',
        tokenOut: 'SOL',
        amountIn: 1000,
        amountOut: 2.3,
        user: 'user1...abc',
        fee: 0.1
      },
      {
        id: 'swap2',
        timestamp: Date.now() - 600000,
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 5.0,
        amountOut: 492.25,
        user: 'user2...def',
        fee: 0.05
      },
      {
        id: 'swap3',
        timestamp: Date.now() - 900000,
        tokenIn: 'USDC',
        tokenOut: 'NCTP',
        amountIn: 100,
        amountOut: 43478.26,
        user: 'user3...ghi',
        fee: 0.1
      }
    ];

    setTokens(mockTokens);
    setSwaps(mockSwaps);
    setTotalVolume(4425000);
    setTotalFees(1250.75);
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

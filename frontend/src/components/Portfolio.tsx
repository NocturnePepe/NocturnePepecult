// Portfolio.tsx - User portfolio tracking with cult theme
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { cultSounds } from '../SoundEffects.js';
import './Portfolio.css';

interface TokenBalance {
  symbol: string;
  name: string;
  mint: string;
  balance: number;
  usdValue: number;
  change24h: number;
}

interface Transaction {
  id: string;
  type: 'swap' | 'send' | 'receive';
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  timestamp: Date;
  txHash: string;
  status: 'success' | 'pending' | 'failed';
}

interface PortfolioProps {
  connection: Connection;
  isVisible: boolean;
  onClose: () => void;
}

const Portfolio = ({ connection, isVisible, onClose }: PortfolioProps) => {
  const { publicKey, connected } = useWallet();
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('balances');
  const [totalUsdValue, setTotalUsdValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);

  // Mock data for demonstration (in production, fetch from blockchain/APIs)
  const mockBalances: TokenBalance[] = [
    {
      symbol: 'SOL',
      name: 'Solana',
      mint: 'So11111111111111111111111111111111111111112',
      balance: 5.234,
      usdValue: 623.45,
      change24h: 3.2
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      balance: 1250.50,
      usdValue: 1250.50,
      change24h: 0.1
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      balance: 1000000,
      usdValue: 15.23,
      change24h: -12.5
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'swap',
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amountIn: 1.5,
      amountOut: 178.25,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      txHash: '5k7..8n2',
      status: 'success'
    },
    {
      id: '2',
      type: 'swap',
      tokenIn: 'USDC',
      tokenOut: 'BONK',
      amountIn: 50,
      amountOut: 500000,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      txHash: '9m1..4x7',
      status: 'success'
    }
  ];

  // Fetch SOL balance
  const fetchSolBalance = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return 0;
    }
  }, [publicKey, connection]);

  // Load portfolio data
  const loadPortfolioData = useCallback(async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      // In production, fetch real balances from SPL tokens and price data
      // For demo, use mock data with real SOL balance
      const solBalance = await fetchSolBalance();
      
      const updatedBalances = [...mockBalances];
      if (solBalance !== undefined) {
        const solIndex = updatedBalances.findIndex(b => b.symbol === 'SOL');
        if (solIndex >= 0) {
          updatedBalances[solIndex].balance = solBalance;
          // Would fetch real price here
          updatedBalances[solIndex].usdValue = solBalance * 119.15; // Mock price
        }
      }

      setBalances(updatedBalances);
      setTransactions(mockTransactions);

      // Calculate totals
      const total = updatedBalances.reduce((sum, balance) => sum + balance.usdValue, 0);
      setTotalUsdValue(total);
      
      // Mock P&L calculation
      const pnl = updatedBalances.reduce((sum, balance) => 
        sum + (balance.usdValue * balance.change24h / 100), 0);
      setTotalPnl(pnl);

    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, fetchSolBalance]);

  // Load data when component mounts or wallet connects
  useEffect(() => {
    if (isVisible && connected) {
      loadPortfolioData();
    }
  }, [isVisible, connected, loadPortfolioData]);

  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatTokenAmount = (amount: number, symbol: string): string => {
    if (symbol === 'BONK' || amount > 1000) {
      return amount.toLocaleString();
    }
    return amount.toFixed(6);
  };

  const formatTimeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isVisible) return null;

  return (
    <div className="portfolio-overlay">
      <div className="portfolio-modal">
        <div className="portfolio-header">
          <h3>🏦 NocturnePepe Portfolio</h3>
          <button 
            className="portfolio-close"
            onClick={async () => {
              await cultSounds.playHoverSound();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {!connected ? (
          <div className="portfolio-connect">
            <p>🔗 Connect your wallet to view portfolio</p>
          </div>
        ) : (
          <>
            <div className="portfolio-summary">
              <div className="total-value">
                <span className="label">Total Portfolio Value</span>
                <span className="value">{formatUSD(totalUsdValue)}</span>
              </div>
              <div className="pnl">
                <span className="label">24h P&L</span>
                <span className={`value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
                  {totalPnl >= 0 ? '+' : ''}{formatUSD(totalPnl)} ({((totalPnl / totalUsdValue) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="portfolio-tabs">
              <button
                className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('balances');
                  await cultSounds.playHoverSound();
                }}
              >
                💰 Balances
              </button>
              <button
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('history');
                  await cultSounds.playHoverSound();
                }}
              >
                📜 History
              </button>
            </div>

            <div className="portfolio-content">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>Loading portfolio data...</span>
                </div>
              ) : activeTab === 'balances' ? (
                <div className="balances-list">
                  {balances.map((balance) => (
                    <div key={balance.mint} className="balance-item">
                      <div className="token-info">
                        <div className="token-symbol">{balance.symbol}</div>
                        <div className="token-name">{balance.name}</div>
                      </div>
                      <div className="balance-amounts">
                        <div className="token-amount">
                          {formatTokenAmount(balance.balance, balance.symbol)} {balance.symbol}
                        </div>
                        <div className="usd-amount">{formatUSD(balance.usdValue)}</div>
                        <div className={`change-amount ${balance.change24h >= 0 ? 'positive' : 'negative'}`}>
                          {balance.change24h >= 0 ? '+' : ''}{balance.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="transactions-list">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="transaction-item">
                      <div className="tx-info">
                        <div className="tx-type">
                          {tx.type === 'swap' ? '🔄' : tx.type === 'send' ? '📤' : '📥'} 
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </div>
                        <div className="tx-details">
                          {tx.type === 'swap' 
                            ? `${formatTokenAmount(tx.amountIn, tx.tokenIn)} ${tx.tokenIn} → ${formatTokenAmount(tx.amountOut, tx.tokenOut)} ${tx.tokenOut}`
                            : `${formatTokenAmount(tx.amountIn, tx.tokenIn)} ${tx.tokenIn}`
                          }
                        </div>
                        <div className="tx-time">{formatTimeAgo(tx.timestamp)}</div>
                      </div>
                      <div className="tx-status">
                        <span className={`status-badge ${tx.status}`}>
                          {tx.status === 'success' ? '✅' : tx.status === 'pending' ? '⏳' : '❌'}
                        </span>
                        <div className="tx-hash">
                          <a 
                            href={`https://solscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => cultSounds.playHoverSound()}
                          >
                            {tx.txHash}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="portfolio-actions">
              <button 
                className="refresh-btn"
                onClick={async () => {
                  await cultSounds.playHoverSound();
                  loadPortfolioData();
                }}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

import React from 'react';
import { useMockWallet } from '../contexts/MockWalletContext';
import './PortfolioPage.css';

const PortfolioPage: React.FC = () => {
  const { wallet, userStats } = useMockWallet();

  const portfolioValue = React.useMemo(() => {
    return wallet ? (wallet.balance * 98.5 + Math.random() * 1000).toFixed(2) : '0.00';
  }, [wallet?.balance]);

  const dailyChange = React.useMemo(() => {
    const change = (Math.random() - 0.5) * 20;
    return change;
  }, []);

  const mockHoldings = [
    { symbol: 'SOL', name: 'Solana', amount: wallet?.balance || 0, value: (wallet?.balance || 0) * 98.5, change: 2.3 },
    { symbol: 'NCTP', name: 'NocturnePepe', amount: userStats.xp * 0.01, value: userStats.xp * 0.0012, change: 12.8 },
    { symbol: 'USDC', name: 'USD Coin', amount: 250.5, value: 250.5, change: 0.1 },
    { symbol: 'RAY', name: 'Raydium', amount: 85.2, value: 342.8, change: -1.5 }
  ];

  const mockTransactions = [
    { type: 'swap', from: 'SOL', to: 'USDC', amount: '2.5 SOL', time: '2 mins ago', status: 'confirmed' },
    { type: 'swap', from: 'USDC', to: 'NCTP', amount: '150 USDC', time: '1 hour ago', status: 'confirmed' },
    { type: 'add_liquidity', from: 'SOL', to: 'USDC', amount: '1.0 SOL', time: '3 hours ago', status: 'confirmed' },
    { type: 'swap', from: 'RAY', to: 'SOL', amount: '25 RAY', time: '1 day ago', status: 'confirmed' }
  ];

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h1>📊 Portfolio Overview</h1>
        <p>Track your assets and performance</p>
      </div>

      <div className="portfolio-content">
        <div className="portfolio-summary">
          <div className="portfolio-value-card">
            <div className="portfolio-total">
              <div className="total-value">${portfolioValue}</div>
              <div className={`total-change ${dailyChange > 0 ? 'positive' : 'negative'}`}>
                {dailyChange > 0 ? '+' : ''}{dailyChange.toFixed(2)}% (24h)
              </div>
            </div>
            <div className="portfolio-metrics">
              <div className="metric">
                <span className="metric-label">Total Trades</span>
                <span className="metric-value">{userStats.achievements.length + 12}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Win Rate</span>
                <span className="metric-value">78.5%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Best Trade</span>
                <span className="metric-value positive">+24.8%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="portfolio-sections">
          <div className="holdings-section">
            <h2>💎 Holdings</h2>
            <div className="holdings-list">
              {mockHoldings.map((holding, index) => (
                <div key={index} className="holding-item">
                  <div className="holding-info">
                    <div className="holding-symbol">{holding.symbol}</div>
                    <div className="holding-name">{holding.name}</div>
                  </div>
                  <div className="holding-amount">
                    <div className="amount">{holding.amount.toFixed(4)}</div>
                    <div className="value">${holding.value.toFixed(2)}</div>
                  </div>
                  <div className={`holding-change ${holding.change > 0 ? 'positive' : 'negative'}`}>
                    {holding.change > 0 ? '+' : ''}{holding.change.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="transactions-section">
            <h2>⏱️ Recent Transactions</h2>
            <div className="transactions-list">
              {mockTransactions.map((tx, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-type">
                    <span className="tx-icon">
                      {tx.type === 'swap' ? '🔄' : tx.type === 'add_liquidity' ? '💧' : '📤'}
                    </span>
                    <span className="tx-label">
                      {tx.type === 'swap' ? 'Swap' : tx.type === 'add_liquidity' ? 'Add Liquidity' : 'Transfer'}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <div className="tx-amount">{tx.amount}</div>
                    <div className="tx-pair">{tx.from} → {tx.to}</div>
                  </div>
                  <div className="transaction-meta">
                    <div className="tx-time">{tx.time}</div>
                    <div className={`tx-status ${tx.status}`}>
                      {tx.status === 'confirmed' ? '✅' : '⏳'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;

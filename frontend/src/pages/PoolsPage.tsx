import React from 'react';
import './PoolsPage.css';

interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  tvl: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  myLiquidity: number;
}

const PoolsPage: React.FC = () => {
  const [pools] = React.useState<Pool[]>([
    {
      id: '1',
      tokenA: 'NCTP',
      tokenB: 'SOL',
      tvl: 250000,
      volume24h: 125000,
      fees24h: 375,
      apy: 24.5,
      myLiquidity: 1250
    },
    {
      id: '2',
      tokenA: 'SOL',
      tokenB: 'USDC',
      tvl: 1850000,
      volume24h: 920000,
      fees24h: 2760,
      apy: 18.2,
      myLiquidity: 0
    },
    {
      id: '3',
      tokenA: 'USDC',
      tokenB: 'NCTP',
      tvl: 180000,
      volume24h: 89000,
      fees24h: 267,
      apy: 32.1,
      myLiquidity: 850
    }
  ]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  };

  return (
    <div className="pools-page">
      <div className="pools-header">
        <div className="header-content">
          <h1>🏊 Liquidity Pools</h1>
          <p>Provide liquidity and earn fees from trading</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn">Create Pool</button>
          <button className="secondary-btn">My Positions</button>
        </div>
      </div>

      <div className="pools-stats">
        <div className="stat-item">
          <div className="stat-value">${formatNumber(2280000)}</div>
          <div className="stat-label">Total TVL</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">${formatNumber(1134000)}</div>
          <div className="stat-label">24h Volume</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">${formatNumber(3402)}</div>
          <div className="stat-label">24h Fees</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{pools.length}</div>
          <div className="stat-label">Active Pools</div>
        </div>
      </div>

      <div className="pools-table">
        <div className="table-header">
          <div className="col-pool">Pool</div>
          <div className="col-tvl">TVL</div>
          <div className="col-volume">24h Volume</div>
          <div className="col-fees">24h Fees</div>
          <div className="col-apy">APY</div>
          <div className="col-liquidity">My Liquidity</div>
          <div className="col-actions">Actions</div>
        </div>

        {pools.map((pool) => (
          <div key={pool.id} className="table-row">
            <div className="col-pool">
              <div className="pool-tokens">
                <div className="token-pair">
                  <span className="token-a">{pool.tokenA}</span>
                  <span className="pair-separator">/</span>
                  <span className="token-b">{pool.tokenB}</span>
                </div>
                <div className="pool-fee">0.3% Fee</div>
              </div>
            </div>
            
            <div className="col-tvl">
              <div className="tvl-value">${formatNumber(pool.tvl)}</div>
            </div>
            
            <div className="col-volume">
              <div className="volume-value">${formatNumber(pool.volume24h)}</div>
            </div>
            
            <div className="col-fees">
              <div className="fees-value">${formatNumber(pool.fees24h)}</div>
            </div>
            
            <div className="col-apy">
              <div className="apy-value">{pool.apy}%</div>
            </div>
            
            <div className="col-liquidity">
              <div className="liquidity-value">
                {pool.myLiquidity > 0 ? `$${formatNumber(pool.myLiquidity)}` : '-'}
              </div>
            </div>
            
            <div className="col-actions">
              <div className="action-buttons">
                <button className="add-btn">Add</button>
                {pool.myLiquidity > 0 && (
                  <button className="remove-btn">Remove</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pools-info">
        <div className="info-card">
          <h3>💡 How Liquidity Pools Work</h3>
          <ul>
            <li>Provide equal value of both tokens to earn trading fees</li>
            <li>Fees are distributed proportionally to your pool share</li>
            <li>Be aware of impermanent loss when token prices diverge</li>
            <li>You can withdraw your liquidity at any time</li>
          </ul>
        </div>
        
        <div className="info-card">
          <h3>🔥 Top Earning Pools</h3>
          <div className="top-pools">
            <div className="top-pool-item">
              <span className="pool-name">USDC/NCTP</span>
              <span className="pool-apy">32.1% APY</span>
            </div>
            <div className="top-pool-item">
              <span className="pool-name">NCTP/SOL</span>
              <span className="pool-apy">24.5% APY</span>
            </div>
            <div className="top-pool-item">
              <span className="pool-name">SOL/USDC</span>
              <span className="pool-apy">18.2% APY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolsPage;

import React from 'react';
import './SwapPage.css';

// Simplified swap component for demo
const SwapDemo: React.FC = () => {
  const [tokenAAmount, setTokenAAmount] = React.useState('');
  const [tokenBAmount, setTokenBAmount] = React.useState('');
  const [slippage, setSlippage] = React.useState(1);

  const handleSwap = () => {
    alert('Swap functionality will be available once wallet dependencies are installed!');
  };

  return (
    <div className="swap-interface">
      <div className="swap-container">
        <div className="swap-header">
          <h2>🌙 Token Swap</h2>
          <p>Trade tokens with minimal slippage</p>
        </div>

        <div className="swap-form">
          <div className="token-input">
            <label>From</label>
            <div className="input-group">
              <input
                type="number"
                value={tokenAAmount}
                onChange={(e) => setTokenAAmount(e.target.value)}
                placeholder="0.0"
              />
              <select className="token-select">
                <option>NCTP</option>
                <option>SOL</option>
                <option>USDC</option>
              </select>
            </div>
          </div>

          <div className="swap-arrow">
            <button>⇅</button>
          </div>

          <div className="token-input">
            <label>To</label>
            <div className="input-group">
              <input
                type="number"
                value={tokenBAmount}
                onChange={(e) => setTokenBAmount(e.target.value)}
                placeholder="0.0"
              />
              <select className="token-select">
                <option>SOL</option>
                <option>USDC</option>
                <option>NCTP</option>
              </select>
            </div>
          </div>

          <div className="swap-details">
            <div className="detail-row">
              <span>Slippage</span>
              <span>{slippage}%</span>
            </div>
          </div>

          <button className="swap-button" onClick={handleSwap}>
            Connect Wallet to Swap
          </button>
        </div>
      </div>
    </div>
  );
};

const SwapPage: React.FC = () => {
  return (
    <div className="swap-page">
      <div className="swap-page-header">
        <h1>🔄 Token Swap</h1>
        <p>Trade tokens instantly with minimal slippage</p>
      </div>
      
      <div className="swap-page-content">
        <div className="swap-main">
          <SwapDemo />
        </div>
        
        <div className="swap-sidebar">
          <div className="price-chart">
            <h3>📊 Price Chart</h3>
            <div className="chart-placeholder">
              <p>Real-time price chart will be displayed here</p>
              <div className="mock-chart">
                <div className="chart-line"></div>
                <div className="chart-bars">
                  <div className="bar" style={{height: '20%'}}></div>
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '35%'}}></div>
                  <div className="bar" style={{height: '65%'}}></div>
                  <div className="bar" style={{height: '45%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="recent-trades">
            <h3>⏱️ Recent Trades</h3>
            <div className="trades-list">
              <div className="trade-item">
                <div className="trade-pair">NCTP/SOL</div>
                <div className="trade-price">0.0023</div>
                <div className="trade-time">2m ago</div>
              </div>
              <div className="trade-item">
                <div className="trade-pair">SOL/USDC</div>
                <div className="trade-price">98.45</div>
                <div className="trade-time">5m ago</div>
              </div>
              <div className="trade-item">
                <div className="trade-pair">USDC/NCTP</div>
                <div className="trade-price">434.78</div>
                <div className="trade-time">8m ago</div>
              </div>
            </div>
          </div>
          
          <div className="swap-info">
            <h3>ℹ️ Swap Info</h3>
            <div className="info-item">
              <span>Trading Fee:</span>
              <span>0.3%</span>
            </div>
            <div className="info-item">
              <span>Max Slippage:</span>
              <span>2.0%</span>
            </div>
            <div className="info-item">
              <span>Minimum Received:</span>
              <span>Calculated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;

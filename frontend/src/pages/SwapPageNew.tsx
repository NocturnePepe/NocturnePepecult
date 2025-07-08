import React, { useState } from 'react';
import './SwapPage.css';

const SwapPage = () => {
  const [showAdvancedTrading, setShowAdvancedTrading] = useState(false);
  const [showPriceAlerts, setShowPriceAlerts] = useState(false);

  return (
    <div className="swap-page">
      <div className="swap-page-header">
        <h1>🔄 Token Swap</h1>
        <p>Trade tokens instantly with minimal slippage</p>
        <div className="swap-controls">
          <button 
            className={`control-btn ${showAdvancedTrading ? 'active' : ''}`}
            onClick={() => setShowAdvancedTrading(!showAdvancedTrading)}
          >
            📈 Advanced Trading
          </button>
          <button 
            className={`control-btn ${showPriceAlerts ? 'active' : ''}`}
            onClick={() => setShowPriceAlerts(!showPriceAlerts)}
          >
            🔔 Price Alerts
          </button>
        </div>
      </div>
      
      <div className="swap-page-content">
        <div className="swap-main">
          <div className="swap-interface-enhanced">
            <div className="swap-container">
              <div className="swap-header">
                <h2>🌙 Professional Swap Interface</h2>
                <p>Advanced trading with Jupiter integration</p>
              </div>
              <div className="swap-form">
                <div className="token-input">
                  <label>From</label>
                  <div className="input-group">
                    <input type="number" placeholder="0.0" />
                    <select className="token-select">
                      <option>NCTP 💀</option>
                      <option>SOL ⚡</option>
                      <option>USDC 💵</option>
                    </select>
                  </div>
                </div>
                <div className="swap-arrow">
                  <button>⇅</button>
                </div>
                <div className="token-input">
                  <label>To</label>
                  <div className="input-group">
                    <input type="number" placeholder="0.0" />
                    <select className="token-select">
                      <option>SOL ⚡</option>
                      <option>USDC 💵</option>
                      <option>NCTP 💀</option>
                    </select>
                  </div>
                </div>
                <div className="swap-details">
                  <div className="detail-row">
                    <span>Rate</span>
                    <span>1 NCTP = 0.00234 SOL</span>
                  </div>
                  <div className="detail-row">
                    <span>Slippage</span>
                    <span>1.0%</span>
                  </div>
                  <div className="detail-row">
                    <span>Fee</span>
                    <span>0.3%</span>
                  </div>
                </div>
                <button className="swap-button premium">
                  🌙 Swap with Jupiter Power
                </button>
              </div>
            </div>
          </div>
          
          {showAdvancedTrading && (
            <div className="advanced-trading-section">
              <div className="advanced-trading-panel">
                <h3>📈 Advanced Trading Features</h3>
                <div className="feature-grid">
                  <div className="feature-item">
                    <div className="feature-icon">🎯</div>
                    <div className="feature-text">Limit Orders</div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">📊</div>
                    <div className="feature-text">Market Analysis</div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">⚡</div>
                    <div className="feature-text">Flash Loans</div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🔄</div>
                    <div className="feature-text">Auto-Rebalancing</div>
                  </div>
                </div>
                <div className="advanced-controls">
                  <div className="control-group">
                    <label>Order Type</label>
                    <select>
                      <option>Market</option>
                      <option>Limit</option>
                      <option>Stop Loss</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label>Time in Force</label>
                    <select>
                      <option>GTC</option>
                      <option>IOC</option>
                      <option>FOK</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="swap-sidebar">
          <div className="price-chart-section">
            <h3>📊 Live Price Chart</h3>
            <div className="chart-container premium">
              <div className="chart-header">
                <div className="chart-symbol">NCTP/SOL</div>
                <div className="chart-price">
                  <span className="price">$0.00234</span>
                  <span className="change positive">+5.67%</span>
                </div>
              </div>
              <div className="chart-placeholder">
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
              <div className="chart-controls">
                <button className="timeframe-btn active">1H</button>
                <button className="timeframe-btn">1D</button>
                <button className="timeframe-btn">1W</button>
                <button className="timeframe-btn">1M</button>
              </div>
            </div>
          </div>
          
          {showPriceAlerts && (
            <div className="price-alerts-section">
              <h3>🔔 Price Alerts</h3>
              <div className="alerts-container">
                <div className="alert-item">
                  <span className="alert-condition">NCTP > $0.003</span>
                  <button className="alert-toggle active">🔔</button>
                </div>
                <div className="alert-item">
                  <span className="alert-condition">SOL < $90</span>
                  <button className="alert-toggle">🔕</button>
                </div>
                <div className="alert-item">
                  <span className="alert-condition">USDC/NCTP > 400</span>
                  <button className="alert-toggle active">🔔</button>
                </div>
                <button className="add-alert-btn">+ Add New Alert</button>
              </div>
            </div>
          )}
          
          <div className="recent-trades">
            <h3>⏱️ Recent Trades</h3>
            <div className="trades-list">
              <div className="trade-item">
                <div className="trade-pair">NCTP/SOL</div>
                <div className="trade-price positive">0.0023</div>
                <div className="trade-time">2m ago</div>
              </div>
              <div className="trade-item">
                <div className="trade-pair">SOL/USDC</div>
                <div className="trade-price negative">98.45</div>
                <div className="trade-time">5m ago</div>
              </div>
              <div className="trade-item">
                <div className="trade-pair">USDC/NCTP</div>
                <div className="trade-price positive">434.78</div>
                <div className="trade-time">8m ago</div>
              </div>
            </div>
          </div>
          
          <div className="swap-info">
            <h3>ℹ️ Trading Info</h3>
            <div className="info-item">
              <span>24h Volume:</span>
              <span>$2.3M</span>
            </div>
            <div className="info-item">
              <span>Liquidity:</span>
              <span>$15.7M</span>
            </div>
            <div className="info-item">
              <span>Trading Fee:</span>
              <span>0.3%</span>
            </div>
            <div className="info-item">
              <span>Max Slippage:</span>
              <span>2.0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;

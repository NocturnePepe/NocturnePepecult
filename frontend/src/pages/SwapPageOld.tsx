import React, { useState } from 'react';
import SwapInterface from '../components/SwapInterface';
import AdvancedTrading from '../components/AdvancedTrading';
import PriceChart from '../components/PriceChart';
import PriceAlert from '../components/PriceAlert';
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
            � Price Alerts
          </button>
        </div>
      </div>
      
      <div className="swap-page-content">
        <div className="swap-main">
          <SwapInterface />
          
          {showAdvancedTrading && (
            <div className="advanced-trading-section">
              <AdvancedTrading 
                isVisible={showAdvancedTrading}
                onClose={() => setShowAdvancedTrading(false)}
              />
            </div>
          )}
        </div>
        
        <div className="swap-sidebar">
          <div className="price-chart-section">
            <PriceChart 
              isVisible={true}
              onClose={() => {}}
              symbol="NCTP/SOL"
            />
          </div>
          
          {showPriceAlerts && (
            <div className="price-alerts-section">
              <PriceAlert 
                isVisible={showPriceAlerts}
                onClose={() => setShowPriceAlerts(false)}
              />
            </div>
          )}
          
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

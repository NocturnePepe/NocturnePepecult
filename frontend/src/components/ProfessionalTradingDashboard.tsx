import React, { useState, useEffect, useCallback } from 'react';
import { useAdvancedTrading } from '../contexts/AdvancedTradingContext';
import { useGamification } from '../contexts/GamificationContext';
import { AdvancedPortfolioAnalytics } from './AdvancedPortfolioAnalytics';
import './ProfessionalTradingDashboard.css';

interface TradingTab {
  id: string;
  label: string;
  icon: string;
}

const TRADING_TABS: TradingTab[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'spot', label: 'Spot Trading', icon: '💰' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'bots', label: 'Trading Bots', icon: '🤖' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'risk', label: 'Risk Management', icon: '🛡️' }
];

export const ProfessionalTradingDashboard: React.FC = () => {
  const {
    tradingPairs,
    selectedPair,
    setSelectedPair,
    limitOrders,
    dcaOrders,
    tradingBots,
    portfolioAnalytics,
    technicalIndicators,
    riskSettings,
    createLimitOrder,
    cancelLimitOrder,
    createDCAOrder,
    pauseDCAOrder,
    resumeDCAOrder,
    cancelDCAOrder,
    createTradingBot,
    startBot,
    stopBot,
    refreshAnalytics,
    updateRiskSettings,
    isLoading,
    error
  } = useAdvancedTrading();
  
  const { awardXP } = useGamification();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderMode, setOrderMode] = useState<'limit' | 'dca'>('limit');
  const [dcaFrequency, setDCAFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dcaTotal, setDCATotal] = useState('');
  const [dcaInterval, setDCAInterval] = useState('');

  // Handle order creation
  const handleCreateOrder = useCallback(async () => {
    if (!selectedPair || !orderAmount || !orderPrice) return;
    
    try {
      if (orderMode === 'limit') {
        await createLimitOrder({
          userId: 'user-1',
          pair: selectedPair.id,
          type: orderType,
          amount: parseFloat(orderAmount),
          price: parseFloat(orderPrice),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        
        // Award XP for creating limit order
        awardXP(25, 'Created limit order');
        
      } else if (orderMode === 'dca') {
        await createDCAOrder({
          userId: 'user-1',
          pair: selectedPair.id,
          totalAmount: parseFloat(dcaTotal),
          frequency: dcaFrequency,
          intervalAmount: parseFloat(dcaInterval),
          remainingAmount: parseFloat(dcaTotal),
          nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        
        // Award XP for creating DCA order
        awardXP(50, 'Created DCA strategy');
      }
      
      // Reset form
      setOrderAmount('');
      setOrderPrice('');
      setDCATotal('');
      setDCAInterval('');
      
    } catch (err) {
      console.error('Error creating order:', err);
    }
  }, [selectedPair, orderAmount, orderPrice, orderType, orderMode, dcaFrequency, dcaTotal, dcaInterval, createLimitOrder, createDCAOrder, awardXP]);

  // Handle bot creation
  const handleCreateBot = useCallback(async (strategy: 'grid' | 'dca' | 'arbitrage' | 'momentum') => {
    if (!selectedPair) return;
    
    const botName = `${selectedPair.baseToken} ${strategy.charAt(0).toUpperCase() + strategy.slice(1)} Bot`;
    
    await createTradingBot({
      name: botName,
      strategy,
      status: 'active',
      config: {
        pair: selectedPair.id,
        investment: 1000
      }
    });
    
    // Award XP for creating trading bot
    awardXP(100, 'Created trading bot');
  }, [selectedPair, createTradingBot, awardXP]);

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="trading-overview">
      <div className="overview-grid">
        {/* Portfolio Summary */}
        <div className="overview-card portfolio-summary">
          <h3>💼 Portfolio Overview</h3>
          {portfolioAnalytics && (
            <div className="portfolio-metrics">
              <div className="metric">
                <span className="metric-label">Total Value</span>
                <span className="metric-value">${portfolioAnalytics.totalValue.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Total P&L</span>
                <span className={`metric-value ${portfolioAnalytics.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                  {portfolioAnalytics.totalPnL >= 0 ? '+' : ''}${portfolioAnalytics.totalPnL.toFixed(2)}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Win Rate</span>
                <span className="metric-value">{portfolioAnalytics.winRate}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Total Trades</span>
                <span className="metric-value">{portfolioAnalytics.totalTrades}</span>
              </div>
            </div>
          )}
        </div>

        {/* Market Overview */}
        <div className="overview-card market-overview">
          <h3>📈 Market Overview</h3>
          <div className="market-pairs">
            {tradingPairs.slice(0, 4).map(pair => (
              <div key={pair.id} className="market-pair" onClick={() => setSelectedPair(pair)}>
                <div className="pair-info">
                  <span className="pair-name">{pair.id}</span>
                  <span className="pair-price">${pair.price.toLocaleString()}</span>
                </div>
                <div className={`pair-change ${pair.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Orders */}
        <div className="overview-card active-orders">
          <h3>📋 Active Orders</h3>
          <div className="orders-summary">
            <div className="order-type">
              <span className="order-label">Limit Orders</span>
              <span className="order-count">{limitOrders.filter(o => o.status === 'pending').length}</span>
            </div>
            <div className="order-type">
              <span className="order-label">DCA Orders</span>
              <span className="order-count">{dcaOrders.filter(o => o.status === 'active').length}</span>
            </div>
            <div className="order-type">
              <span className="order-label">Trading Bots</span>
              <span className="order-count">{tradingBots.filter(b => b.status === 'active').length}</span>
            </div>
          </div>
        </div>

        {/* Technical Analysis */}
        <div className="overview-card technical-analysis">
          <h3>🔍 Technical Signals</h3>
          <div className="indicators-grid">
            {technicalIndicators.slice(0, 3).map(indicator => (
              <div key={indicator.name} className="indicator">
                <span className="indicator-name">{indicator.name}</span>
                <span className={`indicator-signal ${indicator.signal}`}>
                  {indicator.signal.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Spot Trading Tab Component
  const SpotTradingTab = () => (
    <div className="spot-trading">
      <div className="trading-interface">
        {/* Pair Selection */}
        <div className="pair-selector">
          <h3>Select Trading Pair</h3>
          <div className="pairs-grid">
            {tradingPairs.map(pair => (
              <div 
                key={pair.id} 
                className={`pair-card ${selectedPair?.id === pair.id ? 'selected' : ''}`}
                onClick={() => setSelectedPair(pair)}
              >
                <div className="pair-header">
                  <span className="pair-name">{pair.id}</span>
                  <span className={`pair-change ${pair.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="pair-price">${pair.price.toLocaleString()}</div>
                <div className="pair-volume">Vol: ${pair.volume24h.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Panel */}
        {selectedPair && (
          <div className="order-panel">
            <h3>Place Order - {selectedPair.id}</h3>
            
            {/* Order Mode Toggle */}
            <div className="order-mode-toggle">
              <button 
                className={`mode-btn ${orderMode === 'limit' ? 'active' : ''}`}
                onClick={() => setOrderMode('limit')}
              >
                Limit Order
              </button>
              <button 
                className={`mode-btn ${orderMode === 'dca' ? 'active' : ''}`}
                onClick={() => setOrderMode('dca')}
              >
                DCA Strategy
              </button>
            </div>

            {orderMode === 'limit' ? (
              <div className="limit-order-form">
                {/* Order Type */}
                <div className="order-type-toggle">
                  <button 
                    className={`type-btn buy ${orderType === 'buy' ? 'active' : ''}`}
                    onClick={() => setOrderType('buy')}
                  >
                    Buy
                  </button>
                  <button 
                    className={`type-btn sell ${orderType === 'sell' ? 'active' : ''}`}
                    onClick={() => setOrderType('sell')}
                  >
                    Sell
                  </button>
                </div>

                {/* Order Inputs */}
                <div className="order-inputs">
                  <div className="input-group">
                    <label>Amount ({selectedPair.baseToken})</label>
                    <input
                      type="number"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="input-group">
                    <label>Price ({selectedPair.quoteToken})</label>
                    <input
                      type="number"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="order-total">
                    Total: {orderAmount && orderPrice ? 
                      `${(parseFloat(orderAmount) * parseFloat(orderPrice)).toFixed(2)} ${selectedPair.quoteToken}` 
                      : '0.00 ' + selectedPair.quoteToken
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="dca-order-form">
                <div className="input-group">
                  <label>Total Investment (USDC)</label>
                  <input
                    type="number"
                    value={dcaTotal}
                    onChange={(e) => setDCATotal(e.target.value)}
                    placeholder="1000.00"
                  />
                </div>
                <div className="input-group">
                  <label>Frequency</label>
                  <select value={dcaFrequency} onChange={(e) => setDCAFrequency(e.target.value as any)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Amount per Interval (USDC)</label>
                  <input
                    type="number"
                    value={dcaInterval}
                    onChange={(e) => setDCAInterval(e.target.value)}
                    placeholder="100.00"
                  />
                </div>
              </div>
            )}

            <button 
              className="create-order-btn"
              onClick={handleCreateOrder}
              disabled={isLoading || !orderAmount || (!orderPrice && orderMode === 'limit')}
            >
              {isLoading ? 'Creating...' : `Create ${orderMode === 'limit' ? 'Limit Order' : 'DCA Strategy'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Orders Tab Component
  const OrdersTab = () => (
    <div className="orders-management">
      <div className="orders-section">
        <h3>📋 Limit Orders</h3>
        <div className="orders-list">
          {limitOrders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-info">
                <span className="order-pair">{order.pair}</span>
                <span className={`order-type ${order.type}`}>{order.type.toUpperCase()}</span>
                <span className="order-amount">{order.amount} @ ${order.price}</span>
                <span className={`order-status ${order.status}`}>{order.status}</span>
              </div>
              {order.status === 'pending' && (
                <button 
                  className="cancel-order-btn"
                  onClick={() => cancelLimitOrder(order.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="orders-section">
        <h3>🔄 DCA Orders</h3>
        <div className="orders-list">
          {dcaOrders.map(order => (
            <div key={order.id} className="order-item dca-order">
              <div className="order-info">
                <span className="order-pair">{order.pair}</span>
                <span className="dca-details">
                  {order.intervalAmount} USDC every {order.frequency}
                </span>
                <span className="dca-progress">
                  {order.remainingAmount}/{order.totalAmount} remaining
                </span>
                <span className={`order-status ${order.status}`}>{order.status}</span>
              </div>
              <div className="dca-controls">
                {order.status === 'active' && (
                  <button onClick={() => pauseDCAOrder(order.id)}>Pause</button>
                )}
                {order.status === 'paused' && (
                  <button onClick={() => resumeDCAOrder(order.id)}>Resume</button>
                )}
                <button onClick={() => cancelDCAOrder(order.id)}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Trading Bots Tab Component
  const TradingBotsTab = () => (
    <div className="trading-bots">
      <div className="bots-header">
        <h3>🤖 Trading Bots</h3>
        <div className="bot-creation">
          <h4>Create New Bot</h4>
          <div className="bot-strategies">
            <button onClick={() => handleCreateBot('grid')}>Grid Bot</button>
            <button onClick={() => handleCreateBot('dca')}>DCA Bot</button>
            <button onClick={() => handleCreateBot('arbitrage')}>Arbitrage Bot</button>
            <button onClick={() => handleCreateBot('momentum')}>Momentum Bot</button>
          </div>
        </div>
      </div>
      
      <div className="bots-list">
        {tradingBots.map(bot => (
          <div key={bot.id} className="bot-item">
            <div className="bot-info">
              <div className="bot-header">
                <span className="bot-name">{bot.name}</span>
                <span className={`bot-status ${bot.status}`}>{bot.status}</span>
              </div>
              <div className="bot-metrics">
                <span className={`bot-pnl ${bot.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                  P&L: {bot.profitLoss >= 0 ? '+' : ''}${bot.profitLoss.toFixed(2)}
                </span>
                <span className="bot-trades">Trades: {bot.trades}</span>
                <span className="bot-winrate">Win Rate: {bot.winRate}%</span>
              </div>
            </div>
            <div className="bot-controls">
              {bot.status === 'stopped' || bot.status === 'paused' ? (
                <button onClick={() => startBot(bot.id)}>Start</button>
              ) : (
                <button onClick={() => stopBot(bot.id)}>Stop</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Analytics Tab Component
  const AnalyticsTab = () => (
    <div className="trading-analytics">
      <AdvancedPortfolioAnalytics />
    </div>
  );

  // Risk Management Tab Component
  const RiskManagementTab = () => (
    <div className="risk-management">
      <h3>🛡️ Risk Management Settings</h3>
      <div className="risk-settings">
        <div className="setting-group">
          <label>Max Position Size (USDC)</label>
          <input
            type="number"
            value={riskSettings.maxPositionSize}
            onChange={(e) => updateRiskSettings({ maxPositionSize: parseFloat(e.target.value) })}
          />
        </div>
        <div className="setting-group">
          <label>Stop Loss Percentage (%)</label>
          <input
            type="number"
            value={riskSettings.stopLossPercentage}
            onChange={(e) => updateRiskSettings({ stopLossPercentage: parseFloat(e.target.value) })}
          />
        </div>
        <div className="setting-group">
          <label>Take Profit Percentage (%)</label>
          <input
            type="number"
            value={riskSettings.takeProfitPercentage}
            onChange={(e) => updateRiskSettings({ takeProfitPercentage: parseFloat(e.target.value) })}
          />
        </div>
        <div className="setting-group">
          <label>Max Daily Loss (USDC)</label>
          <input
            type="number"
            value={riskSettings.maxDailyLoss}
            onChange={(e) => updateRiskSettings({ maxDailyLoss: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'spot': return <SpotTradingTab />;
      case 'orders': return <OrdersTab />;
      case 'bots': return <TradingBotsTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'risk': return <RiskManagementTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="professional-trading-dashboard">
      <div className="dashboard-header">
        <h1>💼 Professional Trading Dashboard</h1>
        <div className="header-stats">
          {portfolioAnalytics && (
            <>
              <div className="stat">
                <span className="stat-label">Portfolio Value</span>
                <span className="stat-value">${portfolioAnalytics.totalValue.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">24h P&L</span>
                <span className={`stat-value ${portfolioAnalytics.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                  {portfolioAnalytics.totalPnL >= 0 ? '+' : ''}${portfolioAnalytics.totalPnL.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="dashboard-nav">
        {TRADING_TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
        {renderTabContent()}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import AITradingAssistant from './AITradingAssistant';
import PredictiveAnalytics from './PredictiveAnalytics';
import SmartPortfolioManager from './SmartPortfolioManager';
import AIMarketIntelligence from './AIMarketIntelligence';
import './AdvancedTrading.css';

interface OrderBook {
  bids: [number, number][];
  asks: [number, number][];
}

interface TradingPair {
  symbol: string;
  baseToken: string;
  quoteToken: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface Order {
  id: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  amount: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: string;
}

const AdvancedTrading: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>('SOL/USDC');
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // AI Component visibility states
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState<boolean>(false);
  const [showPortfolioManager, setShowPortfolioManager] = useState<boolean>(false);
  const [showMarketIntelligence, setShowMarketIntelligence] = useState<boolean>(false);

  useEffect(() => {
    loadTradingData();
    const interval = setInterval(updateOrderBook, 2000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  const loadTradingData = () => {
    // Mock trading pairs
    const pairs: TradingPair[] = [
      { symbol: 'SOL/USDC', baseToken: 'SOL', quoteToken: 'USDC', price: 142.35, change24h: 5.4, volume24h: 2500000 },
      { symbol: 'RAY/SOL', baseToken: 'RAY', quoteToken: 'SOL', price: 0.0234, change24h: 12.8, volume24h: 950000 },
      { symbol: 'SRM/USDC', baseToken: 'SRM', quoteToken: 'USDC', price: 0.58, change24h: -3.2, volume24h: 780000 },
      { symbol: 'COPE/SOL', baseToken: 'COPE', quoteToken: 'SOL', price: 0.0008, change24h: 8.9, volume24h: 650000 }
    ];
    setTradingPairs(pairs);
    
    // Set initial price for orders
    const currentPair = pairs.find(p => p.symbol === selectedPair);
    if (currentPair) {
      setPrice(currentPair.price.toString());
    }
  };

  const updateOrderBook = () => {
    // Generate mock order book data
    const bids: [number, number][] = [];
    const asks: [number, number][] = [];
    const currentPrice = tradingPairs.find(p => p.symbol === selectedPair)?.price || 142.35;
    
    // Generate bids (buy orders) below current price
    for (let i = 0; i < 10; i++) {
      const price = currentPrice - (i + 1) * 0.1;
      const size = Math.random() * 100 + 10;
      bids.push([price, size]);
    }
    
    // Generate asks (sell orders) above current price
    for (let i = 0; i < 10; i++) {
      const price = currentPrice + (i + 1) * 0.1;
      const size = Math.random() * 100 + 10;
      asks.push([price, size]);
    }
    
    setOrderBook({ bids, asks });
  };

  const placeOrder = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!amount || (orderType !== 'market' && !price)) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 15),
      type: side,
      orderType,
      amount: parseFloat(amount),
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setAmount('');
    
    // Simulate order processing
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id 
          ? { ...order, status: Math.random() > 0.1 ? 'filled' : 'cancelled' }
          : order
      ));
    }, 2000);
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  const formatVolume = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="advanced-trading">
      <div className="trading-header holo-card">
        <h1 className="holo-text">⚔️ Advanced Trading Arena</h1>
        <p className="font-mystical">Professional trading tools for the mystic trader</p>
        <div className="ai-controls">
          <button 
            className="ai-assistant-trigger holo-btn"
            onClick={() => setShowAIAssistant(true)}
          >
            🤖 AI Assistant
          </button>
          <button 
            className="ai-analytics-trigger holo-btn"
            onClick={() => setShowPredictiveAnalytics(true)}
          >
            🔮 Predictive Analytics
          </button>
          <button 
            className="ai-portfolio-trigger holo-btn"
            onClick={() => setShowPortfolioManager(true)}
          >
            🎯 Portfolio Manager
          </button>
          <button 
            className="ai-intelligence-trigger holo-btn"
            onClick={() => setShowMarketIntelligence(true)}
          >
            🧠 Market Intelligence
          </button>
        </div>
      </div>

      {/* AI Components */}
      {showPredictiveAnalytics && (
        <PredictiveAnalytics 
          selectedPair={selectedPair}
          currentPrice={tradingPairs.find(p => p.symbol === selectedPair)?.price || 0}
        />
      )}

      {showPortfolioManager && (
        <SmartPortfolioManager />
      )}

      {showMarketIntelligence && (
        <AIMarketIntelligence selectedPair={selectedPair} />
      )}

      <div className="trading-layout">
        {/* Trading Pairs */}
        <div className="trading-pairs holo-card">
          <h3 className="ember-glow">Mystical Pairs</h3>
          <div className="pairs-list">
            {tradingPairs.map(pair => (
              <div 
                key={pair.symbol}
                className={`pair-item ${selectedPair === pair.symbol ? 'active' : ''}`}
                onClick={() => setSelectedPair(pair.symbol)}
              >
                <div className="pair-symbol">{pair.symbol}</div>
                <div className="pair-price">${formatNumber(pair.price, 4)}</div>
                <div className={`pair-change ${pair.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
                </div>
                <div className="pair-volume">{formatVolume(pair.volume24h)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Book */}
        <div className="order-book holo-card">
          <h3 className="ember-glow">Order Book</h3>
          <div className="orderbook-container">
            <div className="orderbook-header">
              <span>Price</span>
              <span>Size</span>
              <span>Total</span>
            </div>
            
            {/* Asks (Sell Orders) */}
            <div className="asks">
              {orderBook.asks.slice().reverse().map(([price, size], index) => {
                const total = price * size;
                return (
                  <div key={index} className="order-row ask">
                    <span className="order-price">{formatNumber(price, 4)}</span>
                    <span className="order-size">{formatNumber(size, 2)}</span>
                    <span className="order-total">{formatNumber(total, 2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Current Price */}
            <div className="current-price">
              <span className="price-label">Current Price</span>
              <span className="price-value">
                ${formatNumber(tradingPairs.find(p => p.symbol === selectedPair)?.price || 0, 4)}
              </span>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="bids">
              {orderBook.bids.map(([price, size], index) => {
                const total = price * size;
                return (
                  <div key={index} className="order-row bid">
                    <span className="order-price">{formatNumber(price, 4)}</span>
                    <span className="order-size">{formatNumber(size, 2)}</span>
                    <span className="order-total">{formatNumber(total, 2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trading Form */}
        <div className="trading-form holo-card">
          <h3 className="ember-glow">Place Order</h3>
          
          <div className="order-type-selector">
            {['market', 'limit', 'stop'].map(type => (
              <button
                key={type}
                className={`type-btn ${orderType === type ? 'active' : ''}`}
                onClick={() => setOrderType(type as any)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="side-selector">
            <button
              className={`side-btn buy ${side === 'buy' ? 'active' : ''}`}
              onClick={() => setSide('buy')}
            >
              Buy
            </button>
            <button
              className={`side-btn sell ${side === 'sell' ? 'active' : ''}`}
              onClick={() => setSide('sell')}
            >
              Sell
            </button>
          </div>

          <div className="form-inputs">
            <div className="input-group">
              <label>Amount ({selectedPair.split('/')[0]})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mystical-input"
              />
            </div>

            {orderType !== 'market' && (
              <div className="input-group">
                <label>Price ({selectedPair.split('/')[1]})</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="mystical-input"
                />
              </div>
            )}
          </div>

          <button
            className={`place-order-btn ${side}`}
            onClick={placeOrder}
            disabled={!isConnected}
          >
            {!isConnected ? 'Connect Wallet' : `Place ${side.toUpperCase()} Order`}
          </button>

          {!isConnected && (
            <button
              className="connect-wallet-btn"
              onClick={() => setIsConnected(true)}
            >
              🔗 Connect Phantom Wallet
            </button>
          )}
        </div>

        {/* Open Orders */}
        <div className="open-orders holo-card">
          <h3 className="ember-glow">Open Orders</h3>
          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="no-orders">No open orders</div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <div className="order-header">
                      <span className={`order-side ${order.type}`}>
                        {order.type.toUpperCase()}
                      </span>
                      <span className="order-type">{order.orderType}</span>
                      <span className={`order-status ${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <span>{order.amount} {selectedPair.split('/')[0]}</span>
                      {order.price && <span>@ ${formatNumber(order.price, 4)}</span>}
                      <span className="order-time">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Trading Assistant */}
      {showAIAssistant && (
        <AITradingAssistant 
          onClose={() => setShowAIAssistant(false)}
          tradingPairs={tradingPairs}
          selectedPair={selectedPair}
          orderBook={orderBook}
          orders={orders}
        />
      )}
    </div>
  );
};

export default AdvancedTrading;

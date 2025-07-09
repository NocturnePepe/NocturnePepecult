import React, { useState, useEffect } from 'react';
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
      price: orderType === 'market' ? undefined : parseFloat(price),
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    setOrders(prev => [newOrder, ...prev]);
    
    // Simulate order execution
    setTimeout(() => {
      setOrders(prev => 
        prev.map(order => 
          order.id === newOrder.id 
            ? { ...order, status: Math.random() > 0.1 ? 'filled' : 'cancelled' }
            : order
        )
      );
    }, Math.random() * 5000 + 1000);
    
    // Clear form
    setAmount('');
    if (orderType === 'market') {
      setPrice('');
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      )
    );
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
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
      </div>

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
              <span className="price-value holo-text">
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

        {/* Trading Panel */}
        <div className="trading-panel holo-card">
          <h3 className="ember-glow">Place Order</h3>
          
          {/* Order Type Selector */}
          <div className="order-type-selector">
            {(['market', 'limit', 'stop'] as const).map(type => (
              <button
                key={type}
                className={`type-btn ${orderType === type ? 'active' : ''}`}
                onClick={() => setOrderType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Buy/Sell Selector */}
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

          {/* Order Form */}
          <div className="order-form">
            {orderType !== 'market' && (
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  className="holo-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.0000"
                  step="0.0001"
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                className="holo-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Total:</span>
                <span className="holo-text">
                  {orderType === 'market' 
                    ? `≈ ${formatNumber(parseFloat(amount || '0') * (tradingPairs.find(p => p.symbol === selectedPair)?.price || 0), 2)}`
                    : formatNumber(parseFloat(amount || '0') * parseFloat(price || '0'), 2)
                  } USDC
                </span>
              </div>
            </div>

            <button 
              className={`glow-btn order-btn ${side}`}
              onClick={placeOrder}
              disabled={!isConnected}
            >
              {!isConnected ? 'Connect Wallet' : `${side.toUpperCase()} ${selectedPair.split('/')[0]}`}
            </button>
          </div>
        </div>

        {/* Open Orders */}
        <div className="open-orders holo-card">
          <h3 className="ember-glow">Open Orders</h3>
          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="no-orders">No active orders</div>
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
    </div>
  );
};

export default AdvancedTrading;

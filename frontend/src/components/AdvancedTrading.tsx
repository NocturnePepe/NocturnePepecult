// AdvancedTrading.tsx - Advanced trading features with cult theme
import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { cultSounds } from '../SoundEffects.js';
import './AdvancedTrading.css';

interface AdvancedTradingProps {
  connection: Connection;
  isVisible: boolean;
  onClose: () => void;
  inputToken: any;
  outputToken: any;
}

interface LimitOrder {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  targetPrice: number;
  currentPrice: number;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

interface DCAOrder {
  id: string;
  tokenIn: string;
  tokenOut: string;
  totalAmount: number;
  intervalAmount: number;
  interval: 'daily' | 'weekly' | 'monthly';
  executed: number;
  remaining: number;
  nextExecution: Date;
  isActive: boolean;
}

const AdvancedTrading = ({ connection, isVisible, onClose, inputToken, outputToken }: AdvancedTradingProps) => {
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState('limit');
  
  // Limit Order States
  const [limitAmount, setLimitAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [limitExpiry, setLimitExpiry] = useState('24h');
  const [limitOrders, setLimitOrders] = useState([]);
  
  // DCA States
  const [dcaTotalAmount, setDcaTotalAmount] = useState('');
  const [dcaIntervalAmount, setDcaIntervalAmount] = useState('');
  const [dcaInterval, setDcaInterval] = useState('daily');
  const [dcaOrders, setDcaOrders] = useState([]);
  
  // Advanced Slippage States
  const [maxSlippage, setMaxSlippage] = useState('1.0');
  const [mevProtection, setMevProtection] = useState(true);
  const [priorityFee, setPriorityFee] = useState('0.001');
  const [simluateFirst, setSimulateFirst] = useState(true);

  // Mock data
  const mockLimitOrders: LimitOrder[] = [
    {
      id: '1',
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amountIn: 5.0,
      targetPrice: 125.50,
      currentPrice: 119.15,
      status: 'active',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22)
    },
    {
      id: '2',
      tokenIn: 'USDC',
      tokenOut: 'BONK',
      amountIn: 100,
      targetPrice: 0.000025,
      currentPrice: 0.000023,
      status: 'filled',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    }
  ];

  const mockDCAOrders: DCAOrder[] = [
    {
      id: '1',
      tokenIn: 'USDC',
      tokenOut: 'SOL',
      totalAmount: 1000,
      intervalAmount: 50,
      interval: 'weekly',
      executed: 400,
      remaining: 600,
      nextExecution: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      isActive: true
    }
  ];

  React.useEffect(() => {
    if (isVisible) {
      setLimitOrders(mockLimitOrders);
      setDcaOrders(mockDCAOrders);
    }
  }, [isVisible]);

  const handleCreateLimitOrder = useCallback(async () => {
    if (!limitAmount || !limitPrice) {
      await cultSounds.playErrorSound();
      return;
    }

    const expiryMs = limitExpiry === '1h' ? 1000 * 60 * 60 : 
                     limitExpiry === '24h' ? 1000 * 60 * 60 * 24 :
                     limitExpiry === '7d' ? 1000 * 60 * 60 * 24 * 7 : 
                     1000 * 60 * 60 * 24 * 30;

    const newOrder: LimitOrder = {
      id: Date.now().toString(),
      tokenIn: inputToken.symbol,
      tokenOut: outputToken.symbol,
      amountIn: parseFloat(limitAmount),
      targetPrice: parseFloat(limitPrice),
      currentPrice: 119.15, // Mock current price
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiryMs)
    };

    setLimitOrders([...limitOrders, newOrder]);
    setLimitAmount('');
    setLimitPrice('');
    await cultSounds.playConnectSound();
  }, [limitAmount, limitPrice, limitExpiry, limitOrders, inputToken, outputToken]);

  const handleCreateDCAOrder = useCallback(async () => {
    if (!dcaTotalAmount || !dcaIntervalAmount) {
      await cultSounds.playErrorSound();
      return;
    }

    const intervalMs = dcaInterval === 'daily' ? 1000 * 60 * 60 * 24 :
                       dcaInterval === 'weekly' ? 1000 * 60 * 60 * 24 * 7 :
                       1000 * 60 * 60 * 24 * 30;

    const newOrder: DCAOrder = {
      id: Date.now().toString(),
      tokenIn: inputToken.symbol,
      tokenOut: outputToken.symbol,
      totalAmount: parseFloat(dcaTotalAmount),
      intervalAmount: parseFloat(dcaIntervalAmount),
      interval: dcaInterval,
      executed: 0,
      remaining: parseFloat(dcaTotalAmount),
      nextExecution: new Date(Date.now() + intervalMs),
      isActive: true
    };

    setDcaOrders([...dcaOrders, newOrder]);
    setDcaTotalAmount('');
    setDcaIntervalAmount('');
    await cultSounds.playRitualCompleteSound();
  }, [dcaTotalAmount, dcaIntervalAmount, dcaInterval, dcaOrders, inputToken, outputToken]);

  const handleCancelOrder = useCallback(async (orderId: string, type: 'limit' | 'dca') => {
    if (type === 'limit') {
      setLimitOrders(orders => orders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' as const } : order
      ));
    } else {
      setDcaOrders(orders => orders.map(order => 
        order.id === orderId ? { ...order, isActive: false } : order
      ));
    }
    await cultSounds.playHoverSound();
  }, []);

  const formatTimeRemaining = (expiresAt: Date): string => {
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatNextExecution = (date: Date): string => {
    const diff = date.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (!isVisible) return null;

  return (
    <div className="advanced-trading-overlay">
      <div className="advanced-trading-modal">
        <div className="trading-header">
          <h3>⚡ Advanced Trading</h3>
          <button 
            className="trading-close"
            onClick={async () => {
              await cultSounds.playHoverSound();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {!connected ? (
          <div className="trading-connect">
            <p>🔗 Connect your wallet to access advanced trading features</p>
          </div>
        ) : (
          <>
            <div className="trading-tabs">
              <button
                className={`tab-btn ${activeTab === 'limit' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('limit');
                  await cultSounds.playHoverSound();
                }}
              >
                📊 Limit Orders
              </button>
              <button
                className={`tab-btn ${activeTab === 'dca' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('dca');
                  await cultSounds.playHoverSound();
                }}
              >
                📈 DCA Orders
              </button>
              <button
                className={`tab-btn ${activeTab === 'slippage' ? 'active' : ''}`}
                onClick={async () => {
                  setActiveTab('slippage');
                  await cultSounds.playHoverSound();
                }}
              >
                ⚙️ MEV/Slippage
              </button>
            </div>

            <div className="trading-content">
              {activeTab === 'limit' && (
                <div className="limit-orders-section">
                  <div className="create-order-form">
                    <h4>Create Limit Order</h4>
                    <div className="form-row">
                      <div className="input-group">
                        <label>{inputToken.symbol} Amount</label>
                        <input
                          type="number"
                          value={limitAmount}
                          onChange={(e) => setLimitAmount(e.target.value)}
                          placeholder="0.0"
                          step="0.000001"
                        />
                      </div>
                      <div className="input-group">
                        <label>Target Price ({outputToken.symbol})</label>
                        <input
                          type="number"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          placeholder="0.0"
                          step="0.000001"
                        />
                      </div>
                    </div>
                    
                    <div className="expiry-selection">
                      <label>Expires In:</label>
                      <div className="expiry-buttons">
                        {['1h', '24h', '7d', '30d'].map(period => (
                          <button
                            key={period}
                            className={`expiry-btn ${limitExpiry === period ? 'active' : ''}`}
                            onClick={() => setLimitExpiry(period)}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="create-order-btn"
                      onClick={handleCreateLimitOrder}
                    >
                      🎯 Create Limit Order
                    </button>
                  </div>

                  <div className="orders-list">
                    <h4>Active Limit Orders</h4>
                    {limitOrders.length === 0 ? (
                      <div className="no-orders">No limit orders found</div>
                    ) : (
                      limitOrders.map(order => (
                        <div key={order.id} className={`order-item ${order.status}`}>
                          <div className="order-info">
                            <div className="order-pair">
                              {order.amountIn} {order.tokenIn} → {order.tokenOut}
                            </div>
                            <div className="order-details">
                              <span>Target: ${order.targetPrice.toFixed(6)}</span>
                              <span>Current: ${order.currentPrice.toFixed(6)}</span>
                              <span className={`status-badge ${order.status}`}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="order-time">
                              Expires: {formatTimeRemaining(order.expiresAt)}
                            </div>
                          </div>
                          {order.status === 'active' && (
                            <button
                              className="cancel-order-btn"
                              onClick={() => handleCancelOrder(order.id, 'limit')}
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'dca' && (
                <div className="dca-orders-section">
                  <div className="create-dca-form">
                    <h4>Create DCA Order</h4>
                    <div className="form-row">
                      <div className="input-group">
                        <label>Total {inputToken.symbol} Amount</label>
                        <input
                          type="number"
                          value={dcaTotalAmount}
                          onChange={(e) => setDcaTotalAmount(e.target.value)}
                          placeholder="0.0"
                          step="0.000001"
                        />
                      </div>
                      <div className="input-group">
                        <label>Amount Per Interval</label>
                        <input
                          type="number"
                          value={dcaIntervalAmount}
                          onChange={(e) => setDcaIntervalAmount(e.target.value)}
                          placeholder="0.0"
                          step="0.000001"
                        />
                      </div>
                    </div>
                    
                    <div className="interval-selection">
                      <label>Interval:</label>
                      <div className="interval-buttons">
                        {(['daily', 'weekly', 'monthly'] as const).map(interval => (
                          <button
                            key={interval}
                            className={`interval-btn ${dcaInterval === interval ? 'active' : ''}`}
                            onClick={() => setDcaInterval(interval)}
                          >
                            {interval.charAt(0).toUpperCase() + interval.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="create-dca-btn"
                      onClick={handleCreateDCAOrder}
                    >
                      📈 Create DCA Order
                    </button>
                  </div>

                  <div className="dca-list">
                    <h4>Active DCA Orders</h4>
                    {dcaOrders.length === 0 ? (
                      <div className="no-orders">No DCA orders found</div>
                    ) : (
                      dcaOrders.map(order => (
                        <div key={order.id} className={`dca-item ${order.isActive ? 'active' : 'inactive'}`}>
                          <div className="dca-info">
                            <div className="dca-pair">
                              {order.tokenIn} → {order.tokenOut} ({order.interval})
                            </div>
                            <div className="dca-progress">
                              <span>Progress: ${order.executed} / ${order.totalAmount}</span>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ width: `${(order.executed / order.totalAmount) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="dca-next">
                              Next: {formatNextExecution(order.nextExecution)}
                            </div>
                          </div>
                          {order.isActive && (
                            <button
                              className="cancel-dca-btn"
                              onClick={() => handleCancelOrder(order.id, 'dca')}
                            >
                              ⏹️ Stop
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'slippage' && (
                <div className="slippage-section">
                  <h4>MEV Protection & Advanced Slippage</h4>
                  
                  <div className="slippage-controls">
                    <div className="control-group">
                      <label>Maximum Slippage Tolerance</label>
                      <div className="slippage-input">
                        <input
                          type="number"
                          value={maxSlippage}
                          onChange={(e) => setMaxSlippage(e.target.value)}
                          step="0.1"
                          min="0.1"
                          max="50"
                        />
                        <span>%</span>
                      </div>
                      <div className="preset-slippage">
                        {['0.5', '1.0', '2.0', '5.0'].map(value => (
                          <button
                            key={value}
                            className={`preset-btn ${maxSlippage === value ? 'active' : ''}`}
                            onClick={() => setMaxSlippage(value)}
                          >
                            {value}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Priority Fee (SOL)</label>
                      <input
                        type="number"
                        value={priorityFee}
                        onChange={(e) => setPriorityFee(e.target.value)}
                        step="0.0001"
                        min="0"
                        placeholder="0.001"
                      />
                      <small>Higher fees = faster execution</small>
                    </div>

                    <div className="toggle-controls">
                      <div className="toggle-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={mevProtection}
                            onChange={(e) => setMevProtection(e.target.checked)}
                          />
                          <span className="toggle-label">MEV Protection</span>
                        </label>
                        <small>Protect against front-running and sandwich attacks</small>
                      </div>

                      <div className="toggle-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={simluateFirst}
                            onChange={(e) => setSimulateFirst(e.target.checked)}
                          />
                          <span className="toggle-label">Simulate Transaction First</span>
                        </label>
                        <small>Preview transaction before execution</small>
                      </div>
                    </div>

                    <div className="protection-status">
                      <h5>Current Protection Level: 
                        <span className={`protection-level ${mevProtection ? 'high' : 'low'}`}>
                          {mevProtection ? ' 🛡️ HIGH' : ' ⚠️ BASIC'}
                        </span>
                      </h5>
                      <div className="protection-details">
                        {mevProtection && (
                          <>
                            <div className="protection-feature">✅ Anti-sandwich protection</div>
                            <div className="protection-feature">✅ Front-running detection</div>
                            <div className="protection-feature">✅ Private mempool routing</div>
                          </>
                        )}
                        {simluateFirst && (
                          <div className="protection-feature">✅ Transaction simulation</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedTrading;

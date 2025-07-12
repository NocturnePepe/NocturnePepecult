import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdvancedTrading } from '../contexts/AdvancedTradingContext';
import { useGamification } from '../contexts/GamificationContext';
import { triggerTradingParticles } from './TradingParticleSystem';
import { showTradeExecuted, showTradingNotification } from './TradingNotificationSystem';

interface SwipeGesture {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  isActive: boolean;
}

interface MobileTradingInterfaceProps {
  className?: string;
  onNavigateBack?: () => void;
}

export const MobileTradingInterface: React.FC<MobileTradingInterfaceProps> = ({
  className = '',
  onNavigateBack
}) => {
  const {
    tradingPairs,
    selectedPair,
    setSelectedPair,
    createLimitOrder,
    portfolioAnalytics,
    isLoading
  } = useAdvancedTrading();
  
  const { awardXP } = useGamification();
  
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [swipeGesture, setSwipeGesture] = useState<SwipeGesture>({
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isActive: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Detect keyboard visibility on mobile
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      setIsKeyboardVisible(currentHeight < viewportHeight * 0.8);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewportHeight]);

  useEffect(() => {
    setViewportHeight(window.innerHeight);
  }, []);

  // Haptic feedback
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeGesture({
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isActive: true
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeGesture.isActive) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeGesture.startX;
    const deltaY = touch.clientY - swipeGesture.startY;
    
    setSwipeGesture(prev => ({
      ...prev,
      deltaX,
      deltaY
    }));

    // Prevent scrolling during horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      e.preventDefault();
    }
  }, [swipeGesture]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeGesture.isActive) return;

    const { deltaX, deltaY } = swipeGesture;
    const minSwipeDistance = 50;

    // Horizontal swipe to switch buy/sell
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && activeTab === 'sell') {
        setActiveTab('buy');
        triggerHaptic('light');
      } else if (deltaX < 0 && activeTab === 'buy') {
        setActiveTab('sell');
        triggerHaptic('light');
      }
    }

    setSwipeGesture(prev => ({ ...prev, isActive: false, deltaX: 0, deltaY: 0 }));
  }, [swipeGesture, activeTab, triggerHaptic]);

  // Quick amount buttons
  const quickAmounts = ['25%', '50%', '75%', '100%'];
  
  const handleQuickAmount = useCallback((percentage: string) => {
    if (!selectedPair || !portfolioAnalytics) return;
    
    const percent = parseInt(percentage) / 100;
    const availableBalance = activeTab === 'buy' ? 1000 : 100; // Mock balance
    const calculatedAmount = (availableBalance * percent).toFixed(6);
    
    setAmount(calculatedAmount);
    triggerHaptic('light');
  }, [selectedPair, portfolioAnalytics, activeTab, triggerHaptic]);

  // Enhanced order creation
  const handleCreateOrder = useCallback(async () => {
    if (!selectedPair || !amount || !price) {
      showTradingNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in all fields',
        duration: 3000
      });
      return;
    }

    try {
      triggerHaptic('medium');
      
      await createLimitOrder({
        userId: 'mobile-user',
        pair: selectedPair.id,
        type: activeTab,
        amount: parseFloat(amount),
        price: parseFloat(price),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      // Success feedback
      awardXP(25, `Mobile ${activeTab} order`);
      showTradeExecuted(activeTab, parseFloat(amount), parseFloat(price), selectedPair.id);
      
      // Particles
      triggerTradingParticles(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'order',
        parseFloat(amount) * parseFloat(price)
      );

      // Reset form
      setAmount('');
      setPrice('');
      
      triggerHaptic('heavy');
      
    } catch (error) {
      triggerHaptic('heavy');
      showTradingNotification({
        type: 'error',
        title: 'Order Failed',
        message: 'Please try again',
        duration: 4000
      });
    }
  }, [selectedPair, amount, price, activeTab, createLimitOrder, awardXP, triggerHaptic]);

  return (
    <div 
      ref={containerRef}
      className={`mobile-trading-interface ${isKeyboardVisible ? 'keyboard-visible' : ''} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="mobile-trading-header">
        <button 
          className="back-button"
          onClick={onNavigateBack}
          aria-label="Go back"
        >
          ←
        </button>
        <h1>Mobile Trading</h1>
        <div className="header-actions">
          <button className="settings-button">⚙️</button>
        </div>
      </div>

      {/* Pair Selection */}
      <div className="pair-selection-mobile">
        <div className="selected-pair-display">
          {selectedPair ? (
            <div className="pair-info">
              <div className="pair-name">{selectedPair.id}</div>
              <div className={`pair-price ${selectedPair.change24h >= 0 ? 'positive' : 'negative'}`}>
                ${selectedPair.price.toLocaleString()}
              </div>
              <div className={`pair-change ${selectedPair.change24h >= 0 ? 'positive' : 'negative'}`}>
                {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}%
              </div>
            </div>
          ) : (
            <div className="select-pair-prompt">
              <span>Select a trading pair</span>
            </div>
          )}
        </div>
        
        <div className="pairs-horizontal-scroll">
          {tradingPairs.map(pair => (
            <button
              key={pair.id}
              className={`pair-card-mobile ${selectedPair?.id === pair.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedPair(pair);
                setPrice(pair.price.toString());
                triggerHaptic('light');
              }}
            >
              <div className="pair-symbol">{pair.id}</div>
              <div className="pair-price-small">${pair.price.toFixed(4)}</div>
              <div className={`pair-change-small ${pair.change24h >= 0 ? 'positive' : 'negative'}`}>
                {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(1)}%
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="trade-type-toggle">
        <div className="toggle-container">
          <button
            className={`toggle-button buy ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('buy');
              triggerHaptic('light');
            }}
          >
            Buy
          </button>
          <button
            className={`toggle-button sell ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sell');
              triggerHaptic('light');
            }}
          >
            Sell
          </button>
        </div>
        <div className="swipe-hint">
          💡 Swipe left/right to switch
        </div>
      </div>

      {/* Order Form */}
      <div className="mobile-order-form">
        <div className="form-section">
          <label className="input-label">
            Amount ({selectedPair?.baseToken || 'TOKEN'})
          </label>
          <div className="input-container">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="amount-input"
            />
            <div className="quick-amounts">
              {quickAmounts.map(percent => (
                <button
                  key={percent}
                  className="quick-amount-btn"
                  onClick={() => handleQuickAmount(percent)}
                >
                  {percent}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="input-label">
            Price ({selectedPair?.quoteToken || 'USD'})
          </label>
          <div className="input-container">
            <input
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="price-input"
            />
            <button 
              className="market-price-btn"
              onClick={() => {
                if (selectedPair) {
                  setPrice(selectedPair.price.toString());
                  triggerHaptic('light');
                }
              }}
            >
              Market
            </button>
          </div>
        </div>

        {/* Order Summary */}
        {amount && price && (
          <div className="order-summary">
            <div className="summary-row">
              <span>Total</span>
              <span className="summary-value">
                {(parseFloat(amount) * parseFloat(price)).toFixed(2)} {selectedPair?.quoteToken}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="action-button-container">
        <button
          className={`mobile-trade-button ${activeTab} ${(!amount || !price || isLoading) ? 'disabled' : ''}`}
          onClick={handleCreateOrder}
          disabled={!amount || !price || isLoading}
        >
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            `${activeTab.toUpperCase()} ${selectedPair?.baseToken || 'TOKEN'}`
          )}
        </button>
      </div>

      <style jsx>{`
        .mobile-trading-interface {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: linear-gradient(135deg, 
            var(--bg-primary) 0%, 
            var(--bg-secondary) 100%);
          color: var(--text-primary);
          position: relative;
          overflow-x: hidden;
          transition: all 0.3s ease;
        }

        .mobile-trading-interface.keyboard-visible {
          height: 100vh;
          overflow: hidden;
        }

        .mobile-trading-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-button {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.5rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .back-button:active {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(0.95);
        }

        .mobile-trading-header h1 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .settings-button {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.2rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .pair-selection-mobile {
          padding: 1rem;
        }

        .selected-pair-display {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pair-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pair-name {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .pair-price {
          font-size: 1.1rem;
          font-weight: 600;
          font-family: monospace;
        }

        .pair-change {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .positive { color: #00ff88; }
        .negative { color: #ff4444; }

        .pairs-horizontal-scroll {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding: 0.5rem 0;
          -webkit-overflow-scrolling: touch;
        }

        .pairs-horizontal-scroll::-webkit-scrollbar {
          display: none;
        }

        .pair-card-mobile {
          flex: 0 0 auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem;
          min-width: 80px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .pair-card-mobile.selected {
          border-color: var(--accent-primary);
          background: rgba(138, 43, 226, 0.1);
        }

        .pair-card-mobile:active {
          transform: scale(0.95);
        }

        .pair-symbol {
          font-size: 0.8rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .pair-price-small {
          font-size: 0.7rem;
          font-family: monospace;
          margin-bottom: 0.125rem;
        }

        .pair-change-small {
          font-size: 0.65rem;
          font-weight: 500;
        }

        .trade-type-toggle {
          padding: 0 1rem;
          margin-bottom: 1rem;
        }

        .toggle-container {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 0.25rem;
          position: relative;
        }

        .toggle-button {
          flex: 1;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .toggle-button.active {
          color: white;
        }

        .toggle-button.buy.active {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: black;
        }

        .toggle-button.sell.active {
          background: linear-gradient(135deg, #ff4444, #cc0000);
        }

        .swipe-hint {
          text-align: center;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.5rem;
        }

        .mobile-order-form {
          flex: 1;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .input-container {
          position: relative;
        }

        .amount-input,
        .price-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          font-size: 1.1rem;
          font-family: monospace;
        }

        .amount-input:focus,
        .price-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
        }

        .quick-amounts {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .quick-amount-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .quick-amount-btn:active {
          background: var(--accent-primary);
          transform: scale(0.95);
        }

        .market-price-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: var(--accent-primary);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .market-price-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        .order-summary {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-value {
          font-weight: 600;
          font-family: monospace;
        }

        .action-button-container {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .mobile-trade-button {
          width: 100%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border: none;
          border-radius: 16px;
          color: white;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: bold;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .mobile-trade-button.buy {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: black;
        }

        .mobile-trade-button.sell {
          background: linear-gradient(135deg, #ff4444, #cc0000);
        }

        .mobile-trade-button:active:not(.disabled) {
          transform: scale(0.98);
        }

        .mobile-trade-button.disabled {
          opacity: 0.5;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Safe area support */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .action-button-container {
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
};

export default MobileTradingInterface;

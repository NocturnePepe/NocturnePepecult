// PriceAlert.tsx - Price alert functionality with cult theme
import React, { useState, useEffect, useCallback } from 'react';
import { cultSounds } from '../SoundEffects.js';
import './PriceAlert.css';

interface PriceAlert {
  id: string;
  tokenSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
}

interface PriceAlertProps {
  tokenSymbol: string;
  currentPrice: number;
  onAlertTriggered?: (alert: PriceAlert) => void;
}

const PriceAlertComponent = ({
  tokenSymbol,
  currentPrice,
  onAlertTriggered
}: PriceAlertProps) => {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');

  // Load alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem(`priceAlerts_${tokenSymbol}`);
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt)
        }));
        setAlerts(parsed);
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    }
  }, [tokenSymbol]);

  // Save alerts to localStorage
  const saveAlerts = useCallback((newAlerts: PriceAlert[]) => {
    localStorage.setItem(`priceAlerts_${tokenSymbol}`, JSON.stringify(newAlerts));
    setAlerts(newAlerts);
  }, [tokenSymbol]);

  // Check for triggered alerts
  useEffect(() => {
    if (!currentPrice || alerts.length === 0) return;

    const triggeredAlerts: PriceAlert[] = [];
    const remainingAlerts: PriceAlert[] = [];

    alerts.forEach(alert => {
      if (!alert.isActive) {
        remainingAlerts.push(alert);
        return;
      }

      const isTriggered = 
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (isTriggered) {
        triggeredAlerts.push(alert);
        // Play alert sound
        cultSounds.playRitualCompleteSound();
        onAlertTriggered?.(alert);
        
        // Show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔔 Price Alert: ${tokenSymbol}`, {
            body: `Price ${alert.condition} $${alert.targetPrice.toFixed(6)}. Current: $${currentPrice.toFixed(6)}`,
            icon: '/favicon.ico'
          });
        }
      } else {
        remainingAlerts.push(alert);
      }
    });

    if (triggeredAlerts.length > 0) {
      saveAlerts(remainingAlerts);
    }
  }, [currentPrice, alerts, tokenSymbol, onAlertTriggered, saveAlerts]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleCreateAlert = useCallback(async () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      await cultSounds.playErrorSound();
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      tokenSymbol,
      targetPrice: price,
      condition,
      isActive: true,
      createdAt: new Date()
    };

    const newAlerts = [...alerts, newAlert];
    saveAlerts(newAlerts);
    setTargetPrice('');
    setShowForm(false);
    await cultSounds.playConnectSound();
  }, [targetPrice, condition, alerts, tokenSymbol, saveAlerts]);

  const handleDeleteAlert = useCallback(async (alertId: string) => {
    const newAlerts = alerts.filter(alert => alert.id !== alertId);
    saveAlerts(newAlerts);
    await cultSounds.playHoverSound();
  }, [alerts, saveAlerts]);

  const handleToggleAlert = useCallback(async (alertId: string) => {
    const newAlerts = alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    );
    saveAlerts(newAlerts);
    await cultSounds.playHoverSound();
  }, [alerts, saveAlerts]);

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  return (
    <div className="price-alert-container">
      <div className="alert-header">
        <h4>🔔 Price Alerts</h4>
        <button 
          className="add-alert-btn"
          onClick={() => setShowForm(!showForm)}
          onMouseEnter={() => cultSounds.playHoverSound()}
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {showForm && (
        <div className="alert-form">
          <div className="form-row">
            <select 
              value={condition} 
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="condition-select"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Target price"
              step="0.000001"
              className="price-input"
            />
          </div>
          <button 
            className="create-alert-btn"
            onClick={handleCreateAlert}
            onMouseEnter={() => cultSounds.playHoverSound()}
          >
            Create Alert
          </button>
        </div>
      )}

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            No price alerts set for {tokenSymbol}
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.isActive ? 'active' : 'inactive'}`}>
              <div className="alert-info">
                <span className="alert-condition">
                  {alert.condition === 'above' ? '📈' : '📉'} {alert.condition}
                </span>
                <span className="alert-price">{formatPrice(alert.targetPrice)}</span>
              </div>
              <div className="alert-actions">
                <button
                  className="toggle-btn"
                  onClick={() => handleToggleAlert(alert.id)}
                  onMouseEnter={() => cultSounds.playHoverSound()}
                >
                  {alert.isActive ? '⏸️' : '▶️'}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteAlert(alert.id)}
                  onMouseEnter={() => cultSounds.playHoverSound()}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceAlertComponent;

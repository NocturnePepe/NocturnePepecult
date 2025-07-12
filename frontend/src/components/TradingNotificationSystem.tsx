import React, { useState, useEffect, useCallback } from 'react';
import { triggerTradingParticles } from './TradingParticleSystem';

export interface TradingNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  value?: number;
  currency?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface TradingNotificationSystemProps {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const TradingNotificationSystem: React.FC<TradingNotificationSystemProps> = ({
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<TradingNotification[]>([]);

  const addNotification = useCallback((notification: Omit<TradingNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: TradingNotification = {
      ...notification,
      id,
      duration: notification.duration || defaultDuration
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      if (updated.length > maxNotifications) {
        return updated.slice(0, maxNotifications);
      }
      return updated;
    });

    // Trigger particles for profit/loss notifications
    if (notification.type === 'success' && notification.value) {
      setTimeout(() => {
        triggerTradingParticles(
          window.innerWidth - 200, // Near notification area
          100,
          'profit',
          notification.value
        );
      }, 100);
    } else if (notification.type === 'error' && notification.value) {
      setTimeout(() => {
        triggerTradingParticles(
          window.innerWidth - 200,
          100,
          'loss',
          notification.value
        );
      }, 100);
    }

    // Auto-remove notification
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);

    return id;
  }, [defaultDuration, maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getNotificationIcon = (type: TradingNotification['type']): string => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  const formatValue = (value: number, currency: string = 'USD'): string => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const sign = isNegative ? '-' : '+';
    
    if (currency === 'USD') {
      return `${sign}$${absValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    
    return `${sign}${absValue.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${currency}`;
  };

  const getPositionClasses = (): string => {
    const baseClasses = 'fixed z-50 flex flex-col gap-2';
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  // Global notification system
  useEffect(() => {
    const handleGlobalNotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };

    window.addEventListener('tradingNotification', handleGlobalNotification as EventListener);
    return () => window.removeEventListener('tradingNotification', handleGlobalNotification as EventListener);
  }, [addNotification]);

  return (
    <div className={getPositionClasses()}>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            trading-notification 
            trading-notification-${notification.type}
            transform transition-all duration-300 ease-out
            ${index === 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-90'}
          `}
          style={{
            animation: `notificationSlide 0.5s ease-out ${index * 0.1}s`,
            marginTop: index > 0 ? '0.5rem' : '0'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="notification-icon text-lg">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="notification-title font-semibold text-sm">
                  {notification.title}
                </h4>
                
                {notification.value && (
                  <div className={`
                    notification-value font-mono text-sm font-bold
                    ${notification.type === 'success' ? 'text-green-400' : ''}
                    ${notification.type === 'error' ? 'text-red-400' : ''}
                  `}>
                    {formatValue(notification.value, notification.currency)}
                  </div>
                )}
              </div>
              
              <p className="notification-message text-xs text-gray-300 mt-1">
                {notification.message}
              </p>
              
              {notification.action && (
                <button
                  onClick={() => {
                    notification.action!.onClick();
                    removeNotification(notification.id);
                  }}
                  className="
                    notification-action mt-2 px-3 py-1 text-xs
                    bg-purple-600 hover:bg-purple-700
                    rounded-md transition-colors duration-200
                  "
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="
                notification-close text-gray-400 hover:text-white
                transition-colors duration-200 text-lg leading-none
              "
            >
              ×
            </button>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <div 
            className="notification-progress absolute bottom-0 left-0 h-1 bg-purple-500 rounded-b-lg"
            style={{
              animation: `notificationProgress ${notification.duration}ms linear`
            }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes notificationSlide {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes notificationProgress {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        .trading-notification {
          position: relative;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          color: white;
          font-weight: 500;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .trading-notification-success {
          border-left: 4px solid #00ff88;
          background: linear-gradient(135deg, 
            rgba(0, 255, 136, 0.1) 0%, 
            rgba(0, 0, 0, 0.9) 100%);
        }

        .trading-notification-error {
          border-left: 4px solid #ff4444;
          background: linear-gradient(135deg, 
            rgba(255, 68, 68, 0.1) 0%, 
            rgba(0, 0, 0, 0.9) 100%);
        }

        .trading-notification-warning {
          border-left: 4px solid #ffd700;
          background: linear-gradient(135deg, 
            rgba(255, 215, 0, 0.1) 0%, 
            rgba(0, 0, 0, 0.9) 100%);
        }

        .trading-notification-info {
          border-left: 4px solid #8a2be2;
          background: linear-gradient(135deg, 
            rgba(138, 43, 226, 0.1) 0%, 
            rgba(0, 0, 0, 0.9) 100%);
        }
      `}</style>
    </div>
  );
};

// Global notification functions
export const showTradingNotification = (notification: Omit<TradingNotification, 'id'>) => {
  const event = new CustomEvent('tradingNotification', {
    detail: notification
  });
  window.dispatchEvent(event);
};

export const showTradeExecuted = (
  type: 'buy' | 'sell',
  amount: number,
  price: number,
  symbol: string
) => {
  showTradingNotification({
    type: 'success',
    title: `${type.toUpperCase()} Order Executed`,
    message: `${amount.toLocaleString()} ${symbol} at $${price.toLocaleString()}`,
    value: amount * price,
    currency: 'USD',
    duration: 4000
  });
};

export const showProfitLoss = (
  pnl: number,
  symbol: string,
  percentage: number
) => {
  const isProfit = pnl > 0;
  showTradingNotification({
    type: isProfit ? 'success' : 'error',
    title: isProfit ? 'Profit Realized' : 'Loss Realized',
    message: `${symbol} position closed (${percentage.toFixed(2)}%)`,
    value: pnl,
    currency: 'USD',
    duration: 6000
  });
};

export const showOrderFilled = (
  orderType: string,
  symbol: string,
  amount: number,
  price: number
) => {
  showTradingNotification({
    type: 'info',
    title: `${orderType} Order Filled`,
    message: `${amount} ${symbol} at $${price}`,
    value: amount * price,
    duration: 3000
  });
};

export const showRiskAlert = (
  message: string,
  severity: 'low' | 'medium' | 'high'
) => {
  showTradingNotification({
    type: severity === 'high' ? 'error' : 'warning',
    title: 'Risk Alert',
    message,
    duration: severity === 'high' ? 10000 : 7000,
    action: {
      label: 'Review Risk Settings',
      onClick: () => {
        // Navigate to risk management tab
        window.dispatchEvent(new CustomEvent('navigateToRisk'));
      }
    }
  });
};

export default TradingNotificationSystem;

import React, { useState, useEffect, useCallback } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { useAdvancedTrading } from '../contexts/AdvancedTradingContext';

interface MobileNavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  route: string;
  haptic?: boolean;
}

interface MobileNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentRoute,
  onNavigate,
  className = ''
}) => {
  const { level, xp, achievements } = useGamification();
  const { limitOrders, portfolioAnalytics } = useAdvancedTrading();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Navigation items with dynamic badges
  const navItems: MobileNavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      route: '/',
      haptic: true
    },
    {
      id: 'trading',
      label: 'Trading',
      icon: '📈',
      badge: limitOrders?.length || 0,
      route: '/pro-trading',
      haptic: true
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: '💼',
      route: '/portfolio',
      haptic: true
    },
    {
      id: 'social',
      label: 'Social',
      icon: '👥',
      badge: achievements.filter(a => !a.unlockedAt).length,
      route: '/social',
      haptic: true
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      route: '/profile',
      haptic: true
    }
  ];

  // Hide/show navigation on scroll
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY < lastScrollY || currentScrollY < 100) {
      setIsVisible(true);
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Haptic feedback for mobile devices
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

  const handleNavClick = useCallback((item: MobileNavItem) => {
    if (item.haptic) {
      triggerHaptic('light');
    }
    
    // Add visual feedback
    const navElement = document.getElementById(`nav-${item.id}`);
    if (navElement) {
      navElement.classList.add('nav-pressed');
      setTimeout(() => {
        navElement.classList.remove('nav-pressed');
      }, 150);
    }
    
    onNavigate(item.route);
  }, [onNavigate, triggerHaptic]);

  return (
    <nav className={`mobile-navigation ${isVisible ? 'visible' : 'hidden'} ${className}`}>
      <div className="mobile-nav-background" />
      
      <div className="mobile-nav-content">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`mobile-nav-item ${currentRoute === item.route ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
            aria-label={item.label}
          >
            <div className="nav-item-container">
              <div className="nav-icon-wrapper">
                <span className="nav-icon">{item.icon}</span>
                {item.badge && item.badge > 0 && (
                  <span className="nav-badge">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="nav-label">{item.label}</span>
              
              {/* Active indicator */}
              {currentRoute === item.route && (
                <div className="nav-active-indicator" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* XP Progress Bar */}
      <div className="mobile-nav-xp">
        <div className="xp-progress-container">
          <div className="xp-level">Lv.{level}</div>
          <div className="xp-progress-bar">
            <div 
              className="xp-progress-fill"
              style={{ width: `${((xp % 1000) / 1000) * 100}%` }}
            />
          </div>
          <div className="xp-value">{xp % 1000}/1000</div>
        </div>
      </div>

      <style jsx>{`
        .mobile-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateY(0);
        }

        .mobile-navigation.hidden {
          transform: translateY(100%);
        }

        .mobile-nav-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(138, 43, 226, 0.3);
        }

        .mobile-nav-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            var(--accent-primary), 
            var(--accent-secondary), 
            var(--accent-primary));
          animation: navGlow 3s ease-in-out infinite;
        }

        @keyframes navGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .mobile-nav-content {
          position: relative;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.75rem 1rem 0.5rem;
          min-height: 80px;
        }

        .mobile-nav-item {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          flex: 1;
          max-width: 80px;
        }

        .mobile-nav-item.active {
          color: var(--accent-primary);
        }

        .mobile-nav-item.nav-pressed {
          transform: scale(0.9);
        }

        .nav-item-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .nav-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .nav-icon {
          font-size: 1.5rem;
          transition: transform 0.2s ease;
        }

        .mobile-nav-item:active .nav-icon {
          transform: scale(1.2);
        }

        .nav-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #ff4444, #cc0000);
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          padding: 0.125rem 0.25rem;
          border-radius: 10px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
          animation: badgePulse 2s infinite;
        }

        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .nav-label {
          font-size: 0.7rem;
          font-weight: 500;
          text-align: center;
          line-height: 1;
        }

        .nav-active-indicator {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: var(--accent-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent-primary);
          animation: activeIndicator 2s infinite;
        }

        @keyframes activeIndicator {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.2); }
        }

        .mobile-nav-xp {
          position: relative;
          padding: 0.5rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .xp-progress-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .xp-level {
          font-size: 0.8rem;
          font-weight: bold;
          color: var(--accent-primary);
          min-width: 35px;
        }

        .xp-progress-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .xp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 3px;
          transition: width 0.5s ease;
          animation: xpGlow 2s infinite;
        }

        @keyframes xpGlow {
          0%, 100% { box-shadow: 0 0 5px var(--accent-primary); }
          50% { box-shadow: 0 0 15px var(--accent-primary); }
        }

        .xp-value {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.8);
          min-width: 50px;
          text-align: right;
        }

        /* iPhone X and newer safe area support */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .mobile-navigation {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* High refresh rate displays */
        @media (min-resolution: 120dpi) {
          .mobile-nav-item {
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .mobile-navigation,
          .mobile-nav-item,
          .nav-icon,
          .xp-progress-fill {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default MobileNavigation;

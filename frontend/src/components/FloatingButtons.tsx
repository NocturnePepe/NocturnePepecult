import React, { useState, lazy, Suspense, useCallback, useMemo, memo } from 'react';
import { useMockWallet } from '../contexts/MockWalletContext';
import './FloatingButtons.css';

// Lazy load modals for performance
const SecurityModal = lazy(() => import('./SecurityModal'));
const EnhancedThemeSelector = lazy(() => import('./EnhancedThemeSelector'));
const AchievementSystem = lazy(() => import('./AchievementSystem'));

interface FloatingButtonsProps {
  position?: 'left' | 'right';
}

const FloatingButtons = memo<FloatingButtonsProps>(({ position = 'left' }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { userStats } = useMockWallet();

  // Memoized callbacks for better performance
  const closeModal = useCallback(() => setActiveModal(null), []);
  const openModal = useCallback((modal: string) => setActiveModal(modal), []);
  const toggleExpanded = useCallback(() => setIsExpanded(!isExpanded), [isExpanded]);

  // Memoized button configuration for performance
  const buttons = useMemo(() => [
    {
      id: 'security',
      icon: '🛡️',
      label: 'Security Scanner',
      description: 'Rug pull detection & safety',
      color: '#ff4757',
      pulse: true
    },
    {
      id: 'themes',
      icon: '🎨',
      label: 'Mystical Themes',
      description: 'Seasonal cult aesthetics',
      color: '#9c88ff',
      pulse: false
    },
    {
      id: 'achievements',
      icon: '🏆',
      label: 'Achievements',
      description: `${userStats.achievements.length} unlocked`,
      color: '#ffa726',
      pulse: userStats.achievements.length > 0,
      badge: userStats.achievements.length
    }
  ], [userStats.achievements.length]);

  // Optimized click handler to prevent multiple state updates
  const handleButtonClick = useCallback((buttonId: string) => {
    openModal(buttonId);
    setIsExpanded(false);
  }, [openModal]);

  return (
    <>
      <div className={`floating-buttons ${position} ${isExpanded ? 'expanded' : ''}`}>
        {/* Main toggle button */}
        <button 
          className="floating-toggle"
          onClick={toggleExpanded}
          title="Toggle Action Menu"
        >
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
            ⚡
          </span>
          <div className="toggle-pulse" />
        </button>

        {/* Action buttons */}
        <div className="floating-menu">
          {buttons.map((button, index) => (
            <button
              key={button.id}
              className={`floating-button ${button.pulse ? 'pulse' : ''}`}
              onClick={() => handleButtonClick(button.id)}
              style={{ 
                '--button-color': button.color,
                '--delay': `${index * 0.1}s`
              } as React.CSSProperties}
              title={button.label}
              aria-label={`${button.label}: ${button.description}`}
            >
              <span className="button-icon" role="img" aria-hidden="true">
                {button.icon}
              </span>
              <div className="button-tooltip" role="tooltip">
                <div className="tooltip-title">{button.label}</div>
                <div className="tooltip-desc">{button.description}</div>
              </div>
              {button.badge && (
                <div 
                  className="button-badge" 
                  style={{ backgroundColor: button.color }}
                  aria-label={`${button.badge} items`}
                >
                  {button.badge}
                </div>
              )}
              <div className="button-glow" style={{ backgroundColor: button.color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Modal Rendering with Suspense */}
      <Suspense fallback={
        <div className="modal-loading">
          <div className="loading-spinner" />
          <div>Loading...</div>
        </div>
      }>
        {activeModal === 'security' && (
          <SecurityModal 
            isOpen={true} 
            onClose={closeModal}
          />
        )}
        {activeModal === 'themes' && (
          <EnhancedThemeSelector 
            isOpen={true} 
            onClose={closeModal}
          />
        )}
        {activeModal === 'achievements' && (
          <AchievementSystem 
            isOpen={true} 
            onClose={closeModal}
          />
        )}
      </Suspense>
    </>
  );
});

// Set display name for debugging
FloatingButtons.displayName = 'FloatingButtons';

export default FloatingButtons;

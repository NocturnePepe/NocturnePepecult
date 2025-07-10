import React, { useState, lazy, Suspense } from 'react';
import { useMockWallet } from '../contexts/MockWalletContext';
import './FloatingButtons.css';

// Lazy load modals for performance
const SecurityModal = lazy(() => import('./SecurityModal'));
const EnhancedThemeSystem = lazy(() => import('./EnhancedThemeSystem'));
const AchievementSystem = lazy(() => import('./AchievementSystem'));

interface FloatingButtonsProps {
  position?: 'left' | 'right';
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ position = 'left' }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { userStats } = useMockWallet();

  const closeModal = () => setActiveModal(null);
  const openModal = (modal: string) => setActiveModal(modal);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const buttons = [
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
  ];

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
              onClick={() => {
                openModal(button.id);
                setIsExpanded(false);
              }}
              style={{ 
                '--button-color': button.color,
                '--delay': `${index * 0.1}s`
              } as React.CSSProperties}
              title={button.label}
            >
              <span className="button-icon">{button.icon}</span>
              <div className="button-tooltip">
                <div className="tooltip-title">{button.label}</div>
                <div className="tooltip-desc">{button.description}</div>
              </div>
              {button.badge && (
                <div className="button-badge" style={{ backgroundColor: button.color }}>
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
          <EnhancedThemeSystem 
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
};

export default FloatingButtons;

import React, { useState, useEffect } from 'react';
import './SeasonalThemes.css';

interface SeasonalTheme {
  name: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  description: string;
}

const SEASONAL_THEMES: SeasonalTheme[] = [
  {
    name: 'Cult Classic',
    icon: '💀',
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#CD853F',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #16213e 100%)'
    },
    description: 'Original cult theme with dark mystique'
  },
  {
    name: 'Lunar Eclipse',
    icon: '🌙',
    colors: {
      primary: '#4A148C',
      secondary: '#7B1FA2',
      accent: '#9C27B0',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #4A148C 100%)'
    },
    description: 'Purple moon vibes for night traders'
  },
  {
    name: 'Blood Moon',
    icon: '🩸',
    colors: {
      primary: '#B71C1C',
      secondary: '#D32F2F',
      accent: '#F44336',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #B71C1C 100%)'
    },
    description: 'Aggressive red theme for bull markets'
  },
  {
    name: 'Crypto Winter',
    icon: '❄️',
    colors: {
      primary: '#0D47A1',
      secondary: '#1976D2',
      accent: '#2196F3',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a2e 50%, #0D47A1 100%)'
    },
    description: 'Cool blue theme for bear markets'
  },
  {
    name: 'Golden Bull',
    icon: '🐂',
    colors: {
      primary: '#FF8F00',
      secondary: '#FFA000',
      accent: '#FFB300',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #2e1a0a 50%, #FF8F00 100%)'
    },
    description: 'Golden theme for bull runs'
  },
  {
    name: 'Matrix Green',
    icon: '💚',
    colors: {
      primary: '#1B5E20',
      secondary: '#2E7D32',
      accent: '#4CAF50',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #0a2e0a 50%, #1B5E20 100%)'
    },
    description: 'Classic green for profits'
  }
];

interface SeasonalThemesProps {
  isVisible: boolean;
  onClose: () => void;
}

const SeasonalThemes = ({ isVisible, onClose }: SeasonalThemesProps) => {
  const [selectedTheme, setSelectedTheme] = useState(SEASONAL_THEMES[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('nocturne_theme');
    if (savedTheme) {
      const theme = SEASONAL_THEMES.find(t => t.name === savedTheme);
      if (theme) {
        setSelectedTheme(theme);
        applyTheme(theme);
      }
    }
  }, []);

  const applyTheme = (theme: SeasonalTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--accent-color', theme.colors.accent);
    root.style.setProperty('--background-gradient', theme.colors.background);
    
    // Update body background
    document.body.style.background = theme.colors.background;
    
    // Save to localStorage
    localStorage.setItem('nocturne_theme', theme.name);
  };

  const handleThemeChange = (theme: SeasonalTheme) => {
    setIsAnimating(true);
    setSelectedTheme(theme);
    applyTheme(theme);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className="seasonal-themes-modal">
      <div className="seasonal-themes-backdrop" onClick={onClose} />
      <div className={`seasonal-themes-container ${isAnimating ? 'animating' : ''}`}>
        <div className="seasonal-themes-header">
          <h2>🎨 Seasonal Themes</h2>
          <p>Transform your trading experience</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="current-theme">
          <div className="current-theme-preview">
            <div className="theme-icon">{selectedTheme.icon}</div>
            <div className="theme-info">
              <h3>{selectedTheme.name}</h3>
              <p>{selectedTheme.description}</p>
            </div>
          </div>
        </div>
        
        <div className="themes-grid">
          {SEASONAL_THEMES.map((theme) => (
            <div
              key={theme.name}
              className={`theme-card ${selectedTheme.name === theme.name ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme)}
            >
              <div 
                className="theme-preview"
                style={{
                  background: theme.colors.background,
                  border: `2px solid ${theme.colors.primary}`
                }}
              >
                <div className="theme-preview-icon">{theme.icon}</div>
                <div 
                  className="theme-preview-accent"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>
              <div className="theme-name">{theme.name}</div>
            </div>
          ))}
        </div>
        
        <div className="theme-actions">
          <button 
            className="reset-btn"
            onClick={() => handleThemeChange(SEASONAL_THEMES[0])}
          >
            🔄 Reset to Default
          </button>
          <button 
            className="apply-btn"
            onClick={onClose}
          >
            ✅ Apply Theme
          </button>
        </div>
        
        <div className="theme-info-footer">
          <p>Themes are automatically saved and will persist across sessions</p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalThemes;

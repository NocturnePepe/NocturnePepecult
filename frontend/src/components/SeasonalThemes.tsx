import React, { useState, useEffect } from 'react';
import './SeasonalThemes.css';

// Theme definitions
const THEMES = {
  'dark-cult': {
    name: 'Dark Cult',
    description: 'The original mystical dark theme',
    icon: '🌙',
    colors: {
      primary: '#6a0dad',
      secondary: '#9932cc',
      accent: '#ff1493',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%)',
      cardBg: 'rgba(106, 13, 173, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#ff69b4'
    },
    effects: {
      particles: true,
      glow: true,
      mysticalBorder: true
    }
  },
  'winter-solstice': {
    name: 'Winter Solstice',
    description: 'Icy blue mystical theme for winter',
    icon: '❄️',
    colors: {
      primary: '#0066cc',
      secondary: '#4da6ff',
      accent: '#00ccff',
      background: 'linear-gradient(135deg, #001122 0%, #002244 50%, #001133 100%)',
      cardBg: 'rgba(0, 102, 204, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#66ccff'
    },
    effects: {
      particles: true,
      glow: true,
      snowfall: true
    }
  },
  'blood-moon': {
    name: 'Blood Moon',
    description: 'Crimson red theme for eclipse events',
    icon: '🌙',
    colors: {
      primary: '#cc0000',
      secondary: '#ff3333',
      accent: '#ff6666',
      background: 'linear-gradient(135deg, #220000 0%, #440000 50%, #330000 100%)',
      cardBg: 'rgba(204, 0, 0, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#ff9999'
    },
    effects: {
      particles: true,
      glow: true,
      bloodEffect: true
    }
  },
  'spring-renewal': {
    name: 'Spring Renewal',
    description: 'Fresh green theme for growth season',
    icon: '🌱',
    colors: {
      primary: '#009900',
      secondary: '#33cc33',
      accent: '#66ff66',
      background: 'linear-gradient(135deg, #001100 0%, #002200 50%, #001100 100%)',
      cardBg: 'rgba(0, 153, 0, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#99ff99'
    },
    effects: {
      particles: true,
      glow: true,
      growthEffect: true
    }
  },
  'summer-fire': {
    name: 'Summer Fire',
    description: 'Burning orange theme for summer heat',
    icon: '🔥',
    colors: {
      primary: '#ff6600',
      secondary: '#ff9933',
      accent: '#ffcc00',
      background: 'linear-gradient(135deg, #331100 0%, #442200 50%, #331100 100%)',
      cardBg: 'rgba(255, 102, 0, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#ffcc99'
    },
    effects: {
      particles: true,
      glow: true,
      fireEffect: true
    }
  },
  'autumn-harvest': {
    name: 'Autumn Harvest',
    description: 'Golden brown theme for harvest season',
    icon: '🍂',
    colors: {
      primary: '#cc6600',
      secondary: '#ff9933',
      accent: '#ffcc66',
      background: 'linear-gradient(135deg, #2b1810 0%, #3d2414 50%, #2b1810 100%)',
      cardBg: 'rgba(204, 102, 0, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#ffdd99'
    },
    effects: {
      particles: true,
      glow: true,
      leafFall: true
    }
  },
  'void-master': {
    name: 'Void Master',
    description: 'Ultimate dark theme for highest rank',
    icon: '⚫',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      background: 'linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)',
      cardBg: 'rgba(0, 0, 0, 0.8)',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc'
    },
    effects: {
      particles: true,
      glow: true,
      voidEffect: true
    }
  }
};

interface SeasonalThemesProps {
  isOpen: boolean;
  onClose: () => void;
}

const SeasonalThemes: React.FC<SeasonalThemesProps> = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState('dark-cult');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [autoSeasonal, setAutoSeasonal] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('nocturne_theme');
    const savedAutoSeasonal = localStorage.getItem('nocturne_auto_seasonal');
    
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
    
    if (savedAutoSeasonal) {
      setAutoSeasonal(JSON.parse(savedAutoSeasonal));
    }

    // Check for seasonal auto-theme
    if (savedAutoSeasonal === 'true') {
      const seasonalTheme = getSeasonalTheme();
      if (seasonalTheme !== savedTheme) {
        setCurrentTheme(seasonalTheme);
        applyTheme(seasonalTheme);
      }
    }
  }, []);

  const getSeasonalTheme = () => {
    const now = new Date();
    const month = now.getMonth();
    
    // December, January, February - Winter
    if (month === 11 || month === 0 || month === 1) {
      return 'winter-solstice';
    }
    // March, April, May - Spring
    else if (month >= 2 && month <= 4) {
      return 'spring-renewal';
    }
    // June, July, August - Summer
    else if (month >= 5 && month <= 7) {
      return 'summer-fire';
    }
    // September, October, November - Autumn
    else {
      return 'autumn-harvest';
    }
  };

  const applyTheme = (themeKey: string) => {
    const theme = THEMES[themeKey as keyof typeof THEMES];
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-card-bg', theme.colors.cardBg);
    root.style.setProperty('--theme-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);

    // Apply body background
    document.body.style.background = theme.colors.background;

    // Add theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeKey}`);

    // Apply special effects
    applyThemeEffects(theme.effects);
  };

  const applyThemeEffects = (effects: any) => {
    // Remove existing effect classes
    document.body.classList.remove('effect-snowfall', 'effect-blood', 'effect-growth', 'effect-fire', 'effect-leaffall', 'effect-void');

    // Add new effect classes based on theme
    if (effects.snowfall) document.body.classList.add('effect-snowfall');
    if (effects.bloodEffect) document.body.classList.add('effect-blood');
    if (effects.growthEffect) document.body.classList.add('effect-growth');
    if (effects.fireEffect) document.body.classList.add('effect-fire');
    if (effects.leafFall) document.body.classList.add('effect-leaffall');
    if (effects.voidEffect) document.body.classList.add('effect-void');
  };

  const handleThemeSelect = (themeKey: string) => {
    setCurrentTheme(themeKey);
    applyTheme(themeKey);
    localStorage.setItem('nocturne_theme', themeKey);
    
    // Disable auto-seasonal when manually selecting
    if (autoSeasonal) {
      setAutoSeasonal(false);
      localStorage.setItem('nocturne_auto_seasonal', 'false');
    }
  };

  const handlePreview = (themeKey: string) => {
    setPreviewTheme(themeKey);
    applyTheme(themeKey);
  };

  const handlePreviewEnd = () => {
    if (previewTheme) {
      setPreviewTheme(null);
      applyTheme(currentTheme);
    }
  };

  const handleAutoSeasonalToggle = () => {
    const newAutoSeasonal = !autoSeasonal;
    setAutoSeasonal(newAutoSeasonal);
    localStorage.setItem('nocturne_auto_seasonal', newAutoSeasonal.toString());
    
    if (newAutoSeasonal) {
      const seasonalTheme = getSeasonalTheme();
      handleThemeSelect(seasonalTheme);
    }
  };

  const getCurrentSeasonText = () => {
    const seasonalTheme = getSeasonalTheme();
    return THEMES[seasonalTheme as keyof typeof THEMES].name;
  };

  if (!isOpen) return null;

  return (
    <div className="seasonal-themes-overlay">
      <div className="seasonal-themes-modal">
        <div className="themes-header">
          <h2>🎨 Seasonal Themes</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="auto-seasonal-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={autoSeasonal}
              onChange={handleAutoSeasonalToggle}
            />
            <span className="toggle-slider"></span>
            Auto-Seasonal Themes
          </label>
          {autoSeasonal && (
            <div className="seasonal-info">
              Currently: {getCurrentSeasonText()}
            </div>
          )}
        </div>

        <div className="themes-grid">
          {Object.entries(THEMES).map(([key, theme]) => (
            <div
              key={key}
              className={`theme-card ${currentTheme === key ? 'active' : ''} ${previewTheme === key ? 'previewing' : ''}`}
              onClick={() => handleThemeSelect(key)}
              onMouseEnter={() => handlePreview(key)}
              onMouseLeave={handlePreviewEnd}
            >
              <div className="theme-preview" style={{ background: theme.colors.background }}>
                <div className="preview-card" style={{ background: theme.colors.cardBg, border: `1px solid ${theme.colors.primary}` }}>
                  <div className="preview-button" style={{ background: theme.colors.primary }}></div>
                  <div className="preview-text" style={{ color: theme.colors.textSecondary }}></div>
                </div>
              </div>
              
              <div className="theme-info">
                <div className="theme-header">
                  <span className="theme-icon">{theme.icon}</span>
                  <h3>{theme.name}</h3>
                </div>
                <p>{theme.description}</p>
                
                <div className="color-palette">
                  <div className="color-dot" style={{ background: theme.colors.primary }}></div>
                  <div className="color-dot" style={{ background: theme.colors.secondary }}></div>
                  <div className="color-dot" style={{ background: theme.colors.accent }}></div>
                </div>
              </div>

              {currentTheme === key && (
                <div className="active-indicator">
                  <span>✓ Active</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="themes-footer">
          <div className="theme-tips">
            💡 <strong>Tips:</strong> Hover to preview themes instantly. Enable auto-seasonal for automatic theme changes with the seasons.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalThemes;

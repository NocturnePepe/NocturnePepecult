import React, { useState, useEffect } from 'react';
import { useMockWallet } from '../contexts/MockWalletContext';
import './EnhancedThemeSystem.css';

// Gaming-Tier Theme Definitions
const GAMING_THEMES = {
  'cult': {
    name: 'Cult Mode',
    description: 'The original mystical dark theme',
    rune: '🌙',
    className: 'theme-cult',
    colors: {
      primary: '#6a0dad',
      secondary: '#9932cc',
      accent: '#ff1493',
      glow: 'rgba(106, 13, 173, 0.6)'
    },
    effects: {
      particles: true,
      glow: true,
      mysticalBorder: true,
      fog: true
    }
  },
  'cyber': {
    name: 'Cyber Void',
    description: 'Glitch-enhanced cyberpunk theme',
    rune: '⚡',
    className: 'theme-cyber',
    colors: {
      primary: '#00ffff',
      secondary: '#0066ff',
      accent: '#ff00ff',
      glow: 'rgba(0, 255, 255, 0.6)'
    },
    effects: {
      particles: true,
      glow: true,
      glitch: true,
      fog: false
    }
  },
  'ember': {
    name: 'Chaos Ember',
    description: 'Embers + ambient glow effects',
    rune: '🔥',
    className: 'theme-ember',
    colors: {
      primary: '#ff4500',
      secondary: '#ff6347',
      accent: '#ffd700',
      glow: 'rgba(255, 69, 0, 0.6)'
    },
    effects: {
      particles: true,
      glow: true,
      embers: true,
      fog: true
    }
  }
};

interface EnhancedThemeSystemProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const EnhancedThemeSystem: React.FC<EnhancedThemeSystemProps> = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState('cult');
  const [fogEnabled, setFogEnabled] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const { userStats } = useMockWallet();

  // Load saved theme preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('nocturne_theme');
    const savedFog = localStorage.getItem('nocturne_fog_enabled');
    const savedEffects = localStorage.getItem('nocturne_effects_enabled');
    
    if (savedTheme && GAMING_THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
    
    if (savedFog !== null) {
      setFogEnabled(savedFog === 'true');
    }
    
    if (savedEffects !== null) {
      setEffectsEnabled(savedEffects === 'true');
    }
  }, []);

  // Apply theme based on cult tier
  useEffect(() => {
    const tierClass = `rank-tier-${userStats.cultTier}`;
    document.body.classList.remove(
      'rank-tier-1', 'rank-tier-2', 'rank-tier-3',
      'rank-tier-4', 'rank-tier-5', 'rank-tier-6',
      'rank-tier-7', 'rank-tier-8', 'rank-tier-9', 'rank-tier-10'
    );
    document.body.classList.add(tierClass);
  }, [userStats.cultTier]);

  const applyTheme = (themeId: string) => {
    const theme = GAMING_THEMES[themeId];
    if (!theme) return;

    // Remove all theme classes
    document.body.classList.remove(
      'theme-cult', 'theme-cyber', 'theme-ember'
    );
    
    // Add new theme class
    document.body.classList.add(theme.className);
    
    // Update CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-glow', theme.colors.glow);
    
    // Apply fog setting
    root.style.setProperty('--fog-opacity', fogEnabled ? '0.4' : '0');
    
    // Emit theme change event
    window.dispatchEvent(new CustomEvent('nocturne_theme_changed', {
      detail: { themeId, theme, fogEnabled, effectsEnabled }
    }));
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('nocturne_theme', themeId);
    
    // Track theme change
    if (window.nocturneAnalytics) {
      window.nocturneAnalytics.track('theme_changed', { theme: themeId });
    }
  };

  const toggleFog = () => {
    const newFogState = !fogEnabled;
    setFogEnabled(newFogState);
    localStorage.setItem('nocturne_fog_enabled', newFogState.toString());
    
    // Update CSS property
    document.documentElement.style.setProperty(
      '--fog-opacity', 
      newFogState ? '0.4' : '0'
    );
  };

  const toggleEffects = () => {
    const newEffectsState = !effectsEnabled;
    setEffectsEnabled(newEffectsState);
    localStorage.setItem('nocturne_effects_enabled', newEffectsState.toString());
    
    // Toggle effects class on body
    document.body.classList.toggle('effects-disabled', !newEffectsState);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content enhanced-theme-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎨 Gaming-Tier Themes</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="theme-content">
          {/* Theme Selection */}
          <div className="theme-section">
            <h3>Choose Your Cult Aesthetic</h3>
            <div className="theme-grid">
              {Object.entries(GAMING_THEMES).map(([id, theme]) => (
                <div
                  key={id}
                  className={`theme-card ${currentTheme === id ? 'active' : ''}`}
                  onClick={() => handleThemeChange(id)}
                >
                  <div className="theme-preview" style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                  }}>
                    <span className="theme-rune">{theme.rune}</span>
                  </div>
                  <div className="theme-info">
                    <h4>{theme.name}</h4>
                    <p>{theme.description}</p>
                  </div>
                  <div className="theme-effects">
                    {theme.effects.particles && <span className="effect-tag">Particles</span>}
                    {theme.effects.glow && <span className="effect-tag">Glow</span>}
                    {theme.effects.glitch && <span className="effect-tag">Glitch</span>}
                    {theme.effects.embers && <span className="effect-tag">Embers</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Effects Controls */}
          <div className="effects-section">
            <h3>Visual Effects Control</h3>
            <div className="effects-controls">
              <div className="control-item">
                <label className="control-label">
                  <input
                    type="checkbox"
                    checked={fogEnabled}
                    onChange={toggleFog}
                    className="control-checkbox"
                  />
                  <span className="control-text">
                    🌫️ Mystical Fog Layer
                    <small>Atmospheric smoke effects</small>
                  </span>
                </label>
              </div>
              
              <div className="control-item">
                <label className="control-label">
                  <input
                    type="checkbox"
                    checked={effectsEnabled}
                    onChange={toggleEffects}
                    className="control-checkbox"
                  />
                  <span className="control-text">
                    ✨ Enhanced Effects
                    <small>Particles, glows, and animations</small>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Cult Tier Info */}
          <div className="tier-section">
            <h3>Your Cult Tier Influence</h3>
            <div className="tier-info">
              <div className="tier-badge">
                Tier {userStats.cultTier}
              </div>
              <div className="tier-description">
                <p>Your cult rank enhances theme colors and effects!</p>
                <div className="tier-colors">
                  {userStats.cultTier <= 3 && (
                    <span className="tier-color cold">Cold Blue Tones</span>
                  )}
                  {userStats.cultTier >= 4 && userStats.cultTier <= 6 && (
                    <span className="tier-color hot">Glowing Red Energy</span>
                  )}
                  {userStats.cultTier >= 7 && (
                    <span className="tier-color void">Void Purple Mastery</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Note */}
          <div className="performance-note">
            <p>
              <span className="note-icon">⚡</span>
              Effects automatically optimize for mobile performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThemeSystem;

/* ===== PHASE 2: ENHANCED FLOATING THEME SELECTOR ===== */
/* Gaming-Tier Theme Switching with Visual Previews */

import React, { useState, useCallback, useMemo } from 'react';
import { useAdvancedTheme, ThemeType, VisualIntensity, PerformanceMode } from '../contexts/AdvancedThemeContext';
import './EnhancedThemeSelector.css';

interface EnhancedThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedThemeSelector: React.FC<EnhancedThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { 
    currentTheme, 
    setTheme, 
    visualIntensity, 
    setVisualIntensity,
    performanceMode,
    setPerformanceMode,
    getThemeClasses 
  } = useAdvancedTheme();

  const [previewTheme, setPreviewTheme] = useState<ThemeType | null>(null);

  // Theme options with descriptions
  const themeOptions = useMemo(() => [
    {
      id: 'cult' as ThemeType,
      name: 'Nocturne Cult',
      description: 'Purple mystical energy with cult aesthetics',
      colors: ['#9c88ff', '#7c4dff', '#b39ddb'],
      preview: 'linear-gradient(135deg, #9c88ff, #7c4dff, #b39ddb)'
    },
    {
      id: 'mystical' as ThemeType,
      name: 'Mystical Waters',
      description: 'Blue-cyan flowing energy with natural harmony',
      colors: ['#4fc3f7', '#29b6f6', '#81c784'],
      preview: 'linear-gradient(135deg, #4fc3f7, #29b6f6, #81c784)'
    },
    {
      id: 'neon' as ThemeType,
      name: 'Cyberpunk Neon',
      description: 'High-energy pink and magenta cyberpunk vibes',
      colors: ['#ff4081', '#e91e63', '#ff6ec7'],
      preview: 'linear-gradient(135deg, #ff4081, #e91e63, #ff6ec7)'
    },
    {
      id: 'ethereal' as ThemeType,
      name: 'Ethereal Light',
      description: 'Soft white and silver celestial elegance',
      colors: ['#ffffff', '#f5f5f5', '#e8eaf6'],
      preview: 'linear-gradient(135deg, #ffffff, #f5f5f5, #e8eaf6)'
    },
    {
      id: 'cosmic' as ThemeType,
      name: 'Cosmic Purple',
      description: 'Deep space purples with cosmic energy',
      colors: ['#673ab7', '#9c27b0', '#e91e63'],
      preview: 'linear-gradient(135deg, #673ab7, #9c27b0, #e91e63)'
    },
    {
      id: 'shadow' as ThemeType,
      name: 'Shadow Realm',
      description: 'Dark grays with mysterious void aesthetics',
      colors: ['#424242', '#616161', '#9e9e9e'],
      preview: 'linear-gradient(135deg, #424242, #616161, #9e9e9e)'
    }
  ], []);

  // Intensity options with effects
  const intensityOptions = useMemo(() => [
    { id: 'minimal' as VisualIntensity, name: 'Minimal', description: 'Clean, simple interface', effects: '30%' },
    { id: 'low' as VisualIntensity, name: 'Low', description: 'Subtle visual effects', effects: '60%' },
    { id: 'medium' as VisualIntensity, name: 'Medium', description: 'Balanced experience', effects: '100%' },
    { id: 'high' as VisualIntensity, name: 'High', description: 'Rich visual effects', effects: '140%' },
    { id: 'ultra' as VisualIntensity, name: 'Ultra', description: 'Maximum eye candy', effects: '180%' },
    { id: 'sentient' as VisualIntensity, name: 'Sentient', description: 'Reality-bending experience', effects: '250%' }
  ], []);

  // Performance options
  const performanceOptions = useMemo(() => [
    { id: 'potato' as PerformanceMode, name: 'Potato', description: 'Minimal resources', fps: '30fps' },
    { id: 'balanced' as PerformanceMode, name: 'Balanced', description: 'Optimal balance', fps: '60fps' },
    { id: 'performance' as PerformanceMode, name: 'Performance', description: 'High quality', fps: '60fps+' },
    { id: 'ultra' as PerformanceMode, name: 'Ultra', description: 'Maximum quality', fps: '120fps' },
    { id: 'godmode' as PerformanceMode, name: 'God Mode', description: 'Unlimited power', fps: '∞fps' }
  ], []);

  // Theme selection with preview
  const handleThemeSelect = useCallback((theme: ThemeType) => {
    setTheme(theme);
    setPreviewTheme(null);
  }, [setTheme]);

  const handleThemePreview = useCallback((theme: ThemeType) => {
    setPreviewTheme(theme);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewTheme(null);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="enhanced-theme-selector-overlay" onClick={onClose}>
      <div 
        className={`enhanced-theme-selector ${getThemeClasses()}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="theme-selector-header">
          <h2 className="theme-selector-title">🎨 Gaming-Tier Visual Settings</h2>
          <button 
            className="theme-selector-close"
            onClick={onClose}
            aria-label="Close theme selector"
          >
            ✕
          </button>
        </div>

        {/* Content Grid */}
        <div className="theme-selector-content">
          {/* Theme Selection */}
          <section className="theme-section">
            <h3 className="section-title">Visual Theme</h3>
            <div className="theme-grid">
              {themeOptions.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-card ${currentTheme === theme.id ? 'active' : ''} ${previewTheme === theme.id ? 'preview' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                  onMouseEnter={() => handleThemePreview(theme.id)}
                  onMouseLeave={clearPreview}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${theme.name} theme`}
                >
                  <div 
                    className="theme-preview"
                    style={{ background: theme.preview }}
                  >
                    <div className="theme-preview-particles">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="preview-particle"
                          style={{ 
                            backgroundColor: color,
                            animationDelay: `${index * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="theme-info">
                    <h4 className="theme-name">{theme.name}</h4>
                    <p className="theme-description">{theme.description}</p>
                  </div>
                  {currentTheme === theme.id && (
                    <div className="theme-active-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Visual Intensity */}
          <section className="intensity-section">
            <h3 className="section-title">Visual Intensity</h3>
            <div className="intensity-slider-container">
              <div className="intensity-options">
                {intensityOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`intensity-option ${visualIntensity === option.id ? 'active' : ''}`}
                    onClick={() => setVisualIntensity(option.id)}
                    title={option.description}
                  >
                    <span className="intensity-name">{option.name}</span>
                    <span className="intensity-effects">{option.effects}</span>
                  </button>
                ))}
              </div>
              <div className="intensity-description">
                {intensityOptions.find(opt => opt.id === visualIntensity)?.description}
              </div>
            </div>
          </section>

          {/* Performance Mode */}
          <section className="performance-section">
            <h3 className="section-title">Performance Mode</h3>
            <div className="performance-options">
              {performanceOptions.map((option) => (
                <button
                  key={option.id}
                  className={`performance-option ${performanceMode === option.id ? 'active' : ''}`}
                  onClick={() => setPerformanceMode(option.id)}
                  title={option.description}
                >
                  <span className="performance-name">{option.name}</span>
                  <span className="performance-fps">{option.fps}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Live Preview */}
          <section className="preview-section">
            <h3 className="section-title">Live Preview</h3>
            <div className="preview-demo">
              <div className="preview-elements">
                <div className="preview-button">Sample Button</div>
                <div className="preview-card">
                  <div className="preview-text">Sample Card</div>
                  <div className="preview-accent">Accent Color</div>
                </div>
                <div className="preview-particles-demo">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div 
                      key={i} 
                      className="preview-particle-live"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="theme-selector-footer">
          <div className="current-settings">
            <span>Current: {themeOptions.find(t => t.id === currentTheme)?.name}</span>
            <span>Intensity: {intensityOptions.find(i => i.id === visualIntensity)?.name}</span>
            <span>Performance: {performanceOptions.find(p => p.id === performanceMode)?.name}</span>
          </div>
          <button className="apply-button" onClick={onClose}>
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThemeSelector;

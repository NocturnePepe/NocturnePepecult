// SeasonalThemes.js - Dynamic seasonal theme system
import { cultSounds } from './SoundEffects.js';

class SeasonalThemeManager {
  constructor() {
    this.currentTheme = 'default';
    this.themes = {
      default: {
        name: 'Dark Cult',
        colors: {
          primary: '#ff6432',
          secondary: '#9632ff',
          background: '#000000',
          surface: 'rgba(20, 20, 40, 0.95)',
          accent: '#ff4500'
        },
        effects: {
          particles: 'embers',
          glow: 'orange',
          animation: 'float'
        }
      },
      halloween: {
        name: 'Halloween Horror',
        colors: {
          primary: '#ff4500',
          secondary: '#800080',
          background: '#0d0d0d',
          surface: 'rgba(30, 10, 30, 0.95)',
          accent: '#ff6600'
        },
        effects: {
          particles: 'bats',
          glow: 'purple',
          animation: 'spooky'
        },
        season: { start: '10-01', end: '11-02' }
      },
      winter: {
        name: 'Frost Ritual',
        colors: {
          primary: '#00bfff',
          secondary: '#4169e1',
          background: '#001122',
          surface: 'rgba(10, 20, 40, 0.95)',
          accent: '#87ceeb'
        },
        effects: {
          particles: 'snowflakes',
          glow: 'blue',
          animation: 'freeze'
        },
        season: { start: '12-01', end: '02-28' }
      },
      spring: {
        name: 'Blood Moon',
        colors: {
          primary: '#dc143c',
          secondary: '#ff1493',
          background: '#0a0a0a',
          surface: 'rgba(40, 10, 20, 0.95)',
          accent: '#ff69b4'
        },
        effects: {
          particles: 'petals',
          glow: 'red',
          animation: 'bloom'
        },
        season: { start: '03-01', end: '05-31' }
      },
      summer: {
        name: 'Solar Eclipse',
        colors: {
          primary: '#ffd700',
          secondary: '#ff8c00',
          background: '#0f0f0f',
          surface: 'rgba(40, 30, 10, 0.95)',
          accent: '#ffff00'
        },
        effects: {
          particles: 'fire',
          glow: 'yellow',
          animation: 'burn'
        },
        season: { start: '06-01', end: '08-31' }
      },
      christmas: {
        name: 'Dark Christmas',
        colors: {
          primary: '#dc143c',
          secondary: '#228b22',
          background: '#0a0a0a',
          surface: 'rgba(20, 30, 20, 0.95)',
          accent: '#ffd700'
        },
        effects: {
          particles: 'stars',
          glow: 'green',
          animation: 'twinkle'
        },
        season: { start: '12-15', end: '12-31' }
      },
      newYear: {
        name: 'New Ritual',
        colors: {
          primary: '#ffd700',
          secondary: '#ff6347',
          background: '#0a0a0a',
          surface: 'rgba(30, 20, 40, 0.95)',
          accent: '#ff69b4'
        },
        effects: {
          particles: 'fireworks',
          glow: 'rainbow',
          animation: 'celebrate'
        },
        season: { start: '12-31', end: '01-07' }
      },
      trading: {
        name: 'Bull Market',
        colors: {
          primary: '#00ff00',
          secondary: '#32cd32',
          background: '#001100',
          surface: 'rgba(10, 30, 10, 0.95)',
          accent: '#90ee90'
        },
        effects: {
          particles: 'coins',
          glow: 'green',
          animation: 'pump'
        },
        trigger: 'market_up'
      },
      bear: {
        name: 'Bear Market',
        colors: {
          primary: '#ff4444',
          secondary: '#cc0000',
          background: '#110000',
          surface: 'rgba(30, 10, 10, 0.95)',
          accent: '#ff6666'
        },
        effects: {
          particles: 'rain',
          glow: 'red',
          animation: 'dump'
        },
        trigger: 'market_down'
      }
    };
    
    this.currentSeason = this.detectSeason();
    this.marketCondition = 'neutral';
    this.autoDetectEnabled = true;
    this.customEvents = new Map();
    
    this.initialize();
  }

  initialize() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('seasonal_theme');
    const autoDetect = localStorage.getItem('auto_detect_theme') !== 'false';
    
    this.autoDetectEnabled = autoDetect;
    
    if (savedTheme && !autoDetect) {
      this.setTheme(savedTheme);
    } else if (autoDetect) {
      this.autoDetectTheme();
    } else {
      this.setTheme('default');
    }

    // Setup periodic theme checking
    setInterval(() => {
      if (this.autoDetectEnabled) {
        this.autoDetectTheme();
      }
    }, 60000 * 60); // Check every hour

    // Setup market condition monitoring
    this.monitorMarketConditions();
  }

  detectSeason() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    // Check for specific seasonal periods
    for (const [themeKey, theme] of Object.entries(this.themes)) {
      if (theme.season) {
        const { start, end } = theme.season;
        if (this.isDateInRange(dateStr, start, end)) {
          return themeKey;
        }
      }
    }

    // Default seasonal detection
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'halloween';
    if (month === 12 || month <= 2) return 'winter';
    
    return 'default';
  }

  isDateInRange(current, start, end) {
    // Handle year-crossing ranges (like Dec-Jan)
    if (start > end) {
      return current >= start || current <= end;
    }
    return current >= start && current <= end;
  }

  autoDetectTheme() {
    let newTheme = this.currentSeason;

    // Check for special events first
    if (this.hasActiveCustomEvent()) {
      newTheme = this.getActiveCustomEvent();
    } else if (this.marketCondition === 'bull' && this.themes.trading) {
      newTheme = 'trading';
    } else if (this.marketCondition === 'bear' && this.themes.bear) {
      newTheme = 'bear';
    }

    if (newTheme !== this.currentTheme) {
      this.setTheme(newTheme, true);
    }
  }

  setTheme(themeKey, isAuto = false) {
    if (!this.themes[themeKey]) {
      console.warn(`Theme ${themeKey} not found`);
      return;
    }

    const oldTheme = this.currentTheme;
    this.currentTheme = themeKey;
    const theme = this.themes[themeKey];

    // Apply theme colors
    this.applyColors(theme.colors);
    
    // Apply theme effects
    this.applyEffects(theme.effects);

    // Save preference if manually selected
    if (!isAuto) {
      localStorage.setItem('seasonal_theme', themeKey);
      localStorage.setItem('auto_detect_theme', 'false');
      this.autoDetectEnabled = false;
    }

    // Notify theme change
    this.notifyThemeChange(oldTheme, themeKey, theme.name);

    // Play theme-specific sound
    this.playThemeSound(themeKey);

    console.log(`🎨 Theme changed to: ${theme.name}`);
  }

  applyColors(colors) {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Update existing elements with new colors
    this.updateElementColors(colors);
  }

  updateElementColors(colors) {
    // Update header
    const headers = document.querySelectorAll('h2, h3, h4');
    headers.forEach(header => {
      header.style.color = colors.primary;
    });

    // Update buttons
    const buttons = document.querySelectorAll('.header-actions button');
    buttons.forEach(button => {
      button.style.borderColor = colors.primary + '40';
      button.style.background = colors.primary + '20';
    });

    // Update swap interface elements
    const swapElements = document.querySelectorAll('.swap-container, .token-input');
    swapElements.forEach(element => {
      element.style.background = colors.surface;
      element.style.borderColor = colors.primary + '40';
    });
  }

  applyEffects(effects) {
    // Remove existing effect classes
    document.body.classList.remove('embers', 'bats', 'snowflakes', 'petals', 'fire', 'stars', 'fireworks', 'coins', 'rain');
    
    // Add new effect class
    if (effects.particles) {
      document.body.classList.add(effects.particles);
    }

    // Update particle system
    this.updateParticleSystem(effects);

    // Update glow effects
    this.updateGlowEffects(effects.glow);
  }

  updateParticleSystem(effects) {
    // Remove existing particle container
    const existing = document.getElementById('seasonal-particles');
    if (existing) existing.remove();

    // Create new particle container
    const container = document.createElement('div');
    container.id = 'seasonal-particles';
    container.className = 'particle-container';
    
    const particleCount = this.getParticleCount(effects.particles);
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.createParticle(effects.particles, i);
      container.appendChild(particle);
    }

    document.body.appendChild(container);
  }

  getParticleCount(type) {
    const counts = {
      embers: 20,
      bats: 8,
      snowflakes: 30,
      petals: 15,
      fire: 25,
      stars: 40,
      fireworks: 12,
      coins: 10,
      rain: 50
    };
    return counts[type] || 15;
  }

  createParticle(type, index) {
    const particle = document.createElement('div');
    particle.className = `particle particle-${type}`;
    
    // Random positioning and animation delay
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (5 + Math.random() * 10) + 's';
    
    // Type-specific properties
    switch (type) {
      case 'embers':
        particle.innerHTML = '🔥';
        particle.style.fontSize = (8 + Math.random() * 8) + 'px';
        break;
      case 'bats':
        particle.innerHTML = '🦇';
        particle.style.fontSize = (12 + Math.random() * 8) + 'px';
        break;
      case 'snowflakes':
        particle.innerHTML = '❄️';
        particle.style.fontSize = (6 + Math.random() * 10) + 'px';
        break;
      case 'petals':
        particle.innerHTML = '🌸';
        particle.style.fontSize = (8 + Math.random() * 6) + 'px';
        break;
      case 'fire':
        particle.innerHTML = '🔥';
        particle.style.fontSize = (10 + Math.random() * 10) + 'px';
        break;
      case 'stars':
        particle.innerHTML = '⭐';
        particle.style.fontSize = (6 + Math.random() * 8) + 'px';
        break;
      case 'fireworks':
        particle.innerHTML = '🎆';
        particle.style.fontSize = (12 + Math.random() * 8) + 'px';
        break;
      case 'coins':
        particle.innerHTML = '💰';
        particle.style.fontSize = (8 + Math.random() * 6) + 'px';
        break;
      case 'rain':
        particle.innerHTML = '💧';
        particle.style.fontSize = (6 + Math.random() * 4) + 'px';
        break;
    }

    return particle;
  }

  updateGlowEffects(glowType) {
    const glowColors = {
      orange: 'rgba(255, 100, 50, 0.3)',
      purple: 'rgba(150, 50, 255, 0.3)',
      blue: 'rgba(100, 150, 255, 0.3)',
      red: 'rgba(255, 50, 50, 0.3)',
      yellow: 'rgba(255, 255, 100, 0.3)',
      green: 'rgba(100, 255, 100, 0.3)',
      rainbow: 'rgba(255, 100, 255, 0.3)'
    };

    const glowColor = glowColors[glowType] || glowColors.orange;
    
    // Update glow effects on key elements
    const glowElements = document.querySelectorAll('.swap-container, .token-input, .chart-container');
    glowElements.forEach(element => {
      element.style.boxShadow = `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40`;
    });
  }

  monitorMarketConditions() {
    // Simulate market condition monitoring
    // In real implementation, this would connect to price APIs
    setInterval(() => {
      const change = (Math.random() - 0.5) * 20; // -10% to +10%
      
      if (change > 5) {
        this.marketCondition = 'bull';
      } else if (change < -5) {
        this.marketCondition = 'bear';
      } else {
        this.marketCondition = 'neutral';
      }

      if (this.autoDetectEnabled) {
        this.autoDetectTheme();
      }
    }, 60000 * 5); // Check every 5 minutes
  }

  addCustomEvent(name, theme, startDate, endDate) {
    this.customEvents.set(name, {
      theme,
      start: startDate,
      end: endDate,
      active: this.isDateInRange(this.getCurrentDateString(), startDate, endDate)
    });
  }

  hasActiveCustomEvent() {
    const currentDate = this.getCurrentDateString();
    for (const [name, event] of this.customEvents) {
      if (this.isDateInRange(currentDate, event.start, event.end)) {
        return true;
      }
    }
    return false;
  }

  getActiveCustomEvent() {
    const currentDate = this.getCurrentDateString();
    for (const [name, event] of this.customEvents) {
      if (this.isDateInRange(currentDate, event.start, event.end)) {
        return event.theme;
      }
    }
    return this.currentSeason;
  }

  getCurrentDateString() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  enableAutoDetect() {
    this.autoDetectEnabled = true;
    localStorage.setItem('auto_detect_theme', 'true');
    this.autoDetectTheme();
  }

  disableAutoDetect() {
    this.autoDetectEnabled = false;
    localStorage.setItem('auto_detect_theme', 'false');
  }

  getAvailableThemes() {
    return Object.entries(this.themes).map(([key, theme]) => ({
      key,
      name: theme.name,
      isSeasonal: !!theme.season,
      isActive: key === this.currentTheme
    }));
  }

  notifyThemeChange(oldTheme, newTheme, themeName) {
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'theme-change-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="theme-icon">🎨</span>
        <span class="theme-message">Theme changed to ${themeName}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { oldTheme, newTheme, themeName }
    }));
  }

  playThemeSound(themeKey) {
    // Play theme-specific sound effects
    switch (themeKey) {
      case 'halloween':
        cultSounds.playSpookySound?.() || cultSounds.playHoverSound();
        break;
      case 'winter':
      case 'christmas':
        cultSounds.playChillSound?.() || cultSounds.playConnectSound();
        break;
      case 'trading':
        cultSounds.playCoinSound?.() || cultSounds.playRitualCompleteSound();
        break;
      case 'bear':
        cultSounds.playErrorSound();
        break;
      default:
        cultSounds.playHoverSound();
    }
  }

  // Theme preview functionality
  previewTheme(themeKey, duration = 5000) {
    const originalTheme = this.currentTheme;
    this.setTheme(themeKey);
    
    setTimeout(() => {
      this.setTheme(originalTheme);
    }, duration);
  }
}

// Export singleton instance
export const seasonalThemeManager = new SeasonalThemeManager();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Seasonal Theme Manager initialized');
});

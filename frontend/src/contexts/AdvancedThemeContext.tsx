/* ===== PHASE 2: ADVANCED THEME SYSTEM ===== */
/* Dynamic Gaming-Tier Visual Theme Management */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  visualIntensity: VisualIntensity;
  setVisualIntensity: (intensity: VisualIntensity) => void;
  performanceMode: PerformanceMode;
  setPerformanceMode: (mode: PerformanceMode) => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  themeConfig: ThemeConfig;
  applyTheme: (element: HTMLElement) => void;
  getThemeClasses: () => string;
}

export type ThemeType = 'cult' | 'mystical' | 'neon' | 'ethereal' | 'cosmic' | 'shadow';
export type VisualIntensity = 'minimal' | 'low' | 'medium' | 'high' | 'ultra' | 'sentient';
export type PerformanceMode = 'potato' | 'balanced' | 'performance' | 'ultra' | 'godmode';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    glow: string;
    particle: string[];
  };
  effects: {
    blur: number;
    glow: number;
    saturation: number;
    brightness: number;
    contrast: number;
    particleCount: number;
    animationSpeed: number;
  };
  particles: {
    types: string[];
    colors: string[];
    intensity: number;
    interactivity: boolean;
  };
}

const themeConfigs: Record<ThemeType, ThemeConfig> = {
  cult: {
    colors: {
      primary: '#9c88ff',
      secondary: '#7c4dff',
      accent: '#b39ddb',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      surface: 'rgba(156, 136, 255, 0.05)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(156, 136, 255, 0.3)',
      glow: 'rgba(156, 136, 255, 0.6)',
      particle: ['#9c88ff', '#7c4dff', '#b39ddb', '#e1bee7']
    },
    effects: {
      blur: 0,
      glow: 1.2,
      saturation: 1.1,
      brightness: 1.0,
      contrast: 1.1,
      particleCount: 50,
      animationSpeed: 1.0
    },
    particles: {
      types: ['sparkle', 'glow', 'rune'],
      colors: ['#9c88ff', '#7c4dff', '#b39ddb'],
      intensity: 0.8,
      interactivity: true
    }
  },
  mystical: {
    colors: {
      primary: '#4fc3f7',
      secondary: '#29b6f6',
      accent: '#81c784',
      background: 'linear-gradient(135deg, #0d1421 0%, #1e3a5f 50%, #2d5aa0 100%)',
      surface: 'rgba(79, 195, 247, 0.05)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(79, 195, 247, 0.3)',
      glow: 'rgba(79, 195, 247, 0.6)',
      particle: ['#4fc3f7', '#29b6f6', '#81c784', '#aed581']
    },
    effects: {
      blur: 0.5,
      glow: 1.5,
      saturation: 1.2,
      brightness: 1.1,
      contrast: 1.0,
      particleCount: 75,
      animationSpeed: 1.3
    },
    particles: {
      types: ['sparkle', 'energy', 'flow'],
      colors: ['#4fc3f7', '#29b6f6', '#81c784'],
      intensity: 1.0,
      interactivity: true
    }
  },
  neon: {
    colors: {
      primary: '#ff4081',
      secondary: '#e91e63',
      accent: '#ff6ec7',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #2a0a2a 100%)',
      surface: 'rgba(255, 64, 129, 0.05)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(255, 64, 129, 0.4)',
      glow: 'rgba(255, 64, 129, 0.8)',
      particle: ['#ff4081', '#e91e63', '#ff6ec7', '#f48fb1']
    },
    effects: {
      blur: 0,
      glow: 2.0,
      saturation: 1.5,
      brightness: 1.2,
      contrast: 1.3,
      particleCount: 100,
      animationSpeed: 1.8
    },
    particles: {
      types: ['glow', 'energy', 'lightning'],
      colors: ['#ff4081', '#e91e63', '#ff6ec7'],
      intensity: 1.3,
      interactivity: true
    }
  },
  ethereal: {
    colors: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      accent: '#e8eaf6',
      background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 50%, #e8e8e8 100%)',
      surface: 'rgba(255, 255, 255, 0.8)',
      text: '#333333',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      border: 'rgba(0, 0, 0, 0.1)',
      glow: 'rgba(255, 255, 255, 0.9)',
      particle: ['#ffffff', '#f5f5f5', '#e8eaf6', '#c5cae9']
    },
    effects: {
      blur: 1.0,
      glow: 0.8,
      saturation: 0.9,
      brightness: 1.1,
      contrast: 0.9,
      particleCount: 30,
      animationSpeed: 0.7
    },
    particles: {
      types: ['sparkle', 'glow', 'whisper'],
      colors: ['#ffffff', '#f5f5f5', '#e8eaf6'],
      intensity: 0.6,
      interactivity: false
    }
  },
  cosmic: {
    colors: {
      primary: '#673ab7',
      secondary: '#9c27b0',
      accent: '#e91e63',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f2e 25%, #2e1065 50%, #4a148c 100%)',
      surface: 'rgba(103, 58, 183, 0.05)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      border: 'rgba(103, 58, 183, 0.4)',
      glow: 'rgba(103, 58, 183, 0.7)',
      particle: ['#673ab7', '#9c27b0', '#e91e63', '#f06292']
    },
    effects: {
      blur: 0.3,
      glow: 1.8,
      saturation: 1.4,
      brightness: 1.1,
      contrast: 1.2,
      particleCount: 120,
      animationSpeed: 1.5
    },
    particles: {
      types: ['star', 'nebula', 'cosmic'],
      colors: ['#673ab7', '#9c27b0', '#e91e63'],
      intensity: 1.2,
      interactivity: true
    }
  },
  shadow: {
    colors: {
      primary: '#424242',
      secondary: '#616161',
      accent: '#9e9e9e',
      background: 'linear-gradient(135deg, #000000 0%, #121212 50%, #1f1f1f 100%)',
      surface: 'rgba(66, 66, 66, 0.05)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.5)',
      border: 'rgba(255, 255, 255, 0.1)',
      glow: 'rgba(158, 158, 158, 0.4)',
      particle: ['#424242', '#616161', '#9e9e9e', '#bdbdbd']
    },
    effects: {
      blur: 0.2,
      glow: 0.5,
      saturation: 0.7,
      brightness: 0.9,
      contrast: 1.1,
      particleCount: 25,
      animationSpeed: 0.8
    },
    particles: {
      types: ['shadow', 'void', 'whisper'],
      colors: ['#424242', '#616161', '#9e9e9e'],
      intensity: 0.4,
      interactivity: false
    }
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAdvancedTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAdvancedTheme must be used within an AdvancedThemeProvider');
  }
  return context;
};

interface AdvancedThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
  defaultIntensity?: VisualIntensity;
  defaultPerformanceMode?: PerformanceMode;
}

export const AdvancedThemeProvider: React.FC<AdvancedThemeProviderProps> = ({
  children,
  defaultTheme = 'cult',
  defaultIntensity = 'medium',
  defaultPerformanceMode = 'balanced'
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(defaultTheme);
  const [visualIntensity, setVisualIntensity] = useState<VisualIntensity>(defaultIntensity);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(defaultPerformanceMode);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Theme configuration based on current settings
  const themeConfig = useMemo(() => {
    const config = { ...themeConfigs[currentTheme] };
    
    // Adjust effects based on visual intensity
    const intensityMultipliers = {
      minimal: 0.3,
      low: 0.6,
      medium: 1.0,
      high: 1.4,
      ultra: 1.8,
      sentient: 2.5
    };
    
    const multiplier = intensityMultipliers[visualIntensity];
    config.effects.glow *= multiplier;
    config.effects.particleCount = Math.floor(config.effects.particleCount * multiplier);
    config.effects.animationSpeed *= multiplier;
    
    // Adjust based on performance mode
    const performanceAdjustments = {
      potato: { particleCount: 0.2, effects: 0.5 },
      balanced: { particleCount: 0.8, effects: 0.9 },
      performance: { particleCount: 1.0, effects: 1.0 },
      ultra: { particleCount: 1.5, effects: 1.3 },
      godmode: { particleCount: 2.0, effects: 1.6 }
    };
    
    const perf = performanceAdjustments[performanceMode];
    config.effects.particleCount = Math.floor(config.effects.particleCount * perf.particleCount);
    config.effects.glow *= perf.effects;
    
    return config;
  }, [currentTheme, visualIntensity, performanceMode]);

  // Set theme with persistence
  const setTheme = useCallback((theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('nocturne-theme', theme);
  }, []);

  const setIntensity = useCallback((intensity: VisualIntensity) => {
    setVisualIntensity(intensity);
    localStorage.setItem('nocturne-intensity', intensity);
  }, []);

  const setPerfMode = useCallback((mode: PerformanceMode) => {
    setPerformanceMode(mode);
    localStorage.setItem('nocturne-performance', mode);
  }, []);

  // Apply theme to element
  const applyTheme = useCallback((element: HTMLElement) => {
    const config = themeConfig;
    
    // Apply CSS custom properties
    Object.entries(config.colors).forEach(([key, value]) => {
      element.style.setProperty(`--theme-${key}`, value);
    });
    
    Object.entries(config.effects).forEach(([key, value]) => {
      element.style.setProperty(`--effect-${key}`, value.toString());
    });
    
    // Apply theme classes
    element.className = `${element.className} theme-${currentTheme} intensity-${visualIntensity} performance-${performanceMode}`;
  }, [themeConfig, currentTheme, visualIntensity, performanceMode]);

  // Get theme classes for components
  const getThemeClasses = useCallback(() => {
    return `theme-${currentTheme} intensity-${visualIntensity} performance-${performanceMode}${isHighContrast ? ' high-contrast' : ''}${isReducedMotion ? ' reduced-motion' : ''}`;
  }, [currentTheme, visualIntensity, performanceMode, isHighContrast, isReducedMotion]);

  // Media query listeners for accessibility
  useEffect(() => {
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleContrastChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    
    setIsHighContrast(contrastQuery.matches);
    setIsReducedMotion(motionQuery.matches);
    
    contrastQuery.addEventListener('change', handleContrastChange);
    motionQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Load persisted settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('nocturne-theme') as ThemeType;
    const savedIntensity = localStorage.getItem('nocturne-intensity') as VisualIntensity;
    const savedPerformance = localStorage.getItem('nocturne-performance') as PerformanceMode;
    
    if (savedTheme && themeConfigs[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    if (savedIntensity) {
      setVisualIntensity(savedIntensity);
    }
    if (savedPerformance) {
      setPerformanceMode(savedPerformance);
    }
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    applyTheme(root);
    
    // Add theme classes to body
    document.body.className = `${document.body.className} ${getThemeClasses()}`.trim();
    
    return () => {
      // Cleanup theme classes
      const classes = getThemeClasses().split(' ');
      classes.forEach(cls => document.body.classList.remove(cls));
    };
  }, [applyTheme, getThemeClasses]);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    visualIntensity,
    setVisualIntensity: setIntensity,
    performanceMode,
    setPerformanceMode: setPerfMode,
    isHighContrast,
    isReducedMotion,
    themeConfig,
    applyTheme,
    getThemeClasses
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default AdvancedThemeProvider;

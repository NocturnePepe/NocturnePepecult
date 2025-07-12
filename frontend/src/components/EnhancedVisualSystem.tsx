import React, { useEffect, useState, useCallback } from 'react';
import './GamingTierFX.css';

interface EnhancedVisualSystemProps {
  theme?: 'cult' | 'cyber' | 'ember';
  performanceMode?: 'high' | 'balanced' | 'low';
  children: React.ReactNode;
}

const EnhancedVisualSystem: React.FC<EnhancedVisualSystemProps> = ({ 
  theme = 'cult', 
  performanceMode = 'balanced',
  children 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  // Performance monitoring for 60fps target
  const [frameRate, setFrameRate] = useState(60);
  const [lastFrameTime, setLastFrameTime] = useState(performance.now());

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setShouldReduceMotion(e.matches);
    mediaQuery.addListener(handler);
    
    return () => mediaQuery.removeListener(handler);
  }, []);

  // Performance monitoring system
  const measureFrameRate = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    const currentFPS = 1000 / deltaTime;
    
    setFrameRate(Math.round(currentFPS));
    setLastFrameTime(currentTime);
    
    // Auto-adjust performance mode if FPS drops below 45
    if (currentFPS < 45 && performanceMode === 'high') {
      console.warn('Frame rate below 45fps, consider reducing visual effects');
    }
  }, [lastFrameTime, performanceMode]);

  // Monitor performance every 2 seconds
  useEffect(() => {
    const interval = setInterval(measureFrameRate, 2000);
    return () => clearInterval(interval);
  }, [measureFrameRate]);

  // Theme application system
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme-specific CSS variables
    const themeVars = {
      cult: {
        '--theme-primary': '#ff1493',
        '--theme-secondary': '#9d4edd',
        '--theme-accent': '#6a0dad',
        '--particle-opacity': '0.7',
        '--fog-intensity': '0.4'
      },
      cyber: {
        '--theme-primary': '#00ffff',
        '--theme-secondary': '#ff00ff',
        '--theme-accent': '#00ff7f',
        '--particle-opacity': '0.5',
        '--fog-intensity': '0.2'
      },
      ember: {
        '--theme-primary': '#ff8c00',
        '--theme-secondary': '#ff4500',
        '--theme-accent': '#ffd700',
        '--particle-opacity': '0.6',
        '--fog-intensity': '0.3'
      }
    };

    const vars = themeVars[theme];
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [theme]);

  // Performance-based rendering decisions
  const shouldRenderParticles = performanceMode !== 'low' && !shouldReduceMotion;
  const shouldRenderFog = performanceMode === 'high' && !shouldReduceMotion;
  const shouldRenderAdvancedEffects = performanceMode === 'high' && frameRate > 50;

  // Initialize visual system
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      
      // Add performance class to body
      document.body.classList.add('performance-optimized');
      
      // Preload critical animations
      const preloadElements = document.querySelectorAll('.preload-animations');
      preloadElements.forEach(el => el.classList.add('loaded'));
    }, 500);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('performance-optimized');
    };
  }, []);

  return (
    <div className={`enhanced-visual-system theme-${theme} ${isLoaded ? 'loaded' : 'loading'}`}>
      {/* Particle System Layer */}
      {shouldRenderParticles && (
        <div className="particle-container">
          <div className="particles gpu-accelerated preload-animations" />
        </div>
      )}

      {/* Fog Overlay Layer */}
      {shouldRenderFog && (
        <div className="fog-overlay gpu-accelerated preload-animations" />
      )}

      {/* Main Content */}
      <div className="main-content-wrapper">
        {children}
      </div>

      {/* Performance Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-debug" style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999
        }}>
          <div>FPS: {frameRate}</div>
          <div>Mode: {performanceMode}</div>
          <div>Theme: {theme}</div>
          <div>Particles: {shouldRenderParticles ? 'ON' : 'OFF'}</div>
          <div>Fog: {shouldRenderFog ? 'ON' : 'OFF'}</div>
        </div>
      )}
    </div>
  );
};

// Performance validation function for phase parity checks
export const validateNocturnePerformance = () => {
  const results = {
    gpuAcceleration: false,
    animationSupport: false,
    backdropFilter: false,
    performanceAPI: false,
    reducedMotionSupport: false
  };

  // Check GPU acceleration support
  const testElement = document.createElement('div');
  testElement.style.transform = 'translateZ(0)';
  testElement.style.willChange = 'transform';
  results.gpuAcceleration = testElement.style.transform === 'translateZ(0)';

  // Check animation support
  results.animationSupport = 'animation' in testElement.style;

  // Check backdrop-filter support
  results.backdropFilter = 'backdropFilter' in testElement.style || 'webkitBackdropFilter' in testElement.style;

  // Check Performance API
  results.performanceAPI = 'performance' in window && 'now' in performance;

  // Check reduced motion support
  results.reducedMotionSupport = 'matchMedia' in window && window.matchMedia('(prefers-reduced-motion)').media !== 'not all';

  const score = Object.values(results).filter(Boolean).length;
  const maxScore = Object.keys(results).length;
  const percentage = Math.round((score / maxScore) * 100);

  return {
    ...results,
    score,
    maxScore,
    percentage,
    isOptimal: percentage >= 80
  };
};

// Auto-detect optimal performance mode
export const detectOptimalPerformanceMode = (): 'high' | 'balanced' | 'low' => {
  const validation = validateNocturnePerformance();
  
  if (validation.percentage >= 90) return 'high';
  if (validation.percentage >= 70) return 'balanced';
  return 'low';
};

export default EnhancedVisualSystem;

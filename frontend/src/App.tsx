import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MockWalletProvider } from './contexts/MockWalletContext';
import XPRankBar from './components/XPRankBar';
import FloatingButtons from './components/FloatingButtons';
import EnhancedVisualSystem from './components/EnhancedVisualSystem';
import './App.css';
import './PWA.css';
import './GamingTierFX.css';
import './MobilePhase7.css';
import ParticleSystem from './components/ParticleSystem';
import { AdvancedThemeProvider } from './contexts/AdvancedThemeContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { SocialProvider } from './contexts/SocialContext';
import { AdvancedTradingProvider } from './contexts/AdvancedTradingContext';
import EnhancedAchievementSystem from './components/EnhancedAchievementSystem';
import EnhancedSocialHub from './components/EnhancedSocialHub';
import { ProfessionalTradingDashboard } from './components/ProfessionalTradingDashboard';

// Phase 7: Advanced Mobile Experience Components
import MobileNavigation from './components/mobile/MobileNavigation';
import MobileTradingInterface from './components/mobile/MobileTradingInterface';
import useMobilePerformance from './hooks/useMobilePerformance';
import useMobileAnalytics from './hooks/useMobileAnalytics';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const SwapPage = lazy(() => import('./pages/SwapPage'));
const PoolsPage = lazy(() => import('./pages/PoolsPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const SocialPage = lazy(() => import('./pages/SocialPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Lazy load heavy components
const AdvancedTrading = lazy(() => import('./components/AdvancedTrading'));
const GovernanceDAO = lazy(() => import('./components/GovernanceDAO'));

// Declare global integrations
declare global {
  interface Window {
    nocturneSwapIntegration: any;
    nocturneAnalytics: any;
    NocturneVisuals: any;
    pwaManager: any;
  }
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-fallback">
    <div className="loading-spinner" />
    <div className="loading-text">Loading NocturneSwap...</div>
  </div>
);

const IntegrationStatus = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      if (window.nocturneSwapIntegration) {
        const health = await window.nocturneSwapIntegration.healthCheck();
        setHealthStatus(health);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!healthStatus) return null;

  return (
    <div className="integration-status">
      <button 
        className="status-toggle"
        onClick={() => setShowStatus(!showStatus)}
      >
        <span className={`status-indicator ${Object.values(healthStatus).every(Boolean) ? 'healthy' : 'warning'}`}>
          ●
        </span>
        System Status
      </button>
      
      {showStatus && (
        <div className="status-dropdown">
          <div className="status-item">
            <span>Jupiter API</span>
            <span className={healthStatus.jupiter ? 'healthy' : 'error'}>
              {healthStatus.jupiter ? '✅' : '❌'}
            </span>
          </div>
          <div className="status-item">
            <span>Analytics</span>
            <span className={healthStatus.analytics ? 'healthy' : 'error'}>
              {healthStatus.analytics ? '✅' : '❌'}
            </span>
          </div>
          <div className="status-item">
            <span>RPC</span>
            <span className={healthStatus.rpc ? 'healthy' : 'error'}>
              {healthStatus.rpc ? '✅' : '❌'}
            </span>
          </div>
          <div className="status-item">
            <span>Price Feeds</span>
            <span className={healthStatus.priceFeeds ? 'healthy' : 'error'}>
              {healthStatus.priceFeeds ? '✅' : '❌'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const Navigation = () => {
  const location = useLocation();
  
  // 6-tab navigation structure as specified in Phase 1 requirements
  const navItems = [
    { path: '/swap', label: 'Swap', icon: '🔄' },
    { path: '/pools', label: 'Pools', icon: '🏊' },
    { path: '/portfolio', label: 'Portfolio', icon: '📊' },
    { path: '/social', label: 'Social', icon: '👥' },
    { path: '/dao', label: 'DAO', icon: '🏛️' },
    { path: '/admin', label: 'Admin', icon: '⚙️' }
  ];

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <div className="brand-icon">🌙</div>
        <span className="brand-text">NocturneSwap</span>
      </div>
      
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="nav-extras">
        <IntegrationStatus />
      </div>
    </nav>
  );
};

// Phase 7: Mobile-Responsive App Container
const ResponsiveAppContainer = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileTrading, setShowMobileTrading] = useState(false);
  
  // Initialize mobile performance monitoring
  const { metrics, isLowPerformanceMode } = useMobilePerformance({
    enableFPSMonitoring: true,
    enableMemoryMonitoring: true,
    enableNetworkMonitoring: true,
    enableBatteryMonitoring: true,
    fpsThreshold: 30,
    memoryThreshold: 70
  });

  // Initialize mobile analytics
  const { trackPageView, trackPerformance } = useMobileAnalytics({
    enableTouchTracking: true,
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    sampleRate: 1.0
  });

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isMobileScreen = width < 768;
      const isTabletScreen = width >= 768 && width < 1024;
      
      setIsMobile(isMobileUA || isMobileScreen);
      setIsTablet(isTabletScreen && !isMobileUA);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Track performance metrics
  useEffect(() => {
    trackPerformance(metrics.fps, metrics.memoryUsage);
  }, [metrics.fps, metrics.memoryUsage, trackPerformance]);

  // Track page navigation
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  // Apply mobile optimizations
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-device');
      document.documentElement.style.setProperty('--mobile-safe-area-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--mobile-safe-area-bottom', 'env(safe-area-inset-bottom)');
    } else {
      document.body.classList.remove('mobile-device');
    }

    if (isLowPerformanceMode) {
      document.body.classList.add('low-performance-mode');
    } else {
      document.body.classList.remove('low-performance-mode');
    }
  }, [isMobile, isLowPerformanceMode]);

  return (
    <div className={`app-container ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      {/* Mobile Navigation (Phase 7) */}
      {isMobile && (
        <MobileNavigation 
          onTradingClick={() => setShowMobileTrading(true)}
          performanceMode={isLowPerformanceMode ? 'low' : 'balanced'}
        />
      )}

      {/* Desktop/Tablet Navigation */}
      {!isMobile && <Navigation />}

      {/* Main Content */}
      <div className="app-content">
        {children}
      </div>

      {/* Mobile Trading Interface (Phase 7) */}
      {isMobile && showMobileTrading && (
        <MobileTradingInterface 
          isOpen={showMobileTrading}
          onClose={() => setShowMobileTrading(false)}
          performanceMode={isLowPerformanceMode ? 'low' : 'balanced'}
        />
      )}

      {/* Performance indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-debug" style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 10000,
          fontFamily: 'monospace'
        }}>
          FPS: {metrics.fps} | Memory: {metrics.memoryUsage}% | 
          Device: {metrics.deviceType} | 
          Network: {metrics.networkSpeed} |
          {isLowPerformanceMode && ' LOW-PERF'}
        </div>
      )}
    </div>
  );
};
function App() {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSocialHub, setShowSocialHub] = useState(false);
  
  useEffect(() => {
    // Initialize PWA manager
    if (typeof window !== 'undefined') {
      import('./PWA.js').then((PWAModule) => {
        if (PWAModule.default) {
          window.pwaManager = new (PWAModule.default as any)();
        }
      }).catch(err => console.warn('PWA module not found:', err));
    }

    // Analytics integration
    if (window.nocturneAnalytics) {
      window.nocturneAnalytics.track('app_loaded');
    }

    // Initialize visual effects
    if (window.NocturneVisuals) {
      new window.NocturneVisuals();
    }

    // Phase 7: Register service worker for mobile PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Phase 7: SW registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('Phase 7: SW registration failed:', error);
        });
    }
  }, []);

  return (
    <AdvancedThemeProvider defaultTheme="cult" defaultIntensity="medium" defaultPerformanceMode="balanced">
      <MockWalletProvider>
        <GamificationProvider>
          <SocialProvider>
            <AdvancedTradingProvider>
              <Router>
                <ResponsiveAppContainer>
                  <EnhancedVisualSystem theme="cult" performanceMode="balanced">
                    <div className="App gpu-accelerated">
                      {/* Gaming-Tier Particle System Background */}
                      <ParticleSystem 
                        theme="cult" 
                        intensity="medium" 
                        interactive={true} 
                        performanceMode="auto" 
                      />
                      
                      {/* XP & Rank Bar in header - Hidden on mobile */}
                      <header className="app-header desktop-only">
                        <XPRankBar />
                        <div className="header-buttons">
                          <button 
                            className="pro-trading-btn"
                            onClick={() => window.location.href = '/pro-trading'}
                            style={{
                              position: 'fixed',
                              top: '20px',
                              right: '350px',
                              background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              color: 'white',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              zIndex: 1000,
                              boxShadow: '0 4px 16px rgba(255, 107, 53, 0.4)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            💼 Pro Trading
                          </button>
                          <button 
                            className="social-hub-btn"
                            onClick={() => setShowSocialHub(true)}
                            style={{
                              position: 'fixed',
                              top: '20px',
                              right: '180px',
                              background: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              color: 'white',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              zIndex: 1000,
                              boxShadow: '0 4px 16px rgba(79, 195, 247, 0.4)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🌟 Social Hub
                          </button>
                          <button 
                            className="achievements-btn"
                            onClick={() => setShowAchievements(true)}
                            style={{
                              position: 'fixed',
                              top: '20px',
                              right: '20px',
                              background: 'linear-gradient(135deg, #9c88ff, #b39ddb)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              color: 'white',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              zIndex: 1000,
                              boxShadow: '0 4px 16px rgba(156, 136, 255, 0.4)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🏆 Achievements
                          </button>
                        </div>
                      </header>

                      {/* Main Content with Suspense */}
                      <main className="main-content">
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                            {/* Core Pages */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/swap" element={<SwapPage />} />
                            <Route path="/pools" element={<PoolsPage />} />
                            <Route path="/portfolio" element={<PortfolioPage />} />
                            <Route path="/social" element={<SocialPage />} />
                            <Route path="/dao" element={<GovernanceDAO />} />
                            <Route path="/admin" element={<AdminPage />} />
                            
                            {/* Phase 5: Professional Trading Dashboard */}
                            <Route path="/pro-trading" element={<ProfessionalTradingDashboard />} />
                            
                            {/* Legacy routes for backward compatibility */}
                            <Route path="/trading" element={<AdvancedTrading />} />
                            
                            {/* Fallback route */}
                            <Route path="*" element={<HomePage />} />
                          </Routes>
                        </Suspense>
                      </main>

                      {/* Floating Action Buttons - Hidden on mobile */}
                      <FloatingButtons position="left" className="desktop-only" />

                      {/* Enhanced Social Hub */}
                      <EnhancedSocialHub
                        isOpen={showSocialHub}
                        onClose={() => setShowSocialHub(false)}
                      />

                      {/* Enhanced Achievement System */}
                      <EnhancedAchievementSystem
                        isOpen={showAchievements}
                        onClose={() => setShowAchievements(false)}
                      />
                    </div>
                  </EnhancedVisualSystem>
                </ResponsiveAppContainer>
              </Router>
            </AdvancedTradingProvider>
          </SocialProvider>
        </GamificationProvider>
      </MockWalletProvider>
    </AdvancedThemeProvider>
  );
}

export default App;

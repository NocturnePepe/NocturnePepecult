import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MockWalletProvider } from './contexts/MockWalletContext';
import XPRankBar from './components/XPRankBar';
import FloatingButtons from './components/FloatingButtons';
import EnhancedVisualSystem from './components/EnhancedVisualSystem';
import './App.css';
import './PWA.css';
import './GamingTierFX.css';
import ParticleSystem from './components/ParticleSystem';
import { AdvancedThemeProvider } from './contexts/AdvancedThemeContext';
import { GamificationProvider } from './contexts/GamificationContext';
import EnhancedAchievementSystem from './components/EnhancedAchievementSystem';

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
function App() {
  const [showAchievements, setShowAchievements] = useState(false);
  
  useEffect(() => {
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
  }, []);

  return (
    <AdvancedThemeProvider defaultTheme="cult" defaultIntensity="medium" defaultPerformanceMode="balanced">
      <MockWalletProvider>
        <GamificationProvider>
          <Router>
            <EnhancedVisualSystem theme="cult" performanceMode="balanced">
              <div className="App gpu-accelerated">
                {/* Gaming-Tier Particle System Background */}
                <ParticleSystem 
                  theme="cult" 
                  intensity="medium" 
                  interactive={true} 
                  performanceMode="auto" 
                />
                
                {/* XP & Rank Bar in header */}
                <header className="app-header">
                  <XPRankBar />
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
                </header>

                {/* Main Navigation */}
                <Navigation />
                
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
                      
                      {/* Legacy routes for backward compatibility */}
                      <Route path="/trading" element={<AdvancedTrading />} />
                      
                      {/* Fallback route */}
                      <Route path="*" element={<HomePage />} />
                    </Routes>
                  </Suspense>
                </main>

                {/* Floating Action Buttons */}
                <FloatingButtons position="left" />

                {/* Enhanced Achievement System */}
                <EnhancedAchievementSystem
                  isOpen={showAchievements}
                  onClose={() => setShowAchievements(false)}
                />
              </div>
            </EnhancedVisualSystem>
          </Router>
        </GamificationProvider>
      </MockWalletProvider>
    </AdvancedThemeProvider>
  );
}

export default App;

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MockWalletProvider } from './contexts/MockWalletContext';
import XPRankBar from './components/XPRankBar';
import FloatingButtons from './components/FloatingButtons';
import './App.css';
import './PWA.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const SwapPage = lazy(() => import('./pages/SwapPage'));
const PoolsPage = lazy(() => import('./pages/PoolsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ReferralPage = lazy(() => import('./pages/ReferralPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

// Lazy load heavy components
const AdvancedTrading = lazy(() => import('./components/AdvancedTrading'));
const GovernanceDAO = lazy(() => import('./components/GovernanceDAO'));

// Declare global integrations
declare global {
  interface Window {
    nocturneSwapIntegration: any;
    nocturneAnalytics: any;
    NocturneVisuals: any;
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
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/swap', label: 'Swap', icon: '🔄' },
    { path: '/pools', label: 'Pools', icon: '🏊' },
    { path: '/trading', label: 'Trading', icon: '📈' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/referral', label: 'Referral', icon: '👥' },
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
  useEffect(() => {
    // Initialize PWA manager
    if (typeof window !== 'undefined') {
      import('./PWA.js').then((PWAModule) => {
        window.pwaManager = new PWAModule.default();
      });
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
    <MockWalletProvider>
      <Router>
        <div className="App">
          {/* XP & Rank Bar in header */}
          <header className="app-header">
            <XPRankBar />
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
                <Route path="/trading" element={<AdvancedTrading />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/referral" element={<ReferralPage />} />
                <Route path="/dao" element={<GovernanceDAO />} />
                <Route path="/admin" element={<AdminPage />} />
                
                {/* Fallback route */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </main>

          {/* Floating Action Buttons */}
          <FloatingButtons position="left" />
        </div>
      </Router>
    </MockWalletProvider>
  );
}

export default App;

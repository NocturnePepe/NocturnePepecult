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
    { path: '/trading', label: 'Trading', icon: '⚔️' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/referral', label: 'Referral', icon: '🔮' },
    { path: '/governance', label: 'DAO', icon: '🏛️' },
    { path: '/admin', label: 'Admin', icon: '⚙️' },
    { path: '/admin/roles', label: 'Roles', icon: '👑' },
    { path: '/admin/tokens', label: 'Token Utility', icon: '⚡' },
    { path: '/admin/access', label: 'Access Control', icon: '🔐' }
  ];

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🌙</span>
            <span className="brand-text holo-text">NocturneSwap</span>
          </Link>
        </div>
        
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="nav-actions">
          <IntegrationStatus />
          <button className="connect-wallet-btn glow-btn">
            Connect Wallet
          </button>
        </div>
      </div>
    </nav>
  );
};

function App() {
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showSeasonalThemes, setShowSeasonalThemes] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedChain, setSelectedChain] = useState('solana');
  
  useEffect(() => {
    // Initialize advanced visuals
    if (window.NocturneVisuals) {
      new window.NocturneVisuals();
    }

    // Initialize PWA
    import('./PWA.js').then(() => {
      console.log('🌙 PWA Manager initialized');
    });

    // Load saved chain
    const savedChain = localStorage.getItem('nocturne_selected_chain');
    if (savedChain) {
      setSelectedChain(savedChain);
    }

    // Check for achievements unlock
    const handleAchievement = () => {
      // Auto-show achievement modal when unlocked
      setShowAchievements(true);
    };

    window.addEventListener('achievement_unlocked', handleAchievement);
    return () => window.removeEventListener('achievement_unlocked', handleAchievement);
  }, []);

  const handleChainChange = (chainId: string) => {
    setSelectedChain(chainId);
    
    // Emit chain change event for other components
    window.dispatchEvent(new CustomEvent('nocturne_chain_changed', {
      detail: { chainId }
    }));
  };

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/pools" element={<PoolsPage />} />
            <Route path="/trading" element={<AdvancedTrading />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/referral" element={<ReferralPage />} />
            <Route path="/governance" element={<GovernanceDAO />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/roles" element={<RoleManager />} />
            <Route path="/admin/tokens" element={<TokenUtilityManager />} />
            <Route path="/admin/access" element={<AdminAccessControl />} />
          </Routes>
        </main>
        
        {/* Chain Selector */}
        <div className="chain-selector-container">
          <ChainSelector 
            selectedChain={selectedChain}
            onChainChange={handleChainChange}
          />
        </div>
        
        {/* Security Modal */}
        <SecurityModal 
          isOpen={showSecurityModal} 
          onClose={() => setShowSecurityModal(false)} 
        />
        
        {/* Seasonal Themes Modal */}
        <SeasonalThemes 
          isOpen={showSeasonalThemes}
          onClose={() => setShowSeasonalThemes(false)}
        />
        
        {/* Achievement System Modal */}
        {showAchievements && (
          <div className="modal-overlay">
            <div className="modal-container achievement-modal">
              <div className="modal-header">
                <h2>🏆 Achievement System</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowAchievements(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-content">
                <AchievementSystem />
              </div>
            </div>
          </div>
        )}
        
        {/* Floating Action Buttons */}
        <div className="floating-buttons">
          {/* Security Button */}
          <button 
            className="security-btn floating-btn"
            onClick={() => setShowSecurityModal(true)}
            title="Security Center"
          >
            🛡️
          </button>
          
          {/* Themes Button */}
          <button 
            className="themes-btn floating-btn"
            onClick={() => setShowSeasonalThemes(true)}
            title="Seasonal Themes"
          >
            🎨
          </button>
          
          {/* Achievements Button */}
          <button 
            className="achievements-btn floating-btn"
            onClick={() => setShowAchievements(true)}
            title="Achievements & Progress"
          >
            🏆
          </button>
        </div>
      </div>
    </Router>
  );
}

export default App;

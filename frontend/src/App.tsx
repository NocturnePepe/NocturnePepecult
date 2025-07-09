import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SwapPage from './pages/SwapPage';
import PoolsPage from './pages/PoolsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import ReferralPage from './pages/ReferralPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdvancedTrading from './components/AdvancedTrading';
import GovernanceDAO from './components/GovernanceDAO';
import SecurityModal from './components/SecurityModal';
import RoleManager from './components/RoleManager';
import TokenUtilityManager from './components/TokenUtilityManager';
import AdminAccessControl from './components/AdminAccessControl';
import './App.css';

// Declare global integrations
declare global {
  interface Window {
    nocturneSwapIntegration: any;
    nocturneAnalytics: any;
    NocturneVisuals: any;
  }
}

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
  
  useEffect(() => {
    // Initialize advanced visuals
    if (window.NocturneVisuals) {
      new window.NocturneVisuals();
    }
  }, []);

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
        
        {/* Security Modal */}
        <SecurityModal 
          isOpen={showSecurityModal} 
          onClose={() => setShowSecurityModal(false)} 
        />
        
        {/* Security Button */}
        <button 
          className="security-btn floating-btn"
          onClick={() => setShowSecurityModal(true)}
          title="Security Center"
        >
          🛡️
        </button>
      </div>
    </Router>
  );
}

export default App;

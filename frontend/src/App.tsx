import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SwapPage from './pages/SwapPage';
import PoolsPage from './pages/PoolsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReferralPage from './pages/ReferralPage';
import TokenUtilityManager from './components/TokenUtilityManager';
import AdminAccessControl from './components/AdminAccessControl';
import AdminRoleManager from './components/AdminRoleManager';
import ChainSelector from './components/ChainSelector';
import SeasonalThemes from './components/SeasonalThemes';
import './App.css';

// Declare global integrations
declare global {
  interface Window {
    nocturneSwapIntegration: any;
    nocturneAnalytics: any;
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
  const [walletConnected, setWalletConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showTokenUtility, setShowTokenUtility] = useState(false);
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showSeasonalThemes, setShowSeasonalThemes] = useState(false);
  
  // Mock wallet connection state
  const [connectedWallet, setConnectedWallet] = useState('');
  
  // Treasury wallet for admin access (from environment)
  const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || '9sJgdsierNDXhUL3xahz4nJFy9zt2hEAHk6S9giCPtNb';
  
  useEffect(() => {
    // Check if connected wallet is treasury
    if (connectedWallet === TREASURY_WALLET) {
      setIsAdmin(true);
    }
    
    // Check localStorage for admin status
    const savedAdminStatus = localStorage.getItem('nocturne_admin_access');
    if (savedAdminStatus === 'true') {
      setIsAdmin(true);
    }
  }, [connectedWallet]);
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠', access: 'public' },
    { path: '/swap', label: 'Swap', icon: '🔄', access: 'public' },
    { path: '/pools', label: 'Pools', icon: '🏊', access: 'public' },
    { path: '/analytics', label: 'Analytics', icon: '📊', access: 'wallet' },
    { path: '/referrals', label: 'Referrals', icon: '🚀', access: 'wallet' },
    { path: '/admin', label: 'Admin', icon: '⚙️', access: 'admin' }
  ];
  
  // Filter nav items based on access level
  const getVisibleNavItems = () => {
    return navItems.filter(item => {
      if (item.access === 'public') return true;
      if (item.access === 'wallet') return walletConnected;
      if (item.access === 'admin') return isAdmin;
      return false;
    });
  };
  
  const handleConnectWallet = () => {
    // Mock wallet connection
    if (!walletConnected) {
      const mockWallet = Math.random() > 0.5 ? TREASURY_WALLET : 'SomeRandomWallet123';
      setConnectedWallet(mockWallet);
      setWalletConnected(true);
      
      if (mockWallet === TREASURY_WALLET) {
        setIsAdmin(true);
        localStorage.setItem('nocturne_admin_access', 'true');
      }
    } else {
      setWalletConnected(false);
      setIsAdmin(false);
      setConnectedWallet('');
      localStorage.removeItem('nocturne_admin_access');
    }
  };
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/swap', label: 'Swap', icon: '🔄' },
    { path: '/pools', label: 'Pools', icon: '🏊' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/referrals', label: 'Referrals', icon: '🚀' },
    { path: '/admin', label: 'Admin', icon: '⚙️' }
  ];

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🌙</span>
            <span className="brand-text">NocturneSwap</span>
          </Link>
        </div>
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🌙</span>
            <span className="brand-text">NocturneSwap</span>
          </Link>
        </div>
        
        <div className="nav-links">
          {getVisibleNavItems().map((item) => (
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
          <button 
            className="themes-btn"
            onClick={() => setShowSeasonalThemes(true)}
            title="Seasonal Themes"
          >
            🎨
          </button>
          
          {walletConnected && (
            <>
              <button 
                className="utility-btn"
                onClick={() => setShowTokenUtility(true)}
                title="Token Utility"
              >
                💎
              </button>
              <button 
                className="multichain-btn"
                onClick={() => setShowChainSelector(true)}
                title="Multichain"
              >
                🌐
              </button>
            </>
          )}
          
          {isAdmin && (
            <>
              <button 
                className="admin-btn"
                onClick={() => setShowAdminModal(true)}
                title="Admin Controls"
              >
                👑
              </button>
              <button 
                className="role-manager-btn"
                onClick={() => setShowRoleManager(true)}
                title="Role Manager"
              >
                🛡️
              </button>
            </>
          )}
          
          <IntegrationStatus />
          <button 
            className={`connect-wallet-btn ${walletConnected ? 'connected' : ''}`}
            onClick={handleConnectWallet}
          >
            {walletConnected ? 
              `${connectedWallet.slice(0,4)}...${connectedWallet.slice(-4)}` : 
              'Connect Wallet'
            }
          </button>
        </div>
      </div>
      
      {/* Modals */}
      {showSeasonalThemes && (
        <SeasonalThemes 
          isVisible={showSeasonalThemes}
          onClose={() => setShowSeasonalThemes(false)}
        />
      )}
      
      {showTokenUtility && (
        <TokenUtilityManager 
          isVisible={showTokenUtility}
          onClose={() => setShowTokenUtility(false)}
        />
      )}
      
      {showChainSelector && (
        <ChainSelector 
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
        />
      )}
      
      {showRoleManager && (
        <AdminRoleManager 
          isVisible={showRoleManager}
          onClose={() => setShowRoleManager(false)}
        />
      )}
      
      {showAdminModal && (
        <AdminAccessControl 
          isVisible={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/pools" element={<PoolsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/referrals" element={<ReferralPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

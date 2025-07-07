import React from 'react';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🌙 NocturneSwap</h1>
          <p className="hero-subtitle">Cult-powered DEX for Solana</p>
          <p className="hero-description">
            The most advanced decentralized exchange for the NocturnePepe ecosystem.
            Trade tokens, provide liquidity, and join the cult.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">Launch App</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="section-header">
          <h2>🔮 Features</h2>
          <p>Everything you need for decentralized trading</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Solana-native swaps with sub-second confirmation times</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Ultra Secure</h3>
            <p>Audited smart contracts with battle-tested security</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💀</div>
            <h3>Cult-Powered</h3>
            <p>Built by and for the NocturnePepe community</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Real-time price feeds and comprehensive charts</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏊</div>
            <h3>Liquidity Pools</h3>
            <p>Earn fees by providing liquidity to trading pairs</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏛️</div>
            <h3>DAO Governance</h3>
            <p>Community-driven token listings and protocol upgrades</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="section-header">
          <h2>📈 Protocol Stats</h2>
          <p>Real-time metrics from the NocturneSwap protocol</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">$2.4M</div>
            <div className="stat-label">Total Volume</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">$850K</div>
            <div className="stat-label">Total Liquidity</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">1,234</div>
            <div className="stat-label">Active Users</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">24</div>
            <div className="stat-label">Trading Pairs</div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Join the Cult?</h2>
          <p>Start trading on the most advanced Solana DEX today</p>
          <div className="cta-actions">
            <button className="primary-btn large">Start Trading</button>
            <button className="secondary-btn large">View Pools</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

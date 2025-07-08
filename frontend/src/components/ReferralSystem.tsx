// ReferralSystem.tsx - Complete cult-themed referral program
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { cultSounds } from '../SoundEffects.js';
import './ReferralSystem.css';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  currentTier: string;
  nextTierRequirement: number;
  bonusRate: number;
  lifetimeVolume: number;
}

interface ReferralTier {
  name: string;
  requirement: number;
  bonusRate: number;
  icon: string;
  benefits: string[];
  color: string;
}

interface Referral {
  wallet: string;
  joinDate: Date;
  totalVolume: number;
  lastActive: Date;
  status: 'active' | 'inactive';
  earnings: number;
}

const REFERRAL_TIERS: ReferralTier[] = [
  {
    name: 'Initiate',
    requirement: 0,
    bonusRate: 0.1,
    icon: '🌙',
    benefits: ['0.1% referral bonus', 'Basic tracking'],
    color: '#8888aa'
  },
  {
    name: 'Acolyte', 
    requirement: 5,
    bonusRate: 0.15,
    icon: '⚡',
    benefits: ['0.15% referral bonus', 'Priority support', 'Custom link'],
    color: '#4a9eff'
  },
  {
    name: 'Zealot',
    requirement: 15,
    bonusRate: 0.2,
    icon: '🔥',
    benefits: ['0.2% referral bonus', 'Exclusive events', 'NFT rewards'],
    color: '#a335ee'
  },
  {
    name: 'High Priest',
    requirement: 50,
    bonusRate: 0.25,
    icon: '👑',
    benefits: ['0.25% referral bonus', 'Council voting', 'Revenue share'],
    color: '#ff8000'
  },
  {
    name: 'Void Master',
    requirement: 100,
    bonusRate: 0.3,
    icon: '🌟',
    benefits: ['0.3% referral bonus', 'Platform governance', 'Lifetime rewards'],
    color: '#e6cc80'
  }
];

interface ReferralSystemProps {
  isVisible: boolean;
  onClose: () => void;
}

const ReferralSystem = ({ isVisible, onClose }: ReferralSystemProps) => {
  const { publicKey, connected } = useWallet();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    currentTier: 'Initiate',
    nextTierRequirement: 5,
    bonusRate: 0.1,
    lifetimeVolume: 0
  });
  
  const [referralCode, setReferralCode] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [referralList, setReferralList] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load referral data on mount
  useEffect(() => {
    if (connected && publicKey) {
      loadReferralData();
      generateReferralCode();
    }
  }, [connected, publicKey]);

  const loadReferralData = () => {
    const savedData = localStorage.getItem(`referral_data_${publicKey?.toString()}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setReferralStats(data.stats);
      setReferralList(data.referrals || []);
      setCustomCode(data.customCode || '');
    } else {
      // Mock data for demo
      const mockStats = {
        totalReferrals: 12,
        activeReferrals: 8,
        totalEarnings: 247.5,
        currentTier: 'Acolyte',
        nextTierRequirement: 15,
        bonusRate: 0.15,
        lifetimeVolume: 125000
      };
      setReferralStats(mockStats);
      
      const mockReferrals: Referral[] = [
        {
          wallet: '7xKXt...9Qm3',
          joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          totalVolume: 25000,
          lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'active',
          earnings: 37.5
        },
        {
          wallet: 'B8kGt...7Wx2',
          joinDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          totalVolume: 18500,
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'active',
          earnings: 27.8
        },
        {
          wallet: 'C2mHt...5Kl1',
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          totalVolume: 45000,
          lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: 'inactive',
          earnings: 67.5
        }
      ];
      setReferralList(mockReferrals);
    }
  };

  const generateReferralCode = () => {
    if (publicKey) {
      const baseCode = publicKey.toString().slice(0, 8).toUpperCase();
      setReferralCode(customCode || `CULT${baseCode}`);
    }
  };

  const handleCustomCodeUpdate = useCallback(async () => {
    if (!customCode.trim() || customCode.length < 4) return;
    
    const newCode = `CULT${customCode.toUpperCase()}`;
    setReferralCode(newCode);
    
    // Save custom code
    const savedData = localStorage.getItem(`referral_data_${publicKey?.toString()}`) || '{}';
    const data = JSON.parse(savedData);
    data.customCode = customCode;
    localStorage.setItem(`referral_data_${publicKey?.toString()}`, JSON.stringify(data));
    
    await cultSounds.playConnectSound();
  }, [customCode, publicKey]);

  const copyReferralLink = useCallback(async () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      await cultSounds.playConnectSound();
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [referralCode]);

  const shareToSocial = useCallback(async (platform: string) => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    const message = `🌙 Join me in the NocturnePepe cult! Trade with 0 fees and earn rewards. Use my referral code: ${referralCode}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
        break;
      case 'discord':
        copyReferralLink();
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    await cultSounds.playHoverSound();
  }, [referralCode, copyReferralLink]);

  const getCurrentTier = () => {
    return REFERRAL_TIERS.find(tier => tier.name === referralStats.currentTier) || REFERRAL_TIERS[0];
  };

  const getNextTier = () => {
    const currentIndex = REFERRAL_TIERS.findIndex(tier => tier.name === referralStats.currentTier);
    return REFERRAL_TIERS[currentIndex + 1];
  };

  const getTierProgress = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    
    const current = referralStats.totalReferrals;
    const required = nextTier.requirement;
    const previousRequired = getCurrentTier().requirement;
    
    return ((current - previousRequired) / (required - previousRequired)) * 100;
  };

  if (!isVisible) return null;

  return (
    <div className="referral-modal-overlay">
      <div className="referral-modal">
        <div className="referral-header">
          <h2>🌙 Cult Referral Program</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tier Progress */}
        <div className="tier-progress-section">
          <div className="current-tier">
            <div className="tier-icon" style={{ color: getCurrentTier().color }}>
              {getCurrentTier().icon}
            </div>
            <div className="tier-info">
              <h3>{getCurrentTier().name}</h3>
              <p>{(getCurrentTier().bonusRate * 100).toFixed(1)}% referral bonus</p>
            </div>
          </div>
          
          {getNextTier() && (
            <div className="tier-progress">
              <div className="progress-header">
                <span>{referralStats.totalReferrals} / {getNextTier()!.requirement} referrals</span>
                <span>Next: {getNextTier()!.name}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getTierProgress()}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="referral-tabs">
          <button 
            className={selectedTab === 'dashboard' ? 'active' : ''}
            onClick={() => setSelectedTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={selectedTab === 'share' ? 'active' : ''}
            onClick={() => setSelectedTab('share')}
          >
            🔗 Share
          </button>
          <button 
            className={selectedTab === 'referrals' ? 'active' : ''}
            onClick={() => setSelectedTab('referrals')}
          >
            👥 My Referrals
          </button>
          <button 
            className={selectedTab === 'tiers' ? 'active' : ''}
            onClick={() => setSelectedTab('tiers')}
          >
            🏆 Tiers
          </button>
        </div>

        <div className="referral-content">
          {selectedTab === 'dashboard' && (
            <div className="dashboard-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <span className="stat-value">{referralStats.totalReferrals}</span>
                    <span className="stat-label">Total Referrals</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <span className="stat-value">{referralStats.activeReferrals}</span>
                    <span className="stat-label">Active This Month</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-value">${referralStats.totalEarnings.toFixed(2)}</span>
                    <span className="stat-label">Total Earnings</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <span className="stat-value">${referralStats.lifetimeVolume.toLocaleString()}</span>
                    <span className="stat-label">Referral Volume</span>
                  </div>
                </div>
              </div>

              <div className="earnings-breakdown">
                <h4>💎 Current Benefits</h4>
                <div className="benefits-list">
                  {getCurrentTier().benefits.map((benefit, index) => (
                    <div key={index} className="benefit-item">
                      <span className="benefit-icon">✨</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'share' && (
            <div className="share-tab">
              <div className="referral-code-section">
                <h4>🔗 Your Referral Code</h4>
                <div className="code-display">
                  <input 
                    type="text" 
                    value={referralCode} 
                    readOnly 
                    className="referral-code-input"
                  />
                  <button 
                    className="copy-btn"
                    onClick={copyReferralLink}
                    onMouseEnter={() => cultSounds.playHoverSound()}
                  >
                    {copySuccess ? '✅ Copied!' : '📋 Copy Link'}
                  </button>
                </div>

                <div className="custom-code-section">
                  <h5>Customize Your Code</h5>
                  <div className="custom-input-group">
                    <span className="code-prefix">CULT</span>
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                      placeholder="CUSTOM"
                      maxLength={8}
                      className="custom-code-input"
                    />
                    <button 
                      className="update-btn"
                      onClick={handleCustomCodeUpdate}
                      disabled={!customCode.trim() || customCode.length < 4}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <div className="social-share-section">
                <h4>📱 Share to Social</h4>
                <div className="social-buttons">
                  <button 
                    className="social-btn twitter"
                    onClick={() => shareToSocial('twitter')}
                    onMouseEnter={() => cultSounds.playHoverSound()}
                  >
                    🐦 Twitter
                  </button>
                  <button 
                    className="social-btn telegram"
                    onClick={() => shareToSocial('telegram')}
                    onMouseEnter={() => cultSounds.playHoverSound()}
                  >
                    ✈️ Telegram
                  </button>
                  <button 
                    className="social-btn discord"
                    onClick={() => shareToSocial('discord')}
                    onMouseEnter={() => cultSounds.playHoverSound()}
                  >
                    💬 Discord
                  </button>
                </div>

                <div className="share-preview">
                  <h5>Message Preview:</h5>
                  <div className="preview-box">
                    🌙 Join me in the NocturnePepe cult! Trade with enhanced features and earn rewards. 
                    Use my referral code: <strong>{referralCode}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'referrals' && (
            <div className="referrals-tab">
              <div className="referrals-header">
                <h4>👥 Your Cult Members ({referralList.length})</h4>
                <div className="filter-options">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Active</button>
                  <button className="filter-btn">High Volume</button>
                </div>
              </div>

              <div className="referrals-list">
                {referralList.map((referral, index) => (
                  <div key={index} className={`referral-item ${referral.status}`}>
                    <div className="referral-avatar">
                      <div className="avatar-icon">🌙</div>
                      <div className={`status-indicator ${referral.status}`} />
                    </div>
                    
                    <div className="referral-info">
                      <div className="referral-wallet">{referral.wallet}</div>
                      <div className="referral-meta">
                        Joined {referral.joinDate.toLocaleDateString()} • 
                        Last active {Math.floor((Date.now() - referral.lastActive.getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </div>
                    
                    <div className="referral-stats">
                      <div className="volume">${referral.totalVolume.toLocaleString()}</div>
                      <div className="earnings">+${referral.earnings.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                
                {referralList.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">👻</div>
                    <h5>No referrals yet</h5>
                    <p>Share your referral code to start building your cult!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'tiers' && (
            <div className="tiers-tab">
              <h4>🏆 Referral Tiers</h4>
              <div className="tiers-list">
                {REFERRAL_TIERS.map((tier, index) => (
                  <div 
                    key={index} 
                    className={`tier-card ${tier.name === referralStats.currentTier ? 'current' : ''}`}
                    style={{ borderColor: tier.color }}
                  >
                    <div className="tier-header">
                      <div className="tier-icon" style={{ color: tier.color }}>
                        {tier.icon}
                      </div>
                      <div className="tier-title">
                        <h5>{tier.name}</h5>
                        <p>{tier.requirement} referrals required</p>
                      </div>
                      <div className="tier-bonus" style={{ color: tier.color }}>
                        {(tier.bonusRate * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="tier-benefits">
                      {tier.benefits.map((benefit, bIndex) => (
                        <div key={bIndex} className="tier-benefit">
                          <span className="benefit-check">✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    {tier.name === referralStats.currentTier && (
                      <div className="current-tier-badge">Current Tier</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;
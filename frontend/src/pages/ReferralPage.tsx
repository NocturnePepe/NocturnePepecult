import React, { useState, useEffect } from 'react';
import './ReferralPage.css';

interface ReferralStats {
  totalReferred: number;
  totalEarned: number;
  activeReferrals: number;
  conversionRate: number;
}

interface ReferralTier {
  name: string;
  commission: number;
  requirements: number;
  benefits: string[];
}

const ReferralPage: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({
    totalReferred: 0,
    totalEarned: 0,
    activeReferrals: 0,
    conversionRate: 0
  });
  const [currentTier, setCurrentTier] = useState<number>(0);
  const [showCodeGenerator, setShowCodeGenerator] = useState<boolean>(false);

  const referralTiers: ReferralTier[] = [
    {
      name: 'Acolyte',
      commission: 0.1,
      requirements: 0,
      benefits: ['10% commission', 'Basic analytics', 'Standard support']
    },
    {
      name: 'Disciple',
      commission: 0.15,
      requirements: 10,
      benefits: ['15% commission', 'Advanced analytics', 'Priority support', 'Custom link']
    },
    {
      name: 'Mystic',
      commission: 0.2,
      requirements: 50,
      benefits: ['20% commission', 'Real-time analytics', 'Dedicated support', 'Bonus rewards']
    },
    {
      name: 'High Priest',
      commission: 0.25,
      requirements: 100,
      benefits: ['25% commission', 'All features', 'VIP support', 'Exclusive events']
    }
  ];

  useEffect(() => {
    generateReferralCode();
    loadReferralStats();
  }, []);

  const generateReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'NOCTURNE';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setReferralCode(result);
  };

  const loadReferralStats = () => {
    // Mock data - in production, fetch from API
    setStats({
      totalReferred: Math.floor(Math.random() * 50) + 5,
      totalEarned: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
      activeReferrals: Math.floor(Math.random() * 30) + 2,
      conversionRate: parseFloat((Math.random() * 15 + 5).toFixed(1))
    });
    
    setCurrentTier(Math.min(Math.floor(stats.totalReferred / 10), 3));
  };

  const copyReferralLink = () => {
    const link = `https://nocturne.swap/${referralCode}`;
    navigator.clipboard.writeText(link);
    // Show notification
  };

  const shareOnSocial = (platform: string) => {
    const link = `https://nocturne.swap/${referralCode}`;
    const text = `Join me on NocturneSwap, the mystical Solana DEX! Use my referral code: ${referralCode}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
      discord: `https://discord.com/channels/@me?text=${encodeURIComponent(text + ' ' + link)}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  return (
    <div className="referral-page">
      <div className="page-header holo-card">
        <h1 className="holo-text">🔮 Referral Mysticism</h1>
        <p className="font-mystical">Invite others to join the cult and earn eternal rewards</p>
      </div>

      <div className="referral-content">
        <div className="referral-main">
          {/* Referral Code Section */}
          <div className="referral-code-section holo-card">
            <h2 className="ember-glow">Your Sacred Code</h2>
            <div className="referral-code-display">
              <div className="code-container neon-outline">
                <span className="referral-code matrix-text">{referralCode}</span>
                <button className="glow-btn" onClick={copyReferralLink}>
                  📋 Copy Link
                </button>
              </div>
            </div>
            
            <div className="share-buttons">
              <button className="share-btn twitter" onClick={() => shareOnSocial('twitter')}>
                🐦 Twitter
              </button>
              <button className="share-btn telegram" onClick={() => shareOnSocial('telegram')}>
                ✈️ Telegram
              </button>
              <button className="share-btn discord" onClick={() => shareOnSocial('discord')}>
                🎮 Discord
              </button>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="referral-stats holo-card">
            <h2 className="ember-glow">Mystical Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value holo-text">{stats.totalReferred}</div>
                <div className="stat-label">Total Referred</div>
              </div>
              <div className="stat-item">
                <div className="stat-value holo-text">${stats.totalEarned}</div>
                <div className="stat-label">Total Earned</div>
              </div>
              <div className="stat-item">
                <div className="stat-value holo-text">{stats.activeReferrals}</div>
                <div className="stat-label">Active Referrals</div>
              </div>
              <div className="stat-item">
                <div className="stat-value holo-text">{stats.conversionRate}%</div>
                <div className="stat-label">Conversion Rate</div>
              </div>
            </div>
          </div>

          {/* Commission Calculator */}
          <div className="commission-calculator holo-card">
            <h2 className="ember-glow">Commission Calculator</h2>
            <div className="calculator-content">
              <div className="calc-input">
                <label>Trading Volume ($)</label>
                <input 
                  type="number" 
                  className="holo-input" 
                  placeholder="Enter volume"
                  onChange={(e) => {
                    const volume = parseFloat(e.target.value) || 0;
                    const commission = volume * (referralTiers[currentTier].commission / 100);
                    // Update commission display
                  }}
                />
              </div>
              <div className="calc-result">
                <span className="holo-text">Your Commission: $0.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="referral-sidebar">
          {/* Current Tier */}
          <div className="tier-display holo-card">
            <h3 className="ember-glow">Current Tier</h3>
            <div className="tier-info">
              <div className="tier-name holo-text">{referralTiers[currentTier].name}</div>
              <div className="tier-commission">{referralTiers[currentTier].commission}% Commission</div>
              <div className="tier-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min((stats.totalReferred % 10) * 10, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {stats.totalReferred % 10}/10 to next tier
                </span>
              </div>
            </div>
          </div>

          {/* All Tiers */}
          <div className="tiers-list holo-card">
            <h3 className="ember-glow">Advancement Path</h3>
            <div className="tiers">
              {referralTiers.map((tier, index) => (
                <div 
                  key={index} 
                  className={`tier-item ${index === currentTier ? 'active' : ''} ${index < currentTier ? 'completed' : ''}`}
                >
                  <div className="tier-header">
                    <span className="tier-icon">
                      {index < currentTier ? '✅' : index === currentTier ? '🔮' : '🔒'}
                    </span>
                    <span className="tier-name">{tier.name}</span>
                    <span className="tier-rate">{tier.commission}%</span>
                  </div>
                  <div className="tier-requirements">
                    {tier.requirements} referrals required
                  </div>
                  <div className="tier-benefits">
                    {tier.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="benefit-item">
                        ◆ {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Referrals */}
          <div className="recent-referrals holo-card">
            <h3 className="ember-glow">Recent Converts</h3>
            <div className="referral-list">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="referral-item">
                  <div className="referral-avatar">🌙</div>
                  <div className="referral-info">
                    <div className="referral-name">Anonymous#{Math.floor(Math.random() * 9999)}</div>
                    <div className="referral-date">{Math.floor(Math.random() * 7) + 1} days ago</div>
                  </div>
                  <div className="referral-status">
                    <span className="status-badge active">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;

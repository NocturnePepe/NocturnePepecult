import React from 'react';
import { useMockWallet } from '../contexts/MockWalletContext';
import './XPRankBar.css';

const CULT_RANKS = [
  { level: 0, name: 'Wanderer', minXP: 0, maxXP: 99, color: '#666666', icon: '🚶' },
  { level: 1, name: 'Seeker', minXP: 100, maxXP: 499, color: '#8B4513', icon: '🔍' },
  { level: 2, name: 'Initiate', minXP: 500, maxXP: 1499, color: '#4B0082', icon: '🌙' },
  { level: 3, name: 'Acolyte', minXP: 1500, maxXP: 3499, color: '#800080', icon: '⚡' },
  { level: 4, name: 'Cultist', minXP: 3500, maxXP: 7499, color: '#9932CC', icon: '🔮' },
  { level: 5, name: 'Disciple', minXP: 7500, maxXP: 14999, color: '#DA70D6', icon: '👁️' },
  { level: 6, name: 'Mystic', minXP: 15000, maxXP: 29999, color: '#FF1493', icon: '🧿' },
  { level: 7, name: 'Harbinger', minXP: 30000, maxXP: 59999, color: '#FF69B4', icon: '⚔️' },
  { level: 8, name: 'Shadow Lord', minXP: 60000, maxXP: 99999, color: '#FFB6C1', icon: '👑' },
  { level: 9, name: 'Void Master', minXP: 100000, maxXP: 999999, color: '#FFD700', icon: '💀' }
];

interface XPRankBarProps {
  isFloating?: boolean;
  compact?: boolean;
}

const XPRankBar: React.FC<XPRankBarProps> = ({ isFloating = false, compact = false }) => {
  const { userStats } = useMockWallet();
  
  const currentRank = CULT_RANKS.find(rank => 
    userStats.xp >= rank.minXP && userStats.xp <= rank.maxXP
  ) || CULT_RANKS[0];
  
  const nextRank = CULT_RANKS[currentRank.level + 1];
  
  // Calculate XP progress within current level
  const xpInCurrentLevel = userStats.xp - currentRank.minXP;
  const xpNeededForNext = nextRank ? (nextRank.minXP - currentRank.minXP) : 1;
  const progressPercent = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);

  const xpToNext = nextRank ? nextRank.minXP - userStats.xp : 0;

  const containerClass = `xp-rank-bar ${isFloating ? 'floating' : ''} ${compact ? 'compact' : ''}`;

  return (
    <div className={containerClass}>
      <div className="rank-info">
        <div className="rank-icon" style={{ color: currentRank.color }}>
          {currentRank.icon}
        </div>
        <div className="rank-details">
          <div className="rank-name" style={{ color: currentRank.color }}>
            {currentRank.name}
          </div>
          {!compact && (
            <div className="rank-level">
              Level {currentRank.level}
            </div>
          )}
        </div>
      </div>

      <div className="xp-progress">
        <div className="xp-bar-container">
          <div 
            className="xp-bar-fill" 
            style={{ 
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${currentRank.color}88, ${currentRank.color})`
            }}
          />
          <div className="xp-bar-glow" style={{ backgroundColor: currentRank.color }} />
        </div>
        
        <div className="xp-text">
          <span className="current-xp">{userStats.xp.toLocaleString()} XP</span>
          {nextRank && !compact && (
            <span className="xp-to-next">
              {xpToNext.toLocaleString()} to {nextRank.name}
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <div className="cult-tier">
          <div className="tier-badge" style={{ backgroundColor: currentRank.color }}>
            T{userStats.cultTier}
          </div>
        </div>
      )}
    </div>
  );
};

export default XPRankBar;

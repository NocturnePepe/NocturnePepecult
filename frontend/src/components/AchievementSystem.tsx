// AchievementSystem.tsx - Cult-themed achievement tracking and rewards
import React, { useState, useEffect, useCallback } from 'react';
import { cultSounds } from '../SoundEffects.js';
import './AchievementSystem.css';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: 'trading' | 'social' | 'collection' | 'mystery' | 'ritual';
  requirement: {
    type: 'count' | 'value' | 'streak' | 'special';
    target: number;
    metric: string;
  };
  reward: {
    xp: number;
    title?: string;
    badge?: string;
    bonus?: string;
  };
  unlocked: boolean;
  progress: number;
  unlockedAt?: Date;
}

interface UserLevel {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  prestige: number;
}

interface AchievementSystemProps {
  isVisible: boolean;
  onClose: () => void;
  userStats: {
    totalSwaps: number;
    totalVolume: number;
    consecutiveDays: number;
    bestTrade: number;
    referrals: number;
    [key: string]: number;
  };
}

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Trading Achievements
  {
    id: 'first_ritual',
    title: 'First Ritual',
    description: 'Complete your first swap ritual',
    icon: '🌙',
    rarity: 'common',
    category: 'trading',
    requirement: { type: 'count', target: 1, metric: 'totalSwaps' },
    reward: { xp: 100, title: 'Novice Cultist' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'ritual_adept',
    title: 'Ritual Adept',
    description: 'Complete 50 swap rituals',
    icon: '⚡',
    rarity: 'rare',
    category: 'trading',
    requirement: { type: 'count', target: 50, metric: 'totalSwaps' },
    reward: { xp: 500, title: 'Ritual Adept', badge: 'lightning' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'shadow_trader',
    title: 'Shadow Trader',
    description: 'Trade over $10,000 in volume',
    icon: '👤',
    rarity: 'epic',
    category: 'trading',
    requirement: { type: 'value', target: 10000, metric: 'totalVolume' },
    reward: { xp: 1000, title: 'Shadow Trader', bonus: '0.1% fee reduction' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'whale_summoner',
    title: 'Whale Summoner',
    description: 'Execute a single trade worth over $50,000',
    icon: '🐋',
    rarity: 'legendary',
    category: 'trading',
    requirement: { type: 'value', target: 50000, metric: 'bestTrade' },
    reward: { xp: 2500, title: 'Whale Summoner', badge: 'whale', bonus: 'Priority routing' },
    unlocked: false,
    progress: 0
  },
  
  // Social Achievements
  {
    id: 'cult_recruiter',
    title: 'Cult Recruiter',
    description: 'Refer 10 new cultists',
    icon: '👥',
    rarity: 'rare',
    category: 'social',
    requirement: { type: 'count', target: 10, metric: 'referrals' },
    reward: { xp: 750, title: 'Cult Recruiter', bonus: '2% referral bonus' },
    unlocked: false,
    progress: 0
  },
  
  // Streak Achievements
  {
    id: 'daily_devotion',
    title: 'Daily Devotion',
    description: 'Trade for 7 consecutive days',
    icon: '🔥',
    rarity: 'rare',
    category: 'ritual',
    requirement: { type: 'streak', target: 7, metric: 'consecutiveDays' },
    reward: { xp: 600, title: 'Devoted Cultist', bonus: 'Daily rewards unlock' },
    unlocked: false,
    progress: 0
  },
  
  // Mystery Achievements
  {
    id: 'midnight_trader',
    title: 'Midnight Trader',
    description: 'Execute a trade at exactly midnight',
    icon: '🕛',
    rarity: 'epic',
    category: 'mystery',
    requirement: { type: 'special', target: 1, metric: 'midnightTrades' },
    reward: { xp: 1500, title: 'Night Walker', badge: 'moon' },
    unlocked: false,
    progress: 0
  },
  {
    id: 'perfect_swap',
    title: 'Perfect Ritual',
    description: 'Execute a swap with 0% slippage',
    icon: '✨',
    rarity: 'mythic',
    category: 'mystery',
    requirement: { type: 'special', target: 1, metric: 'perfectSwaps' },
    reward: { xp: 5000, title: 'Ritual Master', badge: 'star', bonus: 'Perfect swap bonus' },
    unlocked: false,
    progress: 0
  }
];

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Wanderer' },
  { level: 2, xp: 500, title: 'Initiate' },
  { level: 3, xp: 1200, title: 'Acolyte' },
  { level: 4, xp: 2500, title: 'Cultist' },
  { level: 5, xp: 5000, title: 'Devotee' },
  { level: 6, xp: 8500, title: 'Zealot' },
  { level: 7, xp: 13500, title: 'Elder' },
  { level: 8, xp: 20000, title: 'High Priest' },
  { level: 9, xp: 30000, title: 'Shadow Lord' },
  { level: 10, xp: 45000, title: 'Void Master' }
];

const AchievementSystem = ({ isVisible, onClose, userStats }: AchievementSystemProps) => {
  const [achievements, setAchievements] = useState([]);
  const [userLevel, setUserLevel] = useState({
    level: 1,
    xp: 0,
    xpToNext: 500,
    title: 'Wanderer',
    prestige: 0
  });
  const [selectedTab, setSelectedTab] = useState('achievements');
  const [filterCategory, setFilterCategory] = useState('all');
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  // Load achievements from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nocturne_achievements');
    const savedLevel = localStorage.getItem('nocturne_user_level');
    
    if (saved) {
      const savedAchievements = JSON.parse(saved);
      setAchievements(savedAchievements);
    } else {
      setAchievements(ACHIEVEMENT_DEFINITIONS);
    }
    
    if (savedLevel) {
      setUserLevel(JSON.parse(savedLevel));
    }
  }, []);

  // Update achievements based on user stats
  useEffect(() => {
    if (!achievements.length) return;
    
    let hasUpdates = false;
    let newUnlocks: Achievement[] = [];
    let totalXpGained = 0;
    
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;
      
      const statValue = userStats[achievement.requirement.metric] || 0;
      const progress = Math.min(statValue / achievement.requirement.target, 1);
      
      if (progress >= 1 && !achievement.unlocked) {
        hasUpdates = true;
        newUnlocks.push(achievement);
        totalXpGained += achievement.reward.xp;
        
        return {
          ...achievement,
          unlocked: true,
          progress: 1,
          unlockedAt: new Date()
        };
      }
      
      return {
        ...achievement,
        progress: achievement.requirement.type === 'streak' ? statValue : progress
      };
    });
    
    if (hasUpdates) {
      setAchievements(updatedAchievements);
      setRecentUnlocks(newUnlocks);
      setShowNotification(true);
      
      // Update user level
      const newXp = userLevel.xp + totalXpGained;
      const newLevel = calculateLevel(newXp);
      setUserLevel(newLevel);
      
      // Save to localStorage
      localStorage.setItem('nocturne_achievements', JSON.stringify(updatedAchievements));
      localStorage.setItem('nocturne_user_level', JSON.stringify(newLevel));
      
      // Play achievement sound
      cultSounds.playConnectSound();
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [userStats, achievements, userLevel.xp]);

  const calculateLevel = (xp: number): UserLevel => {
    let level = 1;
    let title = 'Wanderer';
    
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i].xp) {
        level = LEVEL_THRESHOLDS[i].level;
        title = LEVEL_THRESHOLDS[i].title;
        break;
      }
    }
    
    const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(t => t.level === level + 1);
    const xpToNext = nextLevelIndex !== -1 ? LEVEL_THRESHOLDS[nextLevelIndex].xp - xp : 0;
    
    return {
      level,
      xp,
      xpToNext,
      title,
      prestige: Math.floor(level / 10)
    };
  };

  const filteredAchievements = achievements.filter(achievement => 
    filterCategory === 'all' || achievement.category === filterCategory
  );

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#8a8a8a';
      case 'rare': return '#4a9eff';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      case 'mythic': return '#e6cc80';
      default: return '#8a8a8a';
    }
  };

  const renderAchievementCard = (achievement: Achievement) => (
    <div 
      key={achievement.id} 
      className={`achievement-card ${achievement.unlocked ? 'unlocked' : ''} ${achievement.rarity}`}
      style={{ borderColor: getRarityColor(achievement.rarity) }}
    >
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <h4>{achievement.title}</h4>
        <p>{achievement.description}</p>
        <div className="achievement-progress">
          <div 
            className="progress-bar"
            style={{ width: `${achievement.progress * 100}%` }}
          />
          <span className="progress-text">
            {achievement.unlocked ? 'COMPLETED' : `${Math.floor(achievement.progress * 100)}%`}
          </span>
        </div>
        <div className="achievement-reward">
          <span className="xp-reward">+{achievement.reward.xp} XP</span>
          {achievement.reward.title && <span className="title-reward">"{achievement.reward.title}"</span>}
          {achievement.reward.bonus && <span className="bonus-reward">{achievement.reward.bonus}</span>}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="achievement-modal-overlay">
      <div className="achievement-modal">
        <div className="achievement-header">
          <h2>🏆 Cult Achievements</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Achievement Notification */}
        {showNotification && recentUnlocks.length > 0 && (
          <div className="achievement-notification">
            <div className="notification-content">
              <h3>🎉 Achievement Unlocked!</h3>
              {recentUnlocks.map(achievement => (
                <div key={achievement.id} className="unlocked-achievement">
                  <span className="unlock-icon">{achievement.icon}</span>
                  <span className="unlock-title">{achievement.title}</span>
                  <span className="unlock-xp">+{achievement.reward.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="achievement-tabs">
          <button 
            className={selectedTab === 'achievements' ? 'active' : ''}
            onClick={() => setSelectedTab('achievements')}
          >
            🏆 Achievements
          </button>
          <button 
            className={selectedTab === 'profile' ? 'active' : ''}
            onClick={() => setSelectedTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={selectedTab === 'leaderboard' ? 'active' : ''}
            onClick={() => setSelectedTab('leaderboard')}
          >
            📊 Leaderboard
          </button>
        </div>

        <div className="achievement-content">
          {selectedTab === 'achievements' && (
            <>
              {/* Category Filter */}
              <div className="category-filter">
                <button 
                  className={filterCategory === 'all' ? 'active' : ''}
                  onClick={() => setFilterCategory('all')}
                >
                  All
                </button>
                <button 
                  className={filterCategory === 'trading' ? 'active' : ''}
                  onClick={() => setFilterCategory('trading')}
                >
                  Trading
                </button>
                <button 
                  className={filterCategory === 'social' ? 'active' : ''}
                  onClick={() => setFilterCategory('social')}
                >
                  Social
                </button>
                <button 
                  className={filterCategory === 'ritual' ? 'active' : ''}
                  onClick={() => setFilterCategory('ritual')}
                >
                  Ritual
                </button>
                <button 
                  className={filterCategory === 'mystery' ? 'active' : ''}
                  onClick={() => setFilterCategory('mystery')}
                >
                  Mystery
                </button>
              </div>

              {/* Achievement Grid */}
              <div className="achievement-grid">
                {filteredAchievements.map(renderAchievementCard)}
              </div>
            </>
          )}

          {selectedTab === 'profile' && (
            <div className="profile-tab">
              <div className="user-level-card">
                <div className="level-header">
                  <h3>Level {userLevel.level} {userLevel.title}</h3>
                  {userLevel.prestige > 0 && <span className="prestige">⭐ Prestige {userLevel.prestige}</span>}
                </div>
                <div className="xp-progress">
                  <div className="xp-bar">
                    <div 
                      className="xp-fill"
                      style={{ width: `${((userLevel.xp % 1000) / 1000) * 100}%` }}
                    />
                  </div>
                  <span className="xp-text">{userLevel.xp} XP • {userLevel.xpToNext} to next level</span>
                </div>
              </div>

              <div className="stats-overview">
                <h4>📊 Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Swaps</span>
                    <span className="stat-value">{userStats.totalSwaps}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Volume Traded</span>
                    <span className="stat-value">${userStats.totalVolume?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Best Trade</span>
                    <span className="stat-value">${userStats.bestTrade?.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Consecutive Days</span>
                    <span className="stat-value">{userStats.consecutiveDays}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Referrals</span>
                    <span className="stat-value">{userStats.referrals}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Achievements</span>
                    <span className="stat-value">{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'leaderboard' && (
            <div className="leaderboard-tab">
              <h4>🏆 Top Cultists (Mock Data)</h4>
              <div className="leaderboard-list">
                <div className="leaderboard-item rank-1">
                  <span className="rank">1</span>
                  <span className="name">VoidMaster_666</span>
                  <span className="level">Lv. 10 Void Master</span>
                  <span className="score">125,000 XP</span>
                </div>
                <div className="leaderboard-item rank-2">
                  <span className="rank">2</span>
                  <span className="name">ShadowTrader</span>
                  <span className="level">Lv. 9 Shadow Lord</span>
                  <span className="score">98,500 XP</span>
                </div>
                <div className="leaderboard-item rank-3">
                  <span className="rank">3</span>
                  <span className="name">MoonCultist</span>
                  <span className="level">Lv. 8 High Priest</span>
                  <span className="score">76,200 XP</span>
                </div>
                <div className="leaderboard-item">
                  <span className="rank">4</span>
                  <span className="name">You</span>
                  <span className="level">Lv. {userLevel.level} {userLevel.title}</span>
                  <span className="score">{userLevel.xp} XP</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;

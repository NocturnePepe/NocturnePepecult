import React, { useState, useEffect } from 'react';
import './AchievementSystem.css';

// Achievement types and definitions
const ACHIEVEMENT_TYPES = {
  TRADING: 'trading',
  SOCIAL: 'social', 
  RITUAL: 'ritual',
  MYSTERY: 'mystery',
  PROGRESSION: 'progression'
};

const CULT_RANKS = [
  { level: 0, name: 'Wanderer', minXP: 0, color: '#666666' },
  { level: 1, name: 'Seeker', minXP: 100, color: '#8B4513' },
  { level: 2, name: 'Initiate', minXP: 500, color: '#4B0082' },
  { level: 3, name: 'Acolyte', minXP: 1500, color: '#800080' },
  { level: 4, name: 'Cultist', minXP: 3500, color: '#9932CC' },
  { level: 5, name: 'Disciple', minXP: 7500, color: '#DA70D6' },
  { level: 6, name: 'Mystic', minXP: 15000, color: '#FF1493' },
  { level: 7, name: 'Harbinger', minXP: 30000, color: '#FF69B4' },
  { level: 8, name: 'Shadow Lord', minXP: 60000, color: '#FFB6C1' },
  { level: 9, name: 'Void Master', minXP: 100000, color: '#FFD700' }
];

const ACHIEVEMENTS_DEFINITION = [
  // Trading Achievements
  {
    id: 'first_swap',
    name: 'First Ritual',
    description: 'Complete your first token swap',
    type: ACHIEVEMENT_TYPES.TRADING,
    xpReward: 50,
    icon: '🌙',
    criteria: { swapsCompleted: 1 }
  },
  {
    id: 'volume_1k',
    name: 'Apprentice Trader',
    description: 'Trade $1,000 in total volume',
    type: ACHIEVEMENT_TYPES.TRADING,
    xpReward: 100,
    icon: '💰',
    criteria: { totalVolume: 1000 }
  },
  {
    id: 'volume_10k',
    name: 'Mystic Trader',
    description: 'Trade $10,000 in total volume',
    type: ACHIEVEMENT_TYPES.TRADING,
    xpReward: 300,
    icon: '💎',
    criteria: { totalVolume: 10000 }
  },
  {
    id: 'perfect_week',
    name: 'Perfect Ritual Week',
    description: 'Trade every day for 7 consecutive days',
    type: ACHIEVEMENT_TYPES.RITUAL,
    xpReward: 200,
    icon: '🔮',
    criteria: { consecutiveDays: 7 }
  },
  {
    id: 'night_trader',
    name: 'Shadow Trader',
    description: 'Complete 10 trades between midnight and 6 AM',
    type: ACHIEVEMENT_TYPES.MYSTERY,
    xpReward: 150,
    icon: '🌑',
    criteria: { nightTrades: 10 }
  },
  {
    id: 'referral_master',
    name: 'Cult Recruiter',
    description: 'Refer 5 new members to the cult',
    type: ACHIEVEMENT_TYPES.SOCIAL,
    xpReward: 250,
    icon: '👥',
    criteria: { referrals: 5 }
  },
  {
    id: 'slippage_master',
    name: 'Precision Ritualist',
    description: 'Complete 20 swaps with less than 0.5% slippage',
    type: ACHIEVEMENT_TYPES.TRADING,
    xpReward: 180,
    icon: '🎯',
    criteria: { precisionSwaps: 20 }
  },
  {
    id: 'governance_voter',
    name: 'Council Member',
    description: 'Participate in 5 DAO governance votes',
    type: ACHIEVEMENT_TYPES.SOCIAL,
    xpReward: 120,
    icon: '🗳️',
    criteria: { votes: 5 }
  },
  {
    id: 'security_conscious',
    name: 'Guardian of Safety',
    description: 'Run security analysis on 10 transactions',
    type: ACHIEVEMENT_TYPES.MYSTERY,
    xpReward: 100,
    icon: '🛡️',
    criteria: { securityScans: 10 }
  },
  {
    id: 'limit_order_expert',
    name: 'Strategic Mystic',
    description: 'Successfully execute 5 limit orders',
    type: ACHIEVEMENT_TYPES.TRADING,
    xpReward: 160,
    icon: '⚡',
    criteria: { limitOrders: 5 }
  }
];

interface UserStats {
  swapsCompleted: number;
  totalVolume: number;
  consecutiveDays: number;
  nightTrades: number;
  referrals: number;
  precisionSwaps: number;
  votes: number;
  securityScans: number;
  limitOrders: number;
  totalXP: number;
  level: number;
  unlockedAchievements: string[];
}

const AchievementSystem: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    swapsCompleted: 0,
    totalVolume: 0,
    consecutiveDays: 0,
    nightTrades: 0,
    referrals: 0,
    precisionSwaps: 0,
    votes: 0,
    securityScans: 0,
    limitOrders: 0,
    totalXP: 0,
    level: 0,
    unlockedAchievements: []
  });

  const [recentAchievement, setRecentAchievement] = useState<any>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'VoidMaster_Alpha', xp: 95000, level: 8 },
    { rank: 2, name: 'ShadowTrader_X', xp: 78000, level: 8 },
    { rank: 3, name: 'MysticCultist', xp: 65000, level: 7 },
    { rank: 4, name: 'NightRitualist', xp: 52000, level: 7 },
    { rank: 5, name: 'CryptoHarbinger', xp: 45000, level: 6 }
  ]);

  useEffect(() => {
    // Load user stats from localStorage
    const savedStats = localStorage.getItem('nocturne_user_stats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setUserStats(stats);
    }

    // Listen for achievement events
    const handleAchievement = (event: CustomEvent) => {
      checkAchievements(event.detail);
    };

    window.addEventListener('nocturne_action' as any, handleAchievement);
    return () => window.removeEventListener('nocturne_action' as any, handleAchievement);
  }, []);

  const getCurrentRank = () => {
    for (let i = CULT_RANKS.length - 1; i >= 0; i--) {
      if (userStats.totalXP >= CULT_RANKS[i].minXP) {
        return CULT_RANKS[i];
      }
    }
    return CULT_RANKS[0];
  };

  const getNextRank = () => {
    const currentLevel = getCurrentRank().level;
    return CULT_RANKS[currentLevel + 1] || null;
  };

  const checkAchievements = (actionData: any) => {
    const newStats = { ...userStats };
    let xpGained = 0;

    // Update stats based on action
    switch (actionData.type) {
      case 'swap_completed':
        newStats.swapsCompleted++;
        newStats.totalVolume += actionData.volume || 0;
        if (actionData.slippage < 0.5) newStats.precisionSwaps++;
        
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 6) newStats.nightTrades++;
        
        xpGained += 10; // Base XP for swap
        break;
      
      case 'referral_success':
        newStats.referrals++;
        xpGained += 50;
        break;
      
      case 'governance_vote':
        newStats.votes++;
        xpGained += 25;
        break;
      
      case 'security_scan':
        newStats.securityScans++;
        xpGained += 5;
        break;
      
      case 'limit_order_executed':
        newStats.limitOrders++;
        xpGained += 30;
        break;
    }

    // Check for new achievements
    ACHIEVEMENTS_DEFINITION.forEach(achievement => {
      if (!newStats.unlockedAchievements.includes(achievement.id)) {
        const criteria = achievement.criteria;
        let unlocked = true;

        Object.keys(criteria).forEach(key => {
          if (newStats[key as keyof UserStats] < criteria[key]) {
            unlocked = false;
          }
        });

        if (unlocked) {
          newStats.unlockedAchievements.push(achievement.id);
          xpGained += achievement.xpReward;
          setRecentAchievement(achievement);
          
          // Show achievement notification
          setTimeout(() => setRecentAchievement(null), 5000);
        }
      }
    });

    newStats.totalXP += xpGained;
    newStats.level = getCurrentRank().level;

    setUserStats(newStats);
    localStorage.setItem('nocturne_user_stats', JSON.stringify(newStats));
  };

  const progressToNext = () => {
    const nextRank = getNextRank();
    if (!nextRank) return 100;
    
    const currentRank = getCurrentRank();
    const progress = (userStats.totalXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP) * 100;
    return Math.min(progress, 100);
  };

  const renderAchievementCard = (achievement: any) => {
    const isUnlocked = userStats.unlockedAchievements.includes(achievement.id);
    
    return (
      <div key={achievement.id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
        <div className="achievement-icon">{achievement.icon}</div>
        <div className="achievement-info">
          <h4>{achievement.name}</h4>
          <p>{achievement.description}</p>
          <div className="achievement-reward">+{achievement.xpReward} XP</div>
        </div>
        {isUnlocked && <div className="achievement-unlocked">✓</div>}
      </div>
    );
  };

  return (
    <div className="achievement-system">
      {/* Recent Achievement Notification */}
      {recentAchievement && (
        <div className="achievement-notification">
          <div className="achievement-popup">
            <div className="achievement-title">🎉 Achievement Unlocked!</div>
            <div className="achievement-details">
              <span className="achievement-icon">{recentAchievement.icon}</span>
              <div>
                <h3>{recentAchievement.name}</h3>
                <p>{recentAchievement.description}</p>
                <div className="xp-reward">+{recentAchievement.xpReward} XP</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Progress Header */}
      <div className="progress-header">
        <div className="cult-rank">
          <div className="rank-info">
            <h2 style={{ color: getCurrentRank().color }}>{getCurrentRank().name}</h2>
            <div className="level-badge">Level {getCurrentRank().level}</div>
          </div>
          <div className="xp-info">
            <div className="xp-text">{userStats.totalXP.toLocaleString()} XP</div>
            {getNextRank() && (
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressToNext()}%` }}
                ></div>
                <span className="next-rank">
                  Next: {getNextRank()?.name} ({getNextRank()?.minXP.toLocaleString()} XP)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">{userStats.swapsCompleted}</div>
          <div className="stat-label">Total Swaps</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${userStats.totalVolume.toLocaleString()}</div>
          <div className="stat-label">Total Volume</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userStats.unlockedAchievements.length}</div>
          <div className="stat-label">Achievements</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userStats.consecutiveDays}</div>
          <div className="stat-label">Streak Days</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="achievement-tabs">
        <button 
          className={`tab-button ${!showLeaderboard ? 'active' : ''}`}
          onClick={() => setShowLeaderboard(false)}
        >
          🏆 Achievements
        </button>
        <button 
          className={`tab-button ${showLeaderboard ? 'active' : ''}`}
          onClick={() => setShowLeaderboard(true)}
        >
          👑 Leaderboard
        </button>
      </div>

      {/* Content Area */}
      {!showLeaderboard ? (
        <div className="achievements-grid">
          {Object.values(ACHIEVEMENT_TYPES).map(type => (
            <div key={type} className="achievement-category">
              <h3 className="category-title">
                {type.charAt(0).toUpperCase() + type.slice(1)} Achievements
              </h3>
              <div className="achievements-list">
                {ACHIEVEMENTS_DEFINITION
                  .filter(achievement => achievement.type === type)
                  .map(renderAchievementCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="leaderboard">
          <div className="leaderboard-header">
            <h3>🏆 Cult Leaderboard</h3>
            <p>Top Cultists by Experience Points</p>
          </div>
          <div className="leaderboard-list">
            {leaderboard.map((player, index) => (
              <div key={player.rank} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank">#{player.rank}</div>
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  <div className="player-level">
                    Level {player.level} • {player.xp.toLocaleString()} XP
                  </div>
                </div>
                {index === 0 && <div className="crown">👑</div>}
                {index === 1 && <div className="crown">🥈</div>}
                {index === 2 && <div className="crown">🥉</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementSystem;

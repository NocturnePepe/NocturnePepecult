/* ===== PHASE 3: ENHANCED ACHIEVEMENT SYSTEM ===== */
/* Gaming-Grade Achievement Display & Progress Tracking */

import React, { useState, useMemo, useCallback } from 'react';
import { useGamification, Achievement } from '../contexts/GamificationContext';
import './EnhancedAchievementSystem.css';

interface EnhancedAchievementSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedAchievementSystem: React.FC<EnhancedAchievementSystemProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const {
    achievements,
    unlockedAchievements,
    playerLevel,
    totalXP,
    currentXPProgress,
    nextLevelXP,
    dailyStreak,
    currentCombo,
    maxCombo,
    socialRank,
    leaderboardPosition,
    nearbyPlayers,
    activeChallenges,
    pendingRewards,
    claimReward
  } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'difficulty' | 'reward'>('progress');

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          const difficultyOrder = ['bronze', 'silver', 'gold', 'platinum', 'legendary'];
          return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
        case 'reward':
          return b.xpReward - a.xpReward;
        case 'progress':
        default:
          const aUnlocked = unlockedAchievements.includes(a.id);
          const bUnlocked = unlockedAchievements.includes(b.id);
          if (aUnlocked && !bUnlocked) return -1;
          if (!aUnlocked && bUnlocked) return 1;
          return 0;
      }
    });
  }, [achievements, selectedCategory, sortBy, unlockedAchievements]);

  // Achievement categories
  const categories = useMemo(() => {
    const counts = achievements.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { id: 'all', name: 'All', count: achievements.length, icon: '🏆' },
      { id: 'trading', name: 'Trading', count: counts.trading || 0, icon: '💰' },
      { id: 'social', name: 'Social', count: counts.social || 0, icon: '👥' },
      { id: 'exploration', name: 'Explorer', count: counts.exploration || 0, icon: '🗺️' },
      { id: 'mastery', name: 'Mastery', count: counts.mastery || 0, icon: '⭐' },
      { id: 'special', name: 'Special', count: counts.special || 0, icon: '🌟' }
    ];
  }, [achievements]);

  // Progress statistics
  const progressStats = useMemo(() => {
    const total = achievements.length;
    const unlocked = unlockedAchievements.length;
    const percentage = Math.round((unlocked / total) * 100);
    
    return { total, unlocked, percentage };
  }, [achievements, unlockedAchievements]);

  // Get difficulty color
  const getDifficultyColor = useCallback((difficulty: Achievement['difficulty']) => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
      legendary: '#ff6b35'
    };
    return colors[difficulty];
  }, []);

  // Calculate achievement progress (mock implementation)
  const getAchievementProgress = useCallback((achievement: Achievement) => {
    // This would connect to actual progress tracking
    const mockProgress = unlockedAchievements.includes(achievement.id) ? 
      achievement.requirements.target : 
      Math.floor(achievement.requirements.target * Math.random() * 0.8);
    
    return {
      current: mockProgress,
      target: achievement.requirements.target,
      percentage: Math.round((mockProgress / achievement.requirements.target) * 100)
    };
  }, [unlockedAchievements]);

  if (!isOpen) return null;

  return (
    <div className="achievement-system-overlay" onClick={onClose}>
      <div 
        className="achievement-system-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with player stats */}
        <div className="achievement-header">
          <div className="player-overview">
            <div className="level-display">
              <div className="level-number">Lv.{playerLevel}</div>
              <div className="xp-bar">
                <div 
                  className="xp-progress"
                  style={{ width: `${(currentXPProgress / nextLevelXP) * 100}%` }}
                />
                <span className="xp-text">{currentXPProgress} / {nextLevelXP} XP</span>
              </div>
            </div>
            
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-icon">🔥</span>
                <span className="stat-value">{dailyStreak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <span className="stat-value">{currentCombo}</span>
                <span className="stat-label">Combo</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👑</span>
                <span className="stat-value">#{leaderboardPosition}</span>
                <span className="stat-label">Rank</span>
              </div>
            </div>
          </div>
          
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Progress Overview */}
        <div className="progress-overview">
          <div className="achievement-progress">
            <h3>Achievement Progress</h3>
            <div className="progress-circle">
              <svg viewBox="0 0 100 100" className="progress-ring">
                <circle
                  cx="50" cy="50" r="45"
                  className="progress-ring-bg"
                />
                <circle
                  cx="50" cy="50" r="45"
                  className="progress-ring-fill"
                  style={{
                    strokeDasharray: `${progressStats.percentage * 2.83} 283`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                  }}
                />
              </svg>
              <div className="progress-text">
                <span className="progress-percentage">{progressStats.percentage}%</span>
                <span className="progress-count">{progressStats.unlocked}/{progressStats.total}</span>
              </div>
            </div>
          </div>

          {/* Pending Rewards */}
          {pendingRewards.length > 0 && (
            <div className="pending-rewards">
              <h3>🎁 Pending Rewards</h3>
              <div className="rewards-list">
                {pendingRewards.slice(0, 3).map(reward => (
                  <div key={reward.id} className="reward-item">
                    <span className="reward-name">{reward.name}</span>
                    <button 
                      className="claim-button"
                      onClick={() => claimReward(reward.id)}
                    >
                      Claim
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-count">{category.count}</span>
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="sort-options">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="progress">Progress</option>
            <option value="difficulty">Difficulty</option>
            <option value="reward">XP Reward</option>
          </select>
        </div>

        {/* Achievements List */}
        <div className="achievements-list">
          {filteredAchievements.map(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            const progress = getAchievementProgress(achievement);
            
            return (
              <div 
                key={achievement.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} difficulty-${achievement.difficulty}`}
              >
                <div className="achievement-icon">
                  <span className="icon-emoji">{achievement.icon}</span>
                  {isUnlocked && <div className="unlock-badge">✓</div>}
                </div>
                
                <div className="achievement-info">
                  <div className="achievement-header-info">
                    <h4 className="achievement-name">{achievement.name}</h4>
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(achievement.difficulty) }}
                    >
                      {achievement.difficulty}
                    </span>
                  </div>
                  
                  <p className="achievement-description">{achievement.description}</p>
                  
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {progress.current} / {progress.target}
                    </span>
                  </div>
                  
                  <div className="achievement-reward">
                    <span className="xp-reward">+{achievement.xpReward} XP</span>
                    {achievement.unlocks && (
                      <span className="unlocks">
                        Unlocks: {achievement.unlocks.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Challenges Section */}
        {activeChallenges.length > 0 && (
          <div className="challenges-section">
            <h3>⚡ Active Challenges</h3>
            <div className="challenges-list">
              {activeChallenges.map(challenge => (
                <div key={challenge.id} className="challenge-card">
                  <div className="challenge-info">
                    <h4>{challenge.name}</h4>
                    <p>{challenge.description}</p>
                    <div className="challenge-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                        />
                      </div>
                      <span>{challenge.progress}/{challenge.target}</span>
                    </div>
                  </div>
                  <div className="challenge-reward">
                    <span>+{challenge.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Preview */}
        <div className="leaderboard-preview">
          <h3>🏆 Leaderboard</h3>
          <div className="leaderboard-list">
            {nearbyPlayers.map(player => (
              <div 
                key={player.id}
                className={`leaderboard-entry ${player.id === 'current' ? 'current-player' : ''}`}
              >
                <span className="rank">#{player.rank}</span>
                <span className="username">{player.username}</span>
                <span className="level">Lv.{player.level}</span>
                <span className="xp">{player.xp.toLocaleString()} XP</span>
                <div className="badges">
                  {player.badges.map(badge => (
                    <span key={badge} className="badge" title={badge}>
                      🏅
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAchievementSystem;

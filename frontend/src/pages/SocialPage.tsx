import React from 'react';
import { useMockWallet } from '../contexts/MockWalletContext';
import './SocialPage.css';

const SocialPage: React.FC = () => {
  const { userStats } = useMockWallet();

  const mockLeaderboard = [
    { rank: 1, username: 'VoidMaster', xp: 99999, trades: 2847, winRate: 94.2, badge: '👑' },
    { rank: 2, username: 'LunarQueen', xp: 87432, trades: 2156, winRate: 89.7, badge: '🌙' },
    { rank: 3, username: 'CryptoKing', xp: 76543, trades: 1923, winRate: 91.3, badge: '💎' },
    { rank: 4, username: 'NightTrader', xp: 65432, trades: 1745, winRate: 88.1, badge: '⭐' },
    { rank: 5, username: 'DarkLord', xp: 54321, trades: 1532, winRate: 86.9, badge: '🔥' },
    { rank: 6, username: 'You', xp: userStats.xp, trades: userStats.achievements.length + 12, winRate: 78.5, badge: '🌙' }
  ];

  const mockFeed = [
    { user: 'VoidMaster', action: 'completed a 50 SOL swap', time: '2 mins ago', xp: '+150 XP', icon: '🔄' },
    { user: 'LunarQueen', action: 'reached Rank 8!', time: '5 mins ago', xp: '+500 XP', icon: '👑' },
    { user: 'CryptoKing', action: 'earned "Diamond Hands" achievement', time: '10 mins ago', xp: '+200 XP', icon: '🏆' },
    { user: 'NightTrader', action: 'added 10 SOL to liquidity pool', time: '15 mins ago', xp: '+75 XP', icon: '💧' },
    { user: 'DarkLord', action: 'made their 1000th trade!', time: '30 mins ago', xp: '+1000 XP', icon: '🎯' },
    { user: 'MoonWalker', action: 'joined the cult', time: '1 hour ago', xp: '+50 XP', icon: '🚀' }
  ];

  const mockChallenges = [
    { title: 'Trading Spree', description: 'Complete 10 swaps today', progress: 6, target: 10, reward: '500 XP', icon: '🔄' },
    { title: 'Volume Master', description: 'Trade 100 SOL this week', progress: 67.5, target: 100, reward: '1000 XP', icon: '📊' },
    { title: 'Social Butterfly', description: 'Refer 5 new users', progress: 2, target: 5, reward: '2000 XP', icon: '👥' },
    { title: 'Diamond Hands', description: 'Hold NCTP for 30 days', progress: 18, target: 30, reward: '1500 XP', icon: '💎' }
  ];

  return (
    <div className="social-page">
      <div className="social-header">
        <h1>👥 Social Hub</h1>
        <p>Connect with the cult and climb the ranks</p>
      </div>

      <div className="social-content">
        <div className="social-main">
          <div className="profile-section">
            <div className="user-profile">
              <div className="profile-avatar">
                <div className="avatar-circle">🌙</div>
                <div className="rank-badge">Rank {Math.max(1, Math.floor(userStats.xp / 1000))}</div>
              </div>
              <div className="profile-info">
                <h3>Cult Member #{(userStats.xp + 1000).toString().slice(-4)}</h3>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">{userStats.xp.toLocaleString()}</span>
                    <span className="stat-label">XP</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{userStats.achievements.length + 12}</span>
                    <span className="stat-label">Trades</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">78.5%</span>
                    <span className="stat-label">Win Rate</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{userStats.achievements.length}</span>
                    <span className="stat-label">Achievements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="activity-feed-section">
            <h2>📢 Community Feed</h2>
            <div className="activity-feed">
              {mockFeed.map((activity, index) => (
                <div key={index} className="feed-item">
                  <div className="feed-icon">{activity.icon}</div>
                  <div className="feed-content">
                    <div className="feed-text">
                      <span className="feed-user">{activity.user}</span> {activity.action}
                    </div>
                    <div className="feed-meta">
                      <span className="feed-time">{activity.time}</span>
                      <span className="feed-xp">{activity.xp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="challenges-section">
            <h2>🎯 Daily Challenges</h2>
            <div className="challenges-grid">
              {mockChallenges.map((challenge, index) => (
                <div key={index} className="challenge-card">
                  <div className="challenge-header">
                    <span className="challenge-icon">{challenge.icon}</span>
                    <h4>{challenge.title}</h4>
                  </div>
                  <p className="challenge-description">{challenge.description}</p>
                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${(challenge.progress / challenge.target) * 100}%`}}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {challenge.progress} / {challenge.target}
                    </div>
                  </div>
                  <div className="challenge-reward">
                    Reward: <span className="reward-value">{challenge.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="social-sidebar">
          <div className="leaderboard-section">
            <h2>🏆 Leaderboard</h2>
            <div className="leaderboard">
              {mockLeaderboard.map((user, index) => (
                <div key={index} className={`leaderboard-item ${user.username === 'You' ? 'current-user' : ''}`}>
                  <div className="rank-position">
                    {user.rank <= 3 ? 
                      (user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉') : 
                      `#${user.rank}`
                    }
                  </div>
                  <div className="user-info">
                    <div className="username">
                      {user.badge} {user.username}
                    </div>
                    <div className="user-stats">
                      <span>{user.xp.toLocaleString()} XP</span>
                      <span>{user.winRate}% WR</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cult-stats-section">
            <h2>🌙 Cult Statistics</h2>
            <div className="cult-stats">
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-details">
                  <span className="stat-number">2,847</span>
                  <span className="stat-desc">Active Members</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💰</span>
                <div className="stat-details">
                  <span className="stat-number">$12.5M</span>
                  <span className="stat-desc">Total Volume</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🔄</span>
                <div className="stat-details">
                  <span className="stat-number">47,382</span>
                  <span className="stat-desc">Total Trades</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <div className="stat-details">
                  <span className="stat-number">156</span>
                  <span className="stat-desc">Achievements Unlocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;

/* ===== PHASE 4: ENHANCED SOCIAL HUB COMPONENT ===== */
/* Real-time Social Feed, Community Challenges, and Social Trading Interface */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSocial, SocialPost, CommunityChallenge, SocialUser } from '../contexts/SocialContext';
import { useGamification } from '../contexts/GamificationContext';
import './EnhancedSocialHub.css';

interface EnhancedSocialHubProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'feed' | 'challenges' | 'leaderboard' | 'guilds' | 'trading' | 'chat';

const EnhancedSocialHub: React.FC<EnhancedSocialHubProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    socialFeed,
    activeChallenges,
    userChallenges,
    communityStats,
    onlineUsers,
    userGuild,
    availableGuilds,
    liveChat,
    createPost,
    likePost,
    sharePost,
    joinChallenge,
    leaveChallenge,
    followUser,
    getLeaderboard,
    sendChatMessage
  } = useSocial();

  const { addXP, achievements } = useGamification();

  // Component State
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'achievement' | 'trade' | 'tip'>('text');
  const [leaderboardData, setLeaderboardData] = useState<SocialUser[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<'xp' | 'trades' | 'volume' | 'achievements'>('xp');
  const [chatMessage, setChatMessage] = useState('');
  const [filterChallenges, setFilterChallenges] = useState<'all' | 'active' | 'joined'>('all');

  // Load leaderboard data
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      getLeaderboard(leaderboardType).then(setLeaderboardData);
    }
  }, [activeTab, leaderboardType, getLeaderboard]);

  // Generate mock social feed if empty
  const mockFeed = useMemo((): SocialPost[] => {
    if (socialFeed.length > 0) return socialFeed;
    
    const mockPosts: SocialPost[] = [
      {
        id: 'post_1',
        userId: 'user_1',
        username: 'CryptoNinja42',
        avatar: '🥷',
        content: 'Just hit a 3x on $SOL! My strategy of buying the dip during market fear is paying off. Who else is diamond handing? 💎🙌',
        type: 'trade',
        timestamp: new Date(Date.now() - 300000),
        likes: 23,
        comments: 7,
        shares: 4,
        isLiked: false,
        tags: ['sol', 'trading', 'strategy'],
        tradeData: {
          tokenA: 'SOL',
          tokenB: 'USDC',
          amount: 1000,
          price: 95.34,
          profit: 285.76,
          strategy: 'Dip buying'
        }
      },
      {
        id: 'post_2',
        userId: 'user_2',
        username: 'DeFiMaster',
        avatar: '🧙‍♂️',
        content: 'Achievement unlocked! 🏆 Just became a Volume Trader by hitting 100K in total volume. The grind continues!',
        type: 'achievement',
        timestamp: new Date(Date.now() - 600000),
        likes: 45,
        comments: 12,
        shares: 8,
        isLiked: true,
        tags: ['achievement', 'milestone'],
        achievementData: {
          achievementId: 'volume_trader',
          title: 'Volume Trader',
          rarity: 'silver'
        }
      },
      {
        id: 'post_3',
        userId: 'user_3',
        username: 'YieldFarmer88',
        avatar: '🌾',
        content: 'Pro tip: Always check the liquidity pool depth before making large trades. Saved me from a 2% slippage today! 📊',
        type: 'tip',
        timestamp: new Date(Date.now() - 900000),
        likes: 67,
        comments: 23,
        shares: 15,
        isLiked: false,
        tags: ['tip', 'trading', 'defi']
      }
    ];
    
    return mockPosts;
  }, [socialFeed]);

  // Handle post creation
  const handleCreatePost = useCallback(async () => {
    if (!postContent.trim() || !currentUser) return;

    await createPost({
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      content: postContent,
      type: postType,
      tags: postContent.match(/#\w+/g)?.map(tag => tag.substring(1)) || []
    });

    setPostContent('');
    addXP(25); // Reward for social engagement
  }, [postContent, postType, currentUser, createPost, addXP]);

  // Handle challenge filtering
  const filteredChallenges = useMemo(() => {
    switch (filterChallenges) {
      case 'active':
        return activeChallenges.filter(c => c.status === 'active');
      case 'joined':
        return userChallenges;
      default:
        return activeChallenges;
    }
  }, [activeChallenges, userChallenges, filterChallenges]);

  // Handle chat message send
  const handleSendMessage = useCallback(async () => {
    if (!chatMessage.trim()) return;
    
    await sendChatMessage(chatMessage);
    setChatMessage('');
    addXP(5); // Small XP for chat participation
  }, [chatMessage, sendChatMessage, addXP]);

  // Tab configuration
  const tabs = [
    { id: 'feed' as TabType, label: 'Social Feed', icon: '📱', count: mockFeed.length },
    { id: 'challenges' as TabType, label: 'Challenges', icon: '🎯', count: activeChallenges.length },
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: '🏆', count: onlineUsers.length },
    { id: 'guilds' as TabType, label: 'Guilds', icon: '🛡️', count: availableGuilds.length },
    { id: 'trading' as TabType, label: 'Social Trading', icon: '📈', count: 0 },
    { id: 'chat' as TabType, label: 'Live Chat', icon: '💬', count: liveChat.activeUsers }
  ];

  if (!isOpen) return null;

  return (
    <div className="social-hub-overlay">
      <div className="social-hub-modal">
        {/* Header */}
        <div className="social-hub-header">
          <div className="hub-title">
            <h2>🌟 Social Hub</h2>
            <div className="community-stats">
              <span className="stat-item">
                <span className="stat-icon">👥</span>
                <span className="stat-value">{communityStats.activeUsers.toLocaleString()}</span>
                <span className="stat-label">Online</span>
              </span>
              <span className="stat-item">
                <span className="stat-icon">💰</span>
                <span className="stat-value">${(communityStats.totalVolume / 1000000).toFixed(1)}M</span>
                <span className="stat-label">Volume</span>
              </span>
            </div>
          </div>
          
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* User Profile Quick View */}
        {currentUser && (
          <div className="user-profile-quick">
            <div className="profile-info">
              <div className="profile-avatar">{currentUser.avatar}</div>
              <div className="profile-details">
                <h3>{currentUser.username}</h3>
                <div className="profile-stats">
                  <span>Level {currentUser.level}</span>
                  <span>•</span>
                  <span>{currentUser.stats.followers} followers</span>
                  <span>•</span>
                  <span>Rank #{currentUser.rank}</span>
                </div>
              </div>
            </div>
            {userGuild && (
              <div className="guild-badge">
                <span className="guild-icon">🛡️</span>
                <span>{userGuild.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.count > 0 && (
                <span className="tab-count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Social Feed Tab */}
          {activeTab === 'feed' && (
            <div className="feed-container">
              {/* Post Creation */}
              <div className="create-post">
                <div className="post-input-container">
                  <div className="avatar-placeholder">{currentUser?.avatar || '👤'}</div>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your trading insights, achievements, or tips..."
                    className="post-input"
                    rows={3}
                  />
                </div>
                <div className="post-actions">
                  <div className="post-type-selector">
                    {(['text', 'trade', 'tip'] as const).map(type => (
                      <button
                        key={type}
                        className={`type-button ${postType === type ? 'active' : ''}`}
                        onClick={() => setPostType(type)}
                      >
                        {type === 'text' && '💭'}
                        {type === 'trade' && '📈'}
                        {type === 'tip' && '💡'}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button
                    className="create-post-button"
                    onClick={handleCreatePost}
                    disabled={!postContent.trim()}
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* Feed Posts */}
              <div className="feed-posts">
                {mockFeed.map(post => (
                  <div key={post.id} className={`post-card post-type-${post.type}`}>
                    <div className="post-header">
                      <div className="post-author">
                        <div className="author-avatar">{post.avatar}</div>
                        <div className="author-info">
                          <h4>{post.username}</h4>
                          <span className="post-time">
                            {new Date(post.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="post-type-badge">
                        {post.type === 'trade' && '📈'}
                        {post.type === 'achievement' && '🏆'}
                        {post.type === 'tip' && '💡'}
                        {post.type === 'text' && '💭'}
                      </div>
                    </div>

                    <div className="post-content">
                      <p>{post.content}</p>
                      
                      {post.tradeData && (
                        <div className="trade-data">
                          <div className="trade-pair">
                            {post.tradeData.tokenA} → {post.tradeData.tokenB}
                          </div>
                          <div className="trade-details">
                            <span>Amount: {post.tradeData.amount.toLocaleString()}</span>
                            <span>Price: ${post.tradeData.price}</span>
                            {post.tradeData.profit && (
                              <span className="profit">
                                Profit: +${post.tradeData.profit.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {post.achievementData && (
                        <div className="achievement-data">
                          <div className="achievement-badge">
                            🏆 {post.achievementData.title}
                          </div>
                          <div className="achievement-rarity">
                            Rarity: {post.achievementData.rarity}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>

                    <div className="post-actions">
                      <button
                        className={`action-button ${post.isLiked ? 'liked' : ''}`}
                        onClick={() => likePost(post.id)}
                      >
                        {post.isLiked ? '❤️' : '🤍'} {post.likes}
                      </button>
                      <button className="action-button">
                        💬 {post.comments}
                      </button>
                      <button
                        className="action-button"
                        onClick={() => sharePost(post.id)}
                      >
                        🔄 {post.shares}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="challenges-container">
              <div className="challenges-header">
                <h3>🎯 Community Challenges</h3>
                <div className="challenge-filters">
                  {(['all', 'active', 'joined'] as const).map(filter => (
                    <button
                      key={filter}
                      className={`filter-button ${filterChallenges === filter ? 'active' : ''}`}
                      onClick={() => setFilterChallenges(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="challenges-list">
                {filteredChallenges.map(challenge => (
                  <div key={challenge.id} className={`challenge-card difficulty-${challenge.difficulty}`}>
                    <div className="challenge-header">
                      <div className="challenge-info">
                        <h4>{challenge.title}</h4>
                        <p>{challenge.description}</p>
                      </div>
                      <div className="challenge-badges">
                        <span className={`difficulty-badge ${challenge.difficulty}`}>
                          {challenge.difficulty}
                        </span>
                        <span className={`type-badge ${challenge.type}`}>
                          {challenge.type}
                        </span>
                      </div>
                    </div>

                    <div className="challenge-progress">
                      {challenge.objectives.map(objective => (
                        <div key={objective.id} className="objective">
                          <div className="objective-info">
                            <span>{objective.description}</span>
                            <span className="progress-text">
                              {objective.current} / {objective.target}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${(objective.current / objective.target) * 100}%`
                              }}
                            />
                          </div>
                          <div className="objective-reward">
                            +{objective.reward.xp} XP
                            {objective.reward.badge && ` • ${objective.reward.badge}`}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="challenge-stats">
                      <span>👥 {challenge.participants} participants</span>
                      <span>⏰ {Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                    </div>

                    <div className="challenge-actions">
                      {userChallenges.find(c => c.id === challenge.id) ? (
                        <button
                          className="leave-challenge-button"
                          onClick={() => leaveChallenge(challenge.id)}
                        >
                          Leave Challenge
                        </button>
                      ) : (
                        <button
                          className="join-challenge-button"
                          onClick={() => joinChallenge(challenge.id)}
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="leaderboard-container">
              <div className="leaderboard-header">
                <h3>🏆 Leaderboards</h3>
                <div className="leaderboard-types">
                  {(['xp', 'trades', 'volume', 'achievements'] as const).map(type => (
                    <button
                      key={type}
                      className={`type-button ${leaderboardType === type ? 'active' : ''}`}
                      onClick={() => setLeaderboardType(type)}
                    >
                      {type === 'xp' && '⭐ XP'}
                      {type === 'trades' && '🔄 Trades'}
                      {type === 'volume' && '💰 Volume'}
                      {type === 'achievements' && '🏆 Achievements'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="leaderboard-list">
                {leaderboardData.slice(0, 20).map((user, index) => (
                  <div key={user.id} className={`leaderboard-entry ${user.id === currentUser?.id ? 'current-user' : ''}`}>
                    <div className="rank">
                      {index + 1 <= 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                    </div>
                    <div className="user-info">
                      <div className="user-avatar">{user.avatar}</div>
                      <div className="user-details">
                        <h4>{user.username}</h4>
                        <span>Level {user.level}</span>
                      </div>
                    </div>
                    <div className="user-stat">
                      {leaderboardType === 'xp' && `${user.xp.toLocaleString()} XP`}
                      {leaderboardType === 'trades' && `${user.stats.totalTrades} trades`}
                      {leaderboardType === 'volume' && `$${user.stats.totalVolume.toLocaleString()}`}
                      {leaderboardType === 'achievements' && `${user.stats.achievements} achievements`}
                    </div>
                    <div className="user-actions">
                      {user.id !== currentUser?.id && (
                        <button
                          className="follow-button"
                          onClick={() => followUser(user.id)}
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Chat Tab */}
          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="chat-header">
                <h3>💬 Live Chat</h3>
                <div className="chat-status">
                  <span className={`status-indicator ${liveChat.isConnected ? 'connected' : 'disconnected'}`}>
                    ●
                  </span>
                  <span>{liveChat.activeUsers} online</span>
                </div>
              </div>

              <div className="chat-messages">
                {liveChat.messages.length === 0 ? (
                  <div className="empty-chat">
                    <p>💭 No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  liveChat.messages.map((message: any) => (
                    <div key={message.id} className="chat-message">
                      <span className="message-author">{message.username}:</span>
                      <span className="message-content">{message.message}</span>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === 'guilds' || activeTab === 'trading') && (
            <div className="coming-soon">
              <div className="coming-soon-content">
                <h3>🚧 Coming Soon</h3>
                <p>This feature is currently in development and will be available in the next update!</p>
                <div className="feature-preview">
                  {activeTab === 'guilds' && (
                    <>
                      <h4>🛡️ Guild Features Preview:</h4>
                      <ul>
                        <li>Create and join trading guilds</li>
                        <li>Guild-based challenges and competitions</li>
                        <li>Shared strategies and resources</li>
                        <li>Guild ranking and rewards</li>
                      </ul>
                    </>
                  )}
                  {activeTab === 'trading' && (
                    <>
                      <h4>📈 Social Trading Preview:</h4>
                      <ul>
                        <li>Follow top traders</li>
                        <li>Copy successful trades</li>
                        <li>Share trading strategies</li>
                        <li>Real-time trade notifications</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSocialHub;

/* ===== PHASE 4: ADVANCED SOCIAL INTEGRATION & COMMUNITY FEATURES ===== */
/* Real-time Social Layer, Community Challenges, and Social Trading */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useGamification } from './GamificationContext';
import { useMockWallet } from './MockWalletContext';

// ========== INTERFACES & TYPES ==========

export interface SocialUser {
  id: string;
  walletAddress: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  rank: number;
  badges: string[];
  isOnline: boolean;
  lastSeen: Date;
  stats: {
    totalTrades: number;
    totalVolume: number;
    winRate: number;
    followers: number;
    following: number;
    achievements: number;
  };
  preferences: {
    publicProfile: boolean;
    showTrades: boolean;
    allowCopy: boolean;
    notifications: boolean;
  };
}

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  type: 'trade' | 'achievement' | 'text' | 'prediction' | 'tip';
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  tags: string[];
  tradeData?: {
    tokenA: string;
    tokenB: string;
    amount: number;
    price: number;
    profit?: number;
    strategy: string;
  };
  achievementData?: {
    achievementId: string;
    title: string;
    rarity: string;
  };
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  participants: number;
  maxParticipants?: number;
  requirements: {
    minLevel?: number;
    requiredBadges?: string[];
    minVolume?: number;
  };
  objectives: {
    id: string;
    description: string;
    target: number;
    current: number;
    reward: {
      xp: number;
      badge?: string;
      tokens?: number;
      nft?: string;
    };
  }[];
  leaderboard: {
    userId: string;
    username: string;
    score: number;
    rank: number;
  }[];
}

export interface SocialTrade {
  id: string;
  traderId: string;
  traderUsername: string;
  tokenA: string;
  tokenB: string;
  amount: number;
  price: number;
  timestamp: Date;
  strategy: string;
  confidence: number;
  followers: number;
  copiers: number;
  performance: {
    roi: number;
    winRate: number;
    avgHoldTime: number;
  };
  tags: string[];
  isPublic: boolean;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  avatar: string;
  level: number;
  members: number;
  maxMembers: number;
  totalXP: number;
  rank: number;
  challenges: string[];
  perks: {
    bonusXP: number;
    feeReduction: number;
    exclusiveFeatures: string[];
  };
  requirements: {
    minLevel: number;
    minXP: number;
    inviteOnly: boolean;
  };
}

// ========== CONTEXT INTERFACE ==========

interface SocialContextType {
  // User & Social State
  currentUser: SocialUser | null;
  friends: SocialUser[];
  followers: SocialUser[];
  following: SocialUser[];
  onlineUsers: SocialUser[];
  
  // Feed & Posts
  socialFeed: SocialPost[];
  trendingPosts: SocialPost[];
  userPosts: SocialPost[];
  
  // Community Features
  communityStats: {
    totalUsers: number;
    activeUsers: number;
    totalTrades: number;
    totalVolume: number;
    topTraders: SocialUser[];
  };
  
  // Challenges & Competitions
  activeChallenges: CommunityChallenge[];
  upcomingChallenges: CommunityChallenge[];
  userChallenges: CommunityChallenge[];
  
  // Social Trading
  topTrades: SocialTrade[];
  followedTrades: SocialTrade[];
  copyTradingEnabled: boolean;
  
  // Guilds & Teams
  userGuild: Guild | null;
  availableGuilds: Guild[];
  guildLeaderboard: Guild[];
  
  // Real-time Features
  liveChat: {
    messages: any[];
    isConnected: boolean;
    activeUsers: number;
  };
  
  // Actions
  updateProfile: (updates: Partial<SocialUser>) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  createPost: (post: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'isLiked'>) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  joinGuild: (guildId: string) => Promise<void>;
  leaveGuild: () => Promise<void>;
  copyTrade: (tradeId: string, amount: number) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
  getLeaderboard: (type: 'xp' | 'trades' | 'volume' | 'achievements') => Promise<SocialUser[]>;
}

// ========== CONTEXT CREATION ==========

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

// ========== PROVIDER COMPONENT ==========

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core State
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
  const [friends, setFriends] = useState<SocialUser[]>([]);
  const [followers, setFollowers] = useState<SocialUser[]>([]);
  const [following, setFollowing] = useState<SocialUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<SocialUser[]>([]);
  
  // Feed State
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<SocialPost[]>([]);
  const [userPosts, setUserPosts] = useState<SocialPost[]>([]);
  
  // Challenge State
  const [activeChallenges, setActiveChallenges] = useState<CommunityChallenge[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<CommunityChallenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<CommunityChallenge[]>([]);
  
  // Trading State
  const [topTrades, setTopTrades] = useState<SocialTrade[]>([]);
  const [followedTrades, setFollowedTrades] = useState<SocialTrade[]>([]);
  const [copyTradingEnabled, setCopyTradingEnabled] = useState(false);
  
  // Guild State
  const [userGuild, setUserGuild] = useState<Guild | null>(null);
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([]);
  const [guildLeaderboard, setGuildLeaderboard] = useState<Guild[]>([]);
  
  // Chat State
  const [liveChat, setLiveChat] = useState({
    messages: [],
    isConnected: false,
    activeUsers: 0
  });
  
  // Community Stats
  const [communityStats, setCommunityStats] = useState({
    totalUsers: 12847,
    activeUsers: 1247,
    totalTrades: 98432,
    totalVolume: 2847392.84,
    topTraders: []
  });

  // External Dependencies
  const { level, xp, achievements } = useGamification();
  const { walletAddress } = useMockWallet();
  
  // Refs for real-time features
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // ========== MOCK DATA GENERATION ==========

  const generateMockUsers = useCallback((): SocialUser[] => {
    const mockUsers: SocialUser[] = [];
    const usernames = ['CryptoNinja', 'DeFiMaster', 'TokenHunter', 'SolanaWhale', 'TradingBot', 'YieldFarmer', 'NFTCollector', 'DiamondHands'];
    const avatars = ['🥷', '🧙‍♂️', '🎯', '🐋', '🤖', '🌾', '🎨', '💎'];
    
    for (let i = 0; i < 50; i++) {
      mockUsers.push({
        id: `user_${i}`,
        walletAddress: `sol_${Math.random().toString(36).substring(7)}`,
        username: `${usernames[i % usernames.length]}${Math.floor(Math.random() * 999)}`,
        avatar: avatars[i % avatars.length],
        level: Math.floor(Math.random() * 50) + 1,
        xp: Math.floor(Math.random() * 50000),
        rank: i + 1,
        badges: ['early_adopter', 'volume_trader'].slice(0, Math.floor(Math.random() * 3)),
        isOnline: Math.random() > 0.7,
        lastSeen: new Date(Date.now() - Math.random() * 86400000),
        stats: {
          totalTrades: Math.floor(Math.random() * 1000),
          totalVolume: Math.floor(Math.random() * 100000),
          winRate: Math.random() * 100,
          followers: Math.floor(Math.random() * 500),
          following: Math.floor(Math.random() * 200),
          achievements: Math.floor(Math.random() * 20)
        },
        preferences: {
          publicProfile: true,
          showTrades: Math.random() > 0.3,
          allowCopy: Math.random() > 0.5,
          notifications: true
        }
      });
    }
    
    return mockUsers;
  }, []);

  const generateMockChallenges = useCallback((): CommunityChallenge[] => {
    const challengeTypes = [
      {
        title: 'Trading Master Weekly',
        description: 'Complete 50 successful trades with 70%+ win rate',
        type: 'individual' as const,
        difficulty: 'medium' as const
      },
      {
        title: 'Guild War: Volume Championship',
        description: 'Guild with highest trading volume wins exclusive NFTs',
        type: 'team' as const,
        difficulty: 'hard' as const
      },
      {
        title: 'Community Milestone: 1M Volume',
        description: 'Reach 1 million SOL in total trading volume',
        type: 'community' as const,
        difficulty: 'legendary' as const
      }
    ];
    
    return challengeTypes.map((challenge, index) => ({
      id: `challenge_${index}`,
      ...challenge,
      startDate: new Date(Date.now() - Math.random() * 86400000),
      endDate: new Date(Date.now() + Math.random() * 604800000),
      status: ['upcoming', 'active', 'completed'][Math.floor(Math.random() * 3)] as any,
      participants: Math.floor(Math.random() * 1000),
      maxParticipants: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 100 : undefined,
      requirements: {
        minLevel: Math.floor(Math.random() * 10) + 1,
        minVolume: Math.floor(Math.random() * 10000)
      },
      objectives: [{
        id: `obj_${index}`,
        description: 'Complete challenge objective',
        target: 100,
        current: Math.floor(Math.random() * 100),
        reward: {
          xp: Math.floor(Math.random() * 1000) + 500,
          badge: 'challenge_winner',
          tokens: Math.floor(Math.random() * 100)
        }
      }],
      leaderboard: []
    }));
  }, []);

  // ========== INITIALIZATION ==========

  useEffect(() => {
    // Initialize user profile
    if (walletAddress && !currentUser) {
      const mockUsers = generateMockUsers();
      const userProfile: SocialUser = {
        id: 'current_user',
        walletAddress,
        username: 'NocturneMaster',
        avatar: '🌙',
        level: level || 1,
        xp: xp || 0,
        rank: Math.floor(Math.random() * 100) + 1,
        badges: Object.keys(achievements || {}).filter(id => achievements?.[id]?.unlocked),
        isOnline: true,
        lastSeen: new Date(),
        stats: {
          totalTrades: 42,
          totalVolume: 15847.32,
          winRate: 73.5,
          followers: 128,
          following: 89,
          achievements: Object.keys(achievements || {}).length
        },
        preferences: {
          publicProfile: true,
          showTrades: true,
          allowCopy: true,
          notifications: true
        }
      };
      
      setCurrentUser(userProfile);
      setFollowers(mockUsers.slice(0, 10));
      setFollowing(mockUsers.slice(10, 20));
      setOnlineUsers(mockUsers.filter(u => u.isOnline).slice(0, 15));
      
      // Initialize challenges
      const challenges = generateMockChallenges();
      setActiveChallenges(challenges.filter(c => c.status === 'active'));
      setUpcomingChallenges(challenges.filter(c => c.status === 'upcoming'));
      setUserChallenges(challenges.slice(0, 2));
    }
  }, [walletAddress, level, xp, achievements, generateMockUsers, generateMockChallenges]);

  // ========== SOCIAL ACTIONS ==========

  const updateProfile = useCallback(async (updates: Partial<SocialUser>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
      localStorage.setItem('social_profile', JSON.stringify({ ...currentUser, ...updates }));
    }
  }, [currentUser]);

  const followUser = useCallback(async (userId: string) => {
    console.log(`🤝 Following user: ${userId}`);
    // Simulate API call
    setTimeout(() => {
      const userToFollow = onlineUsers.find(u => u.id === userId);
      if (userToFollow && !following.find(f => f.id === userId)) {
        setFollowing(prev => [...prev, userToFollow]);
      }
    }, 500);
  }, [onlineUsers, following]);

  const unfollowUser = useCallback(async (userId: string) => {
    console.log(`💔 Unfollowing user: ${userId}`);
    setFollowing(prev => prev.filter(f => f.id !== userId));
  }, []);

  const createPost = useCallback(async (post: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'isLiked'>) => {
    const newPost: SocialPost = {
      ...post,
      id: `post_${Date.now()}`,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false
    };
    
    setSocialFeed(prev => [newPost, ...prev]);
    setUserPosts(prev => [newPost, ...prev]);
    console.log('📝 New post created:', newPost);
  }, []);

  const likePost = useCallback(async (postId: string) => {
    setSocialFeed(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  }, []);

  const sharePost = useCallback(async (postId: string) => {
    setSocialFeed(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
    console.log(`🔄 Shared post: ${postId}`);
  }, []);

  const joinChallenge = useCallback(async (challengeId: string) => {
    const challenge = activeChallenges.find(c => c.id === challengeId);
    if (challenge && !userChallenges.find(c => c.id === challengeId)) {
      setUserChallenges(prev => [...prev, challenge]);
      console.log(`🎯 Joined challenge: ${challenge.title}`);
    }
  }, [activeChallenges, userChallenges]);

  const leaveChallenge = useCallback(async (challengeId: string) => {
    setUserChallenges(prev => prev.filter(c => c.id !== challengeId));
    console.log(`❌ Left challenge: ${challengeId}`);
  }, []);

  const joinGuild = useCallback(async (guildId: string) => {
    const guild = availableGuilds.find(g => g.id === guildId);
    if (guild) {
      setUserGuild(guild);
      console.log(`🛡️ Joined guild: ${guild.name}`);
    }
  }, [availableGuilds]);

  const leaveGuild = useCallback(async () => {
    setUserGuild(null);
    console.log('🚪 Left guild');
  }, []);

  const copyTrade = useCallback(async (tradeId: string, amount: number) => {
    console.log(`📋 Copying trade ${tradeId} with amount: ${amount}`);
    // Simulate trade copying
  }, []);

  const sendChatMessage = useCallback(async (message: string) => {
    const newMessage = {
      id: Date.now(),
      userId: currentUser?.id || '',
      username: currentUser?.username || '',
      message,
      timestamp: new Date()
    };
    
    setLiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  }, [currentUser]);

  const refreshFeed = useCallback(async () => {
    console.log('🔄 Refreshing social feed...');
    // Simulate feed refresh
  }, []);

  const getLeaderboard = useCallback(async (type: 'xp' | 'trades' | 'volume' | 'achievements') => {
    console.log(`📊 Fetching ${type} leaderboard...`);
    return onlineUsers.sort((a, b) => {
      switch (type) {
        case 'xp': return b.xp - a.xp;
        case 'trades': return b.stats.totalTrades - a.stats.totalTrades;
        case 'volume': return b.stats.totalVolume - a.stats.totalVolume;
        case 'achievements': return b.stats.achievements - a.stats.achievements;
        default: return 0;
      }
    });
  }, [onlineUsers]);

  // ========== CONTEXT VALUE ==========

  const contextValue: SocialContextType = {
    // User & Social State
    currentUser,
    friends,
    followers,
    following,
    onlineUsers,
    
    // Feed & Posts
    socialFeed,
    trendingPosts,
    userPosts,
    
    // Community Features
    communityStats,
    
    // Challenges & Competitions
    activeChallenges,
    upcomingChallenges,
    userChallenges,
    
    // Social Trading
    topTrades,
    followedTrades,
    copyTradingEnabled,
    
    // Guilds & Teams
    userGuild,
    availableGuilds,
    guildLeaderboard,
    
    // Real-time Features
    liveChat,
    
    // Actions
    updateProfile,
    followUser,
    unfollowUser,
    createPost,
    likePost,
    sharePost,
    joinChallenge,
    leaveChallenge,
    joinGuild,
    leaveGuild,
    copyTrade,
    sendChatMessage,
    refreshFeed,
    getLeaderboard
  };

  return (
    <SocialContext.Provider value={contextValue}>
      {children}
    </SocialContext.Provider>
  );
};

export default SocialProvider;

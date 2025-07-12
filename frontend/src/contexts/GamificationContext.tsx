/* ===== PHASE 3: ADVANCED GAMIFICATION SYSTEM ===== */
/* Achievement Engine, Progress Tracking & Reward Systems */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useMockWallet } from './MockWalletContext';

interface GamificationContextType {
  // Core Stats
  playerLevel: number;
  totalXP: number;
  currentXPProgress: number;
  nextLevelXP: number;
  
  // Achievement System
  achievements: Achievement[];
  unlockedAchievements: string[];
  checkAchievement: (id: string) => void;
  
  // Streak & Combo System
  dailyStreak: number;
  currentCombo: number;
  maxCombo: number;
  
  // Social Features
  socialRank: string;
  communityPoints: number;
  referralCount: number;
  
  // Rewards & Unlocks
  unlockedThemes: string[];
  unlockedFeatures: string[];
  pendingRewards: Reward[];
  claimReward: (id: string) => void;
  
  // Activity Tracking
  addXP: (amount: number, source: string) => void;
  recordActivity: (activity: ActivityType, metadata?: any) => void;
  
  // Leaderboard
  leaderboardPosition: number;
  nearbyPlayers: LeaderboardEntry[];
  
  // Challenges
  activeChallenges: Challenge[];
  completedChallenges: string[];
  startChallenge: (id: string) => void;
  completeChallenge: (id: string) => void;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'trading' | 'social' | 'exploration' | 'mastery' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  xpReward: number;
  requirements: {
    type: string;
    target: number;
    current?: number;
  };
  unlocks?: string[];
  hidden?: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'theme' | 'feature' | 'xp' | 'title' | 'particle_effect';
  value: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  claimed: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 1 | 2 | 3 | 4 | 5;
  progress: number;
  target: number;
  timeLimit: number; // hours
  xpReward: number;
  bonusRewards: Reward[];
  active: boolean;
  expires: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  xp: number;
  rank: number;
  avatar?: string;
  title?: string;
  badges: string[];
}

export type ActivityType = 
  | 'swap_executed' 
  | 'liquidity_added' 
  | 'vote_cast' 
  | 'referral_made' 
  | 'social_interaction'
  | 'theme_changed'
  | 'daily_login'
  | 'feature_unlocked';

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// Pre-defined achievements system
const ACHIEVEMENTS: Achievement[] = [
  // Trading Achievements
  {
    id: 'first_swap',
    name: 'First Trade',
    description: 'Execute your first token swap',
    icon: '🔄',
    category: 'trading',
    difficulty: 'bronze',
    xpReward: 100,
    requirements: { type: 'swaps_completed', target: 1 },
    unlocks: ['trading_novice_title']
  },
  {
    id: 'volume_warrior',
    name: 'Volume Warrior',
    description: 'Trade over $10,000 in total volume',
    icon: '💰',
    category: 'trading',
    difficulty: 'gold',
    xpReward: 1000,
    requirements: { type: 'total_volume', target: 10000 },
    unlocks: ['volume_warrior_title', 'golden_particles']
  },
  {
    id: 'liquidity_provider',
    name: 'Liquidity Lord',
    description: 'Provide liquidity to 5 different pools',
    icon: '🌊',
    category: 'trading',
    difficulty: 'silver',
    xpReward: 500,
    requirements: { type: 'pools_joined', target: 5 },
    unlocks: ['liquidity_lord_title', 'mystical_theme']
  },
  
  // Social Achievements
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Refer 10 friends to the platform',
    icon: '🦋',
    category: 'social',
    difficulty: 'gold',
    xpReward: 2000,
    requirements: { type: 'referrals_made', target: 10 },
    unlocks: ['social_butterfly_title', 'referral_master_badge']
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Reach top 10 on the leaderboard',
    icon: '👑',
    category: 'social',
    difficulty: 'platinum',
    xpReward: 5000,
    requirements: { type: 'leaderboard_rank', target: 10 },
    unlocks: ['community_leader_title', 'crown_particles', 'cosmic_theme']
  },
  
  // Exploration Achievements
  {
    id: 'explorer',
    name: 'Platform Explorer',
    description: 'Visit all platform sections',
    icon: '🗺️',
    category: 'exploration',
    difficulty: 'bronze',
    xpReward: 200,
    requirements: { type: 'sections_visited', target: 6 },
    unlocks: ['explorer_title']
  },
  {
    id: 'theme_collector',
    name: 'Theme Collector',
    description: 'Unlock and try all available themes',
    icon: '🎨',
    category: 'exploration',
    difficulty: 'silver',
    xpReward: 800,
    requirements: { type: 'themes_used', target: 6 },
    unlocks: ['theme_collector_title', 'rainbow_particles']
  },
  
  // Mastery Achievements
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day login streak',
    icon: '🔥',
    category: 'mastery',
    difficulty: 'gold',
    xpReward: 3000,
    requirements: { type: 'daily_streak', target: 30 },
    unlocks: ['streak_master_title', 'fire_particles']
  },
  {
    id: 'level_legend',
    name: 'Level Legend',
    description: 'Reach player level 50',
    icon: '⭐',
    category: 'mastery',
    difficulty: 'legendary',
    xpReward: 10000,
    requirements: { type: 'player_level', target: 50 },
    unlocks: ['legend_title', 'legendary_aura', 'shadow_theme']
  },
  
  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join during the beta phase',
    icon: '🌟',
    category: 'special',
    difficulty: 'platinum',
    xpReward: 5000,
    requirements: { type: 'join_date', target: 1 },
    unlocks: ['early_adopter_title', 'beta_badge', 'ethereal_theme'],
    hidden: false
  },
  {
    id: 'ultimate_trader',
    name: 'Ultimate Trader',
    description: 'Complete 1000 successful trades',
    icon: '💎',
    category: 'special',
    difficulty: 'legendary',
    xpReward: 25000,
    requirements: { type: 'successful_trades', target: 1000 },
    unlocks: ['ultimate_trader_title', 'diamond_particles', 'godmode_access']
  }
];

interface GamificationProviderProps {
  children: React.ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const { userStats, updateStats } = useMockWallet();
  
  // Core progression state
  const [playerLevel, setPlayerLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(['cult']);
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([]);
  const [pendingRewards, setPendingRewards] = useState<Reward[]>([]);
  
  // Social & streak state
  const [dailyStreak, setDailyStreak] = useState(1);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [communityPoints, setCommunityPoints] = useState(0);
  const [leaderboardPosition, setLeaderboardPosition] = useState(999);
  
  // Challenge system
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  // Calculate level progression
  const { currentXPProgress, nextLevelXP } = useMemo(() => {
    const xpForLevel = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));
    const currentLevelXP = totalXP;
    const nextLevel = playerLevel + 1;
    const xpForNext = xpForLevel(nextLevel);
    const xpForCurrent = xpForLevel(playerLevel);
    
    return {
      currentXPProgress: currentLevelXP - xpForCurrent,
      nextLevelXP: xpForNext - xpForCurrent
    };
  }, [totalXP, playerLevel]);

  // Social rank calculation
  const socialRank = useMemo(() => {
    if (leaderboardPosition <= 10) return 'Legendary';
    if (leaderboardPosition <= 50) return 'Master';
    if (leaderboardPosition <= 200) return 'Expert';
    if (leaderboardPosition <= 500) return 'Advanced';
    return 'Novice';
  }, [leaderboardPosition]);

  // Mock nearby players for leaderboard
  const nearbyPlayers = useMemo((): LeaderboardEntry[] => [
    {
      id: 'player1',
      username: 'CryptoNinja',
      level: playerLevel + 2,
      xp: totalXP + 5000,
      rank: Math.max(1, leaderboardPosition - 1),
      badges: ['early_adopter', 'volume_warrior']
    },
    {
      id: 'player2',
      username: 'DeFiMaster',
      level: playerLevel + 1,
      xp: totalXP + 2000,
      rank: Math.max(1, leaderboardPosition),
      badges: ['liquidity_provider']
    },
    {
      id: 'current',
      username: 'You',
      level: playerLevel,
      xp: totalXP,
      rank: leaderboardPosition + 1,
      badges: unlockedAchievements.slice(0, 3)
    },
    {
      id: 'player3',
      username: 'TokenHunter',
      level: Math.max(1, playerLevel - 1),
      xp: Math.max(0, totalXP - 1500),
      rank: leaderboardPosition + 2,
      badges: ['first_swap']
    }
  ], [playerLevel, totalXP, leaderboardPosition, unlockedAchievements]);

  // Add XP with level progression
  const addXP = useCallback((amount: number, source: string) => {
    const newTotalXP = totalXP + amount;
    setTotalXP(newTotalXP);
    
    // Check for level up
    const xpForLevel = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));
    let newLevel = playerLevel;
    
    while (newTotalXP >= xpForLevel(newLevel + 1)) {
      newLevel++;
    }
    
    if (newLevel > playerLevel) {
      setPlayerLevel(newLevel);
      console.log(`🎉 Level up! You are now level ${newLevel}!`);
      
      // Add level up reward
      const levelUpReward: Reward = {
        id: `level_${newLevel}`,
        name: `Level ${newLevel} Reward`,
        description: `Congratulations on reaching level ${newLevel}!`,
        type: 'xp',
        value: newLevel * 50,
        rarity: 'common',
        claimed: false
      };
      setPendingRewards(prev => [...prev, levelUpReward]);
    }
    
    console.log(`✨ +${amount} XP from ${source}`);
  }, [totalXP, playerLevel]);

  // Record activity and potentially award XP
  const recordActivity = useCallback((activity: ActivityType, metadata?: any) => {
    const xpRewards: Record<ActivityType, number> = {
      swap_executed: 50,
      liquidity_added: 100,
      vote_cast: 25,
      referral_made: 500,
      social_interaction: 10,
      theme_changed: 5,
      daily_login: 20,
      feature_unlocked: 100
    };
    
    const xpGain = xpRewards[activity] || 10;
    addXP(xpGain, activity.replace('_', ' '));
    
    // Update streak for daily login
    if (activity === 'daily_login') {
      setDailyStreak(prev => prev + 1);
    }
    
    // Update combo system for trading activities
    if (['swap_executed', 'liquidity_added'].includes(activity)) {
      setCurrentCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(current => Math.max(current, newCombo));
        return newCombo;
      });
    }
  }, [addXP]);

  // Check and unlock achievements
  const checkAchievement = useCallback((achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement || unlockedAchievements.includes(achievementId)) return;
    
    // Check if requirements are met (simplified logic)
    let requirementMet = false;
    const req = achievement.requirements;
    
    switch (req.type) {
      case 'swaps_completed':
        requirementMet = userStats.swapsCompleted >= req.target;
        break;
      case 'player_level':
        requirementMet = playerLevel >= req.target;
        break;
      case 'daily_streak':
        requirementMet = dailyStreak >= req.target;
        break;
      // Add more requirement checks as needed
      default:
        requirementMet = false;
    }
    
    if (requirementMet) {
      setUnlockedAchievements(prev => [...prev, achievementId]);
      addXP(achievement.xpReward, `Achievement: ${achievement.name}`);
      
      // Unlock rewards
      if (achievement.unlocks) {
        achievement.unlocks.forEach(unlock => {
          if (unlock.includes('theme')) {
            setUnlockedThemes(prev => [...prev, unlock.replace('_theme', '')]);
          } else if (unlock.includes('feature')) {
            setUnlockedFeatures(prev => [...prev, unlock]);
          }
        });
      }
      
      console.log(`🏆 Achievement unlocked: ${achievement.name}!`);
    }
  }, [unlockedAchievements, userStats, playerLevel, dailyStreak, addXP]);

  // Claim pending rewards
  const claimReward = useCallback((rewardId: string) => {
    setPendingRewards(prev => prev.filter(r => r.id !== rewardId));
    console.log(`🎁 Reward claimed: ${rewardId}`);
  }, []);

  // Challenge system functions
  const startChallenge = useCallback((challengeId: string) => {
    // Implementation for starting challenges
    console.log(`🎯 Challenge started: ${challengeId}`);
  }, []);

  const completeChallenge = useCallback((challengeId: string) => {
    setCompletedChallenges(prev => [...prev, challengeId]);
    console.log(`✅ Challenge completed: ${challengeId}`);
  }, []);

  // Initialize daily challenges
  useEffect(() => {
    const dailyChallenges: Challenge[] = [
      {
        id: 'daily_swap',
        name: 'Daily Trader',
        description: 'Complete 3 swaps today',
        type: 'daily',
        difficulty: 2,
        progress: 0,
        target: 3,
        timeLimit: 24,
        xpReward: 150,
        bonusRewards: [],
        active: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: 'daily_social',
        name: 'Social Engagement',
        description: 'Check leaderboard and social features',
        type: 'daily',
        difficulty: 1,
        progress: 0,
        target: 1,
        timeLimit: 24,
        xpReward: 50,
        bonusRewards: [],
        active: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];
    
    setActiveChallenges(dailyChallenges);
  }, []);

  // Auto-check common achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(achievement => {
      checkAchievement(achievement.id);
    });
  }, [checkAchievement, userStats, playerLevel, dailyStreak]);

  const value: GamificationContextType = {
    playerLevel,
    totalXP,
    currentXPProgress,
    nextLevelXP,
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    checkAchievement,
    dailyStreak,
    currentCombo,
    maxCombo,
    socialRank,
    communityPoints,
    referralCount: userStats.referralCount || 0,
    unlockedThemes,
    unlockedFeatures,
    pendingRewards,
    claimReward,
    addXP,
    recordActivity,
    leaderboardPosition,
    nearbyPlayers,
    activeChallenges,
    completedChallenges,
    startChallenge,
    completeChallenge
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export default GamificationProvider;

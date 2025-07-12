import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock Wallet Types
interface MockWallet {
  publicKey: string;
  isConnected: boolean;
  balance: number;
  disconnect: () => void;
  connect: () => Promise<void>;
}

interface MockWalletContextType {
  wallet: MockWallet | null;
  connecting: boolean;
  connected: boolean;
  publicKey: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  userStats: UserStats;
  updateStats: (updates: Partial<UserStats>) => void;
}

interface UserStats {
  xp: number;
  level: number;
  rank: string;
  swapsCompleted: number;
  totalVolume: number;
  achievements: string[];
  referralCode: string;
  cultTier: number;
}

const MockWalletContext = createContext<MockWalletContextType | null>(null);

// Mock wallet addresses for testing
const MOCK_WALLETS = [
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
];

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

export const MockWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<MockWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 1250,
    level: 3,
    rank: 'Acolyte',
    swapsCompleted: 12,
    totalVolume: 8500,
    achievements: ['first_swap', 'volume_1k'],
    referralCode: 'CULT-MYSTIC-7X9Z',
    cultTier: 3
  });

  // Enhanced auto-load wallet on app boot with stability checks
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const savedWallet = localStorage.getItem('nocturne_mock_wallet');
        const savedStats = localStorage.getItem('nocturne_user_stats');
        
        // Load saved stats first
        if (savedStats) {
          try {
            const parsedStats = JSON.parse(savedStats);
            setUserStats(parsedStats);
          } catch (error) {
            console.warn('Failed to parse saved user stats, using defaults');
          }
        }
        
        // Handle wallet connection
        if (savedWallet) {
          try {
            const walletData = JSON.parse(savedWallet);
            // Validate wallet data structure
            if (walletData.publicKey && typeof walletData.balance === 'number') {
              setWallet(walletData);
            } else {
              throw new Error('Invalid wallet data structure');
            }
          } catch (error) {
            console.warn('Saved wallet data corrupted, creating new wallet');
            localStorage.removeItem('nocturne_mock_wallet');
            await autoConnect();
          }
        } else {
          // Auto-connect for first-time users with delay
          await autoConnect();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Wallet initialization failed:', error);
        setIsInitialized(true);
      }
    };

    // Add delay to prevent flash of unloaded state
    const timer = setTimeout(initializeWallet, 500);
    return () => clearTimeout(timer);
  }, []);

  // Separate auto-connect function for better error handling
  const autoConnect = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Smooth loading
      await handleConnect();
    } catch (error) {
      console.warn('Auto-connect failed:', error);
    }
  };

  // Save to localStorage when stats change with error handling
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('nocturne_user_stats', JSON.stringify(userStats));
      } catch (error) {
        console.warn('Failed to save user stats to localStorage');
      }
    }
  }, [userStats, isInitialized]);

  const calculateRank = (xp: number) => {
    const rank = CULT_RANKS.slice().reverse().find(r => xp >= r.minXP);
    return rank || CULT_RANKS[0];
  };

  const handleConnect = async (): Promise<void> => {
    if (connecting) return; // Prevent double-connections
    
    setConnecting(true);
    
    try {
      // Simulate realistic connection delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockWallet: MockWallet = {
        publicKey: MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)],
        isConnected: true,
        balance: 2.5 + Math.random() * 10, // Random SOL balance (2.5-12.5)
        disconnect: handleDisconnect,
        connect: handleConnect
      };

      setWallet(mockWallet);
      
      // Safe localStorage save with error handling
      try {
        localStorage.setItem('nocturne_mock_wallet', JSON.stringify(mockWallet));
      } catch (error) {
        console.warn('Failed to save wallet to localStorage');
      }

      // Emit wallet connected event for other components
      window.dispatchEvent(new CustomEvent('walletConnected', { 
        detail: { publicKey: mockWallet.publicKey, balance: mockWallet.balance } 
      }));
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = (): void => {
    setWallet(null);
    
    try {
      localStorage.removeItem('nocturne_mock_wallet');
    } catch (error) {
      console.warn('Failed to remove wallet from localStorage');
    }
    
    // Emit wallet disconnected event
    window.dispatchEvent(new CustomEvent('walletDisconnected'));
  };

  const updateStats = (updates: Partial<UserStats>): void => {
    setUserStats(prev => {
      const newStats = { ...prev, ...updates };
      
      // Recalculate level and rank if XP changed
      if (updates.xp !== undefined) {
        const newRank = calculateRank(newStats.xp);
        newStats.level = newRank.level;
        newStats.rank = newRank.name;
        newStats.cultTier = Math.floor(newRank.level / 3) + 1;
      }
      
      return newStats;
    });
  };

  const contextValue: MockWalletContextType = {
    wallet,
    connecting,
    connected: !!wallet?.isConnected,
    publicKey: wallet?.publicKey || null,
    balance: wallet?.balance || 0,
    connect: handleConnect,
    disconnect: handleDisconnect,
    userStats,
    updateStats
  };

  return (
    <MockWalletContext.Provider value={contextValue}>
      {children}
    </MockWalletContext.Provider>
  );
};

export const useMockWallet = (): MockWalletContextType => {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error('useMockWallet must be used within a MockWalletProvider');
  }
  return context;
};

export default MockWalletContext;

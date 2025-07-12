import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Types for advanced trading features
export interface TradingPair {
  id: string;
  baseToken: string;
  quoteToken: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface LimitOrder {
  id: string;
  userId: string;
  pair: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  filledAmount: number;
}

export interface DCAOrder {
  id: string;
  userId: string;
  pair: string;
  totalAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  intervalAmount: number;
  remainingAmount: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  nextExecution: Date;
  executionHistory: DCAExecution[];
}

export interface DCAExecution {
  id: string;
  dcaOrderId: string;
  amount: number;
  price: number;
  executedAt: Date;
  status: 'success' | 'failed';
}

export interface TradingBot {
  id: string;
  name: string;
  strategy: 'grid' | 'dca' | 'arbitrage' | 'momentum';
  status: 'active' | 'paused' | 'stopped';
  profitLoss: number;
  trades: number;
  winRate: number;
  config: Record<string, any>;
}

export interface PortfolioAnalytics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  winRate: number;
  totalTrades: number;
  avgTradeSize: number;
  bestTrade: number;
  worstTrade: number;
  sharpeRatio: number;
  maxDrawdown: number;
  holdings: PortfolioHolding[];
}

export interface PortfolioHolding {
  token: string;
  amount: number;
  value: number;
  allocation: number;
  pnl: number;
  pnlPercentage: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number;
}

interface AdvancedTradingContextType {
  // Trading Pairs
  tradingPairs: TradingPair[];
  selectedPair: TradingPair | null;
  setSelectedPair: (pair: TradingPair) => void;
  
  // Limit Orders
  limitOrders: LimitOrder[];
  createLimitOrder: (order: Omit<LimitOrder, 'id' | 'status' | 'createdAt' | 'filledAmount'>) => Promise<void>;
  cancelLimitOrder: (orderId: string) => Promise<void>;
  
  // DCA Orders
  dcaOrders: DCAOrder[];
  createDCAOrder: (order: Omit<DCAOrder, 'id' | 'status' | 'createdAt' | 'executionHistory'>) => Promise<void>;
  pauseDCAOrder: (orderId: string) => Promise<void>;
  resumeDCAOrder: (orderId: string) => Promise<void>;
  cancelDCAOrder: (orderId: string) => Promise<void>;
  
  // Trading Bots
  tradingBots: TradingBot[];
  createTradingBot: (bot: Omit<TradingBot, 'id' | 'profitLoss' | 'trades' | 'winRate'>) => Promise<void>;
  startBot: (botId: string) => Promise<void>;
  stopBot: (botId: string) => Promise<void>;
  
  // Portfolio Analytics
  portfolioAnalytics: PortfolioAnalytics | null;
  refreshAnalytics: () => Promise<void>;
  
  // Technical Analysis
  technicalIndicators: TechnicalIndicator[];
  updateIndicators: (pair: string) => Promise<void>;
  
  // Risk Management
  riskSettings: {
    maxPositionSize: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    maxDailyLoss: number;
  };
  updateRiskSettings: (settings: Partial<typeof riskSettings>) => void;
  
  // Performance
  isLoading: boolean;
  error: string | null;
}

const AdvancedTradingContext = createContext<AdvancedTradingContextType | undefined>(undefined);

export const useAdvancedTrading = () => {
  const context = useContext(AdvancedTradingContext);
  if (!context) {
    throw new Error('useAdvancedTrading must be used within an AdvancedTradingProvider');
  }
  return context;
};

interface AdvancedTradingProviderProps {
  children: ReactNode;
}

export const AdvancedTradingProvider: React.FC<AdvancedTradingProviderProps> = ({ children }) => {
  // State management
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [limitOrders, setLimitOrders] = useState<LimitOrder[]>([]);
  const [dcaOrders, setDCAOrders] = useState<DCAOrder[]>([]);
  const [tradingBots, setTradingBots] = useState<TradingBot[]>([]);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [riskSettings, setRiskSettings] = useState({
    maxPositionSize: 10000, // USDC
    stopLossPercentage: 5,
    takeProfitPercentage: 15,
    maxDailyLoss: 1000 // USDC
  });

  // Initialize mock data
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = useCallback(() => {
    // Mock trading pairs
    const mockPairs: TradingPair[] = [
      {
        id: 'SOL-USDC',
        baseToken: 'SOL',
        quoteToken: 'USDC',
        price: 125.45,
        change24h: 3.2,
        volume24h: 1250000,
        high24h: 128.90,
        low24h: 121.30
      },
      {
        id: 'BTC-USDC',
        baseToken: 'BTC',
        quoteToken: 'USDC',
        price: 42350.75,
        change24h: -1.8,
        volume24h: 850000,
        high24h: 43100.00,
        low24h: 41800.50
      },
      {
        id: 'ETH-USDC',
        baseToken: 'ETH',
        quoteToken: 'USDC',
        price: 2645.32,
        change24h: 2.1,
        volume24h: 950000,
        high24h: 2680.00,
        low24h: 2590.15
      },
      {
        id: 'PEPE-USDC',
        baseToken: 'PEPE',
        quoteToken: 'USDC',
        price: 0.000012,
        change24h: 15.7,
        volume24h: 2100000,
        high24h: 0.000013,
        low24h: 0.000010
      }
    ];

    // Mock limit orders
    const mockLimitOrders: LimitOrder[] = [
      {
        id: 'limit-1',
        userId: 'user-1',
        pair: 'SOL-USDC',
        type: 'buy',
        amount: 10,
        price: 120.00,
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 86400000),
        filledAmount: 0
      },
      {
        id: 'limit-2',
        userId: 'user-1',
        pair: 'ETH-USDC',
        type: 'sell',
        amount: 2,
        price: 2700.00,
        status: 'pending',
        createdAt: new Date(Date.now() - 7200000),
        expiresAt: new Date(Date.now() + 172800000),
        filledAmount: 0
      }
    ];

    // Mock DCA orders
    const mockDCAOrders: DCAOrder[] = [
      {
        id: 'dca-1',
        userId: 'user-1',
        pair: 'BTC-USDC',
        totalAmount: 5000,
        frequency: 'weekly',
        intervalAmount: 500,
        remainingAmount: 4000,
        status: 'active',
        createdAt: new Date(Date.now() - 604800000),
        nextExecution: new Date(Date.now() + 86400000),
        executionHistory: [
          {
            id: 'exec-1',
            dcaOrderId: 'dca-1',
            amount: 500,
            price: 41800,
            executedAt: new Date(Date.now() - 604800000),
            status: 'success'
          },
          {
            id: 'exec-2',
            dcaOrderId: 'dca-1',
            amount: 500,
            price: 42100,
            executedAt: new Date(Date.now() - 172800000),
            status: 'success'
          }
        ]
      }
    ];

    // Mock trading bots
    const mockBots: TradingBot[] = [
      {
        id: 'bot-1',
        name: 'SOL Grid Bot',
        strategy: 'grid',
        status: 'active',
        profitLoss: 324.50,
        trades: 45,
        winRate: 73.3,
        config: {
          pair: 'SOL-USDC',
          gridLevels: 10,
          priceRange: { min: 100, max: 150 },
          investment: 2000
        }
      },
      {
        id: 'bot-2',
        name: 'PEPE Momentum',
        strategy: 'momentum',
        status: 'paused',
        profitLoss: -45.20,
        trades: 12,
        winRate: 41.7,
        config: {
          pair: 'PEPE-USDC',
          rsiThreshold: 70,
          investment: 500
        }
      }
    ];

    // Mock portfolio analytics
    const mockAnalytics: PortfolioAnalytics = {
      totalValue: 15420.50,
      totalPnL: 1420.50,
      totalPnLPercentage: 10.15,
      winRate: 68.5,
      totalTrades: 127,
      avgTradeSize: 245.30,
      bestTrade: 890.25,
      worstTrade: -156.80,
      sharpeRatio: 1.85,
      maxDrawdown: -8.2,
      holdings: [
        {
          token: 'SOL',
          amount: 45.5,
          value: 5709.75,
          allocation: 37.0,
          pnl: 545.30,
          pnlPercentage: 10.6
        },
        {
          token: 'BTC',
          amount: 0.125,
          value: 5293.84,
          allocation: 34.3,
          pnl: 293.84,
          pnlPercentage: 5.9
        },
        {
          token: 'ETH',
          amount: 1.8,
          value: 4761.58,
          allocation: 30.9,
          pnl: 461.58,
          pnlPercentage: 10.7
        },
        {
          token: 'USDC',
          amount: 655.33,
          value: 655.33,
          allocation: 4.3,
          pnl: 0,
          pnlPercentage: 0
        }
      ]
    };

    // Mock technical indicators
    const mockIndicators: TechnicalIndicator[] = [
      { name: 'RSI', value: 65.2, signal: 'buy', strength: 0.7 },
      { name: 'MACD', value: 2.45, signal: 'buy', strength: 0.8 },
      { name: 'Bollinger Bands', value: 0.85, signal: 'neutral', strength: 0.5 },
      { name: 'SMA 50/200', value: 1.05, signal: 'buy', strength: 0.6 },
      { name: 'Volume', value: 125.3, signal: 'buy', strength: 0.9 }
    ];

    setTradingPairs(mockPairs);
    setSelectedPair(mockPairs[0]);
    setLimitOrders(mockLimitOrders);
    setDCAOrders(mockDCAOrders);
    setTradingBots(mockBots);
    setPortfolioAnalytics(mockAnalytics);
    setTechnicalIndicators(mockIndicators);
  }, []);

  // Limit Orders Functions
  const createLimitOrder = useCallback(async (orderData: Omit<LimitOrder, 'id' | 'status' | 'createdAt' | 'filledAmount'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newOrder: LimitOrder = {
        ...orderData,
        id: `limit-${Date.now()}`,
        status: 'pending',
        createdAt: new Date(),
        filledAmount: 0
      };
      
      setLimitOrders(prev => [...prev, newOrder]);
      
      // Simulate order processing
      setTimeout(() => {
        console.log('Limit order created:', newOrder);
      }, 1000);
      
    } catch (err) {
      setError('Failed to create limit order');
      console.error('Error creating limit order:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelLimitOrder = useCallback(async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setLimitOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' as const }
            : order
        )
      );
      
      console.log('Limit order cancelled:', orderId);
      
    } catch (err) {
      setError('Failed to cancel limit order');
      console.error('Error cancelling limit order:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // DCA Functions
  const createDCAOrder = useCallback(async (orderData: Omit<DCAOrder, 'id' | 'status' | 'createdAt' | 'executionHistory'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newOrder: DCAOrder = {
        ...orderData,
        id: `dca-${Date.now()}`,
        status: 'active',
        createdAt: new Date(),
        executionHistory: []
      };
      
      setDCAOrders(prev => [...prev, newOrder]);
      console.log('DCA order created:', newOrder);
      
    } catch (err) {
      setError('Failed to create DCA order');
      console.error('Error creating DCA order:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseDCAOrder = useCallback(async (orderId: string) => {
    setDCAOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'paused' as const }
          : order
      )
    );
  }, []);

  const resumeDCAOrder = useCallback(async (orderId: string) => {
    setDCAOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'active' as const }
          : order
      )
    );
  }, []);

  const cancelDCAOrder = useCallback(async (orderId: string) => {
    setDCAOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const }
          : order
      )
    );
  }, []);

  // Trading Bot Functions
  const createTradingBot = useCallback(async (botData: Omit<TradingBot, 'id' | 'profitLoss' | 'trades' | 'winRate'>) => {
    const newBot: TradingBot = {
      ...botData,
      id: `bot-${Date.now()}`,
      profitLoss: 0,
      trades: 0,
      winRate: 0
    };
    
    setTradingBots(prev => [...prev, newBot]);
    console.log('Trading bot created:', newBot);
  }, []);

  const startBot = useCallback(async (botId: string) => {
    setTradingBots(prev => 
      prev.map(bot => 
        bot.id === botId 
          ? { ...bot, status: 'active' as const }
          : bot
      )
    );
  }, []);

  const stopBot = useCallback(async (botId: string) => {
    setTradingBots(prev => 
      prev.map(bot => 
        bot.id === botId 
          ? { ...bot, status: 'stopped' as const }
          : bot
      )
    );
  }, []);

  // Analytics Functions
  const refreshAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh analytics data (in real app, would fetch from API)
      console.log('Analytics refreshed');
    } catch (err) {
      setError('Failed to refresh analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Technical Analysis Functions
  const updateIndicators = useCallback(async (pair: string) => {
    setIsLoading(true);
    try {
      // Simulate indicator calculation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update indicators based on pair
      console.log('Technical indicators updated for:', pair);
    } catch (err) {
      setError('Failed to update technical indicators');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Risk Management
  const updateRiskSettings = useCallback((settings: Partial<typeof riskSettings>) => {
    setRiskSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const contextValue: AdvancedTradingContextType = {
    // Trading Pairs
    tradingPairs,
    selectedPair,
    setSelectedPair,
    
    // Limit Orders
    limitOrders,
    createLimitOrder,
    cancelLimitOrder,
    
    // DCA Orders
    dcaOrders,
    createDCAOrder,
    pauseDCAOrder,
    resumeDCAOrder,
    cancelDCAOrder,
    
    // Trading Bots
    tradingBots,
    createTradingBot,
    startBot,
    stopBot,
    
    // Portfolio Analytics
    portfolioAnalytics,
    refreshAnalytics,
    
    // Technical Analysis
    technicalIndicators,
    updateIndicators,
    
    // Risk Management
    riskSettings,
    updateRiskSettings,
    
    // Performance
    isLoading,
    error
  };

  return (
    <AdvancedTradingContext.Provider value={contextValue}>
      {children}
    </AdvancedTradingContext.Provider>
  );
};

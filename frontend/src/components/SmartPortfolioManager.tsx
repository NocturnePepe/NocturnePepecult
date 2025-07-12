import React, { useState, useEffect } from 'react';
import './SmartPortfolioManager.css';

interface Portfolio {
  totalValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  positions: Position[];
  allocation: AllocationSuggestion[];
  riskScore: number;
  performanceMetrics: PerformanceMetrics;
}

interface Position {
  id: string;
  symbol: string;
  amount: number;
  value: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  riskLevel: 'low' | 'medium' | 'high';
  aiScore: number;
  recommendation: 'hold' | 'buy' | 'sell' | 'rebalance';
}

interface AllocationSuggestion {
  symbol: string;
  current: number;
  suggested: number;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  action: 'increase' | 'decrease' | 'maintain';
}

interface PerformanceMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  alpha: number;
  beta: number;
  winRate: number;
}

interface RebalanceStrategy {
  id: string;
  name: string;
  description: string;
  expectedReturn: number;
  riskReduction: number;
  trades: RebalanceTrade[];
  confidence: number;
}

interface RebalanceTrade {
  symbol: string;
  action: 'buy' | 'sell';
  amount: number;
  percentage: number;
  reasoning: string;
}

interface AIInsight {
  type: 'optimization' | 'risk' | 'opportunity' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

const SmartPortfolioManager: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [rebalanceStrategies, setRebalanceStrategies] = useState<RebalanceStrategy[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [autoRebalanceEnabled, setAutoRebalanceEnabled] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  useEffect(() => {
    loadPortfolioData();
    generateAIInsights();
    const interval = setInterval(() => {
      updatePortfolioData();
      if (autoRebalanceEnabled) {
        checkAutoRebalance();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRebalanceEnabled, riskTolerance]);

  const loadPortfolioData = () => {
    // Mock portfolio data
    const mockPortfolio: Portfolio = {
      totalValue: 125000,
      dailyPnL: 2500,
      dailyPnLPercent: 2.04,
      riskScore: 65,
      positions: [
        {
          id: '1',
          symbol: 'SOL',
          amount: 500,
          value: 71175,
          entryPrice: 135.5,
          currentPrice: 142.35,
          pnl: 3425,
          pnlPercent: 5.05,
          allocation: 56.9,
          riskLevel: 'medium',
          aiScore: 82,
          recommendation: 'hold'
        },
        {
          id: '2',
          symbol: 'RAY',
          amount: 15000,
          value: 21000,
          entryPrice: 1.35,
          currentPrice: 1.40,
          pnl: 750,
          pnlPercent: 3.7,
          allocation: 16.8,
          riskLevel: 'high',
          aiScore: 75,
          recommendation: 'rebalance'
        },
        {
          id: '3',
          symbol: 'USDC',
          amount: 25000,
          value: 25000,
          entryPrice: 1.0,
          currentPrice: 1.0,
          pnl: 0,
          pnlPercent: 0,
          allocation: 20.0,
          riskLevel: 'low',
          aiScore: 60,
          recommendation: 'hold'
        },
        {
          id: '4',
          symbol: 'SRM',
          amount: 12000,
          value: 7825,
          entryPrice: 0.72,
          currentPrice: 0.652,
          pnl: -816,
          pnlPercent: -9.44,
          allocation: 6.3,
          riskLevel: 'high',
          aiScore: 45,
          recommendation: 'sell'
        }
      ],
      allocation: [
        {
          symbol: 'SOL',
          current: 56.9,
          suggested: 45.0,
          reasoning: 'Overexposed to SOL, reduce for better diversification',
          priority: 'medium',
          action: 'decrease'
        },
        {
          symbol: 'RAY',
          current: 16.8,
          suggested: 20.0,
          reasoning: 'Strong fundamentals, increase allocation',
          priority: 'high',
          action: 'increase'
        },
        {
          symbol: 'USDC',
          current: 20.0,
          suggested: 25.0,
          reasoning: 'Market volatility increasing, maintain higher cash position',
          priority: 'medium',
          action: 'increase'
        },
        {
          symbol: 'SRM',
          current: 6.3,
          suggested: 3.0,
          reasoning: 'Underperforming asset, reduce exposure',
          priority: 'high',
          action: 'decrease'
        }
      ],
      performanceMetrics: {
        sharpeRatio: 1.85,
        maxDrawdown: -12.5,
        volatility: 24.8,
        alpha: 8.5,
        beta: 1.15,
        winRate: 68.5
      }
    };

    setPortfolio(mockPortfolio);
  };

  const updatePortfolioData = () => {
    if (!portfolio) return;
    
    // Simulate real-time price updates
    const updatedPositions = portfolio.positions.map(position => {
      const priceChange = (Math.random() - 0.5) * 0.02; // ±1% change
      const newPrice = position.currentPrice * (1 + priceChange);
      const newValue = position.amount * newPrice;
      const newPnL = (newPrice - position.entryPrice) * position.amount;
      const newPnLPercent = ((newPrice - position.entryPrice) / position.entryPrice) * 100;
      
      return {
        ...position,
        currentPrice: newPrice,
        value: newValue,
        pnl: newPnL,
        pnlPercent: newPnLPercent
      };
    });

    const totalValue = updatedPositions.reduce((sum, pos) => sum + pos.value, 0);
    const totalPnL = updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    const dailyPnLPercent = (totalPnL / (totalValue - totalPnL)) * 100;

    setPortfolio(prev => prev ? {
      ...prev,
      positions: updatedPositions,
      totalValue,
      dailyPnL: totalPnL,
      dailyPnLPercent
    } : null);
  };

  const generateAIInsights = () => {
    const insights: AIInsight[] = [
      {
        type: 'optimization',
        title: 'Portfolio Rebalancing Opportunity',
        description: 'Your SOL allocation is 11.9% above optimal. Consider rebalancing to improve risk-adjusted returns.',
        confidence: 87,
        impact: 'medium',
        actionable: true
      },
      {
        type: 'risk',
        title: 'Concentration Risk Alert',
        description: 'Over 56% of portfolio in SOL. Diversification recommended to reduce single-asset exposure.',
        confidence: 92,
        impact: 'high',
        actionable: true
      },
      {
        type: 'opportunity',
        title: 'Market Opportunity Detected',
        description: 'RAY showing strong momentum with low correlation to SOL. Consider increasing allocation.',
        confidence: 74,
        impact: 'medium',
        actionable: true
      },
      {
        type: 'alert',
        title: 'Performance Alert',
        description: 'SRM position underperforming by -9.44%. Review and consider exit strategy.',
        confidence: 89,
        impact: 'high',
        actionable: true
      }
    ];

    setAiInsights(insights);
  };

  const generateRebalanceStrategies = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const strategies: RebalanceStrategy[] = [
      {
        id: 'conservative',
        name: 'Conservative Rebalancing',
        description: 'Minimize risk while maintaining growth potential',
        expectedReturn: 12.5,
        riskReduction: 15.3,
        confidence: 89,
        trades: [
          {
            symbol: 'SOL',
            action: 'sell',
            amount: 75,
            percentage: -11.9,
            reasoning: 'Reduce overexposure to maintain balanced risk profile'
          },
          {
            symbol: 'USDC',
            action: 'buy',
            amount: 5000,
            percentage: 5.0,
            reasoning: 'Increase cash position for stability'
          }
        ]
      },
      {
        id: 'growth',
        name: 'Growth-Optimized Strategy',
        description: 'Maximize expected returns with controlled risk',
        expectedReturn: 18.7,
        riskReduction: 8.2,
        confidence: 82,
        trades: [
          {
            symbol: 'RAY',
            action: 'buy',
            amount: 2500,
            percentage: 3.2,
            reasoning: 'Strong growth potential with improving fundamentals'
          },
          {
            symbol: 'SRM',
            action: 'sell',
            amount: 4000,
            percentage: -3.3,
            reasoning: 'Underperforming asset, reallocate to better opportunities'
          }
        ]
      },
      {
        id: 'balanced',
        name: 'AI-Optimized Balance',
        description: 'Perfect balance of growth and risk management',
        expectedReturn: 15.8,
        riskReduction: 12.1,
        confidence: 94,
        trades: [
          {
            symbol: 'SOL',
            action: 'sell',
            amount: 50,
            percentage: -7.9,
            reasoning: 'Optimize allocation while maintaining strong position'
          },
          {
            symbol: 'RAY',
            action: 'buy',
            amount: 1500,
            percentage: 2.0,
            reasoning: 'Increase allocation to high-potential asset'
          },
          {
            symbol: 'USDC',
            action: 'buy',
            amount: 3000,
            percentage: 3.0,
            reasoning: 'Maintain liquidity for market opportunities'
          }
        ]
      }
    ];

    setRebalanceStrategies(strategies);
    setIsOptimizing(false);
  };

  const executeRebalance = (strategyId: string) => {
    const strategy = rebalanceStrategies.find(s => s.id === strategyId);
    if (!strategy) return;

    // In a real implementation, this would execute trades
    console.log('Executing rebalance strategy:', strategy);
    alert(`Rebalancing strategy "${strategy.name}" executed successfully!`);
  };

  const checkAutoRebalance = () => {
    if (!portfolio) return;
    
    // Check if portfolio drift exceeds threshold
    const driftThreshold = 5; // 5% drift threshold
    const significantDrift = portfolio.allocation.some(alloc => 
      Math.abs(alloc.current - alloc.suggested) > driftThreshold
    );

    if (significantDrift) {
      console.log('Auto-rebalance triggered due to portfolio drift');
      // Execute conservative rebalancing automatically
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return '⚡';
      case 'risk': return '⚠️';
      case 'opportunity': return '💡';
      case 'alert': return '🚨';
      default: return '📊';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9c88ff';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!portfolio) {
    return <div className="loading">Loading portfolio data...</div>;
  }

  return (
    <div className="smart-portfolio-manager">
      <div className="portfolio-header">
        <h2 className="ai-title">🎯 Smart Portfolio Manager</h2>
        <div className="portfolio-controls">
          <select 
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value as any)}
            className="risk-selector"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
          <label className="auto-rebalance-toggle">
            <input 
              type="checkbox"
              checked={autoRebalanceEnabled}
              onChange={(e) => setAutoRebalanceEnabled(e.target.checked)}
            />
            Auto-Rebalance
          </label>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="portfolio-overview">
        <div className="overview-stats">
          <div className="stat-card total-value">
            <h3>Total Portfolio Value</h3>
            <div className="stat-value">{formatCurrency(portfolio.totalValue)}</div>
            <div className={`stat-change ${portfolio.dailyPnL >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(portfolio.dailyPnL)} ({formatPercentage(portfolio.dailyPnLPercent)})
            </div>
          </div>
          <div className="stat-card risk-score">
            <h3>AI Risk Score</h3>
            <div className="stat-value">{portfolio.riskScore}/100</div>
            <div className="risk-indicator">
              <div 
                className="risk-bar"
                style={{ width: `${portfolio.riskScore}%` }}
              ></div>
            </div>
          </div>
          <div className="stat-card performance">
            <h3>Sharpe Ratio</h3>
            <div className="stat-value">{portfolio.performanceMetrics.sharpeRatio}</div>
            <div className="performance-details">
              Alpha: {portfolio.performanceMetrics.alpha}% | Beta: {portfolio.performanceMetrics.beta}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights-section">
        <h3>🤖 AI Portfolio Insights</h3>
        <div className="insights-grid">
          {aiInsights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <div className="insight-header">
                <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                <h4>{insight.title}</h4>
                <span 
                  className="impact-badge"
                  style={{ backgroundColor: getImpactColor(insight.impact) }}
                >
                  {insight.impact}
                </span>
              </div>
              <p className="insight-description">{insight.description}</p>
              <div className="insight-footer">
                <span className="confidence">Confidence: {insight.confidence}%</span>
                {insight.actionable && (
                  <button className="action-btn">Take Action</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Positions */}
      <div className="positions-section">
        <h3>📈 Current Positions</h3>
        <div className="positions-table">
          {portfolio.positions.map(position => (
            <div key={position.id} className="position-row">
              <div className="position-info">
                <div className="position-symbol">{position.symbol}</div>
                <div className="position-amount">{position.amount.toLocaleString()}</div>
              </div>
              <div className="position-value">
                <div className="current-value">{formatCurrency(position.value)}</div>
                <div className="allocation">{position.allocation.toFixed(1)}%</div>
              </div>
              <div className={`position-pnl ${position.pnl >= 0 ? 'positive' : 'negative'}`}>
                <div className="pnl-amount">{formatCurrency(position.pnl)}</div>
                <div className="pnl-percent">{formatPercentage(position.pnlPercent)}</div>
              </div>
              <div className="position-metrics">
                <div className="ai-score">AI Score: {position.aiScore}/100</div>
                <div className={`recommendation ${position.recommendation}`}>
                  {position.recommendation.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rebalancing Strategies */}
      <div className="rebalancing-section">
        <div className="rebalancing-header">
          <h3>🔄 AI Rebalancing Strategies</h3>
          <button 
            onClick={generateRebalanceStrategies}
            disabled={isOptimizing}
            className="optimize-btn"
          >
            {isOptimizing ? '🧠 Optimizing...' : '⚡ Generate Strategies'}
          </button>
        </div>

        {isOptimizing ? (
          <div className="optimization-loading">
            <div className="ai-brain">
              <div className="brain-pulse"></div>
            </div>
            <p>AI analyzing market conditions and portfolio optimization...</p>
          </div>
        ) : (
          <div className="strategies-grid">
            {rebalanceStrategies.map(strategy => (
              <div key={strategy.id} className="strategy-card">
                <div className="strategy-header">
                  <h4>{strategy.name}</h4>
                  <div className="strategy-confidence">
                    Confidence: {strategy.confidence}%
                  </div>
                </div>
                <p className="strategy-description">{strategy.description}</p>
                <div className="strategy-metrics">
                  <div className="metric">
                    <span className="metric-label">Expected Return:</span>
                    <span className="metric-value">+{strategy.expectedReturn}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Risk Reduction:</span>
                    <span className="metric-value">-{strategy.riskReduction}%</span>
                  </div>
                </div>
                <div className="strategy-trades">
                  <h5>Required Trades:</h5>
                  {strategy.trades.map((trade, idx) => (
                    <div key={idx} className={`trade-item ${trade.action}`}>
                      <span className="trade-action">{trade.action.toUpperCase()}</span>
                      <span className="trade-symbol">{trade.symbol}</span>
                      <span className="trade-amount">{trade.amount}</span>
                      <span className="trade-percentage">({formatPercentage(trade.percentage)})</span>
                    </div>
                  ))}
                </div>
                <button 
                  className="execute-btn"
                  onClick={() => executeRebalance(strategy.id)}
                >
                  Execute Strategy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartPortfolioManager;

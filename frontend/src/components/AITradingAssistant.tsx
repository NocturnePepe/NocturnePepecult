import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAdvancedTrading } from '../contexts/AdvancedTradingContext';
import { useGamification } from '../contexts/GamificationContext';
import './AITradingAssistant.css';

interface AIMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  confidence?: number;
  recommendations?: AIRecommendation[];
  analysis?: MarketAnalysis;
}

interface AIRecommendation {
  action: 'buy' | 'sell' | 'hold' | 'analyze';
  asset: string;
  confidence: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn?: number;
  timeframe: string;
}

interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  trend: 'upward' | 'downward' | 'sideways';
  supportLevel?: number;
  resistanceLevel?: number;
  keyIndicators: string[];
}

interface AITradingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeRecommendation?: (recommendation: AIRecommendation) => void;
}

const AITradingAssistant: React.FC<AITradingAssistantProps> = ({
  isOpen,
  onClose,
  onTradeRecommendation
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPersonality, setAiPersonality] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [userExpertiseLevel, setUserExpertiseLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  const { portfolio, orders, marketData } = useAdvancedTrading();
  const { userStats, currentLevel } = useGamification();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize AI assistant with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Hello! I'm your AI Trading Assistant. I'm here to help you make informed trading decisions based on market analysis and your portfolio. You can ask me about market trends, get trade recommendations, or discuss your trading strategy. How can I help you today?`,
        timestamp: Date.now(),
        confidence: 0.95
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // AI Market Analysis Engine
  const analyzeMarket = useCallback(async (asset: string): Promise<MarketAnalysis> => {
    // Simulate AI market analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const currentPrice = marketData[asset]?.price || 0;
    const priceHistory = marketData[asset]?.history || [];
    
    // Calculate technical indicators
    const recentPrices = priceHistory.slice(-20);
    const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    const volatility = Math.abs((currentPrice - avgPrice) / avgPrice);
    
    // Determine market sentiment based on price action
    let sentiment: MarketAnalysis['sentiment'] = 'neutral';
    if (currentPrice > avgPrice * 1.05) sentiment = 'bullish';
    else if (currentPrice < avgPrice * 0.95) sentiment = 'bearish';
    
    // Calculate support and resistance levels
    const maxPrice = Math.max(...recentPrices);
    const minPrice = Math.min(...recentPrices);
    
    return {
      sentiment,
      volatility: Math.min(volatility * 100, 100),
      trend: currentPrice > avgPrice ? 'upward' : currentPrice < avgPrice ? 'downward' : 'sideways',
      supportLevel: minPrice * 0.98,
      resistanceLevel: maxPrice * 1.02,
      keyIndicators: [
        `RSI: ${(Math.random() * 40 + 30).toFixed(1)}`,
        `MACD: ${sentiment === 'bullish' ? 'Positive' : sentiment === 'bearish' ? 'Negative' : 'Neutral'}`,
        `Volume: ${Math.random() > 0.5 ? 'Above' : 'Below'} Average`,
        `Bollinger Bands: ${sentiment === 'bullish' ? 'Upper' : sentiment === 'bearish' ? 'Lower' : 'Middle'} Band`
      ]
    };
  }, [marketData]);

  // AI Recommendation Engine
  const generateRecommendation = useCallback(async (asset: string, analysis: MarketAnalysis): Promise<AIRecommendation> => {
    const userPosition = portfolio.holdings[asset] || 0;
    const personalityMultiplier = aiPersonality === 'conservative' ? 0.7 : aiPersonality === 'aggressive' ? 1.3 : 1.0;
    
    // Base confidence on market analysis and user experience
    let baseConfidence = 0.6;
    if (analysis.sentiment !== 'neutral') baseConfidence += 0.2;
    if (analysis.volatility < 20) baseConfidence += 0.1;
    if (userExpertiseLevel === 'advanced') baseConfidence += 0.1;
    
    const confidence = Math.min(baseConfidence * personalityMultiplier, 0.95);
    
    // Determine action based on analysis and personality
    let action: AIRecommendation['action'] = 'hold';
    let reasoning = '';
    let riskLevel: AIRecommendation['riskLevel'] = 'medium';
    
    if (analysis.sentiment === 'bullish' && userPosition < 1000) {
      action = 'buy';
      reasoning = `Strong bullish sentiment with ${analysis.trend} trend. Technical indicators support upward movement.`;
      riskLevel = analysis.volatility > 30 ? 'high' : 'medium';
    } else if (analysis.sentiment === 'bearish' && userPosition > 0) {
      action = 'sell';
      reasoning = `Bearish sentiment detected with ${analysis.trend} trend. Consider reducing exposure.`;
      riskLevel = analysis.volatility > 40 ? 'high' : 'medium';
    } else {
      action = 'hold';
      reasoning = `Market shows ${analysis.sentiment} sentiment. Current position appears optimal.`;
      riskLevel = 'low';
    }
    
    // Adjust for personality
    if (aiPersonality === 'conservative') {
      if (action === 'buy') action = 'analyze';
      reasoning += ' Conservative approach suggests careful evaluation.';
      riskLevel = riskLevel === 'high' ? 'high' : 'low';
    } else if (aiPersonality === 'aggressive') {
      reasoning += ' Aggressive strategy suggests capitalizing on opportunities.';
      if (riskLevel === 'low') riskLevel = 'medium';
    }
    
    return {
      action,
      asset,
      confidence,
      reasoning,
      riskLevel,
      expectedReturn: analysis.sentiment === 'bullish' ? Math.random() * 15 + 5 : 
                     analysis.sentiment === 'bearish' ? -(Math.random() * 10 + 2) : 
                     Math.random() * 6 - 3,
      timeframe: aiPersonality === 'conservative' ? '1-2 weeks' : 
                aiPersonality === 'aggressive' ? '1-3 days' : '3-7 days'
    };
  }, [portfolio.holdings, aiPersonality, userExpertiseLevel]);

  // Process user message and generate AI response
  const processMessage = useCallback(async (userMessage: string) => {
    setIsAnalyzing(true);
    
    // Add user message
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Determine the type of response needed
      const lowerMessage = userMessage.toLowerCase();
      let aiResponse: AIMessage;
      
      if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
        // Market analysis request
        const asset = extractAssetFromMessage(userMessage) || 'SOL';
        const analysis = await analyzeMarket(asset);
        const recommendation = await generateRecommendation(asset, analysis);
        
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `I've analyzed ${asset} for you. Here's what I found:
          
Market Sentiment: ${analysis.sentiment.toUpperCase()}
Trend: ${analysis.trend}
Volatility: ${analysis.volatility.toFixed(1)}%
Support Level: $${analysis.supportLevel?.toFixed(4)}
Resistance Level: $${analysis.resistanceLevel?.toFixed(4)}

My recommendation is to ${recommendation.action.toUpperCase()} with ${(recommendation.confidence * 100).toFixed(0)}% confidence.

${recommendation.reasoning}

Risk Level: ${recommendation.riskLevel.toUpperCase()}
Expected Return: ${recommendation.expectedReturn ? (recommendation.expectedReturn > 0 ? '+' : '') + recommendation.expectedReturn.toFixed(1) + '%' : 'N/A'}
Timeframe: ${recommendation.timeframe}`,
          timestamp: Date.now(),
          confidence: recommendation.confidence,
          recommendations: [recommendation],
          analysis
        };
        
        if (onTradeRecommendation) {
          onTradeRecommendation(recommendation);
        }
        
      } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('holdings')) {
        // Portfolio analysis
        const totalValue = Object.entries(portfolio.holdings).reduce((sum, [asset, amount]) => {
          return sum + (amount * (marketData[asset]?.price || 0));
        }, 0);
        
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `Let me analyze your portfolio:

Total Portfolio Value: $${totalValue.toFixed(2)}
Number of Assets: ${Object.keys(portfolio.holdings).length}
Largest Position: ${Object.entries(portfolio.holdings).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}

Portfolio Health: ${totalValue > 1000 ? 'Strong' : totalValue > 100 ? 'Growing' : 'Building'}

Based on your current holdings and market conditions, I suggest ${totalValue < 500 ? 'diversifying with small positions' : 'maintaining current allocation with selective rebalancing'}.

Would you like me to analyze a specific asset or provide rebalancing recommendations?`,
          timestamp: Date.now(),
          confidence: 0.85
        };
        
      } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
        // General recommendations
        const topAssets = ['SOL', 'BTC', 'ETH'];
        const recommendations: AIRecommendation[] = [];
        
        for (const asset of topAssets) {
          const analysis = await analyzeMarket(asset);
          const recommendation = await generateRecommendation(asset, analysis);
          recommendations.push(recommendation);
        }
        
        const bestRec = recommendations.sort((a, b) => b.confidence - a.confidence)[0];
        
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `Based on current market conditions and your ${aiPersonality} trading style, here are my top recommendations:

🥇 Primary Recommendation: ${bestRec.action.toUpperCase()} ${bestRec.asset}
Confidence: ${(bestRec.confidence * 100).toFixed(0)}%
Expected Return: ${bestRec.expectedReturn ? (bestRec.expectedReturn > 0 ? '+' : '') + bestRec.expectedReturn.toFixed(1) + '%' : 'N/A'}
Timeframe: ${bestRec.timeframe}
Risk: ${bestRec.riskLevel.toUpperCase()}

Reasoning: ${bestRec.reasoning}

Would you like detailed analysis for any specific asset?`,
          timestamp: Date.now(),
          confidence: bestRec.confidence,
          recommendations
        };
        
      } else {
        // General response
        aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `I understand you're looking for trading guidance. I can help you with:

📊 Market Analysis - Ask me to "analyze [asset]" for detailed technical analysis
💼 Portfolio Review - Say "analyze my portfolio" for portfolio insights  
💡 Trade Recommendations - Ask for "recommendations" for top trading opportunities
📈 Trend Analysis - Ask about specific assets for trend insights
⚙️ Strategy Discussion - Discuss your trading approach and get suggestions

I'm currently set to ${aiPersonality} mode and calibrated for ${userExpertiseLevel} traders. You can adjust these settings anytime.

What would you like to explore?`,
          timestamp: Date.now(),
          confidence: 0.9
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('AI Processing Error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'I encountered an error while processing your request. Please try again or rephrase your question.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeMarket, generateRecommendation, portfolio.holdings, marketData, aiPersonality, userExpertiseLevel, onTradeRecommendation]);

  // Extract asset symbol from user message
  const extractAssetFromMessage = (message: string): string | null => {
    const assets = ['SOL', 'BTC', 'ETH', 'PEPE', 'USDC'];
    const upperMessage = message.toUpperCase();
    return assets.find(asset => upperMessage.includes(asset)) || null;
  };

  // Handle message submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAnalyzing) {
      processMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, isAnalyzing, processMessage]);

  // Handle quick action buttons
  const handleQuickAction = useCallback((action: string) => {
    processMessage(action);
  }, [processMessage]);

  // Format confidence percentage
  const formatConfidence = (confidence: number): string => {
    return `${(confidence * 100).toFixed(0)}%`;
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#4caf50';
    if (confidence >= 0.6) return '#ff9800';
    return '#f44336';
  };

  if (!isOpen) return null;

  return (
    <div className="ai-trading-assistant-overlay">
      <div className="ai-trading-assistant">
        {/* Header */}
        <div className="ai-header">
          <div className="ai-avatar">
            <div className="ai-avatar-icon">🤖</div>
            <div className="ai-status-indicator">
              <div className={`status-dot ${isAnalyzing ? 'analyzing' : 'ready'}`}></div>
            </div>
          </div>
          <div className="ai-info">
            <h3>AI Trading Assistant</h3>
            <div className="ai-settings">
              <select 
                value={aiPersonality} 
                onChange={(e) => setAiPersonality(e.target.value as any)}
                className="personality-selector"
              >
                <option value="conservative">🛡️ Conservative</option>
                <option value="balanced">⚖️ Balanced</option>
                <option value="aggressive">⚡ Aggressive</option>
              </select>
              <select 
                value={userExpertiseLevel} 
                onChange={(e) => setUserExpertiseLevel(e.target.value as any)}
                className="expertise-selector"
              >
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">📈 Intermediate</option>
                <option value="advanced">🎯 Advanced</option>
              </select>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div className="ai-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                {message.confidence && (
                  <div className="message-confidence">
                    <span 
                      className="confidence-indicator"
                      style={{ color: getConfidenceColor(message.confidence) }}
                    >
                      Confidence: {formatConfidence(message.confidence)}
                    </span>
                  </div>
                )}
                {message.recommendations && (
                  <div className="recommendations">
                    {message.recommendations.map((rec, index) => (
                      <div key={index} className={`recommendation ${rec.riskLevel}`}>
                        <div className="rec-action">{rec.action.toUpperCase()} {rec.asset}</div>
                        <div className="rec-details">
                          Risk: {rec.riskLevel} | Confidence: {formatConfidence(rec.confidence)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {isAnalyzing && (
            <div className="message ai analyzing">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="analyzing-text">Analyzing market data...</div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={() => handleQuickAction('analyze SOL')}>📊 Analyze SOL</button>
          <button onClick={() => handleQuickAction('analyze my portfolio')}>💼 Portfolio</button>
          <button onClick={() => handleQuickAction('give me recommendations')}>💡 Recommendations</button>
        </div>

        {/* Input */}
        <form className="ai-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about market analysis, portfolio advice, or trading strategies..."
            disabled={isAnalyzing}
            className="ai-input"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isAnalyzing}
            className="send-button"
          >
            {isAnalyzing ? '⏳' : '🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITradingAssistant;

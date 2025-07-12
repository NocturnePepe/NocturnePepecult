import React, { useState, useEffect } from 'react';
import './MarketIntelligence.css';

interface MarketTrend {
  id: string;
  topic: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  sources: string[];
  description: string;
  timestamp: Date;
}

interface NewsAnalysis {
  id: string;
  headline: string;
  summary: string;
  sentiment: number; // -1 to 1
  relevance: number; // 0 to 1
  source: string;
  timestamp: Date;
  priceImpact: 'bullish' | 'bearish' | 'neutral';
}

interface SocialSentiment {
  platform: string;
  sentiment: number;
  volume: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  topKeywords: string[];
  influencerScore: number;
}

interface WhaleActivity {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  value: number;
  asset: string;
  exchange?: string;
  timestamp: Date;
  walletTag?: string;
  impact: 'low' | 'medium' | 'high';
}

interface MacroEvent {
  id: string;
  type: 'economic' | 'regulatory' | 'technical' | 'adoption';
  title: string;
  description: string;
  date: Date;
  importance: 'low' | 'medium' | 'high';
  expectedImpact: 'bullish' | 'bearish' | 'neutral';
  affectedAssets: string[];
}

const MarketIntelligence: React.FC = () => {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [newsAnalysis, setNewsAnalysis] = useState<NewsAnalysis[]>([]);
  const [socialSentiment, setSocialSentiment] = useState<SocialSentiment[]>([]);
  const [whaleActivity, setWhaleActivity] = useState<WhaleActivity[]>([]);
  const [macroEvents, setMacroEvents] = useState<MacroEvent[]>([]);
  const [overallSentiment, setOverallSentiment] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');

  useEffect(() => {
    loadMarketIntelligence();
    const interval = setInterval(loadMarketIntelligence, 30000);
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadMarketIntelligence = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock market trends
    const trends: MarketTrend[] = [
      {
        id: '1',
        topic: 'Solana DeFi Expansion',
        sentiment: 'positive',
        impact: 'high',
        confidence: 89,
        sources: ['DeFiLlama', 'CoinGecko', 'Twitter'],
        description: 'Growing TVL and new protocol launches driving positive sentiment',
        timestamp: new Date()
      },
      {
        id: '2',
        topic: 'Regulatory Clarity',
        sentiment: 'positive',
        impact: 'medium',
        confidence: 76,
        sources: ['Reuters', 'CoinDesk', 'SEC Filing'],
        description: 'Improved regulatory framework providing market confidence',
        timestamp: new Date()
      },
      {
        id: '3',
        topic: 'Market Volatility Concerns',
        sentiment: 'negative',
        impact: 'medium',
        confidence: 67,
        sources: ['Bloomberg', 'CNBC', 'Fed Minutes'],
        description: 'Macroeconomic uncertainties affecting risk appetite',
        timestamp: new Date()
      }
    ];

    // Generate mock news analysis
    const news: NewsAnalysis[] = [
      {
        id: '1',
        headline: 'Major DeFi Protocol Announces Solana Integration',
        summary: 'Leading DeFi platform expands to Solana, expecting significant TVL growth',
        sentiment: 0.8,
        relevance: 0.9,
        source: 'DeFi Pulse',
        timestamp: new Date(),
        priceImpact: 'bullish'
      },
      {
        id: '2',
        headline: 'Crypto Exchange Reports Record Trading Volume',
        summary: 'Major exchange sees 300% increase in Solana-based token trading',
        sentiment: 0.6,
        relevance: 0.7,
        source: 'CoinTelegraph',
        timestamp: new Date(),
        priceImpact: 'bullish'
      },
      {
        id: '3',
        headline: 'Market Analysts Warn of Correction Risk',
        summary: 'Technical indicators suggest potential short-term price correction',
        sentiment: -0.4,
        relevance: 0.8,
        source: 'CryptoNews',
        timestamp: new Date(),
        priceImpact: 'bearish'
      }
    ];

    // Generate mock social sentiment
    const social: SocialSentiment[] = [
      {
        platform: 'Twitter',
        sentiment: 0.7,
        volume: 15420,
        trend: 'increasing',
        topKeywords: ['DeFi', 'bullish', 'moon', 'adoption'],
        influencerScore: 82
      },
      {
        platform: 'Reddit',
        sentiment: 0.6,
        volume: 8930,
        trend: 'stable',
        topKeywords: ['hodl', 'staking', 'yield', 'ecosystem'],
        influencerScore: 74
      },
      {
        platform: 'Discord',
        sentiment: 0.5,
        volume: 3210,
        trend: 'decreasing',
        topKeywords: ['trading', 'analysis', 'technical', 'support'],
        influencerScore: 68
      }
    ];

    // Generate mock whale activity
    const whales: WhaleActivity[] = [
      {
        id: '1',
        type: 'buy',
        amount: 50000,
        value: 7117500,
        asset: 'SOL',
        exchange: 'Binance',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        walletTag: 'Institutional Investor',
        impact: 'high'
      },
      {
        id: '2',
        type: 'transfer',
        amount: 25000,
        value: 3558750,
        asset: 'SOL',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        walletTag: 'Unknown Whale',
        impact: 'medium'
      },
      {
        id: '3',
        type: 'sell',
        amount: 15000,
        value: 2135250,
        asset: 'SOL',
        exchange: 'FTX',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        impact: 'low'
      }
    ];

    // Generate mock macro events
    const events: MacroEvent[] = [
      {
        id: '1',
        type: 'economic',
        title: 'Federal Reserve Interest Rate Decision',
        description: 'FOMC meeting outcome affects crypto market liquidity',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        importance: 'high',
        expectedImpact: 'bearish',
        affectedAssets: ['SOL', 'BTC', 'ETH']
      },
      {
        id: '2',
        type: 'adoption',
        title: 'Major Payment Processor Crypto Integration',
        description: 'Large payment company announces crypto payment support',
        date: new Date(Date.now() + 72 * 60 * 60 * 1000),
        importance: 'medium',
        expectedImpact: 'bullish',
        affectedAssets: ['SOL', 'USDC']
      }
    ];

    setMarketTrends(trends);
    setNewsAnalysis(news);
    setSocialSentiment(social);
    setWhaleActivity(whales);
    setMacroEvents(events);
    
    // Calculate overall sentiment
    const avgSentiment = (
      trends.reduce((sum, t) => sum + (t.sentiment === 'positive' ? 1 : t.sentiment === 'negative' ? -1 : 0), 0) / trends.length +
      news.reduce((sum, n) => sum + n.sentiment, 0) / news.length +
      social.reduce((sum, s) => sum + s.sentiment, 0) / social.length
    ) / 3;
    
    setOverallSentiment(avgSentiment);
    setIsAnalyzing(false);
  };

  const getSentimentColor = (sentiment: number | string) => {
    if (typeof sentiment === 'string') {
      switch (sentiment) {
        case 'positive': return '#4caf50';
        case 'negative': return '#f44336';
        default: return '#ff9800';
      }
    }
    
    if (sentiment > 0.3) return '#4caf50';
    if (sentiment < -0.3) return '#f44336';
    return '#ff9800';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💫';
      default: return '📊';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  return (
    <div className="market-intelligence">
      <div className="intelligence-header">
        <h2 className="ai-title">🧠 Market Intelligence Dashboard</h2>
        <div className="intelligence-controls">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="timeframe-selector"
          >
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
          </select>
          <button 
            onClick={loadMarketIntelligence}
            disabled={isAnalyzing}
            className="refresh-btn"
          >
            {isAnalyzing ? '🔄 Analyzing...' : '⚡ Refresh'}
          </button>
        </div>
      </div>

      {/* Overall Sentiment */}
      <div className="sentiment-overview">
        <h3>📊 Market Sentiment Overview</h3>
        <div className="sentiment-gauge">
          <div className="gauge-container">
            <div 
              className="sentiment-needle"
              style={{ 
                transform: `rotate(${(overallSentiment + 1) * 90}deg)`,
                color: getSentimentColor(overallSentiment)
              }}
            >
              ➤
            </div>
            <div className="gauge-labels">
              <span className="bearish">Bearish</span>
              <span className="neutral">Neutral</span>
              <span className="bullish">Bullish</span>
            </div>
          </div>
          <div className="sentiment-score">
            <div className="score-value">{(overallSentiment * 100).toFixed(0)}</div>
            <div className="score-label">Sentiment Score</div>
          </div>
        </div>
      </div>

      <div className="intelligence-grid">
        {/* Market Trends */}
        <div className="trends-section">
          <h3>📈 Market Trends</h3>
          <div className="trends-list">
            {marketTrends.map(trend => (
              <div key={trend.id} className="trend-card">
                <div className="trend-header">
                  <h4>{trend.topic}</h4>
                  <div className="trend-badges">
                    <span 
                      className={`sentiment-badge ${trend.sentiment}`}
                      style={{ backgroundColor: getSentimentColor(trend.sentiment) }}
                    >
                      {trend.sentiment}
                    </span>
                    <span className="impact-badge">
                      {getImpactIcon(trend.impact)} {trend.impact}
                    </span>
                  </div>
                </div>
                <p className="trend-description">{trend.description}</p>
                <div className="trend-footer">
                  <div className="trend-sources">
                    Sources: {trend.sources.join(', ')}
                  </div>
                  <div className="trend-confidence">
                    Confidence: {trend.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Analysis */}
        <div className="news-section">
          <h3>📰 AI News Analysis</h3>
          <div className="news-list">
            {newsAnalysis.map(news => (
              <div key={news.id} className="news-card">
                <div className="news-header">
                  <h4>{news.headline}</h4>
                  <div className="news-meta">
                    <span className="news-source">{news.source}</span>
                    <span className="news-time">{formatTimeAgo(news.timestamp)}</span>
                  </div>
                </div>
                <p className="news-summary">{news.summary}</p>
                <div className="news-metrics">
                  <div className="sentiment-bar">
                    <div className="sentiment-label">Sentiment</div>
                    <div className="sentiment-progress">
                      <div 
                        className="sentiment-fill"
                        style={{ 
                          width: `${Math.abs(news.sentiment) * 100}%`,
                          backgroundColor: getSentimentColor(news.sentiment)
                        }}
                      ></div>
                    </div>
                    <div className="sentiment-value">
                      {(news.sentiment * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className={`price-impact ${news.priceImpact}`}>
                    Impact: {news.priceImpact.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Sentiment */}
        <div className="social-section">
          <h3>💬 Social Sentiment</h3>
          <div className="social-platforms">
            {socialSentiment.map(platform => (
              <div key={platform.platform} className="platform-card">
                <div className="platform-header">
                  <h4>{platform.platform}</h4>
                  <div className="platform-trend">
                    {platform.trend === 'increasing' ? '📈' : 
                     platform.trend === 'decreasing' ? '📉' : '➡️'}
                  </div>
                </div>
                <div className="platform-metrics">
                  <div className="metric">
                    <span className="metric-label">Sentiment</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${platform.sentiment * 100}%`,
                          backgroundColor: getSentimentColor(platform.sentiment)
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Volume</span>
                    <span className="metric-value">{platform.volume.toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Influencer Score</span>
                    <span className="metric-value">{platform.influencerScore}/100</span>
                  </div>
                </div>
                <div className="platform-keywords">
                  <span className="keywords-label">Top Keywords:</span>
                  {platform.topKeywords.map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Whale Activity */}
        <div className="whale-section">
          <h3>🐋 Whale Activity</h3>
          <div className="whale-list">
            {whaleActivity.map(activity => (
              <div key={activity.id} className={`whale-card ${activity.type}`}>
                <div className="whale-header">
                  <div className="whale-type">
                    {activity.type === 'buy' ? '🟢' : activity.type === 'sell' ? '🔴' : '🔄'}
                    {activity.type.toUpperCase()}
                  </div>
                  <div className="whale-impact">
                    {getImpactIcon(activity.impact)}
                  </div>
                </div>
                <div className="whale-details">
                  <div className="whale-amount">
                    {activity.amount.toLocaleString()} {activity.asset}
                  </div>
                  <div className="whale-value">
                    {formatCurrency(activity.value)}
                  </div>
                  {activity.exchange && (
                    <div className="whale-exchange">
                      via {activity.exchange}
                    </div>
                  )}
                  {activity.walletTag && (
                    <div className="whale-tag">
                      {activity.walletTag}
                    </div>
                  )}
                </div>
                <div className="whale-time">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Events */}
        <div className="macro-section">
          <h3>🌍 Macro Events</h3>
          <div className="events-timeline">
            {macroEvents.map(event => (
              <div key={event.id} className={`event-card ${event.importance}`}>
                <div className="event-header">
                  <div className="event-type">
                    {event.type === 'economic' ? '💰' :
                     event.type === 'regulatory' ? '⚖️' :
                     event.type === 'technical' ? '🔧' : '🚀'}
                    {event.type.toUpperCase()}
                  </div>
                  <div className={`event-impact ${event.expectedImpact}`}>
                    {event.expectedImpact.toUpperCase()}
                  </div>
                </div>
                <h4 className="event-title">{event.title}</h4>
                <p className="event-description">{event.description}</p>
                <div className="event-footer">
                  <div className="event-date">
                    {event.date.toLocaleDateString()}
                  </div>
                  <div className="event-assets">
                    Affects: {event.affectedAssets.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;

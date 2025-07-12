import React, { useState, useEffect } from 'react';
import './AIMarketIntelligence.css';

interface MarketTrend {
  id: string;
  title: string;
  description: string;
  strength: 'weak' | 'moderate' | 'strong';
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  confidence: number;
  tags: string[];
  relatedAssets: string[];
}

interface NewsAnalysis {
  id: string;
  headline: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevance: number;
  impact: 'low' | 'medium' | 'high';
  source: string;
  timestamp: Date;
  relatedSymbols: string[];
}

interface SocialSentiment {
  platform: string;
  symbol: string;
  score: number;
  change24h: number;
  volume: number;
  mentions: number;
  trending: boolean;
  keywords: string[];
}

interface WhaleActivity {
  id: string;
  type: 'large_buy' | 'large_sell' | 'accumulation' | 'distribution';
  symbol: string;
  amount: number;
  value: number;
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
}

interface MarketCorrelation {
  symbol1: string;
  symbol2: string;
  correlation: number;
  timeframe: string;
  strength: 'weak' | 'moderate' | 'strong';
}

interface AIMarketIntelligenceProps {
  selectedPair?: string;
}

const AIMarketIntelligence: React.FC<AIMarketIntelligenceProps> = ({ selectedPair = 'SOL/USDC' }) => {
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [newsAnalysis, setNewsAnalysis] = useState<NewsAnalysis[]>([]);
  const [socialSentiment, setSocialSentiment] = useState<SocialSentiment[]>([]);
  const [whaleActivity, setWhaleActivity] = useState<WhaleActivity[]>([]);
  const [correlations, setCorrelations] = useState<MarketCorrelation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'trends' | 'news' | 'social' | 'whales' | 'correlations'>('trends');
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');

  useEffect(() => {
    analyzeMarketIntelligence();
    const interval = setInterval(analyzeMarketIntelligence, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedPair, timeframe]);

  const analyzeMarketIntelligence = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate market trends
    const trends: MarketTrend[] = [
      {
        id: 'trend-1',
        title: 'DeFi Summer 2.0 Emerging',
        description: 'Cross-chain DeFi protocols showing unprecedented growth with 400% TVL increase',
        strength: 'strong',
        impact: 'high',
        timeframe: '1-2 weeks',
        confidence: 92,
        tags: ['DeFi', 'Cross-chain', 'TVL', 'Growth'],
        relatedAssets: ['SOL', 'RAY', 'SRM']
      },
      {
        id: 'trend-2',
        title: 'AI Token Sector Rotation',
        description: 'Smart money rotating from meme coins to AI-focused blockchain projects',
        strength: 'moderate',
        impact: 'medium',
        timeframe: '3-5 days',
        confidence: 78,
        tags: ['AI', 'Rotation', 'Smart Money'],
        relatedAssets: ['FET', 'AGIX', 'OCEAN']
      },
      {
        id: 'trend-3',
        title: 'Institutional Accumulation Pattern',
        description: 'Large institutional wallets accumulating blue-chip altcoins during dips',
        strength: 'strong',
        impact: 'high',
        timeframe: '2-4 weeks',
        confidence: 85,
        tags: ['Institutional', 'Accumulation', 'Blue-chip'],
        relatedAssets: ['SOL', 'ETH', 'DOT']
      }
    ];

    // Generate news analysis
    const news: NewsAnalysis[] = [
      {
        id: 'news-1',
        headline: 'Solana Foundation Announces $10M Developer Grant Program',
        summary: 'Major funding initiative to accelerate ecosystem development with focus on DeFi and NFTs',
        sentiment: 'bullish',
        relevance: 95,
        impact: 'high',
        source: 'Solana Foundation',
        timestamp: new Date(),
        relatedSymbols: ['SOL', 'RAY', 'SRM']
      },
      {
        id: 'news-2',
        headline: 'Federal Reserve Hints at Rate Cuts in Q3',
        summary: 'Comments from Fed officials suggest potential monetary policy shift favoring risk assets',
        sentiment: 'bullish',
        relevance: 78,
        impact: 'medium',
        source: 'Reuters',
        timestamp: new Date(),
        relatedSymbols: ['BTC', 'ETH', 'SOL']
      },
      {
        id: 'news-3',
        headline: 'SEC Increases Scrutiny on DeFi Protocols',
        summary: 'Regulatory concerns may impact certain DeFi tokens in the short term',
        sentiment: 'bearish',
        relevance: 82,
        impact: 'medium',
        source: 'CoinDesk',
        timestamp: new Date(),
        relatedSymbols: ['UNI', 'SUSHI', 'AAVE']
      }
    ];

    // Generate social sentiment
    const social: SocialSentiment[] = [
      {
        platform: 'Twitter',
        symbol: 'SOL',
        score: 78,
        change24h: 12,
        volume: 15420,
        mentions: 45230,
        trending: true,
        keywords: ['bullish', 'breakout', 'DeFi', 'grants']
      },
      {
        platform: 'Reddit',
        symbol: 'SOL',
        score: 82,
        change24h: 8,
        volume: 8750,
        mentions: 12890,
        trending: true,
        keywords: ['hodl', 'ecosystem', 'development']
      },
      {
        platform: 'Discord',
        symbol: 'RAY',
        score: 74,
        change24h: 15,
        volume: 3200,
        mentions: 5670,
        trending: false,
        keywords: ['AMM', 'yield', 'farming']
      }
    ];

    // Generate whale activity
    const whales: WhaleActivity[] = [
      {
        id: 'whale-1',
        type: 'large_buy',
        symbol: 'SOL',
        amount: 50000,
        value: 7117500,
        timestamp: new Date(),
        impact: 'high',
        confidence: 94
      },
      {
        id: 'whale-2',
        type: 'accumulation',
        symbol: 'RAY',
        amount: 150000,
        value: 210000,
        timestamp: new Date(),
        impact: 'medium',
        confidence: 87
      },
      {
        id: 'whale-3',
        type: 'large_sell',
        symbol: 'SRM',
        amount: 25000,
        value: 16300,
        timestamp: new Date(),
        impact: 'medium',
        confidence: 91
      }
    ];

    // Generate correlations
    const corrMatrix: MarketCorrelation[] = [
      {
        symbol1: 'SOL',
        symbol2: 'RAY',
        correlation: 0.78,
        timeframe: '30d',
        strength: 'strong'
      },
      {
        symbol1: 'SOL',
        symbol2: 'BTC',
        correlation: 0.65,
        timeframe: '30d',
        strength: 'moderate'
      },
      {
        symbol1: 'RAY',
        symbol2: 'SRM',
        correlation: 0.42,
        timeframe: '30d',
        strength: 'weak'
      }
    ];

    setMarketTrends(trends);
    setNewsAnalysis(news);
    setSocialSentiment(social);
    setWhaleActivity(whales);
    setCorrelations(corrMatrix);
    setIsAnalyzing(false);
  };

  const getTrendIcon = (strength: string) => {
    switch (strength) {
      case 'strong': return '🔥';
      case 'moderate': return '📈';
      case 'weak': return '📊';
      default: return '📊';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '🟢';
      case 'bearish': return '🔴';
      case 'neutral': return '🟡';
      default: return '⚪';
    }
  };

  const getWhaleIcon = (type: string) => {
    switch (type) {
      case 'large_buy': return '🐋💚';
      case 'large_sell': return '🐋❤️';
      case 'accumulation': return '🐋📈';
      case 'distribution': return '🐋📉';
      default: return '🐋';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9c88ff';
    }
  };

  return (
    <div className="ai-market-intelligence">
      <div className="intelligence-header">
        <h2 className="ai-title">🧠 AI Market Intelligence</h2>
        <div className="intelligence-controls">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="timeframe-selector"
          >
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
          </select>
          <button 
            onClick={analyzeMarketIntelligence}
            disabled={isAnalyzing}
            className="refresh-btn"
          >
            {isAnalyzing ? '🔄 Analyzing...' : '⚡ Refresh Intel'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="intelligence-tabs">
        {[
          { id: 'trends', label: '📈 Trends', count: marketTrends.length },
          { id: 'news', label: '📰 News', count: newsAnalysis.length },
          { id: 'social', label: '💬 Social', count: socialSentiment.length },
          { id: 'whales', label: '🐋 Whales', count: whaleActivity.length },
          { id: 'correlations', label: '🔗 Correlations', count: correlations.length }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id as any)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {isAnalyzing ? (
        <div className="analysis-loading">
          <div className="ai-scanner">
            <div className="scanner-line"></div>
          </div>
          <p>AI scanning market intelligence across 1000+ data sources...</p>
        </div>
      ) : (
        <div className="intelligence-content">
          {/* Market Trends */}
          {selectedTab === 'trends' && (
            <div className="trends-section">
              {marketTrends.map(trend => (
                <div key={trend.id} className={`trend-card ${trend.strength}`}>
                  <div className="trend-header">
                    <div className="trend-title">
                      <span className="trend-icon">{getTrendIcon(trend.strength)}</span>
                      <h3>{trend.title}</h3>
                    </div>
                    <div className="trend-meta">
                      <span className={`impact-badge ${trend.impact}`}>
                        {trend.impact.toUpperCase()}
                      </span>
                      <span className="confidence">
                        {trend.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="trend-description">{trend.description}</p>
                  <div className="trend-details">
                    <div className="trend-timeframe">
                      <strong>Timeframe:</strong> {trend.timeframe}
                    </div>
                    <div className="trend-tags">
                      {trend.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="related-assets">
                      <strong>Related:</strong> {trend.relatedAssets.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* News Analysis */}
          {selectedTab === 'news' && (
            <div className="news-section">
              {newsAnalysis.map(article => (
                <div key={article.id} className="news-card">
                  <div className="news-header">
                    <div className="news-sentiment">
                      {getSentimentIcon(article.sentiment)}
                    </div>
                    <div className="news-meta">
                      <div className="news-source">{article.source}</div>
                      <div className="news-time">
                        {article.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="news-relevance">
                      {article.relevance}% relevant
                    </div>
                  </div>
                  <h3 className="news-headline">{article.headline}</h3>
                  <p className="news-summary">{article.summary}</p>
                  <div className="news-footer">
                    <div className="related-symbols">
                      {article.relatedSymbols.map(symbol => (
                        <span key={symbol} className="symbol-tag">{symbol}</span>
                      ))}
                    </div>
                    <div className={`impact-indicator ${article.impact}`}>
                      {article.impact} impact
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social Sentiment */}
          {selectedTab === 'social' && (
            <div className="social-section">
              {socialSentiment.map((sentiment, index) => (
                <div key={index} className="sentiment-card">
                  <div className="sentiment-header">
                    <div className="platform-info">
                      <h3>{sentiment.platform}</h3>
                      <span className="symbol">{sentiment.symbol}</span>
                    </div>
                    <div className="sentiment-score">
                      <div className="score-value">{sentiment.score}</div>
                      <div className={`score-change ${sentiment.change24h >= 0 ? 'positive' : 'negative'}`}>
                        {sentiment.change24h >= 0 ? '+' : ''}{sentiment.change24h}
                      </div>
                    </div>
                  </div>
                  <div className="sentiment-metrics">
                    <div className="metric">
                      <span className="metric-label">Volume:</span>
                      <span className="metric-value">{formatNumber(sentiment.volume)}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Mentions:</span>
                      <span className="metric-value">{formatNumber(sentiment.mentions)}</span>
                    </div>
                    {sentiment.trending && (
                      <div className="trending-badge">🔥 Trending</div>
                    )}
                  </div>
                  <div className="sentiment-keywords">
                    {sentiment.keywords.map(keyword => (
                      <span key={keyword} className="keyword-tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Whale Activity */}
          {selectedTab === 'whales' && (
            <div className="whales-section">
              {whaleActivity.map(whale => (
                <div key={whale.id} className="whale-card">
                  <div className="whale-header">
                    <div className="whale-type">
                      <span className="whale-icon">{getWhaleIcon(whale.type)}</span>
                      <span className="whale-action">{whale.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="whale-symbol">{whale.symbol}</div>
                  </div>
                  <div className="whale-details">
                    <div className="whale-amount">
                      <span className="amount">{formatNumber(whale.amount)}</span>
                      <span className="value">{formatCurrency(whale.value)}</span>
                    </div>
                    <div className="whale-meta">
                      <div className={`whale-impact ${whale.impact}`}>
                        {whale.impact} impact
                      </div>
                      <div className="whale-confidence">
                        {whale.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="whale-time">
                    {whale.timestamp.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Correlations */}
          {selectedTab === 'correlations' && (
            <div className="correlations-section">
              {correlations.map((corr, index) => (
                <div key={index} className="correlation-card">
                  <div className="correlation-pair">
                    <span className="symbol">{corr.symbol1}</span>
                    <span className="vs">↔</span>
                    <span className="symbol">{corr.symbol2}</span>
                  </div>
                  <div className="correlation-value">
                    <div className={`correlation-score ${corr.strength}`}>
                      {(corr.correlation * 100).toFixed(1)}%
                    </div>
                    <div className="correlation-strength">
                      {corr.strength} correlation
                    </div>
                  </div>
                  <div className="correlation-timeframe">
                    {corr.timeframe}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMarketIntelligence;

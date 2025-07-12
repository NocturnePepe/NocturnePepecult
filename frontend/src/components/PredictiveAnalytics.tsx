import React, { useState, useEffect } from 'react';
import './PredictiveAnalytics.css';

interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  confidence: number;
  timeframe: string;
  prediction: 'bullish' | 'bearish' | 'neutral';
  targetPrice: number;
  probability: number;
}

interface MarketSignal {
  id: string;
  type: 'technical' | 'sentiment' | 'volume' | 'fundamental';
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'bullish' | 'bearish' | 'neutral';
  description: string;
  confidence: number;
  timestamp: Date;
}

interface PriceTarget {
  timeframe: '1h' | '4h' | '1d' | '1w';
  prediction: number;
  confidence: number;
  resistance: number[];
  support: number[];
}

interface PredictiveAnalyticsProps {
  selectedPair: string;
  currentPrice: number;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ 
  selectedPair, 
  currentPrice 
}) => {
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [priceTargets, setPriceTargets] = useState<PriceTarget[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consensusPrediction, setConsensusPrediction] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    analyzeMarket();
    const interval = setInterval(analyzeMarket, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedPair, selectedTimeframe]);

  const analyzeMarket = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate AI prediction models
    const mockModels: PredictionModel[] = [
      {
        id: 'lstm-1',
        name: 'LSTM Neural Network',
        accuracy: 84.5,
        confidence: 92.3,
        timeframe: selectedTimeframe,
        prediction: Math.random() > 0.5 ? 'bullish' : 'bearish',
        targetPrice: currentPrice * (0.95 + Math.random() * 0.1),
        probability: 75 + Math.random() * 20
      },
      {
        id: 'transformer-1',
        name: 'Transformer Model',
        accuracy: 87.2,
        confidence: 89.1,
        timeframe: selectedTimeframe,
        prediction: Math.random() > 0.4 ? 'bullish' : 'bearish',
        targetPrice: currentPrice * (0.97 + Math.random() * 0.06),
        probability: 70 + Math.random() * 25
      },
      {
        id: 'ensemble-1',
        name: 'Ensemble Predictor',
        accuracy: 91.8,
        confidence: 95.7,
        timeframe: selectedTimeframe,
        prediction: Math.random() > 0.3 ? 'bullish' : 'neutral',
        targetPrice: currentPrice * (0.98 + Math.random() * 0.04),
        probability: 80 + Math.random() * 15
      },
      {
        id: 'sentiment-1',
        name: 'Sentiment Analysis AI',
        accuracy: 76.3,
        confidence: 82.4,
        timeframe: selectedTimeframe,
        prediction: Math.random() > 0.6 ? 'bullish' : 'bearish',
        targetPrice: currentPrice * (0.92 + Math.random() * 0.16),
        probability: 65 + Math.random() * 30
      }
    ];

    // Generate market signals
    const mockSignals: MarketSignal[] = [
      {
        id: 'tech-1',
        type: 'technical',
        strength: 'strong',
        direction: 'bullish',
        description: 'Golden Cross detected on 4H timeframe',
        confidence: 88.5,
        timestamp: new Date()
      },
      {
        id: 'vol-1',
        type: 'volume',
        strength: 'moderate',
        direction: 'bullish',
        description: 'Volume surge with price breakout',
        confidence: 73.2,
        timestamp: new Date()
      },
      {
        id: 'sent-1',
        type: 'sentiment',
        strength: 'strong',
        direction: 'neutral',
        description: 'Social sentiment turning positive',
        confidence: 79.8,
        timestamp: new Date()
      },
      {
        id: 'fund-1',
        type: 'fundamental',
        strength: 'weak',
        direction: 'bearish',
        description: 'Macroeconomic headwinds detected',
        confidence: 56.7,
        timestamp: new Date()
      }
    ];

    // Generate price targets
    const mockTargets: PriceTarget[] = [
      {
        timeframe: '1h',
        prediction: currentPrice * (0.998 + Math.random() * 0.004),
        confidence: 65 + Math.random() * 20,
        resistance: [currentPrice * 1.01, currentPrice * 1.025],
        support: [currentPrice * 0.99, currentPrice * 0.975]
      },
      {
        timeframe: '4h',
        prediction: currentPrice * (0.995 + Math.random() * 0.01),
        confidence: 70 + Math.random() * 20,
        resistance: [currentPrice * 1.02, currentPrice * 1.05],
        support: [currentPrice * 0.98, currentPrice * 0.95]
      },
      {
        timeframe: '1d',
        prediction: currentPrice * (0.98 + Math.random() * 0.04),
        confidence: 75 + Math.random() * 20,
        resistance: [currentPrice * 1.05, currentPrice * 1.1],
        support: [currentPrice * 0.95, currentPrice * 0.9]
      },
      {
        timeframe: '1w',
        prediction: currentPrice * (0.9 + Math.random() * 0.2),
        confidence: 60 + Math.random() * 30,
        resistance: [currentPrice * 1.15, currentPrice * 1.3],
        support: [currentPrice * 0.85, currentPrice * 0.7]
      }
    ];

    setModels(mockModels);
    setSignals(mockSignals);
    setPriceTargets(mockTargets);
    
    // Calculate consensus
    const bullishCount = mockModels.filter(m => m.prediction === 'bullish').length;
    const bearishCount = mockModels.filter(m => m.prediction === 'bearish').length;
    const neutralCount = mockModels.filter(m => m.prediction === 'neutral').length;
    
    if (bullishCount > bearishCount && bullishCount > neutralCount) {
      setConsensusPrediction('bullish');
    } else if (bearishCount > bullishCount && bearishCount > neutralCount) {
      setConsensusPrediction('bearish');
    } else {
      setConsensusPrediction('neutral');
    }
    
    // Calculate risk level
    const avgConfidence = mockModels.reduce((sum, m) => sum + m.confidence, 0) / mockModels.length;
    if (avgConfidence > 85) setRiskLevel('low');
    else if (avgConfidence > 70) setRiskLevel('medium');
    else setRiskLevel('high');
    
    setIsAnalyzing(false);
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'technical': return '📊';
      case 'sentiment': return '💭';
      case 'volume': return '📈';
      case 'fundamental': return '🏛️';
      default: return '🔍';
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish': return '#4caf50';
      case 'bearish': return '#f44336';
      case 'neutral': return '#ff9800';
      default: return '#9c88ff';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="predictive-analytics">
      <div className="analytics-header">
        <h2 className="ai-title">🔮 AI Predictive Analytics</h2>
        <div className="analytics-controls">
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
            onClick={analyzeMarket}
            disabled={isAnalyzing}
            className="analyze-btn"
          >
            {isAnalyzing ? '🔄 Analyzing...' : '⚡ Refresh Analysis'}
          </button>
        </div>
      </div>

      {isAnalyzing ? (
        <div className="analyzing-state">
          <div className="ai-loader">
            <div className="neural-network">
              <div className="neuron"></div>
              <div className="neuron"></div>
              <div className="neuron"></div>
              <div className="neuron"></div>
            </div>
            <p>AI models processing market data...</p>
          </div>
        </div>
      ) : (
        <div className="analytics-content">
          {/* Consensus Prediction */}
          <div className="consensus-panel">
            <h3>📈 Consensus Prediction</h3>
            <div className="consensus-content">
              <div className={`consensus-direction ${consensusPrediction}`}>
                <span className="direction-label">{consensusPrediction.toUpperCase()}</span>
                <span className="risk-level">Risk: {riskLevel.toUpperCase()}</span>
              </div>
              <div className="consensus-details">
                <p>Based on {models.length} AI models analyzing {selectedPair}</p>
                <p>Target timeframe: {selectedTimeframe}</p>
              </div>
            </div>
          </div>

          {/* AI Models */}
          <div className="models-section">
            <h3>🤖 AI Model Predictions</h3>
            <div className="models-grid">
              {models.map(model => (
                <div key={model.id} className="model-card">
                  <div className="model-header">
                    <h4>{model.name}</h4>
                    <div className="model-stats">
                      <span className="accuracy">Accuracy: {formatPercentage(model.accuracy)}</span>
                      <span className="confidence">Confidence: {formatPercentage(model.confidence)}</span>
                    </div>
                  </div>
                  <div className="model-prediction">
                    <div 
                      className={`prediction-direction ${model.prediction}`}
                      style={{ color: getDirectionColor(model.prediction) }}
                    >
                      {model.prediction.toUpperCase()}
                    </div>
                    <div className="prediction-details">
                      <div className="target-price">
                        Target: {formatPrice(model.targetPrice)}
                      </div>
                      <div className="probability">
                        Probability: {formatPercentage(model.probability)}
                      </div>
                    </div>
                  </div>
                  <div className="model-progress">
                    <div 
                      className="confidence-bar"
                      style={{ width: `${model.confidence}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Signals */}
          <div className="signals-section">
            <h3>📡 Market Signals</h3>
            <div className="signals-list">
              {signals.map(signal => (
                <div key={signal.id} className={`signal-item ${signal.strength}`}>
                  <div className="signal-icon">
                    {getSignalIcon(signal.type)}
                  </div>
                  <div className="signal-content">
                    <div className="signal-header">
                      <span className="signal-type">{signal.type.toUpperCase()}</span>
                      <span 
                        className={`signal-direction ${signal.direction}`}
                        style={{ color: getDirectionColor(signal.direction) }}
                      >
                        {signal.direction.toUpperCase()}
                      </span>
                      <span className="signal-strength">{signal.strength}</span>
                    </div>
                    <p className="signal-description">{signal.description}</p>
                    <div className="signal-confidence">
                      Confidence: {formatPercentage(signal.confidence)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Targets */}
          <div className="targets-section">
            <h3>🎯 Price Targets</h3>
            <div className="targets-grid">
              {priceTargets.map(target => (
                <div key={target.timeframe} className="target-card">
                  <div className="target-header">
                    <h4>{target.timeframe}</h4>
                    <span className="target-confidence">
                      {formatPercentage(target.confidence)} confidence
                    </span>
                  </div>
                  <div className="target-price">
                    {formatPrice(target.prediction)}
                  </div>
                  <div className="target-levels">
                    <div className="resistance-levels">
                      <span className="level-label">Resistance:</span>
                      {target.resistance.map((level, idx) => (
                        <span key={idx} className="resistance-level">
                          {formatPrice(level)}
                        </span>
                      ))}
                    </div>
                    <div className="support-levels">
                      <span className="level-label">Support:</span>
                      {target.support.map((level, idx) => (
                        <span key={idx} className="support-level">
                          {formatPrice(level)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;

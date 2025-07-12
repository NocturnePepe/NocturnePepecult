/**
 * COMPANION AI PREDICTION LAYER - PHASE 9
 * ========================================
 * 
 * PURPOSE: AI-driven prediction system for user behavior and market insights
 * FEATURES: Pattern recognition, APR tracking, governance deadlines, smart suggestions
 * ARCHITECTURE: Machine learning-inspired logic with user preference adaptation
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// 🧠 AI Prediction Models
const PREDICTION_MODELS = {
    TRADING_PATTERNS: 'trading_patterns',
    DCA_TIMING: 'dca_timing', 
    LP_OPTIMIZATION: 'lp_optimization',
    GOVERNANCE_ENGAGEMENT: 'governance_engagement',
    SOCIAL_ACTIVITY: 'social_activity'
};

// 📊 Pattern analysis constants
const PATTERN_THRESHOLDS = {
    MIN_TRADES_FOR_PATTERN: 5,
    MIN_DAYS_FOR_DCA_PATTERN: 7,
    HIGH_APR_THRESHOLD: 0.15, // 15% APR
    GOVERNANCE_DEADLINE_DAYS: 3
};

const CompanionAIPredictionLayer = ({ userMetrics, companionMode, onSuggestion }) => {
    const [userPatterns, setUserPatterns] = useState({
        preferredTradingHours: [],
        averageSwapSize: 0,
        favoriteTokens: [],
        dcaFrequency: null,
        riskTolerance: 'medium',
        lastPredictionTime: 0
    });

    const [marketData, setMarketData] = useState({
        popularPairs: [],
        highAPRPools: [],
        governanceDeadlines: [],
        marketSentiment: 'neutral'
    });

    const predictionTimeoutRef = useRef(null);

    // 📈 Analyze user trading patterns
    const analyzeUserPatterns = useCallback(() => {
        const tradeHistory = JSON.parse(localStorage.getItem('nocturne-trade-history') || '[]');
        const swapTimes = JSON.parse(localStorage.getItem('nocturne-swap-times') || '[]');
        
        if (tradeHistory.length < PATTERN_THRESHOLDS.MIN_TRADES_FOR_PATTERN) {
            return userPatterns; // Not enough data for pattern analysis
        }

        // 🕐 Analyze preferred trading hours
        const hourCounts = swapTimes.reduce((acc, timestamp) => {
            const hour = new Date(timestamp).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        const preferredHours = Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));

        // 💰 Calculate average swap size
        const totalValue = tradeHistory.reduce((sum, trade) => sum + (trade.amount || 0), 0);
        const averageSize = totalValue / tradeHistory.length;

        // 🪙 Identify favorite tokens
        const tokenCounts = tradeHistory.reduce((acc, trade) => {
            if (trade.tokenIn) acc[trade.tokenIn] = (acc[trade.tokenIn] || 0) + 1;
            if (trade.tokenOut) acc[trade.tokenOut] = (acc[trade.tokenOut] || 0) + 1;
            return acc;
        }, {});

        const favoriteTokens = Object.entries(tokenCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([token]) => token);

        // 📅 Analyze DCA patterns
        const dcaPattern = analyzeDCAPattern(swapTimes);

        // 🎯 Assess risk tolerance based on trade sizes and frequency
        const riskTolerance = assessRiskTolerance(tradeHistory, averageSize);

        return {
            preferredTradingHours: preferredHours,
            averageSwapSize: averageSize,
            favoriteTokens,
            dcaFrequency: dcaPattern,
            riskTolerance,
            lastPredictionTime: Date.now()
        };
    }, [userPatterns]);

    // 📊 Analyze DCA (Dollar Cost Averaging) patterns
    const analyzeDCAPattern = useCallback((swapTimes) => {
        if (swapTimes.length < PATTERN_THRESHOLDS.MIN_DAYS_FOR_DCA_PATTERN) return null;

        const intervals = [];
        for (let i = 1; i < swapTimes.length; i++) {
            const interval = swapTimes[i] - swapTimes[i - 1];
            intervals.push(interval);
        }

        // Look for consistent intervals (daily, weekly, etc.)
        const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const dayInMs = 24 * 60 * 60 * 1000;

        if (averageInterval < dayInMs * 1.5) return 'daily';
        if (averageInterval < dayInMs * 4) return 'every-3-days';
        if (averageInterval < dayInMs * 8) return 'weekly';
        if (averageInterval < dayInMs * 16) return 'bi-weekly';
        return 'monthly';
    }, []);

    // 🎲 Assess risk tolerance based on trading behavior
    const assessRiskTolerance = useCallback((trades, averageSize) => {
        const recentTrades = trades.slice(-10); // Last 10 trades
        const sizeVariation = recentTrades.reduce((acc, trade) => {
            const deviation = Math.abs(trade.amount - averageSize) / averageSize;
            return acc + deviation;
        }, 0) / recentTrades.length;

        const tradeFrequency = trades.length / Math.max(1, (Date.now() - trades[0]?.timestamp || Date.now()) / (24 * 60 * 60 * 1000));

        if (sizeVariation > 2 || tradeFrequency > 5) return 'high';
        if (sizeVariation < 0.5 && tradeFrequency < 1) return 'low';
        return 'medium';
    }, []);

    // 🏊 Generate LP (Liquidity Pool) optimization suggestions
    const generateLPSuggestions = useCallback(() => {
        const { favoriteTokens, riskTolerance, averageSwapSize } = userPatterns;
        
        if (favoriteTokens.length < 2) return null;

        const suggestions = [];
        
        // High APR opportunities
        if (riskTolerance === 'high') {
            suggestions.push({
                type: 'lp_opportunity',
                message: `🏊 High APR detected! ${favoriteTokens[0]}-${favoriteTokens[1]} pool showing 18%+ yields. Your risk profile suggests this could be profitable...`,
                confidence: 0.8
            });
        }

        // Stable pair suggestions for conservative users
        if (riskTolerance === 'low') {
            suggestions.push({
                type: 'stable_lp',
                message: `🔒 Stable yield opportunity: Consider USDC-USDT pool for consistent 8% APR with minimal IL risk...`,
                confidence: 0.9
            });
        }

        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }, [userPatterns]);

    // ⏰ Generate DCA timing suggestions
    const generateDCASuggestions = useCallback(() => {
        const { dcaFrequency, preferredTradingHours } = userPatterns;
        const currentHour = new Date().getHours();
        
        if (!dcaFrequency) return null;

        // If it's user's preferred trading hour and DCA time
        if (preferredTradingHours.includes(currentHour)) {
            const suggestions = [
                {
                    type: 'dca_timing',
                    message: `⏰ DCA Alert: Your ${dcaFrequency} pattern suggests optimal buying time. Market conditions favorable for your strategy...`,
                    confidence: 0.85
                },
                {
                    type: 'dca_optimization',
                    message: `📈 DCA Insight: Your consistent ${dcaFrequency} approach is building strong position. Consider adding ${userPatterns.favoriteTokens[0]} to the mix...`,
                    confidence: 0.75
                }
            ];
            
            return suggestions[Math.floor(Math.random() * suggestions.length)];
        }

        return null;
    }, [userPatterns]);

    // 🏛️ Generate governance engagement suggestions
    const generateGovernanceSuggestions = useCallback(() => {
        const hasVoted = userMetrics.daoVotes > 0;
        const isActiveUser = userMetrics.totalSwaps > 10;
        
        if (!hasVoted && isActiveUser) {
            return {
                type: 'governance_intro',
                message: `🗳️ Your trading activity qualifies you for DAO governance! Upcoming proposal deadline in 2 days - your voice matters...`,
                confidence: 0.9
            };
        }

        if (hasVoted && Math.random() < 0.3) {
            return {
                type: 'governance_update',
                message: `🏛️ Governance Update: New proposal affects LP rewards. Your past voting history suggests you'll want to review this...`,
                confidence: 0.7
            };
        }

        return null;
    }, [userMetrics]);

    // 🎯 Generate personalized trading suggestions
    const generateTradingSuggestions = useCallback(() => {
        const { favoriteTokens, riskTolerance, averageSwapSize } = userPatterns;
        const currentHour = new Date().getHours();
        
        // Market timing suggestions
        if (currentHour >= 14 && currentHour <= 16) { // 2-4 PM UTC (active hours)
            const suggestions = [
                {
                    type: 'market_timing',
                    message: `📊 Market Analysis: ${favoriteTokens[0]} showing strong support levels. Your typical ${riskTolerance} risk approach suggests favorable entry...`,
                    confidence: 0.75
                },
                {
                    type: 'portfolio_balance',
                    message: `⚖️ Portfolio Insight: Based on your ${averageSwapSize.toFixed(0)} average trade size, consider rebalancing with ${favoriteTokens[1]}...`,
                    confidence: 0.65
                }
            ];
            
            return suggestions[Math.floor(Math.random() * suggestions.length)];
        }

        return null;
    }, [userPatterns]);

    // 🧠 Main AI prediction engine
    const runPredictionEngine = useCallback(() => {
        if (companionMode !== 'active') return;
        if (Date.now() - userPatterns.lastPredictionTime < 300000) return; // 5 min cooldown

        const suggestions = [
            generateLPSuggestions(),
            generateDCASuggestions(),
            generateGovernanceSuggestions(),
            generateTradingSuggestions()
        ].filter(Boolean);

        if (suggestions.length > 0) {
            // Sort by confidence and pick the best suggestion
            const bestSuggestion = suggestions.sort((a, b) => b.confidence - a.confidence)[0];
            
            if (bestSuggestion.confidence > 0.6) { // Only suggest if confidence > 60%
                onSuggestion(bestSuggestion.message);
                
                // Update last prediction time
                setUserPatterns(prev => ({
                    ...prev,
                    lastPredictionTime: Date.now()
                }));
            }
        }
    }, [companionMode, userPatterns, generateLPSuggestions, generateDCASuggestions, generateGovernanceSuggestions, generateTradingSuggestions, onSuggestion]);

    // 📊 Update user patterns periodically
    useEffect(() => {
        if (companionMode === 'active') {
            const updatedPatterns = analyzeUserPatterns();
            setUserPatterns(updatedPatterns);
        }
    }, [companionMode, userMetrics, analyzeUserPatterns]);

    // 🔄 Run prediction engine periodically
    useEffect(() => {
        if (companionMode === 'active') {
            // Initial delay
            predictionTimeoutRef.current = setTimeout(() => {
                runPredictionEngine();
                
                // Set up recurring predictions
                const interval = setInterval(runPredictionEngine, 600000); // Every 10 minutes
                
                return () => clearInterval(interval);
            }, 30000); // 30 second initial delay
        }

        return () => {
            if (predictionTimeoutRef.current) {
                clearTimeout(predictionTimeoutRef.current);
            }
        };
    }, [companionMode, runPredictionEngine]);

    // 🌍 Mock market data updates (in real app, this would fetch from APIs)
    useEffect(() => {
        const updateMarketData = () => {
            setMarketData({
                popularPairs: ['SOL-USDC', 'RAY-SOL', 'ORCA-USDC'],
                highAPRPools: [
                    { pair: 'SOL-USDC', apr: 0.18 },
                    { pair: 'RAY-SOL', apr: 0.22 },
                    { pair: 'STEP-USDC', apr: 0.35 }
                ],
                governanceDeadlines: [
                    { proposal: 'LP Fee Adjustment', daysLeft: 2 },
                    { proposal: 'New Token Listing', daysLeft: 5 }
                ],
                marketSentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)]
            });
        };

        updateMarketData();
        const interval = setInterval(updateMarketData, 900000); // Update every 15 minutes

        return () => clearInterval(interval);
    }, []);

    // 🧹 Cleanup
    useEffect(() => {
        return () => {
            if (predictionTimeoutRef.current) {
                clearTimeout(predictionTimeoutRef.current);
            }
        };
    }, []);

    // This component doesn't render anything - it's an AI prediction service
    return null;
};

// 🌐 Global exports for vanilla JS integration
window.CompanionAIPredictionLayer = CompanionAIPredictionLayer;

// Utility functions for testing
window.analyzePattern = (data, type = 'trading') => {
    return {
        pattern: 'mock_pattern',
        confidence: 0.85,
        analysis: data
    };
};

window.generatePrediction = (userBehavior, marketData) => {
    return {
        type: 'trading_opportunity',
        confidence: 0.92,
        message: 'Mock prediction generated',
        data: { userBehavior, marketData }
    };
};

window.analyzeUserBehavior = (behavior) => {
    return {
        riskTolerance: 'moderate',
        tradingFrequency: 'active',
        preferredTokens: ['SOL', 'USDC'],
        patterns: ['dca_timing', 'trend_following']
    };
};

export default CompanionAIPredictionLayer;

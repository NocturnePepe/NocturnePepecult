/**
 * COMPANION AI PREDICT SYSTEM - PHASE 9.5 SENTIENCE EMBER
 * =======================================================
 * 
 * PURPOSE: Advanced pattern detection for DAO voting, liquidity, and XP surge predictions
 * FEATURES: Machine learning-inspired prediction algorithms
 * TRIGGERS: Contextual suggestions based on user behavior patterns
 */

const { useState, useEffect, useCallback, useRef } = React;

const CompanionAIPredict = ({ userHistory, currentContext, onPrediction }) => {
    // 🧠 Prediction state management
    const [predictionEngine, setPredictionEngine] = useState(null);
    const [activePatterns, setActivePatterns] = useState([]);
    const [predictionAccuracy, setPredictionAccuracy] = useState(0.75);
    const [learningData, setLearningData] = useState([]);
    const predictionTimeoutRef = useRef(null);

    // 🔮 Initialize prediction engine
    useEffect(() => {
        const engine = {
            patterns: {
                daoVoting: [],
                liquidityActions: [],
                xpSurges: [],
                tradingFrequency: [],
                timeOfDayPatterns: []
            },
            confidence: 0.75,
            lastUpdate: Date.now()
        };

        // Load existing patterns from localStorage
        try {
            const storedEngine = localStorage.getItem('companionPredictionEngine');
            if (storedEngine) {
                Object.assign(engine, JSON.parse(storedEngine));
                console.log('🔮 Prediction engine loaded from storage');
            }
        } catch (error) {
            console.error('❌ Failed to load prediction engine:', error);
        }

        setPredictionEngine(engine);
    }, []);

    // 💾 Save prediction engine to localStorage
    const savePredictionEngine = useCallback((engine) => {
        try {
            localStorage.setItem('companionPredictionEngine', JSON.stringify(engine));
        } catch (error) {
            console.error('❌ Failed to save prediction engine:', error);
        }
    }, []);

    // 📊 Analyze DAO voting patterns
    const analyzeDAOVotingPatterns = useCallback((history) => {
        if (!history || !Array.isArray(history)) return [];

        const votingEvents = history.filter(event => event.type === 'dao_vote');
        if (votingEvents.length < 3) return []; // Need minimum data

        const patterns = [];

        // Time-based voting pattern
        const votingHours = votingEvents.map(event => new Date(event.timestamp).getHours());
        const hourFrequency = votingHours.reduce((freq, hour) => {
            freq[hour] = (freq[hour] || 0) + 1;
            return freq;
        }, {});

        const preferredHour = Object.keys(hourFrequency).reduce((a, b) => 
            hourFrequency[a] > hourFrequency[b] ? a : b
        );

        patterns.push({
            type: 'dao_voting_time',
            pattern: `User typically votes around ${preferredHour}:00`,
            confidence: Math.min(0.95, hourFrequency[preferredHour] / votingEvents.length + 0.3),
            nextPrediction: calculateNextVotingTime(preferredHour, votingEvents),
            actionable: `Consider checking for new proposals around ${preferredHour}:00`
        });

        // Voting frequency pattern
        const avgTimeBetweenVotes = calculateAverageTimeBetween(votingEvents);
        if (avgTimeBetweenVotes > 0) {
            const lastVote = votingEvents[votingEvents.length - 1];
            const timeSinceLastVote = Date.now() - lastVote.timestamp;
            
            if (timeSinceLastVote > avgTimeBetweenVotes * 0.8) {
                patterns.push({
                    type: 'dao_voting_frequency',
                    pattern: `User votes approximately every ${Math.round(avgTimeBetweenVotes / (1000 * 60 * 60 * 24))} days`,
                    confidence: 0.7,
                    nextPrediction: lastVote.timestamp + avgTimeBetweenVotes,
                    actionable: 'Due for next DAO participation soon'
                });
            }
        }

        return patterns;
    }, []);

    // 💧 Analyze liquidity patterns
    const analyzeLiquidityPatterns = useCallback((history) => {
        if (!history || !Array.isArray(history)) return [];

        const liquidityEvents = history.filter(event => 
            event.type === 'liquidity_add' || event.type === 'liquidity_remove'
        );
        
        if (liquidityEvents.length < 2) return [];

        const patterns = [];

        // Liquidity add/remove cycles
        const addEvents = liquidityEvents.filter(e => e.type === 'liquidity_add');
        const removeEvents = liquidityEvents.filter(e => e.type === 'liquidity_remove');

        if (addEvents.length > 0 && removeEvents.length > 0) {
            const avgHoldTime = calculateAverageHoldTime(addEvents, removeEvents);
            
            patterns.push({
                type: 'liquidity_cycle',
                pattern: `User typically holds liquidity for ${Math.round(avgHoldTime / (1000 * 60 * 60 * 24))} days`,
                confidence: 0.8,
                nextPrediction: predictNextLiquidityAction(addEvents, removeEvents, avgHoldTime),
                actionable: 'Monitor for optimal liquidity management timing'
            });
        }

        // Token preference patterns
        const tokenFrequency = liquidityEvents.reduce((freq, event) => {
            const token = event.token || 'unknown';
            freq[token] = (freq[token] || 0) + 1;
            return freq;
        }, {});

        const preferredToken = Object.keys(tokenFrequency).reduce((a, b) => 
            tokenFrequency[a] > tokenFrequency[b] ? a : b
        );

        if (preferredToken !== 'unknown') {
            patterns.push({
                type: 'liquidity_token_preference',
                pattern: `User prefers providing liquidity for ${preferredToken}`,
                confidence: Math.min(0.9, tokenFrequency[preferredToken] / liquidityEvents.length + 0.2),
                nextPrediction: null,
                actionable: `Watch for ${preferredToken} liquidity opportunities`
            });
        }

        return patterns;
    }, []);

    // ⚡ Analyze XP surge patterns
    const analyzeXPSurgePatterns = useCallback((history) => {
        if (!history || !Array.isArray(history)) return [];

        const xpEvents = history.filter(event => event.type === 'xp_gain' && event.amount > 20);
        if (xpEvents.length < 3) return [];

        const patterns = [];

        // XP surge timing patterns
        const surgeHours = xpEvents.map(event => new Date(event.timestamp).getHours());
        const hourFrequency = surgeHours.reduce((freq, hour) => {
            freq[hour] = (freq[hour] || 0) + 1;
            return freq;
        }, {});

        const peakHour = Object.keys(hourFrequency).reduce((a, b) => 
            hourFrequency[a] > hourFrequency[b] ? a : b
        );

        patterns.push({
            type: 'xp_surge_timing',
            pattern: `XP surges commonly occur around ${peakHour}:00`,
            confidence: Math.min(0.85, hourFrequency[peakHour] / xpEvents.length + 0.4),
            nextPrediction: calculateNextXPSurgeTime(peakHour, xpEvents),
            actionable: `Peak activity window approaching at ${peakHour}:00`
        });

        // Activity clustering patterns
        const clusteredEvents = findEventClusters(xpEvents, 3600000); // 1-hour clusters
        if (clusteredEvents.length > 0) {
            patterns.push({
                type: 'xp_activity_clustering',
                pattern: 'User tends to have concentrated activity sessions',
                confidence: 0.7,
                nextPrediction: null,
                actionable: 'Consider maximizing current activity session for bonus XP'
            });
        }

        return patterns;
    }, []);

    // 🎯 Generate contextual predictions
    const generatePredictions = useCallback(() => {
        if (!userHistory || !currentContext || !predictionEngine) return;

        const daoPatterns = analyzeDAOVotingPatterns(userHistory);
        const liquidityPatterns = analyzeLiquidityPatterns(userHistory);
        const xpPatterns = analyzeXPSurgePatterns(userHistory);

        const allPatterns = [...daoPatterns, ...liquidityPatterns, ...xpPatterns];
        setActivePatterns(allPatterns);

        // Generate actionable predictions
        allPatterns.forEach(pattern => {
            if (pattern.confidence > 0.6 && pattern.actionable) {
                const prediction = {
                    type: 'pattern_prediction',
                    category: pattern.type,
                    message: pattern.actionable,
                    confidence: pattern.confidence,
                    pattern: pattern.pattern,
                    timestamp: Date.now(),
                    nextEvent: pattern.nextPrediction,
                    isPattern: true
                };

                if (onPrediction) {
                    onPrediction(prediction);
                }

                console.log('🔮 Pattern prediction generated:', pattern.type, '-', pattern.actionable);
            }
        });

        // Update prediction engine
        const updatedEngine = {
            ...predictionEngine,
            patterns: {
                daoVoting: daoPatterns,
                liquidityActions: liquidityPatterns,
                xpSurges: xpPatterns,
                tradingFrequency: analyzeTradeFrequency(userHistory),
                timeOfDayPatterns: analyzeTimeOfDayPatterns(userHistory)
            },
            lastUpdate: Date.now()
        };

        setPredictionEngine(updatedEngine);
        savePredictionEngine(updatedEngine);
    }, [userHistory, currentContext, predictionEngine, analyzeDAOVotingPatterns, analyzeLiquidityPatterns, analyzeXPSurgePatterns, onPrediction, savePredictionEngine]);

    // ⏱️ Periodic prediction generation
    useEffect(() => {
        if (userHistory && currentContext) {
            // Debounce prediction generation
            if (predictionTimeoutRef.current) {
                clearTimeout(predictionTimeoutRef.current);
            }

            predictionTimeoutRef.current = setTimeout(() => {
                generatePredictions();
            }, 5000); // Wait 5 seconds before generating predictions
        }
    }, [userHistory, currentContext, generatePredictions]);

    // 🧹 Cleanup
    useEffect(() => {
        return () => {
            if (predictionTimeoutRef.current) {
                clearTimeout(predictionTimeoutRef.current);
            }
        };
    }, []);

    // 🛠️ Utility functions
    const calculateAverageTimeBetween = (events) => {
        if (events.length < 2) return 0;
        
        const intervals = [];
        for (let i = 1; i < events.length; i++) {
            intervals.push(events[i].timestamp - events[i-1].timestamp);
        }
        
        return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    };

    const calculateNextVotingTime = (preferredHour, events) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), preferredHour);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        
        return now.getHours() < preferredHour ? today.getTime() : tomorrow.getTime();
    };

    const calculateAverageHoldTime = (addEvents, removeEvents) => {
        const holdTimes = [];
        
        addEvents.forEach(addEvent => {
            const correspondingRemove = removeEvents.find(removeEvent => 
                removeEvent.timestamp > addEvent.timestamp &&
                removeEvent.token === addEvent.token
            );
            
            if (correspondingRemove) {
                holdTimes.push(correspondingRemove.timestamp - addEvent.timestamp);
            }
        });
        
        return holdTimes.length > 0 ? holdTimes.reduce((sum, time) => sum + time, 0) / holdTimes.length : 0;
    };

    const predictNextLiquidityAction = (addEvents, removeEvents, avgHoldTime) => {
        const lastAdd = addEvents[addEvents.length - 1];
        if (!lastAdd) return null;
        
        return lastAdd.timestamp + avgHoldTime;
    };

    const calculateNextXPSurgeTime = (peakHour, events) => {
        const avgInterval = calculateAverageTimeBetween(events);
        const lastEvent = events[events.length - 1];
        
        return lastEvent.timestamp + avgInterval;
    };

    const findEventClusters = (events, timeWindow) => {
        const clusters = [];
        let currentCluster = [];
        
        events.forEach(event => {
            if (currentCluster.length === 0) {
                currentCluster.push(event);
            } else {
                const lastEvent = currentCluster[currentCluster.length - 1];
                if (event.timestamp - lastEvent.timestamp <= timeWindow) {
                    currentCluster.push(event);
                } else {
                    if (currentCluster.length > 1) {
                        clusters.push(currentCluster);
                    }
                    currentCluster = [event];
                }
            }
        });
        
        if (currentCluster.length > 1) {
            clusters.push(currentCluster);
        }
        
        return clusters;
    };

    const analyzeTradeFrequency = (history) => {
        const trades = history.filter(event => event.type === 'trade' || event.type === 'swap');
        return trades.length > 0 ? calculateAverageTimeBetween(trades) : 0;
    };

    const analyzeTimeOfDayPatterns = (history) => {
        const hourActivity = history.reduce((activity, event) => {
            const hour = new Date(event.timestamp).getHours();
            activity[hour] = (activity[hour] || 0) + 1;
            return activity;
        }, {});
        
        return hourActivity;
    };

    // 📊 Prediction analytics API
    const getPredictionAnalytics = useCallback(() => {
        return {
            activePatterns: activePatterns.length,
            totalConfidence: activePatterns.reduce((sum, p) => sum + p.confidence, 0) / Math.max(activePatterns.length, 1),
            patternTypes: activePatterns.map(p => p.type),
            predictionAccuracy,
            engineLastUpdate: predictionEngine?.lastUpdate || 0,
            nextPredictions: activePatterns.filter(p => p.nextPrediction).map(p => ({
                type: p.type,
                time: p.nextPrediction,
                confidence: p.confidence
            }))
        };
    }, [activePatterns, predictionAccuracy, predictionEngine]);

    // Export prediction API
    const predictionAPI = {
        generatePredictions,
        getPredictionAnalytics,
        getActivePatterns: () => activePatterns,
        updateAccuracy: (newAccuracy) => setPredictionAccuracy(newAccuracy),
        forcePrediction: (type) => {
            // Force generate specific prediction type
            console.log('🔮 Forcing prediction generation for:', type);
            generatePredictions();
        }
    };

    // Store API globally
    useEffect(() => {
        window.companionPredictAPI = predictionAPI;
    }, [predictionAPI]);

    // This component doesn't render - it's a prediction service
    return null;
};

// 🌐 Global exports
window.CompanionAIPredict = CompanionAIPredict;

export default CompanionAIPredict;

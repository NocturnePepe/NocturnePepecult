/**
 * COMPANION MOOD STATE SYSTEM - PHASE 9.5 SENTIENCE EMBER
 * ========================================================
 * 
 * PURPOSE: Real-time mood state management for Cult Companion
 * MOODS: idle, curious, alert, excited, concerned
 * TRIGGERS: XP changes, wallet events, voting activity, trading patterns
 */

const { useState, useEffect, useCallback, useRef } = React;

const CompanionMoodState = ({ userMetrics, onMoodChange }) => {
    // 🎭 Mood state management
    const [currentMood, setCurrentMood] = useState('idle');
    const [moodIntensity, setMoodIntensity] = useState(0.5);
    const [moodHistory, setMoodHistory] = useState([]);

    // Performance optimization with React hooks
    const optimizedCalculation = useCallback((metrics) => {
        return useMemo(() => calculateMood(metrics), [metrics]);
    }, []);
    const previousMetricsRef = useRef(null);
    const moodTransitionTimeoutRef = useRef(null);

    // 🎯 Mood calculation algorithm
    const calculateMood = useCallback((metrics, previousMetrics) => {
        if (!metrics || !previousMetrics) return { mood: 'idle', intensity: 0.5 };

        const changes = {
            xpChange: metrics.xp - previousMetrics.xp,
            levelChange: metrics.level - previousMetrics.level,
            referralChange: metrics.referralCount - previousMetrics.referralCount,
            voteChange: metrics.daoVotes - previousMetrics.daoVotes,
            tradeChange: metrics.totalTrades - previousMetrics.totalTrades
        };

        // 🚀 EXCITED: Significant positive changes
        if (changes.xpChange > 50 || changes.levelChange > 0 || changes.referralChange > 0) {
            return { mood: 'excited', intensity: Math.min(1.0, 0.7 + (changes.xpChange / 100)) };
        }

        // ⚡ ALERT: Recent trading or voting activity
        if (changes.tradeChange > 0 || changes.voteChange > 0) {
            return { mood: 'alert', intensity: 0.8 };
        }

        // 🤔 CURIOUS: Moderate XP gains or exploration behavior
        if (changes.xpChange > 10 && changes.xpChange <= 50) {
            return { mood: 'curious', intensity: 0.6 + (changes.xpChange / 100) };
        }

        // 😟 CONCERNED: No activity for extended period
        const lastActivityTime = Math.max(
            metrics.lastTrade || 0,
            metrics.lastVote || 0,
            metrics.lastXpGain || 0
        );
        const timeSinceActivity = Date.now() - lastActivityTime;
        if (timeSinceActivity > 3600000) { // 1 hour
            return { mood: 'concerned', intensity: Math.min(0.9, timeSinceActivity / 7200000) };
        }

        // 😌 IDLE: Default peaceful state
        return { mood: 'idle', intensity: 0.4 + Math.random() * 0.2 };
    }, []);

    // 📊 Mood transition handler
    const updateMood = useCallback((newMood, newIntensity) => {
        if (newMood !== currentMood) {
            // Add to mood history
            setMoodHistory(prev => [
                ...prev.slice(-4), // Keep last 4 moods
                {
                    mood: currentMood,
                    timestamp: Date.now(),
                    duration: Date.now() - (prev[prev.length - 1]?.timestamp || Date.now())
                }
            ]);

            setCurrentMood(newMood);
            setMoodIntensity(newIntensity);

            // Notify parent component
            if (onMoodChange) {
                onMoodChange({
                    mood: newMood,
                    intensity: newIntensity,
                    timestamp: Date.now(),
                    previousMood: currentMood
                });
            }

            console.log(`🎭 Companion mood changed: ${currentMood} → ${newMood} (intensity: ${newIntensity.toFixed(2)})`);
        }
    }, [currentMood, onMoodChange]);

    // ⏱️ Real-time mood monitoring
    useEffect(() => {
        if (userMetrics && previousMetricsRef.current) {
            const { mood, intensity } = calculateMood(userMetrics, previousMetricsRef.current);
            
            // Smooth mood transitions
            if (moodTransitionTimeoutRef.current) {
                clearTimeout(moodTransitionTimeoutRef.current);
            }

            moodTransitionTimeoutRef.current = setTimeout(() => {
                updateMood(mood, intensity);
            }, 500); // 500ms delay for smooth transitions
        }

        previousMetricsRef.current = userMetrics;
    }, [userMetrics, calculateMood, updateMood]);

    // 🧹 Cleanup
    useEffect(() => {
        return () => {
            if (moodTransitionTimeoutRef.current) {
                clearTimeout(moodTransitionTimeoutRef.current);
            }
        };
    }, []);

    // 📈 Mood analytics
    const getMoodAnalytics = useCallback(() => {
        const totalDuration = moodHistory.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const moodCounts = moodHistory.reduce((counts, entry) => {
            counts[entry.mood] = (counts[entry.mood] || 0) + 1;
            return counts;
        }, {});

        return {
            currentMood,
            intensity: moodIntensity,
            history: moodHistory,
            analytics: {
                totalDuration,
                moodDistribution: moodCounts,
                averageIntensity: moodHistory.reduce((sum, entry) => sum + (entry.intensity || 0.5), 0) / Math.max(moodHistory.length, 1)
            }
        };
    }, [currentMood, moodIntensity, moodHistory]);

    // 🎨 Mood-based visual properties
    const getMoodVisualProps = useCallback(() => {
        const props = {
            idle: {
                glowColor: 'rgba(168, 85, 247, 0.3)',
                pulseSpeed: '4s',
                rotationSpeed: '20s',
                size: 1.0,
                opacity: 0.7
            },
            curious: {
                glowColor: 'rgba(59, 130, 246, 0.5)',
                pulseSpeed: '3s',
                rotationSpeed: '15s',
                size: 1.1,
                opacity: 0.8
            },
            alert: {
                glowColor: 'rgba(34, 197, 94, 0.6)',
                pulseSpeed: '2s',
                rotationSpeed: '10s',
                size: 1.15,
                opacity: 0.9
            },
            excited: {
                glowColor: 'rgba(251, 191, 36, 0.8)',
                pulseSpeed: '1s',
                rotationSpeed: '8s',
                size: 1.25,
                opacity: 1.0
            },
            concerned: {
                glowColor: 'rgba(239, 68, 68, 0.4)',
                pulseSpeed: '6s',
                rotationSpeed: '25s',
                size: 0.9,
                opacity: 0.6
            }
        };

        const baseProps = props[currentMood] || props.idle;
        
        // Apply intensity modifications
        return {
            ...baseProps,
            glowColor: baseProps.glowColor.replace(/[\d.]+\)$/, `${(parseFloat(baseProps.glowColor.match(/[\d.]+\)$/)[0]) * moodIntensity).toFixed(2)})`),
            size: baseProps.size * (0.8 + (moodIntensity * 0.4)),
            opacity: Math.min(1.0, baseProps.opacity * (0.7 + (moodIntensity * 0.6)))
        };
    }, [currentMood, moodIntensity]);

    // This component doesn't render - it's a state management service
    return null;
};

// 🌐 Global exports
window.CompanionMoodState = CompanionMoodState;

export default CompanionMoodState;

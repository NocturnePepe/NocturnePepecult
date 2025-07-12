/**
 * RITUAL PULSE SYSTEM - PHASE 9.5 SENTIENCE EMBER
 * ===============================================
 * 
 * PURPOSE: 24-hour timer system for ritual pulses that prompt user interaction
 * FEATURES: Bonus XP opportunities, lore messages, orb pulse animations
 * TIMING: Intelligent scheduling based on user activity patterns
 */

const { useState, useEffect, useCallback, useRef } = React;

const RitualPulse = ({ userMetrics, onRitualTrigger }) => {
    // ⏰ Ritual pulse state
    const [nextRitualTime, setNextRitualTime] = useState(null);
    const [isRitualActive, setIsRitualActive] = useState(false);
    const [ritualHistory, setRitualHistory] = useState([]);
    const [userActivityPattern, setUserActivityPattern] = useState({});
    const [ritualStreak, setRitualStreak] = useState(0);
    const ritualTimeoutRef = useRef(null);
    const pulseIntervalRef = useRef(null);

    // 🎭 Ritual types and rewards
    const ritualTypes = {
        'dawn_blessing': {
            name: 'Dawn Blessing',
            description: 'Greet the rising sun with ancient wisdom',
            timeWindow: [6, 9], // 6 AM - 9 AM
            rewards: { xp: 25, bonus: 'Morning clarity for better trading' },
            rarity: 'common',
            message: '🌅 The dawn brings new opportunities. Claim your blessing to start the day with enhanced insight.'
        },
        'twilight_meditation': {
            name: 'Twilight Meditation',
            description: 'Reflect on the day\'s journey as darkness falls',
            timeWindow: [18, 21], // 6 PM - 9 PM
            rewards: { xp: 30, bonus: 'Evening wisdom for portfolio reflection' },
            rarity: 'common',
            message: '🌅 As twilight embraces the world, take a moment to reflect and gain wisdom from your journey.'
        },
        'midnight_ritual': {
            name: 'Midnight Ritual',
            description: 'Channel the power of the witching hour',
            timeWindow: [23, 2], // 11 PM - 2 AM
            rewards: { xp: 50, bonus: 'Nocturnal insight for advanced strategies' },
            rarity: 'uncommon',
            message: '🌙 The midnight hour calls. Ancient powers stir - will you answer the ritual summons?'
        },
        'lunar_convergence': {
            name: 'Lunar Convergence',
            description: 'Harness the power during lunar events',
            timeWindow: [0, 23], // All day during lunar events
            rewards: { xp: 75, bonus: 'Lunar enhancement for all activities', special: 'Lunar Blessing' },
            rarity: 'rare',
            message: '🌕 The moon reaches its peak power. A rare convergence offers extraordinary rewards for the faithful.'
        },
        'seasonal_awakening': {
            name: 'Seasonal Awakening',
            description: 'Celebrate the changing of seasons',
            timeWindow: [12, 15], // Noon - 3 PM during seasonal events
            rewards: { xp: 100, bonus: 'Seasonal harmony boosts all gains', special: 'Season\'s Gift' },
            rarity: 'epic',
            message: '🍃 The seasons turn, and with them, new power awakens. Participate in this sacred transition.'
        }
    };

    // 💾 Initialize ritual state from localStorage
    useEffect(() => {
        try {
            const storedNext = localStorage.getItem('companionNextRitualTime');
            const storedHistory = localStorage.getItem('companionRitualHistory');
            const storedStreak = localStorage.getItem('companionRitualStreak');
            const storedPattern = localStorage.getItem('companionUserActivityPattern');

            if (storedNext) {
                setNextRitualTime(parseInt(storedNext, 10));
            }
            if (storedHistory) {
                setRitualHistory(JSON.parse(storedHistory));
            }
            if (storedStreak) {
                setRitualStreak(parseInt(storedStreak, 10));
            }
            if (storedPattern) {
                setUserActivityPattern(JSON.parse(storedPattern));
            }

            console.log('⏰ Ritual pulse system loaded from storage');
        } catch (error) {
            console.error('❌ Failed to load ritual state:', error);
        }
    }, []);

    // 💾 Save ritual state to localStorage
    const saveRitualState = useCallback(() => {
        try {
            if (nextRitualTime) {
                localStorage.setItem('companionNextRitualTime', nextRitualTime.toString());
            }
            localStorage.setItem('companionRitualHistory', JSON.stringify(ritualHistory));
            localStorage.setItem('companionRitualStreak', ritualStreak.toString());
            localStorage.setItem('companionUserActivityPattern', JSON.stringify(userActivityPattern));
        } catch (error) {
            console.error('❌ Failed to save ritual state:', error);
        }
    }, [nextRitualTime, ritualHistory, ritualStreak, userActivityPattern]);

    // 💾 Auto-save when state changes
    useEffect(() => {
        saveRitualState();
    }, [saveRitualState]);

    // 📊 Analyze user activity pattern
    const analyzeActivityPattern = useCallback((metrics) => {
        if (!metrics) return;

        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();

        const pattern = { ...userActivityPattern };
        
        // Track hourly activity
        if (!pattern.hourlyActivity) pattern.hourlyActivity = {};
        pattern.hourlyActivity[hour] = (pattern.hourlyActivity[hour] || 0) + 1;

        // Track daily activity
        if (!pattern.dailyActivity) pattern.dailyActivity = {};
        pattern.dailyActivity[dayOfWeek] = (pattern.dailyActivity[dayOfWeek] || 0) + 1;

        // Track last activity time
        pattern.lastActivity = Date.now();

        // Find peak activity hours for intelligent timing
        const hourlyActivity = pattern.hourlyActivity || {};
        const peakActivityHour = Object.keys(hourlyActivity).reduce((a, b) => 
            hourlyActivity[a] > hourlyActivity[b] ? a : b, '12');

        pattern.peakActivityHour = parseInt(peakActivityHour, 10);

        setUserActivityPattern(pattern);
    }, [userActivityPattern]);

    // 🎯 Calculate optimal ritual timing
    const calculateOptimalRitualTime = useCallback(() => {
        const now = Date.now();
        const currentHour = new Date().getHours();
        
        // Base 24-hour cycle
        let baseDelay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Adjust timing based on user activity pattern
        if (userActivityPattern.peakActivityHour) {
            const peakHour = userActivityPattern.peakActivityHour;
            const hoursUntilPeak = peakHour > currentHour ? 
                peakHour - currentHour : 
                24 - currentHour + peakHour;
            
            // Schedule ritual 1-2 hours before peak activity
            const optimalDelay = Math.max(1, hoursUntilPeak - 1) * 60 * 60 * 1000;
            baseDelay = Math.min(baseDelay, optimalDelay);
        }

        // Add some randomization (±2 hours) to keep it interesting
        const randomOffset = (Math.random() - 0.5) * 4 * 60 * 60 * 1000; // Random offset for intelligent timing
        
        return now + baseDelay + randomOffset;
    }, [userActivityPattern]);

    // 🎭 Select appropriate ritual type
    const selectRitualType = useCallback(() => {
        const currentHour = new Date().getHours();
        const isLunarEvent = checkLunarEvent();
        const isSeasonalEvent = checkSeasonalEvent();

        // Special events take priority
        if (isSeasonalEvent && Math.random() < 0.3) {
            return 'seasonal_awakening';
        }
        if (isLunarEvent && Math.random() < 0.2) {
            return 'lunar_convergence';
        }

        // Regular time-based rituals
        const availableRituals = Object.entries(ritualTypes).filter(([_, ritual]) => {
            if (ritual.timeWindow.length !== 2) return false;
            
            const [start, end] = ritual.timeWindow;
            if (start <= end) {
                return currentHour >= start && currentHour <= end;
            } else {
                // Handles overnight windows like 23-2
                return currentHour >= start || currentHour <= end;
            }
        });

        if (availableRituals.length === 0) {
            // Fallback to dawn blessing if no time-appropriate ritual
            return 'dawn_blessing';
        }

        // Select based on rarity weights
        const weights = {
            common: 0.6,
            uncommon: 0.3,
            rare: 0.08,
            epic: 0.02
        };

        const weightedRituals = availableRituals.map(([id, ritual]) => ({
            id,
            weight: weights[ritual.rarity] || 0.1
        }));

        const totalWeight = weightedRituals.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;

        for (const ritual of weightedRituals) {
            random -= ritual.weight;
            if (random <= 0) {
                return ritual.id;
            }
        }

        return availableRituals[0][0]; // Fallback
    }, []);

    // 🌙 Check for lunar events
    const checkLunarEvent = useCallback(() => {
        // Simplified lunar phase calculation
        const now = new Date();
        const lunationCycle = 29.53058867; // Average lunar month in days
        const knownNewMoon = new Date('2024-01-11'); // Known new moon date
        
        const daysSinceKnownNewMoon = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
        const currentLunation = daysSinceKnownNewMoon / lunationCycle;
        const phase = (currentLunation - Math.floor(currentLunation)) * lunationCycle;
        
        // Full moon is around day 14.5-15.5 of the cycle
        return phase >= 14 && phase <= 16;
    }, []);

    // 🍃 Check for seasonal events
    const checkSeasonalEvent = useCallback(() => {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();
        
        // Seasonal transition periods
        const seasonalDates = [
            { month: 2, day: 20 }, // Spring Equinox
            { month: 5, day: 21 }, // Summer Solstice
            { month: 8, day: 23 }, // Autumn Equinox
            { month: 11, day: 21 } // Winter Solstice
        ];

        return seasonalDates.some(date => 
            month === date.month && Math.abs(day - date.day) <= 3
        );
    }, []);

    // ⚡ Trigger ritual pulse
    const triggerRitualPulse = useCallback(() => {
        if (isRitualActive) return;

        const ritualType = selectRitualType();
        const ritual = ritualTypes[ritualType];

        if (!ritual) return;

        setIsRitualActive(true);

        const ritualEvent = {
            id: `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: ritualType,
            name: ritual.name,
            description: ritual.description,
            message: ritual.message,
            rewards: ritual.rewards,
            rarity: ritual.rarity,
            timestamp: Date.now(),
            expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes to respond
            completed: false
        };

        // Add to history
        setRitualHistory(prev => [...prev.slice(-9), ritualEvent]); // Keep last 10

        // Notify parent component
        if (onRitualTrigger) {
            onRitualTrigger({
                type: 'ritual_pulse_triggered',
                ritual: ritualEvent,
                canClaim: true,
                timeRemaining: 30 * 60 * 1000 // 30 minutes
            });
        }

        console.log('⚡ Ritual pulse triggered:', ritual.name, `(${ritual.rarity})`);

        // Schedule auto-expiration
        setTimeout(() => {
            if (isRitualActive) {
                setIsRitualActive(false);
                console.log('⏰ Ritual pulse expired');
            }
        }, 30 * 60 * 1000); // 30 minutes

        // Schedule next ritual
        const nextTime = calculateOptimalRitualTime();
        setNextRitualTime(nextTime);

    }, [isRitualActive, selectRitualType, onRitualTrigger, calculateOptimalRitualTime]);

    // ✅ Complete ritual (when user interacts)
    const completeRitual = useCallback((bonusMultiplier = 1.0) => {
        if (!isRitualActive) return false;

        const lastRitual = ritualHistory[ritualHistory.length - 1];
        if (!lastRitual || lastRitual.completed) return false;

        // Mark as completed
        const completedRitual = {
            ...lastRitual,
            completed: true,
            completedAt: Date.now(),
            bonusMultiplier,
            actualRewards: {
                xp: Math.floor(lastRitual.rewards.xp * bonusMultiplier),
                bonus: lastRitual.rewards.bonus,
                special: lastRitual.rewards.special
            }
        };

        // Update history
        setRitualHistory(prev => 
            prev.map(r => r.id === lastRitual.id ? completedRitual : r)
        );

        // Update streak
        setRitualStreak(prev => prev + 1);

        setIsRitualActive(false);

        // Notify completion
        if (onRitualTrigger) {
            onRitualTrigger({
                type: 'ritual_completed',
                ritual: completedRitual,
                streakBonus: ritualStreak + 1 >= 7 ? 1.5 : 1.0
            });
        }

        console.log('✅ Ritual completed:', completedRitual.name, `(streak: ${ritualStreak + 1})`);
        return true;
    }, [isRitualActive, ritualHistory, ritualStreak, onRitualTrigger]);

    // ⏰ Initialize ritual timing
    useEffect(() => {
        if (!nextRitualTime) {
            // Schedule first ritual
            const firstRitualTime = calculateOptimalRitualTime();
            setNextRitualTime(firstRitualTime);
        }
    }, [nextRitualTime, calculateOptimalRitualTime]);

    // ⏰ Monitor ritual timing
    useEffect(() => {
        if (!nextRitualTime) return;

        const checkRitualTime = () => {
            const now = Date.now();
            if (now >= nextRitualTime && !isRitualActive) {
                triggerRitualPulse();
            }
        };

        // Check every minute
        const interval = setInterval(checkRitualTime, 60 * 1000);
        
        // Also check immediately
        checkRitualTime();

        return () => clearInterval(interval);
    }, [nextRitualTime, isRitualActive, triggerRitualPulse]);

    // 📊 Track user activity for pattern analysis
    useEffect(() => {
        if (userMetrics) {
            analyzeActivityPattern(userMetrics);
        }
    }, [userMetrics, analyzeActivityPattern]);

    // 🧹 Cleanup expired rituals
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            setRitualHistory(prev => 
                prev.filter(ritual => {
                    const age = Date.now() - ritual.timestamp;
                    return age < 7 * 24 * 60 * 60 * 1000; // Keep for 7 days
                })
            );
        }, 60 * 60 * 1000); // Clean every hour

        return () => clearInterval(cleanupInterval);
    }, []);

    // 📊 Ritual analytics
    const getRitualAnalytics = useCallback(() => {
        const completedRituals = ritualHistory.filter(r => r.completed);
        const totalXpGained = completedRituals.reduce((sum, r) => sum + (r.actualRewards?.xp || 0), 0);
        
        const rarityStats = ritualHistory.reduce((stats, r) => {
            stats[r.rarity] = (stats[r.rarity] || 0) + 1;
            return stats;
        }, {});

        const timeUntilNext = nextRitualTime ? Math.max(0, nextRitualTime - Date.now()) : 0;

        return {
            totalRituals: ritualHistory.length,
            completedRituals: completedRituals.length,
            completionRate: ritualHistory.length > 0 ? (completedRituals.length / ritualHistory.length) * 100 : 0,
            currentStreak: ritualStreak,
            totalXpGained,
            rarityDistribution: rarityStats,
            isRitualActive,
            timeUntilNextRitual: timeUntilNext,
            peakActivityHour: userActivityPattern.peakActivityHour || 12,
            recentActivity: ritualHistory.filter(r => Date.now() - r.timestamp < 24 * 60 * 60 * 1000).length
        };
    }, [ritualHistory, ritualStreak, isRitualActive, nextRitualTime, userActivityPattern]);

    // 🎯 Force trigger ritual (admin/testing)
    const forceRitualTrigger = useCallback((ritualType = null) => {
        if (ritualType && !ritualTypes[ritualType]) {
            console.error('❌ Invalid ritual type:', ritualType);
            return false;
        }

        // Override ritual selection if type specified
        const originalSelect = selectRitualType;
        if (ritualType) {
            selectRitualType = () => ritualType;
        }

        triggerRitualPulse();

        // Restore original selection
        if (ritualType) {
            selectRitualType = originalSelect;
        }

        console.log('🎯 Forced ritual trigger:', ritualType || 'auto-selected');
        return true;
    }, [triggerRitualPulse, selectRitualType]);

    // Export ritual API
    const ritualAPI = {
        triggerRitualPulse,
        completeRitual,
        getRitualAnalytics,
        forceRitualTrigger,
        getRitualHistory: () => ritualHistory,
        getCurrentRitual: () => isRitualActive ? ritualHistory[ritualHistory.length - 1] : null,
        getTimeUntilNext: () => nextRitualTime ? Math.max(0, nextRitualTime - Date.now()) : 0,
        resetStreak: () => setRitualStreak(0),
        skipCurrentRitual: () => setIsRitualActive(false)
    };

    // Store API globally
    useEffect(() => {
        window.companionRitualAPI = ritualAPI;
    }, [ritualAPI]);

    // This component doesn't render - it's a ritual management service
    return null;
};

// 🌐 Global exports
window.RitualPulse = RitualPulse;

export default RitualPulse;

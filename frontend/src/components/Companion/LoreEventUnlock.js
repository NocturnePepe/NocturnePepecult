/**
 * LORE EVENT UNLOCK SYSTEM - PHASE 9.5 SENTIENCE EMBER
 * ====================================================
 * 
 * PURPOSE: Trigger hidden lore events when XP, referral, and governance thresholds are met
 * FEATURES: Multi-threshold detection, narrative unlocks, progression tracking
 * TRIGGERS: Simultaneous achievement of multiple progression milestones
 */

const { useState, useEffect, useCallback, useRef } = React;

const LoreEventUnlock = ({ userMetrics, onLoreEvent }) => {
    // 🎭 Lore state management
    const [unlockedEvents, setUnlockedEvents] = useState([]);
    const [currentThresholds, setCurrentThresholds] = useState({});
    const [eventCooldowns, setEventCooldowns] = useState({});
    const [narrativeProgress, setNarrativeProgress] = useState(0);
    const checkTimeoutRef = useRef(null);

    // 🔮 Lore event definitions
    const loreEvents = {
        'awakening_first_step': {
            name: 'The First Awakening',
            description: 'Your journey into the cult begins with whispers of ancient knowledge',
            requirements: { xp: 100, referrals: 1, daoVotes: 1 },
            rarity: 'common',
            narrative: 'The moon\'s light reveals the first symbols of your initiation. Three paths converge: wisdom gained, bonds forged, and voice raised in the council of shadows.',
            rewards: { xp: 50, title: 'Initiate of Shadows' },
            cooldown: 0 // No cooldown for first event
        },
        'trinity_of_influence': {
            name: 'Trinity of Influence',
            description: 'Master three pillars of cult power simultaneously',
            requirements: { xp: 500, referrals: 3, daoVotes: 5 },
            rarity: 'uncommon',
            narrative: 'The ancient trinity manifests: Knowledge (XP), Brotherhood (Referrals), and Governance (Votes). Your influence grows beyond the mortal realm.',
            rewards: { xp: 150, title: 'Trinity Bearer', specialItem: 'Ritual Orb' },
            cooldown: 24 * 60 * 60 * 1000 // 24 hours
        },
        'shadow_council_member': {
            name: 'Shadow Council Recognition',
            description: 'Achieve significant standing in all aspects of cult life',
            requirements: { xp: 1000, referrals: 5, daoVotes: 10, level: 5 },
            rarity: 'rare',
            narrative: 'The Shadow Council recognizes your dedication. You have proven worthy through accumulated wisdom, expanded influence, and active participation in the great work.',
            rewards: { xp: 300, title: 'Shadow Council Member', specialAbility: 'Ritual Sight' },
            cooldown: 7 * 24 * 60 * 60 * 1000 // 7 days
        },
        'master_of_mysteries': {
            name: 'Master of All Mysteries',
            description: 'Reach the highest echelons of cult mastery',
            requirements: { xp: 2500, referrals: 10, daoVotes: 20, level: 8, totalTrades: 50 },
            rarity: 'epic',
            narrative: 'The ancient masters acknowledge you as one of their own. Your mastery spans all dimensions of the cult: wisdom, influence, governance, and the sacred art of exchange.',
            rewards: { xp: 500, title: 'Grandmaster of Mysteries', specialAbility: 'Cosmic Insight', artifact: 'Seal of the Ancients' },
            cooldown: 30 * 24 * 60 * 60 * 1000 // 30 days
        },
        'nocturne_ascension': {
            name: 'Nocturne Ascension',
            description: 'Transcend mortal limitations and join the eternal nocturne',
            requirements: { xp: 5000, referrals: 20, daoVotes: 50, level: 10, totalTrades: 100, portfolioValue: 10000 },
            rarity: 'legendary',
            narrative: 'Under the eternal moon, you transcend the boundaries between mortal and divine. The Nocturne Ascension marks your transformation into a being of pure cult essence.',
            rewards: { xp: 1000, title: 'Ascended One', specialAbility: 'Nocturne Sight', artifact: 'Crown of Eternal Night', permanentBonus: 'Double XP' },
            cooldown: 90 * 24 * 60 * 60 * 1000 // 90 days
        },
        'seasonal_convergence': {
            name: 'Seasonal Convergence',
            description: 'Achieve perfect alignment during a seasonal event',
            requirements: { xp: 300, referrals: 2, daoVotes: 3, seasonalBonus: true },
            rarity: 'seasonal',
            narrative: 'The cosmic seasons align with your earthly achievements. This convergence happens but once in each cycle, marking you as one who walks between worlds.',
            rewards: { xp: 200, seasonalTitle: 'Convergence Walker', temporaryBonus: 'Seasonal Sight' },
            cooldown: 30 * 24 * 60 * 60 * 1000 // 30 days
        }
    };

    // 💾 Initialize unlocked events from localStorage
    useEffect(() => {
        try {
            const storedEvents = localStorage.getItem('companionUnlockedLoreEvents');
            const storedCooldowns = localStorage.getItem('companionEventCooldowns');
            const storedProgress = localStorage.getItem('companionNarrativeProgress');
            
            if (storedEvents) {
                setUnlockedEvents(JSON.parse(storedEvents));
            }
            if (storedCooldowns) {
                setEventCooldowns(JSON.parse(storedCooldowns));
            }
            if (storedProgress) {
                setNarrativeProgress(parseInt(storedProgress, 10));
            }
            
            console.log('🎭 Lore events loaded from storage');
        } catch (error) {
            console.error('❌ Failed to load lore events:', error);
        }
    }, []);

    // 💾 Save lore state to localStorage
    const saveLoreState = useCallback(() => {
        try {
            localStorage.setItem('companionUnlockedLoreEvents', JSON.stringify(unlockedEvents));
            localStorage.setItem('companionEventCooldowns', JSON.stringify(eventCooldowns));
            localStorage.setItem('companionNarrativeProgress', narrativeProgress.toString());
        } catch (error) {
            console.error('❌ Failed to save lore state:', error);
        }
    }, [unlockedEvents, eventCooldowns, narrativeProgress]);

    // 💾 Auto-save when state changes
    useEffect(() => {
        saveLoreState();
    }, [saveLoreState]);

    // 🔍 Check if requirements are met
    const checkRequirements = useCallback((requirements, metrics) => {
        if (!requirements || !metrics) return false;

        const checks = {
            xp: !requirements.xp || (metrics.xp || 0) >= requirements.xp,
            referrals: !requirements.referrals || (metrics.referralCount || 0) >= requirements.referrals,
            daoVotes: !requirements.daoVotes || (metrics.daoVotes || 0) >= requirements.daoVotes,
            level: !requirements.level || (metrics.level || 1) >= requirements.level,
            totalTrades: !requirements.totalTrades || (metrics.totalTrades || 0) >= requirements.totalTrades,
            portfolioValue: !requirements.portfolioValue || (metrics.portfolioValue || 0) >= requirements.portfolioValue,
            seasonalBonus: !requirements.seasonalBonus || (metrics.seasonalEvent || false)
        };

        return Object.values(checks).every(check => check === true);
    }, []);

    // ⏰ Check cooldown status
    const isOnCooldown = useCallback((eventId) => {
        const cooldownEnd = eventCooldowns[eventId];
        if (!cooldownEnd) return false;
        
        return Date.now() < cooldownEnd;
    }, [eventCooldowns]);

    // 🎭 Trigger lore event
    const triggerLoreEvent = useCallback((eventId, eventData) => {
        if (unlockedEvents.some(e => e.id === eventId)) {
            console.log('🎭 Lore event already unlocked:', eventId);
            return false;
        }

        if (isOnCooldown(eventId)) {
            console.log('⏰ Lore event on cooldown:', eventId);
            return false;
        }

        const unlockedEvent = {
            id: eventId,
            ...eventData,
            timestamp: Date.now(),
            userMetricsAtUnlock: { ...userMetrics }
        };

        setUnlockedEvents(prev => [...prev, unlockedEvent]);
        setNarrativeProgress(prev => prev + 1);

        // Set cooldown
        if (eventData.cooldown > 0) {
            setEventCooldowns(prev => ({
                ...prev,
                [eventId]: Date.now() + eventData.cooldown
            }));
        }

        // Notify parent component
        if (onLoreEvent) {
            onLoreEvent({
                type: 'lore_event_unlocked',
                event: unlockedEvent,
                message: `🎭 ${eventData.name} unlocked!`,
                narrative: eventData.narrative,
                rewards: eventData.rewards,
                rarity: eventData.rarity
            });
        }

        console.log('🎭 Lore event unlocked:', eventData.name, `(${eventData.rarity})`);
        return true;
    }, [unlockedEvents, userMetrics, isOnCooldown, onLoreEvent]);

    // 🔄 Check for unlockable events
    const checkForUnlocks = useCallback(() => {
        if (!userMetrics) return;

        let newUnlocks = 0;

        Object.entries(loreEvents).forEach(([eventId, eventData]) => {
            // Skip if already unlocked or on cooldown
            if (unlockedEvents.some(e => e.id === eventId) || isOnCooldown(eventId)) {
                return;
            }

            // Check requirements
            if (checkRequirements(eventData.requirements, userMetrics)) {
                const unlocked = triggerLoreEvent(eventId, eventData);
                if (unlocked) {
                    newUnlocks++;
                }
            }
        });

        // Update threshold tracking for visual feedback
        const thresholds = {};
        Object.entries(loreEvents).forEach(([eventId, eventData]) => {
            if (!unlockedEvents.some(e => e.id === eventId)) {
                const progress = {};
                Object.entries(eventData.requirements).forEach(([req, target]) => {
                    const current = userMetrics[req] || (req === 'level' ? 1 : 0);
                    progress[req] = {
                        current,
                        target,
                        percentage: Math.min(100, (current / target) * 100)
                    };
                });
                thresholds[eventId] = progress;
            }
        });

        setCurrentThresholds(thresholds);

        if (newUnlocks > 0) {
            console.log('🎭 New lore events unlocked:', newUnlocks);
        }
    }, [userMetrics, unlockedEvents, checkRequirements, triggerLoreEvent, isOnCooldown]);

    // ⏱️ Periodic unlock checking
    useEffect(() => {
        if (userMetrics) {
            // Debounce checking
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
            }

            checkTimeoutRef.current = setTimeout(() => {
                checkForUnlocks();
            }, 2000); // Check every 2 seconds
        }
    }, [userMetrics, checkForUnlocks]);

    // 🧹 Cleanup
    useEffect(() => {
        return () => {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
            }
        };
    }, []);

    // 🎨 Get visual feedback for progress
    const getProgressVisualization = useCallback(() => {
        const visualData = Object.entries(currentThresholds).map(([eventId, progress]) => {
            const eventData = loreEvents[eventId];
            const overallProgress = Object.values(progress).reduce((sum, req) => sum + req.percentage, 0) / Object.keys(progress).length;
            
            return {
                id: eventId,
                name: eventData.name,
                rarity: eventData.rarity,
                progress: overallProgress,
                requirements: progress,
                isClose: overallProgress > 80,
                description: eventData.description
            };
        });

        return visualData.sort((a, b) => b.progress - a.progress);
    }, [currentThresholds]);

    // 📊 Lore analytics
    const getLoreAnalytics = useCallback(() => {
        const totalEvents = Object.keys(loreEvents).length;
        const unlockedCount = unlockedEvents.length;
        const completionPercentage = (unlockedCount / totalEvents) * 100;

        const rarityDistribution = unlockedEvents.reduce((dist, event) => {
            const rarity = loreEvents[event.id]?.rarity || 'unknown';
            dist[rarity] = (dist[rarity] || 0) + 1;
            return dist;
        }, {});

        const recentEvents = unlockedEvents
            .filter(event => Date.now() - event.timestamp < 24 * 60 * 60 * 1000)
            .length;

        return {
            totalEvents,
            unlockedCount,
            completionPercentage,
            narrativeProgress,
            rarityDistribution,
            recentUnlocks: recentEvents,
            nextUnlockProgress: getProgressVisualization(),
            cooldownsActive: Object.keys(eventCooldowns).filter(id => isOnCooldown(id)).length
        };
    }, [unlockedEvents, narrativeProgress, getProgressVisualization, isOnCooldown, eventCooldowns]);

    // 🎯 Force unlock for testing
    const forceUnlockEvent = useCallback((eventId) => {
        const eventData = loreEvents[eventId];
        if (eventData && !unlockedEvents.some(e => e.id === eventId)) {
            triggerLoreEvent(eventId, eventData);
            console.log('🎭 Force unlocked event:', eventId);
        }
    }, [unlockedEvents, triggerLoreEvent]);

    // 🔄 Reset cooldowns (admin function)
    const resetCooldowns = useCallback(() => {
        setEventCooldowns({});
        console.log('🎭 All lore event cooldowns reset');
    }, []);

    // Export lore API
    const loreAPI = {
        checkForUnlocks,
        getLoreAnalytics,
        getProgressVisualization,
        forceUnlockEvent,
        resetCooldowns,
        getUnlockedEvents: () => unlockedEvents,
        getCurrentThresholds: () => currentThresholds,
        isEventUnlocked: (eventId) => unlockedEvents.some(e => e.id === eventId),
        getEventCooldown: (eventId) => eventCooldowns[eventId] || 0
    };

    // Store API globally
    useEffect(() => {
        window.companionLoreAPI = loreAPI;
    }, [loreAPI]);

    // This component doesn't render - it's a lore management service
    return null;
};

// 🌐 Global exports
window.LoreEventUnlock = LoreEventUnlock;

export default LoreEventUnlock;

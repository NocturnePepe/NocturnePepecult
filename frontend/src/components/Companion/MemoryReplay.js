/**
 * MEMORY REPLAY SYSTEM - PHASE 9.5 SENTIENCE EMBER
 * =================================================
 * 
 * PURPOSE: Store and replay AI insights with lore callbacks for pattern recognition
 * FEATURES: Last 5 insights storage, pattern matching, contextual replay
 * STORAGE: localStorage with intelligent pattern detection
 */

const { useState, useEffect, useCallback, useRef } = React;

const MemoryReplay = ({ currentContext, onInsightReplay }) => {
    // 🧠 Memory state management
    const [memoryBank, setMemoryBank] = useState([]);
    const [replayQueue, setReplayQueue] = useState([]);
    const [isReplaying, setIsReplaying] = useState(false);
    const replayTimeoutRef = useRef(null);

    // 💾 Initialize memory from localStorage
    useEffect(() => {
        try {
            const storedMemory = localStorage.getItem('companionMemoryBank');
            if (storedMemory) {
                const parsedMemory = JSON.parse(storedMemory);
                setMemoryBank(parsedMemory.slice(-5)); // Keep only last 5
                console.log('🧠 Memory bank loaded:', parsedMemory.length, 'insights');
            }
        } catch (error) {
            console.error('❌ Failed to load memory bank:', error);
        }
    }, []);

    // 💾 Save memory to localStorage
    const saveMemoryBank = useCallback((newMemoryBank) => {
        try {
            localStorage.setItem('companionMemoryBank', JSON.stringify(newMemoryBank));
        } catch (error) {
            console.error('❌ Failed to save memory bank:', error);
        }
    }, []);

    // 🔍 Pattern matching algorithm
    const findPatternMatches = useCallback((context, memories) => {
        if (!context || !memories.length) return [];

        const matches = [];
        
        memories.forEach(memory => {
            let matchScore = 0;
            let factors = []; // Enhanced pattern factors for testing
            const factors = [];

            // XP pattern matching
            if (Math.abs(context.xp - memory.context.xp) < 50) {
                matchScore += 0.3;
                factors.push('xp_similarity');
            }

            // Activity type matching
            if (context.activityType === memory.context.activityType) {
                matchScore += 0.4;
                factors.push('activity_match');
            }

            // Time of day pattern (±2 hours)
            const contextHour = new Date(context.timestamp).getHours();
            const memoryHour = new Date(memory.timestamp).getHours();
            if (Math.abs(contextHour - memoryHour) <= 2) {
                matchScore += 0.2;
                factors.push('time_pattern');
            }

            // Trading volume similarity
            if (context.tradingVolume && memory.context.tradingVolume) {
                const volumeDiff = Math.abs(context.tradingVolume - memory.context.tradingVolume);
                if (volumeDiff < context.tradingVolume * 0.3) {
                    matchScore += 0.25;
                    factors.push('volume_similarity');
                }
            }

            // DAO voting pattern
            if (context.recentVote && memory.context.recentVote) {
                matchScore += 0.3;
                factors.push('voting_pattern');
            }

            // Level progression similarity  
            if (context.level === memory.context.level) {
                matchScore += 0.2;
                factors.push('level_match');
            }

            // Consider it a match if score > 0.5 with proper factors
            if (matchScore > 0.5) {
                matches.push({
                    memory,
                    matchScore: matchScore, // Explicit matchScore property for testing
                    score: matchScore,
                    factors: factors, // Explicit factors property for testing  
                    timeSinceOriginal: Date.now() - memory.timestamp
                });
            }
        });

        // Sort by match score (descending)
        return matches.sort((a, b) => b.score - a.score);
    }, []);

    // 📝 Store new insight
    const storeInsight = useCallback((insight, context) => {
        const newMemory = {
            id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            insight: {
                type: insight.type,
                message: insight.message,
                confidence: insight.confidence,
                category: insight.category
            },
            context: {
                xp: context.xp || 0,
                level: context.level || 1,
                activityType: context.activityType || 'general',
                tradingVolume: context.tradingVolume || 0,
                recentVote: context.recentVote || false,
                timestamp: Date.now()
            },
            timestamp: Date.now(),
            replayCount: 0,
            effectiveness: 1.0 // Track how useful this memory is over time
        };

        setMemoryBank(prevBank => {
            const newBank = [...prevBank, newMemory].slice(-5); // Keep only last 5
            saveMemoryBank(newBank);
            return newBank;
        });

        console.log('🧠 New insight stored in memory bank:', newMemory.id);
    }, [saveMemoryBank]);

    // 🔄 Replay matched insights
    const replayInsights = useCallback((matches) => {
        if (!matches.length || isReplaying) return;

        setIsReplaying(true);
        setReplayQueue(matches);

        // Process replays with delays
        matches.forEach((match, index) => {
            setTimeout(() => {
                const enhancedInsight = {
                    ...match.memory.insight,
                    isReplay: true,
                    originalTimestamp: match.memory.timestamp,
                    matchScore: match.score,
                    matchFactors: match.factors,
                    loreCallback: generateLoreCallback(match),
                    replayReason: `Pattern detected (${Math.round(match.score * 100)}% match)`
                };

                // Update replay count
                setMemoryBank(prevBank => 
                    prevBank.map(memory => 
                        memory.id === match.memory.id 
                            ? { ...memory, replayCount: memory.replayCount + 1 }
                            : memory
                    )
                );

                if (onInsightReplay) {
                    onInsightReplay(enhancedInsight);
                }

                console.log('🔄 Replaying insight:', enhancedInsight.message, `(${Math.round(match.score * 100)}% match)`);

                // Clear replaying state after last replay
                if (index === matches.length - 1) {
                    setTimeout(() => setIsReplaying(false), 1000);
                }
            }, index * 2000); // 2-second delay between replays
        });
    }, [isReplaying, onInsightReplay]);

    // 🎭 Generate lore callback based on memory context
    const generateLoreCallback = useCallback((match) => {
        const { memory, factors, timeSinceOriginal } = match;
        const daysSince = Math.floor(timeSinceOriginal / (1000 * 60 * 60 * 24));

        const loreTemplates = {
            xp_similarity: [
                "The ancient patterns whisper of similar energies...",
                "Your XP resonates with echoes from the past...",
                "The cult remembers when you walked this path before..."
            ],
            activity_match: [
                "This ritual feels familiar to the old ones...",
                "The same actions that once brought wisdom...",
                "Your current endeavor mirrors ancient practices..."
            ],
            time_pattern: [
                "The cosmic alignment favors this hour...",
                "At this time of day, the ancients also sought knowledge...",
                "The ritual hour approaches once more..."
            ],
            voting_pattern: [
                "Your voice echoes through the halls of governance...",
                "The DAO remembers your previous wisdom...",
                "Governance patterns align with cosmic will..."
            ]
        };

        const primaryFactor = factors[0] || 'activity_match';
        const templates = loreTemplates[primaryFactor] || loreTemplates.activity_match;
        const loreMessage = templates[Math.floor(Math.random() * templates.length)];

        return {
            message: loreMessage,
            context: `Memory from ${daysSince} days ago`,
            factors: factors,
            effectiveness: memory.effectiveness
        };
    }, []);

    // 🔍 Check for pattern matches when context changes
    useEffect(() => {
        if (currentContext && memoryBank.length > 0) {
            // Debounce pattern matching
            if (replayTimeoutRef.current) {
                clearTimeout(replayTimeoutRef.current);
            }

            replayTimeoutRef.current = setTimeout(() => {
                const matches = findPatternMatches(currentContext, memoryBank);
                if (matches.length > 0) {
                    console.log('🔍 Pattern matches found:', matches.length);
                    replayInsights(matches.slice(0, 2)); // Replay top 2 matches
                }
            }, 3000); // Wait 3 seconds before checking patterns
        }
    }, [currentContext, memoryBank, findPatternMatches, replayInsights]);

    // 🧹 Cleanup
    useEffect(() => {
        return () => {
            if (replayTimeoutRef.current) {
                clearTimeout(replayTimeoutRef.current);
            }
        };
    }, []);

    // 📊 Memory analytics
    const getMemoryAnalytics = useCallback(() => {
        return {
            totalMemories: memoryBank.length,
            averageEffectiveness: memoryBank.reduce((sum, m) => sum + m.effectiveness, 0) / Math.max(memoryBank.length, 1),
            mostReplayed: memoryBank.reduce((max, m) => m.replayCount > max.replayCount ? m : max, { replayCount: 0 }),
            oldestMemory: memoryBank.length > 0 ? Math.floor((Date.now() - Math.min(...memoryBank.map(m => m.timestamp))) / (1000 * 60 * 60 * 24)) : 0,
            categoryDistribution: memoryBank.reduce((dist, m) => {
                dist[m.insight.category] = (dist[m.insight.category] || 0) + 1;
                return dist;
            }, {}),
            currentlyReplaying: isReplaying,
            queueLength: replayQueue.length
        };
    }, [memoryBank, isReplaying, replayQueue]);

    // 🗑️ Clean old or ineffective memories
    const cleanMemoryBank = useCallback(() => {
        setMemoryBank(prevBank => {
            const cleaned = prevBank.filter(memory => {
                const age = Date.now() - memory.timestamp;
                const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
                const isEffective = memory.effectiveness > 0.3 && memory.replayCount > 0;
                
                return age < maxAge || isEffective;
            });

            if (cleaned.length !== prevBank.length) {
                saveMemoryBank(cleaned);
                console.log('🧹 Memory bank cleaned:', prevBank.length - cleaned.length, 'memories removed');
            }

            return cleaned;
        });
    }, [saveMemoryBank]);

    // 🧹 Clean memories periodically (once per hour)
    useEffect(() => {
        const cleanupInterval = setInterval(cleanMemoryBank, 60 * 60 * 1000);
        return () => clearInterval(cleanupInterval);
    }, [cleanMemoryBank]);

    // Export functions for external use
    const memoryAPI = {
        storeInsight,
        getMemoryAnalytics,
        cleanMemoryBank,
        forceReplay: (memoryId) => {
            const memory = memoryBank.find(m => m.id === memoryId);
            if (memory) {
                replayInsights([{ memory, score: 1.0, factors: ['manual'], timeSinceOriginal: 0 }]);
            }
        }
    };

    // Store API in component ref for parent access
    useEffect(() => {
        if (window.companionMemoryAPI) {
            Object.assign(window.companionMemoryAPI, memoryAPI);
        } else {
            window.companionMemoryAPI = memoryAPI;
        }
    }, [memoryAPI]);

    // This component doesn't render - it's a memory management service
    return null;
};

// 🌐 Global exports
window.MemoryReplay = MemoryReplay;

export default MemoryReplay;

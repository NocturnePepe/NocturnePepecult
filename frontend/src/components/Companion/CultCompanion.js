/**
 * CULT COMPANION - PHASE 10: DOMINION PROTOCOL INTEGRATION
 * ========================================================
 * 
 * PURPOSE: State-aware persistent real-time assistant with AI governance layer
 * FEATURES: Dynamic responses, XP tracking, DAO engagement, governance AI, treasury insights
 * ARCHITECTURE: Performance-optimized with 60fps rendering and scalable logic
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWalletContext } from '../../contexts/WalletContext';
import CompanionMessageQueue from './CompanionMessageQueue';
import CompanionSettingsModal from './CompanionSettingsModal';
import CompanionAIPredictionLayer from './CompanionAIPredictionLayer';
import DominionProtocol from './DominionProtocol';
import { useTreasuryPulse } from '../../hooks/useTreasuryPulse';
import './CultCompanion.css';

// 🌙 Companion states and modes
const COMPANION_MODES = {
    ACTIVE: 'active',
    PASSIVE: 'passive', 
    OFF: 'off'
};

const COMPANION_STATES = {
    IDLE: 'idle',
    SPEAKING: 'speaking',
    THINKING: 'thinking',
    CELEBRATING: 'celebrating',
    MYSTERIOUS: 'mysterious',
    ANALYZING: 'analyzing',
    CAUTIOUS: 'cautious',
    WISE: 'wise',
    ENCOURAGING: 'encouraging',
    URGENT: 'urgent',
    AWAKENING: 'awakening'
};

// 🎭 Lore and narrative elements
const STORY_LINES = [
    "The nocturne whispers of ancient swaps...",
    "I sense the DeFi winds shifting, cultist...",
    "Your XP resonates with lunar frequencies...",
    "The DAO spirits grow restless tonight...",
    "Hidden opportunities dance in the shadows..."
];

const HIDDEN_EVENTS = [
    { trigger: 'rare_encounter', chance: 0.01, message: "🌙 A mystical presence stirs... Something extraordinary approaches..." },
    { trigger: 'cult_wisdom', chance: 0.02, message: "📿 Ancient cult knowledge flows through me... Ask, and wisdom shall be revealed..." },
    { trigger: 'prophecy', chance: 0.005, message: "🔮 The blockchain prophesies speak... Your destiny intertwines with great fortune..." }
];

const CultCompanion = () => {
    // 🔌 Context and state hooks
    const { wallet, isConnected } = useWalletContext();
    
    // 🎭 Phase 9.5: Import Sentience Ember components
    const CompanionMoodState = window.CompanionMoodState;
    const MemoryReplay = window.MemoryReplay;
    const CompanionAIPredict = window.CompanionAIPredict;
    const LoreEventUnlock = window.LoreEventUnlock;
    const RitualPulse = window.RitualPulse;

    // 🏛️ Phase 10: Dominion Protocol state
    const [dominionProtocol, setDominionProtocol] = useState(null);
    const [proposalRecommendations, setProposalRecommendations] = useState(new Map());
    const [votePredictions, setVotePredictions] = useState([]);
    const [treasuryAlerts, setTreasuryAlerts] = useState([]);
    const [activeRitualEvents, setActiveRitualEvents] = useState(new Set());
    const [sentientModeEnabled, setSentientModeEnabled] = useState(() => 
        localStorage.getItem('dominion-sentient-mode') === 'true'
    );
    
    // 💰 Phase 10: Treasury Pulse Hook
    const treasuryPulse = useTreasuryPulse();
    
    // 🎯 Enhanced state management with Phase 9.5 features
    const [companionMode, setCompanionMode] = useState(() => 
        localStorage.getItem('cult-companion-mode') || COMPANION_MODES.ACTIVE
    );
    const [companionState, setCompanionState] = useState(COMPANION_STATES.IDLE);
    const [isVisible, setIsVisible] = useState(companionMode !== COMPANION_MODES.OFF);
    const [showSettings, setShowSettings] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isMessageVisible, setIsMessageVisible] = useState(false);
    
    // 🎭 Phase 9.5: Enhanced mood and ritual states
    const [currentMood, setCurrentMood] = useState('idle');
    const [moodIntensity, setMoodIntensity] = useState(0.5);
    const [isRitualActive, setIsRitualActive] = useState(false);
    const [moodVisualProps, setMoodVisualProps] = useState({});
    
    // 🧠 Phase 9.5: Sentience Ember components
    const [companionSentience, setCompanionSentience] = useState(null);
    const [loreEventInstance, setLoreEventInstance] = useState(null);
    
    const [userMetrics, setUserMetrics] = useState({
        xp: 0,
        level: 1,
        daoVotes: 0,
        totalSwaps: 0,
        referralCount: 0,
        governanceRank: 1,
        lastActive: Date.now(),
        votingHistory: [],
        userHistory: []
    });
    
    // 🔗 Animation and UI refs
    const companionRef = useRef(null);
    const messageTimeoutRef = useRef(null);
    const idleTimeoutRef = useRef(null);
    const animationFrameRef = useRef(null);

    // 🏛️ Phase 10: Dominion Protocol Handlers
    const handleProposalRecommendation = useCallback((recommendation) => {
        setProposalRecommendations(prev => {
            const newMap = new Map(prev);
            newMap.set(recommendation.proposalId, recommendation);
            return newMap;
        });
        
        const message = `🏛️ Proposal Analysis: ${recommendation.recommendation.vote} with ${(recommendation.confidence * 100).toFixed(1)}% confidence - ${recommendation.recommendation.reasoning}`;
        say(message, 10000, COMPANION_STATES.ANALYZING);
        
        console.log('🏛️ Proposal recommendation generated:', recommendation);
    }, []);

    const handleVotePrediction = useCallback((predictions) => {
        setVotePredictions(predictions);
        
        if (predictions.length > 0) {
            const firstPrediction = predictions[0];
            const supportProb = (firstPrediction.prediction.supportProbability * 100).toFixed(1);
            const message = `🔮 Vote Prediction: ${supportProb}% support probability with ${(firstPrediction.prediction.confidence * 100).toFixed(1)}% confidence`;
            
            if (sentientModeEnabled) {
                say(message, 8000, COMPANION_STATES.THINKING);
            }
        }
        
        console.log('🔮 Vote predictions updated:', predictions.length, 'proposals analyzed');
    }, [sentientModeEnabled]);

    const handleTreasuryAlert = useCallback((alert) => {
        setTreasuryAlerts(prev => [...prev.slice(-4), alert]); // Keep last 5 alerts
        
        const alertMessages = {
            CRITICAL_HEALTH: "⚠️ Treasury health critically low! Immediate governance attention required!",
            LIQUIDITY_RISK: "💧 Low liquidity detected! Consider reducing staked positions!",
            CONCENTRATION_RISK: "⚖️ Asset concentration risk identified! Diversification recommended!",
            STAKING_OPPORTUNITY: "💎 Exceptional staking opportunity available! High APY detected!",
            DOWNTREND_RISK: "📉 Treasury declining! Monitor market conditions closely!"
        };
        
        const message = alertMessages[alert.type] || `🚨 Treasury Alert: ${alert.message}`;
        say(message, 8000, COMPANION_STATES.URGENT);
        
        console.log('💰 Treasury alert triggered:', alert);
    }, []);

    const handleRitualEvent = useCallback((event) => {
        setActiveRitualEvents(prev => new Set([...prev, event.id]));
        
        say(`🌟 ${event.title}: ${event.description}`, 8000, COMPANION_STATES.MYSTERIOUS);
        
        // Auto-cleanup after duration
        setTimeout(() => {
            setActiveRitualEvents(prev => {
                const newSet = new Set(prev);
                newSet.delete(event.id);
                return newSet;
            });
        }, event.duration);
        
        console.log('⚡ Ritual event triggered:', event.title);
    }, []);

    // 🗣️ Message display function
    const say = useCallback((message, duration = 5000, state = COMPANION_STATES.SPEAKING) => {
        setCompanionState(state);
        setCurrentMessage(message);
        setIsMessageVisible(true);
        
        // Clear existing timeout
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
        
        messageTimeoutRef.current = setTimeout(() => {
            setIsMessageVisible(false);
            setCompanionState(COMPANION_STATES.IDLE);
        }, duration);
        
        // Return to idle after fade animation
        setTimeout(() => {
            setCurrentMessage('');
        }, duration + 1000);
    }, []);

    // 🧠 Phase 10: Sentient Mode Toggle
    const toggleSentientMode = useCallback(() => {
        const newMode = !sentientModeEnabled;
        setSentientModeEnabled(newMode);
        localStorage.setItem('dominion-sentient-mode', newMode.toString());
        
        if (dominionProtocol) {
            dominionProtocol.enableSentientMode(newMode);
        }
        
        const message = newMode ? 
            "🧠 Sentient mode activated! I now have autonomy to analyze proposals, predict outcomes, and provide treasury insights proactively..." :
            "😴 Sentient mode deactivated. I'll return to advisory mode and only respond when asked...";
        say(message, 6000, COMPANION_STATES.MYSTERIOUS);
        
        console.log(`🧠 Sentient mode ${newMode ? 'enabled' : 'disabled'}`);
    }, [sentientModeEnabled, dominionProtocol, say]);

    // 💰 Phase 10: Treasury Pulse Integration
    useEffect(() => {
        if (!treasuryPulse.isReady) return;
        
        // Handle treasury recommendations
        if (treasuryPulse.recommendations && treasuryPulse.recommendations.length > 0) {
            const urgentRecommendations = treasuryPulse.recommendations.filter(r => r.priority === 'critical');
            if (urgentRecommendations.length > 0 && sentientModeEnabled) {
                const recommendation = urgentRecommendations[0];
                const message = `💰 Treasury Insight: ${recommendation.message}`;
                say(message, 8000, COMPANION_STATES.THINKING);
            }
        }
        
        // Handle high-severity alerts
        if (treasuryPulse.needsAttention) {
            const criticalAlerts = treasuryPulse.alerts.filter(a => a.severity >= 7);
            if (criticalAlerts.length > 0) {
                criticalAlerts.forEach(alert => handleTreasuryAlert(alert));
            }
        }
        
        // Handle staking opportunities
        if (treasuryPulse.stakingOpportunities && treasuryPulse.stakingOpportunities.length > 0) {
            const highYieldOpportunities = treasuryPulse.stakingOpportunities.filter(op => op.apy > 12);
            if (highYieldOpportunities.length > 0 && Math.random() < 0.3) { // 30% chance to mention
                const opportunity = highYieldOpportunities[0];
                const message = `💎 Staking Opportunity: ${opportunity.apy.toFixed(1)}% APY available on ${opportunity.protocol}. ${opportunity.recommendation}`;
                say(message, 6000, COMPANION_STATES.THINKING);
            }
        }
    }, [treasuryPulse, sentientModeEnabled, handleTreasuryAlert, say]);

    // 🏛️ Phase 10: Initialize Dominion Protocol
    useEffect(() => {
        if (!isConnected || !userMetrics) return;
        
        const protocol = new DominionProtocol({
            userMetrics,
            onProposalRecommendation: handleProposalRecommendation,
            onVotePrediction: handleVotePrediction,
            onTreasuryAlert: handleTreasuryAlert,
            onRitualEvent: handleRitualEvent
        });
        
        setDominionProtocol(protocol);
        
        // Enable sentient mode if previously enabled
        if (sentientModeEnabled) {
            setTimeout(() => protocol.enableSentientMode(true), 1000);
        }
        
        console.log('🏛️ Dominion Protocol initialized');
        
        return () => {
            if (protocol && protocol.clearPredictionCache) {
                protocol.clearPredictionCache();
            }
        };
    }, [isConnected, userMetrics, sentientModeEnabled, handleProposalRecommendation, handleVotePrediction, handleTreasuryAlert, handleRitualEvent]);

    // 💭 Dynamic response system based on user metrics
    const generateContextualMessage = useCallback(() => {
        const context = {
            timeOfDay: new Date().getHours(),
            isNewUser: userMetrics.xp < 100,
            isActiveTrader: userMetrics.totalSwaps > 10,
            userActivity: {
                isNewUser: userMetrics.xp < 100,
                isActiveTrader: userMetrics.totalSwaps > 10,
                isDAOParticipant: userMetrics.daoVotes > 0,
                hasReferrals: userMetrics.referralCount > 0
            }
        };
        
        // 🌙 Time-based messages
        if (context.timeOfDay >= 22 || context.timeOfDay <= 6) {
            return "Perfect time for lunar-powered trades 🌙";
        }
        
        // 🎯 User progression messages
        if (context.userActivity.isNewUser) {
            return "Your journey begins... Let the nocturne guide your first steps...";
        }
        
        if (context.isActiveTrader && !context.userActivity.isDAOParticipant) {
            return "Your trading prowess is noticed... Perhaps it's time to join the DAO governance? 🏛️";
        }
        
        if (context.userActivity.isActiveTrader && !context.userActivity.hasReferrals) {
            return "Spread the cult wisdom! Share your referral link and earn XP for each new member...";
        }
        
        // 💼 Advanced trader messages
        if (context.userActivity.isActiveTrader) {
            return [
                "Market sentiment shifts... Perfect moment for strategic positioning...",
                "The DeFi protocols whisper of hidden yield opportunities...",
                "Your reputation grows... Soon the market makers will take notice..."
            ][Math.floor(Math.random() * 3)];
        }
        
        // 🌌 Default mystical responses
        return STORY_LINES[Math.floor(Math.random() * STORY_LINES.length)];
    }, [userMetrics]);

    // 🏛️ Phase 10: Governance AI insights and predictions
    const shareGovernanceInsight = useCallback(() => {
        if (!dominionProtocol) return;
        
        const insights = [
            () => dominionProtocol.predictVoteOutcome(),
            () => {
                const health = treasuryPulse.healthScore;
                if (health > 85) {
                    say("💰 Treasury analysis indicates exceptional strength. Prime conditions for ambitious proposals...", 7000, COMPANION_STATES.ANALYZING);
                } else if (health < 40) {
                    say("⚠️ Treasury shows concerning patterns. Conservative governance approach recommended...", 7000, COMPANION_STATES.CAUTIOUS);
                } else {
                    say("📊 Treasury metrics within normal ranges. Standard governance protocols advised...", 6000, COMPANION_STATES.THINKING);
                }
            },
            () => {
                if (userMetrics.governanceRank >= 3) {
                    say("👑 Your governance rank grants significant proposal influence. Use this power wisely, cultist...", 7000, COMPANION_STATES.WISE);
                } else {
                    say("📈 Increasing your governance participation will unlock deeper DAO mysteries...", 6000, COMPANION_STATES.ENCOURAGING);
                }
            }
        ];
        
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        randomInsight();
    }, [dominionProtocol, treasuryPulse, userMetrics, say]);

    // 🤖 Helper functions for user metrics
    const getUserXP = useCallback(() => {
        return parseInt(localStorage.getItem('nocturne-xp') || '0');
    }, []);

    const getUserLevel = useCallback(() => {
        return parseInt(localStorage.getItem('nocturne-level') || '1');
    }, []);

    const getReferralCount = useCallback(() => {
        return parseInt(localStorage.getItem('nocturne-referral-count') || '0');
    }, []);

    const getProposalVotes = useCallback(() => {
        return parseInt(localStorage.getItem('nocturne-dao-votes') || '0');
    }, []);

    const getTotalSwaps = useCallback(() => {
        return parseInt(localStorage.getItem('nocturne-total-swaps') || '0');
    }, []);

    // 🔄 Update user metrics
    const updateUserMetrics = useCallback(() => {
        const newMetrics = {
            xp: getUserXP(),
            level: getUserLevel(),
            referralCount: getReferralCount(),
            daoVotes: getProposalVotes(),
            totalSwaps: getTotalSwaps(),
            governanceRank: Math.floor(getProposalVotes() / 5) + 1,
            lastActive: userMetrics.lastActive,
            userHistory: userMetrics.userHistory || [],
            votingHistory: userMetrics.votingHistory || []
        };

        // Check for level ups
        if (newMetrics.level > userMetrics.level) {
            say(`🎉 Level ${newMetrics.level} achieved! Your cult mastery grows stronger...`, 5000, COMPANION_STATES.CELEBRATING);
        }

        // Check for new referrals
        if (newMetrics.referralCount > userMetrics.referralCount) {
            const newReferrals = newMetrics.referralCount - userMetrics.referralCount;
            say(`🔗 ${newReferrals} new cultist${newReferrals > 1 ? 's' : ''} joined through your wisdom! The cult grows...`, 5000, COMPANION_STATES.CELEBRATING);
        }

        // Check for new DAO votes
        if (newMetrics.daoVotes > userMetrics.daoVotes) {
            say("🗳️ Your voice echoes through the DAO chambers! Governance participation strengthens the cult...", 5000, COMPANION_STATES.CELEBRATING);
            
            // 🏛️ Phase 10: Trigger proposal evaluation if in sentient mode
            if (sentientModeEnabled && dominionProtocol) {
                setTimeout(() => {
                    dominionProtocol.predictVoteOutcome();
                }, 3000);
            }
        }

        setUserMetrics(newMetrics);
    }, [getUserXP, getUserLevel, getReferralCount, getProposalVotes, getTotalSwaps, userMetrics, sentientModeEnabled, dominionProtocol, say]);

    // 🎯 Hidden event system with governance integration
    const checkForHiddenEvents = useCallback(() => {
        if (companionMode !== COMPANION_MODES.ACTIVE) return;

        for (const event of HIDDEN_EVENTS) {
            if (Math.random() < event.chance) {
                say(event.message, 7000, COMPANION_STATES.MYSTERIOUS);
                // Log rare event for analytics
                console.log(`🌙 Cult Companion: Rare event triggered - ${event.trigger}`);
                break; // Only one hidden event per check
            }
        }
        
        // 🏛️ Phase 10: Governance-specific hidden events
        if (userMetrics.daoVotes > 5 && Math.random() < 0.01) {
            say("🏛️ The Council Elders whisper your name... Your governance wisdom has been noted by the ancient powers...", 8000, COMPANION_STATES.MYSTERIOUS);
        }
        
        if (treasuryPulse.healthScore > 85 && treasuryPulse.treasuryData?.totalValue > 10000000 && Math.random() < 0.005) {
            say("💰 The Treasury Guardians smile upon our prosperity... The vault spirits dance with abundance...", 7000, COMPANION_STATES.CELEBRATING);
        }
    }, [companionMode, userMetrics, treasuryPulse, say]);

    // 🎮 Companion mode toggle
    const toggleCompanionMode = useCallback(() => {
        const modes = Object.values(COMPANION_MODES);
        const currentIndex = modes.indexOf(companionMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        
        setCompanionMode(nextMode);
        setIsVisible(nextMode !== COMPANION_MODES.OFF);
        localStorage.setItem('cult-companion-mode', nextMode);

        // Announce mode change
        if (nextMode === COMPANION_MODES.ACTIVE) {
            setTimeout(() => say("I have awakened! Ready to guide your cult journey... 🌙"), 500);
        } else if (nextMode === COMPANION_MODES.PASSIVE) {
            say("Entering passive observation mode...", 2000);
        }
    }, [companionMode, say]);

    // 🌙 Idle detection and automatic messages
    useEffect(() => {
        if (companionMode !== COMPANION_MODES.ACTIVE) return;
        
        const resetIdleTimer = () => {
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current);
            }
            
            idleTimeoutRef.current = setTimeout(() => {
                if (!isMessageVisible) {
                    const message = generateContextualMessage();
                    say(message, 4000);
                }
            }, 60000); // 60 seconds idle
        };

        // Reset timer on user activity
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });
        
        resetIdleTimer();
        
        return () => {
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current);
            }
            activityEvents.forEach(event => {
                document.removeEventListener(event, resetIdleTimer);
            });
        };
    }, [companionMode, isMessageVisible, generateContextualMessage, say]);

    // 📊 Periodic metric updates and hidden events
    useEffect(() => {
        if (companionMode === COMPANION_MODES.OFF) return;
        
        const interval = setInterval(() => {
            updateUserMetrics();
            checkForHiddenEvents();
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [companionMode, updateUserMetrics, checkForHiddenEvents]);

    // 🎨 Animation loop for companion orb
    useEffect(() => {
        if (!isVisible) return;

        const animate = () => {
            if (companionRef.current) {
                const time = Date.now() * 0.001;
                const breath = Math.sin(time * 2) * 0.1 + 1;
                const glow = Math.sin(time * 3) * 0.3 + 0.7;
                
                companionRef.current.style.transform = `scale(${breath}) translateZ(0)`;
                companionRef.current.style.filter = `brightness(${glow}) drop-shadow(0 0 20px rgba(147, 51, 234, ${glow * 0.5}))`;
            }
            
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isVisible]);

    // 🚀 Initial companion greeting
    useEffect(() => {
        if (companionMode === COMPANION_MODES.ACTIVE && isConnected) {
            setTimeout(() => {
                const greetings = [
                    "The nocturne spirit awakens... I am here to guide your journey 🌙",
                    "Welcome back, cultist. The blockchain whispers your name...",
                    "Your presence strengthens the cult energy. What shall we accomplish today?",
                    "I sense great potential in your aura... Let's unlock it together..."
                ];
                say(greetings[Math.floor(Math.random() * greetings.length)], 5000);
            }, 2000);
        }
    }, [companionMode, isConnected, say]);

    // 🎯 Cleanup
    useEffect(() => {
        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // ❌ Don't render if mode is OFF
    if (!isVisible) return null;

    return (
        <>
            {/* 🌙 Main Companion Orb */}
            <div className={`cult-companion-container ${companionState}`}>
                <div 
                    ref={companionRef}
                    className={`cult-companion-orb ${companionState}`}
                    onClick={() => setShowSettings(true)}
                    role="button"
                    tabIndex={0}
                    aria-label="Cult Companion - Click for settings"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setShowSettings(true);
                        }
                    }}
                >
                    <div className="orb-core">
                        <span className="orb-flame">🌙</span>
                        <div className="orb-energy"></div>
                    </div>
                    
                    {/* 🔴 Mode indicator */}
                    <div className={`mode-indicator ${companionMode}`}>
                        {companionMode === COMPANION_MODES.ACTIVE && '●'}
                        {companionMode === COMPANION_MODES.PASSIVE && '◐'}
                    </div>
                </div>

                {/* 🗣️ Message bubble */}
                {currentMessage && (
                    <div className={`companion-message ${isMessageVisible ? 'visible' : ''}`}>
                        <div className="message-content">
                            {currentMessage}
                        </div>
                        <div className="message-arrow"></div>
                    </div>
                )}

                {/* ⚙️ Quick toggle button */}
                <button
                    className="companion-toggle"
                    onClick={toggleCompanionMode}
                    aria-label={`Toggle companion mode (current: ${companionMode})`}
                    title={`Current mode: ${companionMode}`}
                >
                    {companionMode === COMPANION_MODES.ACTIVE && '🌙'}
                    {companionMode === COMPANION_MODES.PASSIVE && '🌙'}
                    {companionMode === COMPANION_MODES.OFF && '💤'}
                </button>
            </div>

            {/* 🎛️ Phase 10: Governance Controls */}
            {userMetrics.level >= 5 && (
                <div className="governance-controls">
                    <button
                        className="governance-insight-btn"
                        onClick={shareGovernanceInsight}
                        title="Get AI governance insights"
                        aria-label="Request governance insights from companion"
                    >
                        🏛️ Governance Insight
                    </button>
                    
                    <button
                        className={`sentient-mode-btn ${sentientModeEnabled ? 'active' : ''}`}
                        onClick={toggleSentientMode}
                        title={sentientModeEnabled ? 'Disable autonomous mode' : 'Enable autonomous governance'}
                        aria-label={`Toggle sentient mode: ${sentientModeEnabled ? 'enabled' : 'disabled'}`}
                    >
                        🧠 {sentientModeEnabled ? 'Sentient' : 'Advisory'}
                    </button>
                </div>
            )}

            {/* 📊 Treasury Health Indicator */}
            {treasuryPulse.alerts && treasuryPulse.alerts.length > 0 && (
                <div className="treasury-alerts">
                    {treasuryPulse.alerts.slice(-3).map((alert, index) => (
                        <div 
                            key={index}
                            className={`treasury-alert severity-${alert.severity}`}
                            onClick={() => handleTreasuryAlert(alert)}
                        >
                            {alert.type === 'STAKING_OPPORTUNITY' && '💎'}
                            {alert.type === 'LIQUIDITY_RISK' && '⚠️'}
                            {alert.type === 'CONCENTRATION_RISK' && '⚖️'}
                            {alert.type === 'CRITICAL_HEALTH' && '🚨'}
                            <span className="alert-text">{alert.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <CompanionSettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    companionMode={companionMode}
                    onModeChange={setCompanionMode}
                    userMetrics={userMetrics}
                    sentientModeEnabled={sentientModeEnabled}
                    onSentientModeChange={toggleSentientMode}
                />
            )}

            {/* 🧠 AI Prediction Layer */}
            <CompanionAIPredictionLayer
                userMetrics={userMetrics}
                companionMode={companionMode}
                onSuggestion={(message) => say(message, 6000, COMPANION_STATES.THINKING)}
            />

            {/* 📬 Message Queue System */}
            <CompanionMessageQueue
                isActive={companionMode === COMPANION_MODES.ACTIVE}
                onMessage={(message, duration, state) => say(message, duration, state)}
            />
        </>
    );
};

export default CultCompanion;

// 🌐 Global exports for vanilla JS integration
window.CultCompanion = CultCompanion;

// Additional utility functions for integration testing
window.xpGained = (amount) => {
    console.log(`Mock XP gained: ${amount}`);
    return true;
};

window.levelUp = (newLevel) => {
    console.log(`Mock level up: ${newLevel}`);
    return true;
};

window.swapCompleted = (details) => {
    console.log('Mock swap completed:', details);
    return true;
};

window.tradingMetrics = {
    totalSwaps: 0,
    volume: 0,
    profits: 0
};

// Lore event system globals
window.loreEvents = {
    seasonal: ['winter_solstice', 'spring_awakening', 'summer_cult', 'autumn_harvest'],
    cult: ['initiation', 'ascension', 'enlightenment', 'transcendence'],
    special: ['eclipse', 'blood_moon', 'new_moon', 'full_moon']
};

window.seasonalEvent = (eventType) => {
    console.log(`Mock seasonal event triggered: ${eventType}`);
    return { type: eventType, active: true, duration: 3600000 };
};

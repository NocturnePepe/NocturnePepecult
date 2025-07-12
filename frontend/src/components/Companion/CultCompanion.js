/**
 * CULT COMPANION - PHASE 9: AWAKENS
 * ==================================
 * 
 * PURPOSE: State-aware persistent real-time assistant with AI prediction layer
 * FEATURES: Dynamic responses, XP tracking, DAO engagement, narrative lore system
 * ARCHITECTURE: Performance-optimized with 60fps rendering and scalable logic
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWalletContext } from '../../contexts/WalletContext';
import CompanionMessageQueue from './CompanionMessageQueue';
import CompanionSettingsModal from './CompanionSettingsModal';
import CompanionAIPredictionLayer from './CompanionAIPredictionLayer';
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
    MYSTERIOUS: 'mysterious'
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
    const [companionMode, setCompanionMode] = useState(() => 
        localStorage.getItem('cult-companion-mode') || COMPANION_MODES.ACTIVE
    );
    const [companionState, setCompanionState] = useState(COMPANION_STATES.IDLE);
    const [isVisible, setIsVisible] = useState(companionMode !== COMPANION_MODES.OFF);
    const [showSettings, setShowSettings] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isMessageVisible, setIsMessageVisible] = useState(false);
    const [userMetrics, setUserMetrics] = useState({
        xp: 0,
        level: 1,
        referralCount: 0,
        daoVotes: 0,
        totalSwaps: 0,
        lastActive: Date.now()
    });

    // 🎨 Animation and UI refs
    const companionRef = useRef(null);
    const messageTimeoutRef = useRef(null);
    const idleTimeoutRef = useRef(null);
    const animationFrameRef = useRef(null);

    // 📊 User data fetchers
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

    // 🧠 AI Prediction and Context Analysis
    const analyzeUserContext = useCallback(() => {
        const now = Date.now();
        const timeSinceLastActive = now - userMetrics.lastActive;
        const isIdle = timeSinceLastActive > 60000; // 60 seconds
        
        return {
            isIdle,
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            userActivity: {
                isNewUser: userMetrics.xp < 100,
                isActiveTrader: userMetrics.totalSwaps > 10,
                isDAOParticipant: userMetrics.daoVotes > 0,
                hasReferrals: userMetrics.referralCount > 0
            }
        };
    }, [userMetrics]);

    // 💬 Companion speech system
    const say = useCallback((message, duration = 5000, state = COMPANION_STATES.SPEAKING) => {
        if (companionMode === COMPANION_MODES.OFF) return;

        setCurrentMessage(message);
        setCompanionState(state);
        setIsMessageVisible(true);

        // Clear existing timeout
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }

        // Auto-hide message after duration
        messageTimeoutRef.current = setTimeout(() => {
            setIsMessageVisible(false);
            setCompanionState(COMPANION_STATES.IDLE);
            
            // Return to idle after fade animation
            setTimeout(() => {
                setCurrentMessage('');
            }, 300);
        }, duration);
    }, [companionMode]);

    // 🎯 Dynamic response system based on user metrics
    const generateContextualMessage = useCallback(() => {
        const context = analyzeUserContext();
        const { userActivity } = context;

        // 🌙 Time-based messages
        if (context.timeOfDay >= 22 || context.timeOfDay <= 6) {
            return "The nocturne hours are upon us... Perfect time for lunar-powered trades 🌙";
        }

        // 🆕 New user guidance
        if (userActivity.isNewUser) {
            if (!isConnected) {
                return "Welcome, new cultist! Connect your wallet to begin your nocturne journey...";
            }
            if (userMetrics.totalSwaps === 0) {
                return "Ready for your first swap? The cult wisdom guides you to start small and learn...";
            }
        }

        // 🏆 Achievement celebrations
        if (userMetrics.level > 1 && userMetrics.xp % 100 === 0) {
            return `Magnificent! Level ${userMetrics.level} achieved. The cult recognizes your dedication! 🎉`;
        }

        // 🗳️ DAO engagement
        if (userActivity.isActiveTrader && !userActivity.isDAOParticipant) {
            return "Your trading prowess is noticed... Perhaps it's time to join the DAO governance? 🏛️";
        }

        // 💸 Referral opportunities
        if (userActivity.isActiveTrader && !userActivity.hasReferrals) {
            return "Spread the cult wisdom! Share your referral link and earn XP for each new member...";
        }

        // 🔮 Idle messages
        if (context.isIdle) {
            const idleMessages = [
                "I sense you're contemplating... What wisdom do you seek?",
                "The market flows like moonlight... Are you ready to make a move?",
                "Your XP grows stronger with each passing moment...",
                "The cult awaits your next strategic decision..."
            ];
            return idleMessages[Math.floor(Math.random() * idleMessages.length)];
        }

        // 📈 Trading suggestions
        if (userActivity.isActiveTrader) {
            const tradingTips = [
                "Consider diversifying your portfolio during this lunar cycle...",
                "The DeFi winds suggest checking LP yields today...",
                "Your swap pattern indicates optimal DCA timing approaches...",
                "Market sentiment shifts... Perfect moment for strategic positioning..."
            ];
            return tradingTips[Math.floor(Math.random() * tradingTips.length)];
        }

        // 🌌 Default mystical responses
        return STORY_LINES[Math.floor(Math.random() * STORY_LINES.length)];
    }, [analyzeUserContext, isConnected, userMetrics]);

    // 🎲 Hidden event system
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
    }, [companionMode, say]);

    // 🔄 Update user metrics
    const updateUserMetrics = useCallback(() => {
        const newMetrics = {
            xp: getUserXP(),
            level: getUserLevel(),
            referralCount: getReferralCount(),
            daoVotes: getProposalVotes(),
            totalSwaps: getTotalSwaps(),
            lastActive: Date.now()
        };

        // Check for level ups
        if (newMetrics.level > userMetrics.level) {
            say(`🎉 LEVEL UP! Welcome to Level ${newMetrics.level}! Your cult power grows stronger...`, 6000, COMPANION_STATES.CELEBRATING);
        }

        // Check for new referrals
        if (newMetrics.referralCount > userMetrics.referralCount) {
            const newReferrals = newMetrics.referralCount - userMetrics.referralCount;
            say(`🔗 ${newReferrals} new cultist${newReferrals > 1 ? 's' : ''} joined through your wisdom! The cult grows...`, 5000, COMPANION_STATES.CELEBRATING);
        }

        // Check for new DAO votes
        if (newMetrics.daoVotes > userMetrics.daoVotes) {
            say("🗳️ Your voice echoes through the DAO chambers! Governance participation strengthens the cult...", 5000, COMPANION_STATES.CELEBRATING);
        }

        setUserMetrics(newMetrics);
    }, [getUserXP, getUserLevel, getReferralCount, getProposalVotes, getTotalSwaps, userMetrics, say]);

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

            {/* 🎛️ Settings Modal */}
            {showSettings && (
                <CompanionSettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    companionMode={companionMode}
                    onModeChange={setCompanionMode}
                    userMetrics={userMetrics}
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

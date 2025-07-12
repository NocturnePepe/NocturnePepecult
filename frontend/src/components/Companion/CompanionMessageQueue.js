/**
 * COMPANION MESSAGE QUEUE - PHASE 9
 * ==================================
 * 
 * PURPOSE: Manages queued messages and event-driven companion communications
 * FEATURES: Priority queuing, event detection, message timing
 * ARCHITECTURE: React hook-based with efficient event handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const MESSAGE_PRIORITIES = {
    URGENT: 1,    // Level ups, rare events
    HIGH: 2,      // Achievements, milestones
    NORMAL: 3,    // Regular tips and suggestions
    LOW: 4        // Idle chatter, lore
};

const CompanionMessageQueue = ({ isActive, onMessage }) => {
    const [messageQueue, setMessageQueue] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const processingTimeoutRef = useRef(null);
    const lastEventTimestamps = useRef({
        xpGain: 0,
        levelUp: 0,
        referralAdded: 0,
        daoVote: 0,
        swapCompleted: 0,
        seasonalEvent: 0
    });

    // 📨 Add message to queue with priority
    const queueMessage = useCallback((message, duration = 5000, state = 'speaking', priority = MESSAGE_PRIORITIES.NORMAL) => {
        if (!isActive) return;

        const newMessage = {
            id: Date.now() + Math.random(),
            content: message,
            duration,
            state,
            priority,
            timestamp: Date.now()
        };

        setMessageQueue(prev => {
            // Insert based on priority (lower number = higher priority)
            const updated = [...prev, newMessage];
            return updated.sort((a, b) => a.priority - b.priority);
        });
    }, [isActive]);

    // 🔄 Process message queue
    const processQueue = useCallback(() => {
        if (isProcessing || messageQueue.length === 0) return;

        setIsProcessing(true);
        const nextMessage = messageQueue[0];

        // Remove processed message from queue
        setMessageQueue(prev => prev.slice(1));

        // Send message to companion
        onMessage(nextMessage.content, nextMessage.duration, nextMessage.state);

        // Set timeout for next message processing
        processingTimeoutRef.current = setTimeout(() => {
            setIsProcessing(false);
        }, nextMessage.duration + 1000); // Add 1s buffer between messages

    }, [isProcessing, messageQueue, onMessage]);

    // 🎯 XP gain detection
    useEffect(() => {
        const checkXPGain = () => {
            const currentXP = parseInt(localStorage.getItem('nocturne-xp') || '0');
            const currentLevel = parseInt(localStorage.getItem('nocturne-level') || '1');
            const lastXP = parseInt(localStorage.getItem('last-checked-xp') || '0');
            const lastLevel = parseInt(localStorage.getItem('last-checked-level') || '1');

            // Level up detected
            if (currentLevel > lastLevel && Date.now() - lastEventTimestamps.current.levelUp > 5000) {
                const levelUpMessages = [
                    `🌟 ASCENSION ACHIEVED! Level ${currentLevel} unlocked! Your cult energy radiates with newfound power...`,
                    `⚡ LEVEL ${currentLevel} REACHED! The nocturne spirits celebrate your dedication!`,
                    `🎊 BREAKTHROUGH! Level ${currentLevel} grants you deeper access to cult mysteries...`,
                    `🌙 LUNAR BLESSING! Level ${currentLevel} achieved! Your journey grows ever more powerful...`
                ];
                
                queueMessage(
                    levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)],
                    7000,
                    'celebrating',
                    MESSAGE_PRIORITIES.URGENT
                );
                
                lastEventTimestamps.current.levelUp = Date.now();
                localStorage.setItem('last-checked-level', currentLevel.toString());
            }

            // XP gain detected (but not level up)
            else if (currentXP > lastXP && Date.now() - lastEventTimestamps.current.xpGain > 10000) {
                const xpGain = currentXP - lastXP;
                if (xpGain >= 50) { // Only announce significant XP gains
                    queueMessage(
                        `✨ +${xpGain} XP gained! Your cult essence grows stronger...`,
                        3000,
                        'speaking',
                        MESSAGE_PRIORITIES.HIGH
                    );
                    lastEventTimestamps.current.xpGain = Date.now();
                }
                localStorage.setItem('last-checked-xp', currentXP.toString());
            }
        };

        if (isActive) {
            const interval = setInterval(checkXPGain, 2000);
            return () => clearInterval(interval);
        }
    }, [isActive, queueMessage]);

    // 🗳️ DAO vote detection
    useEffect(() => {
        const checkDAOActivity = () => {
            const currentVotes = parseInt(localStorage.getItem('nocturne-dao-votes') || '0');
            const lastVotes = parseInt(localStorage.getItem('last-checked-dao-votes') || '0');

            if (currentVotes > lastVotes && Date.now() - lastEventTimestamps.current.daoVote > 5000) {
                const daoMessages = [
                    "🏛️ Your voice echoes through the DAO chambers! The cult democracy strengthens...",
                    "🗳️ Governance participation recorded! Your wisdom shapes our collective destiny...",
                    "⚖️ DAO vote cast! The balance of power shifts with your decision...",
                    "🎯 Democratic action taken! Your vote influences the cult's future..."
                ];

                queueMessage(
                    daoMessages[Math.floor(Math.random() * daoMessages.length)],
                    5000,
                    'speaking',
                    MESSAGE_PRIORITIES.HIGH
                );

                lastEventTimestamps.current.daoVote = Date.now();
                localStorage.setItem('last-checked-dao-votes', currentVotes.toString());
            }
        };

        if (isActive) {
            const interval = setInterval(checkDAOActivity, 3000);
            return () => clearInterval(interval);
        }
    }, [isActive, queueMessage]);

    // 🔗 Referral detection
    useEffect(() => {
        const checkReferrals = () => {
            const currentReferrals = parseInt(localStorage.getItem('nocturne-referral-count') || '0');
            const lastReferrals = parseInt(localStorage.getItem('last-checked-referrals') || '0');

            if (currentReferrals > lastReferrals && Date.now() - lastEventTimestamps.current.referralAdded > 5000) {
                const newReferrals = currentReferrals - lastReferrals;
                const referralMessages = [
                    `🌐 ${newReferrals} new cultist${newReferrals > 1 ? 's' : ''} joined through your influence! The network expands...`,
                    `🔮 Your referral magic works! ${newReferrals} souls drawn to the cult through your energy...`,
                    `⭐ Community growth achieved! ${newReferrals} new member${newReferrals > 1 ? 's' : ''} embrace${newReferrals === 1 ? 's' : ''} the nocturne way...`,
                    `🎊 Cult expansion! ${newReferrals} fresh mind${newReferrals > 1 ? 's' : ''} awakened by your wisdom...`
                ];

                queueMessage(
                    referralMessages[Math.floor(Math.random() * referralMessages.length)],
                    6000,
                    'celebrating',
                    MESSAGE_PRIORITIES.HIGH
                );

                lastEventTimestamps.current.referralAdded = Date.now();
                localStorage.setItem('last-checked-referrals', currentReferrals.toString());
            }
        };

        if (isActive) {
            const interval = setInterval(checkReferrals, 4000);
            return () => clearInterval(interval);
        }
    }, [isActive, queueMessage]);

    // 💱 Swap completion detection
    useEffect(() => {
        const checkSwapActivity = () => {
            const currentSwaps = parseInt(localStorage.getItem('nocturne-total-swaps') || '0');
            const lastSwaps = parseInt(localStorage.getItem('last-checked-swaps') || '0');

            if (currentSwaps > lastSwaps && Date.now() - lastEventTimestamps.current.swapCompleted > 3000) {
                const swapMessages = [
                    "💫 Swap completed successfully! The DeFi currents flow favorably...",
                    "⚡ Trade executed! Your timing aligns with the cosmic market forces...",
                    "🌟 Transaction confirmed! Another step in your DeFi mastery journey...",
                    "🎯 Swap achieved! The blockchain spirits smile upon your decision..."
                ];

                queueMessage(
                    swapMessages[Math.floor(Math.random() * swapMessages.length)],
                    4000,
                    'speaking',
                    MESSAGE_PRIORITIES.NORMAL
                );

                lastEventTimestamps.current.swapCompleted = Date.now();
                localStorage.setItem('last-checked-swaps', currentSwaps.toString());
            }
        };

        if (isActive) {
            const interval = setInterval(checkSwapActivity, 2000);
            return () => clearInterval(interval);
        }
    }, [isActive, queueMessage]);

    // 🌙 Seasonal and time-based events
    useEffect(() => {
        const checkSeasonalEvents = () => {
            const now = new Date();
            const hour = now.getHours();
            const dayOfWeek = now.getDay();
            const dayOfMonth = now.getDate();

            // New moon phase (approximately)
            if (dayOfMonth === 1 && Date.now() - lastEventTimestamps.current.seasonalEvent > 86400000) { // 24 hours
                queueMessage(
                    "🌑 New moon rises... The perfect time for fresh beginnings and bold DeFi ventures!",
                    6000,
                    'mysterious',
                    MESSAGE_PRIORITIES.LOW
                );
                lastEventTimestamps.current.seasonalEvent = Date.now();
            }

            // Weekend motivation
            else if ([6, 0].includes(dayOfWeek) && hour >= 10 && hour <= 12) {
                const weekendMessages = [
                    "🏖️ Weekend vibes detected! Perfect time for relaxed portfolio review...",
                    "🌅 Weekend wisdom: Markets never sleep, but sometimes patience is the best strategy...",
                    "🎯 Weekend opportunity: Catch up on DAO proposals while the markets cool..."
                ];

                if (Math.random() < 0.3) { // 30% chance
                    queueMessage(
                        weekendMessages[Math.floor(Math.random() * weekendMessages.length)],
                        5000,
                        'speaking',
                        MESSAGE_PRIORITIES.LOW
                    );
                }
            }

            // Late night trading caution
            else if (hour >= 23 || hour <= 5) {
                if (Math.random() < 0.1) { // 10% chance during late hours
                    queueMessage(
                        "🌙 The nocturne hours bring clarity... but beware of impulsive late-night trades...",
                        5000,
                        'speaking',
                        MESSAGE_PRIORITIES.LOW
                    );
                }
            }
        };

        if (isActive) {
            const interval = setInterval(checkSeasonalEvents, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [isActive, queueMessage]);

    // 🔄 Process queue when messages are available
    useEffect(() => {
        if (!isProcessing && messageQueue.length > 0) {
            processQueue();
        }
    }, [messageQueue, isProcessing, processQueue]);

    // 🧹 Cleanup
    useEffect(() => {
        return () => {
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, []);

    // This component doesn't render anything - it's a message queue manager
    return null;
};

export default CompanionMessageQueue;

// 🌐 Global exports for vanilla JS integration
window.CompanionMessageQueue = CompanionMessageQueue;

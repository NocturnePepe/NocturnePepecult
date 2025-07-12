/**
 * CULT AI FEEDBACK TRIGGERS - NOCTURNE SWAP
 * ==========================================
 * 
 * PURPOSE: Smart feedback system that responds to user actions and states
 * FEATURES: Real-time triggers, contextual responses, performance optimized
 * INTEGRATION: Hooks into existing app events and user interactions
 */

class CultAITriggers {
    constructor() {
        this.activeListeners = new Set();
        this.triggerCooldowns = new Map();
        this.lastTriggerTime = 0;
        this.minTriggerInterval = 5000; // 5 seconds between triggers
        
        this.init();
    }

    /**
     * Initialize trigger system
     */
    init() {
        console.log('⚡ Cult AI Triggers initializing...');
        
        this.setupWalletTriggers();
        this.setupXPTriggers();
        this.setupNavigationTriggers();
        this.setupActionTriggers();
        this.setupIdleTriggers();
        
        console.log('✅ Cult AI Triggers active');
    }

    /**
     * Setup wallet-related triggers
     */
    setupWalletTriggers() {
        // Wallet connection success
        this.addTrigger('walletConnected', () => {
            setTimeout(() => {
                this.triggerFeedback({
                    id: 'wallet-connected-success',
                    type: 'celebration',
                    priority: 'high',
                    title: '🎉 Welcome to the Cult!',
                    message: 'Your wallet is connected. Ready to explore the dark side of DeFi?',
                    action: {
                        text: 'Start Trading',
                        handler: 'navigateToSwap',
                        icon: '💫'
                    },
                    duration: 8000
                });
            }, 1500);
        });

        // Wallet disconnection
        this.addTrigger('walletDisconnected', () => {
            this.triggerFeedback({
                id: 'wallet-disconnected',
                type: 'warning',
                priority: 'medium',
                title: '🔗 Wallet disconnected',
                message: 'Reconnect to continue your Cult journey',
                action: {
                    text: 'Reconnect',
                    handler: 'connectWallet',
                    icon: '🔗'
                },
                duration: 6000
            });
        });

        // Low balance detection
        this.addTrigger('lowBalance', (data) => {
            if (data && data.balance < 0.1) { // Less than 0.1 SOL
                this.triggerFeedback({
                    id: 'low-balance-warning',
                    type: 'info',
                    priority: 'low',
                    title: '💰 Low balance detected',
                    message: 'You might need more SOL for transactions',
                    action: {
                        text: 'Get SOL',
                        handler: 'showFundingOptions',
                        icon: '💰'
                    },
                    duration: 5000
                });
            }
        });
    }

    /**
     * Setup XP and progression triggers
     */
    setupXPTriggers() {
        // XP milestone achievements
        this.addTrigger('xpUpdated', (data) => {
            const newXP = data?.xp || parseInt(localStorage.getItem('nocturne-xp') || '0');
            const milestones = [25, 50, 100, 250, 500, 1000];
            
            for (const milestone of milestones) {
                if (newXP >= milestone && !this.hasCelebrated(`xp-${milestone}`)) {
                    this.markCelebrated(`xp-${milestone}`);
                    
                    this.triggerFeedback({
                        id: `xp-milestone-${milestone}`,
                        type: 'celebration',
                        priority: 'medium',
                        title: `🌟 ${milestone} XP Achieved!`,
                        message: `You're becoming a true Cult legend. Keep trading!`,
                        action: {
                            text: 'View Progress',
                            handler: 'navigateToPortfolio',
                            icon: '📊'
                        },
                        duration: 7000
                    });
                    break; // Only show one milestone at a time
                }
            }
        });

        // Level up celebrations
        this.addTrigger('levelUp', (data) => {
            const newLevel = data?.level || parseInt(localStorage.getItem('nocturne-level') || '1');
            
            this.triggerFeedback({
                id: `level-up-${newLevel}`,
                type: 'celebration',
                priority: 'high',
                title: `⬆️ Level ${newLevel} Unlocked!`,
                message: 'Your Cult rank has increased. New privileges await!',
                action: {
                    text: 'Explore Features',
                    handler: 'navigateToSocial',
                    icon: '🎭'
                },
                duration: 10000
            });
        });
    }

    /**
     * Setup navigation and interaction triggers
     */
    setupNavigationTriggers() {
        // First time visiting sections
        const sections = ['pools', 'social', 'dao', 'admin'];
        
        sections.forEach(section => {
            this.addTrigger(`firstVisit${section.charAt(0).toUpperCase() + section.slice(1)}`, () => {
                if (!this.hasVisited(section)) {
                    this.markVisited(section);
                    
                    const sectionInfo = this.getSectionInfo(section);
                    this.triggerFeedback({
                        id: `first-visit-${section}`,
                        type: 'info',
                        priority: 'medium',
                        title: sectionInfo.title,
                        message: sectionInfo.message,
                        action: sectionInfo.action,
                        duration: 8000
                    });
                }
            });
        });

        // Extended idle in a section
        this.setupSectionIdleDetection();
    }

    /**
     * Setup action-specific triggers
     */
    setupActionTriggers() {
        // First successful swap
        this.addTrigger('swapCompleted', (data) => {
            const totalSwaps = parseInt(localStorage.getItem('nocturne-total-swaps') || '0');
            
            if (totalSwaps === 1) { // First swap
                this.triggerFeedback({
                    id: 'first-swap-success',
                    type: 'celebration',
                    priority: 'high',
                    title: '🎯 First trade complete!',
                    message: 'You\'ve taken your first step into the Cult. More adventures await!',
                    action: {
                        text: 'Explore More',
                        handler: 'navigateToSocial',
                        icon: '🌙'
                    },
                    duration: 10000
                });
            } else if (totalSwaps % 10 === 0 && totalSwaps > 1) { // Every 10 swaps
                this.triggerFeedback({
                    id: `swap-milestone-${totalSwaps}`,
                    type: 'celebration',
                    priority: 'low',
                    title: `💫 ${totalSwaps} trades milestone!`,
                    message: 'Your trading skills are evolving. The Cult is proud!',
                    duration: 5000
                });
            }
        });

        // Referral sharing
        this.addTrigger('referralShared', () => {
            this.triggerFeedback({
                id: 'referral-shared-success',
                type: 'celebration',
                priority: 'medium',
                title: '🤝 Cult grows stronger!',
                message: 'Your referral link is active. Earn XP for each new member!',
                action: {
                    text: 'Track Referrals',
                    handler: 'navigateToSocial',
                    icon: '📈'
                },
                duration: 7000
            });
        });

        // DAO participation
        this.addTrigger('daoVoteSubmitted', () => {
            this.triggerFeedback({
                id: 'first-dao-vote',
                type: 'celebration',
                priority: 'high',
                title: '🗳️ Your voice heard!',
                message: 'Thank you for participating in Cult governance. Democracy in action!',
                action: {
                    text: 'View Results',
                    handler: 'navigateToDAO',
                    icon: '📊'
                },
                duration: 8000
            });
        });
    }

    /**
     * Setup idle detection triggers
     */
    setupIdleTriggers() {
        let idleTimer = null;
        let lastActivity = Date.now();

        // Reset idle timer on activity
        const resetIdleTimer = () => {
            lastActivity = Date.now();
            if (idleTimer) {
                clearTimeout(idleTimer);
            }
            
            idleTimer = setTimeout(() => {
                this.triggerIdleFeedback();
            }, 120000); // 2 minutes of inactivity
        };

        // Listen for various activity events
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });

        // Initial timer
        resetIdleTimer();
    }

    /**
     * Trigger idle feedback
     */
    triggerIdleFeedback() {
        const insights = window.cultAI?.getCultInsights() || [];
        
        if (insights.length > 0) {
            // Show existing insight
            const insight = insights[0];
            this.triggerFeedback({
                ...insight,
                id: 'idle-' + insight.id,
                title: '💭 ' + insight.title,
                duration: 6000
            });
        } else {
            // Generic idle message
            const messages = [
                'Ready to make your next move?',
                'The markets are always moving...',
                'Explore new opportunities in the Cult',
                'Check your portfolio performance'
            ];
            
            this.triggerFeedback({
                id: 'idle-generic',
                type: 'engagement',
                priority: 'low',
                title: '🔮 Still there?',
                message: messages[Math.floor(Math.random() * messages.length)],
                action: {
                    text: 'Explore',
                    handler: 'navigateToSwap',
                    icon: '🎯'
                },
                duration: 5000
            });
        }
    }

    /**
     * Setup section idle detection
     */
    setupSectionIdleDetection() {
        let currentSection = 'swap';
        let sectionStartTime = Date.now();

        // Listen for navigation changes
        document.addEventListener('navigationChanged', (e) => {
            const newSection = e.detail?.section || 'swap';
            if (newSection !== currentSection) {
                currentSection = newSection;
                sectionStartTime = Date.now();
            }
        });

        // Check for extended time in section
        setInterval(() => {
            const timeInSection = Date.now() - sectionStartTime;
            if (timeInSection > 180000) { // 3 minutes in same section
                this.triggerSectionIdleFeedback(currentSection);
                sectionStartTime = Date.now(); // Reset to avoid spam
            }
        }, 60000); // Check every minute
    }

    /**
     * Trigger section-specific idle feedback
     */
    triggerSectionIdleFeedback(section) {
        const sectionSuggestions = {
            swap: {
                title: '💱 Ready to explore more?',
                message: 'Try checking out the liquidity pools or social features',
                action: { text: 'View Pools', handler: 'navigateToPool', icon: '🌊' }
            },
            pools: {
                title: '🌊 Pool exploration time',
                message: 'Maybe check your portfolio or join the social hub?',
                action: { text: 'View Portfolio', handler: 'navigateToPortfolio', icon: '📊' }
            },
            social: {
                title: '🎭 Social butterfly!',
                message: 'Time to trade or participate in governance?',
                action: { text: 'Start Trading', handler: 'navigateToSwap', icon: '💫' }
            },
            dao: {
                title: '🏛️ Democracy in action',
                message: 'Consider sharing your referral link or trading',
                action: { text: 'Trade Now', handler: 'navigateToSwap', icon: '🎯' }
            }
        };

        const suggestion = sectionSuggestions[section];
        if (suggestion) {
            this.triggerFeedback({
                id: `section-idle-${section}`,
                type: 'engagement',
                priority: 'low',
                ...suggestion,
                duration: 6000
            });
        }
    }

    /**
     * Add event listener with tracking
     */
    addTrigger(eventName, handler) {
        document.addEventListener(eventName, handler);
        this.activeListeners.add({ eventName, handler });
    }

    /**
     * Trigger feedback with rate limiting
     */
    triggerFeedback(feedbackData) {
        const now = Date.now();
        
        // Rate limiting
        if (now - this.lastTriggerTime < this.minTriggerInterval) {
            return;
        }

        // Cooldown check
        const cooldownKey = feedbackData.id || feedbackData.type;
        const lastTrigger = this.triggerCooldowns.get(cooldownKey);
        if (lastTrigger && now - lastTrigger < 60000) { // 1 minute cooldown per trigger type
            return;
        }

        // Show feedback via companion
        if (window.cultCompanion) {
            window.cultCompanion.currentInsight = feedbackData;
            window.cultCompanion.showInsightNotification();
        }

        this.lastTriggerTime = now;
        this.triggerCooldowns.set(cooldownKey, now);
    }

    /**
     * Helper: Check if milestone was already celebrated
     */
    hasCelebrated(milestone) {
        const celebrated = JSON.parse(localStorage.getItem('cult-ai-celebrated') || '[]');
        return celebrated.includes(milestone);
    }

    /**
     * Helper: Mark milestone as celebrated
     */
    markCelebrated(milestone) {
        const celebrated = JSON.parse(localStorage.getItem('cult-ai-celebrated') || '[]');
        if (!celebrated.includes(milestone)) {
            celebrated.push(milestone);
            localStorage.setItem('cult-ai-celebrated', JSON.stringify(celebrated));
        }
    }

    /**
     * Helper: Check if section was visited
     */
    hasVisited(section) {
        const visited = JSON.parse(localStorage.getItem('cult-ai-visited') || '[]');
        return visited.includes(section);
    }

    /**
     * Helper: Mark section as visited
     */
    markVisited(section) {
        const visited = JSON.parse(localStorage.getItem('cult-ai-visited') || '[]');
        if (!visited.includes(section)) {
            visited.push(section);
            localStorage.setItem('cult-ai-visited', JSON.stringify(visited));
        }
    }

    /**
     * Helper: Get section information
     */
    getSectionInfo(section) {
        const sectionInfo = {
            pools: {
                title: '🌊 Welcome to Liquidity Pools',
                message: 'Add liquidity to earn fees and support the ecosystem',
                action: { text: 'Learn More', handler: 'showPoolTutorial', icon: '📚' }
            },
            social: {
                title: '🎭 Welcome to the Social Hub',
                message: 'Connect with other Cult members and track your progress',
                action: { text: 'View Profile', handler: 'showProfile', icon: '👤' }
            },
            dao: {
                title: '🏛️ Welcome to Cult Governance',
                message: 'Your voice shapes the future of the platform',
                action: { text: 'View Proposals', handler: 'showProposals', icon: '📋' }
            },
            admin: {
                title: '⚙️ Admin Dashboard',
                message: 'Monitor platform health and user activity',
                action: { text: 'View Analytics', handler: 'showAnalytics', icon: '📊' }
            }
        };

        return sectionInfo[section] || {
            title: '🌙 Welcome',
            message: 'Explore this new section of the platform',
            action: { text: 'Continue', handler: 'dismiss', icon: '✨' }
        };
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        this.activeListeners.forEach(({ eventName, handler }) => {
            document.removeEventListener(eventName, handler);
        });
        this.activeListeners.clear();
    }
}

// Initialize triggers system
window.cultAITriggers = new CultAITriggers();

console.log('⚡ Cult AI Triggers loaded');

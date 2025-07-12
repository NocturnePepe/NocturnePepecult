/**
 * CULT AI INSIGHTS SYSTEM - NOCTURNE SWAP
 * =======================================
 * 
 * PURPOSE: Intelligent user guidance based on wallet state, XP, and activity
 * FEATURES: Smart feedback prompts, contextual suggestions, performance-optimized
 * PHILOSOPHY: AI thinks *with* the user, not for them - suggestive, not intrusive
 */

class CultAIInsights {
    constructor() {
        this.user = null;
        this.insights = [];
        this.isActive = false;
        this.lastAnalysis = 0;
        this.analysisInterval = 30000; // 30 seconds between analysis
        
        this.init();
    }

    /**
     * Initialize the AI insights system
     */
    init() {
        console.log('🧠 Cult AI Insights System initializing...');
        
        // Load user data
        this.loadUserData();
        
        // Setup periodic analysis
        this.setupPeriodicAnalysis();
        
        // Listen for user state changes
        this.setupEventListeners();
        
        this.isActive = true;
        console.log('✅ Cult AI Insights System active');
    }

    /**
     * Load current user data for analysis
     */
    loadUserData() {
        this.user = {
            wallet: {
                connected: window.mockWallet?.connected || false,
                address: window.mockWallet?.publicKey || null,
                balance: window.mockWallet?.balance || 0
            },
            xp: {
                current: parseInt(localStorage.getItem('nocturne-xp') || '0'),
                level: parseInt(localStorage.getItem('nocturne-level') || '1'),
                rank: localStorage.getItem('nocturne-rank') || 'Initiate'
            },
            referrals: {
                count: parseInt(localStorage.getItem('nocturne-referrals') || '0'),
                hasShared: localStorage.getItem('nocturne-referral-shared') === 'true'
            },
            dao: {
                hasVoted: localStorage.getItem('nocturne-dao-voted') === 'true',
                votingPower: this.calculateVotingPower()
            },
            activity: {
                lastSwap: localStorage.getItem('nocturne-last-swap'),
                totalSwaps: parseInt(localStorage.getItem('nocturne-total-swaps') || '0'),
                lastLogin: Date.now()
            }
        };
    }

    /**
     * Calculate user's voting power
     */
    calculateVotingPower() {
        const xp = parseInt(localStorage.getItem('nocturne-xp') || '0');
        const level = parseInt(localStorage.getItem('nocturne-level') || '1');
        const referrals = parseInt(localStorage.getItem('nocturne-referrals') || '0');
        
        return Math.floor(xp * 0.1) + (level * 10) + (referrals * 5);
    }

    /**
     * Main insights analysis function - the heart of Cult AI
     */
    getCultInsights(userOverride = null) {
        const user = userOverride || this.user;
        if (!user) return [];

        const insights = [];
        const now = Date.now();

        // Only analyze if enough time has passed (performance optimization)
        if (now - this.lastAnalysis < this.analysisInterval) {
            return this.insights;
        }

        // 🎯 TRIGGER 1: No wallet connected
        if (!user.wallet.connected) {
            insights.push({
                id: 'no-wallet',
                type: 'connection',
                priority: 'high',
                title: '🌙 Ready to join the Cult?',
                message: 'Connect your wallet to unlock the full Nocturne experience',
                action: {
                    text: 'Connect Wallet',
                    handler: 'connectWallet',
                    icon: '🔗'
                },
                conditions: ['wallet-disconnected'],
                delay: 2000 // Show after 2 seconds
            });
        }

        // 🎯 TRIGGER 2: Low XP (less than 50 XP)
        if (user.wallet.connected && user.xp.current < 50) {
            insights.push({
                id: 'low-xp',
                type: 'progression',
                priority: 'medium',
                title: '⚡ Level up your Cult status',
                message: `You have ${user.xp.current} XP. Try swapping tokens to earn more!`,
                action: {
                    text: 'Start Trading',
                    handler: 'navigateToSwap',
                    icon: '💫'
                },
                conditions: ['low-xp', 'wallet-connected'],
                delay: 5000
            });
        }

        // 🎯 TRIGGER 3: Inactive referral system
        if (user.wallet.connected && !user.referrals.hasShared && user.xp.current > 25) {
            insights.push({
                id: 'inactive-referral',
                type: 'social',
                priority: 'low',
                title: '🤝 Grow the Cult community',
                message: 'Share your referral link and earn bonus XP for each new member',
                action: {
                    text: 'Get Referral Link',
                    handler: 'navigateToReferral',
                    icon: '🔗'
                },
                conditions: ['no-referrals', 'experienced-user'],
                delay: 10000
            });
        }

        // 🎯 TRIGGER 4: Not voted in DAO
        if (user.wallet.connected && !user.dao.hasVoted && user.xp.current > 100) {
            insights.push({
                id: 'no-dao-vote',
                type: 'governance',
                priority: 'medium',
                title: '🗳️ Your voice matters in the Cult',
                message: `You have ${user.dao.votingPower} voting power. Participate in governance!`,
                action: {
                    text: 'View Proposals',
                    handler: 'navigateToDAO',
                    icon: '🏛️'
                },
                conditions: ['no-dao-participation', 'sufficient-xp'],
                delay: 15000
            });
        }

        // 🎯 TRIGGER 5: Successful patterns - positive reinforcement
        if (user.activity.totalSwaps > 5 && user.xp.current > 150) {
            insights.push({
                id: 'cult-success',
                type: 'celebration',
                priority: 'low',
                title: '🌟 Cult member thriving!',
                message: `${user.activity.totalSwaps} swaps completed! You're becoming a true Cult legend`,
                action: {
                    text: 'View Stats',
                    handler: 'navigateToPortfolio',
                    icon: '📊'
                },
                conditions: ['active-trader', 'good-xp'],
                delay: 20000
            });
        }

        // 🎯 TRIGGER 6: Idle user re-engagement
        const daysSinceLastSwap = user.activity.lastSwap ? 
            (now - new Date(user.activity.lastSwap).getTime()) / (1000 * 60 * 60 * 24) : 999;
        
        if (user.wallet.connected && daysSinceLastSwap > 3) {
            insights.push({
                id: 'idle-reengagement',
                type: 'engagement',
                priority: 'medium',
                title: '🔮 The Cult awaits your return',
                message: 'New opportunities in the markets. Ready to trade again?',
                action: {
                    text: 'Explore Markets',
                    handler: 'navigateToSwap',
                    icon: '📈'
                },
                conditions: ['idle-user', 'wallet-connected'],
                delay: 8000
            });
        }

        // Sort insights by priority
        this.insights = insights.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        this.lastAnalysis = now;
        return this.insights;
    }

    /**
     * Get the most relevant insight for current context
     */
    getTopInsight() {
        const insights = this.getCultInsights();
        return insights.length > 0 ? insights[0] : null;
    }

    /**
     * Setup periodic analysis
     */
    setupPeriodicAnalysis() {
        setInterval(() => {
            this.loadUserData();
            this.getCultInsights();
        }, this.analysisInterval);
    }

    /**
     * Setup event listeners for user state changes
     */
    setupEventListeners() {
        // Listen for wallet connection changes
        document.addEventListener('walletConnected', () => {
            setTimeout(() => {
                this.loadUserData();
                this.getCultInsights();
            }, 1000);
        });

        // Listen for XP changes
        document.addEventListener('xpUpdated', () => {
            setTimeout(() => {
                this.loadUserData();
                this.getCultInsights();
            }, 500);
        });

        // Listen for navigation changes
        document.addEventListener('navigationChanged', () => {
            this.loadUserData();
            this.getCultInsights();
        });
    }

    /**
     * Mark insight as seen/dismissed
     */
    dismissInsight(insightId) {
        this.insights = this.insights.filter(insight => insight.id !== insightId);
        
        // Store dismissal to prevent showing again soon
        const dismissed = JSON.parse(localStorage.getItem('cult-ai-dismissed') || '{}');
        dismissed[insightId] = Date.now();
        localStorage.setItem('cult-ai-dismissed', JSON.stringify(dismissed));
    }

    /**
     * Check if insight was recently dismissed
     */
    wasRecentlyDismissed(insightId, hoursThreshold = 24) {
        const dismissed = JSON.parse(localStorage.getItem('cult-ai-dismissed') || '{}');
        const dismissedTime = dismissed[insightId];
        
        if (!dismissedTime) return false;
        
        const hoursSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        return hoursSinceDismissal < hoursThreshold;
    }

    /**
     * Performance-safe insights check
     */
    getInsightsThrottled() {
        // Use requestIdleCallback for performance optimization
        if (window.requestIdleCallback) {
            return new Promise(resolve => {
                window.requestIdleCallback(() => {
                    resolve(this.getCultInsights());
                });
            });
        } else {
            return Promise.resolve(this.getCultInsights());
        }
    }
}

// Initialize global Cult AI system
window.cultAI = new CultAIInsights();

// Expose debugging functions
window.getCultInsights = (user) => window.cultAI.getCultInsights(user);
window.debugCultAI = () => {
    console.group('🧠 Cult AI Debug Info');
    console.log('User Data:', window.cultAI.user);
    console.log('Current Insights:', window.cultAI.insights);
    console.log('Top Insight:', window.cultAI.getTopInsight());
    console.groupEnd();
};

console.log('🧠 Cult AI System loaded - Use debugCultAI() for insights');

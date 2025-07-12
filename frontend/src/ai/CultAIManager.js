/**
 * CULT AI INTEGRATION MANAGER - NOCTURNE SWAP
 * ============================================
 * 
 * PURPOSE: Centralized management of all AI components and interactions
 * FEATURES: Performance monitoring, integration coordination, debugging tools
 * ARCHITECTURE: Modular design with smart initialization and error handling
 */

class CultAIManager {
    constructor() {
        this.components = {
            insights: null,
            companion: null,
            triggers: null
        };
        
        this.isInitialized = false;
        this.performanceMetrics = {
            initTime: 0,
            triggerCount: 0,
            insightCount: 0,
            errorCount: 0
        };
        
        this.config = {
            enableInsights: true,
            enableCompanion: true,
            enableTriggers: true,
            enablePerformanceMonitoring: false,
            debugMode: false
        };
        
        this.init();
    }

    /**
     * Initialize all AI components
     */
    async init() {
        const startTime = performance.now();
        console.log('🧠 Cult AI Manager initializing...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Initialize components in order
            await this.initializeComponents();
            
            // Setup integration hooks
            this.setupIntegrationHooks();
            
            // Setup performance monitoring
            if (this.config.enablePerformanceMonitoring) {
                this.setupPerformanceMonitoring();
            }
            
            // Setup debugging tools
            this.setupDebuggingTools();
            
            this.isInitialized = true;
            this.performanceMetrics.initTime = performance.now() - startTime;
            
            console.log(`✅ Cult AI Manager initialized in ${this.performanceMetrics.initTime.toFixed(2)}ms`);
            
            // Trigger initialization complete event
            document.dispatchEvent(new CustomEvent('cultAIReady', {
                detail: { manager: this, metrics: this.performanceMetrics }
            }));
            
        } catch (error) {
            console.error('❌ Cult AI Manager initialization failed:', error);
            this.performanceMetrics.errorCount++;
        }
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        const dependencies = ['CultAIInsights', 'CultCompanion', 'CultAITriggers'];
        const maxWaitTime = 10000; // 10 seconds
        const checkInterval = 100; // 100ms
        let elapsed = 0;

        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                const available = dependencies.every(dep => typeof window[dep] !== 'undefined');
                
                if (available) {
                    resolve();
                } else if (elapsed >= maxWaitTime) {
                    reject(new Error('AI dependencies not loaded within timeout'));
                } else {
                    elapsed += checkInterval;
                    setTimeout(checkDependencies, checkInterval);
                }
            };
            
            checkDependencies();
        });
    }

    /**
     * Initialize AI components
     */
    async initializeComponents() {
        // Initialize insights system
        if (this.config.enableInsights && window.cultAI) {
            this.components.insights = window.cultAI;
            console.log('🧠 Insights system connected');
        }

        // Initialize companion UI
        if (this.config.enableCompanion && window.cultCompanion) {
            this.components.companion = window.cultCompanion;
            console.log('🤖 Companion UI connected');
        }

        // Initialize triggers system
        if (this.config.enableTriggers && window.cultAITriggers) {
            this.components.triggers = window.cultAITriggers;
            console.log('⚡ Triggers system connected');
        }
    }

    /**
     * Setup integration hooks between components
     */
    setupIntegrationHooks() {
        // Hook wallet events to AI insights
        document.addEventListener('walletConnected', () => {
            this.onWalletStateChange('connected');
        });
        
        document.addEventListener('walletDisconnected', () => {
            this.onWalletStateChange('disconnected');
        });

        // Hook XP events
        document.addEventListener('xpUpdated', (e) => {
            this.onXPChange(e.detail);
        });

        // Hook navigation events
        document.addEventListener('navigationChanged', (e) => {
            this.onNavigationChange(e.detail);
        });

        // Hook trading events
        document.addEventListener('swapCompleted', (e) => {
            this.onSwapCompleted(e.detail);
        });

        // Hook DAO events
        document.addEventListener('daoVoteSubmitted', (e) => {
            this.onDAOVote(e.detail);
        });

        // Hook referral events
        document.addEventListener('referralShared', (e) => {
            this.onReferralShared(e.detail);
        });
    }

    /**
     * Handle wallet state changes
     */
    onWalletStateChange(state) {
        if (!this.isInitialized) return;

        // Update insights data
        if (this.components.insights) {
            this.components.insights.loadUserData();
        }

        // Trigger appropriate feedback
        if (state === 'connected' && this.components.triggers) {
            document.dispatchEvent(new CustomEvent('walletConnected'));
        } else if (state === 'disconnected' && this.components.triggers) {
            document.dispatchEvent(new CustomEvent('walletDisconnected'));
        }

        this.performanceMetrics.triggerCount++;
    }

    /**
     * Handle XP changes
     */
    onXPChange(data) {
        if (!this.isInitialized) return;

        // Update insights
        if (this.components.insights) {
            this.components.insights.loadUserData();
        }

        // Check for milestones
        this.checkXPMilestones(data);
        
        this.performanceMetrics.triggerCount++;
    }

    /**
     * Check for XP milestones and trigger celebrations
     */
    checkXPMilestones(data) {
        const currentXP = data?.xp || parseInt(localStorage.getItem('nocturne-xp') || '0');
        const currentLevel = parseInt(localStorage.getItem('nocturne-level') || '1');
        const previousLevel = parseInt(localStorage.getItem('nocturne-previous-level') || '1');

        // Level up detection
        if (currentLevel > previousLevel) {
            document.dispatchEvent(new CustomEvent('levelUp', {
                detail: { level: currentLevel, previousLevel }
            }));
            localStorage.setItem('nocturne-previous-level', currentLevel.toString());
        }

        // XP milestone detection
        document.dispatchEvent(new CustomEvent('xpUpdated', {
            detail: { xp: currentXP }
        }));
    }

    /**
     * Handle navigation changes
     */
    onNavigationChange(data) {
        if (!this.isInitialized || !data?.section) return;

        // Update insights context
        if (this.components.insights) {
            this.components.insights.loadUserData();
        }

        // Trigger first visit events
        const section = data.section;
        const eventName = `firstVisit${section.charAt(0).toUpperCase() + section.slice(1)}`;
        document.dispatchEvent(new CustomEvent(eventName));

        this.performanceMetrics.triggerCount++;
    }

    /**
     * Handle swap completion
     */
    onSwapCompleted(data) {
        if (!this.isInitialized) return;

        // Update swap statistics
        const totalSwaps = parseInt(localStorage.getItem('nocturne-total-swaps') || '0') + 1;
        localStorage.setItem('nocturne-total-swaps', totalSwaps.toString());
        localStorage.setItem('nocturne-last-swap', new Date().toISOString());

        // Trigger swap completion event
        document.dispatchEvent(new CustomEvent('swapCompleted', {
            detail: { ...data, totalSwaps }
        }));

        this.performanceMetrics.triggerCount++;
    }

    /**
     * Handle DAO vote submission
     */
    onDAOVote(data) {
        if (!this.isInitialized) return;

        // Update DAO participation
        localStorage.setItem('nocturne-dao-voted', 'true');
        localStorage.setItem('nocturne-last-dao-vote', new Date().toISOString());

        // Trigger DAO participation event
        document.dispatchEvent(new CustomEvent('daoVoteSubmitted', {
            detail: data
        }));

        this.performanceMetrics.triggerCount++;
    }

    /**
     * Handle referral sharing
     */
    onReferralShared(data) {
        if (!this.isInitialized) return;

        // Update referral status
        localStorage.setItem('nocturne-referral-shared', 'true');
        localStorage.setItem('nocturne-referral-share-date', new Date().toISOString());

        // Trigger referral event
        document.dispatchEvent(new CustomEvent('referralShared', {
            detail: data
        }));

        this.performanceMetrics.triggerCount++;
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor component health every 30 seconds
        setInterval(() => {
            this.checkComponentHealth();
        }, 30000);

        // Log performance metrics every 5 minutes
        setInterval(() => {
            this.logPerformanceMetrics();
        }, 300000);
    }

    /**
     * Check health of AI components
     */
    checkComponentHealth() {
        const health = {
            insights: this.components.insights?.isActive || false,
            companion: this.components.companion?.isVisible !== undefined,
            triggers: this.components.triggers?.activeListeners?.size > 0 || false
        };

        // Log any unhealthy components
        Object.entries(health).forEach(([component, isHealthy]) => {
            if (!isHealthy) {
                console.warn(`⚠️ Cult AI component unhealthy: ${component}`);
            }
        });

        return health;
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        if (this.config.debugMode) {
            console.group('🧠 Cult AI Performance Metrics');
            console.log('Initialization time:', `${this.performanceMetrics.initTime.toFixed(2)}ms`);
            console.log('Total triggers:', this.performanceMetrics.triggerCount);
            console.log('Total insights:', this.performanceMetrics.insightCount);
            console.log('Total errors:', this.performanceMetrics.errorCount);
            console.log('Component health:', this.checkComponentHealth());
            console.groupEnd();
        }
    }

    /**
     * Setup debugging tools
     */
    setupDebuggingTools() {
        // Expose debugging functions globally
        window.cultAIDebug = {
            manager: this,
            
            // Get current AI state
            getState: () => ({
                initialized: this.isInitialized,
                components: Object.keys(this.components).reduce((acc, key) => {
                    acc[key] = !!this.components[key];
                    return acc;
                }, {}),
                metrics: this.performanceMetrics,
                config: this.config
            }),
            
            // Force trigger insight check
            checkInsights: () => {
                if (this.components.insights) {
                    return this.components.insights.getCultInsights();
                }
                return null;
            },
            
            // Show companion
            showCompanion: () => {
                if (this.components.companion) {
                    this.components.companion.show();
                }
            },
            
            // Hide companion
            hideCompanion: () => {
                if (this.components.companion) {
                    this.components.companion.hide();
                }
            },
            
            // Simulate events for testing
            simulate: {
                walletConnect: () => document.dispatchEvent(new CustomEvent('walletConnected')),
                walletDisconnect: () => document.dispatchEvent(new CustomEvent('walletDisconnected')),
                xpGain: (amount = 50) => document.dispatchEvent(new CustomEvent('xpUpdated', { 
                    detail: { xp: parseInt(localStorage.getItem('nocturne-xp') || '0') + amount }
                })),
                swapComplete: () => document.dispatchEvent(new CustomEvent('swapCompleted', {
                    detail: { amount: 100, token: 'SOL' }
                })),
                navigate: (section) => document.dispatchEvent(new CustomEvent('navigationChanged', {
                    detail: { section }
                }))
            },
            
            // Performance monitoring
            enablePerformanceMonitoring: () => {
                this.config.enablePerformanceMonitoring = true;
                this.setupPerformanceMonitoring();
            },
            
            // Debug mode toggle
            toggleDebugMode: () => {
                this.config.debugMode = !this.config.debugMode;
                console.log(`Debug mode ${this.config.debugMode ? 'enabled' : 'disabled'}`);
            }
        };
    }

    /**
     * Get current insights
     */
    getCurrentInsights() {
        if (this.components.insights) {
            return this.components.insights.getCultInsights();
        }
        return [];
    }

    /**
     * Force show specific insight
     */
    showInsight(insight) {
        if (this.components.companion) {
            this.components.companion.currentInsight = insight;
            this.components.companion.showInsightNotification();
        }
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        if (this.components.triggers) {
            this.components.triggers.destroy();
        }
        
        if (this.components.companion) {
            this.components.companion.hide();
        }

        this.isInitialized = false;
        console.log('🧠 Cult AI Manager destroyed');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cultAIManager = new CultAIManager();
    });
} else {
    window.cultAIManager = new CultAIManager();
}

console.log('🧠 Cult AI Manager loaded - Use cultAIDebug for debugging tools');

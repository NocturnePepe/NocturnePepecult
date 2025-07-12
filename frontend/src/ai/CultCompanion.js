/**
 * CULT COMPANION - ANIMATED AI INTERFACE
 * ====================================== 
 * 
 * PURPOSE: Non-intrusive AI companion that provides contextual insights
 * FEATURES: Floating companion, pulsing notifications, smooth animations
 * PERFORMANCE: 60fps GPU-accelerated animations with smart timing
 */

class CultCompanion {
    constructor() {
        this.isVisible = false;
        this.isExpanded = false;
        this.currentInsight = null;
        this.element = null;
        this.messageElement = null;
        this.pulseAnimation = null;
        
        this.init();
    }

    /**
     * Initialize the Cult Companion
     */
    init() {
        this.createCompanionElement();
        this.setupEventListeners();
        this.startInsightMonitoring();
        
        console.log('🤖 Cult Companion initialized');
    }

    /**
     * Create the main companion UI element
     */
    createCompanionElement() {
        // Create companion container with accessibility
        this.element = document.createElement('div');
        this.element.id = 'cult-companion';
        this.element.className = 'cult-companion';
        this.element.setAttribute('role', 'complementary');
        this.element.setAttribute('aria-label', 'AI Companion Assistant');
        this.element.setAttribute('aria-live', 'polite');
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('aria-expanded', 'false');
        
        // Create companion structure
        this.element.innerHTML = `
            <div class="companion-orb" id="companionOrb">
                <div class="orb-inner">
                    <div class="orb-core">🌙</div>
                    <div class="pulse-ring"></div>
                    <div class="pulse-ring-2"></div>
                </div>
                <div class="insight-indicator" id="insightIndicator">●</div>
            </div>
            
            <div class="companion-message" id="companionMessage">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-title" id="messageTitle">Cult Insights</span>
                        <button class="message-close" id="messageClose">×</button>
                    </div>
                    <div class="message-body" id="messageBody">
                        <p>Ready to guide your Cult journey...</p>
                    </div>
                    <div class="message-actions" id="messageActions">
                        <!-- Actions will be populated dynamically -->
                    </div>
                </div>
                <div class="message-arrow"></div>
            </div>
        `;

        // Apply GPU-accelerated styling
        this.element.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 1000;
            pointer-events: auto;
            will-change: transform, opacity;
            transform: translateZ(0);
            backface-visibility: hidden;
            contain: layout style paint;
            opacity: 0;
            transform: scale(0.8) translateZ(0);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        document.body.appendChild(this.element);
        this.messageElement = this.element.querySelector('#companionMessage');
        
        // Cache important elements
        this.orbElement = this.element.querySelector('#companionOrb');
        this.indicatorElement = this.element.querySelector('#insightIndicator');
        this.titleElement = this.element.querySelector('#messageTitle');
        this.bodyElement = this.element.querySelector('#messageBody');
        this.actionsElement = this.element.querySelector('#messageActions');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Orb click to toggle message
        this.orbElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMessage();
        });

        // Close button
        this.element.querySelector('#messageClose').addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideMessage();
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isExpanded && !this.element.contains(e.target)) {
                this.hideMessage();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.hideMessage();
            }
        });

        // Reduced motion support
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.element.style.animation = 'none';
        }

        // Keyboard navigation
        this.element.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    /**
     * Start monitoring for insights
     */
    startInsightMonitoring() {
        // Check for insights every 15 seconds
        setInterval(() => {
            this.checkForInsights();
        }, 15000);

        // Initial check after delay
        setTimeout(() => {
            this.checkForInsights();
        }, 3000);
    }

    /**
     * Check for new insights from Cult AI
     */
    async checkForInsights() {
        if (!window.cultAI) return;

        try {
            const topInsight = window.cultAI.getTopInsight();
            
            if (topInsight && topInsight.id !== this.currentInsight?.id) {
                // Check if this insight was recently dismissed
                if (window.cultAI.wasRecentlyDismissed(topInsight.id)) {
                    return;
                }

                this.currentInsight = topInsight;
                this.showInsightNotification();
            }
        } catch (error) {
            console.warn('Cult Companion: Error checking insights:', error);
        }
    }

    /**
     * Show insight notification with pulsing animation
     */
    showInsightNotification() {
        if (!this.currentInsight) return;

        // Show companion if hidden
        this.show();

        // Start pulsing animation
        this.startPulseAnimation();

        // Show insight indicator
        this.indicatorElement.style.opacity = '1';
        this.indicatorElement.style.animation = 'insightPulse 2s ease-in-out infinite';

        // Auto-expand after delay based on priority
        const delay = this.currentInsight.delay || 5000;
        setTimeout(() => {
            if (this.currentInsight && !this.isExpanded) {
                this.showMessage();
            }
        }, delay);
    }

    /**
     * Start pulsing animation for the orb
     */
    startPulseAnimation() {
        if (this.pulseAnimation) return; // Already pulsing

        this.pulseAnimation = this.orbElement.animate([
            { transform: 'scale(1) translateZ(0)', opacity: '1' },
            { transform: 'scale(1.1) translateZ(0)', opacity: '0.8' },
            { transform: 'scale(1) translateZ(0)', opacity: '1' }
        ], {
            duration: 2000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }

    /**
     * Stop pulsing animation
     */
    stopPulseAnimation() {
        if (this.pulseAnimation) {
            this.pulseAnimation.cancel();
            this.pulseAnimation = null;
        }
        
        this.indicatorElement.style.opacity = '0';
        this.indicatorElement.style.animation = 'none';
    }

    /**
     * Show the companion
     */
    show() {
        if (this.isVisible) return;

        this.isVisible = true;
        this.element.style.opacity = '1';
        this.element.style.transform = 'scale(1) translateZ(0)';
    }

    /**
     * Hide the companion
     */
    hide() {
        this.isVisible = false;
        this.isExpanded = false;
        this.element.style.opacity = '0';
        this.element.style.transform = 'scale(0.8) translateZ(0)';
        this.messageElement.style.opacity = '0';
        this.messageElement.style.transform = 'translateY(20px) scale(0.95) translateZ(0)';
        this.stopPulseAnimation();
    }

    /**
     * Toggle message visibility
     */
    toggleMessage() {
        if (this.isExpanded) {
            this.hideMessage();
        } else {
            this.showMessage();
        }
    }

    /**
     * Show insight message
     */
    showMessage() {
        if (!this.currentInsight) return;

        this.isExpanded = true;
        this.stopPulseAnimation();

        // Update message content
        this.updateMessageContent();

        // Animate message appearance
        this.messageElement.style.display = 'block';
        this.messageElement.style.opacity = '0';
        this.messageElement.style.transform = 'translateY(20px) scale(0.95) translateZ(0)';

        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            this.messageElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            this.messageElement.style.opacity = '1';
            this.messageElement.style.transform = 'translateY(0) scale(1) translateZ(0)';
        });
    }

    /**
     * Hide insight message
     */
    hideMessage() {
        if (!this.isExpanded) return;

        this.isExpanded = false;

        this.messageElement.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        this.messageElement.style.opacity = '0';
        this.messageElement.style.transform = 'translateY(20px) scale(0.95) translateZ(0)';

        setTimeout(() => {
            this.messageElement.style.display = 'none';
        }, 200);

        // Mark as dismissed
        if (this.currentInsight && window.cultAI) {
            window.cultAI.dismissInsight(this.currentInsight.id);
        }
    }

    /**
     * Update message content with current insight
     */
    updateMessageContent() {
        if (!this.currentInsight) return;

        // Update title and message
        this.titleElement.textContent = this.currentInsight.title;
        this.bodyElement.innerHTML = `<p>${this.currentInsight.message}</p>`;

        // Create action button if provided
        this.actionsElement.innerHTML = '';
        if (this.currentInsight.action) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'companion-action-btn';
            actionBtn.innerHTML = `${this.currentInsight.action.icon} ${this.currentInsight.action.text}`;
            
            actionBtn.addEventListener('click', () => {
                this.handleAction(this.currentInsight.action);
            });

            this.actionsElement.appendChild(actionBtn);
        }
    }

    /**
     * Handle insight action
     */
    handleAction(action) {
        switch (action.handler) {
            case 'connectWallet':
                this.triggerWalletConnection();
                break;
            case 'navigateToSwap':
                this.navigateToSection('swap');
                break;
            case 'navigateToReferral':
                this.navigateToSection('social');
                break;
            case 'navigateToDAO':
                this.navigateToSection('dao');
                break;
            case 'navigateToPortfolio':
                this.navigateToSection('portfolio');
                break;
            default:
                console.log('Cult Companion: Unknown action:', action.handler);
        }

        this.hideMessage();
    }

    /**
     * Trigger wallet connection
     */
    triggerWalletConnection() {
        const connectBtn = document.querySelector('#connectWallet, .connect-wallet, [data-action="connect-wallet"]');
        if (connectBtn) {
            connectBtn.click();
        }
    }

    /**
     * Navigate to specific section
     */
    navigateToSection(section) {
        const navBtn = document.querySelector(`[data-section="${section}"], #${section}Tab, .nav-${section}`);
        if (navBtn) {
            navBtn.click();
        } else {
            // Fallback - emit custom event
            document.dispatchEvent(new CustomEvent('cultNavigate', { 
                detail: { section } 
            }));
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleMessage();
        } else if (event.key === 'Escape') {
            this.hideMessage();
        }
    }
}

// Initialize companion when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cultCompanion = new CultCompanion();
    });
} else {
    window.cultCompanion = new CultCompanion();
}

console.log('🤖 Cult Companion loaded');

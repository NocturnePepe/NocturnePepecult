/**
 * PARTICLE SYSTEM INTEGRATION MANAGER
 * ===================================
 * 
 * PURPOSE: Seamless integration of optimized particle system with existing UI
 * FEATURES: Smart initialization, theme integration, performance monitoring
 * COMPATIBILITY: Works with existing visual systems without conflicts
 */

class ParticleSystemManager {
    constructor() {
        this.particleSystem = null;
        this.isInitialized = false;
        this.config = {
            autoStart: true,
            enableMonitoring: false, // Set to true for development
            adaptivePerformance: true,
            themeIntegration: true
        };
        
        this.init();
    }

    /**
     * Initialize particle system with smart detection
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startInitialization());
        } else {
            this.startInitialization();
        }
    }

    /**
     * Start the initialization process
     */
    startInitialization() {
        console.log('🎨 Initializing Nocturne Particle System...');
        
        // Check if OptimizedParticleSystem is available
        if (typeof OptimizedParticleSystem === 'undefined') {
            console.error('❌ OptimizedParticleSystem not found. Please ensure the script is loaded.');
            return;
        }

        // Clean up existing particle systems
        this.cleanupExistingSystems();
        
        // Initialize new optimized system
        this.initializeOptimizedSystem();
        
        // Setup theme integration
        if (this.config.themeIntegration) {
            this.setupThemeIntegration();
        }
        
        this.isInitialized = true;
        console.log('✅ Particle system initialized successfully');
    }

    /**
     * Clean up any existing particle systems to prevent conflicts
     */
    cleanupExistingSystems() {
        // Remove old canvas elements
        const existingCanvases = document.querySelectorAll('canvas[id*="particle"], canvas[class*="particle"]');
        existingCanvases.forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        });

        // Clean up old NocturneVisuals if it exists
        if (window.nocturneVisuals && typeof window.nocturneVisuals.destroy === 'function') {
            window.nocturneVisuals.destroy();
        }
        
        console.log('🧹 Cleaned up existing particle systems');
    }

    /**
     * Initialize the optimized particle system
     */
    initializeOptimizedSystem() {
        const particleConfig = {
            particleCount: this.getOptimalParticleCount(),
            speed: 1,
            monitoring: this.config.enableMonitoring,
            enablePerformanceMonitoring: this.config.enableMonitoring
        };

        this.particleSystem = new OptimizedParticleSystem(particleConfig);
        
        // Store reference globally for debugging
        window.nocturneParticleSystem = this.particleSystem;
        
        console.log(`🎭 Particle system created with ${particleConfig.particleCount} particles`);
    }

    /**
     * Get optimal particle count based on device capabilities
     */
    getOptimalParticleCount() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
        const memoryGb = navigator.deviceMemory || 4;

        if (isMobile) {
            return memoryGb >= 6 ? 60 : 40;
        } else if (isLowEnd) {
            return 50;
        } else {
            return memoryGb >= 8 ? 100 : 80;
        }
    }

    /**
     * Setup theme integration and monitoring
     */
    setupThemeIntegration() {
        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')) {
                    this.handleThemeChange();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });

        // Also listen for custom theme change events
        document.addEventListener('themeChanged', () => this.handleThemeChange());
        
        console.log('🎨 Theme integration enabled');
    }

    /**
     * Handle theme changes
     */
    handleThemeChange() {
        if (this.particleSystem && typeof this.particleSystem.updateParticleColors === 'function') {
            this.particleSystem.updateParticleColors();
            console.log('🎨 Particle colors updated for theme change');
        }
    }

    /**
     * Apply enhanced UI box styles to existing elements
     */
    applyEnhancedStyling() {
        // Add enhanced classes to existing UI elements
        const uiElements = {
            '.swap-container, .swap-card, .trading-card': 'swap-box',
            '.wallet-card, .wallet-connector, .connect-wallet': 'wallet-box',
            '.settings-panel, .settings-card, .config-panel': 'settings-box',
            '.transaction-list, .tx-history, .history-panel': 'history-box'
        };

        Object.entries(uiElements).forEach(([selectors, className]) => {
            const elements = document.querySelectorAll(selectors);
            elements.forEach(element => {
                element.classList.add(className);
            });
        });

        console.log('✨ Enhanced UI styling applied to existing elements');
    }

    /**
     * Performance monitoring and adaptive adjustment
     */
    startPerformanceMonitoring() {
        if (!this.particleSystem) return;

        const monitor = () => {
            const stats = this.particleSystem.getPerformanceStats();
            
            // Log performance data for debugging
            if (this.config.enableMonitoring) {
                console.log('📊 Particle Performance:', stats);
            }

            // Adaptive performance adjustments
            if (stats.fps < 45 && stats.particleCount > 20) {
                this.particleSystem.setParticleCount(Math.max(20, stats.particleCount - 10));
                console.log('⚡ Reduced particle count for better performance');
            } else if (stats.fps > 58 && stats.particleCount < 100) {
                this.particleSystem.setParticleCount(Math.min(100, stats.particleCount + 5));
            }
        };

        // Monitor every 5 seconds
        setInterval(monitor, 5000);
    }

    /**
     * Public API methods
     */
    getParticleSystem() {
        return this.particleSystem;
    }

    setParticleCount(count) {
        if (this.particleSystem) {
            this.particleSystem.setParticleCount(count);
        }
    }

    getPerformanceStats() {
        return this.particleSystem ? this.particleSystem.getPerformanceStats() : null;
    }

    enableMonitoring() {
        this.config.enableMonitoring = true;
        if (this.particleSystem) {
            this.particleSystem.startPerformanceMonitoring();
        }
        this.startPerformanceMonitoring();
    }

    disableMonitoring() {
        this.config.enableMonitoring = false;
        const monitor = document.getElementById('particle-performance-monitor');
        if (monitor) {
            monitor.remove();
        }
    }

    restart() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
        this.isInitialized = false;
        this.startInitialization();
    }

    destroy() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
            this.particleSystem = null;
        }
        this.isInitialized = false;
        delete window.nocturneParticleSystem;
        console.log('🗑️ Particle system destroyed');
    }
}

/**
 * AUTO-INITIALIZATION
 * ===================
 * Automatically start the particle system when this script loads
 */

// Create global instance
window.nocturneParticleManager = new ParticleSystemManager();

// Development utilities
if (typeof window !== 'undefined') {
    window.particleDebug = {
        restart: () => window.nocturneParticleManager.restart(),
        enableMonitoring: () => window.nocturneParticleManager.enableMonitoring(),
        disableMonitoring: () => window.nocturneParticleManager.disableMonitoring(),
        setParticleCount: (count) => window.nocturneParticleManager.setParticleCount(count),
        getStats: () => window.nocturneParticleManager.getPerformanceStats(),
        destroy: () => window.nocturneParticleManager.destroy()
    };
    
    console.log('🛠️  Particle debug utilities available via window.particleDebug');
}

/**
 * ENHANCED UI INTEGRATION
 * =======================
 * Apply enhanced styling after particle system initializes
 */

// Wait a moment for particles to initialize, then apply UI enhancements
setTimeout(() => {
    if (window.nocturneParticleManager && window.nocturneParticleManager.isInitialized) {
        window.nocturneParticleManager.applyEnhancedStyling();
    }
}, 1000);

/**
 * EXPORT FOR MODULE USAGE
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystemManager;
}

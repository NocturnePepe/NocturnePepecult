/**
 * OPTIMIZED PARTICLE SYSTEM FOR NOCTURNE SWAP
 * ==========================================
 * 
 * PURPOSE: Dedicated particle effect layer that sits between background and UI components
 * PERFORMANCE: GPU-accelerated with device-adaptive particle density
 * LAYERING: Proper z-index management ensuring no interference with interactive elements
 * MAINTENANCE: Clear separation of concerns with performance monitoring hooks
 */

class OptimizedParticleSystem {
    constructor(options = {}) {
        // Performance configuration
        this.config = {
            baseParticleCount: options.particleCount || 80,
            minParticleCount: 20,
            maxParticleCount: 150,
            animationSpeed: options.speed || 1,
            enablePerformanceMonitoring: options.monitoring || false,
            ...options
        };

        // Performance tracking
        this.performance = {
            fps: 60,
            frameCount: 0,
            lastTime: performance.now(),
            isLowPerformanceMode: false
        };

        // Core properties
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.isActive = true;
        this.devicePixelRatio = window.devicePixelRatio || 1;

        this.init();
    }

    /**
     * Initialize the particle system with proper layering
     */
    init() {
        this.createOptimizedCanvas();
        this.setupPerformanceDetection();
        this.createParticles();
        this.bindEventListeners();
        this.startRenderLoop();
        
        if (this.config.enablePerformanceMonitoring) {
            this.startPerformanceMonitoring();
        }
    }

    /**
     * Create canvas with optimal layering and GPU hints
     * Z-INDEX HIERARCHY: background(-2) < particles(-1) < UI content(1+)
     */
    createOptimizedCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'nocturne-particle-system';
        this.canvas.className = 'particle-system-layer';
        
        // CRITICAL: Proper layering configuration
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
            contain: strict;
            opacity: 0.6;
        `;

        // Insert particle layer between background and content
        // This ensures particles are above background but below all UI
        const targetElement = document.querySelector('.App') || document.body;
        targetElement.insertBefore(this.canvas, targetElement.firstChild);

        this.ctx = this.canvas.getContext('2d', {
            alpha: true,
            desynchronized: true // For better performance
        });

        this.resizeCanvas();
    }

    /**
     * Device-adaptive performance detection
     */
    setupPerformanceDetection() {
        // Detect device capabilities
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
        
        // Adaptive particle count based on device
        if (isMobile || isLowEndDevice) {
            this.config.baseParticleCount = Math.min(this.config.baseParticleCount, 40);
            this.performance.isLowPerformanceMode = true;
        }

        // Memory constraints
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            this.config.baseParticleCount = Math.min(this.config.baseParticleCount, 30);
        }
    }

    /**
     * Create optimized particle array with theme-aware colors
     */
    createParticles() {
        const particleCount = this.getAdaptiveParticleCount();
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createSingleParticle());
        }
    }

    /**
     * Get current theme colors from CSS custom properties
     */
    getThemeColors() {
        const rootStyles = getComputedStyle(document.documentElement);
        return {
            primary: rootStyles.getPropertyValue('--theme-primary') || '#6a0dad',
            secondary: rootStyles.getPropertyValue('--theme-secondary') || '#9932cc',
            accent: rootStyles.getPropertyValue('--theme-accent') || '#ff1493',
            glow: rootStyles.getPropertyValue('--theme-glow') || 'rgba(106, 13, 173, 0.6)'
        };
    }

    /**
     * Create individual particle with GPU-optimized properties
     */
    createSingleParticle() {
        const colors = this.getThemeColors();
        const colorOptions = [colors.primary, colors.secondary, colors.accent];
        
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01 + Math.random() * 0.02
        };
    }

    /**
     * Device-adaptive particle count calculation
     */
    getAdaptiveParticleCount() {
        if (this.performance.isLowPerformanceMode) {
            return this.config.minParticleCount;
        }

        // Adjust based on screen size
        const screenArea = window.innerWidth * window.innerHeight;
        const baseArea = 1920 * 1080; // Base screen size
        const ratio = Math.min(screenArea / baseArea, 2);
        
        return Math.floor(this.config.baseParticleCount * ratio);
    }

    /**
     * Optimized resize handler with debouncing
     */
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.devicePixelRatio;
        this.canvas.height = rect.height * this.devicePixelRatio;
        
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
        
        // Redistribute particles on resize
        this.redistributeParticles();
    }

    /**
     * Redistribute particles after resize
     */
    redistributeParticles() {
        this.particles.forEach(particle => {
            if (particle.x > this.canvas.width) particle.x = this.canvas.width * 0.9;
            if (particle.y > this.canvas.height) particle.y = this.canvas.height * 0.9;
        });
    }

    /**
     * GPU-optimized particle update loop
     */
    updateParticles() {
        this.particles.forEach(particle => {
            // Position updates
            particle.x += particle.vx * this.config.animationSpeed;
            particle.y += particle.vy * this.config.animationSpeed;
            particle.pulse += particle.pulseSpeed;

            // Boundary wrapping (more efficient than bouncing)
            if (particle.x < -10) particle.x = this.canvas.width + 10;
            else if (particle.x > this.canvas.width + 10) particle.x = -10;
            
            if (particle.y < -10) particle.y = this.canvas.height + 10;
            else if (particle.y > this.canvas.height + 10) particle.y = -10;

            // Apply gentle drift for organic movement
            particle.vx *= 0.999;
            particle.vy *= 0.999;
            
            if (Math.abs(particle.vx) < 0.1) particle.vx += (Math.random() - 0.5) * 0.02;
            if (Math.abs(particle.vy) < 0.1) particle.vy += (Math.random() - 0.5) * 0.02;
        });
    }

    /**
     * High-performance rendering with batched operations
     */
    renderParticles() {
        // Clear with minimal overdraw
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Batch render particles by color for efficiency
        const colorGroups = {};
        
        this.particles.forEach(particle => {
            if (!colorGroups[particle.color]) {
                colorGroups[particle.color] = [];
            }
            colorGroups[particle.color].push(particle);
        });

        // Render each color group
        Object.entries(colorGroups).forEach(([color, particles]) => {
            this.ctx.fillStyle = color;
            
            particles.forEach(particle => {
                const pulseFactor = 1 + Math.sin(particle.pulse) * 0.2;
                const currentSize = particle.size * pulseFactor;
                const currentOpacity = particle.opacity * (0.6 + Math.sin(particle.pulse) * 0.4);
                
                this.ctx.globalAlpha = currentOpacity;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });

        this.ctx.globalAlpha = 1;
    }

    /**
     * Main render loop with performance monitoring
     */
    animate() {
        if (!this.isActive) return;

        const currentTime = performance.now();
        this.performance.frameCount++;

        // Calculate FPS every second
        if (currentTime - this.performance.lastTime >= 1000) {
            this.performance.fps = Math.round((this.performance.frameCount * 1000) / (currentTime - this.performance.lastTime));
            this.performance.frameCount = 0;
            this.performance.lastTime = currentTime;
            
            this.adaptPerformance();
        }

        this.updateParticles();
        this.renderParticles();

        requestAnimationFrame(() => this.animate());
    }

    /**
     * Adaptive performance management
     */
    adaptPerformance() {
        if (this.performance.fps < 45 && !this.performance.isLowPerformanceMode) {
            // Reduce particle count for better performance
            const reduceBy = Math.floor(this.particles.length * 0.2);
            this.particles.splice(0, reduceBy);
            this.performance.isLowPerformanceMode = true;
            console.log('🔧 Particle system: Reduced particle count for better performance');
        } else if (this.performance.fps > 55 && this.performance.isLowPerformanceMode && this.particles.length < this.config.baseParticleCount) {
            // Add particles back if performance improves
            const addCount = Math.min(10, this.config.baseParticleCount - this.particles.length);
            for (let i = 0; i < addCount; i++) {
                this.particles.push(this.createSingleParticle());
            }
        }
    }

    /**
     * Event listeners for responsive behavior
     */
    bindEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resizeCanvas(), 150);
        });

        // Pause particles when page is hidden for performance
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
            if (this.isActive) {
                this.animate();
            }
        });

        // Listen for theme changes
        document.addEventListener('themeChanged', () => {
            this.updateParticleColors();
        });
    }

    /**
     * Update particle colors when theme changes
     */
    updateParticleColors() {
        const colors = this.getThemeColors();
        const colorOptions = [colors.primary, colors.secondary, colors.accent];
        
        this.particles.forEach(particle => {
            particle.color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        });
    }

    /**
     * Start the render loop
     */
    startRenderLoop() {
        this.animate();
    }

    /**
     * Performance monitoring for development
     */
    startPerformanceMonitoring() {
        const monitor = document.createElement('div');
        monitor.id = 'particle-performance-monitor';
        monitor.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(monitor);

        setInterval(() => {
            monitor.textContent = `Particles: ${this.particles.length} | FPS: ${this.performance.fps} | Mode: ${this.performance.isLowPerformanceMode ? 'Low' : 'Normal'}`;
        }, 1000);
    }

    /**
     * Clean destruction method
     */
    destroy() {
        this.isActive = false;
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        const monitor = document.getElementById('particle-performance-monitor');
        if (monitor) {
            monitor.remove();
        }
    }

    /**
     * Public API for external control
     */
    setParticleCount(count) {
        const targetCount = Math.max(this.config.minParticleCount, Math.min(count, this.config.maxParticleCount));
        
        if (targetCount > this.particles.length) {
            for (let i = this.particles.length; i < targetCount; i++) {
                this.particles.push(this.createSingleParticle());
            }
        } else {
            this.particles.splice(targetCount);
        }
    }

    getPerformanceStats() {
        return {
            fps: this.performance.fps,
            particleCount: this.particles.length,
            isLowPerformanceMode: this.performance.isLowPerformanceMode,
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            }
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedParticleSystem;
}

// Global initialization for immediate use
window.OptimizedParticleSystem = OptimizedParticleSystem;

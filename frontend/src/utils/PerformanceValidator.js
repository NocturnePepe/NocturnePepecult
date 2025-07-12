/**
 * NOCTURNE PERFORMANCE VALIDATION UTILITY
 * =======================================
 * 
 * PURPOSE: Validate 60fps performance and visual harmony
 * FEATURES: Real-time FPS monitoring, layer validation, particle optimization
 * INTEGRATION: Developer tools for performance debugging
 */

class NocturnePerformanceValidator {
    constructor() {
        this.isMonitoring = false;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.fpsHistory = [];
        
        this.init();
    }
    
    init() {
        console.log('🔍 Nocturne Performance Validator initialized');
        this.createPerformanceMonitor();
        this.validateLayering();
    }
    
    /**
     * Create performance monitoring overlay
     */
    createPerformanceMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'nocturne-performance-monitor';
        monitor.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 9999;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 255, 0, 0.3);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(monitor);
        this.monitor = monitor;
    }
    
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitor.style.opacity = '1';
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        this.monitorLoop();
        console.log('🎮 Performance monitoring started');
    }
    
    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        this.monitor.style.opacity = '0';
        console.log('🎮 Performance monitoring stopped');
    }
    
    /**
     * Performance monitoring loop
     */
    monitorLoop() {
        if (!this.isMonitoring) return;
        
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.fpsHistory.push(this.fps);
            
            // Keep only last 10 readings
            if (this.fpsHistory.length > 10) {
                this.fpsHistory.shift();
            }
            
            this.updateMonitorDisplay();
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame(() => this.monitorLoop());
    }
    
    /**
     * Update monitor display
     */
    updateMonitorDisplay() {
        if (!this.monitor) return;
        
        const avgFps = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
        const particleCount = window.nocturneParticleSystem ? 
            window.nocturneParticleSystem.particles.length : 0;
        
        const status = this.fps >= 58 ? '✅' : this.fps >= 45 ? '⚠️' : '❌';
        const color = this.fps >= 58 ? '#00ff00' : this.fps >= 45 ? '#ffff00' : '#ff0000';
        
        this.monitor.style.color = color;
        this.monitor.innerHTML = `
            ${status} FPS: ${this.fps} (Avg: ${avgFps})<br>
            🎭 Particles: ${particleCount}<br>
            🎯 Target: 60fps
        `;
    }
    
    /**
     * Validate z-index layering
     */
    validateLayering() {
        const layers = [
            { selector: 'body::before', expected: -2, name: 'Background' },
            { selector: 'body::after', expected: -1, name: 'Grid' },
            { selector: '#nocturne-particle-system', expected: -1, name: 'Particles' },
            { selector: '.swap-container', expected: 10, name: 'Swap Container' },
            { selector: '.app-container', expected: 1, name: 'App Container' }
        ];
        
        console.group('🔍 Z-Index Layer Validation');
        
        layers.forEach(layer => {
            const element = document.querySelector(layer.selector.split('::')[0]);
            if (element) {
                const computedStyle = window.getComputedStyle(element);
                const zIndex = parseInt(computedStyle.zIndex) || 0;
                const status = zIndex === layer.expected ? '✅' : '⚠️';
                console.log(`${status} ${layer.name}: z-index ${zIndex} (expected: ${layer.expected})`);
            }
        });
        
        console.groupEnd();
    }
    
    /**
     * Run comprehensive performance test
     */
    runPerformanceTest() {
        console.group('🚀 Nocturne Performance Test');
        
        this.startMonitoring();
        
        // Test for 10 seconds
        setTimeout(() => {
            this.stopMonitoring();
            this.generatePerformanceReport();
        }, 10000);
        
        console.log('⏱️ Running 10-second performance test...');
    }
    
    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        const avgFps = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
        const minFps = Math.min(...this.fpsHistory);
        const maxFps = Math.max(...this.fpsHistory);
        
        const report = {
            averageFPS: avgFps,
            minimumFPS: minFps,
            maximumFPS: maxFps,
            target: 60,
            performance: avgFps >= 58 ? 'Excellent' : avgFps >= 45 ? 'Good' : 'Needs Optimization',
            particleCount: window.nocturneParticleSystem ? 
                window.nocturneParticleSystem.particles.length : 0
        };
        
        console.group('📊 Performance Report');
        console.log('🎯 Target FPS:', report.target);
        console.log('📈 Average FPS:', report.averageFPS);
        console.log('📉 Minimum FPS:', report.minimumFPS);
        console.log('📊 Maximum FPS:', report.maximumFPS);
        console.log('🎭 Particle Count:', report.particleCount);
        console.log('⭐ Performance Rating:', report.performance);
        console.groupEnd();
        
        console.groupEnd();
        
        return report;
    }
}

// Initialize performance validator
const nocturneValidator = new NocturnePerformanceValidator();

// Expose global functions for debugging
window.nocturneValidator = nocturneValidator;
window.validateNocturnePerformance = () => nocturneValidator.runPerformanceTest();
window.toggleNocturneMonitor = () => {
    if (nocturneValidator.isMonitoring) {
        nocturneValidator.stopMonitoring();
    } else {
        nocturneValidator.startMonitoring();
    }
};

console.log('🔧 Nocturne Performance Tools available:');
console.log('  - window.validateNocturnePerformance() - Run 10s performance test');
console.log('  - window.toggleNocturneMonitor() - Toggle real-time FPS monitor');

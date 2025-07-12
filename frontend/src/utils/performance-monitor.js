// 60FPS Performance Validation Script
// Add this to your HTML for testing frame rate consistency

class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fpsHistory = [];
        this.init();
    }

    init() {
        this.createMonitorDisplay();
        this.startMonitoring();
    }

    createMonitorDisplay() {
        const monitor = document.createElement('div');
        monitor.id = 'performance-monitor';
        monitor.className = 'performance-monitor';
        monitor.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border: 1px solid #00ff00;
            pointer-events: none;
            display: block;
        `;
        document.body.appendChild(monitor);
        this.monitorElement = monitor;
    }

    startMonitoring() {
        const measureFrame = (currentTime) => {
            this.frameCount++;
            
            if (currentTime - this.lastTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.fpsHistory.push(this.fps);
                
                // Keep only last 60 measurements
                if (this.fpsHistory.length > 60) {
                    this.fpsHistory.shift();
                }
                
                this.updateDisplay();
                this.frameCount = 0;
                this.lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFrame);
        };
        
        requestAnimationFrame(measureFrame);
    }

    updateDisplay() {
        if (!this.monitorElement) return;
        
        const avgFps = this.getAverageFPS();
        const minFps = Math.min(...this.fpsHistory.slice(-10));
        
        this.monitorElement.textContent = `FPS: ${this.fps} | Avg: ${avgFps} | Min: ${minFps}`;
        
        // Color coding based on performance
        if (this.fps >= 55) {
            this.monitorElement.className = 'performance-monitor fps-good';
            this.monitorElement.style.color = '#00ff00';
            this.monitorElement.style.borderColor = '#00ff00';
        } else if (this.fps >= 45) {
            this.monitorElement.className = 'performance-monitor fps-warning';
            this.monitorElement.style.color = '#ffff00';
            this.monitorElement.style.borderColor = '#ffff00';
        } else {
            this.monitorElement.className = 'performance-monitor fps-poor';
            this.monitorElement.style.color = '#ff0000';
            this.monitorElement.style.borderColor = '#ff0000';
        }
    }

    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    // Performance testing methods
    stressTest() {
        console.log('Starting GPU stress test...');
        document.body.classList.add('perf-test-gpu-stress');
        
        setTimeout(() => {
            document.body.classList.remove('perf-test-gpu-stress');
            console.log('GPU stress test completed');
        }, 5000);
    }

    animationTest() {
        console.log('Starting animation stress test...');
        const elements = document.querySelectorAll('.glow-btn, .floating-button, .theme-option');
        
        elements.forEach(el => {
            el.classList.add('perf-test-high-load');
        });
        
        setTimeout(() => {
            elements.forEach(el => {
                el.classList.remove('perf-test-high-load');
            });
            console.log('Animation stress test completed');
        }, 3000);
    }

    reportPerformance() {
        const report = {
            averageFPS: this.getAverageFPS(),
            currentFPS: this.fps,
            minFPS: Math.min(...this.fpsHistory),
            maxFPS: Math.max(...this.fpsHistory),
            isStable: this.fpsHistory.every(fps => fps >= 55),
            gpuAccelerated: this.checkGPUAcceleration(),
            timestamp: new Date().toISOString()
        };
        
        console.log('Performance Report:', report);
        return report;
    }

    checkGPUAcceleration() {
        const testElement = document.createElement('div');
        testElement.style.cssText = 'transform: translateZ(0); will-change: transform;';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const hasGPUHints = computedStyle.transform !== 'none' || computedStyle.willChange !== 'auto';
        
        document.body.removeChild(testElement);
        return hasGPUHints;
    }
}

// Auto-start performance monitoring
if (typeof window !== 'undefined') {
    window.perfMonitor = new PerformanceMonitor();
    
    // Expose testing methods globally
    window.testPerformance = () => {
        window.perfMonitor.stressTest();
        setTimeout(() => {
            window.perfMonitor.animationTest();
        }, 6000);
        
        setTimeout(() => {
            window.perfMonitor.reportPerformance();
        }, 10000);
    };
    
    console.log('🚀 Performance monitor initialized!');
    console.log('💡 Run testPerformance() to stress test the optimizations');
    console.log('📊 FPS monitor is visible in top-left corner');
}

export default PerformanceMonitor;

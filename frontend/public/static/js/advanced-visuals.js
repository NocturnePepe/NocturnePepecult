/**
 * Advanced Visual Effects for NocturneSwap
 * Particle System, Cursor Trails, Ripple Effects, Matrix Background
 */

class NocturneVisuals {
    constructor() {
        this.particles = [];
        this.trailPoints = [];
        this.ripples = [];
        this.canvas = null;
        this.ctx = null;
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createCanvas();
        this.bindEvents();
        this.createParticles();
        this.startAnimation();
        this.initMatrixBackground();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'nocturne-visuals';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.8';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => this.updateMouse(e));
        window.addEventListener('click', (e) => this.createRipple(e.clientX, e.clientY));
        
        // Touch events for mobile
        window.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.updateMouse({ clientX: touch.clientX, clientY: touch.clientY });
        });
        
        window.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.createRipple(touch.clientX, touch.clientY);
        });
    }

    updateMouse(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.addTrailPoint();
    }

    createParticles() {
        const particleCount = window.innerWidth < 768 ? 50 : 100;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.8 + 0.2,
                color: this.getRandomColor(),
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(139, 69, 19, ',   // Dark orange
            'rgba(255, 140, 0, ',   // Dark orange
            'rgba(128, 0, 128, ',   // Purple
            'rgba(75, 0, 130, ',    // Indigo
            'rgba(25, 25, 112, ',   // Midnight blue
            'rgba(199, 21, 133, '   // Medium violet red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    addTrailPoint() {
        this.trailPoints.push({
            x: this.mouse.x,
            y: this.mouse.y,
            opacity: 1,
            size: 3
        });

        if (this.trailPoints.length > 20) {
            this.trailPoints.shift();
        }
    }

    createRipple(x, y) {
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 150,
            opacity: 1,
            speed: 3
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.pulse += 0.02;

            // Bounce off edges
            if (particle.x <= 0 || particle.x >= this.canvas.width) particle.vx *= -1;
            if (particle.y <= 0 || particle.y >= this.canvas.height) particle.vy *= -1;

            // Mouse attraction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 1000;
                particle.vx += dx * force;
                particle.vy += dy * force;
            }

            // Apply friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    updateTrail() {
        this.trailPoints.forEach((point, index) => {
            point.opacity -= 0.05;
            point.size *= 0.95;
        });

        this.trailPoints = this.trailPoints.filter(point => point.opacity > 0);
    }

    updateRipples() {
        this.ripples.forEach(ripple => {
            ripple.radius += ripple.speed;
            ripple.opacity = 1 - (ripple.radius / ripple.maxRadius);
        });

        this.ripples = this.ripples.filter(ripple => ripple.radius < ripple.maxRadius);
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const pulseFactor = 1 + Math.sin(particle.pulse) * 0.3;
            const currentSize = particle.size * pulseFactor;
            const currentOpacity = particle.opacity * (0.5 + Math.sin(particle.pulse) * 0.3);

            this.ctx.save();
            this.ctx.globalAlpha = currentOpacity;
            
            // Create glow effect
            this.ctx.shadowColor = particle.color + '1)';
            this.ctx.shadowBlur = 10;
            
            this.ctx.fillStyle = particle.color + currentOpacity + ')';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    drawTrail() {
        this.trailPoints.forEach((point, index) => {
            this.ctx.save();
            this.ctx.globalAlpha = point.opacity;
            this.ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
            this.ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawRipples() {
        this.ripples.forEach(ripple => {
            this.ctx.save();
            this.ctx.globalAlpha = ripple.opacity;
            this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.updateTrail();
        this.updateRipples();
        
        this.drawParticles();
        this.drawTrail();
        this.drawRipples();
        
        requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        this.animate();
    }

    initMatrixBackground() {
        // Create matrix rain effect
        const matrixCanvas = document.createElement('canvas');
        matrixCanvas.id = 'matrix-background';
        matrixCanvas.style.position = 'fixed';
        matrixCanvas.style.top = '0';
        matrixCanvas.style.left = '0';
        matrixCanvas.style.width = '100%';
        matrixCanvas.style.height = '100%';
        matrixCanvas.style.pointerEvents = 'none';
        matrixCanvas.style.zIndex = '0';
        matrixCanvas.style.opacity = '0.1';
        document.body.insertBefore(matrixCanvas, document.body.firstChild);

        const matrixCtx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const columns = Math.floor(matrixCanvas.width / 20);
        const drops = new Array(columns).fill(1);

        const drawMatrix = () => {
            matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            matrixCtx.fillStyle = 'rgba(139, 69, 19, 0.8)';
            matrixCtx.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = String.fromCharCode(Math.random() * 128);
                matrixCtx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        setInterval(drawMatrix, 35);

        window.addEventListener('resize', () => {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new NocturneVisuals();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NocturneVisuals;
}

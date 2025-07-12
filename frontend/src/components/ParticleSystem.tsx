/* ===== PHASE 2: GAMING-TIER VISUAL EFFECTS SYSTEM ===== */
/* Advanced Particle Systems & Dynamic Theme Management */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './ParticleSystem.css';

interface ParticleSystemProps {
  theme?: 'cult' | 'mystical' | 'neon' | 'ethereal';
  intensity?: 'low' | 'medium' | 'high' | 'ultra';
  interactive?: boolean;
  performanceMode?: 'auto' | 'high' | 'balanced' | 'low';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'sparkle' | 'glow' | 'rune' | 'energy';
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  theme = 'cult',
  intensity = 'medium',
  interactive = true,
  performanceMode = 'auto'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });
  const lastFrameTime = useRef(0);
  const [isPerformant, setIsPerformant] = useState(true);
  const [particleCount, setParticleCount] = useState(0);

  // Performance monitoring
  const frameRates = useRef<number[]>([]);
  const performanceCheck = useCallback(() => {
    const avgFps = frameRates.current.reduce((a, b) => a + b, 0) / frameRates.current.length;
    
    if (performanceMode === 'auto') {
      if (avgFps < 50 && intensity !== 'low') {
        setIsPerformant(false);
        console.log('🎯 Auto-reducing particle intensity for 60fps lock');
      } else if (avgFps > 58 && !isPerformant) {
        setIsPerformant(true);
        console.log('🚀 Restoring full particle intensity');
      }
    }
  }, [intensity, performanceMode, isPerformant]);

  // Theme-based particle configurations
  const themeConfig = useMemo(() => {
    const configs = {
      cult: {
        colors: ['#9c88ff', '#7c4dff', '#b39ddb', '#e1bee7'],
        particleTypes: ['sparkle', 'glow', 'rune'] as const,
        glowIntensity: 0.8,
        speed: 1.2
      },
      mystical: {
        colors: ['#4fc3f7', '#29b6f6', '#81c784', '#aed581'],
        particleTypes: ['sparkle', 'energy'] as const,
        glowIntensity: 1.0,
        speed: 1.5
      },
      neon: {
        colors: ['#ff4081', '#e91e63', '#ff6ec7', '#f48fb1'],
        particleTypes: ['glow', 'energy'] as const,
        glowIntensity: 1.2,
        speed: 2.0
      },
      ethereal: {
        colors: ['#ffffff', '#f5f5f5', '#e8eaf6', '#c5cae9'],
        particleTypes: ['sparkle', 'glow'] as const,
        glowIntensity: 0.6,
        speed: 0.8
      }
    };
    return configs[theme];
  }, [theme]);

  // Intensity-based particle limits
  const intensityConfig = useMemo(() => {
    const baseCount = isPerformant ? 1 : 0.5;
    const configs = {
      low: Math.floor(20 * baseCount),
      medium: Math.floor(50 * baseCount),
      high: Math.floor(100 * baseCount),
      ultra: Math.floor(200 * baseCount)
    };
    return configs[intensity];
  }, [intensity, isPerformant]);

  // Create particle with theme-appropriate properties
  const createParticle = useCallback((x?: number, y?: number): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Particle;

    const config = themeConfig;
    const particleType = config.particleTypes[Math.floor(Math.random() * config.particleTypes.length)];
    
    return {
      id: Math.random(),
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      life: 0,
      maxLife: Math.random() * 300 + 200,
      type: particleType
    };
  }, [themeConfig]);

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const count = intensityConfig;
    particlesRef.current = Array.from({ length: count }, () => createParticle());
    setParticleCount(count);
  }, [intensityConfig, createParticle]);

  // Update particle physics
  const updateParticle = useCallback((particle: Particle, deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return particle;

    // Update position
    particle.x += particle.vx * deltaTime * 0.01;
    particle.y += particle.vy * deltaTime * 0.01;

    // Update life
    particle.life += deltaTime;
    particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));

    // Interactive mouse attraction
    if (interactive && mouseRef.current.isActive) {
      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100 * 0.5;
        particle.vx += (dx / distance) * force * deltaTime * 0.001;
        particle.vy += (dy / distance) * force * deltaTime * 0.001;
      }
    }

    // Boundary wrapping
    if (particle.x < 0) particle.x = canvas.width;
    if (particle.x > canvas.width) particle.x = 0;
    if (particle.y < 0) particle.y = canvas.height;
    if (particle.y > canvas.height) particle.y = 0;

    return particle;
  }, [interactive]);

  // Render particle with type-specific effects
  const renderParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity;

    switch (particle.type) {
      case 'sparkle':
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        break;
        
      case 'glow':
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(
          particle.x - particle.size * 2, 
          particle.y - particle.size * 2, 
          particle.size * 4, 
          particle.size * 4
        );
        break;
        
      case 'rune':
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'energy':
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }, []);

  // Main animation loop with 60fps optimization
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Calculate delta time and FPS
    const deltaTime = timestamp - lastFrameTime.current;
    lastFrameTime.current = timestamp;
    
    const fps = 1000 / deltaTime;
    frameRates.current.push(fps);
    if (frameRates.current.length > 60) frameRates.current.shift();

    // Clear canvas with slight trail effect for smooth motion
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and render particles
    particlesRef.current = particlesRef.current
      .map(particle => updateParticle(particle, deltaTime))
      .filter(particle => particle.life < particle.maxLife);

    // Maintain particle count
    while (particlesRef.current.length < intensityConfig && isPerformant) {
      particlesRef.current.push(createParticle());
    }

    // Render all particles
    particlesRef.current.forEach(particle => renderParticle(ctx, particle));

    // Performance monitoring every 60 frames
    if (frameRates.current.length === 60) {
      performanceCheck();
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticle, renderParticle, intensityConfig, isPerformant, createParticle, performanceCheck]);

  // Mouse interaction handlers
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      isActive: true
    };
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.isActive = false;
  }, []);

  // Canvas resize handler
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }, []);

  // Initialize and cleanup
  useEffect(() => {
    resizeCanvas();
    initializeParticles();
    
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    
    if (interactive) {
      const canvas = canvasRef.current;
      canvas?.addEventListener('mousemove', handleMouseMove);
      canvas?.addEventListener('mouseleave', handleMouseLeave);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      const canvas = canvasRef.current;
      canvas?.removeEventListener('mousemove', handleMouseMove);
      canvas?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [animate, initializeParticles, resizeCanvas, handleMouseMove, handleMouseLeave, interactive]);

  // Re-initialize when theme or intensity changes
  useEffect(() => {
    initializeParticles();
  }, [theme, intensity, initializeParticles]);

  return (
    <div className={`particle-system theme-${theme} intensity-${intensity}`}>
      <canvas 
        ref={canvasRef}
        className="particle-canvas"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: interactive ? 'auto' : 'none',
          zIndex: 1
        }}
      />
      
      {/* Performance indicator */}
      <div className="particle-debug" style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        color: 'white', 
        fontSize: '12px',
        opacity: 0.7,
        zIndex: 10,
        display: process.env.NODE_ENV === 'development' ? 'block' : 'none'
      }}>
        Particles: {particleCount} | FPS: {Math.round(frameRates.current[frameRates.current.length - 1] || 0)}
      </div>
    </div>
  );
};

export default ParticleSystem;

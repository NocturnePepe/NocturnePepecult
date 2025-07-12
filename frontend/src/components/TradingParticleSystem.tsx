import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TradingParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'profit' | 'loss' | 'order' | 'alert';
}

interface TradingParticleSystemProps {
  enabled?: boolean;
  intensity?: number;
  onTradingEvent?: (event: {
    type: 'profit' | 'loss' | 'order' | 'alert';
    value?: number;
    position?: { x: number; y: number };
  }) => void;
}

export const TradingParticleSystem: React.FC<TradingParticleSystemProps> = ({
  enabled = true,
  intensity = 1,
  onTradingEvent
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<TradingParticle[]>([]);
  const [, forceUpdate] = useState({});

  const createParticle = useCallback((
    x: number, 
    y: number, 
    type: TradingParticle['type'], 
    value?: number
  ): TradingParticle => {
    const particle: TradingParticle = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 0,
      maxLife: 60 + Math.random() * 60,
      size: type === 'profit' || type === 'loss' ? 
        Math.max(3, Math.min(12, (value || 0) / 100)) : 
        4 + Math.random() * 4,
      color: getParticleColor(type, value),
      type
    };

    return particle;
  }, []);

  const getParticleColor = (type: TradingParticle['type'], value?: number): string => {
    switch (type) {
      case 'profit':
        const profitIntensity = Math.min(1, (value || 0) / 1000);
        return `rgba(0, 255, 136, ${0.6 + profitIntensity * 0.4})`;
      case 'loss':
        const lossIntensity = Math.min(1, Math.abs(value || 0) / 1000);
        return `rgba(255, 68, 68, ${0.6 + lossIntensity * 0.4})`;
      case 'order':
        return 'rgba(138, 43, 226, 0.8)';
      case 'alert':
        return 'rgba(255, 215, 0, 0.8)';
      default:
        return 'rgba(255, 255, 255, 0.6)';
    }
  };

  const spawnParticles = useCallback((
    x: number, 
    y: number, 
    type: TradingParticle['type'], 
    count: number = 5,
    value?: number
  ) => {
    if (!enabled) return;

    for (let i = 0; i < count * intensity; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      const particle = createParticle(x + offsetX, y + offsetY, type, value);
      particlesRef.current.push(particle);
    }

    // Limit particle count for performance
    if (particlesRef.current.length > 200) {
      particlesRef.current = particlesRef.current.slice(-150);
    }
  }, [enabled, intensity, createParticle]);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.life++;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity

      const alpha = 1 - (particle.life / particle.maxLife);
      
      if (alpha <= 0) return false;

      // Draw particle
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add trail effect for profit/loss particles
      if (particle.type === 'profit' || particle.type === 'loss') {
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(particle.x - particle.vx, particle.y - particle.vy, particle.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();

      return true;
    });

    // Continue animation
    if (enabled) {
      animationRef.current = requestAnimationFrame(updateParticles);
    }
  }, [enabled]);

  const handleCanvasResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  // Handle trading events from props
  useEffect(() => {
    if (onTradingEvent) {
      const handleEvent = (event: Parameters<NonNullable<typeof onTradingEvent>>[0]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.position?.x || rect.width / 2;
        const y = event.position?.y || rect.height / 2;

        let particleCount = 5;
        if (event.type === 'profit' && event.value && event.value > 100) {
          particleCount = Math.min(20, Math.floor(event.value / 50));
        } else if (event.type === 'loss' && event.value && Math.abs(event.value) > 100) {
          particleCount = Math.min(20, Math.floor(Math.abs(event.value) / 50));
        }

        spawnParticles(x, y, event.type, particleCount, event.value);
      };

      // This would be called from the trading context when events occur
      return () => {};
    }
  }, [onTradingEvent, spawnParticles]);

  // Setup canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    handleCanvasResize();
    window.addEventListener('resize', handleCanvasResize);

    if (enabled) {
      updateParticles();
    }

    return () => {
      window.removeEventListener('resize', handleCanvasResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, handleCanvasResize, updateParticles]);

  // Auto-spawn ambient particles for demo
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      
      // Randomly spawn different types of particles
      const types: TradingParticle['type'][] = ['profit', 'loss', 'order', 'alert'];
      const type = types[Math.floor(Math.random() * types.length)];
      const value = type === 'profit' || type === 'loss' ? 
        Math.random() * 500 + 50 : undefined;
      
      spawnParticles(x, y, type, 1, value);
    }, 2000 + Math.random() * 3000); // Every 2-5 seconds

    return () => clearInterval(interval);
  }, [enabled, spawnParticles]);

  // Expose particle spawn method for external use
  useEffect(() => {
    const globalSpawn = (event: CustomEvent) => {
      const { x, y, type, value } = event.detail;
      spawnParticles(x, y, type, 8, value);
    };

    window.addEventListener('tradingParticleSpawn', globalSpawn as EventListener);
    return () => window.removeEventListener('tradingParticleSpawn', globalSpawn as EventListener);
  }, [spawnParticles]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
      className="trading-particle-canvas"
    />
  );
};

// Utility function to trigger particles from anywhere in the app
export const triggerTradingParticles = (
  x: number, 
  y: number, 
  type: 'profit' | 'loss' | 'order' | 'alert', 
  value?: number
) => {
  const event = new CustomEvent('tradingParticleSpawn', {
    detail: { x, y, type, value }
  });
  window.dispatchEvent(event);
};

export default TradingParticleSystem;

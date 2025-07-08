// PriceChart.tsx - Lightweight price chart using Canvas API (no heavy deps)
import React, { useRef, useEffect, useState, useCallback } from 'react';
import './PriceChart.css';

interface PricePoint {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  tokenSymbol: string;
  currentPrice: number;
  change24h: number;
  height?: number;
  timeframe?: '1h' | '24h' | '7d' | '30d';
  onTimeframeChange?: (timeframe: '1h' | '24h' | '7d' | '30d') => void;
}

// Mock price data generator for demonstration (in production, fetch from API)
const generateMockPriceData = (currentPrice: number, change24h: number, timeframe: string): PricePoint[] => {
  const points = timeframe === '1h' ? 60 : timeframe === '24h' ? 144 : timeframe === '7d' ? 168 : 720;
  const data: PricePoint[] = [];
  const now = Date.now();
  const interval = timeframe === '1h' ? 60000 : timeframe === '24h' ? 600000 : timeframe === '7d' ? 3600000 : 3600000;
  
  const startPrice = currentPrice / (1 + change24h / 100);
  const volatility = Math.abs(change24h) / 100 * 0.3; // Scaled volatility
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const trend = startPrice + (currentPrice - startPrice) * progress;
    const noise = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const price = Math.max(0.0001, trend + noise);
    
    data.push({
      timestamp: now - (points - 1 - i) * interval,
      price
    });
  }
  
  return data;
};

const PriceChart = ({
  tokenSymbol,
  currentPrice,
  change24h,
  height = 200,
  timeframe = '24h',
  onTimeframeChange
}: PriceChartProps) => {
  const canvasRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [priceData, setPriceData] = useState([]);

  // Generate price data when props change
  useEffect(() => {
    const data = generateMockPriceData(currentPrice, change24h, timeframe);
    setPriceData(data);
  }, [currentPrice, change24h, timeframe]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: canvasHeight } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Calculate price range
    const prices = priceData.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    bgGradient.addColorStop(0, 'rgba(138, 43, 226, 0.1)');
    bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, canvasHeight);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Horizontal grid lines
    for (let i = 1; i < 4; i++) {
      const y = (canvasHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 1; i < 4; i++) {
      const x = (width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);

    // Draw price line
    if (priceData.length > 1) {
      // Create line gradient
      const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
      const isPositive = change24h >= 0;
      
      if (isPositive) {
        lineGradient.addColorStop(0, '#ff4500');
        lineGradient.addColorStop(0.5, '#00ff88');
        lineGradient.addColorStop(1, '#8a2be2');
      } else {
        lineGradient.addColorStop(0, '#8a2be2');
        lineGradient.addColorStop(0.5, '#ff6b6b');
        lineGradient.addColorStop(1, '#ff4500');
      }

      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = isPositive ? '#00ff88' : '#ff6b6b';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      
      priceData.forEach((point, index) => {
        const x = (index / (priceData.length - 1)) * width;
        const y = canvasHeight - ((point.price - minPrice + padding) / (priceRange + 2 * padding)) * canvasHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Fill area under curve
      const fillGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      if (isPositive) {
        fillGradient.addColorStop(0, 'rgba(0, 255, 136, 0.2)');
        fillGradient.addColorStop(1, 'rgba(0, 255, 136, 0.05)');
      } else {
        fillGradient.addColorStop(0, 'rgba(255, 107, 107, 0.2)');
        fillGradient.addColorStop(1, 'rgba(255, 107, 107, 0.05)');
      }
      
      ctx.fillStyle = fillGradient;
      ctx.lineTo(width, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.closePath();
      ctx.fill();
    }
  }, [priceData, change24h]);

  // Handle mouse events for hover
  const handleMouseMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas || priceData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = x / canvas.width;
    const dataIndex = Math.round(ratio * (priceData.length - 1));
    
    if (dataIndex >= 0 && dataIndex < priceData.length) {
      const point = priceData[dataIndex];
      const time = new Date(point.timestamp).toLocaleTimeString();
      
      setHoverPoint({
        x: event.clientX,
        y: event.clientY,
        price: point.price,
        time
      });
    }
  }, [priceData]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setHoverPoint(null);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  // Redraw when data changes
  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = height + 'px';
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      drawChart();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [height, drawChart]);

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  return (
    <div className="price-chart-container">
      <div className="chart-header">
        <div className="chart-title">
          <span className="token-symbol">{tokenSymbol}</span>
          <span className="current-price">{formatPrice(currentPrice)}</span>
          <span className={`price-change ${change24h >= 0 ? 'positive' : 'negative'}`}>
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </span>
        </div>
        
        <div className="timeframe-selector">
          {(['1h', '24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => onTimeframeChange?.(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chart-canvas-container">
        <canvas
          ref={canvasRef}
          className="price-chart-canvas"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        
        {isHovering && hoverPoint && (
          <div 
            className="chart-tooltip"
            style={{
              left: hoverPoint.x,
              top: hoverPoint.y - 60
            }}
          >
            <div className="tooltip-price">{formatPrice(hoverPoint.price)}</div>
            <div className="tooltip-time">{hoverPoint.time}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChart;

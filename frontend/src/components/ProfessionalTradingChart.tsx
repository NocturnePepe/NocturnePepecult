import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicator {
  name: string;
  values: number[];
  color: string;
  visible: boolean;
}

interface ChartProps {
  symbol: string;
  data: CandlestickData[];
  indicators?: TechnicalIndicator[];
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
  theme?: 'dark' | 'light';
  onPriceClick?: (price: number, timestamp: number) => void;
}

export const ProfessionalTradingChart: React.FC<ChartProps> = ({
  symbol,
  data,
  indicators = [],
  height = 400,
  showVolume = true,
  showGrid = true,
  theme = 'dark',
  onPriceClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const colors = {
    dark: {
      background: 'rgba(0, 0, 0, 0.9)',
      grid: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: '#888888',
      bullish: '#00ff88',
      bearish: '#ff4444',
      volume: 'rgba(138, 43, 226, 0.3)',
      crosshair: 'rgba(255, 255, 255, 0.8)'
    },
    light: {
      background: 'rgba(255, 255, 255, 0.9)',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#000000',
      textSecondary: '#666666',
      bullish: '#00aa55',
      bearish: '#cc3333',
      volume: 'rgba(138, 43, 226, 0.2)',
      crosshair: 'rgba(0, 0, 0, 0.8)'
    }
  };

  const currentColors = colors[theme];

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height });
    }
  }, [height]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid) return;

    ctx.strokeStyle = currentColors.grid;
    ctx.lineWidth = 1;

    // Vertical grid lines
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
      const x = (width / verticalLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const horizontalLines = 8;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (height / horizontalLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [showGrid, currentColors.grid]);

  const drawCandlesticks = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    chartHeight: number
  ) => {
    if (data.length === 0) return;

    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const candleWidth = Math.max(2, width / data.length - 2);

    data.forEach((candle, index) => {
      const x = (width / data.length) * index + candleWidth / 2;
      const openY = chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
      const closeY = chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
      const highY = chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
      const lowY = chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;

      const isBullish = candle.close > candle.open;
      ctx.strokeStyle = isBullish ? currentColors.bullish : currentColors.bearish;
      ctx.fillStyle = isBullish ? currentColors.bullish : currentColors.bearish;
      ctx.lineWidth = 1;

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      
      if (isBullish) {
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }

      // Highlight hovered candle
      if (hoveredCandle === candle) {
        ctx.strokeStyle = currentColors.crosshair;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - candleWidth / 2 - 1, bodyTop - 1, candleWidth + 2, bodyHeight + 2);
      }
    });
  }, [data, hoveredCandle, currentColors]);

  const drawIndicators = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    chartHeight: number
  ) => {
    if (data.length === 0) return;

    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    const priceRange = maxPrice - minPrice;

    indicators.forEach(indicator => {
      if (!indicator.visible || indicator.values.length === 0) return;

      ctx.strokeStyle = indicator.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      indicator.values.forEach((value, index) => {
        if (value === null || value === undefined) return;

        const x = (width / data.length) * index + (width / data.length) / 2;
        const y = chartHeight - ((value - minPrice) / priceRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });
  }, [data, indicators]);

  const drawVolume = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    volumeHeight: number,
    yOffset: number
  ) => {
    if (!showVolume || data.length === 0) return;

    const maxVolume = Math.max(...data.map(d => d.volume));
    const candleWidth = Math.max(2, width / data.length - 2);

    data.forEach((candle, index) => {
      const x = (width / data.length) * index;
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
      const y = yOffset + volumeHeight - volumeBarHeight;

      ctx.fillStyle = candle.close > candle.open ? 
        currentColors.bullish + '80' : 
        currentColors.bearish + '80';
      
      ctx.fillRect(x + 1, y, candleWidth, volumeBarHeight);
    });
  }, [data, showVolume, currentColors]);

  const drawCrosshair = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ) => {
    if (mousePos.x === 0 && mousePos.y === 0) return;

    ctx.strokeStyle = currentColors.crosshair;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(mousePos.x, 0);
    ctx.lineTo(mousePos.x, height);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, mousePos.y);
    ctx.lineTo(width, mousePos.y);
    ctx.stroke();

    ctx.setLineDash([]);
  }, [mousePos, currentColors.crosshair]);

  const drawPriceScale = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    chartHeight: number
  ) => {
    if (data.length === 0) return;

    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const steps = 8;

    ctx.fillStyle = currentColors.text;
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= steps; i++) {
      const price = minPrice + (priceRange / steps) * i;
      const y = chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      
      ctx.fillText(price.toFixed(4), width - 80, y + 4);
    }
  }, [data, currentColors.text]);

  const drawTimeScale = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number
  ) => {
    if (data.length === 0) return;

    ctx.fillStyle = currentColors.textSecondary;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    const step = Math.max(1, Math.floor(data.length / 8));
    
    for (let i = 0; i < data.length; i += step) {
      const x = (width / data.length) * i + (width / data.length) / 2;
      const date = new Date(data[i].timestamp);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      ctx.fillText(timeStr, x, height - 10);
    }
  }, [data, currentColors.textSecondary]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePos({ x, y });

    // Find hovered candle
    const candleIndex = Math.floor((x / dimensions.width) * data.length);
    if (candleIndex >= 0 && candleIndex < data.length) {
      setHoveredCandle(data[candleIndex]);
    } else {
      setHoveredCandle(null);
    }
  }, [data, dimensions.width]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPriceClick || !hoveredCandle) return;
    
    onPriceClick(hoveredCandle.close, hoveredCandle.timestamp);
  }, [onPriceClick, hoveredCandle]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width * window.devicePixelRatio;
    canvas.height = dimensions.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = currentColors.background;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const volumeHeight = showVolume ? dimensions.height * 0.2 : 0;
    const chartHeight = dimensions.height - volumeHeight - 40; // 40px for time scale

    // Draw components
    drawGrid(ctx, dimensions.width, chartHeight);
    drawCandlesticks(ctx, dimensions.width, chartHeight, chartHeight);
    drawIndicators(ctx, dimensions.width, chartHeight);
    
    if (showVolume) {
      drawVolume(ctx, dimensions.width, volumeHeight, chartHeight + 20);
    }
    
    drawCrosshair(ctx, dimensions.width, dimensions.height);
    drawPriceScale(ctx, dimensions.width, chartHeight);
    drawTimeScale(ctx, dimensions.width, dimensions.height);

  }, [
    dimensions, 
    data, 
    indicators, 
    showVolume, 
    hoveredCandle, 
    mousePos,
    currentColors,
    drawGrid,
    drawCandlesticks,
    drawIndicators,
    drawVolume,
    drawCrosshair,
    drawPriceScale,
    drawTimeScale
  ]);

  return (
    <div ref={containerRef} className="professional-trading-chart relative w-full">
      <div className="chart-header flex justify-between items-center mb-2 px-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white">{symbol}</h3>
          {hoveredCandle && (
            <div className="flex gap-4 text-sm font-mono">
              <span className="text-gray-300">O: {hoveredCandle.open.toFixed(4)}</span>
              <span className="text-gray-300">H: {hoveredCandle.high.toFixed(4)}</span>
              <span className="text-gray-300">L: {hoveredCandle.low.toFixed(4)}</span>
              <span className={hoveredCandle.close > hoveredCandle.open ? 'text-green-400' : 'text-red-400'}>
                C: {hoveredCandle.close.toFixed(4)}
              </span>
              <span className="text-purple-400">V: {hoveredCandle.volume.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {indicators.map((indicator, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: indicator.color }}
              />
              <span className="text-gray-300">{indicator.name}</span>
            </div>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="cursor-crosshair"
        style={{
          width: dimensions.width,
          height: dimensions.height
        }}
      />

      <style jsx>{`
        .professional-trading-chart {
          background: ${currentColors.background};
          border-radius: 16px;
          padding: 1rem;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

// Utility function to generate sample candlestick data
export const generateSampleCandlestickData = (
  symbol: string, 
  count: number = 100,
  basePrice: number = 100
): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let currentPrice = basePrice;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * 60000; // 1 minute intervals
    
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;
    const volume = Math.random() * 1000000 + 100000;

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  return data;
};

export default ProfessionalTradingChart;

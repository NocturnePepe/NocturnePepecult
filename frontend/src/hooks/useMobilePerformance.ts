import { useEffect, useState, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  networkSpeed: 'fast' | 'slow' | 'offline';
  batteryLevel?: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: string;
  isLowPowerMode: boolean;
}

interface MobilePerformanceOptions {
  enableFPSMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  enableBatteryMonitoring?: boolean;
  onPerformanceChange?: (metrics: PerformanceMetrics) => void;
  fpsThreshold?: number;
  memoryThreshold?: number;
}

export const useMobilePerformance = (options: MobilePerformanceOptions = {}) => {
  const {
    enableFPSMonitoring = true,
    enableMemoryMonitoring = true,
    enableNetworkMonitoring = true,
    enableBatteryMonitoring = true,
    onPerformanceChange,
    fpsThreshold = 30,
    memoryThreshold = 50
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    networkSpeed: 'fast',
    batteryLevel: 100,
    deviceType: 'desktop',
    connectionType: 'unknown',
    isLowPowerMode: false
  });

  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();

  // Detect device type
  const getDeviceType = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return width < 768 ? 'mobile' : 'tablet';
    }
    
    return width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
  }, []);

  // FPS Monitoring
  const measureFPS = useCallback(() => {
    if (!enableFPSMonitoring) return;

    const now = performance.now();
    frameCountRef.current++;

    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift();
      }

      const averageFPS = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
      
      setMetrics(prev => ({ ...prev, fps: Math.round(averageFPS) }));
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(measureFPS);
  }, [enableFPSMonitoring]);

  // Memory Monitoring
  const measureMemory = useCallback(() => {
    if (!enableMemoryMonitoring || !('memory' in performance)) return 0;

    const memory = (performance as any).memory;
    if (memory) {
      const memoryUsage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
      setMetrics(prev => ({ ...prev, memoryUsage }));
      return memoryUsage;
    }
    return 0;
  }, [enableMemoryMonitoring]);

  // Network Speed Detection
  const detectNetworkSpeed = useCallback(() => {
    if (!enableNetworkMonitoring) return;

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      
      let networkSpeed: 'fast' | 'slow' | 'offline' = 'fast';
      
      if (!navigator.onLine) {
        networkSpeed = 'offline';
      } else if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1.5) {
        networkSpeed = 'slow';
      } else {
        networkSpeed = 'fast';
      }

      setMetrics(prev => ({ 
        ...prev, 
        networkSpeed,
        connectionType: effectiveType || 'unknown'
      }));
    }
  }, [enableNetworkMonitoring]);

  // Battery Monitoring
  const monitorBattery = useCallback(async () => {
    if (!enableBatteryMonitoring || !('getBattery' in navigator)) return;

    try {
      const battery = await (navigator as any).getBattery();
      
      const updateBatteryInfo = () => {
        setMetrics(prev => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
          isLowPowerMode: battery.level < 0.2 || !battery.charging
        }));
      };

      updateBatteryInfo();
      
      battery.addEventListener('levelchange', updateBatteryInfo);
      battery.addEventListener('chargingchange', updateBatteryInfo);
      
      return () => {
        battery.removeEventListener('levelchange', updateBatteryInfo);
        battery.removeEventListener('chargingchange', updateBatteryInfo);
      };
    } catch (error) {
      console.warn('Battery API not supported:', error);
    }
  }, [enableBatteryMonitoring]);

  // CPU Usage Estimation (simplified)
  const estimateCPUUsage = useCallback(() => {
    const start = performance.now();
    
    // Simple CPU intensive task to measure performance
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.random();
    }
    
    const duration = performance.now() - start;
    
    // Estimate CPU usage based on task duration
    // Lower duration = less CPU load
    const cpuUsage = Math.min(100, Math.max(0, (duration - 1) * 10));
    
    setMetrics(prev => ({ ...prev, cpuUsage: Math.round(cpuUsage) }));
  }, []);

  // Performance optimization recommendations
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    if (metrics.fps < fpsThreshold) {
      recommendations.push('Enable low-performance mode for better frame rates');
    }
    
    if (metrics.memoryUsage > memoryThreshold) {
      recommendations.push('Clear cache to free up memory');
    }
    
    if (metrics.networkSpeed === 'slow') {
      recommendations.push('Enable data-saving mode for slow connections');
    }
    
    if (metrics.isLowPowerMode) {
      recommendations.push('Reduce animations and effects to save battery');
    }
    
    return recommendations;
  }, [metrics, fpsThreshold, memoryThreshold]);

  // Auto-enable low performance mode
  useEffect(() => {
    const shouldEnableLowPerformanceMode = 
      metrics.fps < fpsThreshold ||
      metrics.memoryUsage > memoryThreshold ||
      metrics.isLowPowerMode ||
      metrics.networkSpeed === 'slow';
    
    setIsLowPerformanceMode(shouldEnableLowPerformanceMode);
  }, [metrics, fpsThreshold, memoryThreshold]);

  // Initialize monitoring
  useEffect(() => {
    setMetrics(prev => ({ ...prev, deviceType: getDeviceType() }));
    
    if (enableFPSMonitoring) {
      measureFPS();
    }
    
    if (enableNetworkMonitoring) {
      detectNetworkSpeed();
      window.addEventListener('online', detectNetworkSpeed);
      window.addEventListener('offline', detectNetworkSpeed);
    }
    
    if (enableBatteryMonitoring) {
      monitorBattery();
    }

    // Periodic measurements
    const memoryInterval = enableMemoryMonitoring ? setInterval(measureMemory, 5000) : null;
    const cpuInterval = setInterval(estimateCPUUsage, 10000);
    const networkInterval = enableNetworkMonitoring ? setInterval(detectNetworkSpeed, 30000) : null;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (memoryInterval) clearInterval(memoryInterval);
      clearInterval(cpuInterval);
      if (networkInterval) clearInterval(networkInterval);
      
      if (enableNetworkMonitoring) {
        window.removeEventListener('online', detectNetworkSpeed);
        window.removeEventListener('offline', detectNetworkSpeed);
      }
    };
  }, [
    enableFPSMonitoring,
    enableMemoryMonitoring,
    enableNetworkMonitoring,
    enableBatteryMonitoring,
    measureFPS,
    measureMemory,
    detectNetworkSpeed,
    monitorBattery,
    estimateCPUUsage,
    getDeviceType
  ]);

  // Notify of performance changes
  useEffect(() => {
    if (onPerformanceChange) {
      onPerformanceChange(metrics);
    }
  }, [metrics, onPerformanceChange]);

  // Performance optimization helpers
  const optimizeForDevice = useCallback(() => {
    if (metrics.deviceType === 'mobile' || isLowPerformanceMode) {
      // Disable heavy animations
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.style.setProperty('--particle-count', '5');
      document.documentElement.style.setProperty('--blur-amount', '5px');
    } else {
      // Enable full animations
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
      document.documentElement.style.setProperty('--particle-count', '20');
      document.documentElement.style.setProperty('--blur-amount', '20px');
    }
  }, [metrics.deviceType, isLowPerformanceMode]);

  useEffect(() => {
    optimizeForDevice();
  }, [optimizeForDevice]);

  // Preload management for mobile
  const shouldPreloadContent = useCallback(() => {
    return metrics.networkSpeed === 'fast' && 
           !metrics.isLowPowerMode && 
           metrics.batteryLevel! > 20;
  }, [metrics]);

  // Image quality adjustment
  const getOptimalImageQuality = useCallback(() => {
    if (metrics.networkSpeed === 'slow' || metrics.isLowPowerMode) {
      return 'low'; // 0.3x resolution
    } else if (metrics.deviceType === 'mobile') {
      return 'medium'; // 0.7x resolution
    } else {
      return 'high'; // 1.0x resolution
    }
  }, [metrics]);

  return {
    metrics,
    isLowPerformanceMode,
    getOptimizationRecommendations,
    shouldPreloadContent,
    getOptimalImageQuality,
    optimizeForDevice
  };
};

export default useMobilePerformance;

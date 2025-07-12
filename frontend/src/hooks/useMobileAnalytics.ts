import { useEffect, useCallback, useRef, useState } from 'react';

interface TouchEvent {
  type: 'tap' | 'swipe' | 'pinch' | 'long-press' | 'double-tap';
  element: string;
  position: { x: number; y: number };
  timestamp: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

interface UserSession {
  sessionId: string;
  startTime: number;
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    screenSize: { width: number; height: number };
    orientation: 'portrait' | 'landscape';
  };
  interactions: TouchEvent[];
  pages: Array<{
    path: string;
    timestamp: number;
    timeSpent?: number;
  }>;
  performance: {
    averageFPS: number;
    memoryUsage: number;
    loadTime: number;
    crashCount: number;
  };
}

interface MobileAnalyticsOptions {
  enableTouchTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableErrorTracking?: boolean;
  sampleRate?: number;
  onSessionUpdate?: (session: UserSession) => void;
  onCriticalError?: (error: Error, context: any) => void;
}

export const useMobileAnalytics = (options: MobileAnalyticsOptions = {}) => {
  const {
    enableTouchTracking = true,
    enablePerformanceTracking = true,
    enableErrorTracking = true,
    sampleRate = 1.0,
    onSessionUpdate,
    onCriticalError
  } = options;

  const [session, setSession] = useState<UserSession | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const performanceDataRef = useRef<{ fps: number[]; memory: number[] }>({ fps: [], memory: [] });
  const sessionStartRef = useRef<number>(Date.now());
  const currentPageRef = useRef<{ path: string; timestamp: number }>({ path: '/', timestamp: Date.now() });

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Detect device information
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = width < 768 ? 'mobile' : 'tablet';
    } else {
      deviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
    }

    let os = 'Unknown';
    if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';

    let browser = 'Unknown';
    if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';

    return {
      type: deviceType,
      os,
      browser,
      screenSize: { width, height },
      orientation: width > height ? 'landscape' : 'portrait' as 'portrait' | 'landscape'
    };
  }, []);

  // Initialize session
  useEffect(() => {
    if (Math.random() > sampleRate) return; // Sampling

    const sessionId = generateSessionId();
    const deviceInfo = getDeviceInfo();
    
    const newSession: UserSession = {
      sessionId,
      startTime: sessionStartRef.current,
      device: deviceInfo,
      interactions: [],
      pages: [{ path: currentPageRef.current.path, timestamp: currentPageRef.current.timestamp }],
      performance: {
        averageFPS: 60,
        memoryUsage: 0,
        loadTime: performance.now(),
        crashCount: 0
      }
    };

    setSession(newSession);
  }, [sampleRate, generateSessionId, getDeviceInfo]);

  // Track touch interactions
  const trackTouchInteraction = useCallback((event: TouchEvent) => {
    if (!enableTouchTracking || !session) return;

    setSession(prev => {
      if (!prev) return prev;
      
      const updatedSession = {
        ...prev,
        interactions: [...prev.interactions, event]
      };

      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }

      return updatedSession;
    });
  }, [enableTouchTracking, session, onSessionUpdate]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: Event) => {
    const touch = (e as any).touches?.[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback((e: Event) => {
    const touch = (e as any).changedTouches?.[0];
    const touchStart = touchStartRef.current;
    
    if (!touch || !touchStart) return;

    const endTime = Date.now();
    const duration = endTime - touchStart.time;
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const target = e.target as HTMLElement;
    const elementName = target.tagName.toLowerCase() + 
      (target.className ? `.${target.className.split(' ')[0]}` : '') +
      (target.id ? `#${target.id}` : '');

    let eventType: TouchEvent['type'] = 'tap';
    let direction: TouchEvent['direction'] | undefined;

    if (duration > 500) {
      eventType = 'long-press';
    } else if (distance > 50) {
      eventType = 'swipe';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    const touchEvent: TouchEvent = {
      type: eventType,
      element: elementName,
      position: { x: touch.clientX, y: touch.clientY },
      timestamp: endTime,
      duration,
      distance,
      direction
    };

    trackTouchInteraction(touchEvent);
    touchStartRef.current = null;
  }, [trackTouchInteraction]);

  // Handle double tap
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  
  const handleTap = useCallback((e: Event) => {
    const touch = (e as any).changedTouches?.[0];
    if (!touch) return;

    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap && 
        now - lastTap.time < 300 && 
        Math.abs(touch.clientX - lastTap.x) < 50 && 
        Math.abs(touch.clientY - lastTap.y) < 50) {
      
      const target = e.target as HTMLElement;
      const elementName = target.tagName.toLowerCase() + 
        (target.className ? `.${target.className.split(' ')[0]}` : '') +
        (target.id ? `#${target.id}` : '');

      const doubleTapEvent: TouchEvent = {
        type: 'double-tap',
        element: elementName,
        position: { x: touch.clientX, y: touch.clientY },
        timestamp: now
      };

      trackTouchInteraction(doubleTapEvent);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = {
        time: now,
        x: touch.clientX,
        y: touch.clientY
      };
    }
  }, [trackTouchInteraction]);

  // Track page navigation
  const trackPageView = useCallback((path: string) => {
    if (!session) return;

    const now = Date.now();
    
    setSession(prev => {
      if (!prev) return prev;

      // Calculate time spent on previous page
      const updatedPages = [...prev.pages];
      if (updatedPages.length > 0) {
        const lastPage = updatedPages[updatedPages.length - 1];
        if (!lastPage.timeSpent) {
          lastPage.timeSpent = now - lastPage.timestamp;
        }
      }

      // Add new page
      updatedPages.push({ path, timestamp: now });

      const updatedSession = {
        ...prev,
        pages: updatedPages
      };

      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }

      return updatedSession;
    });

    currentPageRef.current = { path, timestamp: now };
  }, [session, onSessionUpdate]);

  // Track performance metrics
  const trackPerformance = useCallback((fps: number, memoryUsage: number) => {
    if (!enablePerformanceTracking || !session) return;

    performanceDataRef.current.fps.push(fps);
    performanceDataRef.current.memory.push(memoryUsage);

    // Keep only last 100 measurements
    if (performanceDataRef.current.fps.length > 100) {
      performanceDataRef.current.fps.shift();
    }
    if (performanceDataRef.current.memory.length > 100) {
      performanceDataRef.current.memory.shift();
    }

    // Update session with average performance
    const averageFPS = performanceDataRef.current.fps.reduce((a, b) => a + b, 0) / 
                      performanceDataRef.current.fps.length;
    const averageMemory = performanceDataRef.current.memory.reduce((a, b) => a + b, 0) / 
                         performanceDataRef.current.memory.length;

    setSession(prev => {
      if (!prev) return prev;

      const updatedSession = {
        ...prev,
        performance: {
          ...prev.performance,
          averageFPS: Math.round(averageFPS),
          memoryUsage: Math.round(averageMemory)
        }
      };

      return updatedSession;
    });
  }, [enablePerformanceTracking, session]);

  // Track errors
  const trackError = useCallback((error: Error, context: any = {}) => {
    if (!enableErrorTracking || !session) return;

    setSession(prev => {
      if (!prev) return prev;

      const updatedSession = {
        ...prev,
        performance: {
          ...prev.performance,
          crashCount: prev.performance.crashCount + 1
        }
      };

      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }

      return updatedSession;
    });

    if (onCriticalError) {
      onCriticalError(error, { ...context, sessionId: session.sessionId });
    }
  }, [enableErrorTracking, session, onSessionUpdate, onCriticalError]);

  // User behavior analysis
  const getUserBehaviorInsights = useCallback(() => {
    if (!session) return null;

    const interactions = session.interactions;
    const totalInteractions = interactions.length;
    
    if (totalInteractions === 0) return null;

    const swipeCount = interactions.filter(i => i.type === 'swipe').length;
    const tapCount = interactions.filter(i => i.type === 'tap').length;
    const longPressCount = interactions.filter(i => i.type === 'long-press').length;
    const doubleTapCount = interactions.filter(i => i.type === 'double-tap').length;

    const averageSessionDuration = Date.now() - session.startTime;
    const pagesVisited = session.pages.length;
    const averageTimePerPage = session.pages
      .filter(p => p.timeSpent)
      .reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 
      Math.max(1, session.pages.filter(p => p.timeSpent).length);

    // Detect user patterns
    const isSwipeHeavyUser = swipeCount / totalInteractions > 0.3;
    const isQuickNavigator = averageTimePerPage < 10000; // Less than 10 seconds per page
    const isPowerUser = totalInteractions > 50 && averageSessionDuration > 300000; // 5+ minutes

    // Performance insights
    const hasPerformanceIssues = session.performance.averageFPS < 30 || 
                                session.performance.memoryUsage > 70;

    return {
      totalInteractions,
      interactionBreakdown: {
        swipes: swipeCount,
        taps: tapCount,
        longPresses: longPressCount,
        doubleTaps: doubleTapCount
      },
      sessionMetrics: {
        duration: averageSessionDuration,
        pagesVisited,
        averageTimePerPage: Math.round(averageTimePerPage)
      },
      userType: {
        isSwipeHeavyUser,
        isQuickNavigator,
        isPowerUser
      },
      performanceInsights: {
        hasPerformanceIssues,
        averageFPS: session.performance.averageFPS,
        memoryUsage: session.performance.memoryUsage,
        crashCount: session.performance.crashCount
      }
    };
  }, [session]);

  // Setup event listeners
  useEffect(() => {
    if (!enableTouchTracking) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchend', handleTap, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchend', handleTap);
    };
  }, [enableTouchTracking, handleTouchStart, handleTouchEnd, handleTap]);

  // Setup error tracking
  useEffect(() => {
    if (!enableErrorTracking) return;

    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        type: 'promise_rejection',
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enableErrorTracking, trackError]);

  // Export session data
  const exportSessionData = useCallback(() => {
    if (!session) return null;

    return {
      ...session,
      insights: getUserBehaviorInsights(),
      exportTime: Date.now()
    };
  }, [session, getUserBehaviorInsights]);

  return {
    session,
    trackPageView,
    trackPerformance,
    trackError,
    getUserBehaviorInsights,
    exportSessionData
  };
};

export default useMobileAnalytics;

// NocturneSwap Analytics & Monitoring System
// This file provides comprehensive analytics, performance monitoring, and user behavior tracking

class NocturneAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.performance = {
      pageLoadTime: 0,
      apiResponseTimes: [],
      errorCount: 0,
      userActions: 0
    };
    this.userBehavior = {
      tokensSwapped: {},
      totalVolume: 0,
      transactionCount: 0,
      timeSpent: 0
    };
    
    // Load saved analytics data
    this.loadFromLocalStorage();
    
    this.initializeAnalytics();
  }
  
  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  initializeAnalytics() {
    // Track page load performance
    window.addEventListener('load', () => {
      this.performance.pageLoadTime = Date.now() - this.startTime;
      this.trackEvent('page_load', { loadTime: this.performance.pageLoadTime });
    });
    
    // Track user interactions
    document.addEventListener('click', (e) => {
      this.performance.userActions++;
      this.trackEvent('user_interaction', { 
        element: e.target.tagName,
        className: e.target.className,
        id: e.target.id
      });
    });
    
    // Track errors
    window.addEventListener('error', (e) => {
      this.performance.errorCount++;
      this.trackEvent('error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno
      });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.performance.errorCount++;
      this.trackEvent('promise_rejection', {
        reason: e.reason?.toString() || 'Unknown error'
      });
    });
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });
    
    // Track session duration
    setInterval(() => {
      this.userBehavior.timeSpent = Date.now() - this.startTime;
    }, 1000);
    
    // Send analytics data periodically
    setInterval(() => {
      this.sendAnalytics();
    }, 60000); // Send every minute
    
    // Send analytics on page unload
    window.addEventListener('beforeunload', () => {
      this.sendAnalytics(true);
    });
  }
  
  trackEvent(eventType, data = {}) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type: eventType,
      data: data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };
    
    this.events.push(event);
    console.log('📊 Analytics Event:', eventType, data);
    
    // Limit events array size
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }
  }
  
  generateEventId() {
    return 'evt_' + Math.random().toString(36).substr(2, 9);
  }
  
  trackWalletConnection(walletType, success) {
    this.trackEvent('wallet_connection', {
      walletType: walletType,
      success: success,
      timestamp: Date.now()
    });
  }
  
  trackTokenSwap(fromToken, toToken, fromAmount, toAmount, success) {
    this.trackEvent('token_swap', {
      fromToken: fromToken,
      toToken: toToken,
      fromAmount: fromAmount,
      toAmount: toAmount,
      success: success
    });
    
    if (success) {
      this.userBehavior.transactionCount++;
      this.userBehavior.totalVolume += parseFloat(fromAmount) || 0;
      
      const pair = `${fromToken}/${toToken}`;
      this.userBehavior.tokensSwapped[pair] = (this.userBehavior.tokensSwapped[pair] || 0) + 1;
    }
  }
  
  // Enhanced swap tracking functionality
  trackSwap(swapData) {
    const swap = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type: 'swap_completed',
      data: {
        tokenIn: swapData.tokenIn,
        tokenOut: swapData.tokenOut,
        amountIn: swapData.amountIn,
        amountOut: swapData.amountOut,
        signature: swapData.signature,
        priceImpact: swapData.priceImpact,
        slippage: swapData.slippage,
        route: swapData.route
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.events.push(swap);
    this.userBehavior.transactionCount++;
    this.userBehavior.totalVolume += parseFloat(swapData.amountIn) || 0;
    
    // Update tokens swapped counter
    if (!this.userBehavior.tokensSwapped[swapData.tokenIn]) {
      this.userBehavior.tokensSwapped[swapData.tokenIn] = 0;
    }
    this.userBehavior.tokensSwapped[swapData.tokenIn] += parseFloat(swapData.amountIn) || 0;
    
    // Store in localStorage for persistence
    this.saveToLocalStorage();
    
    console.log('🌙 Swap tracked:', swap);
  }
  
  // Get swap history for admin dashboard
  getSwapHistory() {
    return this.events
      .filter(event => event.type === 'swap_completed')
      .map(event => ({
        id: event.id,
        timestamp: event.timestamp,
        tokenIn: event.data.tokenIn,
        tokenOut: event.data.tokenOut,
        amountIn: event.data.amountIn,
        amountOut: event.data.amountOut,
        signature: event.data.signature,
        user: event.sessionId,
        fee: (parseFloat(event.data.amountIn) || 0) * 0.003,
        status: 'confirmed'
      }));
  }
  
  // Get analytics metrics for dashboard
  getAnalyticsMetrics() {
    const swapEvents = this.events.filter(event => event.type === 'swap_completed');
    const uniqueUsers = new Set(swapEvents.map(event => event.sessionId)).size;
    
    return {
      totalSwaps: swapEvents.length,
      uniqueUsers: uniqueUsers,
      totalVolume: this.userBehavior.totalVolume,
      totalFees: this.userBehavior.totalVolume * 0.003,
      avgSwapSize: swapEvents.length > 0 ? this.userBehavior.totalVolume / swapEvents.length : 0,
      topTokens: Object.entries(this.userBehavior.tokensSwapped)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([token]) => token)
    };
  }
  
  // Track price feed updates
  trackPriceFeed(priceData) {
    this.trackEvent('price_update', {
      token: priceData.token,
      price: priceData.price,
      source: priceData.source,
      timestamp: Date.now()
    });
  }
  
  // Track RPC performance
  trackRPCCall(rpcData) {
    const responseTime = Date.now() - rpcData.startTime;
    this.performance.apiResponseTimes.push(responseTime);
    
    this.trackEvent('rpc_call', {
      method: rpcData.method,
      responseTime: responseTime,
      success: rpcData.success,
      endpoint: rpcData.endpoint
    });
  }
  
  trackApiCall(endpoint, duration, success) {
    this.performance.apiResponseTimes.push({
      endpoint: endpoint,
      duration: duration,
      success: success,
      timestamp: Date.now()
    });
    
    this.trackEvent('api_call', {
      endpoint: endpoint,
      duration: duration,
      success: success
    });
  }
  
  trackUserFlow(step, data = {}) {
    this.trackEvent('user_flow', {
      step: step,
      data: data
    });
  }
  
  getPerformanceMetrics() {
    return {
      sessionId: this.sessionId,
      pageLoadTime: this.performance.pageLoadTime,
      averageApiResponseTime: this.calculateAverageResponseTime(),
      errorRate: this.calculateErrorRate(),
      userActions: this.performance.userActions,
      sessionDuration: Date.now() - this.startTime,
      ...this.userBehavior
    };
  }
  
  calculateAverageResponseTime() {
    if (this.performance.apiResponseTimes.length === 0) return 0;
    
    const total = this.performance.apiResponseTimes.reduce((sum, call) => sum + call.duration, 0);
    return total / this.performance.apiResponseTimes.length;
  }
  
  calculateErrorRate() {
    if (this.performance.userActions === 0) return 0;
    return (this.performance.errorCount / this.performance.userActions) * 100;
  }
  
  sendAnalytics(isBeforeUnload = false) {
    const analyticsData = {
      sessionData: {
        sessionId: this.sessionId,
        startTime: this.startTime,
        endTime: Date.now(),
        duration: Date.now() - this.startTime
      },
      performance: this.getPerformanceMetrics(),
      events: this.events,
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      page: {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer
      }
    };
    
    // In production, this would send to your analytics service
    console.log('📊 Sending Analytics Data:', analyticsData);
    
    // Mock API call (replace with real endpoint)
    if (!isBeforeUnload) {
      this.mockAnalyticsAPI(analyticsData);
    } else {
      // Use sendBeacon for unload events
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', JSON.stringify(analyticsData));
      }
    }
  }
  
  mockAnalyticsAPI(data) {
    // Simulate API call
    const startTime = Date.now();
    
    setTimeout(() => {
      const duration = Date.now() - startTime;
      this.trackApiCall('/api/analytics', duration, true);
      console.log('📊 Analytics data sent successfully');
    }, Math.random() * 1000 + 500);
  }
  
  // A/B Testing Support
  getABTestVariant(testName) {
    const hash = this.hashString(this.sessionId + testName);
    return hash % 2 === 0 ? 'A' : 'B';
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  // Feature Flag Support
  isFeatureEnabled(featureName) {
    const features = {
      'advanced_charts': true,
      'social_trading': false,
      'portfolio_analytics': true,
      'mobile_app_promo': true,
      'premium_features': false
    };
    
    return features[featureName] || false;
  }
  
  // Real-time monitoring
  startRealTimeMonitoring() {
    setInterval(() => {
      const metrics = this.getPerformanceMetrics();
      
      // Check for performance issues
      if (metrics.averageApiResponseTime > 5000) {
        this.trackEvent('performance_warning', {
          type: 'slow_api_response',
          averageTime: metrics.averageApiResponseTime
        });
      }
      
      if (metrics.errorRate > 5) {
        this.trackEvent('performance_warning', {
          type: 'high_error_rate',
          errorRate: metrics.errorRate
        });
      }
      
    }, 30000); // Check every 30 seconds
  }
  
  // User segmentation
  getUserSegment() {
    const metrics = this.getPerformanceMetrics();
    
    if (metrics.transactionCount > 10) {
      return 'power_user';
    } else if (metrics.transactionCount > 1) {
      return 'active_user';
    } else if (metrics.sessionDuration > 300000) { // 5 minutes
      return 'engaged_visitor';
    } else {
      return 'new_visitor';
    }
  }
  
  // Conversion tracking
  trackConversion(type, value = 0) {
    this.trackEvent('conversion', {
      type: type,
      value: value,
      userSegment: this.getUserSegment()
    });
  }
  
  // Save analytics to localStorage
  saveToLocalStorage() {
    try {
      const analyticsData = {
        sessionId: this.sessionId,
        events: this.events.slice(-100), // Keep last 100 events
        userBehavior: this.userBehavior,
        performance: this.performance,
        timestamp: Date.now()
      };
      
      localStorage.setItem('nocturne_analytics', JSON.stringify(analyticsData));
    } catch (error) {
      console.error('Failed to save analytics to localStorage:', error);
    }
  }
  
  // Load analytics from localStorage
  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('nocturne_analytics');
      if (savedData) {
        const analyticsData = JSON.parse(savedData);
        
        // Only load if data is from the same session or recent
        if (analyticsData.sessionId === this.sessionId || 
            (Date.now() - analyticsData.timestamp) < 24 * 60 * 60 * 1000) {
          this.events = analyticsData.events || [];
          this.userBehavior = { ...this.userBehavior, ...analyticsData.userBehavior };
          this.performance = { ...this.performance, ...analyticsData.performance };
        }
      }
    } catch (error) {
      console.error('Failed to load analytics from localStorage:', error);
    }
  }
}

// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memory: [],
      timing: [],
      resources: []
    };
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        this.metrics.memory.push({
          timestamp: Date.now(),
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        });
        
        // Keep only last 100 measurements
        if (this.metrics.memory.length > 100) {
          this.metrics.memory = this.metrics.memory.slice(-50);
        }
      }, 10000); // Every 10 seconds
    }
    
    // Monitor resource loading
    if (performance.getEntriesByType) {
      setInterval(() => {
        const resources = performance.getEntriesByType('resource');
        this.metrics.resources = resources.map(resource => ({
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize || resource.encodedBodySize,
          type: resource.initiatorType
        }));
      }, 30000); // Every 30 seconds
    }
  }
  
  getMemoryUsage() {
    if (this.metrics.memory.length === 0) return null;
    
    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    return {
      used: (latest.used / 1024 / 1024).toFixed(2) + ' MB',
      total: (latest.total / 1024 / 1024).toFixed(2) + ' MB',
      percentage: ((latest.used / latest.total) * 100).toFixed(1) + '%'
    };
  }
  
  getResourceMetrics() {
    if (this.metrics.resources.length === 0) return null;
    
    const totalSize = this.metrics.resources.reduce((sum, resource) => sum + (resource.size || 0), 0);
    const totalDuration = this.metrics.resources.reduce((sum, resource) => sum + resource.duration, 0);
    
    return {
      totalResources: this.metrics.resources.length,
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      averageLoadTime: (totalDuration / this.metrics.resources.length).toFixed(2) + ' ms'
    };
  }
}

// Error tracking and reporting
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.initializeErrorTracking();
  }
  
  initializeErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (e) => {
      this.logError({
        type: 'javascript_error',
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack,
        timestamp: Date.now()
      });
    });
    
    // Track promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.logError({
        type: 'promise_rejection',
        message: e.reason?.toString() || 'Unknown promise rejection',
        stack: e.reason?.stack,
        timestamp: Date.now()
      });
    });
  }
  
  logError(error) {
    this.errors.push(error);
    console.error('🚨 Error tracked:', error);
    
    // Send critical errors immediately
    if (this.isCriticalError(error)) {
      this.sendErrorReport(error);
    }
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-25);
    }
  }
  
  isCriticalError(error) {
    const criticalKeywords = ['wallet', 'transaction', 'swap', 'connection'];
    return criticalKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    );
  }
  
  sendErrorReport(error) {
    // In production, send to error reporting service
    console.log('📧 Sending critical error report:', error);
  }
  
  getErrorSummary() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    const recentErrors = this.errors.filter(error => error.timestamp > oneHourAgo);
    const errorTypes = recentErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalErrors: this.errors.length,
      recentErrors: recentErrors.length,
      errorTypes: errorTypes,
      errorRate: (recentErrors.length / 60).toFixed(2) + ' errors/min'
    };
  }
}

// Initialize monitoring systems
let analytics, performanceMonitor, errorTracker;

if (typeof window !== 'undefined') {
  analytics = new NocturneAnalytics();
  performanceMonitor = new PerformanceMonitor();
  errorTracker = new ErrorTracker();
  
  // Start real-time monitoring
  analytics.startRealTimeMonitoring();
  
  // Expose to global scope for debugging
  window.NocturneAnalytics = { analytics, performanceMonitor, errorTracker };
  
  console.log('📊 NocturneSwap Analytics & Monitoring initialized');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NocturneAnalytics, PerformanceMonitor, ErrorTracker };
}

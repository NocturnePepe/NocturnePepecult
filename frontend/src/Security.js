// Security.js - Advanced Security Manager for NocturneSwap
// Handles rug pull detection, whale activity monitoring, MEV protection, and comprehensive risk analysis

class SecurityManager {
  constructor() {
    this.riskThresholds = {
      rugPull: {
        liquidityDrop: 0.5, // 50% liquidity drop threshold
        holderConcentration: 0.8, // Top 10 holders own 80%
        tokenAge: 7, // Less than 7 days old
        liquidityLocked: 0.3 // Less than 30% liquidity locked
      },
      whale: {
        largeTradeThreshold: 100000, // $100k+ trades
        volumeSpike: 5, // 5x normal volume
        priceImpact: 0.1 // 10% price impact
      },
      mev: {
        sandwichDetection: true,
        frontrunningProtection: true,
        priorityFeeOptimization: true
      }
    };

    this.securityDatabase = {
      knownRugs: new Set(),
      whitelistedTokens: new Set(['SOL', 'USDC', 'USDT', 'BTC', 'ETH']),
      suspiciousContracts: new Set(),
      trustedPools: new Set()
    };

    this.init();
  }

  init() {
    console.log('🛡️ Security Manager initialized');
    this.loadSecurityData();
    this.setupRealTimeMonitoring();
  }

  // Load security data from local storage and external sources
  loadSecurityData() {
    const savedData = localStorage.getItem('nocturne_security_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.securityDatabase = { ...this.securityDatabase, ...data };
    }

    // Load community-reported security issues
    this.loadCommunityReports();
  }

  async loadCommunityReports() {
    // In production, this would fetch from a security API
    const mockReports = [
      { token: '7XJq3...', type: 'rug_pull', confidence: 0.95, reportedAt: Date.now() - 86400000 },
      { token: '9KLm2...', type: 'whale_dump', confidence: 0.8, reportedAt: Date.now() - 3600000 },
      { token: 'Abc123...', type: 'suspicious_activity', confidence: 0.7, reportedAt: Date.now() - 1800000 }
    ];

    mockReports.forEach(report => {
      if (report.type === 'rug_pull') {
        this.securityDatabase.knownRugs.add(report.token);
      } else if (report.type === 'whale_dump' || report.type === 'suspicious_activity') {
        this.securityDatabase.suspiciousContracts.add(report.token);
      }
    });
  }

  // Main security analysis function
  async analyzeTransaction(transactionData) {
    const {
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      slippage,
      poolAddress,
      userAddress
    } = transactionData;

    console.log('🔍 Analyzing transaction security...');

    const results = {
      overallRisk: 'low',
      riskScore: 0,
      warnings: [],
      recommendations: [],
      protections: [],
      analysis: {}
    };

    // Run all security checks
    const rugPullAnalysis = await this.analyzeRugPullRisk(tokenIn, tokenOut, poolAddress);
    const whaleAnalysis = await this.analyzeWhaleActivity(tokenIn, tokenOut, amountIn);
    const mevAnalysis = await this.analyzeMEVRisk(transactionData);
    const liquidityAnalysis = await this.analyzeLiquidityRisk(poolAddress, amountIn);
    const contractAnalysis = await this.analyzeContractSafety(tokenIn, tokenOut);

    // Combine results
    results.analysis = {
      rugPullRisk: rugPullAnalysis,
      whaleActivity: whaleAnalysis,
      mevRisk: mevAnalysis,
      liquidityRisk: liquidityAnalysis,
      contractSafety: contractAnalysis
    };

    // Calculate overall risk score
    const riskScores = [
      rugPullAnalysis.riskScore,
      whaleAnalysis.riskScore,
      mevAnalysis.riskScore,
      liquidityAnalysis.riskScore,
      contractAnalysis.riskScore
    ];

    results.riskScore = Math.max(...riskScores);

    // Determine overall risk level
    if (results.riskScore >= 0.8) {
      results.overallRisk = 'critical';
    } else if (results.riskScore >= 0.6) {
      results.overallRisk = 'high';
    } else if (results.riskScore >= 0.4) {
      results.overallRisk = 'medium';
    } else {
      results.overallRisk = 'low';
    }

    // Compile warnings and recommendations
    [rugPullAnalysis, whaleAnalysis, mevAnalysis, liquidityAnalysis, contractAnalysis].forEach(analysis => {
      if (analysis.warnings) results.warnings.push(...analysis.warnings);
      if (analysis.recommendations) results.recommendations.push(...analysis.recommendations);
      if (analysis.protections) results.protections.push(...analysis.protections);
    });

    // Add MEV protection automatically for high-risk transactions
    if (results.riskScore >= 0.6) {
      results.protections.push('MEV Protection Enabled');
      results.protections.push('Priority Fee Optimization');
    }

    return results;
  }

  // Rug Pull Detection
  async analyzeRugPullRisk(tokenIn, tokenOut, poolAddress) {
    const analysis = {
      riskScore: 0,
      warnings: [],
      recommendations: [],
      factors: {}
    };

    // Check known rug pulls
    if (this.securityDatabase.knownRugs.has(tokenIn) || this.securityDatabase.knownRugs.has(tokenOut)) {
      analysis.riskScore = 1.0;
      analysis.warnings.push('⚠️ Token flagged as known rug pull');
      analysis.recommendations.push('❌ Do not trade this token');
      return analysis;
    }

    // Simulate token analysis (in production, fetch real data)
    const tokenData = await this.getTokenMetrics(tokenIn, tokenOut);

    // Check liquidity lock
    if (tokenData.liquidityLocked < this.riskThresholds.rugPull.liquidityLocked) {
      analysis.riskScore += 0.3;
      analysis.warnings.push('🔓 Low liquidity lock percentage');
      analysis.recommendations.push('💡 Prefer tokens with locked liquidity');
    }

    // Check holder concentration
    if (tokenData.topHoldersPercentage > this.riskThresholds.rugPull.holderConcentration) {
      analysis.riskScore += 0.25;
      analysis.warnings.push('🐋 High holder concentration detected');
      analysis.recommendations.push('💡 Check top holder distribution');
    }

    // Check token age
    if (tokenData.ageInDays < this.riskThresholds.rugPull.tokenAge) {
      analysis.riskScore += 0.2;
      analysis.warnings.push('🆕 Very new token (high risk)');
      analysis.recommendations.push('💡 New tokens carry higher risk');
    }

    // Check developer activity
    if (!tokenData.verifiedContract) {
      analysis.riskScore += 0.15;
      analysis.warnings.push('❓ Unverified contract');
      analysis.recommendations.push('💡 Prefer verified contracts');
    }

    analysis.factors = {
      liquidityLocked: tokenData.liquidityLocked,
      holderConcentration: tokenData.topHoldersPercentage,
      tokenAge: tokenData.ageInDays,
      contractVerified: tokenData.verifiedContract
    };

    return analysis;
  }

  // Whale Activity Monitoring
  async analyzeWhaleActivity(tokenIn, tokenOut, amountIn) {
    const analysis = {
      riskScore: 0,
      warnings: [],
      recommendations: [],
      whaleActivity: {}
    };

    // Get recent whale transactions
    const whaleTransactions = await this.getRecentWhaleActivity(tokenIn, tokenOut);

    // Check for recent large sells
    const recentSells = whaleTransactions.filter(tx => 
      tx.type === 'sell' && 
      tx.timestamp > Date.now() - 3600000 && // Last hour
      tx.amount > this.riskThresholds.whale.largeTradeThreshold
    );

    if (recentSells.length > 0) {
      analysis.riskScore += 0.4;
      analysis.warnings.push(`🐋 ${recentSells.length} large sell(s) detected in last hour`);
      analysis.recommendations.push('⏰ Consider waiting for market stabilization');
    }

    // Check volume spike
    const currentVolume = await this.getCurrentVolume(tokenIn, tokenOut);
    const averageVolume = await this.getAverageVolume(tokenIn, tokenOut);

    if (currentVolume > averageVolume * this.riskThresholds.whale.volumeSpike) {
      analysis.riskScore += 0.3;
      analysis.warnings.push('📈 Unusual volume spike detected');
      analysis.recommendations.push('💡 High volume may indicate whale activity');
    }

    // Check price impact for user's trade
    const priceImpact = await this.calculatePriceImpact(tokenIn, tokenOut, amountIn);
    if (priceImpact > this.riskThresholds.whale.priceImpact) {
      analysis.riskScore += 0.2;
      analysis.warnings.push(`💥 High price impact: ${(priceImpact * 100).toFixed(2)}%`);
      analysis.recommendations.push('💡 Consider splitting into smaller trades');
    }

    analysis.whaleActivity = {
      recentLargeTrades: recentSells.length,
      volumeMultiplier: currentVolume / averageVolume,
      priceImpact: priceImpact
    };

    return analysis;
  }

  // MEV Protection Analysis
  async analyzeMEVRisk(transactionData) {
    const analysis = {
      riskScore: 0,
      warnings: [],
      recommendations: [],
      protections: [],
      mevRisk: {}
    };

    const { amountIn, slippage, tokenIn, tokenOut } = transactionData;

    // Check for sandwich attack risk
    const sandwichRisk = await this.assessSandwichRisk(tokenIn, tokenOut, amountIn);
    if (sandwichRisk > 0.5) {
      analysis.riskScore += 0.3;
      analysis.warnings.push('🥪 High sandwich attack risk');
      analysis.protections.push('Private mempool routing recommended');
    }

    // Check slippage settings
    if (slippage > 0.05) { // 5%
      analysis.riskScore += 0.2;
      analysis.warnings.push('📊 High slippage tolerance set');
      analysis.recommendations.push('💡 Lower slippage reduces MEV risk');
    }

    // Analyze recent MEV activity
    const mevActivity = await this.getRecentMEVActivity(tokenIn, tokenOut);
    if (mevActivity.highActivity) {
      analysis.riskScore += 0.25;
      analysis.warnings.push('🤖 High MEV bot activity detected');
      analysis.protections.push('Priority fee optimization enabled');
    }

    // Recommend protection measures
    if (analysis.riskScore > 0.3) {
      analysis.protections.push('MEV protection bundle');
      analysis.protections.push('Transaction timing optimization');
    }

    analysis.mevRisk = {
      sandwichRisk: sandwichRisk,
      slippageRisk: slippage,
      botActivity: mevActivity.level
    };

    return analysis;
  }

  // Liquidity Risk Analysis
  async analyzeLiquidityRisk(poolAddress, amountIn) {
    const analysis = {
      riskScore: 0,
      warnings: [],
      recommendations: [],
      liquidityMetrics: {}
    };

    const poolData = await this.getPoolData(poolAddress);

    // Check pool depth
    if (poolData.totalLiquidity < amountIn * 10) {
      analysis.riskScore += 0.4;
      analysis.warnings.push('💧 Low liquidity pool');
      analysis.recommendations.push('💡 Use smaller trade sizes');
    }

    // Check liquidity concentration
    if (poolData.liquidityConcentration > 0.8) {
      analysis.riskScore += 0.3;
      analysis.warnings.push('🎯 Concentrated liquidity position');
      analysis.recommendations.push('💡 Monitor for liquidity changes');
    }

    // Check recent liquidity changes
    if (poolData.liquidityChange24h < -0.2) {
      analysis.riskScore += 0.35;
      analysis.warnings.push('📉 Significant liquidity decrease (24h)');
      analysis.recommendations.push('⚠️ Liquidity may be unstable');
    }

    analysis.liquidityMetrics = {
      totalLiquidity: poolData.totalLiquidity,
      concentration: poolData.liquidityConcentration,
      change24h: poolData.liquidityChange24h
    };

    return analysis;
  }

  // Contract Safety Analysis
  async analyzeContractSafety(tokenIn, tokenOut) {
    const analysis = {
      riskScore: 0,
      warnings: [],
      recommendations: [],
      contractMetrics: {}
    };

    // Check if tokens are whitelisted
    const tokenInSafe = this.securityDatabase.whitelistedTokens.has(tokenIn);
    const tokenOutSafe = this.securityDatabase.whitelistedTokens.has(tokenOut);

    if (!tokenInSafe && !tokenOutSafe) {
      analysis.riskScore += 0.2;
      analysis.warnings.push('❓ Trading unknown tokens');
      analysis.recommendations.push('💡 Research token contracts thoroughly');
    }

    // Check for suspicious contracts
    if (this.securityDatabase.suspiciousContracts.has(tokenIn) || 
        this.securityDatabase.suspiciousContracts.has(tokenOut)) {
      analysis.riskScore += 0.6;
      analysis.warnings.push('🚨 Suspicious contract activity detected');
      analysis.recommendations.push('❌ Avoid trading suspicious contracts');
    }

    // Simulate contract analysis
    const contractData = await this.analyzeContractCode(tokenIn, tokenOut);

    if (contractData.hasHoneypot) {
      analysis.riskScore += 0.8;
      analysis.warnings.push('🍯 Potential honeypot detected');
      analysis.recommendations.push('❌ Do not trade honeypot tokens');
    }

    if (contractData.hasBackdoor) {
      analysis.riskScore += 0.7;
      analysis.warnings.push('🚪 Contract backdoor detected');
      analysis.recommendations.push('❌ Avoid contracts with backdoors');
    }

    analysis.contractMetrics = {
      whitelistedTokens: tokenInSafe && tokenOutSafe,
      suspiciousActivity: this.securityDatabase.suspiciousContracts.has(tokenIn) || 
                         this.securityDatabase.suspiciousContracts.has(tokenOut),
      contractIssues: contractData
    };

    return analysis;
  }

  // Setup real-time monitoring
  setupRealTimeMonitoring() {
    // Monitor for suspicious activity
    setInterval(() => {
      this.monitorMarketConditions();
    }, 30000); // Every 30 seconds

    // Update security database
    setInterval(() => {
      this.updateSecurityDatabase();
    }, 300000); // Every 5 minutes
  }

  async monitorMarketConditions() {
    // Monitor for flash crashes, unusual volume, etc.
    const marketConditions = await this.getMarketConditions();
    
    if (marketConditions.flashCrash) {
      this.broadcastSecurityAlert('⚠️ Flash crash detected - exercise extreme caution');
    }

    if (marketConditions.unusualVolume) {
      this.broadcastSecurityAlert('📊 Unusual market volume - potential manipulation');
    }
  }

  broadcastSecurityAlert(message) {
    // Emit security alert event
    window.dispatchEvent(new CustomEvent('security_alert', {
      detail: { message, timestamp: Date.now() }
    }));

    console.warn('🛡️ Security Alert:', message);
  }

  // Mock data functions (replace with real API calls in production)
  async getTokenMetrics(tokenIn, tokenOut) {
    return {
      liquidityLocked: Math.random() * 100,
      topHoldersPercentage: Math.random() * 100,
      ageInDays: Math.random() * 365,
      verifiedContract: Math.random() > 0.3
    };
  }

  async getRecentWhaleActivity(tokenIn, tokenOut) {
    return Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      amount: Math.random() * 1000000,
      timestamp: Date.now() - Math.random() * 86400000
    }));
  }

  async getCurrentVolume(tokenIn, tokenOut) {
    return Math.random() * 10000000;
  }

  async getAverageVolume(tokenIn, tokenOut) {
    return Math.random() * 2000000;
  }

  async calculatePriceImpact(tokenIn, tokenOut, amountIn) {
    return Math.random() * 0.2; // 0-20% price impact
  }

  async assessSandwichRisk(tokenIn, tokenOut, amountIn) {
    return Math.random() * 0.8;
  }

  async getRecentMEVActivity(tokenIn, tokenOut) {
    return {
      highActivity: Math.random() > 0.7,
      level: Math.random()
    };
  }

  async getPoolData(poolAddress) {
    return {
      totalLiquidity: Math.random() * 10000000,
      liquidityConcentration: Math.random(),
      liquidityChange24h: (Math.random() - 0.5) * 0.5
    };
  }

  async analyzeContractCode(tokenIn, tokenOut) {
    return {
      hasHoneypot: Math.random() > 0.95,
      hasBackdoor: Math.random() > 0.98,
      verified: Math.random() > 0.2
    };
  }

  async getMarketConditions() {
    return {
      flashCrash: Math.random() > 0.98,
      unusualVolume: Math.random() > 0.9
    };
  }

  updateSecurityDatabase() {
    // Save security data to localStorage
    const dataToSave = {
      knownRugs: Array.from(this.securityDatabase.knownRugs),
      suspiciousContracts: Array.from(this.securityDatabase.suspiciousContracts),
      trustedPools: Array.from(this.securityDatabase.trustedPools),
      lastUpdate: Date.now()
    };

    localStorage.setItem('nocturne_security_data', JSON.stringify(dataToSave));
  }

  // Public API methods
  async runSecurityScan(transactionData) {
    return await this.analyzeTransaction(transactionData);
  }

  reportSuspiciousActivity(tokenAddress, activityType, details) {
    console.log('🚨 Reporting suspicious activity:', { tokenAddress, activityType, details });
    
    if (activityType === 'rug_pull') {
      this.securityDatabase.knownRugs.add(tokenAddress);
    } else {
      this.securityDatabase.suspiciousContracts.add(tokenAddress);
    }

    this.updateSecurityDatabase();
    this.broadcastSecurityAlert(`Suspicious ${activityType} reported for ${tokenAddress}`);
  }

  getSecurityMetrics() {
    return {
      knownRugs: this.securityDatabase.knownRugs.size,
      suspiciousContracts: this.securityDatabase.suspiciousContracts.size,
      whitelistedTokens: this.securityDatabase.whitelistedTokens.size,
      trustedPools: this.securityDatabase.trustedPools.size
    };
  }
}

// Initialize Security Manager
const securityManager = new SecurityManager();

// Export for global access
window.nocturneSwapSecurity = securityManager;

export default securityManager;

// Security.js - Advanced security features for safer trading
import { cultSounds } from './SoundEffects.js';

class SecurityManager {
  constructor() {
    this.riskThresholds = {
      highSlippage: 5.0, // 5%
      largeAmount: 10000, // $10k USD
      newToken: 7, // 7 days
      lowLiquidity: 50000, // $50k USD
      highPriceImpact: 3.0, // 3%
      suspiciousVolume: 1000 // Volume spike multiplier
    };
    
    this.knownRugs = new Set();
    this.whaleWallets = new Set();
    this.loadSecurityData();
  }

  async loadSecurityData() {
    try {
      // Load known rug pulls and whale wallets from local storage or API
      const rugData = localStorage.getItem('known_rugs');
      if (rugData) {
        this.knownRugs = new Set(JSON.parse(rugData));
      }

      const whaleData = localStorage.getItem('whale_wallets');
      if (whaleData) {
        this.whaleWallets = new Set(JSON.parse(whaleData));
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  }

  // Transaction Simulation
  async simulateTransaction(quote, inputToken, outputToken, amount) {
    try {
      console.log('🔍 Simulating transaction...');
      
      // Basic simulation using quote data
      const simulation = {
        success: true,
        estimatedOutput: quote.outAmount,
        slippage: this.calculateSlippage(quote),
        priceImpact: quote.priceImpactPct || 0,
        minimumReceived: quote.outAmount * (1 - (quote.slippageBps / 10000)),
        warnings: [],
        risks: [],
        recommendations: []
      };

      // Check for high slippage
      if (simulation.slippage > this.riskThresholds.highSlippage) {
        simulation.warnings.push({
          type: 'high_slippage',
          message: `High slippage detected: ${simulation.slippage.toFixed(2)}%`,
          severity: 'warning'
        });
      }

      // Check for high price impact
      if (simulation.priceImpact > this.riskThresholds.highPriceImpact) {
        simulation.warnings.push({
          type: 'high_price_impact',
          message: `High price impact: ${simulation.priceImpact.toFixed(2)}%`,
          severity: 'warning'
        });
      }

      // Check for large amount
      const usdValue = await this.getUSDValue(inputToken.symbol, amount);
      if (usdValue > this.riskThresholds.largeAmount) {
        simulation.warnings.push({
          type: 'large_amount',
          message: `Large transaction: $${this.formatNumber(usdValue)}`,
          severity: 'info'
        });
      }

      // Security checks
      await this.performSecurityChecks(inputToken, outputToken, simulation);

      return simulation;
    } catch (error) {
      console.error('Transaction simulation failed:', error);
      return {
        success: false,
        error: 'Simulation failed',
        warnings: [{
          type: 'simulation_error',
          message: 'Unable to simulate transaction',
          severity: 'error'
        }]
      };
    }
  }

  async performSecurityChecks(inputToken, outputToken, simulation) {
    // Check for known rug pulls
    if (this.knownRugs.has(outputToken.address)) {
      simulation.risks.push({
        type: 'known_rug',
        message: 'WARNING: This token has been flagged as a potential rug pull',
        severity: 'critical'
      });
    }

    // Check token age and liquidity
    await this.checkTokenSafety(outputToken, simulation);
    
    // Check for suspicious trading patterns
    await this.checkTradingPatterns(outputToken, simulation);
    
    // Check wallet security
    await this.checkWalletSecurity(simulation);
  }

  async checkTokenSafety(token, simulation) {
    try {
      // Mock token safety checks (in real implementation, would call APIs)
      const tokenAge = this.getTokenAge(token);
      const liquidity = await this.getTokenLiquidity(token);
      
      if (tokenAge < this.riskThresholds.newToken) {
        simulation.warnings.push({
          type: 'new_token',
          message: `New token (${tokenAge} days old) - Trade with caution`,
          severity: 'warning'
        });
      }

      if (liquidity < this.riskThresholds.lowLiquidity) {
        simulation.warnings.push({
          type: 'low_liquidity',
          message: `Low liquidity: $${this.formatNumber(liquidity)}`,
          severity: 'warning'
        });
      }

      // Check for common rug pull indicators
      if (await this.hasRugPullIndicators(token)) {
        simulation.risks.push({
          type: 'rug_indicators',
          message: 'Multiple rug pull indicators detected',
          severity: 'critical'
        });
      }

    } catch (error) {
      console.error('Token safety check failed:', error);
    }
  }

  async checkTradingPatterns(token, simulation) {
    try {
      // Mock trading pattern analysis
      const volume24h = await this.get24hVolume(token);
      const volumeAvg = await this.getAverageVolume(token, 7); // 7 day average
      
      if (volume24h > volumeAvg * this.riskThresholds.suspiciousVolume) {
        simulation.warnings.push({
          type: 'volume_spike',
          message: 'Unusual volume spike detected - potential market manipulation',
          severity: 'warning'
        });
      }

      // Check for whale activity
      const recentTrades = await this.getRecentLargeTrades(token);
      if (recentTrades.length > 0) {
        simulation.warnings.push({
          type: 'whale_activity',
          message: `${recentTrades.length} large trades detected in last hour`,
          severity: 'info'
        });
      }

    } catch (error) {
      console.error('Trading pattern check failed:', error);
    }
  }

  async checkWalletSecurity(simulation) {
    // Check if user's wallet has been involved in suspicious activity
    // This would typically check against known compromised wallets
    
    simulation.recommendations.push({
      type: 'security_tip',
      message: 'Always verify transaction details before signing',
      severity: 'info'
    });
  }

  // Whale Detection
  async detectWhaleActivity(token, timeframe = '1h') {
    try {
      const largeTrades = await this.getRecentLargeTrades(token, timeframe);
      const whaleActivity = {
        detected: largeTrades.length > 0,
        trades: largeTrades,
        impact: this.calculateWhaleImpact(largeTrades),
        recommendations: []
      };

      if (whaleActivity.detected) {
        whaleActivity.recommendations.push(
          'Whale activity detected - consider waiting for stabilization'
        );
        
        if (whaleActivity.impact > 5) {
          whaleActivity.recommendations.push(
            'High whale impact - significant price movement expected'
          );
        }
      }

      return whaleActivity;
    } catch (error) {
      console.error('Whale detection failed:', error);
      return { detected: false, error: error.message };
    }
  }

  // Rug Pull Detection
  async checkRugPullRisk(token) {
    const riskFactors = [];
    let riskScore = 0;

    try {
      // Check liquidity lock
      const liquidityLocked = await this.isLiquidityLocked(token);
      if (!liquidityLocked) {
        riskFactors.push('Liquidity not locked');
        riskScore += 30;
      }

      // Check token distribution
      const topHolders = await this.getTopHolders(token);
      const topHolderPercentage = topHolders.reduce((sum, holder) => sum + holder.percentage, 0);
      
      if (topHolderPercentage > 50) {
        riskFactors.push('High concentration in top holders');
        riskScore += 25;
      }

      // Check contract ownership
      const ownershipRenounced = await this.isOwnershipRenounced(token);
      if (!ownershipRenounced) {
        riskFactors.push('Contract ownership not renounced');
        riskScore += 20;
      }

      // Check for suspicious functions
      const hasSuspiciousFunctions = await this.hasSuspiciousFunctions(token);
      if (hasSuspiciousFunctions) {
        riskFactors.push('Suspicious contract functions detected');
        riskScore += 25;
      }

      return {
        riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        factors: riskFactors,
        recommendation: this.getRugPullRecommendation(riskScore)
      };

    } catch (error) {
      console.error('Rug pull check failed:', error);
      return {
        riskScore: 50,
        riskLevel: 'medium',
        factors: ['Unable to verify contract safety'],
        recommendation: 'Exercise extreme caution - verification failed'
      };
    }
  }

  // MEV Protection
  getMEVProtectionSettings(tradeSize, slippage) {
    const settings = {
      usePrivateMempool: tradeSize > 1000, // Use for trades > $1k
      maxSlippage: Math.min(slippage, 2.0), // Cap at 2%
      priorityFee: this.calculateOptimalFee(tradeSize),
      bundleTransaction: tradeSize > 5000, // Bundle for large trades
      recommendations: []
    };

    if (tradeSize > 10000) {
      settings.recommendations.push('Consider splitting large trade into smaller parts');
    }

    if (slippage > 1.0) {
      settings.recommendations.push('High slippage detected - consider reducing trade size');
    }

    return settings;
  }

  // Helper methods
  calculateSlippage(quote) {
    if (!quote.slippageBps) return 0;
    return quote.slippageBps / 100; // Convert basis points to percentage
  }

  async getUSDValue(symbol, amount) {
    try {
      // Mock USD conversion (would use real price API)
      const prices = {
        'SOL': 120,
        'USDC': 1,
        'USDT': 1,
        'BONK': 0.000025,
        'RAY': 2.5
      };
      return (prices[symbol] || 1) * parseFloat(amount);
    } catch (error) {
      return 0;
    }
  }

  getTokenAge(token) {
    // Mock token age calculation
    return Math.floor(Math.random() * 365) + 1;
  }

  async getTokenLiquidity(token) {
    // Mock liquidity data
    return Math.floor(Math.random() * 1000000) + 10000;
  }

  async hasRugPullIndicators(token) {
    // Mock rug pull indicator check
    return Math.random() < 0.1; // 10% chance for demo
  }

  async get24hVolume(token) {
    return Math.floor(Math.random() * 10000000) + 100000;
  }

  async getAverageVolume(token, days) {
    return Math.floor(Math.random() * 5000000) + 500000;
  }

  async getRecentLargeTrades(token, timeframe = '1h') {
    // Mock large trades data
    const trades = [];
    const tradeCount = Math.floor(Math.random() * 5);
    
    for (let i = 0; i < tradeCount; i++) {
      trades.push({
        amount: Math.floor(Math.random() * 1000000) + 100000,
        wallet: `${Math.random().toString(36).substr(2, 8)}...`,
        timestamp: Date.now() - Math.random() * 3600000,
        type: Math.random() > 0.5 ? 'buy' : 'sell'
      });
    }
    
    return trades;
  }

  calculateWhaleImpact(trades) {
    return trades.reduce((impact, trade) => impact + (trade.amount / 1000000), 0);
  }

  async isLiquidityLocked(token) {
    return Math.random() > 0.3; // 70% chance locked for demo
  }

  async getTopHolders(token) {
    // Mock top holders data
    return [
      { percentage: Math.random() * 20 + 5 },
      { percentage: Math.random() * 15 + 3 },
      { percentage: Math.random() * 10 + 2 }
    ];
  }

  async isOwnershipRenounced(token) {
    return Math.random() > 0.4; // 60% chance renounced for demo
  }

  async hasSuspiciousFunctions(token) {
    return Math.random() < 0.2; // 20% chance for demo
  }

  getRiskLevel(score) {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }

  getRugPullRecommendation(score) {
    if (score < 25) return 'Low risk - proceed with standard caution';
    if (score < 50) return 'Medium risk - verify token details carefully';
    if (score < 75) return 'High risk - consider avoiding this token';
    return 'Critical risk - DO NOT TRADE this token';
  }

  calculateOptimalFee(tradeSize) {
    // Calculate optimal priority fee based on trade size
    if (tradeSize < 100) return 0.0001;
    if (tradeSize < 1000) return 0.001;
    if (tradeSize < 10000) return 0.005;
    return 0.01;
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  }

  // Report suspicious activity
  async reportSuspiciousToken(tokenAddress, reason) {
    try {
      // Add to local blacklist
      this.knownRugs.add(tokenAddress);
      localStorage.setItem('known_rugs', JSON.stringify([...this.knownRugs]));
      
      console.log(`🚨 Reported suspicious token: ${tokenAddress} - ${reason}`);
      
      // In real implementation, would report to security API
      return true;
    } catch (error) {
      console.error('Failed to report suspicious token:', error);
      return false;
    }
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

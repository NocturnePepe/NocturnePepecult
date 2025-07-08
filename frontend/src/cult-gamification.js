// Gamification & Community Features for NocturneSwap
// Cult ranking system, achievements, and community engagement

class CultGamification {
  constructor() {
    this.userLevel = 'Initiate';
    this.cultRank = 0;
    this.tradingVolume = 0;
    this.achievements = new Set();
    this.leaderboard = [];
    this.challenges = [];
    this.badges = [];
    
    this.rankThresholds = [
      { name: 'Initiate', minVolume: 0, color: '#666666', icon: '🌑' },
      { name: 'Acolyte', minVolume: 1000, color: '#9d4edd', icon: '🌒' },
      { name: 'Disciple', minVolume: 5000, color: '#7209b7', icon: '🌓' },
      { name: 'Adept', minVolume: 25000, color: '#6a0dad', icon: '🌔' },
      { name: 'Master', minVolume: 100000, color: '#4b0082', icon: '🌕' },
      { name: 'Elder', minVolume: 500000, color: '#8b008b', icon: '🌖' },
      { name: 'High Priest', minVolume: 1000000, color: '#ff00ff', icon: '🌗' },
      { name: 'Nocturne Lord', minVolume: 5000000, color: '#ffffff', icon: '🌘' }
    ];

    this.achievementTypes = [
      {
        id: 'first_swap',
        name: 'First Blood',
        description: 'Complete your first token swap',
        icon: '⚔️',
        points: 100,
        rarity: 'common'
      },
      {
        id: 'volume_1k',
        name: 'Thousand Souls',
        description: 'Trade $1,000 in volume',
        icon: '💀',
        points: 250,
        rarity: 'common'
      },
      {
        id: 'volume_10k',
        name: 'Soul Collector',
        description: 'Trade $10,000 in volume',
        icon: '👻',
        points: 500,
        rarity: 'uncommon'
      },
      {
        id: 'night_trader',
        name: 'Night Stalker',
        description: 'Trade between 12 AM - 6 AM',
        icon: '🦇',
        points: 300,
        rarity: 'uncommon'
      },
      {
        id: 'perfect_week',
        name: 'Lunar Cycle',
        description: 'Trade every day for 7 days',
        icon: '🌙',
        points: 750,
        rarity: 'rare'
      },
      {
        id: 'whale_trader',
        name: 'Leviathan',
        description: 'Single trade over $50,000',
        icon: '🐋',
        points: 1000,
        rarity: 'epic'
      },
      {
        id: 'cult_leader',
        name: 'Cult Leader',
        description: 'Refer 10 new traders',
        icon: '👑',
        points: 2000,
        rarity: 'legendary'
      }
    ];

    this.challengeTypes = [
      {
        id: 'daily_volume',
        name: 'Daily Ritual',
        description: 'Trade $500 today',
        duration: '24h',
        reward: 100,
        icon: '📅'
      },
      {
        id: 'weekly_swaps',
        name: 'Weekly Devotion',
        description: 'Complete 50 swaps this week',
        duration: '7d',
        reward: 500,
        icon: '📊'
      },
      {
        id: 'liquidity_provider',
        name: 'Pool Guardian',
        description: 'Provide liquidity to 3 pools',
        duration: '30d',
        reward: 1000,
        icon: '🏊'
      }
    ];

    this.initialize();
  }

  async initialize() {
    await this.loadUserData();
    this.setupEventListeners();
    this.startPeriodicUpdates();
    console.log('🎮 Cult Gamification initialized');
  }

  async loadUserData() {
    try {
      const userData = localStorage.getItem('nocturne-cult-data');
      if (userData) {
        const data = JSON.parse(userData);
        this.tradingVolume = data.tradingVolume || 0;
        this.achievements = new Set(data.achievements || []);
        this.updateRank();
      }
    } catch (error) {
      console.error('❌ Failed to load cult data:', error);
    }
  }

  saveUserData() {
    try {
      const data = {
        tradingVolume: this.tradingVolume,
        achievements: Array.from(this.achievements),
        rank: this.cultRank,
        level: this.userLevel,
        lastUpdate: Date.now()
      };
      localStorage.setItem('nocturne-cult-data', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Failed to save cult data:', error);
    }
  }

  setupEventListeners() {
    // Listen for trading events
    window.addEventListener('nocturne-swap-completed', (event) => {
      this.handleSwapCompleted(event.detail);
    });

    // Listen for liquidity events
    window.addEventListener('nocturne-liquidity-added', (event) => {
      this.handleLiquidityAdded(event.detail);
    });

    // Listen for wallet connection
    window.addEventListener('nocturne-wallet-connected', (event) => {
      this.handleWalletConnected(event.detail);
    });
  }

  handleSwapCompleted(swapData) {
    const { inputAmount, outputAmount, inputToken, outputToken } = swapData;
    
    // Calculate USD value (simplified)
    const usdValue = this.calculateUSDValue(inputAmount, inputToken);
    
    // Update trading volume
    this.tradingVolume += usdValue;
    
    // Check achievements
    this.checkAchievements('swap', { usdValue, time: Date.now() });
    
    // Update rank
    this.updateRank();
    
    // Show celebration if achievement unlocked
    this.showSwapCelebration(usdValue);
    
    // Save data
    this.saveUserData();
  }

  handleLiquidityAdded(liquidityData) {
    const { amount, pool } = liquidityData;
    
    // Check liquidity achievements
    this.checkAchievements('liquidity', { amount, pool });
    
    // Save data
    this.saveUserData();
  }

  handleWalletConnected(walletData) {
    // Check if first time user
    if (this.achievements.size === 0) {
      this.showWelcomeMessage();
    }
  }

  checkAchievements(eventType, eventData) {
    const newAchievements = [];

    this.achievementTypes.forEach(achievement => {
      if (this.achievements.has(achievement.id)) return;

      let unlocked = false;

      switch (achievement.id) {
        case 'first_swap':
          unlocked = eventType === 'swap';
          break;

        case 'volume_1k':
          unlocked = this.tradingVolume >= 1000;
          break;

        case 'volume_10k':
          unlocked = this.tradingVolume >= 10000;
          break;

        case 'night_trader':
          if (eventType === 'swap') {
            const hour = new Date().getHours();
            unlocked = hour >= 0 && hour < 6;
          }
          break;

        case 'whale_trader':
          unlocked = eventType === 'swap' && eventData.usdValue >= 50000;
          break;

        // Add more achievement logic
      }

      if (unlocked) {
        this.achievements.add(achievement.id);
        newAchievements.push(achievement);
      }
    });

    // Show achievement notifications
    newAchievements.forEach(achievement => {
      this.showAchievementUnlocked(achievement);
    });
  }

  updateRank() {
    const currentRank = this.rankThresholds.findIndex(rank => 
      this.tradingVolume < rank.minVolume
    );
    
    const newRank = currentRank === -1 ? 
      this.rankThresholds.length - 1 : 
      Math.max(0, currentRank - 1);

    if (newRank > this.cultRank) {
      this.cultRank = newRank;
      this.userLevel = this.rankThresholds[newRank].name;
      this.showRankUpCelebration();
    }
  }

  showAchievementUnlocked(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
          <div class="achievement-points">+${achievement.points} XP</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Play sound effect
    this.playSoundEffect('achievement');

    // Emit event
    this.emitGamificationEvent('achievement-unlocked', achievement);
  }

  showRankUpCelebration() {
    const rankData = this.rankThresholds[this.cultRank];
    
    const celebration = document.createElement('div');
    celebration.className = 'rank-up-celebration';
    celebration.innerHTML = `
      <div class="rank-celebration-content">
        <div class="rank-icon">${rankData.icon}</div>
        <div class="rank-title">RANK UP!</div>
        <div class="rank-name" style="color: ${rankData.color}">${rankData.name}</div>
        <div class="rank-subtitle">You have ascended in the cult hierarchy</div>
      </div>
    `;

    document.body.appendChild(celebration);

    // Animate in
    setTimeout(() => celebration.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
      celebration.classList.remove('show');
      setTimeout(() => celebration.remove(), 300);
    }, 6000);

    // Play rank up sound
    this.playSoundEffect('rankup');

    // Update UI
    this.updateRankDisplay();

    // Emit event
    this.emitGamificationEvent('rank-up', rankData);
  }

  showSwapCelebration(usdValue) {
    if (usdValue < 100) return; // Only celebrate significant swaps

    const celebration = document.createElement('div');
    celebration.className = 'swap-celebration';
    celebration.innerHTML = `
      <div class="swap-celebration-content">
        <div class="swap-amount">$${this.formatNumber(usdValue)}</div>
        <div class="swap-text">SOULS TRADED</div>
        <div class="swap-particles"></div>
      </div>
    `;

    document.body.appendChild(celebration);

    // Create particles
    this.createCelebrationParticles(celebration.querySelector('.swap-particles'));

    // Animate in
    setTimeout(() => celebration.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
      celebration.classList.remove('show');
      setTimeout(() => celebration.remove(), 300);
    }, 3000);
  }

  createCelebrationParticles(container) {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.innerHTML = ['💀', '👻', '🌙', '⭐', '✨'][Math.floor(Math.random() * 5)];
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particle.style.animationDuration = (2 + Math.random() * 3) + 's';
      
      container.appendChild(particle);
    }
  }

  updateRankDisplay() {
    const rankElements = document.querySelectorAll('.cult-rank');
    const rankData = this.rankThresholds[this.cultRank];
    
    rankElements.forEach(element => {
      element.innerHTML = `
        <span class="rank-icon">${rankData.icon}</span>
        <span class="rank-name" style="color: ${rankData.color}">${rankData.name}</span>
      `;
    });

    // Update progress to next rank
    this.updateRankProgress();
  }

  updateRankProgress() {
    const currentRank = this.rankThresholds[this.cultRank];
    const nextRank = this.rankThresholds[this.cultRank + 1];
    
    if (nextRank) {
      const progress = (this.tradingVolume - currentRank.minVolume) / 
                     (nextRank.minVolume - currentRank.minVolume) * 100;
      
      const progressElements = document.querySelectorAll('.rank-progress');
      progressElements.forEach(element => {
        element.style.width = Math.min(100, Math.max(0, progress)) + '%';
      });

      const progressTexts = document.querySelectorAll('.rank-progress-text');
      progressTexts.forEach(element => {
        element.textContent = `${this.formatNumber(this.tradingVolume)} / ${this.formatNumber(nextRank.minVolume)}`;
      });
    }
  }

  calculateUSDValue(amount, token) {
    // Simplified USD calculation (would use real price data)
    const prices = {
      'SOL': 100,
      'USDC': 1,
      'USDT': 1,
      'RAY': 0.5,
      'SRM': 0.3
    };
    
    return amount * (prices[token] || 1);
  }

  playSoundEffect(type) {
    // Would play actual sound effects in production
    console.log(`🔊 Playing ${type} sound effect`);
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  showWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.className = 'cult-welcome';
    welcome.innerHTML = `
      <div class="welcome-content">
        <div class="welcome-icon">🌙</div>
        <div class="welcome-title">Welcome to the Cult</div>
        <div class="welcome-subtitle">Begin your journey in the NocturneSwap hierarchy</div>
        <div class="welcome-rank">Starting Rank: ${this.rankThresholds[0].icon} ${this.rankThresholds[0].name}</div>
      </div>
    `;

    document.body.appendChild(welcome);

    setTimeout(() => welcome.classList.add('show'), 100);
    setTimeout(() => {
      welcome.classList.remove('show');
      setTimeout(() => welcome.remove(), 300);
    }, 8000);
  }

  startPeriodicUpdates() {
    // Update every minute
    setInterval(() => {
      this.updateChallenges();
      this.updateLeaderboard();
    }, 60000);
  }

  updateChallenges() {
    // Update challenge progress
    this.emitGamificationEvent('challenges-updated', this.challenges);
  }

  updateLeaderboard() {
    // Update leaderboard data
    this.emitGamificationEvent('leaderboard-updated', this.leaderboard);
  }

  emitGamificationEvent(eventType, data) {
    const event = new CustomEvent(`nocturne-gamification-${eventType}`, {
      detail: data
    });
    window.dispatchEvent(event);
  }

  // Public API
  getUserStats() {
    return {
      level: this.userLevel,
      rank: this.cultRank,
      tradingVolume: this.tradingVolume,
      achievements: Array.from(this.achievements),
      achievementCount: this.achievements.size,
      totalAchievements: this.achievementTypes.length
    };
  }

  getRankInfo() {
    return this.rankThresholds[this.cultRank];
  }

  getNextRankInfo() {
    return this.rankThresholds[this.cultRank + 1] || null;
  }

  getAchievements() {
    return this.achievementTypes.map(achievement => ({
      ...achievement,
      unlocked: this.achievements.has(achievement.id)
    }));
  }
}

// Initialize gamification system
const cultGamification = new CultGamification();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CultGamification;
} else {
  window.CultGamification = CultGamification;
  window.cultGamification = cultGamification;
}

import React, { useState, useEffect, useCallback } from 'react';
import { useAdvancedTrading } from '../contexts/AdvancedTradingContext';
import { useGamification } from '../contexts/GamificationContext';
import './AdvancedPortfolioAnalytics.css';

interface PerformanceMetric {
  label: string;
  value: string | number;
  change?: number;
  trend: 'up' | 'down' | 'neutral';
  format: 'currency' | 'percentage' | 'number';
}

interface RiskMetric {
  label: string;
  value: number;
  threshold: number;
  status: 'safe' | 'warning' | 'danger';
  description: string;
}

export const AdvancedPortfolioAnalytics: React.FC = () => {
  const { portfolioAnalytics, tradingBots, limitOrders, dcaOrders, refreshAnalytics } = useAdvancedTrading();
  const { awardXP } = useGamification();
  
  const [activeView, setActiveView] = useState<'overview' | 'performance' | 'risk' | 'allocation'>('overview');
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '30D' | '90D' | '1Y'>('30D');
  const [showExportModal, setShowExportModal] = useState(false);

  // Performance metrics calculation
  const performanceMetrics: PerformanceMetric[] = portfolioAnalytics ? [
    {
      label: 'Total Portfolio Value',
      value: portfolioAnalytics.totalValue,
      trend: portfolioAnalytics.totalPnL >= 0 ? 'up' : 'down',
      format: 'currency'
    },
    {
      label: 'Total P&L',
      value: portfolioAnalytics.totalPnL,
      change: portfolioAnalytics.totalPnLPercentage,
      trend: portfolioAnalytics.totalPnL >= 0 ? 'up' : 'down',
      format: 'currency'
    },
    {
      label: 'Win Rate',
      value: portfolioAnalytics.winRate,
      trend: portfolioAnalytics.winRate >= 60 ? 'up' : portfolioAnalytics.winRate >= 40 ? 'neutral' : 'down',
      format: 'percentage'
    },
    {
      label: 'Sharpe Ratio',
      value: portfolioAnalytics.sharpeRatio,
      trend: portfolioAnalytics.sharpeRatio >= 1.5 ? 'up' : portfolioAnalytics.sharpeRatio >= 1 ? 'neutral' : 'down',
      format: 'number'
    },
    {
      label: 'Max Drawdown',
      value: Math.abs(portfolioAnalytics.maxDrawdown),
      trend: Math.abs(portfolioAnalytics.maxDrawdown) <= 10 ? 'up' : Math.abs(portfolioAnalytics.maxDrawdown) <= 20 ? 'neutral' : 'down',
      format: 'percentage'
    },
    {
      label: 'Total Trades',
      value: portfolioAnalytics.totalTrades,
      trend: 'neutral',
      format: 'number'
    }
  ] : [];

  // Risk metrics calculation
  const riskMetrics: RiskMetric[] = portfolioAnalytics ? [
    {
      label: 'Portfolio Concentration Risk',
      value: Math.max(...portfolioAnalytics.holdings.map(h => h.allocation)),
      threshold: 50,
      status: Math.max(...portfolioAnalytics.holdings.map(h => h.allocation)) > 50 ? 'danger' : 
              Math.max(...portfolioAnalytics.holdings.map(h => h.allocation)) > 30 ? 'warning' : 'safe',
      description: 'Maximum allocation to single asset'
    },
    {
      label: 'Volatility Risk',
      value: Math.abs(portfolioAnalytics.maxDrawdown),
      threshold: 20,
      status: Math.abs(portfolioAnalytics.maxDrawdown) > 20 ? 'danger' : 
              Math.abs(portfolioAnalytics.maxDrawdown) > 10 ? 'warning' : 'safe',
      description: 'Historical maximum drawdown'
    },
    {
      label: 'Win Rate Stability',
      value: portfolioAnalytics.winRate,
      threshold: 40,
      status: portfolioAnalytics.winRate < 40 ? 'danger' : 
              portfolioAnalytics.winRate < 60 ? 'warning' : 'safe',
      description: 'Percentage of profitable trades'
    },
    {
      label: 'Sharpe Ratio Quality',
      value: portfolioAnalytics.sharpeRatio * 100,
      threshold: 100,
      status: portfolioAnalytics.sharpeRatio < 1 ? 'danger' : 
              portfolioAnalytics.sharpeRatio < 1.5 ? 'warning' : 'safe',
      description: 'Risk-adjusted return quality'
    }
  ] : [];

  // Export portfolio data
  const handleExportData = useCallback((format: 'CSV' | 'JSON' | 'PDF') => {
    if (!portfolioAnalytics) return;

    const data = {
      exportDate: new Date().toISOString(),
      timeframe,
      portfolio: portfolioAnalytics,
      tradingBots: tradingBots.map(bot => ({
        name: bot.name,
        strategy: bot.strategy,
        status: bot.status,
        profitLoss: bot.profitLoss,
        trades: bot.trades,
        winRate: bot.winRate
      })),
      activeOrders: {
        limitOrders: limitOrders.filter(o => o.status === 'pending').length,
        dcaOrders: dcaOrders.filter(o => o.status === 'active').length
      }
    };

    if (format === 'JSON') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'CSV') {
      // Create CSV content
      const csvHeaders = ['Metric', 'Value', 'Percentage'];
      const csvRows = [
        ['Total Value', `$${portfolioAnalytics.totalValue.toFixed(2)}`, ''],
        ['Total P&L', `$${portfolioAnalytics.totalPnL.toFixed(2)}`, `${portfolioAnalytics.totalPnLPercentage.toFixed(2)}%`],
        ['Win Rate', `${portfolioAnalytics.winRate}%`, ''],
        ['Total Trades', portfolioAnalytics.totalTrades.toString(), ''],
        ['Best Trade', `$${portfolioAnalytics.bestTrade.toFixed(2)}`, ''],
        ['Worst Trade', `$${portfolioAnalytics.worstTrade.toFixed(2)}`, ''],
        ['Sharpe Ratio', portfolioAnalytics.sharpeRatio.toString(), ''],
        ['Max Drawdown', `${portfolioAnalytics.maxDrawdown}%`, ''],
        ...portfolioAnalytics.holdings.map(h => [
          `${h.token} Holdings`,
          `${h.amount.toFixed(4)} (${h.allocation}%)`,
          `${h.pnlPercentage.toFixed(2)}%`
        ])
      ];

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Award XP for data export
    awardXP(75, 'Exported portfolio analytics');
    setShowExportModal(false);
  }, [portfolioAnalytics, tradingBots, limitOrders, dcaOrders, timeframe, awardXP]);

  // Format value helper
  const formatValue = (value: string | number, format: 'currency' | 'percentage' | 'number') => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  // Overview Tab
  const OverviewTab = () => (
    <div className="analytics-overview">
      <div className="metrics-grid">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className={`metric-card ${metric.trend}`}>
            <div className="metric-header">
              <span className="metric-label">{metric.label}</span>
              <span className={`trend-indicator ${metric.trend}`}>
                {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '➡️'}
              </span>
            </div>
            <div className="metric-value">
              {formatValue(metric.value, metric.format)}
            </div>
            {metric.change !== undefined && (
              <div className={`metric-change ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(2)}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="charts-section">
        <div className="allocation-chart">
          <h3>Portfolio Allocation</h3>
          <div className="pie-chart-container">
            {portfolioAnalytics?.holdings.map((holding, index) => (
              <div key={holding.token} className="allocation-item">
                <div className="allocation-color" style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }} />
                <span className="allocation-token">{holding.token}</span>
                <span className="allocation-percentage">{holding.allocation}%</span>
                <span className={`allocation-pnl ${holding.pnl >= 0 ? 'positive' : 'negative'}`}>
                  {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Performance Tab
  const PerformanceTab = () => (
    <div className="performance-analysis">
      <div className="timeframe-selector">
        {(['1D', '7D', '30D', '90D', '1Y'] as const).map(tf => (
          <button
            key={tf}
            className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="performance-metrics">
        <div className="performance-summary">
          <h3>Performance Summary ({timeframe})</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Return</span>
              <span className={`summary-value ${portfolioAnalytics?.totalPnLPercentage >= 0 ? 'positive' : 'negative'}`}>
                {portfolioAnalytics?.totalPnLPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Volatility</span>
              <span className="summary-value">{Math.abs(portfolioAnalytics?.maxDrawdown || 0).toFixed(2)}%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Sharpe</span>
              <span className="summary-value">{portfolioAnalytics?.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Max DD</span>
              <span className="summary-value negative">{portfolioAnalytics?.maxDrawdown.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="trade-breakdown">
          <h3>Trade Analysis</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <span className="breakdown-label">Best Trade</span>
              <span className="breakdown-value positive">+${portfolioAnalytics?.bestTrade.toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Worst Trade</span>
              <span className="breakdown-value negative">${portfolioAnalytics?.worstTrade.toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Avg Trade Size</span>
              <span className="breakdown-value">${portfolioAnalytics?.avgTradeSize.toFixed(2)}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Win Rate</span>
              <span className="breakdown-value">{portfolioAnalytics?.winRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Risk Tab
  const RiskTab = () => (
    <div className="risk-analysis">
      <h3>Risk Assessment</h3>
      <div className="risk-metrics">
        {riskMetrics.map((risk, index) => (
          <div key={index} className={`risk-metric ${risk.status}`}>
            <div className="risk-header">
              <span className="risk-label">{risk.label}</span>
              <span className={`risk-status ${risk.status}`}>
                {risk.status === 'safe' ? '✅' : risk.status === 'warning' ? '⚠️' : '❌'}
              </span>
            </div>
            <div className="risk-content">
              <div className="risk-value">
                {risk.value.toFixed(2)}%
              </div>
              <div className="risk-threshold">
                Threshold: {risk.threshold}%
              </div>
              <div className="risk-description">
                {risk.description}
              </div>
            </div>
            <div className="risk-bar">
              <div 
                className={`risk-fill ${risk.status}`}
                style={{ width: `${Math.min((risk.value / risk.threshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Allocation Tab
  const AllocationTab = () => (
    <div className="allocation-analysis">
      <h3>Asset Allocation Breakdown</h3>
      <div className="allocation-details">
        {portfolioAnalytics?.holdings.map((holding, index) => (
          <div key={holding.token} className="allocation-detail-card">
            <div className="allocation-header">
              <div className="allocation-token-info">
                <span className="allocation-token-name">{holding.token}</span>
                <span className="allocation-percentage-large">{holding.allocation}%</span>
              </div>
              <div className={`allocation-pnl-large ${holding.pnl >= 0 ? 'positive' : 'negative'}`}>
                {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(2)} ({holding.pnlPercentage.toFixed(2)}%)
              </div>
            </div>
            <div className="allocation-details-grid">
              <div className="allocation-detail">
                <span className="detail-label">Amount</span>
                <span className="detail-value">{holding.amount.toFixed(4)}</span>
              </div>
              <div className="allocation-detail">
                <span className="detail-label">Value</span>
                <span className="detail-value">${holding.value.toFixed(2)}</span>
              </div>
              <div className="allocation-detail">
                <span className="detail-label">Allocation</span>
                <span className="detail-value">{holding.allocation}%</span>
              </div>
            </div>
            <div className="allocation-bar">
              <div 
                className="allocation-fill"
                style={{ 
                  width: `${holding.allocation}%`,
                  backgroundColor: `hsl(${index * 45}, 70%, 60%)`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!portfolioAnalytics) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Loading portfolio analytics...</p>
      </div>
    );
  }

  return (
    <div className="advanced-portfolio-analytics">
      <div className="analytics-header">
        <h2>📊 Advanced Portfolio Analytics</h2>
        <div className="analytics-controls">
          <button className="refresh-btn" onClick={refreshAnalytics}>
            🔄 Refresh
          </button>
          <button className="export-btn" onClick={() => setShowExportModal(true)}>
            📥 Export
          </button>
        </div>
      </div>

      <div className="analytics-nav">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'performance', label: 'Performance', icon: '📈' },
          { id: 'risk', label: 'Risk', icon: '⚠️' },
          { id: 'allocation', label: 'Allocation', icon: '🥧' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`analytics-nav-btn ${activeView === tab.id ? 'active' : ''}`}
            onClick={() => setActiveView(tab.id as any)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="analytics-content">
        {activeView === 'overview' && <OverviewTab />}
        {activeView === 'performance' && <PerformanceTab />}
        {activeView === 'risk' && <RiskTab />}
        {activeView === 'allocation' && <AllocationTab />}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            <h3>Export Portfolio Data</h3>
            <p>Choose the format for your portfolio analytics export:</p>
            <div className="export-options">
              <button 
                className="export-option"
                onClick={() => handleExportData('JSON')}
              >
                📄 JSON Format
                <span className="export-description">Complete data with all details</span>
              </button>
              <button 
                className="export-option"
                onClick={() => handleExportData('CSV')}
              >
                📊 CSV Format
                <span className="export-description">Spreadsheet compatible</span>
              </button>
            </div>
            <button className="modal-close" onClick={() => setShowExportModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

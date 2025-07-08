// SecurityModal.tsx - Security warnings and transaction simulation display
import React, { useState, useEffect } from 'react';
import { cultSounds } from '../SoundEffects.js';
import { securityManager } from '../Security.js';
import './SecurityModal.css';

interface SecurityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onProceed: () => void;
  simulation: any;
  inputToken: any;
  outputToken: any;
  amount: string;
}

const SecurityModal = ({ 
  isVisible, 
  onClose, 
  onProceed, 
  simulation, 
  inputToken, 
  outputToken,
  amount 
}: SecurityModalProps) => {
  const [rugPullRisk, setRugPullRisk] = useState(null);
  const [whaleActivity, setWhaleActivity] = useState(null);
  const [mevSettings, setMevSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isVisible && outputToken) {
      loadSecurityData();
    }
  }, [isVisible, outputToken]);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      // Load additional security data
      const [rugRisk, whales, mev] = await Promise.all([
        securityManager.checkRugPullRisk(outputToken),
        securityManager.detectWhaleActivity(outputToken),
        securityManager.getMEVProtectionSettings(
          await securityManager.getUSDValue(inputToken.symbol, amount),
          simulation?.slippage || 1.0
        )
      ]);

      setRugPullRisk(rugRisk);
      setWhaleActivity(whales);
      setMevSettings(mev);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff3232';
      case 'warning': return '#ffa500';
      case 'info': return '#64b5f6';
      default: return '#cccccc';
    }
  };

  const getRiskIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const handleProceed = async () => {
    await cultSounds.playConnectSound();
    onProceed();
  };

  const handleCancel = async () => {
    await cultSounds.playHoverSound();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="security-modal-overlay">
      <div className="security-modal">
        <div className="security-header">
          <h3>🛡️ Security Analysis</h3>
          <button 
            className="security-close"
            onClick={handleCancel}
          >
            ✕
          </button>
        </div>

        <div className="security-content">
          {isLoading ? (
            <div className="security-loading">
              <div className="loading-spinner"></div>
              <p>Analyzing transaction security...</p>
            </div>
          ) : (
            <>
              {/* Simulation Results */}
              {simulation && (
                <div className="simulation-section">
                  <h4>📊 Transaction Simulation</h4>
                  <div className="simulation-summary">
                    <div className="sim-item">
                      <span>Expected Output:</span>
                      <span>{(simulation.estimatedOutput / 1000000).toFixed(6)} {outputToken.symbol}</span>
                    </div>
                    <div className="sim-item">
                      <span>Slippage:</span>
                      <span className={simulation.slippage > 2 ? 'high-risk' : 'normal'}>
                        {simulation.slippage?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="sim-item">
                      <span>Price Impact:</span>
                      <span className={simulation.priceImpact > 3 ? 'high-risk' : 'normal'}>
                        {simulation.priceImpact?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="sim-item">
                      <span>Minimum Received:</span>
                      <span>{(simulation.minimumReceived / 1000000).toFixed(6)} {outputToken.symbol}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Warnings */}
              {simulation?.warnings?.length > 0 && (
                <div className="warnings-section">
                  <h4>⚠️ Warnings</h4>
                  {simulation.warnings.map((warning: any, index: number) => (
                    <div 
                      key={index}
                      className={`warning-item ${warning.severity}`}
                      style={{ borderColor: getRiskColor(warning.severity) }}
                    >
                      <span className="warning-icon">{getRiskIcon(warning.severity)}</span>
                      <span className="warning-message">{warning.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Critical Risks */}
              {simulation?.risks?.length > 0 && (
                <div className="risks-section">
                  <h4>🚨 Critical Risks</h4>
                  {simulation.risks.map((risk: any, index: number) => (
                    <div 
                      key={index}
                      className={`risk-item ${risk.severity}`}
                      style={{ borderColor: getRiskColor(risk.severity) }}
                    >
                      <span className="risk-icon">{getRiskIcon(risk.severity)}</span>
                      <span className="risk-message">{risk.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rug Pull Risk Assessment */}
              {rugPullRisk && (
                <div className="rug-risk-section">
                  <h4>🔍 Token Safety Analysis</h4>
                  <div className="risk-score">
                    <div className="risk-meter">
                      <div 
                        className="risk-fill"
                        style={{ 
                          width: `${rugPullRisk.riskScore}%`,
                          backgroundColor: rugPullRisk.riskLevel === 'critical' ? '#ff3232' :
                                         rugPullRisk.riskLevel === 'high' ? '#ffa500' :
                                         rugPullRisk.riskLevel === 'medium' ? '#ffeb3b' : '#4caf50'
                        }}
                      ></div>
                    </div>
                    <div className="risk-details">
                      <span>Risk Level: <strong className={rugPullRisk.riskLevel}>{rugPullRisk.riskLevel.toUpperCase()}</strong></span>
                      <span>Score: {rugPullRisk.riskScore}/100</span>
                    </div>
                  </div>
                  
                  {rugPullRisk.factors.length > 0 && (
                    <div className="risk-factors">
                      <h5>Risk Factors:</h5>
                      {rugPullRisk.factors.map((factor: string, index: number) => (
                        <div key={index} className="risk-factor">
                          ❌ {factor}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="risk-recommendation">
                    {rugPullRisk.recommendation}
                  </div>
                </div>
              )}

              {/* Whale Activity */}
              {whaleActivity?.detected && (
                <div className="whale-section">
                  <h4>🐋 Whale Activity Detected</h4>
                  <div className="whale-details">
                    <p>{whaleActivity.trades.length} large trades in the last hour</p>
                    <p>Impact Score: {whaleActivity.impact.toFixed(1)}</p>
                    {whaleActivity.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="whale-recommendation">
                        💡 {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Security Settings */}
              <div className="advanced-toggle">
                <button 
                  className="toggle-advanced"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? '▼' : '▶'} Advanced Security Settings
                </button>
              </div>

              {showAdvanced && mevSettings && (
                <div className="mev-section">
                  <h4>⚡ MEV Protection</h4>
                  <div className="mev-settings">
                    <div className="mev-item">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={mevSettings.usePrivateMempool}
                          readOnly
                        />
                        Use Private Mempool
                      </label>
                    </div>
                    <div className="mev-item">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={mevSettings.bundleTransaction}
                          readOnly
                        />
                        Bundle Transaction
                      </label>
                    </div>
                    <div className="mev-detail">
                      <span>Optimal Priority Fee: {mevSettings.priorityFee} SOL</span>
                    </div>
                    <div className="mev-detail">
                      <span>Max Slippage: {mevSettings.maxSlippage}%</span>
                    </div>
                  </div>
                  
                  {mevSettings.recommendations.length > 0 && (
                    <div className="mev-recommendations">
                      {mevSettings.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="mev-recommendation">
                          💡 {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {simulation?.recommendations?.length > 0 && (
                <div className="recommendations-section">
                  <h4>💡 Recommendations</h4>
                  {simulation.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="recommendation-item">
                      ✨ {rec.message}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="security-actions">
          <button 
            className="cancel-btn"
            onClick={handleCancel}
          >
            ❌ Cancel Transaction
          </button>
          <button 
            className="proceed-btn"
            onClick={handleProceed}
            disabled={isLoading || (rugPullRisk?.riskLevel === 'critical')}
          >
            {rugPullRisk?.riskLevel === 'critical' ? 
              '🚫 Too Risky' : 
              '✅ Proceed with Caution'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;

import React, { useState, useEffect } from 'react';
import './SecurityModal.css';

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  action?: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  transactionLimits: {
    daily: number;
    perTransaction: number;
  };
  autoLockEnabled: boolean;
  autoLockTimeout: number;
  whitelistedAddresses: string[];
  suspiciousActivityDetection: boolean;
}

interface SecurityProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecurityModal: React.FC<SecurityProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings' | 'audit'>('alerts');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    transactionLimits: {
      daily: 50000,
      perTransaction: 10000
    },
    autoLockEnabled: true,
    autoLockTimeout: 15,
    whitelistedAddresses: [],
    suspiciousActivityDetection: true
  });
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [newWhitelistAddress, setNewWhitelistAddress] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadSecurityData();
    }
  }, [isOpen]);

  const loadSecurityData = () => {
    // Mock security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: 'alert-001',
        type: 'warning',
        title: 'Unusual Trading Pattern Detected',
        message: 'Large volume trades detected from your account. If this was not you, please review your account security.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: 'Review Activity'
      },
      {
        id: 'alert-002',
        type: 'info',
        title: 'Security Audit Completed',
        message: 'Monthly security audit completed successfully. No vulnerabilities found.',
        severity: 'low',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'alert-003',
        type: 'success',
        title: 'Two-Factor Authentication Recommended',
        message: 'Enable 2FA for enhanced account security and additional protection.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Enable 2FA'
      }
    ];
    
    setAlerts(mockAlerts);

    // Mock audit log
    const mockAuditLog = [
      {
        id: 'audit-001',
        action: 'Login',
        details: 'Successful login from 192.168.1.100',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: 'audit-002',
        action: 'Transaction',
        details: 'Swap 10 SOL for 1,423.50 USDC',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: 'audit-003',
        action: 'Settings Change',
        details: 'Transaction limit updated to $10,000',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: 'audit-004',
        action: 'Failed Login',
        details: 'Failed login attempt from unknown IP',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'warning'
      }
    ];
    
    setAuditLog(mockAuditLog);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateTransactionLimit = (type: 'daily' | 'perTransaction', value: number) => {
    setSettings(prev => ({
      ...prev,
      transactionLimits: {
        ...prev.transactionLimits,
        [type]: value
      }
    }));
  };

  const addWhitelistAddress = () => {
    if (newWhitelistAddress && !settings.whitelistedAddresses.includes(newWhitelistAddress)) {
      setSettings(prev => ({
        ...prev,
        whitelistedAddresses: [...prev.whitelistedAddresses, newWhitelistAddress]
      }));
      setNewWhitelistAddress('');
    }
  };

  const removeWhitelistAddress = (address: string) => {
    setSettings(prev => ({
      ...prev,
      whitelistedAddresses: prev.whitelistedAddresses.filter(addr => addr !== address)
    }));
  };

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '🔒';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffaa00';
      case 'low': return '#00aa00';
      default: return '#888888';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (!isOpen) return null;

  return (
    <div className="security-modal-overlay">
      <div className="security-modal holo-card">
        <div className="modal-header">
          <h2 className="holo-text">🛡️ Security Center</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          {(['alerts', 'settings', 'audit'] as const).map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'alerts' && '🚨'} 
              {tab === 'settings' && '⚙️'} 
              {tab === 'audit' && '📜'} 
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-content">
          {/* Security Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="alerts-tab">
              <div className="tab-header">
                <h3 className="ember-glow">Security Alerts</h3>
                <span className="alert-count">{alerts.length} active</span>
              </div>
              
              <div className="alerts-list">
                {alerts.length === 0 ? (
                  <div className="no-alerts">
                    <div className="no-alerts-icon">🛡️</div>
                    <h4>All Clear!</h4>
                    <p>No security alerts at this time.</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className={`alert-item ${alert.type}`}>
                      <div className="alert-icon">
                        {getAlertIcon(alert.type, alert.severity)}
                      </div>
                      <div className="alert-content">
                        <div className="alert-header">
                          <h4 className="alert-title">{alert.title}</h4>
                          <div className="alert-meta">
                            <span 
                              className="alert-severity"
                              style={{ color: getSeverityColor(alert.severity) }}
                            >
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="alert-time">
                              {formatTimeAgo(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="alert-message">{alert.message}</p>
                        <div className="alert-actions">
                          {alert.action && (
                            <button className="alert-action-btn">
                              {alert.action}
                            </button>
                          )}
                          <button 
                            className="dismiss-btn"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="tab-header">
                <h3 className="ember-glow">Security Settings</h3>
              </div>

              <div className="settings-sections">
                {/* Authentication */}
                <div className="settings-section">
                  <h4>Authentication</h4>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Two-Factor Authentication</label>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorEnabled}
                        onChange={(e) => updateSettings('twoFactorEnabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Transaction Limits */}
                <div className="settings-section">
                  <h4>Transaction Limits</h4>
                  <div className="setting-item">
                    <label>Daily Limit ($)</label>
                    <input
                      type="number"
                      className="holo-input"
                      value={settings.transactionLimits.daily}
                      onChange={(e) => updateTransactionLimit('daily', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="setting-item">
                    <label>Per Transaction Limit ($)</label>
                    <input
                      type="number"
                      className="holo-input"
                      value={settings.transactionLimits.perTransaction}
                      onChange={(e) => updateTransactionLimit('perTransaction', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Auto-Lock */}
                <div className="settings-section">
                  <h4>Auto-Lock</h4>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Enable Auto-Lock</label>
                      <p>Automatically lock wallet after inactivity</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.autoLockEnabled}
                        onChange={(e) => updateSettings('autoLockEnabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  {settings.autoLockEnabled && (
                    <div className="setting-item">
                      <label>Auto-Lock Timeout (minutes)</label>
                      <input
                        type="number"
                        className="holo-input"
                        value={settings.autoLockTimeout}
                        onChange={(e) => updateSettings('autoLockTimeout', parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>

                {/* Whitelisted Addresses */}
                <div className="settings-section">
                  <h4>Whitelisted Addresses</h4>
                  <div className="whitelist-input">
                    <input
                      type="text"
                      className="holo-input"
                      placeholder="Enter Solana address"
                      value={newWhitelistAddress}
                      onChange={(e) => setNewWhitelistAddress(e.target.value)}
                    />
                    <button className="glow-btn" onClick={addWhitelistAddress}>
                      Add
                    </button>
                  </div>
                  <div className="whitelist-addresses">
                    {settings.whitelistedAddresses.map((address, index) => (
                      <div key={index} className="whitelist-item">
                        <span className="address">{address.slice(0, 8)}...{address.slice(-8)}</span>
                        <button 
                          className="remove-btn"
                          onClick={() => removeWhitelistAddress(address)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monitoring */}
                <div className="settings-section">
                  <h4>Monitoring</h4>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Suspicious Activity Detection</label>
                      <p>Monitor for unusual trading patterns</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.suspiciousActivityDetection}
                        onChange={(e) => updateSettings('suspiciousActivityDetection', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button className="glow-btn">Save Settings</button>
                <button className="glow-btn secondary">Reset to Default</button>
              </div>
            </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <div className="audit-tab">
              <div className="tab-header">
                <h3 className="ember-glow">Audit Log</h3>
                <button className="glow-btn">Export Log</button>
              </div>

              <div className="audit-log">
                {auditLog.map(entry => (
                  <div key={entry.id} className={`audit-entry ${entry.status}`}>
                    <div className="audit-timestamp">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                    <div className="audit-content">
                      <div className="audit-action">{entry.action}</div>
                      <div className="audit-details">{entry.details}</div>
                    </div>
                    <div className={`audit-status ${entry.status}`}>
                      {entry.status === 'success' && '✅'}
                      {entry.status === 'warning' && '⚠️'}
                      {entry.status === 'error' && '❌'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;

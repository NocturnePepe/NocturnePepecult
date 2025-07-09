import React, { useState, useEffect } from 'react';
import './AdminAccessControl.css';

interface AccessRule {
  id: string;
  name: string;
  resource: string;
  action: 'read' | 'write' | 'execute' | 'admin';
  conditions: string[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  createdBy: string;
}

interface AccessLog {
  id: string;
  userId: string;
  userAddress: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'granted' | 'denied';
  reason?: string;
  ipAddress: string;
  userAgent: string;
}

interface SystemPermission {
  id: string;
  name: string;
  description: string;
  category: 'trading' | 'admin' | 'security' | 'analytics' | 'governance';
  level: 'basic' | 'advanced' | 'admin' | 'super_admin';
  isSystemCritical: boolean;
}

const AdminAccessControl: React.FC = () => {
  const [accessRules, setAccessRules] = useState<AccessRule[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [systemPermissions, setSystemPermissions] = useState<SystemPermission[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'logs' | 'permissions' | 'security'>('rules');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRule, setShowCreateRule] = useState(false);

  useEffect(() => {
    loadAccessControlData();
  }, []);

  const loadAccessControlData = () => {
    // Mock access rules
    const mockRules: AccessRule[] = [
      {
        id: 'rule-001',
        name: 'Admin Dashboard Access',
        resource: '/admin/*',
        action: 'read',
        conditions: ['role:admin', 'mfa:enabled'],
        isActive: true,
        priority: 1,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'system'
      },
      {
        id: 'rule-002',
        name: 'Token Management',
        resource: '/admin/tokens',
        action: 'write',
        conditions: ['role:admin', 'permission:manage_tokens', 'ip_whitelist:enabled'],
        isActive: true,
        priority: 2,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'ADm1n...7X9pQ'
      },
      {
        id: 'rule-003',
        name: 'User Management',
        resource: '/admin/users',
        action: 'admin',
        conditions: ['role:admin', 'permission:manage_users', 'session_timeout:30'],
        isActive: true,
        priority: 3,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'ADm1n...7X9pQ'
      },
      {
        id: 'rule-004',
        name: 'Analytics Read Access',
        resource: '/analytics/*',
        action: 'read',
        conditions: ['role:moderator|admin|vip', 'subscription:premium'],
        isActive: true,
        priority: 5,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'M0d3r...4K2nF'
      },
      {
        id: 'rule-005',
        name: 'Security Center Access',
        resource: '/security',
        action: 'execute',
        conditions: ['role:admin', 'permission:security_access', 'time_restriction:business_hours'],
        isActive: false,
        priority: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'ADm1n...7X9pQ'
      }
    ];

    // Mock access logs
    const mockLogs: AccessLog[] = [
      {
        id: 'log-001',
        userId: 'user-001',
        userAddress: 'ADm1n...7X9pQ',
        action: 'READ',
        resource: '/admin/dashboard',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'granted',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'log-002',
        userId: 'user-003',
        userAddress: 'V1P9s...8L3mR',
        action: 'READ',
        resource: '/analytics/trading',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'granted',
        ipAddress: '10.0.1.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'log-003',
        userId: 'user-999',
        userAddress: 'Unknown...User',
        action: 'WRITE',
        resource: '/admin/tokens',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'denied',
        reason: 'Insufficient permissions',
        ipAddress: '203.0.113.42',
        userAgent: 'curl/7.68.0'
      },
      {
        id: 'log-004',
        userId: 'user-002',
        userAddress: 'M0d3r...4K2nF',
        action: 'ADMIN',
        resource: '/admin/users',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'granted',
        ipAddress: '172.16.0.10',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      },
      {
        id: 'log-005',
        userId: 'user-888',
        userAddress: 'Susp1c...i0us',
        action: 'EXECUTE',
        resource: '/security/settings',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'denied',
        reason: 'Rule not active',
        ipAddress: '198.51.100.23',
        userAgent: 'Python-requests/2.28.1'
      }
    ];

    // Mock system permissions
    const mockPermissions: SystemPermission[] = [
      {
        id: 'perm-001',
        name: 'Manage Tokens',
        description: 'Create, edit, and remove token listings',
        category: 'admin',
        level: 'admin',
        isSystemCritical: true
      },
      {
        id: 'perm-002',
        name: 'Manage Users',
        description: 'Add, remove, and modify user accounts and roles',
        category: 'admin',
        level: 'super_admin',
        isSystemCritical: true
      },
      {
        id: 'perm-003',
        name: 'View Analytics',
        description: 'Access to trading and platform analytics',
        category: 'analytics',
        level: 'basic',
        isSystemCritical: false
      },
      {
        id: 'perm-004',
        name: 'Security Management',
        description: 'Configure security settings and policies',
        category: 'security',
        level: 'super_admin',
        isSystemCritical: true
      },
      {
        id: 'perm-005',
        name: 'Advanced Trading',
        description: 'Access to advanced trading features',
        category: 'trading',
        level: 'advanced',
        isSystemCritical: false
      },
      {
        id: 'perm-006',
        name: 'Governance Voting',
        description: 'Participate in platform governance',
        category: 'governance',
        level: 'basic',
        isSystemCritical: false
      }
    ];

    setAccessRules(mockRules);
    setAccessLogs(mockLogs);
    setSystemPermissions(mockPermissions);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'read': return '#4ade80';
      case 'write': return '#fbbf24';
      case 'execute': return '#f59e0b';
      case 'admin': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return '#4ade80';
      case 'denied': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return '#4ade80';
      case 'advanced': return '#fbbf24';
      case 'admin': return '#f59e0b';
      case 'super_admin': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const toggleRule = (ruleId: string) => {
    setAccessRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
  };

  const filteredLogs = accessLogs.filter(log => {
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesSearch = log.userAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="admin-access-control">
      <div className="access-header">
        <div className="header-content">
          <h1 className="ember-glow">🔐 Admin Access Control</h1>
          <p>Manage access rules, permissions, and security policies</p>
        </div>
        <button 
          className="glow-btn"
          onClick={() => setShowCreateRule(true)}
        >
          Create Rule
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="access-tabs">
        {(['rules', 'logs', 'permissions', 'security'] as const).map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'rules' && '📋 Access Rules'}
            {tab === 'logs' && '📊 Access Logs'}
            {tab === 'permissions' && '🔑 Permissions'}
            {tab === 'security' && '🛡️ Security'}
          </button>
        ))}
      </div>

      {/* Access Rules Tab */}
      {activeTab === 'rules' && (
        <div className="rules-content">
          <div className="rules-grid">
            {accessRules.map(rule => (
              <div key={rule.id} className="rule-card holo-card">
                <div className="rule-header">
                  <div className="rule-info">
                    <h3>{rule.name}</h3>
                    <span className="rule-resource">{rule.resource}</span>
                  </div>
                  <div className="rule-controls">
                    <span 
                      className="action-badge"
                      style={{ backgroundColor: getActionColor(rule.action) }}
                    >
                      {rule.action.toUpperCase()}
                    </span>
                    <button
                      className={`status-toggle ${rule.isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleRule(rule.id)}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <div className="rule-details">
                  <div className="detail-item">
                    <span>Priority:</span>
                    <span className="priority">{rule.priority}</span>
                  </div>
                  <div className="detail-item">
                    <span>Created:</span>
                    <span>{formatTimestamp(rule.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span>Created By:</span>
                    <span>{truncateAddress(rule.createdBy)}</span>
                  </div>
                </div>

                <div className="rule-conditions">
                  <h4>Conditions:</h4>
                  <div className="conditions-list">
                    {rule.conditions.map((condition, index) => (
                      <span key={index} className="condition-tag">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rule-actions">
                  <button className="edit-btn">Edit</button>
                  <button className="duplicate-btn">Duplicate</button>
                  <button className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access Logs Tab */}
      {activeTab === 'logs' && (
        <div className="logs-content">
          <div className="logs-filters holo-card">
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="holo-select"
              >
                <option value="all">All Status</option>
                <option value="granted">Granted</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="holo-input"
              />
            </div>
          </div>

          <div className="logs-table holo-card">
            <div className="table-header">
              <div>Timestamp</div>
              <div>User</div>
              <div>Action</div>
              <div>Resource</div>
              <div>Status</div>
              <div>IP Address</div>
            </div>
            {filteredLogs.map(log => (
              <div key={log.id} className="table-row">
                <div className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </div>
                <div className="log-user">
                  {truncateAddress(log.userAddress)}
                </div>
                <div 
                  className="log-action"
                  style={{ color: getActionColor(log.action) }}
                >
                  {log.action}
                </div>
                <div className="log-resource">
                  {log.resource}
                </div>
                <div 
                  className="log-status"
                  style={{ color: getStatusColor(log.status) }}
                >
                  {log.status.toUpperCase()}
                  {log.reason && (
                    <div className="log-reason">
                      {log.reason}
                    </div>
                  )}
                </div>
                <div className="log-ip">
                  {log.ipAddress}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="permissions-content">
          <div className="permissions-grid">
            {systemPermissions.map(permission => (
              <div key={permission.id} className="permission-card holo-card">
                <div className="permission-header">
                  <div className="permission-info">
                    <h3>{permission.name}</h3>
                    <span className={`permission-category ${permission.category}`}>
                      {permission.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="permission-badges">
                    <span 
                      className="level-badge"
                      style={{ backgroundColor: getLevelColor(permission.level) }}
                    >
                      {permission.level.replace('_', ' ').toUpperCase()}
                    </span>
                    {permission.isSystemCritical && (
                      <span className="critical-badge">
                        🔴 CRITICAL
                      </span>
                    )}
                  </div>
                </div>

                <div className="permission-description">
                  {permission.description}
                </div>

                <div className="permission-actions">
                  <button className="edit-permission-btn">Edit</button>
                  <button className="view-usage-btn">View Usage</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="security-content">
          <div className="security-overview holo-card">
            <h3 className="ember-glow">Security Overview</h3>
            <div className="security-metrics">
              <div className="security-metric">
                <span className="metric-icon">🛡️</span>
                <div className="metric-content">
                  <div className="metric-label">Active Rules</div>
                  <div className="metric-value">
                    {accessRules.filter(rule => rule.isActive).length}
                  </div>
                </div>
              </div>
              <div className="security-metric">
                <span className="metric-icon">✅</span>
                <div className="metric-content">
                  <div className="metric-label">Granted Access (24h)</div>
                  <div className="metric-value">
                    {accessLogs.filter(log => log.status === 'granted').length}
                  </div>
                </div>
              </div>
              <div className="security-metric">
                <span className="metric-icon">❌</span>
                <div className="metric-content">
                  <div className="metric-label">Denied Access (24h)</div>
                  <div className="metric-value">
                    {accessLogs.filter(log => log.status === 'denied').length}
                  </div>
                </div>
              </div>
              <div className="security-metric">
                <span className="metric-icon">🔑</span>
                <div className="metric-content">
                  <div className="metric-label">System Permissions</div>
                  <div className="metric-value">
                    {systemPermissions.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="security-policies holo-card">
            <h3 className="ember-glow">Security Policies</h3>
            <div className="policies-list">
              <div className="policy-item">
                <div className="policy-info">
                  <strong>Multi-Factor Authentication</strong>
                  <p>Require MFA for admin actions</p>
                </div>
                <span className="policy-status enabled">Enabled</span>
              </div>
              <div className="policy-item">
                <div className="policy-info">
                  <strong>IP Whitelisting</strong>
                  <p>Restrict admin access to whitelisted IPs</p>
                </div>
                <span className="policy-status enabled">Enabled</span>
              </div>
              <div className="policy-item">
                <div className="policy-info">
                  <strong>Session Timeout</strong>
                  <p>Auto-logout after 30 minutes of inactivity</p>
                </div>
                <span className="policy-status enabled">Enabled</span>
              </div>
              <div className="policy-item">
                <div className="policy-info">
                  <strong>Audit Logging</strong>
                  <p>Log all admin actions for compliance</p>
                </div>
                <span className="policy-status enabled">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccessControl;

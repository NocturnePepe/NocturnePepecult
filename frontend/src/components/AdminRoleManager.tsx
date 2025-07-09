import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './AdminRoleManager.css';

interface AdminRole {
  wallet: string;
  role: 'superadmin' | 'token-listing' | 'readonly' | 'moderator';
  assignedBy: string;
  assignedAt: Date;
  lastActive?: Date;
}

interface AdminRoleManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

const ROLE_PERMISSIONS = {
  'superadmin': {
    name: 'Super Admin',
    icon: '👑',
    color: '#FFD700',
    permissions: ['All permissions', 'User management', 'System settings', 'Financial controls'],
    description: 'Full access to all platform features'
  },
  'token-listing': {
    name: 'Token Listing Manager',
    icon: '💎',
    color: '#8B4513',
    permissions: ['Add/remove tokens', 'Verify projects', 'Manage listings', 'Set trading pairs'],
    description: 'Manages token listings and trading pairs'
  },
  'moderator': {
    name: 'Community Moderator',
    icon: '🛡️',
    color: '#4CAF50',
    permissions: ['User reports', 'Chat moderation', 'Content review', 'Ban/warn users'],
    description: 'Moderates community interactions'
  },
  'readonly': {
    name: 'Read Only Admin',
    icon: '👁️',
    color: '#6C757D',
    permissions: ['View analytics', 'Export reports', 'Monitor system', 'Access logs'],
    description: 'View-only access to admin data'
  }
};

const AdminRoleManager = ({ isVisible, onClose }: AdminRoleManagerProps) => {
  const { publicKey, connected } = useWallet();
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [selectedTab, setSelectedTab] = useState('roles');
  const [newWallet, setNewWallet] = useState('');
  const [newRole, setNewRole] = useState<keyof typeof ROLE_PERMISSIONS>('readonly');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || '9sJgdsierNDXhUL3xahz4nJFy9zt2hEAHk6S9giCPtNb';

  useEffect(() => {
    if (connected && publicKey) {
      loadAdminRoles();
    }
  }, [connected, publicKey]);

  const loadAdminRoles = () => {
    const savedRoles = localStorage.getItem('nocturne_admin_roles');
    if (savedRoles) {
      const roles = JSON.parse(savedRoles).map((role: any) => ({
        ...role,
        assignedAt: new Date(role.assignedAt),
        lastActive: role.lastActive ? new Date(role.lastActive) : undefined
      }));
      setAdminRoles(roles);
    } else {
      // Initialize with treasury wallet as super admin
      const initialRoles: AdminRole[] = [
        {
          wallet: TREASURY_WALLET,
          role: 'superadmin',
          assignedBy: 'system',
          assignedAt: new Date(),
          lastActive: new Date()
        },
        // Mock additional roles for demo
        {
          wallet: 'TokenListingManager123456789',
          role: 'token-listing',
          assignedBy: TREASURY_WALLET,
          assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          wallet: 'ModeratorWallet987654321',
          role: 'moderator',
          assignedBy: TREASURY_WALLET,
          assignedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ];
      setAdminRoles(initialRoles);
      saveAdminRoles(initialRoles);
    }
  };

  const saveAdminRoles = (roles: AdminRole[]) => {
    localStorage.setItem('nocturne_admin_roles', JSON.stringify(roles));
  };

  const addAdminRole = () => {
    if (!newWallet.trim() || !publicKey) return;

    // Check if wallet already has a role
    if (adminRoles.find(role => role.wallet === newWallet.trim())) {
      alert('This wallet already has an admin role!');
      return;
    }

    const newAdminRole: AdminRole = {
      wallet: newWallet.trim(),
      role: newRole,
      assignedBy: publicKey.toString(),
      assignedAt: new Date()
    };

    const updatedRoles = [...adminRoles, newAdminRole];
    setAdminRoles(updatedRoles);
    saveAdminRoles(updatedRoles);

    setNewWallet('');
    setNewRole('readonly');
    setShowAddModal(false);
  };

  const removeAdminRole = (wallet: string) => {
    if (wallet === TREASURY_WALLET) {
      alert('Cannot remove the treasury wallet admin role!');
      return;
    }

    if (confirm(`Are you sure you want to remove admin access for ${wallet}?`)) {
      const updatedRoles = adminRoles.filter(role => role.wallet !== wallet);
      setAdminRoles(updatedRoles);
      saveAdminRoles(updatedRoles);
    }
  };

  const updateAdminRole = (wallet: string, newRoleType: keyof typeof ROLE_PERMISSIONS) => {
    if (wallet === TREASURY_WALLET && newRoleType !== 'superadmin') {
      alert('Treasury wallet must remain super admin!');
      return;
    }

    const updatedRoles = adminRoles.map(role => 
      role.wallet === wallet 
        ? { ...role, role: newRoleType }
        : role
    );
    setAdminRoles(updatedRoles);
    saveAdminRoles(updatedRoles);
  };

  const getFilteredRoles = () => {
    let filtered = adminRoles;

    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ROLE_PERMISSIONS[role.role].name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(role => role.role === filterRole);
    }

    return filtered;
  };

  const isCurrentUserSuperAdmin = () => {
    return publicKey?.toString() === TREASURY_WALLET;
  };

  if (!isVisible) return null;

  return (
    <div className="admin-role-modal-overlay">
      <div className="admin-role-modal">
        <div className="admin-role-header">
          <h2>👑 Admin Role Manager</h2>
          <p>Manage platform administrator permissions and access levels</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Permission Check */}
        {!isCurrentUserSuperAdmin() && (
          <div className="permission-denied">
            <div className="denied-icon">🚫</div>
            <h3>Access Denied</h3>
            <p>Only the treasury wallet can manage admin roles.</p>
            <p>Current wallet: {publicKey?.toString()}</p>
            <p>Required: {TREASURY_WALLET}</p>
          </div>
        )}

        {isCurrentUserSuperAdmin() && (
          <>
            {/* Tab Navigation */}
            <div className="admin-role-tabs">
              <button 
                className={selectedTab === 'roles' ? 'active' : ''}
                onClick={() => setSelectedTab('roles')}
              >
                👥 Role Management
              </button>
              <button 
                className={selectedTab === 'permissions' ? 'active' : ''}
                onClick={() => setSelectedTab('permissions')}
              >
                🔐 Permissions
              </button>
              <button 
                className={selectedTab === 'activity' ? 'active' : ''}
                onClick={() => setSelectedTab('activity')}
              >
                📊 Activity Log
              </button>
            </div>

            <div className="admin-role-content">
              {selectedTab === 'roles' && (
                <div className="roles-management">
                  <div className="roles-header">
                    <div className="roles-stats">
                      <div className="stat-item">
                        <span className="stat-number">{adminRoles.length}</span>
                        <span className="stat-label">Total Admins</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{adminRoles.filter(r => r.role === 'superadmin').length}</span>
                        <span className="stat-label">Super Admins</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{adminRoles.filter(r => r.lastActive && Date.now() - r.lastActive.getTime() < 24 * 60 * 60 * 1000).length}</span>
                        <span className="stat-label">Active Today</span>
                      </div>
                    </div>
                    
                    <button 
                      className="add-admin-btn"
                      onClick={() => setShowAddModal(true)}
                    >
                      + Add Admin
                    </button>
                  </div>

                  <div className="roles-filters">
                    <input
                      type="text"
                      placeholder="Search by wallet or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <select 
                      value={filterRole} 
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="role-filter"
                    >
                      <option value="all">All Roles</option>
                      {Object.entries(ROLE_PERMISSIONS).map(([key, role]) => (
                        <option key={key} value={key}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="roles-list">
                    {getFilteredRoles().map((role, index) => (
                      <div key={index} className="role-item">
                        <div className="role-avatar">
                          <div 
                            className="role-icon"
                            style={{ color: ROLE_PERMISSIONS[role.role].color }}
                          >
                            {ROLE_PERMISSIONS[role.role].icon}
                          </div>
                          {role.wallet === TREASURY_WALLET && (
                            <div className="treasury-badge">💎</div>
                          )}
                        </div>
                        
                        <div className="role-info">
                          <div className="role-wallet">
                            {role.wallet.length > 20 
                              ? `${role.wallet.slice(0, 8)}...${role.wallet.slice(-8)}`
                              : role.wallet
                            }
                          </div>
                          <div className="role-meta">
                            Assigned {role.assignedAt.toLocaleDateString()} by {role.assignedBy}
                            {role.lastActive && (
                              <span> • Last active {Math.floor((Date.now() - role.lastActive.getTime()) / (1000 * 60 * 60))}h ago</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="role-controls">
                          <select
                            value={role.role}
                            onChange={(e) => updateAdminRole(role.wallet, e.target.value as keyof typeof ROLE_PERMISSIONS)}
                            className="role-select"
                            disabled={role.wallet === TREASURY_WALLET}
                          >
                            {Object.entries(ROLE_PERMISSIONS).map(([key, roleInfo]) => (
                              <option key={key} value={key}>{roleInfo.name}</option>
                            ))}
                          </select>
                          
                          {role.wallet !== TREASURY_WALLET && (
                            <button 
                              className="remove-btn"
                              onClick={() => removeAdminRole(role.wallet)}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'permissions' && (
                <div className="permissions-overview">
                  <h4>🔐 Role Permissions Overview</h4>
                  <div className="permissions-grid">
                    {Object.entries(ROLE_PERMISSIONS).map(([key, role]) => (
                      <div key={key} className="permission-card">
                        <div className="permission-header">
                          <div 
                            className="permission-icon"
                            style={{ color: role.color }}
                          >
                            {role.icon}
                          </div>
                          <div className="permission-title">
                            <h5>{role.name}</h5>
                            <p>{role.description}</p>
                          </div>
                        </div>
                        
                        <div className="permission-list">
                          {role.permissions.map((permission, index) => (
                            <div key={index} className="permission-item">
                              <span className="permission-check">✓</span>
                              <span>{permission}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="permission-count">
                          {adminRoles.filter(r => r.role === key).length} user(s) with this role
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'activity' && (
                <div className="activity-log">
                  <h4>📊 Recent Admin Activity</h4>
                  <div className="activity-list">
                    {adminRoles.map((role, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          {role.role === 'superadmin' ? '👑' : '👤'}
                        </div>
                        <div className="activity-info">
                          <span className="activity-text">
                            <strong>{role.wallet.slice(0, 8)}...</strong> 
                            {' '}assigned {ROLE_PERMISSIONS[role.role].name} role
                          </span>
                          <span className="activity-time">
                            {role.assignedAt.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
              <div className="add-admin-modal">
                <div className="add-admin-content">
                  <h4>Add New Admin</h4>
                  <div className="add-admin-form">
                    <div className="form-group">
                      <label>Wallet Address</label>
                      <input
                        type="text"
                        value={newWallet}
                        onChange={(e) => setNewWallet(e.target.value)}
                        placeholder="Enter wallet address..."
                        className="wallet-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as keyof typeof ROLE_PERMISSIONS)}
                        className="role-select"
                      >
                        {Object.entries(ROLE_PERMISSIONS).map(([key, role]) => (
                          <option key={key} value={key}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="role-preview">
                      <h5>Selected Role: {ROLE_PERMISSIONS[newRole].name}</h5>
                      <p>{ROLE_PERMISSIONS[newRole].description}</p>
                      <div className="preview-permissions">
                        {ROLE_PERMISSIONS[newRole].permissions.map((permission, index) => (
                          <span key={index} className="preview-permission">
                            ✓ {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="add-btn"
                        onClick={addAdminRole}
                        disabled={!newWallet.trim()}
                      >
                        Add Admin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRoleManager;

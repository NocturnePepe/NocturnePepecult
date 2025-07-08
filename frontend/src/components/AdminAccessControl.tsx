// AdminAccessControl.tsx - Wallet-based admin access and role management
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { cultSounds } from '../SoundEffects.js';
import './AdminAccessControl.css';

interface AdminAccessProps {
  connection: Connection;
  onAccessChange?: (hasAccess: boolean, role: AdminRole) => void;
  children?: React.ReactNode;
}

interface AdminRole {
  id: string;
  name: string;
  level: number;
  permissions: string[];
  color: string;
  icon: string;
}

interface AdminUser {
  wallet: string;
  role: string;
  addedBy: string;
  addedAt: Date;
  lastActive: Date;
  isActive: boolean;
}

// Treasury wallet addresses (in production, these would be managed more securely)
const TREASURY_WALLETS = [
  '7xKXWyPuHjKh5QcQ5Jrf4Q9CZhYJmLfPxKT9wJFJ1234', // Main treasury
  '5cEBeDGCZeMXwBHgHLSzqjvASD7qKHCw9bUx2345abcd',  // Secondary treasury
  'AJ1bXyPQqCWQmFCg1QqzXj9rGHmKbF5QdDsE5678efgh'   // Emergency treasury
];

// Admin role definitions
const ADMIN_ROLES: { [key: string]: AdminRole } = {
  superadmin: {
    id: 'superadmin',
    name: 'Super Admin',
    level: 100,
    permissions: ['*'], // All permissions
    color: '#ff0000',
    icon: '👑'
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    level: 80,
    permissions: [
      'manage_tokens',
      'manage_pools',
      'view_analytics',
      'manage_users',
      'manage_fees',
      'emergency_pause'
    ],
    color: '#ff6432',
    icon: '⚡'
  },
  moderator: {
    id: 'moderator',
    name: 'Moderator',
    level: 60,
    permissions: [
      'view_analytics',
      'manage_tokens',
      'moderate_content'
    ],
    color: '#9632ff',
    icon: '🛡️'
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    level: 40,
    permissions: [
      'view_analytics',
      'export_data'
    ],
    color: '#32cd32',
    icon: '📊'
  },
  support: {
    id: 'support',
    name: 'Support',
    level: 20,
    permissions: [
      'view_basic_analytics',
      'view_user_issues'
    ],
    color: '#1e90ff',
    icon: '🎧'
  }
};

const AdminAccessControl: React.FC<AdminAccessProps> = ({ 
  connection, 
  onAccessChange, 
  children 
}) => {
  const { publicKey, connected } = useWallet();
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check if wallet is treasury wallet
  const isTreasuryWallet = useCallback((walletAddress: string): boolean => {
    return TREASURY_WALLETS.includes(walletAddress);
  }, []);

  // Check admin access
  const checkAdminAccess = useCallback(async () => {
    if (!connected || !publicKey) {
      setHasAccess(false);
      setAdminRole(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const walletAddress = publicKey.toString();
      
      // Check if treasury wallet (automatic super admin)
      if (isTreasuryWallet(walletAddress)) {
        const role = ADMIN_ROLES.superadmin;
        setAdminRole(role);
        setHasAccess(true);
        
        if (onAccessChange) {
          onAccessChange(true, role);
        }
        
        if (cultSounds) {
          cultSounds.playAdminLogin();
        }
        
        console.log('🔑 Treasury wallet connected - Super Admin access granted');
        return;
      }
      
      // Check in admin users list (in production, this would be stored in a database)
      const storedAdmins = localStorage.getItem('nocturne_admin_users');
      let adminUsers: AdminUser[] = [];
      
      if (storedAdmins) {
        adminUsers = JSON.parse(storedAdmins);
      }
      
      const adminUser = adminUsers.find(user => 
        user.wallet === walletAddress && user.isActive
      );
      
      if (adminUser) {
        const role = ADMIN_ROLES[adminUser.role];
        if (role) {
          setAdminRole(role);
          setHasAccess(true);
          
          // Update last active
          adminUser.lastActive = new Date();
          localStorage.setItem('nocturne_admin_users', JSON.stringify(adminUsers));
          
          if (onAccessChange) {
            onAccessChange(true, role);
          }
          
          if (cultSounds) {
            cultSounds.playAdminLogin();
          }
          
          console.log(`🔑 Admin access granted - Role: ${role.name}`);
          return;
        }
      }
      
      // No admin access
      setHasAccess(false);
      setAdminRole(null);
      
      if (onAccessChange) {
        onAccessChange(false, ADMIN_ROLES.support); // Default role
      }
      
    } catch (error) {
      console.error('Failed to check admin access:', error);
      setHasAccess(false);
      setAdminRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, isTreasuryWallet, onAccessChange]);

  // Load admin users from storage
  const loadAdminUsers = useCallback(() => {
    const storedAdmins = localStorage.getItem('nocturne_admin_users');
    if (storedAdmins) {
      const users = JSON.parse(storedAdmins);
      setAdminUsers(users);
    }
  }, []);

  // Add new admin user
  const addAdminUser = useCallback(async (walletAddress: string, roleId: string) => {
    if (!hasAccess || !adminRole || adminRole.level < 80) {
      if (cultSounds) {
        cultSounds.playError();
      }
      return false;
    }

    try {
      const newUser: AdminUser = {
        wallet: walletAddress,
        role: roleId,
        addedBy: publicKey?.toString() || 'unknown',
        addedAt: new Date(),
        lastActive: new Date(),
        isActive: true
      };

      const storedAdmins = localStorage.getItem('nocturne_admin_users');
      let adminUsers: AdminUser[] = storedAdmins ? JSON.parse(storedAdmins) : [];
      
      // Check if user already exists
      const existingIndex = adminUsers.findIndex(user => user.wallet === walletAddress);
      if (existingIndex >= 0) {
        adminUsers[existingIndex] = newUser;
      } else {
        adminUsers.push(newUser);
      }
      
      localStorage.setItem('nocturne_admin_users', JSON.stringify(adminUsers));
      setAdminUsers(adminUsers);
      
      if (cultSounds) {
        cultSounds.playSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to add admin user:', error);
      if (cultSounds) {
        cultSounds.playError();
      }
      return false;
    }
  }, [hasAccess, adminRole, publicKey]);

  // Remove admin user
  const removeAdminUser = useCallback(async (walletAddress: string) => {
    if (!hasAccess || !adminRole || adminRole.level < 80) {
      if (cultSounds) {
        cultSounds.playError();
      }
      return false;
    }

    try {
      const storedAdmins = localStorage.getItem('nocturne_admin_users');
      let adminUsers: AdminUser[] = storedAdmins ? JSON.parse(storedAdmins) : [];
      
      adminUsers = adminUsers.filter(user => user.wallet !== walletAddress);
      
      localStorage.setItem('nocturne_admin_users', JSON.stringify(adminUsers));
      setAdminUsers(adminUsers);
      
      if (cultSounds) {
        cultSounds.playSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove admin user:', error);
      if (cultSounds) {
        cultSounds.playError();
      }
      return false;
    }
  }, [hasAccess, adminRole]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!adminRole) return false;
    return adminRole.permissions.includes('*') || adminRole.permissions.includes(permission);
  }, [adminRole]);

  // Handle admin login attempt
  const handleAdminLogin = useCallback(() => {
    if (!connected) {
      setShowLoginModal(true);
      return;
    }
    
    checkAdminAccess();
  }, [connected, checkAdminAccess]);

  // Effect to check access when wallet connects
  useEffect(() => {
    checkAdminAccess();
    loadAdminUsers();
  }, [checkAdminAccess, loadAdminUsers]);

  // Format wallet address for display
  const formatWalletAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Get role color
  const getRoleColor = (roleId: string): string => {
    return ADMIN_ROLES[roleId]?.color || '#666666';
  };

  if (!hasAccess) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">🔒</div>
          <h2>Admin Access Required</h2>
          <p>This area is restricted to authorized administrators only.</p>
          
          {connected ? (
            <div className="current-wallet">
              <p>Connected wallet: {formatWalletAddress(publicKey?.toString() || '')}</p>
              <p>No admin privileges found for this wallet.</p>
            </div>
          ) : (
            <button 
              className="connect-wallet-btn"
              onClick={() => setShowLoginModal(true)}
            >
              Connect Admin Wallet
            </button>
          )}
          
          <div className="access-info">
            <h4>To gain access:</h4>
            <ul>
              <li>Connect a treasury wallet</li>
              <li>Contact an existing administrator</li>
              <li>Use a wallet with admin privileges</li>
            </ul>
          </div>
        </div>
        
        {/* Login Modal */}
        {showLoginModal && (
          <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <div className="login-header">
                <h3>🔐 Admin Login</h3>
                <button onClick={() => setShowLoginModal(false)}>×</button>
              </div>
              <div className="login-content">
                <p>Please connect your admin wallet to access the administration panel.</p>
                <div className="treasury-info">
                  <h4>Authorized Wallets:</h4>
                  <ul>
                    <li>Treasury wallets (automatic super admin)</li>
                    <li>Wallets added by existing admins</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-access-control">
      {/* Admin Status Bar */}
      <div className="admin-status-bar">
        <div className="admin-info">
          <span 
            className="admin-role-badge"
            style={{ background: adminRole?.color }}
          >
            {adminRole?.icon} {adminRole?.name}
          </span>
          <span className="admin-wallet">
            {formatWalletAddress(publicKey?.toString() || '')}
          </span>
        </div>
        
        <div className="admin-actions">
          {hasPermission('manage_users') && (
            <button 
              className="role-manager-btn"
              onClick={() => setShowRoleManager(true)}
              title="Manage Admin Roles"
            >
              👥 Roles
            </button>
          )}
          
          <div className="admin-level">
            Level {adminRole?.level}
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="admin-content">
        {children}
      </div>

      {/* Role Manager Modal */}
      {showRoleManager && (
        <div className="role-manager-overlay" onClick={() => setShowRoleManager(false)}>
          <div className="role-manager" onClick={(e) => e.stopPropagation()}>
            <div className="manager-header">
              <h2>👥 Admin Role Manager</h2>
              <button onClick={() => setShowRoleManager(false)}>×</button>
            </div>
            
            <div className="manager-content">
              {/* Add New Admin */}
              {hasPermission('manage_users') && (
                <div className="add-admin-section">
                  <h3>Add New Administrator</h3>
                  <div className="add-admin-form">
                    <input 
                      type="text" 
                      placeholder="Wallet address"
                      className="wallet-input"
                      id="newAdminWallet"
                    />
                    <select className="role-select" id="newAdminRole">
                      {Object.values(ADMIN_ROLES)
                        .filter(role => role.level <= (adminRole?.level || 0))
                        .map(role => (
                          <option key={role.id} value={role.id}>
                            {role.icon} {role.name}
                          </option>
                        ))
                      }
                    </select>
                    <button 
                      className="add-admin-btn"
                      onClick={() => {
                        const walletInput = document.getElementById('newAdminWallet') as HTMLInputElement;
                        const roleSelect = document.getElementById('newAdminRole') as HTMLSelectElement;
                        if (walletInput.value && roleSelect.value) {
                          addAdminUser(walletInput.value, roleSelect.value);
                          walletInput.value = '';
                        }
                      }}
                    >
                      Add Admin
                    </button>
                  </div>
                </div>
              )}

              {/* Current Admins */}
              <div className="current-admins-section">
                <h3>Current Administrators</h3>
                <div className="admins-list">
                  {adminUsers.map((user, index) => (
                    <div key={index} className="admin-user-item">
                      <div className="user-info">
                        <div className="user-wallet">
                          {formatWalletAddress(user.wallet)}
                        </div>
                        <div 
                          className="user-role"
                          style={{ color: getRoleColor(user.role) }}
                        >
                          {ADMIN_ROLES[user.role]?.icon} {ADMIN_ROLES[user.role]?.name}
                        </div>
                        <div className="user-meta">
                          Added: {new Date(user.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {hasPermission('manage_users') && (
                        <button 
                          className="remove-admin-btn"
                          onClick={() => removeAdminUser(user.wallet)}
                          title="Remove admin"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Permissions */}
              <div className="role-permissions-section">
                <h3>Role Permissions</h3>
                <div className="roles-grid">
                  {Object.values(ADMIN_ROLES).map(role => (
                    <div 
                      key={role.id} 
                      className="role-card"
                      style={{ borderColor: role.color }}
                    >
                      <div className="role-header">
                        <span className="role-icon">{role.icon}</span>
                        <span className="role-name">{role.name}</span>
                        <span className="role-level">L{role.level}</span>
                      </div>
                      <div className="role-permissions">
                        {role.permissions.map((perm, index) => (
                          <span key={index} className="permission-tag">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Checking admin access...</p>
        </div>
      )}
    </div>
  );
};

export default AdminAccessControl;

// Export utility functions
export const useAdminAccess = () => {
  const { publicKey, connected } = useWallet();
  const [hasAccess, setHasAccess] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);

  return {
    hasAccess,
    role,
    isConnected: connected && !!publicKey
  };
};

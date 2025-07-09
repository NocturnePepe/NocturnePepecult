import React, { useState, useEffect } from 'react';
import './RoleManager.css';

interface UserRole {
  id: string;
  address: string;
  username?: string;
  role: 'admin' | 'moderator' | 'vip' | 'premium' | 'user';
  permissions: string[];
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'trading' | 'governance' | 'admin' | 'security' | 'analytics';
  level: 'basic' | 'advanced' | 'admin';
}

const RoleManager: React.FC = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRoleData();
  }, []);

  const loadRoleData = () => {
    // Mock user roles data
    const mockUsers: UserRole[] = [
      {
        id: 'user-001',
        address: 'ADm1n...7X9pQ',
        username: 'CultLeader',
        role: 'admin',
        permissions: ['all_permissions'],
        assignedBy: 'system',
        assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: 'user-002',
        address: 'M0d3r...4K2nF',
        username: 'NightWatch',
        role: 'moderator',
        permissions: ['manage_users', 'view_analytics', 'moderate_content'],
        assignedBy: 'ADm1n...7X9pQ',
        assignedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: 'user-003',
        address: 'V1P9s...8L3mR',
        username: 'DarkTrader',
        role: 'vip',
        permissions: ['advanced_trading', 'priority_support', 'exclusive_features'],
        assignedBy: 'ADm1n...7X9pQ',
        assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: 'user-004',
        address: 'Pr3m...6T8vC',
        role: 'premium',
        permissions: ['reduced_fees', 'analytics_access', 'early_access'],
        assignedBy: 'M0d3r...4K2nF',
        assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      }
    ];

    const mockPermissions: Permission[] = [
      {
        id: 'perm-001',
        name: 'Manage Users',
        description: 'Add, remove, and modify user roles',
        category: 'admin',
        level: 'admin'
      },
      {
        id: 'perm-002',
        name: 'Advanced Trading',
        description: 'Access to advanced trading features and tools',
        category: 'trading',
        level: 'advanced'
      },
      {
        id: 'perm-003',
        name: 'View Analytics',
        description: 'Access to detailed analytics and reports',
        category: 'analytics',
        level: 'basic'
      },
      {
        id: 'perm-004',
        name: 'Security Management',
        description: 'Manage security settings and policies',
        category: 'security',
        level: 'admin'
      },
      {
        id: 'perm-005',
        name: 'Governance Voting',
        description: 'Participate in governance decisions',
        category: 'governance',
        level: 'basic'
      }
    ];

    setUsers(mockUsers);
    setPermissions(mockPermissions);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ff4444';
      case 'moderator': return '#ff8844';
      case 'vip': return '#9d4edd';
      case 'premium': return '#4ade80';
      case 'user': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'moderator': return '🛡️';
      case 'vip': return '💎';
      case 'premium': return '⭐';
      case 'user': return '👤';
      default: return '👤';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const updateUserRole = (userId: string, newRole: UserRole['role']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, role: newRole, assignedAt: new Date().toISOString() }
        : user
    ));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  return (
    <div className="role-manager">
      <div className="role-header">
        <div className="header-content">
          <h1 className="ember-glow">👑 Role Manager</h1>
          <p>Manage user roles and permissions for the NocturneSwap platform</p>
        </div>
        <button 
          className="glow-btn"
          onClick={() => setShowAddUser(true)}
        >
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="role-filters holo-card">
        <div className="filter-group">
          <label>Filter by Role:</label>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="holo-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="vip">VIP</option>
            <option value="premium">Premium</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search Users:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by address or username..."
            className="holo-input"
          />
        </div>
      </div>

      {/* User List */}
      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card holo-card">
            <div className="user-header">
              <div className="user-identity">
                <span className="role-icon">{getRoleIcon(user.role)}</span>
                <div className="user-info">
                  <div className="user-address">{user.address}</div>
                  {user.username && (
                    <div className="username">{user.username}</div>
                  )}
                </div>
              </div>
              <div 
                className="role-badge"
                style={{ backgroundColor: getRoleColor(user.role) }}
              >
                {user.role.toUpperCase()}
              </div>
            </div>

            <div className="user-details">
              <div className="detail-item">
                <span>Permissions:</span>
                <span>{user.permissions.length}</span>
              </div>
              <div className="detail-item">
                <span>Assigned:</span>
                <span>{new Date(user.assignedAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span>Status:</span>
                <span className={user.isActive ? 'active' : 'inactive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="user-actions">
              <select
                value={user.role}
                onChange={(e) => updateUserRole(user.id, e.target.value as UserRole['role'])}
                className="role-select"
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="vip">VIP</option>
                <option value="premium">Premium</option>
                <option value="user">User</option>
              </select>
              <button
                className={`toggle-btn ${user.isActive ? 'active' : 'inactive'}`}
                onClick={() => toggleUserStatus(user.id)}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                className="edit-btn"
                onClick={() => setSelectedUser(user)}
              >
                Edit
              </button>
              <button
                className="remove-btn"
                onClick={() => removeUser(user.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Overview */}
      <div className="permissions-overview holo-card">
        <h3 className="ember-glow">Available Permissions</h3>
        <div className="permissions-grid">
          {permissions.map(permission => (
            <div key={permission.id} className="permission-item">
              <div className="permission-header">
                <span className="permission-name">{permission.name}</span>
                <span className={`permission-level ${permission.level}`}>
                  {permission.level}
                </span>
              </div>
              <div className="permission-description">
                {permission.description}
              </div>
              <div className="permission-category">
                Category: {permission.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Statistics */}
      <div className="role-stats holo-card">
        <h3 className="ember-glow">Role Distribution</h3>
        <div className="stats-grid">
          {['admin', 'moderator', 'vip', 'premium', 'user'].map(role => {
            const count = users.filter(user => user.role === role).length;
            return (
              <div key={role} className="stat-item">
                <span className="stat-icon">{getRoleIcon(role)}</span>
                <div className="stat-content">
                  <div className="stat-label">{role.toUpperCase()}</div>
                  <div className="stat-value">{count}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleManager;

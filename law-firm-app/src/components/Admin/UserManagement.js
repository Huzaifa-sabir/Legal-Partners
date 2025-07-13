import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import { 
  Search, 
  Filter, 
  User, 
  Shield, 
  Mail, 
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionMenuUser, setActionMenuUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await authService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      await authService.updateUserStatus(userId, !currentStatus);
      await fetchUsers();
      setActionMenuUser(null);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole);
      await fetchUsers();
      setShowUserDetails(false);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await authService.deleteUser(userId);
        await fetchUsers();
        setActionMenuUser(null);
        setShowUserDetails(false);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    setActionMenuUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && user.active) ||
                         (statusFilter === 'inactive' && !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserStats = () => {
    return {
      total: users.length,
      active: users.filter(user => user.active).length,
      inactive: users.filter(user => !user.active).length,
      admins: users.filter(user => user.role === 'admin').length,
      clients: users.filter(user => user.role === 'user').length
    };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value text-green-600">{stats.active}</div>
          <div className="stat-label">Active Users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value text-red-600">{stats.inactive}</div>
          <div className="stat-label">Inactive Users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value text-purple-600">{stats.admins}</div>
          <div className="stat-label">Administrators</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Clients</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`badge ${
                      user.role === 'admin' 
                        ? 'badge-info' 
                        : 'badge-success'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Client'}
                    </span>
                  </td>
                  
                  <td>
                    <span className={`badge ${
                      user.active 
                        ? 'badge-success' 
                        : 'badge-danger'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  
                  <td className="text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  
                  <td className="text-sm text-gray-600">
                    {user.updatedAt ? formatDate(user.updatedAt) : 'Never'}
                  </td>
                  
                  <td>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuUser(actionMenuUser === user.id ? null : user.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {actionMenuUser === user.id && (
                        <div className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                            
                            <button
                              onClick={() => handleUserStatusToggle(user.id, user.active)}
                              className={`flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                                user.active ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {user.active ? (
                                <>
                                  <UserX className="w-4 h-4" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4" />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete User</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowUserDetails(false)}
          onRoleChange={handleRoleChange}
          onStatusToggle={handleUserStatusToggle}
          onDelete={handleDeleteUser}
        />
      )}

      {/* Click outside to close action menu */}
      {actionMenuUser && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setActionMenuUser(null)}
        />
      )}
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onRoleChange, onStatusToggle, onDelete }) => {
  const [newRole, setNewRole] = useState(user.role);

  const handleRoleSubmit = () => {
    if (newRole !== user.role) {
      onRoleChange(user.id, newRole);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">User Details</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="space-y-6">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.displayName}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-info' : 'badge-success'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Client'}
                  </span>
                  <span className={`badge ${
                    user.active ? 'badge-success' : 'badge-danger'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Display Name</label>
                    <p className="text-gray-900">{user.displayName}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Account Dates</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                  
                  {user.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role Management */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Role Management</h4>
              <div className="flex items-center space-x-4">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="form-select"
                >
                  <option value="user">Client</option>
                  <option value="admin">Administrator</option>
                </select>
                
                {newRole !== user.role && (
                  <button
                    onClick={handleRoleSubmit}
                    className="btn btn-primary btn-sm"
                  >
                    Update Role
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Administrators have full access to manage users, policies, and claims.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-3">
              <button
                onClick={() => onStatusToggle(user.id, user.active)}
                className={`btn btn-sm ${user.active ? 'btn-danger' : 'btn-success'}`}
              >
                {user.active ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </button>
              
              <button
                onClick={() => onDelete(user.id)}
                className="btn btn-sm btn-danger"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
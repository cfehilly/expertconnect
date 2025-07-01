import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Upload,
  Edit,
  Trash2,
  Shield,
  Award,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import UserImportModal from '../../components/admin/UserImportModal';
import { dbHelpers, hasValidConfig } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!hasValidConfig) {
        // Show demo message for non-configured instances
        setUsers([]);
        setError('Database not configured. Please connect to Supabase to see imported users.');
        return;
      }
      
      const data = await dbHelpers.getAllUsers();
      console.log('Loaded users:', data); // Debug log
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filteredUsers = users.filter(user => {
    const userName = user?.name || '';
    const userEmail = user?.email || '';
    const userRole = user?.role || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || userRole === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'management': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800';
  };

  const handleImportComplete = () => {
    setShowImportModal(false);
    // Refresh the user list after import
    refreshUsers();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshUsers}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import Users</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all">
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Error/Status Messages */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-yellow-800">{error}</p>
            {hasValidConfig && (
              <button 
                onClick={loadUsers}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success message for imports */}
      {!error && hasValidConfig && users.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            No users found. Import users using the "Import Users" button above, or users will appear here after they sign up.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="management">Management</option>
              <option value="expert">Expert</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">{filteredUsers.length} users found</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {hasValidConfig && users.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Role</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Department</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Activity</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Performance</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={user.name || 'User'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role || 'employee')}`}>
                        {user.role === 'management' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role === 'expert' && <Award className="h-3 w-3 mr-1" />}
                        {(user.role || 'employee').charAt(0).toUpperCase() + (user.role || 'employee').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{user.department || 'Unknown'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'offline')}`}>
                        {(user.status || 'offline').charAt(0).toUpperCase() + (user.status || 'offline').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{user.completed_helps || 0} helps</p>
                        <p className="text-gray-600">★ {user.rating || 0}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showImportModal && (
        <UserImportModal onClose={handleImportComplete} />
      )}
    </div>
  );
}
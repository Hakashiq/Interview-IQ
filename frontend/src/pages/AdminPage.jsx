import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineDocumentText,
  HiOutlineShieldExclamation, HiOutlineUserRemove, HiOutlineUserAdd,
  HiOutlineSearch, HiOutlineFilter, HiOutlineShieldCheck,
  HiOutlineBan, HiOutlineRefresh, HiOutlineMail, HiOutlinePhone,
  HiOutlineIdentification
} from 'react-icons/hi';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalInterviews: 0, totalResumes: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIdCard, setSelectedIdCard] = useState(null);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'ROLE_STUDENT',
    education: ''
  });

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data || { totalUsers: 0, totalInterviews: 0, totalResumes: 0 });
      setUsers(usersRes.data || []);
    } catch (err) {
      toast.error('Failed to fetch admin dashboard data');
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUserForm);
      toast.success('User account created successfully! 🎉');
      setShowAddModal(false);
      setNewUserForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'ROLE_STUDENT',
        education: ''
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (userEmail.toLowerCase() === 'admin@interviewiq.com') {
      toast.error('Cannot delete primary admin account');
      return;
    }
    if (userId === currentUser?.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    const confirm = window.confirm(`Are you absolutely sure you want to permanently delete user ${userEmail}? This will wipe out all corresponding profiles and reports.`);
    if (!confirm) return;

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      toast.success(res.data?.message || 'User deleted successfully! 🗑️');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleAdmin = async (userId, userEmail, currentlyAdmin) => {
    if (userEmail.toLowerCase() === 'admin@interviewiq.com') {
      toast.error('Cannot modify primary admin account');
      return;
    }
    if (userId === currentUser?.id) {
      toast.error('Cannot modify your own administrative privileges');
      return;
    }

    try {
      const res = await api.post(`/admin/users/${userId}/toggle-admin`);
      toast.success(res.data?.message || 'Admin role updated successfully');
      
      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const newRoles = currentlyAdmin 
            ? u.roles.filter(r => r !== 'ROLE_ADMIN') 
            : [...u.roles, 'ROLE_ADMIN'];
          return { ...u, roles: newRoles };
        }
        return u;
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update administrative permissions');
    }
  };

  const handleBanUser = async (userId, userEmail, currentlyBanned) => {
    if (userEmail.toLowerCase() === 'admin@interviewiq.com') {
      toast.error('Cannot suspend the primary administrator');
      return;
    }
    if (userId === currentUser?.id) {
      toast.error('Cannot suspend yourself');
      return;
    }

    try {
      const endpoint = currentlyBanned ? 'unban' : 'ban';
      const res = await api.post(`/admin/users/${userId}/${endpoint}`);
      toast.success(res.data?.message || `User account status updated successfully`);

      // Update local state
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { 
            ...u, 
            bannedUntil: currentlyBanned ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          };
        }
        return u;
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Helper to check if a user is currently banned
  const isBanned = (user) => {
    if (!user.bannedUntil) return false;
    return new Date(user.bannedUntil) > new Date();
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);

    const isUserAdmin = u.roles?.includes('ROLE_ADMIN') || u.roles?.includes('ROLE_SUPER_ADMIN');
    const isUserMentor = u.roles?.includes('ROLE_MENTOR');
    const isUserStudent = u.roles?.includes('ROLE_STUDENT');
    
    const matchesRole = 
      roleFilter === 'ALL' ||
      (roleFilter === 'ADMIN' && isUserAdmin) ||
      (roleFilter === 'MENTOR' && isUserMentor) ||
      (roleFilter === 'STUDENT' && isUserStudent);

    const userSuspended = isBanned(u);
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'BANNED' && userSuspended) ||
      (statusFilter === 'ACTIVE' && !userSuspended);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const statsCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: HiOutlineUserGroup, color: 'from-blue-600 to-cyan-500' },
    { label: 'Mock Interviews', value: stats.totalInterviews, icon: HiOutlineClipboardList, color: 'from-emerald-500 to-teal-500' },
    { label: 'Resumes Analyzed', value: stats.totalResumes, icon: HiOutlineDocumentText, color: 'from-amber-500 to-orange-500' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 font-medium">Loading administrative dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineShieldCheck className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-primary-400 font-medium">Security & Administration</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">
            Admin Panel
          </h1>
          <p className="text-gray-400 mt-2">Manage user roles, ban/unban status, and monitor system metrics.</p>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 text-gray-300 hover:text-white rounded-xl transition-all font-medium"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-primary-500/20"
          >
            <HiOutlineUserAdd className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={card.label}
            className="glass-card p-6 animate-slide-up flex items-center gap-5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-4 rounded-xl bg-gradient-to-br ${card.color} shadow-lg text-white`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">{card.label}</p>
              <h3 className="text-2xl font-display font-bold text-white mt-1">
                {card.value.toLocaleString()}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Directory Section */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-display font-bold text-white mb-6">User Directory</h2>

        {/* Filters and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-6 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="admin-user-search"
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3 relative">
            <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              id="admin-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900 border border-white/10 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="MENTOR">Mentors</option>
              <option value="STUDENT">Students</option>
            </select>
          </div>

          <div className="sm:col-span-6 lg:col-span-3 relative">
            <HiOutlineShieldExclamation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-900 border border-white/10 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table / List */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
            <HiOutlineUserGroup className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-sm font-medium">No users match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-4">User</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isAdminUser = u.roles?.includes('ROLE_ADMIN');
                  const userSuspended = isBanned(u);
                  const isPrimaryAdmin = u.email?.toLowerCase() === 'admin@interviewiq.com';
                  const isSelf = u.id === currentUser?.id;

                  // Get initials for profile fallback
                  const initials = u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U';

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {initials.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                              {u.fullName} {isSelf && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full ml-1.5 font-normal">You</span>}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><HiOutlineMail className="w-3.5 h-3.5" />{u.email}</span>
                              {u.phone && <span className="flex items-center gap-1"><HiOutlinePhone className="w-3.5 h-3.5" />{u.phone}</span>}
                            </div>
                            {u.idCardPath && (
                              <button
                                type="button"
                                onClick={() => setSelectedIdCard({ fullName: u.fullName, path: u.idCardPath })}
                                className="flex items-center gap-1 text-[10px] text-primary-400 hover:text-primary-300 hover:underline mt-1 bg-primary-500/5 hover:bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20 w-fit transition-colors font-medium"
                              >
                                <HiOutlineIdentification className="w-3.5 h-3.5" /> Verification ID Card
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 vertical-align-middle">
                        <div className="flex gap-1.5 flex-wrap">
                          {u.roles?.map(roleName => {
                            const cleanName = roleName.replace('ROLE_', '');
                            const isRoleAdmin = roleName === 'ROLE_ADMIN' || roleName === 'ROLE_SUPER_ADMIN';
                            const isRoleMentor = roleName === 'ROLE_MENTOR';
                            return (
                              <span
                                key={roleName}
                                className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider
                                  ${isRoleAdmin 
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                    : isRoleMentor
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                              >
                                {cleanName}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {userSuspended ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold w-fit">
                              <HiOutlineBan className="w-3.5 h-3.5" /> Suspended
                            </span>
                            <span className="text-[10px] text-gray-600 mt-1">
                              Until {new Date(u.bannedUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Admin Action */}
                          <button
                            onClick={() => handleToggleAdmin(u.id, u.email, isAdminUser)}
                            disabled={isPrimaryAdmin || isSelf}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all
                              ${isPrimaryAdmin || isSelf
                                ? 'opacity-30 cursor-not-allowed border-white/5 text-gray-600'
                                : isAdminUser
                                  ? 'bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/30'
                                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10 hover:border-white/20'}`}
                            title={isAdminUser ? "Demote from Admin" : "Promote to Admin"}
                          >
                            <HiOutlineShieldExclamation className="w-4 h-4" />
                            <span className="hidden sm:inline">{isAdminUser ? 'Revoke Admin' : 'Make Admin'}</span>
                          </button>

                          {/* Suspension Action */}
                          <button
                            onClick={() => handleBanUser(u.id, u.email, userSuspended)}
                            disabled={isPrimaryAdmin || isSelf}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all
                              ${isPrimaryAdmin || isSelf
                                ? 'opacity-30 cursor-not-allowed border-white/5 text-gray-600'
                                : userSuspended
                                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/30'
                                  : 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/30'}`}
                            title={userSuspended ? "Unsuspend account" : "Suspend account (24h)"}
                          >
                            {userSuspended ? <HiOutlineUserAdd className="w-4 h-4" /> : <HiOutlineBan className="w-4 h-4" />}
                            <span className="hidden sm:inline">{userSuspended ? 'Activate' : 'Suspend'}</span>
                          </button>

                          {/* Permanent Deletion Action */}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={isPrimaryAdmin || isSelf}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all
                              ${isPrimaryAdmin || isSelf
                                ? 'opacity-30 cursor-not-allowed border-white/5 text-gray-600'
                                : 'bg-red-500/5 hover:bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/30'}`}
                            title="Delete User Permanently"
                          >
                            <HiOutlineUserRemove className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <HiOutlineUserAdd className="w-5 h-5 text-primary-400" /> Create User Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mentor Joe"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mentor.joe@platform.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Education Details</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Bombay, B.Tech"
                  value={newUserForm.education}
                  onChange={(e) => setNewUserForm({ ...newUserForm, education: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Platform Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="input-field w-full appearance-none cursor-pointer bg-slate-900 text-white"
                >
                  <option value="ROLE_STUDENT" className="bg-slate-900 text-white">Student (Standard user)</option>
                  <option value="ROLE_MENTOR" className="bg-slate-900 text-white">Mentor (Reviewer/Adviser)</option>
                  <option value="ROLE_ADMIN" className="bg-slate-900 text-white">Administrator (Branding/API config)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification ID Modal */}
      {selectedIdCard && (
        <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <HiOutlineIdentification className="w-5 h-5 text-primary-400" /> Verification ID Card
              </h3>
              <button
                onClick={() => setSelectedIdCard(null)}
                className="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-300 mb-4">
                Verification ID uploaded by <span className="font-semibold text-white">{selectedIdCard.fullName}</span>:
              </p>
              
              <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black/30 max-h-[60vh] w-full flex items-center justify-center">
                <img
                  src={(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '') + selectedIdCard.path}
                  alt={`${selectedIdCard.fullName}'s ID Card`}
                  className="max-h-[50vh] max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Image+Load+Failed';
                  }}
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/[0.01] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedIdCard(null)}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

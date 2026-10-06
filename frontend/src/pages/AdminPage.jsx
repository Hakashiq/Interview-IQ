import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api, { getServerBaseUrl } from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineDocumentText,
  HiOutlineShieldExclamation, HiOutlineUserRemove, HiOutlineUserAdd,
  HiOutlineSearch, HiOutlineFilter, HiOutlineShieldCheck,
  HiOutlineBan, HiOutlineRefresh, HiOutlineMail, HiOutlinePhone,
  HiOutlineIdentification, HiOutlineX
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
    toast.success('Directory metrics refreshed');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUserForm);
      toast.success('User account registered successfully ✨');
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
      toast.error('Cannot delete primary system administrator');
      return;
    }
    if (userId === currentUser?.id) {
      toast.error('Cannot delete your own administrator session');
      return;
    }

    const confirm = window.confirm(`Permanently remove ${userEmail} and all related interview logs?`);
    if (!confirm) return;

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      toast.success(res.data?.message || 'User deleted successfully 🗑️');
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
      toast.error('Cannot alter self administrative status');
      return;
    }

    try {
      const res = await api.post(`/admin/users/${userId}/toggle-admin`);
      toast.success(res.data?.message || 'Administrative permissions updated');

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
      toast.error('Cannot suspend primary system administrator');
      return;
    }
    if (userId === currentUser?.id) {
      toast.error('Cannot suspend current active session');
      return;
    }

    try {
      const endpoint = currentlyBanned ? 'unban' : 'ban';
      const res = await api.post(`/admin/users/${userId}/${endpoint}`);
      toast.success(res.data?.message || 'User suspension status updated');

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

  const isBanned = (user) => {
    if (!user.bannedUntil) return false;
    return new Date(user.bannedUntil) > new Date();
  };

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
    { label: 'Registered Candidates', value: stats.totalUsers, icon: HiOutlineUserGroup, hint: 'All users on platform' },
    { label: 'Simulations Run', value: stats.totalInterviews, icon: HiOutlineClipboardList, hint: 'Completed interviews' },
    { label: 'Resumes Processed', value: stats.totalResumes, icon: HiOutlineDocumentText, hint: 'Parsed by ATS engine' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Loading administrative registry...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Super Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              Administration & Security Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit registered candidate accounts, toggle administrative access, inspect verification IDs, and control suspensions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
            >
              <HiOutlineRefresh className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
            >
              <HiOutlineUserAdd className="w-3.5 h-3.5" />
              <span>Register User</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-600">{card.label}</p>
                <h3 className="text-2xl font-display font-bold text-slate-900 mt-1">
                  {card.value.toLocaleString()}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.hint}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Directory Section */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">User Account Registry</h2>
              <p className="text-xs text-slate-500">Filter and manage user permissions</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredUsers.length} records matching
            </span>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-user-search"
                type="text"
                placeholder="Search candidate name, email, or contact number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-3 relative">
              <select
                id="admin-role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Administrators</option>
                <option value="MENTOR">Mentors</option>
                <option value="STUDENT">Students</option>
              </select>
            </div>

            <div className="sm:col-span-3 relative">
              <select
                id="admin-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="BANNED">Suspended (24h)</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
              <HiOutlineUserGroup className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No user accounts match current search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                    <th className="p-3.5">User Identity</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Security Status</th>
                    <th className="p-3.5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => {
                    const isAdminUser = u.roles?.includes('ROLE_ADMIN');
                    const userSuspended = isBanned(u);
                    const isPrimaryAdmin = u.email?.toLowerCase() === 'admin@interviewiq.com';
                    const isSelf = u.id === currentUser?.id;
                    const initials = u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {initials.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {u.fullName} {isSelf && <span className="badge-neutral text-[9px] ml-1">You</span>}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                                <span>{u.email}</span>
                                {u.phone && <span>• {u.phone}</span>}
                              </div>
                              {u.idCardPath && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedIdCard({ fullName: u.fullName, path: u.idCardPath })}
                                  className="text-[10px] text-blue-600 hover:underline mt-1 flex items-center gap-1 font-medium"
                                >
                                  <HiOutlineIdentification className="w-3 h-3" />
                                  <span>View Verification ID</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex gap-1 flex-wrap">
                            {u.roles?.map(roleName => {
                              const cleanName = roleName.replace('ROLE_', '');
                              const isRoleAdmin = roleName === 'ROLE_ADMIN' || roleName === 'ROLE_SUPER_ADMIN';
                              const isRoleMentor = roleName === 'ROLE_MENTOR';
                              return (
                                <span
                                  key={roleName}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                                    isRoleAdmin
                                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                                      : isRoleMentor
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {cleanName}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="p-3.5">
                          {userSuspended ? (
                            <span className="badge-danger text-[10px] font-semibold uppercase">
                              Suspended
                            </span>
                          ) : (
                            <span className="badge-success text-[10px] font-semibold uppercase">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleAdmin(u.id, u.email, isAdminUser)}
                              disabled={isPrimaryAdmin || isSelf}
                              className="btn-secondary text-[11px] py-1 px-2.5 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                            >
                              {isAdminUser ? 'Demote' : 'Promote Admin'}
                            </button>

                            <button
                              onClick={() => handleBanUser(u.id, u.email, userSuspended)}
                              disabled={isPrimaryAdmin || isSelf}
                              className={`text-[11px] py-1 px-2.5 rounded-lg border font-semibold transition-all ${
                                isPrimaryAdmin || isSelf
                                  ? 'opacity-30 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                                  : userSuspended
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {userSuspended ? 'Unsuspend' : 'Suspend'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              disabled={isPrimaryAdmin || isSelf}
                              className="btn-danger text-[11px] py-1 px-2.5 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                            >
                              Delete
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
          <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-subtle animate-scale-up overflow-hidden space-y-4 p-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HiOutlineUserAdd className="w-5 h-5 text-blue-600" />
                  Register Candidate Account
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Candidate name"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@domain.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Education Credentials</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech Computer Science"
                    value={newUserForm.education}
                    onChange={(e) => setNewUserForm({ ...newUserForm, education: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Role Allocation</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="input-field cursor-pointer appearance-none bg-slate-50"
                  >
                    <option value="ROLE_STUDENT">Student Candidate</option>
                    <option value="ROLE_MENTOR">Mentor Reviewer</option>
                    <option value="ROLE_ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs py-1.5 px-4 shadow-xs"
                  >
                    Confirm & Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Verification ID Modal */}
        {selectedIdCard && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-subtle animate-scale-up overflow-hidden space-y-4 p-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HiOutlineIdentification className="w-5 h-5 text-blue-600" />
                  Verification Document Preview
                </h3>
                <button
                  onClick={() => setSelectedIdCard(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600">
                Uploaded by <strong className="text-slate-900">{selectedIdCard.fullName}</strong>:
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 min-h-[30vh] max-h-[50vh] flex items-center justify-center p-2">
                {selectedIdCard.path?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-[45vh] flex flex-col items-center justify-center p-4 text-center">
                    <HiOutlineIdentification className="w-12 h-12 text-blue-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-800">PDF Verification Document</p>
                    <p className="text-xs text-slate-500 mb-4">This candidate uploaded an institutional PDF document.</p>
                    <a
                      href={getServerBaseUrl() + selectedIdCard.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      Open PDF in New Window ↗
                    </a>
                  </div>
                ) : (
                  <img
                    src={getServerBaseUrl() + selectedIdCard.path}
                    alt={`${selectedIdCard.fullName}'s ID Card`}
                    className="max-h-[45vh] max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/f8fafc/64748b?text=Image+Load+Failed';
                    }}
                  />
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdCard(null)}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

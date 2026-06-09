import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineShieldCheck,
  HiOutlineChartBar, HiOutlineClipboardList, HiOutlineTrendingUp,
  HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineCamera, HiOutlineLocationMarker, HiOutlineAcademicCap,
  HiOutlineLink, HiOutlineGlobeAlt, HiOutlineDocumentText
} from 'react-icons/hi';

export default function ProfilePage() {
  const { user } = useAuth();
  const avatarInputRef = useRef(null);

  // Profile fields state
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    education: '',
    address: '',
    githubUrl: '',
    linkedinUrl: '',
    leetcodeUrl: '',
    avatarUrl: ''
  });

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });
  const [savingProfile, setSavingProfile] = useState(false);
  const [importingResume, setImportingResume] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.data);
      } catch (err) {
        toast.error('Failed to load profile details');
      }
    };

    const fetchStats = async () => {
      try {
        const res = await api.get('/interviews/history');
        const interviews = res.data || [];
        const total = interviews.length;
        const avgScore = total > 0
          ? (interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / total).toFixed(1)
          : 0;
        const bestScore = total > 0
          ? Math.max(...interviews.map(i => i.overallScore || 0)).toFixed(1)
          : 0;
        setStats({ total, avgScore, bestScore });
      } catch {
        // Stats unavailable
      }
    };

    fetchProfileData();
    fetchStats();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', {
        fullName: profile.fullName,
        phone: profile.phone,
        education: profile.education,
        address: profile.address,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        leetcodeUrl: profile.leetcodeUrl
      });
      setProfile(res.data);

      // Update localStorage so other components see name updates
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.fullName = res.data.fullName;
      localStorage.setItem('user', JSON.stringify(storedUser));

      toast.success('Profile details saved! 🎉');
    } catch (err) {
      toast.error('Failed to save profile details');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const uploadToastId = toast.loading('Uploading profile picture...');
    try {
      const res = await api.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      toast.success('Profile picture updated! 📸', { id: uploadToastId });
    } catch (err) {
      toast.error('Failed to upload profile picture', { id: uploadToastId });
    }
  };

  const handleImportResume = async () => {
    setImportingResume(true);
    const importToastId = toast.loading('Auto-filling details from resume...');
    try {
      const res = await api.post('/users/profile/import-resume');
      setProfile(res.data);

      // Update localStorage name if it changed
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.fullName = res.data.fullName;
      localStorage.setItem('user', JSON.stringify(storedUser));

      toast.success('Profile auto-filled from your latest resume! 📄', { id: importToastId });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to auto-fill details. Make sure you upload a resume first.';
      toast.error(msg, { id: importToastId });
    } finally {
      setImportingResume(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully! 🔒');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarSrc = () => {
    if (!profile.avatarUrl) return null;
    if (profile.avatarUrl.startsWith('http')) return profile.avatarUrl;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${profile.avatarUrl}`;
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineUser className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Profile</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          My <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-gray-400 mt-2">Manage your account details, academic credentials, and links.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center animate-slide-up">
            {/* Avatar with Camera Icon Trigger */}
            <div
              onClick={handleAvatarClick}
              className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 via-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-500/30 cursor-pointer overflow-hidden border-2 border-white/10 hover:border-primary-500/50 transition-all duration-300"
            >
              {getAvatarSrc() ? (
                <img
                  src={getAvatarSrc()}
                  alt={profile.fullName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <span className="text-3xl font-bold text-white font-display">
                  {getInitials(profile.fullName || user?.fullName)}
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300">
                <HiOutlineCamera className="w-6 h-6 text-white" />
                <span className="text-[10px] font-medium mt-1">Change</span>
              </div>
            </div>
            
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />

            <h2 className="text-xl font-display font-bold text-white">{profile.fullName || user?.fullName || 'User'}</h2>
            <p className="text-gray-400 text-sm mt-1">{profile.email || user?.email}</p>
            <div className="mt-3">
              <span className="badge-info text-xs">{user?.roles?.[0]?.replace('ROLE_', '') || 'Student'}</span>
            </div>

            {/* Import Resume Details Button */}
            <button
              onClick={handleImportResume}
              disabled={importingResume}
              className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 hover:border-transparent text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <HiOutlineDocumentText className="w-4.5 h-4.5" />
              {importingResume ? 'Auto-filling...' : 'Auto-fill from Resume'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Interview Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Interviews', value: stats.total, icon: HiOutlineClipboardList, color: 'text-primary-400' },
                { label: 'Average Score', value: `${stats.avgScore}/10`, icon: HiOutlineTrendingUp, color: 'text-emerald-400' },
                { label: 'Best Score', value: `${stats.bestScore}/10`, icon: HiOutlineChartBar, color: 'text-amber-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit details form and change password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Details Form */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <HiOutlineSparkles className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-display font-semibold text-white">Profile Details</h3>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <HiOutlineUser className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={profile.fullName || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      <HiOutlineGlobeAlt className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <HiOutlineLocationMarker className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={profile.address || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="Street, City, Country"
                  />
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Education Credentials</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-gray-500">
                    <HiOutlineAcademicCap className="w-5 h-5" />
                  </div>
                  <textarea
                    value={profile.education || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                    className="input-field pl-10 pt-2 h-24 resize-none"
                    placeholder="Describe your degrees and academic history..."
                  />
                </div>
              </div>

              {/* Social / Developer Links */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                  <HiOutlineLink className="w-4.5 h-4.5 text-primary-400" />
                  Professional Links
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* GitHub */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">GitHub Link</label>
                    <input
                      type="url"
                      value={profile.githubUrl || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className="input-field py-1.5 text-sm"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">LinkedIn Link</label>
                    <input
                      type="url"
                      value={profile.linkedinUrl || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="input-field py-1.5 text-sm"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  {/* LeetCode */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">LeetCode Link</label>
                    <input
                      type="url"
                      value={profile.leetcodeUrl || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, leetcodeUrl: e.target.value }))}
                      className="input-field py-1.5 text-sm"
                      placeholder="https://leetcode.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Save Details
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <HiOutlineLockClosed className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-display font-semibold text-white">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showCurrentPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showNewPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                {changingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

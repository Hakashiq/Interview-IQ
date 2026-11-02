import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import api, { getServerBaseUrl } from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlineMail, HiOutlineLockClosed,
  HiOutlineChartBar, HiOutlineClipboardList, HiOutlineTrendingUp,
  HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineCamera, HiOutlineLocationMarker, HiOutlineAcademicCap,
  HiOutlineLink, HiOutlineGlobeAlt, HiOutlineDocumentText
} from 'react-icons/hi';
import { validatePassword } from '../utils/passwordValidator';
import PasswordRequirementsList from '../components/common/PasswordRequirementsList';

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

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.fullName = res.data.fullName;
      localStorage.setItem('user', JSON.stringify(storedUser));

      toast.success('Profile credentials saved ✨');
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

    const uploadToastId = toast.loading('Uploading profile image...');
    try {
      const res = await api.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      toast.success('Profile avatar updated 📸', { id: uploadToastId });
    } catch (err) {
      toast.error('Failed to upload profile picture', { id: uploadToastId });
    }
  };

  const handleImportResume = async () => {
    setImportingResume(true);
    const importToastId = toast.loading('Extracting attributes from your resume...');
    try {
      const res = await api.post('/users/profile/import-resume');
      setProfile(res.data);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.fullName = res.data.fullName;
      localStorage.setItem('user', JSON.stringify(storedUser));

      toast.success('Profile auto-populated from resume 📄', { id: importToastId });
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload a resume first to auto-fill details.';
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

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password updated successfully 🔒');
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
    return `${getServerBaseUrl()}${profile.avatarUrl}`;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Account Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Candidate Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal contact details, verified educational profile, and external portfolios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Avatar & Summary */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Identity Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center shadow-xs space-y-4">
              <div
                onClick={handleAvatarClick}
                className="group relative w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs cursor-pointer overflow-hidden border-2 border-white hover:ring-2 hover:ring-blue-500 transition-all"
                title="Click to change profile picture"
              >
                {getAvatarSrc() ? (
                  <img
                    src={getAvatarSrc()}
                    alt={profile.fullName}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <span className="text-2xl font-bold font-display">
                    {getInitials(profile.fullName || user?.fullName)}
                  </span>
                )}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <HiOutlineCamera className="w-5 h-5" />
                  <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Edit</span>
                </div>
              </div>

              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {profile.fullName || user?.fullName || 'Candidate'}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {profile.email || user?.email}
                </p>
                <div className="mt-2.5">
                  <span className="badge-neutral text-[10px] uppercase font-semibold">
                    {user?.roles?.[0]?.replace('ROLE_', '') || 'Student'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleImportResume}
                disabled={importingResume}
                className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <HiOutlineDocumentText className="w-4 h-4 text-slate-500" />
                <span>{importingResume ? 'Importing...' : 'Auto-fill from Resume'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                Simulation Performance
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-slate-600">
                    <HiOutlineClipboardList className="w-4 h-4 text-blue-600" />
                    <span>Total Interviews</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{stats.total}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-slate-600">
                    <HiOutlineTrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Average Score</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{stats.avgScore}/10</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 text-slate-600">
                    <HiOutlineChartBar className="w-4 h-4 text-amber-600" />
                    <span>Best Score</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{stats.bestScore}/10</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Profile Form */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900">Personal Details</h3>
                <p className="text-xs text-slate-500">Contact coordinates and education history</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={profile.fullName || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <HiOutlineGlobeAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location & Address
                  </label>
                  <div className="relative">
                    <HiOutlineLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={profile.address || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Background
                  </label>
                  <div className="relative">
                    <HiOutlineAcademicCap className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                    <textarea
                      value={profile.education || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                      className="input-field pl-10 h-20 resize-none leading-relaxed"
                      placeholder="e.g. B.Tech Computer Science, IIIT Hyderabad (2022-2026)"
                    />
                  </div>
                </div>

                {/* Social / Portfolios */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                    <HiOutlineLink className="w-3.5 h-3.5 text-blue-600" />
                    <span>External Engineering Profiles</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">GitHub URL</label>
                      <input
                        type="url"
                        value={profile.githubUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
                        className="input-field text-xs"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={profile.linkedinUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        className="input-field text-xs"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">LeetCode URL</label>
                      <input
                        type="url"
                        value={profile.leetcodeUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, leetcodeUrl: e.target.value }))}
                        className="input-field text-xs"
                        placeholder="https://leetcode.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-xs"
                  >
                    {savingProfile ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900">Security & Password</h3>
                <p className="text-xs text-slate-500">Update your account authentication credentials</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-field pr-10 font-mono"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pr-10 font-mono"
                        placeholder="Min 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field font-mono"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>

                {newPassword && (
                  <PasswordRequirementsList password={newPassword} />
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-secondary text-xs py-2 px-5 flex items-center gap-1.5 shadow-xs"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineLockClosed className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}

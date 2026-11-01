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
        <div className="pb-3 border-b border-ghost-ice/15">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="telemetry-chip-active text-[10px]">
              USR.01 // OPERATOR IDENTITY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tightest">
            Operator Profile &amp; Credentials
          </h1>
          <p className="text-xs sm:text-sm text-ghost-ice/60 font-ui mt-1">
            Manage your personal coordinates, educational pedigree, external code profiles, and security access keys.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Avatar & Summary */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Identity Card */}
            <div className="ghost-panel p-6 text-center space-y-4">
              <div
                onClick={handleAvatarClick}
                className="group relative w-20 h-20 rounded-2xl bg-ghost-blue text-white flex items-center justify-center mx-auto shadow-lg shadow-ghost-blue/30 cursor-pointer overflow-hidden border-2 border-ghost-ice/20 hover:border-ghost-blue transition-all"
                title="Click to update operator avatar"
              >
                {getAvatarSrc() ? (
                  <img
                    src={getAvatarSrc()}
                    alt={profile.fullName}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <span className="text-2xl font-bold font-mono">
                    {getInitials(profile.fullName || user?.fullName)}
                  </span>
                )}
                <div className="absolute inset-0 bg-[#00050a]/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                  <HiOutlineCamera className="w-5 h-5 text-ghost-ice" />
                  <span className="text-[8px] uppercase font-mono tracking-widest mt-0.5">EDIT</span>
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
                <h2 className="text-base font-display font-bold text-white">
                  {profile.fullName || user?.fullName || 'Operator'}
                </h2>
                <p className="text-xs text-ghost-ice/50 font-mono mt-0.5">
                  {profile.email || user?.email}
                </p>
                <div className="mt-2.5">
                  <span className="telemetry-chip text-[9px]">
                    {user?.roles?.[0]?.replace('ROLE_', '') || 'OPERATOR'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleImportResume}
                disabled={importingResume}
                className="ghost-button-void w-full text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <HiOutlineDocumentText className="w-4 h-4 text-ghost-blue" />
                <span>{importingResume ? 'EXTRACTING SPEC...' : 'AUTO-FILL FROM RESUME'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="ghost-panel p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-ghost-ice/15 pb-2">
                Simulation Performance
              </h3>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#000307]/70 border border-ghost-ice/15">
                  <div className="flex items-center gap-2 text-ghost-ice/70">
                    <HiOutlineClipboardList className="w-4 h-4 text-ghost-blue" />
                    <span>Total Runs</span>
                  </div>
                  <span className="font-bold text-white">{stats.total}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#000307]/70 border border-ghost-ice/15">
                  <div className="flex items-center gap-2 text-ghost-ice/70">
                    <HiOutlineTrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Mean Score</span>
                  </div>
                  <span className="font-bold text-white">{stats.avgScore}/10</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#000307]/70 border border-ghost-ice/15">
                  <div className="flex items-center gap-2 text-ghost-ice/70">
                    <HiOutlineChartBar className="w-4 h-4 text-amber-400" />
                    <span>Peak Record</span>
                  </div>
                  <span className="font-bold text-white">{stats.bestScore}/10</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Profile Form */}
            <div className="ghost-panel p-6 sm:p-7 space-y-5">
              <div className="border-b border-ghost-ice/15 pb-3">
                <h3 className="text-base font-display font-bold text-white">Identity Details</h3>
                <p className="text-xs text-ghost-ice/50 font-ui">Contact coordinates and educational credentials</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                      <input
                        type="text"
                        value={profile.fullName || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                        className="ghost-input pl-10"
                        placeholder="Alex Chen"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                      Phone Coordinate
                    </label>
                    <div className="relative">
                      <HiOutlineGlobeAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="ghost-input pl-10"
                        placeholder="+1 555-0199"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                    Geographic Location
                  </label>
                  <div className="relative">
                    <HiOutlineLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                    <input
                      type="text"
                      value={profile.address || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      className="ghost-input pl-10"
                      placeholder="San Francisco, CA, United States"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                    Academic Background
                  </label>
                  <div className="relative">
                    <HiOutlineAcademicCap className="absolute left-3.5 top-3 text-ghost-ice/40 w-4 h-4" />
                    <textarea
                      value={profile.education || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                      className="ghost-input pl-10 h-20 resize-none leading-relaxed"
                      placeholder="e.g. B.S. Computer Science, Stanford University (2022-2026)"
                    />
                  </div>
                </div>

                {/* Social / Portfolios */}
                <div className="pt-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-ghost-ice/15 pb-2 mb-3 flex items-center gap-1.5">
                    <HiOutlineLink className="w-3.5 h-3.5 text-ghost-blue" />
                    <span>External Code Repositories</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                    <div>
                      <label className="block text-[10px] uppercase text-ghost-ice/60 mb-1">GitHub Endpoint</label>
                      <input
                        type="url"
                        value={profile.githubUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, githubUrl: e.target.value }))}
                        className="ghost-input text-xs"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-ghost-ice/60 mb-1">LinkedIn Endpoint</label>
                      <input
                        type="url"
                        value={profile.linkedinUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        className="ghost-input text-xs"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-ghost-ice/60 mb-1">LeetCode Endpoint</label>
                      <input
                        type="url"
                        value={profile.leetcodeUrl || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, leetcodeUrl: e.target.value }))}
                        className="ghost-input text-xs"
                        placeholder="https://leetcode.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="ghost-button-blue text-xs py-2 px-6 flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>COMMITTING CHANGES...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span>SAVE PROFILE SPECIFICATIONS</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="ghost-panel p-6 sm:p-7 space-y-4">
              <div className="border-b border-ghost-ice/15 pb-3">
                <h3 className="text-base font-display font-bold text-white">Access Key &amp; Security</h3>
                <p className="text-xs text-ghost-ice/50 font-ui">Update your account authentication credentials</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                    Current Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="ghost-input pr-10 font-mono"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ghost-ice/40 hover:text-white"
                    >
                      {showCurrentPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                      New Access Key
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="ghost-input pr-10 font-mono"
                        placeholder="Min 8 chars"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ghost-ice/40 hover:text-white"
                      >
                        {showNewPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                      Confirm Key
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="ghost-input font-mono"
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
                    className="ghost-button-void text-xs py-2 px-5 flex items-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-ghost-blue border-t-transparent rounded-full animate-spin" />
                        <span>ROTATING KEY...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineLockClosed className="w-3.5 h-3.5 text-ghost-blue" />
                        <span>ROTATE ACCESS KEY</span>
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

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineCog, HiOutlineBell, HiOutlineAcademicCap,
  HiOutlineUser, HiOutlineMail, HiOutlineShieldCheck,
  HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineGlobe,
  HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineFolderOpen, HiOutlineChevronRight, HiOutlineDeviceMobile,
  HiOutlineCreditCard, HiOutlineTerminal, HiOutlineDatabase,
  HiOutlineCurrencyDollar, HiOutlineCollection, HiOutlineDocumentText,
  HiOutlineKey, HiOutlineExclamation
} from 'react-icons/hi';

function ToggleSwitch({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors border border-white/5">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          enabled ? 'bg-primary-500' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ROLE_SUPER_ADMIN');

  // Active Tab state
  const [activeTab, setActiveTab] = useState('profile');

  // --- USER SETTINGS STATE ---
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: '',
    education: '',
    address: '',
    githubUrl: '',
    linkedinUrl: '',
    leetcodeUrl: '',
    avatarUrl: ''
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [interviewPrefs, setInterviewPrefs] = useState(() => {
    const saved = localStorage.getItem('interview-preferences');
    return saved ? JSON.parse(saved) : {
      language: 'English',
      difficulty: 'MEDIUM',
      duration: 30,
      voiceEnabled: true,
      textEnabled: true,
      webcamEnabled: true,
      microphoneEnabled: true,
      aiPersonality: 'Professional',
      domains: ['Java', 'React', 'DSA'],
      interviewerAvatar: 'Neha'
    };
  });

  const [resumePrefs, setResumePrefs] = useState({
    targetRole: 'Backend Developer',
    visibility: 'PRIVATE',
    defaultResumeId: ''
  });

  const [learningGoals, setLearningGoals] = useState({
    dailyPracticeGoal: 30,
    weeklyTargets: 3,
    weakTopicTracking: true,
    personalizedRecommendations: true
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    interviewReminders: true,
    practiceReminders: true,
    weeklyReport: false,
    productUpdates: true
  });

  const [appearance, setAppearance] = useState({
    theme: localStorage.getItem('theme')?.toUpperCase() || 'LIGHT',
    fontSize: 'MEDIUM'
  });

  const [privacy, setPrivacy] = useState({
    profileStatus: 'PRIVATE',
    dataSharing: false,
    activityVisibility: 'MENTOR_ONLY'
  });

  // --- ADMIN SETTINGS STATE (Dynamically Loaded from SystemConfig) ---
  const [adminConfigs, setAdminConfigs] = useState({
    platform_name: 'InterviewIQ',
    platform_logo: 'IQ',
    maintenance_mode: 'false',
    default_timezone: 'UTC',
    platform_announcement: 'Welcome to InterviewIQ Admin Platform!',
    max_daily_interviews: '10',
    default_interview_duration: '30',
    adaptive_interview_enabled: 'true',
    default_ai_provider: 'gemini',
    default_ai_model: 'gemini-2.0-flash',
    ai_temperature: '0.7',
    evaluation_strictness: 'MEDIUM',
    ats_passing_score: '7.0',
    ats_keyword_weight: '0.3',
    ats_project_weight: '0.2',
    ats_skills_weight: '0.2',
    ats_experience_weight: '0.2',
    ats_grammar_weight: '0.1',
    openai_api_key: 'sk-proj-********************',
    gemini_api_key: 'AIzaSy********************',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    daily_token_limit: '1000000',
    monthly_budget_limit: '500.0',
    jwt_session_timeout: '24',
    two_factor_enforced: 'false',
    backup_schedule: 'DAILY',
    data_retention_days: '90'
  });

  // Load User Profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error('Failed to load profile details in settings', err);
      }
    };
    fetchUserProfile();
  }, []);

  // Load Admin System Configs from MySQL if admin
  useEffect(() => {
    if (isAdmin) {
      const fetchAdminConfigs = async () => {
        try {
          const res = await api.get('/admin/system-config');
          if (res.data) {
            setAdminConfigs(prev => ({ ...prev, ...res.data }));
          }
        } catch (err) {
          console.error('Failed to fetch platform configurations', err);
        }
      };
      fetchAdminConfigs();
    }
  }, [isAdmin]);

  // --- SAVE HANDLERS ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
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
      setProfile(prev => ({ ...prev, ...res.data }));
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.fullName = res.data.fullName;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      toast.success('Profile details saved! 🎉');
    } catch (err) {
      toast.error('Failed to save profile details');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleSaveUserPrefs = (sectionName) => {
    if (sectionName === 'Interview') {
      localStorage.setItem('interview-preferences', JSON.stringify(interviewPrefs));
    } else if (sectionName === 'Appearance') {
      const selectedTheme = appearance.theme.toLowerCase();
      localStorage.setItem('theme', selectedTheme);
      if (selectedTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
    toast.success(`${sectionName} preferences updated! ✨`);
  };

  const handleSaveAdminConfig = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/system-config', adminConfigs);
      toast.success('System configurations successfully saved to MySQL database! 💾');
    } catch (err) {
      toast.error('Failed to save system configurations');
    }
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.');
    if (confirm) {
      toast.error('Account deletion simulation triggered. Please contact platform support.');
    }
  };

  const handleDownloadPersonalData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, interviewPrefs, resumePrefs, learningGoals, notifications }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `interview_iq_personal_data_${profile.fullName || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Your personal data download has started!');
  };

  // Nav list tabs configuration
  const userTabs = [
    { id: 'profile', label: 'Profile Settings', icon: HiOutlineUser },
    { id: 'interview', label: 'Interview Preferences', icon: HiOutlineAcademicCap },
    { id: 'resume', label: 'Resume & ATS Preferences', icon: HiOutlineFolderOpen },
    { id: 'learning', label: 'Learning Goals', icon: HiOutlineSparkles },
    { id: 'notifications', label: 'Notification Settings', icon: HiOutlineBell },
    { id: 'appearance', label: 'Appearance & Themes', icon: HiOutlineGlobe },
    { id: 'privacy', label: 'Privacy & Data Controls', icon: HiOutlineShieldCheck },
    { id: 'subscriptions', label: 'Subscriptions & Billing', icon: HiOutlineCreditCard },
  ];

  const adminTabs = [
    { id: 'platform', label: 'Platform Branding', icon: HiOutlineCog },
    { id: 'engine', label: 'Interview Engine', icon: HiOutlineCollection },
    { id: 'ai_config', label: 'AI Model Settings', icon: HiOutlineTerminal },
    { id: 'ats_engine', label: 'ATS Rule Engine', icon: HiOutlineDocumentText },
    { id: 'integrations', label: 'APIs & Integrations', icon: HiOutlineKey },
    { id: 'costs', label: 'Cost Management', icon: HiOutlineCurrencyDollar },
    { id: 'security_admin', label: 'Security Policies & RBAC', icon: HiOutlineLockClosed },
    { id: 'backup', label: 'Backup & Recovery', icon: HiOutlineDatabase },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineCog className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium font-display">Configuration Hub</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          System & Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-gray-400 mt-2">Manage your student account profile configurations or control platform-wide AI parameters.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Tabs Column */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          {/* User Settings group */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 font-display">User Personal Settings</h3>
            <nav className="space-y-1">
              {userTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500 font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                    <HiOutlineChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${active ? 'translate-x-1' : ''}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin settings group (Only visible to admin) */}
          {isAdmin && (
            <div className="glass-card p-4 border border-primary-500/20 shadow-lg shadow-primary-500/5">
              <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider px-3 mb-2 font-display">Platform Administration</h3>
              <nav className="space-y-1">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-primary-500/15 text-primary-300 border-l-2 border-primary-400 font-semibold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </div>
                      <HiOutlineChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${active ? 'translate-x-1' : ''}`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Right Settings Form Content Column */}
        <div className="flex-1 min-w-0">
          {/* USER TABS */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineUser className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Profile Settings</h2>
                  <p className="text-xs text-gray-400">Update your account name, avatar, and contact info.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="input-field"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="input-field opacity-60 cursor-not-allowed"
                      title="Email address cannot be changed."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="input-field"
                      placeholder="e.g. +1 555 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Location / Address</label>
                    <input
                      type="text"
                      value={profile.address || ''}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="input-field"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Education</label>
                  <textarea
                    value={profile.education || ''}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    rows={3}
                    className="input-field font-sans"
                    placeholder="Describe your degrees, colleges, and GPA..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">GitHub URL</label>
                    <input
                      type="url"
                      value={profile.githubUrl || ''}
                      onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                      className="input-field text-xs"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profile.linkedinUrl || ''}
                      onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                      className="input-field text-xs"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">LeetCode URL</label>
                    <input
                      type="url"
                      value={profile.leetcodeUrl || ''}
                      onChange={(e) => setProfile({ ...profile, leetcodeUrl: e.target.value })}
                      className="input-field text-xs"
                      placeholder="https://leetcode.com/..."
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-6">
                  <button
                    type="button"
                    onClick={handleDownloadPersonalData}
                    className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    Download Personal Data (JSON)
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineAcademicCap className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Interview Preferences</h2>
                  <p className="text-xs text-gray-400">Configure how you generate mock interview sessions by default.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Preferred Interview Language</label>
                  <select
                    value={interviewPrefs.language}
                    onChange={(e) => setInterviewPrefs({ ...interviewPrefs, language: e.target.value })}
                    className="input-field w-full md:w-64 appearance-none"
                  >
                    <option value="English" className="bg-slate-900 text-white">English</option>
                    <option value="Spanish" className="bg-slate-900 text-white">Spanish</option>
                    <option value="French" className="bg-slate-900 text-white">French</option>
                    <option value="German" className="bg-slate-900 text-white">German</option>
                    <option value="Hindi" className="bg-slate-900 text-white">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3">Preferred Domains & Technologies</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Java', 'Python', 'DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'System Design', 'Spring Boot', 'React', 'DevOps', 'Cloud', 'HR'].map((domain) => {
                      const selected = interviewPrefs.domains.includes(domain);
                      return (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setInterviewPrefs({ ...interviewPrefs, domains: interviewPrefs.domains.filter(d => d !== domain) });
                            } else {
                              setInterviewPrefs({ ...interviewPrefs, domains: [...interviewPrefs.domains, domain] });
                            }
                          }}
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 ${
                            selected
                              ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          {domain}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Preferred Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setInterviewPrefs({ ...interviewPrefs, difficulty: level })}
                          className={`py-2 px-3 rounded-lg border text-center text-xs font-bold transition-all ${
                            interviewPrefs.difficulty === level
                              ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                              : 'border-white/10 bg-white/5 text-gray-400'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Default Duration (Minutes)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="5"
                        value={interviewPrefs.duration}
                        onChange={(e) => setInterviewPrefs({ ...interviewPrefs, duration: parseInt(e.target.value) })}
                        className="flex-1 accent-primary-500"
                      />
                      <span className="text-sm font-bold text-white whitespace-nowrap">{interviewPrefs.duration} Mins</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-sm text-gray-400">Interaction & Hardware Toggles</label>
                  <ToggleSwitch
                    enabled={interviewPrefs.voiceEnabled}
                    onChange={(v) => setInterviewPrefs({ ...interviewPrefs, voiceEnabled: v })}
                    label="Enable Voice Interviews"
                    description="Responds using AI voice synthesis and processes spoken answers."
                  />
                  <ToggleSwitch
                    enabled={interviewPrefs.webcamEnabled}
                    onChange={(v) => setInterviewPrefs({ ...interviewPrefs, webcamEnabled: v })}
                    label="Webcam Monitoring"
                    description="Capture webcam feed to log posture and focus indicators."
                  />
                  <ToggleSwitch
                    enabled={interviewPrefs.microphoneEnabled}
                    onChange={(v) => setInterviewPrefs({ ...interviewPrefs, microphoneEnabled: v })}
                    label="Microphone Enabled"
                    description="Allow platform speech recognition engines to transcribe responses."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">AI Interviewer Personality</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Professional', 'Friendly', 'Strict', 'Challenging'].map((personality) => (
                      <button
                        key={personality}
                        type="button"
                        onClick={() => setInterviewPrefs({ ...interviewPrefs, aiPersonality: personality })}
                        className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                          interviewPrefs.aiPersonality === personality
                            ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                            : 'border-white/10 bg-white/5 text-gray-400'
                        }`}
                      >
                        {personality}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3 font-display">AI Interviewer Avatar</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'Neha', name: 'Neha', desc: 'Indian Recruiter (Female)', emoji: '👩‍💼' },
                      { id: 'Aditya', name: 'Aditya', desc: 'Tech Lead (Male)', emoji: '👨‍💼' },
                      { id: 'RoboRecruit', name: 'RoboRecruit', desc: 'AI Robot Coach', emoji: '🤖' }
                    ].map((avatar) => {
                      const isSelected = interviewPrefs.interviewerAvatar === avatar.id;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setInterviewPrefs({ ...interviewPrefs, interviewerAvatar: avatar.id })}
                          className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5
                            ${isSelected
                              ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-lg shadow-primary-500/5'
                              : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}
                        >
                          <span className="text-2xl">{avatar.emoji}</span>
                          <span className="text-xs font-semibold text-white">{avatar.name}</span>
                          <span className="text-[10px] text-gray-500 leading-tight">{avatar.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button type="button" onClick={() => handleSaveUserPrefs('Interview')} className="btn-primary">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineFolderOpen className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Resume & ATS Preferences</h2>
                  <p className="text-xs text-gray-400">Configure target jobs and resume parser rules.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">ATS Target Role</label>
                  <select
                    value={resumePrefs.targetRole}
                    onChange={(e) => setResumePrefs({ ...resumePrefs, targetRole: e.target.value })}
                    className="input-field w-full max-w-md"
                  >
                    <option value="Backend Developer" className="bg-slate-900 text-white">Backend Developer</option>
                    <option value="Frontend Developer" className="bg-slate-900 text-white">Frontend Developer</option>
                    <option value="Full Stack Developer" className="bg-slate-900 text-white">Full Stack Developer</option>
                    <option value="Data Analyst" className="bg-slate-900 text-white">Data Analyst</option>
                    <option value="DevOps Engineer" className="bg-slate-900 text-white">DevOps Engineer</option>
                    <option value="Software Engineer" className="bg-slate-900 text-white">Software Engineer</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">The ATS evaluator compares your resumes against keyword requirements for this role type.</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-2">Resume Visibility</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="PRIVATE"
                        checked={resumePrefs.visibility === 'PRIVATE'}
                        onChange={(e) => setResumePrefs({ ...resumePrefs, visibility: e.target.value })}
                        className="accent-primary-500"
                      />
                      Private (Only visible to you)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="PUBLIC"
                        checked={resumePrefs.visibility === 'PUBLIC'}
                        onChange={(e) => setResumePrefs({ ...resumePrefs, visibility: e.target.value })}
                        className="accent-primary-500"
                      />
                      Public (Searchable by Mentors)
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button type="button" onClick={() => handleSaveUserPrefs('Resume & ATS')} className="btn-primary">
                    Update Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineSparkles className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Learning Preferences</h2>
                  <p className="text-xs text-gray-400">Track targets and personalize automated roadmap schedules.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Daily Practice Goal (Minutes)</label>
                    <select
                      value={learningGoals.dailyPracticeGoal}
                      onChange={(e) => setLearningGoals({ ...learningGoals, dailyPracticeGoal: parseInt(e.target.value) })}
                      className="input-field w-full"
                    >
                      <option value="15" className="bg-slate-900 text-white">15 Minutes / Day</option>
                      <option value="30" className="bg-slate-900 text-white">30 Minutes / Day</option>
                      <option value="45" className="bg-slate-900 text-white">45 Minutes / Day</option>
                      <option value="60" className="bg-slate-900 text-white">60 Minutes / Day</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Weekly Interview Targets</label>
                    <select
                      value={learningGoals.weeklyTargets}
                      onChange={(e) => setLearningGoals({ ...learningGoals, weeklyTargets: parseInt(e.target.value) })}
                      className="input-field w-full"
                    >
                      <option value="1" className="bg-slate-900 text-white">1 Mock Session / Week</option>
                      <option value="3" className="bg-slate-900 text-white">3 Mock Sessions / Week</option>
                      <option value="5" className="bg-slate-900 text-white">5 Mock Sessions / Week</option>
                      <option value="10" className="bg-slate-900 text-white">10 Mock Sessions / Week</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <ToggleSwitch
                    enabled={learningGoals.weakTopicTracking}
                    onChange={(v) => setLearningGoals({ ...learningGoals, weakTopicTracking: v })}
                    label="Automated Weak-Topic Tracking"
                    description="Scans poor interview feedback domains to suggest relevant prep topics."
                  />
                  <ToggleSwitch
                    enabled={learningGoals.personalizedRecommendations}
                    onChange={(v) => setLearningGoals({ ...learningGoals, personalizedRecommendations: v })}
                    label="Personalized Learning Recommendations"
                    description="Generates weekly custom prep pathways using Gemini's advice."
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button type="button" onClick={() => handleSaveUserPrefs('Learning')} className="btn-primary">
                    Save Learning Goals
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineBell className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Notification Preferences</h2>
                  <p className="text-xs text-gray-400">Control how and when you receive alert messages.</p>
                </div>
              </div>

              <div className="space-y-4">
                <ToggleSwitch
                  enabled={notifications.emailNotifications}
                  onChange={(v) => setNotifications({ ...notifications, emailNotifications: v })}
                  label="Email Alerts"
                  description="Receive overall score updates and feedback summaries directly in inbox."
                />
                <ToggleSwitch
                  enabled={notifications.pushNotifications}
                  onChange={(v) => setNotifications({ ...notifications, pushNotifications: v })}
                  label="Browser Push Notifications"
                  description="Real-time alert popups when system operations complete."
                />
                <ToggleSwitch
                  enabled={notifications.interviewReminders}
                  onChange={(v) => setNotifications({ ...notifications, interviewReminders: v })}
                  label="Scheduled Interview Reminders"
                  description="Alerts before a booked session is scheduled to begin."
                />
                <ToggleSwitch
                  enabled={notifications.practiceReminders}
                  onChange={(v) => setNotifications({ ...notifications, practiceReminders: v })}
                  label="Daily Practice Reminders"
                  description="Friendly reminders to keep up your active LeetCode-style dashboard streak."
                />
                <ToggleSwitch
                  enabled={notifications.weeklyReport}
                  onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })}
                  label="Weekly Performance Reports"
                  description="Get deep insights detailing your ATS scores and overall progress trends."
                />

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button type="button" onClick={() => handleSaveUserPrefs('Notification')} className="btn-primary">
                    Save Alerts Config
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineGlobe className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Appearance Settings</h2>
                  <p className="text-xs text-gray-400">Customize visual theme and styling choices.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Theme Selection</label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button
                      type="button"
                      onClick={() => setAppearance({ ...appearance, theme: 'DARK' })}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-semibold transition-all ${
                        appearance.theme === 'DARK'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-950 border border-white/20" />
                      <span>Dark Theme (Default)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAppearance({ ...appearance, theme: 'LIGHT' });
                      }}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 font-semibold transition-all ${
                        appearance.theme === 'LIGHT'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-300" />
                      <span>Light Theme</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Font Size Preferences</label>
                  <div className="flex gap-2">
                    {['SMALL', 'MEDIUM', 'LARGE'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setAppearance({ ...appearance, fontSize: sz })}
                        className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                          appearance.fontSize === sz
                            ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                            : 'border-white/10 bg-white/5 text-gray-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button type="button" onClick={() => handleSaveUserPrefs('Appearance')} className="btn-primary">
                    Apply Layout Theme
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineShieldCheck className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Privacy & Data Controls</h2>
                  <p className="text-xs text-gray-400">Configure visibility bounds and request account deletions.</p>
                </div>
              </div>

              <div className="space-y-6">
                <ToggleSwitch
                  enabled={privacy.profileStatus === 'PUBLIC'}
                  onChange={(v) => setPrivacy({ ...privacy, profileStatus: v ? 'PUBLIC' : 'PRIVATE' })}
                  label="Public Profile Listing"
                  description="Allow other students or mentors to view your completed reports and ATS levels."
                />

                <ToggleSwitch
                  enabled={privacy.dataSharing}
                  onChange={(v) => setPrivacy({ ...privacy, dataSharing: v })}
                  label="Anonymized Data Sharing"
                  description="Share your mock response transcriptions to help retrain underlying AI evaluator weights."
                />

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mentor Activity Visibility</label>
                  <select
                    value={privacy.activityVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, activityVisibility: e.target.value })}
                    className="input-field w-full max-w-sm font-sans"
                  >
                    <option value="MENTOR_ONLY" className="bg-slate-900 text-white">Visible only to assigned mentors</option>
                    <option value="ALL_MENTORS" className="bg-slate-900 text-white">Searchable by all platform mentors</option>
                    <option value="NONE" className="bg-slate-900 text-white">Keep private from all mentors</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 mt-6">
                  <h3 className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-1">
                    <HiOutlineExclamation className="w-4 h-4" /> Danger Zone
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Deleting your account wipes out all active subscription records, resume analysis, and interview reports instantly.</p>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-all focus:outline-none"
                  >
                    Request Account Deletion
                  </button>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button type="button" onClick={() => handleSaveUserPrefs('Privacy')} className="btn-primary">
                    Update Privacy Setup
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineCreditCard className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Subscriptions & Billing</h2>
                  <p className="text-xs text-gray-400">View active membership details and review billing logs.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-600/30 to-purple-600/30 border border-primary-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-primary-300 font-bold font-display">Active Tier</span>
                    <h3 className="text-2xl font-bold text-white mt-1">Premium Unlimited</h3>
                    <p className="text-xs text-gray-300 mt-1">Next renewal date: July 12, 2026 ($19.00/month)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success('Redirecting to stripe checkout...')}
                    className="py-2 px-4 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Manage Subscription
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 font-display">Billing History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                          <th className="py-2">Date</th>
                          <th className="py-2">Invoice</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        <tr>
                          <td className="py-2.5">Jun 09, 2026</td>
                          <td className="py-2.5">INV-2026-004</td>
                          <td className="py-2.5">$19.00</td>
                          <td className="py-2.5"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">PAID</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5">May 09, 2026</td>
                          <td className="py-2.5">INV-2026-003</td>
                          <td className="py-2.5">$19.00</td>
                          <td className="py-2.5"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">PAID</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5">Apr 09, 2026</td>
                          <td className="py-2.5">INV-2026-002</td>
                          <td className="py-2.5">$19.00</td>
                          <td className="py-2.5"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">PAID</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security_admin' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineLockClosed className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Security Policies & RBAC</h2>
                  <p className="text-xs text-gray-400">Configure global JWT tokens expiration, session boundaries, and 2FA.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">JWT Session Expiration (Hours)</label>
                    <input
                      type="number"
                      required
                      value={adminConfigs.jwt_session_timeout}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, jwt_session_timeout: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Enforce Two-Factor Auth (Admins Only)</label>
                    <select
                      value={adminConfigs.two_factor_enforced}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, two_factor_enforced: e.target.value })}
                      className="input-field w-full font-sans"
                    >
                      <option value="false" className="bg-slate-900 text-white">Disabled</option>
                      <option value="true" className="bg-slate-900 text-white">Enforced</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Save Security Policies
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ADMIN TABS */}
          {activeTab === 'platform' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineCog className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Platform Branding Settings</h2>
                  <p className="text-xs text-gray-400">Edit general name and active maintenance toggles stored directly in MySQL.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Platform Display Name</label>
                    <input
                      type="text"
                      required
                      value={adminConfigs.platform_name}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, platform_name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Platform Logo Text</label>
                    <input
                      type="text"
                      required
                      value={adminConfigs.platform_logo}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, platform_logo: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Default Timezone</label>
                    <input
                      type="text"
                      value={adminConfigs.default_timezone}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, default_timezone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Maintenance Mode</label>
                    <select
                      value={adminConfigs.maintenance_mode}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, maintenance_mode: e.target.value })}
                      className="input-field w-full font-sans"
                    >
                      <option value="false" className="bg-slate-900 text-white">Inactive (Active for Students)</option>
                      <option value="true" className="bg-slate-900 text-white">Active (Show maintenance page)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Platform Global Announcement</label>
                  <input
                    type="text"
                    value={adminConfigs.platform_announcement}
                    onChange={(e) => setAdminConfigs({ ...adminConfigs, platform_announcement: e.target.value })}
                    className="input-field"
                    placeholder="Message visible on student dashboards..."
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Save Branding configs
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'engine' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineCollection className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Interview Engine Settings</h2>
                  <p className="text-xs text-gray-400">Configure parameters for mock question limits and adaptiveness.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Max Daily Interviews / User</label>
                    <input
                      type="number"
                      required
                      value={adminConfigs.max_daily_interviews}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, max_daily_interviews: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Default Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      value={adminConfigs.default_interview_duration}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, default_interview_duration: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Adaptive Difficulty Scoring</label>
                    <select
                      value={adminConfigs.adaptive_interview_enabled}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, adaptive_interview_enabled: e.target.value })}
                      className="input-field w-full font-sans"
                    >
                      <option value="true" className="bg-slate-900 text-white">Enabled (Dynamic Difficulty shift)</option>
                      <option value="false" className="bg-slate-900 text-white">Disabled (Standard static selection)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Save Engine Policies
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'ai_config' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineTerminal className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">AI Model Configurations</h2>
                  <p className="text-xs text-gray-400">Configure default providers and active generation metrics.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Default AI Provider</label>
                    <select
                      value={adminConfigs.default_ai_provider}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, default_ai_provider: e.target.value })}
                      className="input-field w-full font-sans"
                    >
                      <option value="gemini" className="bg-slate-900 text-white">Google Gemini API</option>
                      <option value="openai" className="bg-slate-900 text-white">OpenAI GPT Engines</option>
                      <option value="anthropic" className="bg-slate-900 text-white">Anthropic Claude</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Model Identifier</label>
                    <input
                      type="text"
                      required
                      value={adminConfigs.default_ai_model}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, default_ai_model: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Model Temperature (0.1 - 1.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1.0"
                      required
                      value={adminConfigs.ai_temperature}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, ai_temperature: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Evaluation Strictness</label>
                    <select
                      value={adminConfigs.evaluation_strictness}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, evaluation_strictness: e.target.value })}
                      className="input-field w-full font-sans"
                    >
                      <option value="EASY" className="bg-slate-900 text-white">Lax (Higher scores)</option>
                      <option value="MEDIUM" className="bg-slate-900 text-white">Balanced</option>
                      <option value="HARD" className="bg-slate-900 text-white">Strict Technical Rigor</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Apply LLM Configurations
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'ats_engine' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineDocumentText className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">ATS Rule Engine Settings</h2>
                  <p className="text-xs text-gray-400">Configure weighting values used to analyze uploaded resume files.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">ATS Passing Score threshold</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={adminConfigs.ats_passing_score}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, ats_passing_score: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Keyword Match weight</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={adminConfigs.ats_keyword_weight}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, ats_keyword_weight: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Project Relevance weight</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={adminConfigs.ats_project_weight}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, ats_project_weight: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Skill Validation weight</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={adminConfigs.ats_skills_weight}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, ats_skills_weight: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Experience Match weight</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={adminConfigs.ats_experience_weight}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, ats_experience_weight: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Grammar & Format weight</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={adminConfigs.ats_grammar_weight}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, ats_grammar_weight: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Update ATS weights
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'integrations' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineKey className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">APIs & Service Integrations</h2>
                  <p className="text-xs text-gray-400">Configure key values used to connect to third-party endpoints.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">OpenAI Platform Key</label>
                    <input
                      type="password"
                      required
                      value={adminConfigs.openai_api_key}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, openai_api_key: e.target.value })}
                      className="input-field font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Google Gemini API Key</label>
                    <input
                      type="password"
                      required
                      value={adminConfigs.gemini_api_key}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, gemini_api_key: e.target.value })}
                      className="input-field font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">SMTP Host Address</label>
                      <input
                        type="text"
                        required
                        value={adminConfigs.smtp_host}
                        onChange={(e) => setAdminConfigs({ ...adminConfigs, smtp_host: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">SMTP Port Number</label>
                      <input
                        type="number"
                        required
                        value={adminConfigs.smtp_port}
                        onChange={(e) => setAdminConfigs({ ...adminConfigs, smtp_port: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Update Integrations Keys
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'costs' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineCurrencyDollar className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Cost Management</h2>
                  <p className="text-xs text-gray-400">Track LLM token limitations and restrict monthly budgets.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Daily Token Ceiling</label>
                    <input
                      type="number"
                      required
                      value={adminConfigs.daily_token_limit}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, daily_token_limit: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Monthly AI Spending Limit ($)</label>
                    <input
                      type="number"
                      step="10.0"
                      required
                      value={adminConfigs.monthly_budget_limit}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, monthly_budget_limit: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Apply Budget Controls
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'backup' && isAdmin && (
            <div className="glass-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <HiOutlineDatabase className="w-6 h-6 text-primary-400" />
                <div>
                  <h2 className="text-xl font-display font-semibold text-white">Backup & Recovery</h2>
                  <p className="text-xs text-gray-400">Configure automated backup intervals and logs retention.</p>
                </div>
              </div>

              <form onSubmit={handleSaveAdminConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Database Backup Schedule</label>
                    <select
                      value={adminConfigs.backup_schedule}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, backup_schedule: e.target.value })}
                      className="input-field w-full font-sans"
                    >
                      <option value="DAILY" className="bg-slate-900 text-white">Daily Backup</option>
                      <option value="WEEKLY" className="bg-slate-900 text-white">Weekly Backup</option>
                      <option value="MONTHLY" className="bg-slate-900 text-white">Monthly Backup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Logs Data Retention (Days)</label>
                    <input
                      type="number"
                      required
                      value={adminConfigs.data_retention_days}
                      onChange={(e) => setAdminConfigs({ ...adminConfigs, data_retention_days: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                  <button type="submit" className="btn-primary">
                    Save Recovery Schedule
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

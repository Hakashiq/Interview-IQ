import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';
import {
  HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineLightningBolt,
  HiOutlineArrowRight, HiOutlineClock, HiOutlineSparkles,
  HiOutlineChartBar, HiOutlineCode, HiOutlineCalendar
} from 'react-icons/hi';

const jobRoles = [
  { id: 'SDE', label: 'Software Engineer', icon: HiOutlineCode, color: 'from-blue-600 to-cyan-500' },
  { id: 'Full Stack', label: 'Full Stack Developer', icon: HiOutlineLightningBolt, color: 'from-emerald-500 to-teal-500' },
  { id: 'Backend', label: 'Backend Developer', icon: HiOutlineClipboardList, color: 'from-amber-500 to-orange-500' },
  { id: 'Data Engineer', label: 'Data Engineer', icon: HiOutlineChartBar, color: 'from-sky-500 to-indigo-500' },
  { id: 'RESUME', label: 'Resume-Based Interview', icon: HiOutlineAcademicCap, color: 'from-purple-600 to-indigo-500' },
];

const subjects = [
  { id: 'OOP', label: 'Object-Oriented Programming (OOP)', icon: HiOutlineCode, color: 'from-blue-600 to-cyan-500' },
  { id: 'Database', label: 'Database (DBMS / SQL)', icon: HiOutlineClipboardList, color: 'from-emerald-500 to-teal-500' },
  { id: 'CN', label: 'Computer Networks (CN)', icon: HiOutlineLightningBolt, color: 'from-amber-500 to-orange-500' },
  { id: 'OS', label: 'Operating Systems (OS)', icon: HiOutlineAcademicCap, color: 'from-sky-500 to-indigo-500' },
  { id: 'DSA', label: 'Data Structures & Algorithms (DSA)', icon: HiOutlineCode, color: 'from-purple-600 to-indigo-500' },
  { id: 'Java', label: 'Core Java & Collections', icon: HiOutlineCode, color: 'from-blue-600 to-cyan-500' },
  { id: 'Spring Boot', label: 'Spring Boot Framework', icon: HiOutlineLightningBolt, color: 'from-emerald-500 to-teal-500' },
  { id: 'React', label: 'React Frontend', icon: HiOutlineClipboardList, color: 'from-amber-500 to-orange-500' },
  { id: 'System Design', label: 'System Design', icon: HiOutlineChartBar, color: 'from-sky-500 to-indigo-500' },
  { id: 'REST API', label: 'REST API & Web Services', icon: HiOutlineAcademicCap, color: 'from-purple-600 to-indigo-500' },
  { id: 'HR Questions', label: 'HR & Behavioral', icon: HiOutlineClipboardList, color: 'from-blue-600 to-indigo-500' },
];


const difficultyStyles = {
  EASY: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  MEDIUM: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20' },
  HARD: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-red-500/20' },
};

const difficultyLevels = [
  { id: 'EASY', label: 'Easy', desc: 'Freshers & Beginners' },
  { id: 'MEDIUM', label: 'Medium', desc: '1-3 years experience' },
  { id: 'HARD', label: 'Hard', desc: 'Senior level' },
];

export default function InterviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedRole('');
  };
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartInterview = async () => {
    if (!selectedRole) {
      toast.error('Please select a job role');
      return;
    }

    if (scheduleLater && !scheduledDateTime) {
      toast.error('Please select a date and time to schedule');
      return;
    }

    setLoading(true);
    try {
      if (scheduleLater) {
        // Convert to ISO 8601 local date-time representation (YYYY-MM-DDTHH:MM:SS)
        const localISOString = new Date(scheduledDateTime).toISOString().slice(0, 19);
        await api.post(`/interviews/schedule?scheduledAt=${localISOString}`, {
          jobRole: selectedRole,
          difficulty: selectedDifficulty,
          mode: 'BOTH',
          questionCount,
        });

        toast.success('Interview scheduled successfully! 📅');
        navigate('/dashboard');
      } else {
        const response = await api.post('/interviews/start', {
          jobRole: selectedRole,
          difficulty: selectedDifficulty,
          mode: 'BOTH',
          questionCount,
        });

        toast.success('Interview session started! 🎯');
        navigate(`/interviews/${response.data.id}/session`);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to start interview';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineAcademicCap className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Mock Interview</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Start a <span className="gradient-text">Mock Interview</span>
        </h1>
        <p className="text-gray-400 mt-2">Configure your interview session and practice with AI-powered questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">          {/* Topic / Role Selection */}
          <div className="glass-card p-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-white">Select Preparation Topic</h2>
                <p className="text-sm text-gray-500">Choose a job role profile or select a specific subject to practice</p>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => handleTabChange('roles')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'roles'
                      ? 'bg-primary-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Job Roles
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('subjects')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'subjects'
                      ? 'bg-primary-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Subjects & Tech
                </button>
              </div>
            </div>

            {activeTab === 'roles' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobRoles.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    id={`role-${id.replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedRole(id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                      selectedRole === id
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    id={`subject-${id.replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedRole(id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                      selectedRole === id
                        ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty Level */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-display font-semibold text-white mb-1">Difficulty Level</h2>
            <p className="text-sm text-gray-500 mb-4">Select based on your experience</p>
            <div className="grid grid-cols-3 gap-3">
              {difficultyLevels.map(({ id, label, desc }) => {
                const styles = difficultyStyles[id];
                return (
                  <button
                    key={id}
                    id={`difficulty-${id}`}
                    onClick={() => setSelectedDifficulty(id)}
                    className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                      selectedDifficulty === id
                        ? `${styles.border} ${styles.bg}`
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${selectedDifficulty === id ? styles.text : 'text-white'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Interview Option */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-white">Schedule for Later</h2>
                <p className="text-sm text-gray-500 mt-0.5">Plan your mock interview session in advance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleLater}
                  onChange={(e) => setScheduleLater(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            {scheduleLater && (
              <div className="animate-fade-in pt-2">
                <label htmlFor="schedule-time" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Select Date & Time
                </label>
                <div className="relative">
                  <input
                    id="schedule-time"
                    type="datetime-local"
                    value={scheduledDateTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Question Count */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-display font-semibold text-white mb-1">Number of Questions</h2>
            <p className="text-sm text-gray-500 mb-4">How many questions for this session?</p>
            <div className="flex items-center gap-4">
              {[3, 5, 10, 15].map((count) => (
                <button
                  key={count}
                  id={`count-${count}`}
                  onClick={() => setQuestionCount(count)}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    questionCount === count
                      ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="space-y-6">
          {/* Session Summary */}
          <div className="glass-card p-6 sticky top-24 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-display font-semibold text-white mb-4">Session Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Topic / Role</span>
                <span className="text-sm text-white font-medium">
                  {jobRoles.find(r => r.id === selectedRole)?.label || 
                   subjects.find(s => s.id === selectedRole)?.label || 
                   'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Difficulty</span>
                <span className={`text-sm font-medium ${
                  selectedDifficulty === 'EASY' ? 'text-emerald-400' :
                  selectedDifficulty === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {selectedDifficulty}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Mode</span>
                <span className="text-sm text-white font-medium">Text + Speech</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-gray-400">Questions</span>
                <span className="text-sm text-white font-medium">{questionCount}</span>
              </div>
              {scheduleLater && scheduledDateTime && (
                <div className="flex flex-col gap-1 py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400">Scheduled Time</span>
                  <div className="flex items-center gap-1.5 text-xs text-primary-400 font-medium">
                    <HiOutlineCalendar className="w-4 h-4" />
                    {new Date(scheduledDateTime).toLocaleString()}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Est. Time</span>
                <div className="flex items-center gap-1.5 text-sm text-white font-medium">
                  <HiOutlineClock className="w-4 h-4 text-gray-500" />
                  {questionCount * 3} min
                </div>
              </div>
            </div>

            <button
              id="start-interview-btn"
              onClick={handleStartInterview}
              disabled={!selectedRole || loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {scheduleLater ? 'Scheduling...' : 'Preparing...'}
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="w-5 h-5" />
                  {scheduleLater ? 'Schedule Interview' : 'Start Interview'}
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

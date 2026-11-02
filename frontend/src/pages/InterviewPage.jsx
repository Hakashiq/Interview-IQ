import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';
import {
  HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineLightningBolt,
  HiOutlineArrowRight, HiOutlineClock, HiOutlineSparkles,
  HiOutlineChartBar, HiOutlineCode, HiOutlineCalendar, HiOutlineCheck
} from 'react-icons/hi';

const jobRoles = [
  { id: 'SDE', label: 'Software Engineer', desc: 'Algorithms, data structures & system fundamentals', icon: HiOutlineCode },
  { id: 'Full Stack', label: 'Full Stack Developer', desc: 'Frontend architecture, REST APIs & databases', icon: HiOutlineLightningBolt },
  { id: 'Backend', label: 'Backend Developer', desc: 'Microservices, distributed caching & DB scale', icon: HiOutlineClipboardList },
  { id: 'Data Engineer', label: 'Data Engineer', desc: 'Pipelines, SQL, warehousing & ETL workflows', icon: HiOutlineChartBar },
  { id: 'RESUME', label: 'Resume-Based Interview', desc: 'Custom questions generated from your uploaded CV', icon: HiOutlineAcademicCap },
];

const subjects = [
  { id: 'OOP', label: 'Object-Oriented Programming (OOP)', icon: HiOutlineCode },
  { id: 'Database', label: 'Database (DBMS / SQL)', icon: HiOutlineClipboardList },
  { id: 'CN', label: 'Computer Networks (CN)', icon: HiOutlineLightningBolt },
  { id: 'OS', label: 'Operating Systems (OS)', icon: HiOutlineAcademicCap },
  { id: 'DSA', label: 'Data Structures & Algorithms (DSA)', icon: HiOutlineCode },
  { id: 'Java', label: 'Core Java & Collections', icon: HiOutlineCode },
  { id: 'Spring Boot', label: 'Spring Boot Framework', icon: HiOutlineLightningBolt },
  { id: 'React', label: 'React Frontend Ecosystem', icon: HiOutlineClipboardList },
  { id: 'System Design', label: 'System Design & High Availability', icon: HiOutlineChartBar },
  { id: 'REST API', label: 'REST API & Web Services Architecture', icon: HiOutlineAcademicCap },
  { id: 'HR Questions', label: 'Behavioral & Leadership Principles', icon: HiOutlineClipboardList },
];

const difficultyLevels = [
  { id: 'EASY', label: 'Easy', desc: 'Foundations & Entry Level' },
  { id: 'MEDIUM', label: 'Medium', desc: 'Mid-level (1-3 yrs experience)' },
  { id: 'HARD', label: 'Hard', desc: 'Senior / Staff Level Deep-Dives' },
];

export default function InterviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedRole('');
  };

  const handleStartInterview = async () => {
    if (!selectedRole) {
      toast.error('Please select a job role or subject');
      return;
    }

    if (scheduleLater && !scheduledDateTime) {
      toast.error('Please choose a valid date and time to schedule');
      return;
    }

    setLoading(true);
    try {
      if (scheduleLater) {
        const localISOString = new Date(scheduledDateTime).toISOString().slice(0, 19);
        await api.post(`/interviews/schedule?scheduledAt=${localISOString}`, {
          jobRole: selectedRole,
          difficulty: selectedDifficulty,
          mode: 'BOTH',
          questionCount,
        });

        toast.success('Interview scheduled successfully 📅');
        navigate('/dashboard');
      } else {
        const response = await api.post('/interviews/start', {
          jobRole: selectedRole,
          difficulty: selectedDifficulty,
          mode: 'BOTH',
          questionCount,
        });

        toast.success('Interview session initialized 🎯');
        navigate(`/interviews/${response.data.id}/session`);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to initialize interview';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Mock Simulation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Configure Interview Session
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose your target engineering track or core discipline to begin an adaptive simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Topic / Role Selection Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Select Practice Topic</h2>
                  <p className="text-xs text-slate-500">Target a comprehensive role track or a granular technical module</p>
                </div>
                
                {/* Segmented Pill Tab Switcher */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleTabChange('roles')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'roles'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Job Roles
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('subjects')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'subjects'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Subjects & Tech
                  </button>
                </div>
              </div>

              {activeTab === 'roles' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {jobRoles.map(({ id, label, desc, icon: Icon }) => {
                    const isSelected = selectedRole === id;
                    return (
                      <button
                        key={id}
                        id={`role-${id.replace(/\s+/g, '-')}`}
                        onClick={() => setSelectedRole(id)}
                        className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all duration-150 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30'
                            : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {desc}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <HiOutlineCheck className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjects.map(({ id, label, icon: Icon }) => {
                    const isSelected = selectedRole === id;
                    return (
                      <button
                        key={id}
                        id={`subject-${id.replace(/\s+/g, '-')}`}
                        onClick={() => setSelectedRole(id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30'
                            : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-semibold flex-1 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {label}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <HiOutlineCheck className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Difficulty Level Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Difficulty Calibration</h2>
                <p className="text-xs text-slate-500">Tune the question depth to match your target role tier</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {difficultyLevels.map(({ id, label, desc }) => {
                  const isSelected = selectedDifficulty === id;
                  return (
                    <button
                      key={id}
                      id={`difficulty-${id}`}
                      onClick={() => setSelectedDifficulty(id)}
                      className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all duration-150 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <p className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                        {label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 hidden sm:block">
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count & Scheduling Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Question Count */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Question Count</h3>
                  <p className="text-xs text-slate-500">Number of inquiries in this session</p>
                </div>
                <div className="flex items-center gap-2">
                  {[3, 5, 10, 15].map((count) => (
                    <button
                      key={count}
                      id={`count-${count}`}
                      onClick={() => setQuestionCount(count)}
                      className={`flex-1 py-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        questionCount === count
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Later Option */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Schedule for Later</h3>
                    <p className="text-xs text-slate-500">Save session to calendar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleLater}
                      onChange={(e) => setScheduleLater(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {scheduleLater && (
                  <div className="pt-1 animate-fade-in">
                    <input
                      id="schedule-time"
                      type="datetime-local"
                      value={scheduledDateTime}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: Session Summary Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-900">Simulation Summary</h3>
                <p className="text-xs text-slate-500">Verify parameters before initializing</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Selected Track</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {jobRoles.find(r => r.id === selectedRole)?.label ||
                     subjects.find(s => s.id === selectedRole)?.label ||
                     'None selected'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Difficulty</span>
                  <span className="font-semibold text-slate-900 uppercase">
                    {selectedDifficulty}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Interaction Mode</span>
                  <span className="font-semibold text-slate-900">Voice + Code/Text</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Questions</span>
                  <span className="font-mono font-semibold text-slate-900">{questionCount} questions</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Est. Duration</span>
                  <div className="flex items-center gap-1 font-mono font-semibold text-slate-900">
                    <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{questionCount * 3} min</span>
                  </div>
                </div>

                {scheduleLater && scheduledDateTime && (
                  <div className="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Scheduled Date</span>
                    <div className="flex items-center gap-1 font-mono font-medium text-blue-700">
                      <HiOutlineCalendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{new Date(scheduledDateTime).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                id="start-interview-btn"
                onClick={handleStartInterview}
                disabled={!selectedRole || loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{scheduleLater ? 'Scheduling...' : 'Initializing Stage...'}</span>
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-4 h-4" />
                    <span>{scheduleLater ? 'Schedule Session' : 'Start Mock Interview'}</span>
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Webcam & microphone permissions requested on next screen.
              </p>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

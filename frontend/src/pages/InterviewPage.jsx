import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
import {
  HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineLightningBolt,
  HiOutlineArrowRight, HiOutlineClock, HiOutlineSparkles,
  HiOutlineChartBar, HiOutlineCode, HiOutlineCalendar, HiOutlineCheck
} from 'react-icons/hi';

const jobRoles = [
  { id: 'SDE', label: 'Software Engineer', code: 'TRK.01', desc: 'Algorithms, data structures & system fundamentals', icon: HiOutlineCode },
  { id: 'Full Stack', label: 'Full Stack Developer', code: 'TRK.02', desc: 'Frontend architecture, REST APIs & databases', icon: HiOutlineLightningBolt },
  { id: 'Backend', label: 'Backend Developer', code: 'TRK.03', desc: 'Microservices, distributed caching & DB scale', icon: HiOutlineClipboardList },
  { id: 'Data Engineer', label: 'Data Engineer', code: 'TRK.04', desc: 'Pipelines, SQL, warehousing & ETL workflows', icon: HiOutlineChartBar },
  { id: 'RESUME', label: 'Resume-Based Interview', code: 'TRK.05', desc: 'Custom questions generated from your uploaded CV', icon: HiOutlineAcademicCap },
];

const subjects = [
  { id: 'OOP', label: 'Object-Oriented Programming (OOP)', code: 'SUB.01', icon: HiOutlineCode },
  { id: 'Database', label: 'Database (DBMS / SQL)', code: 'SUB.02', icon: HiOutlineClipboardList },
  { id: 'CN', label: 'Computer Networks (CN)', code: 'SUB.03', icon: HiOutlineLightningBolt },
  { id: 'OS', label: 'Operating Systems (OS)', code: 'SUB.04', icon: HiOutlineAcademicCap },
  { id: 'DSA', label: 'Data Structures & Algorithms (DSA)', code: 'SUB.05', icon: HiOutlineCode },
  { id: 'Java', label: 'Core Java & Collections', code: 'SUB.06', icon: HiOutlineCode },
  { id: 'Spring Boot', label: 'Spring Boot Framework', code: 'SUB.07', icon: HiOutlineLightningBolt },
  { id: 'React', label: 'React Frontend Ecosystem', code: 'SUB.08', icon: HiOutlineClipboardList },
  { id: 'System Design', label: 'System Design & High Availability', code: 'SUB.09', icon: HiOutlineChartBar },
  { id: 'REST API', label: 'REST API & Web Services Architecture', code: 'SUB.10', icon: HiOutlineAcademicCap },
  { id: 'HR Questions', label: 'Behavioral & Leadership Principles', code: 'SUB.11', icon: HiOutlineClipboardList },
];

const difficultyLevels = [
  { id: 'EASY', label: 'Easy Calibration', desc: 'Foundations & Entry Level' },
  { id: 'MEDIUM', label: 'Medium Calibration', desc: 'Mid-Level (1-3 yrs experience)' },
  { id: 'HARD', label: 'Staff / Hard Tier', desc: 'Senior Deep Dives & Edge Scenarios' },
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
    playMechanicalToggle(true);
  };

  const handleStartInterview = async () => {
    if (!selectedRole) {
      toast.error('Please select an active track or module');
      return;
    }

    if (scheduleLater && !scheduledDateTime) {
      toast.error('Please choose a valid date and time to schedule');
      return;
    }

    setLoading(true);
    playMechanicalToggle(true);
    try {
      if (scheduleLater) {
        const localISOString = new Date(scheduledDateTime).toISOString().slice(0, 19);
        await api.post(`/interviews/schedule?scheduledAt=${localISOString}`, {
          jobRole: selectedRole,
          difficulty: selectedDifficulty,
          mode: 'BOTH',
          questionCount,
        });

        toast.success('Interview scheduled in telemetry registry');
        navigate('/dashboard');
      } else {
        const response = await api.post('/interviews/start', {
          jobRole: selectedRole,
          difficulty: selectedDifficulty,
          mode: 'BOTH',
          questionCount,
        });

        toast.success('Simulation chamber mounted');
        navigate(`/interviews/${response.data.id}/session`);
      }
    } catch (err) {
      playMechanicalToggle(false);
      const message = err.response?.data?.message || 'Failed to initialize chamber';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="pb-3 border-b border-ghost-ice/15">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="telemetry-chip-active text-[10px]">
              MOD.02 // SIMULATION PARAMETERS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tightest">
            Configure Interview Chamber
          </h1>
          <p className="text-xs sm:text-sm text-ghost-ice/60 font-ui mt-1">
            Specify technical discipline, complexity tolerance, and session length for real-time perception testing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Topic / Role Selection Card */}
            <div className="ghost-panel p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ghost-ice/15 pb-4">
                <div>
                  <h2 className="text-base font-display font-bold text-white tracking-tight">
                    Select Modular Discipline
                  </h2>
                  <p className="text-xs text-ghost-ice/50 font-ui">
                    Target an end-to-end engineering track or granular foundational subsystem
                  </p>
                </div>
                
                {/* Segmented Pill Tab Switcher */}
                <div className="bg-[#000307] p-1 rounded-full flex items-center border border-ghost-ice/15 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleTabChange('roles')}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className={`px-4 py-1.5 rounded-full text-xs font-ui uppercase tracking-wider font-semibold transition-all ${
                      activeTab === 'roles'
                        ? 'bg-ghost-blue text-white shadow-sm shadow-ghost-blue/30'
                        : 'text-ghost-ice/60 hover:text-white'
                    }`}
                  >
                    Role Tracks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('subjects')}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className={`px-4 py-1.5 rounded-full text-xs font-ui uppercase tracking-wider font-semibold transition-all ${
                      activeTab === 'subjects'
                        ? 'bg-ghost-blue text-white shadow-sm shadow-ghost-blue/30'
                        : 'text-ghost-ice/60 hover:text-white'
                    }`}
                  >
                    Core Subsystems
                  </button>
                </div>
              </div>

              {activeTab === 'roles' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {jobRoles.map(({ id, label, code, desc, icon: Icon }) => {
                    const isSelected = selectedRole === id;
                    return (
                      <button
                        key={id}
                        id={`role-${id.replace(/\s+/g, '-')}`}
                        onClick={() => {
                          setSelectedRole(id);
                          playMechanicalToggle(true);
                        }}
                        onMouseEnter={playHoverTick}
                        data-sfx="toggle"
                        className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-ghost-blue bg-ghost-blue/15 shadow-sm shadow-ghost-blue/20 ring-1 ring-ghost-blue'
                            : 'border-ghost-ice/15 bg-[#000307]/70 hover:border-ghost-ice/30 hover:bg-ghost-ice/5'
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                          isSelected ? 'bg-ghost-blue text-white' : 'bg-ghost-ice/5 text-ghost-ice/70'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-display font-bold text-white">
                              {label}
                            </p>
                            <span className="font-mono text-[9px] text-ghost-ice/40">{code}</span>
                          </div>
                          <p className="text-[11px] font-ui text-ghost-ice/60 mt-1 line-clamp-2 leading-relaxed">
                            {desc}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-ghost-blue text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                            <HiOutlineCheck className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjects.map(({ id, label, code, icon: Icon }) => {
                    const isSelected = selectedRole === id;
                    return (
                      <button
                        key={id}
                        id={`subject-${id.replace(/\s+/g, '-')}`}
                        onClick={() => {
                          setSelectedRole(id);
                          playMechanicalToggle(true);
                        }}
                        onMouseEnter={playHoverTick}
                        data-sfx="toggle"
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-ghost-blue bg-ghost-blue/15 shadow-sm shadow-ghost-blue/20 ring-1 ring-ghost-blue'
                            : 'border-ghost-ice/15 bg-[#000307]/70 hover:border-ghost-ice/30 hover:bg-ghost-ice/5'
                        }`}
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          isSelected ? 'bg-ghost-blue text-white' : 'bg-ghost-ice/5 text-ghost-ice/70'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-display font-bold text-white truncate">
                            {label}
                          </p>
                          <span className="font-mono text-[9px] text-ghost-ice/40">{code}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-ghost-blue text-white flex items-center justify-center flex-shrink-0">
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
            <div className="ghost-panel p-6 space-y-3">
              <div className="border-b border-ghost-ice/15 pb-3">
                <h2 className="text-base font-display font-bold text-white tracking-tight">
                  Complexity &amp; Tolerance Calibration
                </h2>
                <p className="text-xs text-ghost-ice/50 font-ui">
                  Tune the AST semantic matching and boundary depth
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {difficultyLevels.map(({ id, label, desc }) => {
                  const isSelected = selectedDifficulty === id;
                  return (
                    <button
                      key={id}
                      id={`difficulty-${id}`}
                      onClick={() => {
                        setSelectedDifficulty(id);
                        playMechanicalToggle(true);
                      }}
                      onMouseEnter={playHoverTick}
                      data-sfx="toggle"
                      className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all ${
                        isSelected
                          ? id === 'HARD'
                            ? 'border-ghost-heat bg-ghost-heat/20 text-white ring-1 ring-ghost-heat'
                            : 'border-ghost-blue bg-ghost-blue/20 text-white ring-1 ring-ghost-blue'
                          : 'border-ghost-ice/15 bg-[#000307]/70 hover:border-ghost-ice/30'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-display font-bold text-white">
                        {label}
                      </p>
                      <p className="text-[10px] font-mono text-ghost-ice/50 mt-1 hidden sm:block">
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
              <div className="ghost-panel p-5 space-y-3">
                <div>
                  <h3 className="text-sm font-display font-bold text-white">Inquiry Quantity</h3>
                  <p className="text-xs text-ghost-ice/50 font-ui">Total algorithmic inquiries in chamber</p>
                </div>
                <div className="flex items-center gap-2">
                  {[3, 5, 10, 15].map((count) => (
                    <button
                      key={count}
                      id={`count-${count}`}
                      onClick={() => {
                        setQuestionCount(count);
                        playMechanicalToggle(true);
                      }}
                      onMouseEnter={playHoverTick}
                      data-sfx="toggle"
                      className={`flex-1 py-2 rounded-xl border font-mono text-xs font-bold transition-all ${
                        questionCount === count
                          ? 'border-ghost-blue bg-ghost-blue text-white shadow-sm shadow-ghost-blue/30'
                          : 'border-ghost-ice/15 bg-[#000307] text-ghost-ice/70 hover:border-ghost-ice/30'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Later Option */}
              <div className="ghost-panel p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-display font-bold text-white">Queue for Later</h3>
                    <p className="text-xs text-ghost-ice/50 font-ui">Write to schedule registry</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleLater}
                      onChange={(e) => {
                        setScheduleLater(e.target.checked);
                        playMechanicalToggle(e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#000307] border border-ghost-ice/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ghost-ice after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ghost-blue peer-checked:border-ghost-blue" />
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
                      className="ghost-input text-xs"
                    />
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: Session Specification Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="ghost-panel p-6 space-y-5">
              <div className="border-b border-ghost-ice/15 pb-3">
                <span className="font-mono text-[10px] text-ghost-blue uppercase tracking-widest">
                  [SPECIFICATION SUMMARY]
                </span>
                <h3 className="text-base font-display font-bold text-white mt-0.5">
                  Simulation Parameters
                </h3>
                <p className="text-xs text-ghost-ice/50 font-ui">Audit parameters prior to initializing chamber</p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-ghost-ice/10">
                  <span className="text-ghost-ice/50">SELECTED TRACK</span>
                  <span className="font-bold text-white text-right">
                    {jobRoles.find(r => r.id === selectedRole)?.label ||
                     subjects.find(s => s.id === selectedRole)?.label ||
                     'NONE'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-ghost-ice/10">
                  <span className="text-ghost-ice/50">CALIBRATION</span>
                  <span className="font-bold text-ghost-blue uppercase">
                    {selectedDifficulty}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-ghost-ice/10">
                  <span className="text-ghost-ice/50">INTERACTION MODE</span>
                  <span className="text-white">VOICE PCM + CODE</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-ghost-ice/10">
                  <span className="text-ghost-ice/50">INQUIRIES</span>
                  <span className="text-white">{questionCount} PROMPTS</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-ghost-ice/10">
                  <span className="text-ghost-ice/50">EST. DURATION</span>
                  <div className="flex items-center gap-1 text-white">
                    <HiOutlineClock className="w-3.5 h-3.5 text-ghost-blue" />
                    <span>~{questionCount * 3} MIN</span>
                  </div>
                </div>

                {scheduleLater && scheduledDateTime && (
                  <div className="flex flex-col gap-1 py-1.5 border-b border-ghost-ice/10">
                    <span className="text-ghost-ice/50">SCHEDULED STAMP</span>
                    <div className="flex items-center gap-1 text-ghost-blue">
                      <HiOutlineCalendar className="w-3.5 h-3.5 text-ghost-blue" />
                      <span>{new Date(scheduledDateTime).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                id="start-interview-btn"
                onClick={handleStartInterview}
                disabled={!selectedRole || loading}
                onMouseEnter={playHoverTick}
                data-sfx="toggle"
                className="ghost-button-blue w-full py-3 flex items-center justify-center gap-2 font-mono text-xs uppercase disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>{scheduleLater ? 'COMMITTING TO SCHEDULE...' : 'MOUNTING CHAMBER...'}</span>
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-4 h-4" />
                    <span>{scheduleLater ? 'COMMIT TO SCHEDULE' : 'MOUNT CHAMBER'}</span>
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] font-mono text-center text-ghost-ice/40">
                WASM face proctoring &amp; 7kHz audio synthesized locally.
              </p>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

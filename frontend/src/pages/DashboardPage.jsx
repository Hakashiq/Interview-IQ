import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
import {
  HiOutlineLightningBolt, HiOutlineClipboardList,
  HiOutlineArrowRight, HiOutlineClock, HiOutlineCalendar,
  HiOutlineFire, HiOutlineCheck, HiOutlineDocumentText,
  HiOutlineTerminal, HiOutlineChip
} from 'react-icons/hi';

const difficultyBadgeClass = {
  EASY: 'telemetry-chip',
  MEDIUM: 'telemetry-chip-active',
  HARD: 'telemetry-chip-heat',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyRes = await api.get('/interviews/history');
        setInterviews(historyRes.data || []);
      } catch {
        // No interview history
      }

      try {
        const resumeRes = await api.get('/resumes/latest');
        const skills = resumeRes.data?.skills || resumeRes.data?.extractedSkills || [];
        setResumeSkills(Array.isArray(skills) ? skills : []);
      } catch {
        // No resume uploaded
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const scheduledInterviews = interviews.filter(i => i.status === 'SCHEDULED');
  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');

  const totalInterviews = completedInterviews.length;
  const avgScore = totalInterviews > 0
    ? (completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / totalInterviews).toFixed(1)
    : '--';
  const skillsCount = resumeSkills.length;

  const stats = [
    { label: 'Completed Sessions', value: totalInterviews.toString(), change: totalInterviews > 0 ? `${totalInterviews} sessions logged` : 'Awaiting initial run' },
    { label: 'Evaluation Mean', value: avgScore === '--' ? '--' : `${avgScore} / 10`, change: avgScore === '--' ? 'No telemetry recorded' : '5-Pillar weighted score' },
    { label: 'Resume Skills Graph', value: skillsCount.toString(), change: skillsCount > 0 ? 'Verified skill vertices' : 'Upload resume PDF' },
    { label: 'Simulation Cadence', value: `${Math.min(totalInterviews, 7)} Days`, change: totalInterviews > 0 ? 'Active telemetry streak' : 'Target: 3 runs / week' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Streak Calculation
  const calculateStreak = () => {
    if (interviews.length === 0) return { currentStreak: 0, maxStreak: 0, weekDays: [] };

    const completedDates = new Set(
      interviews
        .filter(i => i.status === 'COMPLETED')
        .map(i => {
          const date = new Date(i.completedAt || i.startedAt);
          return date.toISOString().split('T')[0];
        })
    );

    let current = 0;
    let max = 0;
    let temp = 0;

    const today = new Date();
    let checkDate = new Date(today);
    let todayStr = today.toISOString().split('T')[0];

    if (completedDates.has(todayStr)) {
      current = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (completedDates.has(checkDate.toISOString().split('T')[0])) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      while (completedDates.has(checkDate.toISOString().split('T')[0])) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      weekDays.push({
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        active: completedDates.has(dStr),
        dateStr: dStr
      });
    }

    return { currentStreak: current, maxStreak: Math.max(current, max), weekDays };
  };

  const { currentStreak, maxStreak, weekDays } = calculateStreak();

  return (
    <AppLayout>
      <div className="space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ghost-ice/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ghost-blue">
                [OPERATOR CONSOLE // MK-IV]
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tightest text-white">
              Telemetry Workspace: {user?.fullName || 'Operator'}
            </h1>
            <p className="text-xs font-ui text-ghost-ice/60 mt-0.5">
              Placement readiness benchmarks, edge perception diagnostics, and adaptive session launch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playMechanicalToggle(true);
                navigate('/resume');
              }}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="ghost-button-void"
            >
              <HiOutlineDocumentText className="w-4 h-4 text-ghost-ice/70" />
              <span>Resume Graph</span>
            </button>
            <button
              onClick={() => {
                playMechanicalToggle(true);
                navigate('/interviews');
              }}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="ghost-button-blue"
            >
              <HiOutlineLightningBolt className="w-4 h-4" />
              <span>Initialize Run</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="ghost-panel p-5 relative overflow-hidden group hover:border-ghost-ice/30 transition-all"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-ghost-ice/60 mb-2">
                {stat.label}
              </div>
              <div className="text-3xl font-mono font-bold text-white tracking-tight mb-1">
                {stat.value}
              </div>
              <p className="text-[11px] font-mono text-ghost-ice/50">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Practice Streak & Consistency Card */}
        <div className="ghost-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ghost-heat/15 border border-ghost-heat/30 flex items-center justify-center text-ghost-heat shadow-sm shadow-ghost-heat/20 flex-shrink-0">
              <HiOutlineFire className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-ghost-heat tracking-wider">
                ACTIVE TELEMETRY CADENCE
              </div>
              <h2 className="text-base font-display font-bold text-white mt-0.5">
                Practice Consistency Loop
              </h2>
              <p className="text-xs text-ghost-ice/60 font-ui mt-0.5">
                Sustained daily assessments enforce automatic recall under proctored interview conditions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-ghost-ice/15 md:pl-8">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-ghost-ice/50">Current Streak</p>
              <p className="text-2xl font-bold font-mono text-white mt-0.5">
                {currentStreak} <span className="text-xs font-normal text-ghost-ice/50">days</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-ghost-ice/50">Record Record</p>
              <p className="text-2xl font-bold font-mono text-white mt-0.5">
                {maxStreak} <span className="text-xs font-normal text-ghost-ice/50">days</span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-ghost-ice/50">Weekly Telemetry</p>
              <div className="flex items-center gap-1.5">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono text-ghost-ice/40 uppercase">{day.label}</span>
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono transition-all ${
                        day.active
                          ? 'bg-ghost-blue border-ghost-blue text-white shadow-sm shadow-ghost-blue/30'
                          : 'bg-[#000307] border-ghost-ice/15 text-ghost-ice/30'
                      }`}
                      title={day.active ? `Completed: ${day.dateStr}` : `No session on ${day.dateStr}`}
                    >
                      {day.active ? <HiOutlineCheck className="w-3.5 h-3.5" /> : '•'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Sessions (if any) */}
        {scheduledInterviews.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold text-ghost-ice uppercase tracking-wider flex items-center gap-2">
              <HiOutlineCalendar className="w-4 h-4 text-ghost-blue" />
              Queued Upcoming Simulations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledInterviews.map((session) => (
                <div key={session.id} className="ghost-panel p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-display font-bold text-white">{session.jobRole}</h3>
                      <span className={difficultyBadgeClass[session.difficulty] || 'telemetry-chip'}>
                        {session.difficulty}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-ghost-ice/50 flex items-center gap-1.5">
                      <HiOutlineClock className="w-3.5 h-3.5 text-ghost-ice/40" />
                      {formatDateTime(session.scheduledAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playMechanicalToggle(true);
                      navigate(`/interviews/${session.id}/session`);
                    }}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className="ghost-button-blue w-full mt-4"
                  >
                    Enter Active Chamber →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Launch & Recent Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Quick Launch Studio (7 cols) */}
          <div className="lg:col-span-7 ghost-panel p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-ghost-ice/15">
              <div>
                <h2 className="text-base font-display font-bold text-white tracking-tight">
                  Launch Modular Track
                </h2>
                <p className="text-xs font-ui text-ghost-ice/60 mt-0.5">
                  Select a standardized role track to initialize real-time vision proctoring and AST evaluation.
                </p>
              </div>
              <span className="font-mono text-[10px] text-ghost-ice/70 bg-ghost-ice/5 border border-ghost-ice/15 px-2 py-0.5 rounded-full">
                15 MIN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { role: 'Java', title: 'Core Java', desc: 'OOP, Collections, Memory' },
                { role: 'Backend', title: 'Backend SDE', desc: 'Spring Boot, APIs, SQL' },
                { role: 'System Design', title: 'System Architecture', desc: 'Distributed Caching, Sharding' },
                { role: 'SQL', title: 'SQL & Database', desc: 'Query Plans, Index Trees' },
                { role: 'DSA', title: 'Algorithms', desc: 'Dynamic Prog, Graphs' },
                { role: 'RESUME', title: 'Resume Custom', desc: 'Synthesized from Spec PDF' },
              ].map(item => (
                <button
                  key={item.role}
                  onClick={() => {
                    playMechanicalToggle(true);
                    navigate('/interviews');
                  }}
                  onMouseEnter={playHoverTick}
                  data-sfx="toggle"
                  className="p-3.5 rounded-xl border border-ghost-ice/15 bg-[#000307]/70 hover:border-ghost-blue/50 hover:bg-ghost-blue/5 text-left transition-all group"
                >
                  <p className="text-xs font-display font-bold text-white group-hover:text-ghost-blue transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] font-mono text-ghost-ice/50 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-ghost-ice/15">
              <span className="text-[11px] font-mono text-ghost-ice/50">
                250+ Calibrated Industry Questions Loaded
              </span>
              <button
                onClick={() => {
                  playMechanicalToggle(true);
                  navigate('/interviews');
                }}
                onMouseEnter={playHoverTick}
                data-sfx="toggle"
                className="ghost-button-blue"
              >
                <span>Browse All Roles</span>
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent History Telemetry Table (5 cols) */}
          <div className="lg:col-span-5 ghost-panel p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ghost-ice/15">
              <h2 className="text-base font-display font-bold text-white tracking-tight">
                Telemetry Log
              </h2>
              <button
                onClick={() => {
                  playMechanicalToggle(true);
                  navigate('/history');
                }}
                onMouseEnter={playHoverTick}
                className="text-xs font-mono text-ghost-blue hover:underline"
              >
                Full Log →
              </button>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-ghost-ice/40">
                <div className="w-6 h-6 border-2 border-ghost-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : completedInterviews.length === 0 ? (
              <div className="py-8 text-center text-ghost-ice/40 space-y-2">
                <HiOutlineClipboardList className="w-8 h-8 mx-auto text-ghost-ice/20" />
                <p className="text-xs font-mono">No simulation telemetry recorded</p>
                <p className="text-[10px] font-mono text-ghost-ice/40">Launch an assessment to record scores.</p>
              </div>
            ) : (
              <div className="divide-y divide-ghost-ice/10">
                {completedInterviews.slice(0, 4).map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => {
                      playMechanicalToggle(true);
                      navigate(`/interviews/${interview.id}/results`);
                    }}
                    onMouseEnter={playHoverTick}
                    className="py-3 flex items-center justify-between hover:bg-ghost-ice/5 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-display font-bold text-white">{interview.jobRole}</p>
                      <p className="text-[10px] font-mono text-ghost-ice/40 mt-0.5">
                        {formatDate(interview.completedAt || interview.startedAt)} • {interview.totalQuestions || 5} Qs
                      </p>
                    </div>
                    <div className="text-right">
                      {interview.overallScore != null ? (
                        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          interview.overallScore >= 8 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' :
                          interview.overallScore >= 6 ? 'bg-blue-950/60 text-ghost-ice border-ghost-blue/30' :
                          'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}>
                          {interview.overallScore.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="telemetry-chip text-[9px]">PENDING</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

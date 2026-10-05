import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import {
  HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineLightningBolt,
  HiOutlineTrendingUp, HiOutlineClipboardList,
  HiOutlineArrowRight, HiOutlineClock, HiOutlineCalendar,
  HiOutlineFire, HiOutlineCheck, HiOutlineDocumentText
} from 'react-icons/hi';

const difficultyBadgeClass = {
  EASY: 'badge-success',
  MEDIUM: 'badge-warning',
  HARD: 'badge-danger',
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
    { label: 'Completed Sessions', value: totalInterviews.toString(), change: totalInterviews > 0 ? `${totalInterviews} sessions finished` : 'Start your first assessment' },
    { label: 'Average Score', value: avgScore === '--' ? '--' : `${avgScore} / 10`, change: avgScore === '--' ? 'No assessments yet' : 'Mean performance benchmark' },
    { label: 'Resume Skills Indexed', value: skillsCount.toString(), change: skillsCount > 0 ? 'Verified technical tags' : 'Upload resume to extract' },
    { label: 'Practice Cadence', value: `${Math.min(totalInterviews, 7)} Days`, change: totalInterviews > 0 ? 'Consistent practice streak' : 'Target: 3 sessions / week' },
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
      let yesterdayStr = checkDate.toISOString().split('T')[0];
      if (completedDates.has(yesterdayStr)) {
        current = 1;
        checkDate.setDate(checkDate.getDate() - 1);
        while (completedDates.has(checkDate.toISOString().split('T')[0])) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    }

    const sortedDates = Array.from(completedDates).sort();
    if (sortedDates.length > 0) {
      temp = 1;
      max = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const d1 = new Date(sortedDates[i - 1]);
        const d2 = new Date(sortedDates[i]);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          temp++;
        } else if (diffDays > 1) {
          temp = 1;
        }
        if (temp > max) max = temp;
      }
    }

    const weekDays = [];
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);

    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    startOfWeek.setDate(today.getDate() - distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      weekDays.push({
        label: labels[i],
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Candidate'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Here is your interview readiness progress and technical benchmark summary.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/resume')}
              className="btn-secondary"
            >
              <HiOutlineDocumentText className="w-4 h-4 text-slate-500" />
              <span>Resume Analyzer</span>
            </button>
            <button
              onClick={() => navigate('/interviews')}
              className="btn-primary"
            >
              <HiOutlineLightningBolt className="w-4 h-4" />
              <span>Start Assessment</span>
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {stat.label}
              </div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight font-mono mb-1">
                {stat.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Practice Streak & Consistency Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs flex-shrink-0">
              <HiOutlineFire className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Consistency Cadence</h2>
              <p className="text-xs text-slate-500 mt-0.5">Maintain consistent practice to build confidence for technical screeners.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-8">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Current Streak</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                {currentStreak} <span className="text-xs font-normal text-slate-500">days</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Best Record</p>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                {maxStreak} <span className="text-xs font-normal text-slate-500">days</span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Weekly Tracker</p>
              <div className="flex items-center gap-1.5">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{day.label}</span>
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs transition-all ${
                        day.active
                          ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
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
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HiOutlineCalendar className="w-4 h-4 text-blue-600" />
              Scheduled Upcoming Interviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledInterviews.map((session) => (
                <div key={session.id} className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-900">{session.jobRole}</h3>
                      <span className={difficultyBadgeClass[session.difficulty] || 'badge-info'}>
                        {session.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateTime(session.scheduledAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/interviews/${session.id}/session`)}
                    className="btn-primary w-full mt-4"
                  >
                    Enter Interview Session →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Launch & Recent Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Quick Launch Role Studio (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Start Adaptive Interview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select a track to launch an adaptive AI interview with live answer evaluation.</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                15 MIN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { role: 'Java', title: 'Core Java', desc: 'OOP, Collections, Memory' },
                { role: 'Backend', title: 'Backend SDE', desc: 'Spring Boot, APIs, SQL' },
                { role: 'System Design', title: 'System Design', desc: 'Scalability, Caching, DB' },
                { role: 'SQL', title: 'SQL & Database', desc: 'Queries, Indexing, ACID' },
                { role: 'DSA', title: 'Algorithms', desc: 'Trees, Graphs, DP' },
                { role: 'RESUME', title: 'Resume Tailored', desc: 'Synthesized from your PDF' },
              ].map(item => (
                <button
                  key={item.role}
                  onClick={() => navigate('/interviews')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-400/80 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium">Over 250+ seeded technical questions & AI question synthesis</span>
              <button
                onClick={() => navigate('/interviews')}
                className="btn-primary"
              >
                <span>Browse All Roles</span>
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent History Table (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Completed Tests</h2>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                All History →
              </button>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : completedInterviews.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <HiOutlineClipboardList className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No completed interviews yet</p>
                <p className="text-[11px] text-slate-500">Your test results and AI feedback will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedInterviews.slice(0, 4).map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => navigate(`/interviews/${interview.id}/results`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{interview.jobRole}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(interview.completedAt || interview.startedAt)} • {interview.totalQuestions || 5} Questions
                      </p>
                    </div>
                    <div className="text-right">
                      {interview.overallScore != null ? (
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          interview.overallScore >= 8 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          interview.overallScore >= 6 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {interview.overallScore.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="badge-neutral text-[10px]">Pending</span>
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

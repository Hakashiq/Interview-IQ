import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import {
  HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineLightningBolt,
  HiOutlineTrendingUp, HiOutlineClipboardList, HiOutlineStar,
  HiOutlineArrowRight, HiOutlineSparkles, HiOutlineClock, HiOutlineCalendar,
  HiOutlineFire, HiOutlineCheck
} from 'react-icons/hi';

const difficultyBadgeClass = {
  EASY: 'badge-success',
  MEDIUM: 'badge-warning',
  HARD: 'bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold',
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
    { label: 'Interviews', value: totalInterviews.toString(), icon: HiOutlineClipboardList, change: totalInterviews > 0 ? `${totalInterviews} completed` : 'Start your first!', color: 'from-blue-600 to-cyan-500' },
    { label: 'Avg Score', value: avgScore === '--' ? '--' : `${avgScore}`, icon: HiOutlineChartBar, change: avgScore === '--' ? 'No data yet' : 'out of 10', color: 'from-emerald-500 to-teal-500' },
    { label: 'Skills', value: skillsCount.toString(), icon: HiOutlineLightningBolt, change: skillsCount > 0 ? 'From resume' : 'Upload resume', color: 'from-amber-500 to-orange-500' },
    { label: 'Streak', value: `${Math.min(totalInterviews, 7)} days`, icon: HiOutlineTrendingUp, change: totalInterviews > 0 ? 'Keep going!' : 'Start practicing!', color: 'from-sky-500 to-indigo-500' },
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

  // Dynamic Streak Calculation
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
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineSparkles className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Dashboard</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0] || 'Student'}</span> 👋
        </h1>
        <p className="text-gray-400 mt-2">Ready to ace your next interview? Let&apos;s practice!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="glass-card p-6 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Activity Streak Widget (LeetCode style) */}
      <div className="glass-card p-6 mb-8 animate-slide-up flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white animate-pulse">
            <HiOutlineFire className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              Practice Streak
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Complete mock interviews to maintain your daily learning streak!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-8 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 pl-0 md:pl-8">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Current Streak</p>
            <p className="text-3xl font-display font-bold text-orange-400 mt-1 flex items-baseline gap-1">
              {currentStreak} <span className="text-xs text-gray-400 font-normal">days</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Max Streak</p>
            <p className="text-3xl font-display font-bold text-amber-400 mt-1 flex items-baseline gap-1">
              {maxStreak} <span className="text-xs text-gray-400 font-normal">days</span>
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 uppercase font-semibold">This Week</p>
            <div className="flex items-center gap-1.5">
              {weekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-600 font-bold uppercase">{day.label}</span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    day.active 
                      ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 border-transparent text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-600'
                  }`} title={day.active ? "Completed interview" : "No activity"}>
                    {day.active ? <HiOutlineCheck className="w-3.5 h-3.5 font-bold" /> : <span className="text-[10px] font-bold">•</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Interviews */}
      {scheduledInterviews.length > 0 && (
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-primary-400" />
            Upcoming Mock Interviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledInterviews.map((session) => (
              <div key={session.id} className="glass-card p-5 flex flex-col justify-between hover:border-primary-500/30 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{session.jobRole}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={difficultyBadgeClass[session.difficulty] || 'badge-info'}>
                        {session.difficulty}
                      </span>
                      <span className="text-xs text-primary-400 font-medium flex items-center gap-1">
                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                        {formatDateTime(session.scheduledAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/interviews/${session.id}/session`)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-primary-500/20 hover:bg-primary-500 border border-primary-500/30 hover:border-transparent text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
                >
                  <HiOutlineLightningBolt className="w-4.5 h-4.5" />
                  Start Session Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Start Interview Card */}
        <div
          className="glass-card p-8 relative overflow-hidden group animate-slide-up cursor-pointer"
          style={{ animationDelay: '400ms' }}
          onClick={() => navigate('/interviews')}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-cyan-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <HiOutlineAcademicCap className="w-8 h-8 text-primary-400" />
              <h2 className="text-xl font-display font-bold text-white">Start Mock Interview</h2>
            </div>
            <p className="text-gray-400 mb-6">Practice with AI-generated questions tailored to your skills and target role.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(resumeSkills.length > 0 ? resumeSkills.slice(0, 4) : ['Java', 'Spring Boot', 'System Design', 'DSA']).map(skill => (
                <span key={typeof skill === 'string' ? skill : skill.name} className="badge-info">
                  {typeof skill === 'string' ? skill : skill.name}
                </span>
              ))}
            </div>
            <button className="btn-primary inline-flex items-center gap-2">
              Start Interview <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload Resume Card */}
        <div
          className="glass-card p-8 relative overflow-hidden group animate-slide-up cursor-pointer"
          style={{ animationDelay: '500ms' }}
          onClick={() => navigate('/resume')}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <HiOutlineStar className="w-8 h-8 text-emerald-400" />
              <h2 className="text-xl font-display font-bold text-white">Analyze Resume</h2>
            </div>
            <p className="text-gray-400 mb-6">Upload your resume for AI analysis, ATS scoring, and improvement suggestions.</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-2">
                {['PDF', 'DOCX'].map(fmt => (
                  <span key={fmt} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-xs font-medium text-gray-300 border-2 border-surface-900">
                    {fmt}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">Supported formats</span>
            </div>
            <button className="btn-secondary inline-flex items-center gap-2">
              Upload Resume <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">Recent Activity</h2>
          {completedInterviews.length > 5 && (
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              View All History <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : completedInterviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <HiOutlineClipboardList className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg font-medium">No activity yet</p>
            <p className="text-gray-500 mt-2 max-w-sm">Start a mock interview or upload your resume to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedInterviews.slice(0, 5).map((interview, index) => (
              <div
                key={interview.id || index}
                onClick={() => interview.status === 'COMPLETED' ? navigate(`/interviews/${interview.id}/results`) : null}
                className={`flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all animate-slide-up ${
                  interview.status === 'COMPLETED' ? 'cursor-pointer' : ''
                }`}
                style={{ animationDelay: `${(index + 7) * 80}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary-500/10">
                    <HiOutlineAcademicCap className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{interview.jobRole || 'Mock Interview'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={difficultyBadgeClass[interview.difficulty] || 'badge-info'}>
                        {interview.difficulty || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">
                        <HiOutlineClock className="w-3 h-3 inline mr-1" />
                        {formatDate(interview.createdAt || interview.startedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {interview.overallScore != null ? (
                    <p className={`text-lg font-bold ${
                      interview.overallScore >= 8 ? 'text-emerald-400' :
                      interview.overallScore >= 6 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {interview.overallScore.toFixed(1)}/10
                    </p>
                  ) : (
                    <span className="badge-info text-xs">{interview.status || 'In Progress'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

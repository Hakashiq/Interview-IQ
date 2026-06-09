import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import {
  HiOutlineClipboardList, HiOutlineSearch, HiOutlineFilter,
  HiOutlineAcademicCap, HiOutlineClock, HiOutlineChevronRight
} from 'react-icons/hi';

const difficultyBadgeClass = {
  EASY: 'badge-success',
  MEDIUM: 'badge-warning',
  HARD: 'bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/interviews/history');
        // Filter out scheduled interviews from history list
        setInterviews((res.data || []).filter(i => i.status === 'COMPLETED'));
      } catch (err) {
        console.error('Failed to fetch interview history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = interviews.filter(i => {
    const matchesRole = selectedRole
      ? i.jobRole?.toLowerCase().includes(selectedRole.toLowerCase())
      : true;
    const matchesDifficulty = selectedDifficulty ? i.difficulty === selectedDifficulty : true;
    return matchesRole && matchesDifficulty;
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineClipboardList className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Reports & Feedback</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Interview <span className="gradient-text">History</span>
        </h1>
        <p className="text-gray-400 mt-2">Browse your past mock interviews, scores, and detailed AI feedback reviews.</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Role / Domain Dropdown Filter */}
          <div className="relative flex-1">
            <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              id="role-filter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">All Roles & Domains</option>
              <optgroup label="Roles" className="bg-slate-900 text-white font-semibold">
                <option value="Backend Developer" className="bg-slate-900 text-white font-normal">Backend Developer</option>
                <option value="Full Stack Developer" className="bg-slate-900 text-white font-normal">Full Stack Developer</option>
                <option value="Data Analyst" className="bg-slate-900 text-white font-normal">Data Analyst</option>
                <option value="DevOps Engineer" className="bg-slate-900 text-white font-normal">DevOps Engineer</option>
                <option value="Software Engineer" className="bg-slate-900 text-white font-normal">Software Engineer</option>
              </optgroup>
              <optgroup label="Domains / Technologies" className="bg-slate-900 text-white font-semibold">
                <option value="Java" className="bg-slate-900 text-white font-normal">Java</option>
                <option value="Python" className="bg-slate-900 text-white font-normal">Python</option>
                <option value="DSA" className="bg-slate-900 text-white font-normal">Data Structures & Algorithms (DSA)</option>
                <option value="DBMS" className="bg-slate-900 text-white font-normal">Database Management Systems (DBMS)</option>
                <option value="Operating Systems" className="bg-slate-900 text-white font-normal">Operating Systems</option>
                <option value="Computer Networks" className="bg-slate-900 text-white font-normal">Computer Networks</option>
                <option value="System Design" className="bg-slate-900 text-white font-normal">System Design</option>
                <option value="Spring Boot" className="bg-slate-900 text-white font-normal">Spring Boot</option>
                <option value="React" className="bg-slate-900 text-white font-normal">React</option>
                <option value="DevOps" className="bg-slate-900 text-white font-normal">DevOps</option>
                <option value="Cloud" className="bg-slate-900 text-white font-normal">Cloud Computing</option>
                <option value="HR" className="bg-slate-900 text-white font-normal">HR / Behavioral</option>
              </optgroup>
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            id="difficulty-filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all appearance-none cursor-pointer min-w-[150px]"
          >
            <option value="" className="bg-slate-900 text-white">All Difficulties</option>
            <option value="EASY" className="bg-slate-900 text-white">Easy</option>
            <option value="MEDIUM" className="bg-slate-900 text-white">Medium</option>
            <option value="HARD" className="bg-slate-900 text-white">Hard</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <HiOutlineClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No interviews found</p>
            <p className="text-gray-500 text-sm mt-1">Try starting a new session or adjusting filters.</p>
          </div>
        ) : (
          filteredHistory.map((item, index) => (
            <div
              key={item.id}
              onClick={() => navigate(`/interviews/${item.id}/results`)}
              className="glass-card p-5 hover:bg-white/8 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between animate-slide-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary-500/10 flex-shrink-0">
                  <HiOutlineAcademicCap className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white leading-tight">
                    {item.jobRole || 'Mock Interview'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className={difficultyBadgeClass[item.difficulty] || 'badge-info'}>
                      {item.difficulty || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <HiOutlineClock className="w-3.5 h-3.5" />
                      Completed on {formatDate(item.completedAt || item.startedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  {item.overallScore != null ? (
                    <div>
                      <p className={`text-xl font-bold leading-none ${
                        item.overallScore >= 8 ? 'text-emerald-400' :
                        item.overallScore >= 6 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {item.overallScore.toFixed(1)}/10
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">Overall Score</p>
                    </div>
                  ) : (
                    <span className="badge-info text-xs">Processing</span>
                  )}
                </div>
                <HiOutlineChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}

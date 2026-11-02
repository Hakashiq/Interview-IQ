import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import {
  HiOutlineClipboardList, HiOutlineFilter,
  HiOutlineAcademicCap, HiOutlineClock, HiOutlineChevronRight
} from 'react-icons/hi';

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
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Audit Log
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              Interview History & Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse previous completed simulations, view score progression, and inspect fine-grained AI feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-neutral text-xs font-mono font-medium">
              {filteredHistory.length} Sessions Logged
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                id="role-filter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="">All Tracks & Disciplines</option>
                <optgroup label="Core Roles">
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </optgroup>
                <optgroup label="Subjects & Topics">
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="DSA">DSA</option>
                  <option value="DBMS">Database / SQL</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="System Design">System Design</option>
                  <option value="Spring Boot">Spring Boot</option>
                  <option value="React">React</option>
                  <option value="HR">HR / Behavioral</option>
                </optgroup>
              </select>
            </div>

            <div className="w-full sm:w-48">
              <select
                id="difficulty-filter"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of Sessions */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/90">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <HiOutlineClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No interview records located</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No past sessions matched your selected filters. Start a new simulation to generate your first debrief.
              </p>
              <button
                onClick={() => navigate('/interviews')}
                className="btn-primary text-xs py-2 px-4 mt-4 shadow-xs"
              >
                Start New Interview
              </button>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/interviews/${item.id}/results`)}
                className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <HiOutlineAcademicCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {item.jobRole || 'Mock Interview Simulation'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase border ${
                        item.difficulty === 'EASY'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : item.difficulty === 'MEDIUM'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        {item.difficulty || 'MEDIUM'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3 text-slate-400" />
                        {formatDate(item.completedAt || item.startedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    {item.overallScore != null ? (
                      <div>
                        <p className={`text-xl font-display font-bold leading-none ${
                          item.overallScore >= 8 ? 'text-emerald-600' :
                          item.overallScore >= 6 ? 'text-blue-600' :
                          item.overallScore >= 4 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {item.overallScore.toFixed(1)}<span className="text-[11px] font-normal text-slate-400">/10</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Composite Score</p>
                      </div>
                    ) : (
                      <span className="badge-neutral text-xs">Processing</span>
                    )}
                  </div>
                  <HiOutlineChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </AppLayout>
  );
}

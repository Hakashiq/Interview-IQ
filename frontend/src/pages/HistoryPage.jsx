import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-ghost-ice/15">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="telemetry-chip-active text-[10px]">
                MOD.06 // TELEMETRY REGISTRY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tightest">
              Simulation Telemetry Archive
            </h1>
            <p className="text-xs sm:text-sm text-ghost-ice/60 font-ui mt-1">
              Historical flight logs of completed interview simulations, AST scoring audits, and fine-grained feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="telemetry-chip text-[10px]">
              {filteredHistory.length} RUNS INDEXED
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="ghost-panel p-3.5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost-ice/40" />
              <select
                id="role-filter"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  playMechanicalToggle(true);
                }}
                className="ghost-input pl-10 cursor-pointer appearance-none text-xs"
              >
                <option value="" className="bg-[#00050a] text-ghost-ice">All Tracks &amp; Disciplines</option>
                <optgroup label="Core Roles" className="bg-[#00050a] text-ghost-ice">
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </optgroup>
                <optgroup label="Subjects & Topics" className="bg-[#00050a] text-ghost-ice">
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
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  playMechanicalToggle(true);
                }}
                className="ghost-input cursor-pointer appearance-none text-xs"
              >
                <option value="" className="bg-[#00050a] text-ghost-ice">All Calibrations</option>
                <option value="EASY" className="bg-[#00050a] text-ghost-ice">Easy</option>
                <option value="MEDIUM" className="bg-[#00050a] text-ghost-ice">Medium</option>
                <option value="HARD" className="bg-[#00050a] text-ghost-ice">Hard Tier</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of Sessions */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20 ghost-panel">
              <div className="w-8 h-8 border-2 border-ghost-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="ghost-panel p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-ghost-ice/5 border border-ghost-ice/15 text-ghost-ice/40 mx-auto flex items-center justify-center mb-3">
                <HiOutlineClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-bold text-white">No Telemetry Records Located</h3>
              <p className="text-xs text-ghost-ice/50 font-ui mt-1 max-w-sm mx-auto">
                No archived sessions matched the filter specifications. Mount an assessment chamber to record telemetry.
              </p>
              <button
                onClick={() => {
                  playMechanicalToggle(true);
                  navigate('/interviews');
                }}
                onMouseEnter={playHoverTick}
                data-sfx="toggle"
                className="ghost-button-blue text-xs py-2 px-5 mt-4"
              >
                Start New Interview
              </button>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  playMechanicalToggle(true);
                  navigate(`/interviews/${item.id}/results`);
                }}
                onMouseEnter={playHoverTick}
                className="ghost-panel p-4 sm:p-5 hover:border-ghost-blue/40 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-ghost-blue/15 border border-ghost-blue/30 text-ghost-blue flex items-center justify-center flex-shrink-0">
                    <HiOutlineAcademicCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-display font-bold text-white group-hover:text-ghost-blue transition-colors truncate">
                      {item.jobRole || 'Simulation Chamber'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                        item.difficulty === 'EASY'
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : item.difficulty === 'MEDIUM'
                          ? 'bg-ghost-blue/20 border-ghost-blue/40 text-ghost-ice'
                          : 'bg-ghost-heat/20 border-ghost-heat/40 text-ghost-heat'
                      }`}>
                        {item.difficulty || 'MEDIUM'}
                      </span>
                      <span className="text-ghost-ice/20">•</span>
                      <span className="text-[10px] text-ghost-ice/50 font-mono flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3 text-ghost-ice/40" />
                        {formatDate(item.completedAt || item.startedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    {item.overallScore != null ? (
                      <div>
                        <p className={`text-xl font-mono font-bold leading-none ${
                          item.overallScore >= 8 ? 'text-emerald-400' :
                          item.overallScore >= 6 ? 'text-ghost-blue' :
                          item.overallScore >= 4 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {item.overallScore.toFixed(1)}<span className="text-[10px] font-normal text-ghost-ice/40">/10</span>
                        </p>
                        <p className="text-[9px] font-mono text-ghost-ice/40 uppercase mt-0.5">COMPOSITE</p>
                      </div>
                    ) : (
                      <span className="telemetry-chip text-[9px]">PROCESSING</span>
                    )}
                  </div>
                  <HiOutlineChevronRight className="w-4 h-4 text-ghost-ice/40 group-hover:text-ghost-blue transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </AppLayout>
  );
}

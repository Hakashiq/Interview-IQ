import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup, HiOutlineChatAlt2, HiOutlineExclamationCircle,
  HiOutlineTrendingUp, HiOutlineMail, HiOutlineClock,
  HiOutlineExternalLink, HiOutlineSearch, HiOutlineAcademicCap,
  HiOutlineLocationMarker, HiOutlineLink, HiOutlineCheck, HiOutlineX
} from 'react-icons/hi';

export default function MentorHubPage() {
  const [activeTab, setActiveTab] = useState('students');
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchMentorData = async () => {
      setLoading(true);
      try {
        const [usersRes, feedbackRes, violationsRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/feedback'),
          api.get('/admin/violations'),
          api.get('/admin/detailed-stats')
        ]);

        setUsers(usersRes.data || []);
        setFeedback(feedbackRes.data || []);
        setViolations(violationsRes.data || []);
        setStats(statsRes.data || {});
      } catch (err) {
        toast.error('Failed to load Mentor dashboard details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorData();
  }, []);

  const studentsOnly = users.filter(u =>
    u.roles?.includes('ROLE_STUDENT') &&
    (u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResolveFeedback = (id) => {
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: 'RESOLVED' } : f));
    toast.success('Feedback item marked as resolved');
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Mentor Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Mentor Workspace & Integrity Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Oversee assigned candidate cohorts, audit proctoring infractions, and review feedback submissions.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">Assigned Cohort</span>
              <HiOutlineUserGroup className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 tracking-tight">
              {users.filter(u => u.roles?.includes('ROLE_STUDENT')).length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active candidates</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">Cohort Mean Score</span>
              <HiOutlineTrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 tracking-tight">
              {stats.averageInterviewScore ? stats.averageInterviewScore.toFixed(1) : '0.0'}<span className="text-xs font-normal text-slate-400">/10</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Average interview score</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">Pending Feedback</span>
              <HiOutlineChatAlt2 className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 tracking-tight">
              {feedback.filter(f => f.status === 'PENDING').length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting review</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-600">Integrity Flags</span>
              <HiOutlineExclamationCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900 tracking-tight">
              {violations.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total recorded strikes</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80 max-w-lg">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Candidate Directory
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'feedback'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Feedback ({feedback.filter(f => f.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'violations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Integrity Logs
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/90">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Student Directory Tab */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-xs"
                  />
                </div>

                <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                        <th className="p-3.5 font-semibold">Candidate Name</th>
                        <th className="p-3.5 font-semibold">Email</th>
                        <th className="p-3.5 font-semibold">Phone</th>
                        <th className="p-3.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {studentsOnly.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-400">
                            No students matching your search criteria.
                          </td>
                        </tr>
                      ) : (
                        studentsOnly.map(student => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3.5 font-semibold text-slate-900">{student.fullName}</td>
                            <td className="p-3.5 font-mono text-slate-600">{student.email}</td>
                            <td className="p-3.5 text-slate-500">{student.phone || '--'}</td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedUser(student)}
                                className="btn-secondary text-xs py-1 px-3 shadow-xs"
                              >
                                Inspect Profile
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-3">
                {feedback.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center text-slate-400 text-xs">
                    No student feedback items recorded in the registry.
                  </div>
                ) : (
                  feedback.map(item => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="badge-info text-[10px] uppercase font-semibold">
                            {item.category || 'SUGGESTION'}
                          </span>
                          {item.status === 'PENDING' ? (
                            <span className="badge-warning text-[10px] uppercase">PENDING</span>
                          ) : (
                            <span className="badge-success text-[10px] uppercase">RESOLVED</span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <HiOutlineClock className="w-3.5 h-3.5" />
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">{item.message}</p>
                        <p className="text-[11px] text-slate-400">Author: {item.username}</p>
                      </div>

                      {item.status === 'PENDING' && (
                        <button
                          onClick={() => handleResolveFeedback(item.id)}
                          className="self-start md:self-center btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 font-semibold text-emerald-700 hover:bg-emerald-50 shadow-xs"
                        >
                          <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Integrity Violations Tab */}
            {activeTab === 'violations' && (
              <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                      <th className="p-3.5 font-semibold">User</th>
                      <th className="p-3.5 font-semibold">Violation Type</th>
                      <th className="p-3.5 font-semibold">Context Details</th>
                      <th className="p-3.5 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {violations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-400">
                          Zero integrity infractions recorded across all candidate sessions.
                        </td>
                      </tr>
                    ) : (
                      violations.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 font-semibold text-slate-900">{v.username}</td>
                          <td className="p-3.5">
                            <span className="badge-danger text-[10px] uppercase font-semibold">
                              {v.violationType}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600">{v.details}</td>
                          <td className="p-3.5 text-right font-mono text-slate-400 text-[11px]">{formatDateTime(v.timestamp)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* Profile Inspection Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-subtle animate-scale-up overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedUser.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{selectedUser.fullName}</h3>
                    <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-semibold block mb-1">Phone Number</span>
                    <p className="font-semibold text-slate-800">{selectedUser.phone || 'Not recorded'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 font-semibold block mb-1">Location</span>
                    <p className="font-semibold text-slate-800">{selectedUser.address || 'Not recorded'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-semibold block">Education & Degree</span>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedUser.education || 'No educational background submitted.'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-slate-400 font-semibold block">External Developer Portfolios</span>
                  <div className="flex flex-wrap gap-3">
                    {selectedUser.githubUrl ? (
                      <a
                        href={selectedUser.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        GitHub <HiOutlineExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">GitHub (unlinked)</span>
                    )}

                    {selectedUser.linkedinUrl ? (
                      <a
                        href={selectedUser.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        LinkedIn <HiOutlineExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">LinkedIn (unlinked)</span>
                    )}

                    {selectedUser.leetcodeUrl ? (
                      <a
                        href={selectedUser.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        LeetCode <HiOutlineExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">LeetCode (unlinked)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn-secondary text-xs py-1.5 px-4"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

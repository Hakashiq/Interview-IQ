import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup, HiOutlineChatAlt2, HiOutlineExclamationCircle,
  HiOutlineTrendingUp, HiOutlineMail, HiOutlineClock, HiOutlineChevronRight,
  HiOutlineExternalLink, HiOutlineSearch, HiOutlineAcademicCap,
  HiOutlineLocationMarker, HiOutlineLink, HiOutlineCheck
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
    toast.success('Feedback marked as resolved!');
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineUserGroup className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium font-display">Mentor Workspace</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Mentor <span className="gradient-text">Hub</span>
        </h1>
        <p className="text-gray-400 mt-2">Oversee student preparation, audit integrity logs, and review platform feedback.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium font-display">Assigned Students</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {users.filter(u => u.roles?.includes('ROLE_STUDENT')).length}
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <HiOutlineUserGroup className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium font-display">Avg Interview Score</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {stats.averageInterviewScore ? stats.averageInterviewScore.toFixed(1) : '0.0'}/10
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <HiOutlineTrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium font-display">Unresolved Complaints</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {feedback.filter(f => f.status === 'PENDING').length}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <HiOutlineChatAlt2 className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium font-display">Integrity Infractions</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {violations.length}
            </h3>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl">
            <HiOutlineExclamationCircle className="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'students' ? 'border-primary-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Student Directory
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'feedback' ? 'border-primary-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Student Feedback ({feedback.filter(f => f.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('violations')}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'violations' ? 'border-primary-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Integrity Violations
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative max-w-md">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                />
              </div>

              {/* Table */}
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="p-4 font-display font-semibold">Student Name</th>
                      <th className="p-4 font-display font-semibold">Email</th>
                      <th className="p-4 font-display font-semibold">Phone</th>
                      <th className="p-4 font-display font-semibold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {studentsOnly.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">No students found.</td>
                      </tr>
                    ) : (
                      studentsOnly.map(student => (
                        <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-semibold text-white">{student.fullName}</td>
                          <td className="p-4">{student.email}</td>
                          <td className="p-4">{student.phone || '--'}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedUser(student)}
                              className="px-3 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-xs font-semibold border border-primary-500/20 transition-all"
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

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {feedback.length === 0 ? (
                <div className="glass-card p-8 text-center text-gray-500">
                  No feedback or complaints submitted yet.
                </div>
              ) : (
                feedback.map(item => (
                  <div key={item.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400">
                          {item.category || 'SUGGESTION'}
                        </span>
                        {item.status === 'PENDING' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">PENDING</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">RESOLVED</span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-white text-sm mt-2">{item.message}</p>
                      <p className="text-xs text-gray-400">Submitted by: {item.username}</p>
                    </div>

                    {item.status === 'PENDING' && (
                      <button
                        onClick={() => handleResolveFeedback(item.id)}
                        className="self-start md:self-center px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/25 flex items-center gap-1 transition-all"
                      >
                        <HiOutlineCheck className="w-3.5 h-3.5" /> Resolve
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'violations' && (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="p-4 font-display font-semibold">User</th>
                    <th className="p-4 font-display font-semibold">Type</th>
                    <th className="p-4 font-display font-semibold">Violation details</th>
                    <th className="p-4 font-display font-semibold">Occurred At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {violations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">No integrity infractions logged.</td>
                    </tr>
                  ) : (
                    violations.map(v => (
                      <tr key={v.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-semibold text-white">{v.username}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                            {v.violationType}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">{v.details}</td>
                        <td className="p-4 text-xs text-gray-500">{formatDateTime(v.timestamp)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inspect Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.fullName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">{selectedUser.fullName}</h3>
                  <p className="text-xs text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <HiOutlineMail className="w-4 h-4 text-primary-400" />
                    <span>Contact Info</span>
                  </div>
                  <p className="text-sm text-white font-semibold">{selectedUser.email}</p>
                  <p className="text-xs text-gray-300">{selectedUser.phone || 'No phone number provided'}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <HiOutlineLocationMarker className="w-4 h-4 text-primary-400" />
                    <span>Address / Location</span>
                  </div>
                  <p className="text-sm text-white font-semibold">{selectedUser.address || 'No address registered'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <HiOutlineAcademicCap className="w-4 h-4 text-primary-400" />
                  <span>Education Profile</span>
                </div>
                <p className="text-sm text-white whitespace-pre-line leading-relaxed">
                  {selectedUser.education || 'No educational background filled out yet.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <HiOutlineLink className="w-4 h-4 text-primary-400" />
                  <span>External Profiles</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedUser.githubUrl ? (
                    <a
                      href={selectedUser.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      GitHub Profile <HiOutlineExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500">GitHub (Not linked)</span>
                  )}

                  {selectedUser.linkedinUrl ? (
                    <a
                      href={selectedUser.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      LinkedIn Profile <HiOutlineExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500">LinkedIn (Not linked)</span>
                  )}

                  {selectedUser.leetcodeUrl ? (
                    <a
                      href={selectedUser.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      LeetCode Profile <HiOutlineExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500">LeetCode (Not linked)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

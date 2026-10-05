import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap, HiOutlineCode, HiOutlineServer,
  HiOutlineChevronRight, HiOutlineSparkles, HiOutlineX,
  HiOutlineTerminal
} from 'react-icons/hi';

const roadmapTracks = [
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    description: 'Master client-side architecture, reactive UI frameworks, asynchronous state management, and modern browser APIs.',
    icon: HiOutlineCode,
    modules: [
      { name: 'React', desc: 'Virtual DOM reconciliation, component lifecycles, custom hooks, and concurrent features.', difficulty: 'MEDIUM' },
      { name: 'REST API', desc: 'HTTP methods, status codes, payload structures, idempotency, and network error handling.', difficulty: 'EASY' },
      { name: 'OOP', desc: 'Core OOP patterns: encapsulation, inheritance, polymorphism, and modular domain modeling.', difficulty: 'EASY' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Engineer',
    description: 'Deep dive into server architecture, ACID database transactions, scaling bottlenecks, security, and framework internals.',
    icon: HiOutlineServer,
    modules: [
      { name: 'Java', desc: 'JVM memory layout, garbage collection, collections framework, and concurrency primitives.', difficulty: 'MEDIUM' },
      { name: 'Spring Boot', desc: 'IoC container, dependency injection, filter chains, security, and transaction management.', difficulty: 'MEDIUM' },
      { name: 'SQL', desc: 'Complex relational joins, query indexing, execution plans, and performance optimization.', difficulty: 'EASY' },
      { name: 'DBMS', desc: 'Normalization, ACID isolation anomalies, write-ahead logs, and sharding principles.', difficulty: 'MEDIUM' },
      { name: 'System Design', desc: 'High availability, consistent hashing, message brokers, caching tiers, and CAP trade-offs.', difficulty: 'HARD' }
    ]
  },
  {
    id: 'devops-cs',
    title: 'Systems & DevOps',
    description: 'Fundamental computer science foundations, OS processes, kernel networking stacks, and algorithmic problem-solving.',
    icon: HiOutlineTerminal,
    modules: [
      { name: 'DSA', desc: 'Trees, graphs, dynamic programming, sorting bounds, and asymptotic algorithmic complexity.', difficulty: 'MEDIUM' },
      { name: 'Operating Systems', desc: 'Process scheduling, virtual memory paging, context switches, mutexes, and deadlocks.', difficulty: 'MEDIUM' },
      { name: 'Networking', desc: 'TCP/IP socket handshakes, TLS handshakes, DNS propagation, HTTP/2 multiplexing, and routing.', difficulty: 'MEDIUM' },
      { name: 'Behavioral', desc: 'STAR-format behavioral inquiries evaluating project ownership, crisis triage, and team alignment.', difficulty: 'EASY' }
    ]
  }
];

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState('frontend');
  const [selectedModule, setSelectedModule] = useState(null);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [launching, setLaunching] = useState(false);

  const currentTrack = roadmapTracks.find(t => t.id === activeTrack);

  const handleStartTest = async () => {
    if (!selectedModule) return;

    setLaunching(true);
    try {
      const response = await api.post('/interviews/start', {
        jobRole: selectedModule.name,
        difficulty: difficulty,
        mode: 'BOTH',
        questionCount: questionCount
      });

      toast.success(`Practice simulation for ${selectedModule.name} initialized 🎯`);
      navigate(`/interviews/${response.data.id}/session`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to start simulation';
      toast.error(message);
    } finally {
      setLaunching(false);
      setSelectedModule(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Curriculum Bank
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Engineering Learning Roadmaps
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standardized technical tracks modeled after industry developer competencies. Questions are dynamically generated per module.
          </p>
        </div>

        {/* Track Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80 max-w-xl">
          {roadmapTracks.map((track) => {
            const Icon = track.icon;
            const isActive = activeTrack === track.id;
            return (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track.id)}
                className={`flex items-center justify-center gap-2 flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{track.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Track Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
            <currentTrack.icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">{currentTrack.title} Track</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{currentTrack.description}</p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTrack.modules.map((module) => (
            <div
              key={module.name}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 hover:shadow-subtle transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {module.name}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase border ${
                    module.difficulty === 'EASY'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : module.difficulty === 'MEDIUM'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {module.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {module.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedModule(module);
                  setDifficulty(module.difficulty);
                }}
                className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5 font-medium"
              >
                <span>Launch Practice Module</span>
                <HiOutlineChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Launch Configuration Modal */}
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-subtle relative animate-scale-up space-y-5">
              <button
                onClick={() => setSelectedModule(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Quick Launch
                </span>
                <h3 className="text-lg font-display font-semibold text-slate-900 mt-2">
                  Practice {selectedModule.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Calibrate the parameters for your adaptive mock interview before launching.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Difficulty Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          difficulty === level
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 10, 15].map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                          questionCount === count
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartTest}
                  disabled={launching}
                  className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {launching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="w-4 h-4" />
                      <span>Start Module</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

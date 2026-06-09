import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap, HiOutlineCode, HiOutlineServer, HiOutlineDatabase,
  HiOutlineChevronRight, HiOutlineSparkles, HiOutlineClock, HiOutlineX,
  HiOutlineTerminal, HiOutlineBookOpen
} from 'react-icons/hi';

const roadmapTracks = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Master client-side engineering, user interface logic, and modern responsive web components.',
    icon: HiOutlineCode,
    color: 'from-primary-500 to-indigo-500',
    modules: [
      { name: 'React', desc: 'Virtual DOM, component lifecycle, hooks, and global state management.', difficulty: 'MEDIUM' },
      { name: 'REST API', desc: 'HTTP methods, status codes, payload structures, and client-server design.', difficulty: 'EASY' },
      { name: 'OOP', desc: 'Four pillars of object-oriented design: inheritance, polymorphism, encapsulation, and abstraction.', difficulty: 'EASY' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Deep dive into server architecture, databases, APIs, scaling, and framework internals.',
    icon: HiOutlineServer,
    color: 'from-emerald-500 to-teal-500',
    modules: [
      { name: 'Java', desc: 'Core semantics, memory models (stack vs heap), collections framework, and multithreading.', difficulty: 'MEDIUM' },
      { name: 'Spring Boot', desc: 'Dependency injection, IoC container, auto-configurations, security filters, and AOP.', difficulty: 'MEDIUM' },
      { name: 'SQL', desc: 'Relational query construction, table joins, grouping, indexing, and performance optimization.', difficulty: 'EASY' },
      { name: 'DBMS', desc: 'Database normalization (1NF-3NF), ACID transactions, isolation levels, and indexing structures.', difficulty: 'MEDIUM' },
      { name: 'System Design', desc: 'Scalability concepts, load balancers, caching strategies, and CAP theorem.', difficulty: 'HARD' }
    ]
  },
  {
    id: 'devops-cs',
    title: 'DevOps & Computer Science',
    description: 'Learn operating system core concepts, networking layers, database engines, and algorithms.',
    icon: HiOutlineTerminal,
    color: 'from-amber-500 to-orange-500',
    modules: [
      { name: 'DSA', desc: 'Common data structures, sorting algorithms, dynamic programming, and graph traversals.', difficulty: 'MEDIUM' },
      { name: 'Operating Systems', desc: 'Processes vs threads, CPU scheduling, virtual memory, page replacement, and deadlocks.', difficulty: 'MEDIUM' },
      { name: 'Networking', desc: 'TCP/IP vs OSI model, DNS, HTTP/HTTPS protocols, load balancers, and network security.', difficulty: 'MEDIUM' },
      { name: 'Behavioral', desc: 'STAR methodology questions focusing on conflict resolution, leadership, and adaptability.', difficulty: 'EASY' }
    ]
  }
];

const difficultyStyles = {
  EASY: 'badge-success',
  MEDIUM: 'badge-warning',
  HARD: 'bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold',
};

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

      toast.success(`Mock test for ${selectedModule.name} started! 🎯`);
      navigate(`/interviews/${response.data.id}/session`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to start mock test';
      toast.error(message);
    } finally {
      setLaunching(false);
      setSelectedModule(null);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineAcademicCap className="w-5 h-5 text-amber-400" />
          <span className="text-sm text-amber-400 font-medium">Roadmap Tracks</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Question Bank <span className="gradient-text">Roadmaps</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Explore curated learning paths based on roadmap.sh standards and Reddit community discussions.
          Questions are kept hidden to test your skills dynamically.
        </p>
      </div>

      {/* Track Selection Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-8 max-w-2xl animate-slide-up">
        {roadmapTracks.map((track) => {
          const Icon = track.icon;
          const isActive = activeTrack === track.id;
          return (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={`flex items-center justify-center gap-2.5 flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-lg border border-white/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{track.title}</span>
              <span className="sm:hidden">{track.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Track Description */}
      <div className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-4 mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${currentTrack.color} text-white`}>
            <currentTrack.icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{currentTrack.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{currentTrack.description}</p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {currentTrack.modules.map((module) => (
          <div
            key={module.name}
            className="glass-card p-6 flex flex-col justify-between hover:border-white/20 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                  {module.name}
                </h3>
                <span className={difficultyStyles[module.difficulty]}>
                  {module.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                {module.desc}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedModule(module);
                setDifficulty(module.difficulty);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/30 text-sm font-medium text-white transition-all"
            >
              Start Practice Test
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Launch Configuration Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-6 max-w-md w-full relative animate-slide-up">
            <button
              onClick={() => setSelectedModule(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <HiOutlineSparkles className="w-5 h-5 text-primary-400" />
              <h3 className="text-lg font-display font-bold text-white">Configure Mock Test</h3>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Prepare to start your mock interview on <span className="text-white font-semibold">{selectedModule.name}</span>.
              Select difficulty and length below.
            </p>

            <div className="space-y-4 mb-8">
              {/* Difficulty Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        difficulty === level
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Questions</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 10, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        questionCount === count
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {count} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedModule(null)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTest}
                disabled={launching}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {launching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-4.5 h-4.5" />
                    Launch Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

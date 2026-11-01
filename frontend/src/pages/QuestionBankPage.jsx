import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
import {
  HiOutlineAcademicCap, HiOutlineCode, HiOutlineServer,
  HiOutlineChevronRight, HiOutlineSparkles, HiOutlineX,
  HiOutlineTerminal
} from 'react-icons/hi';

const roadmapTracks = [
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    code: 'TRK-FE-01',
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
    code: 'TRK-BE-02',
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
    code: 'TRK-SYS-03',
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
    playMechanicalToggle(true);
    try {
      const response = await api.post('/interviews/start', {
        jobRole: selectedModule.name,
        difficulty: difficulty,
        mode: 'BOTH',
        questionCount: questionCount
      });

      toast.success(`Simulation chamber for ${selectedModule.name} initialized`);
      navigate(`/interviews/${response.data.id}/session`);
    } catch (err) {
      playMechanicalToggle(false);
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
        <div className="pb-3 border-b border-ghost-ice/15">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="telemetry-chip-active text-[10px]">
              MOD.04 // CURRICULUM BLUEPRINTS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tightest">
            Engineering Competency Roadmaps
          </h1>
          <p className="text-xs sm:text-sm text-ghost-ice/60 font-ui mt-1">
            Standardized technical curriculums modeled after industry engineer competencies. Dynamically generated AST test cases.
          </p>
        </div>

        {/* Track Switcher */}
        <div className="bg-[#000307] p-1 rounded-full flex items-center border border-ghost-ice/15 max-w-xl">
          {roadmapTracks.map((track) => {
            const Icon = track.icon;
            const isActive = activeTrack === track.id;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setActiveTrack(track.id);
                  playMechanicalToggle(true);
                }}
                onMouseEnter={playHoverTick}
                data-sfx="toggle"
                className={`flex items-center justify-center gap-2 flex-1 py-2 px-3 rounded-full text-xs font-ui uppercase tracking-wider font-semibold transition-all ${
                  isActive
                    ? 'bg-ghost-blue text-white shadow-sm shadow-ghost-blue/30'
                    : 'text-ghost-ice/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-ghost-ice" />
                <span>{track.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Track Banner */}
        <div className="ghost-panel p-5 sm:p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-ghost-blue/15 border border-ghost-blue/30 text-ghost-blue flex-shrink-0">
            <currentTrack.icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] text-ghost-blue uppercase tracking-widest">{currentTrack.code}</span>
            </div>
            <h2 className="text-base font-display font-bold text-white">{currentTrack.title} Track</h2>
            <p className="text-xs sm:text-sm text-ghost-ice/70 font-ui mt-1 leading-relaxed">{currentTrack.description}</p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTrack.modules.map((module) => (
            <div
              key={module.name}
              className="ghost-panel p-5 hover:border-ghost-ice/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-display font-bold text-white">
                    {module.name}
                  </h3>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                    module.difficulty === 'EASY'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : module.difficulty === 'MEDIUM'
                      ? 'bg-ghost-blue/20 border-ghost-blue/40 text-ghost-ice'
                      : 'bg-ghost-heat/20 border-ghost-heat/40 text-ghost-heat'
                  }`}>
                    {module.difficulty}
                  </span>
                </div>
                <p className="text-xs font-ui text-ghost-ice/60 leading-relaxed mb-6">
                  {module.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  playMechanicalToggle(true);
                  setSelectedModule(module);
                  setDifficulty(module.difficulty);
                }}
                onMouseEnter={playHoverTick}
                data-sfx="toggle"
                className="ghost-button-void w-full text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <span>Launch Practice Module</span>
                <HiOutlineChevronRight className="w-3.5 h-3.5 text-ghost-ice/40" />
              </button>
            </div>
          ))}
        </div>

        {/* Launch Configuration Modal */}
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00050a]/80 backdrop-blur-md animate-fade-in">
            <div className="ghost-panel max-w-md w-full p-6 shadow-2xl relative animate-scale-up space-y-5">
              <button
                onClick={() => {
                  playMechanicalToggle(false);
                  setSelectedModule(null);
                }}
                onMouseEnter={playHoverTick}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-ghost-ice/40 hover:text-white hover:bg-ghost-ice/10 transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>

              <div>
                <span className="font-mono text-[9px] text-ghost-blue uppercase tracking-widest">
                  [QUICK MOUNT // MODULAR CHAMBER]
                </span>
                <h3 className="text-lg font-display font-bold text-white mt-1">
                  Practice {selectedModule.name}
                </h3>
                <p className="text-xs text-ghost-ice/60 font-ui mt-1 leading-relaxed">
                  Calibrate parameters for your adaptive mock interview before mounting chamber.
                </p>
              </div>

              <div className="space-y-4 font-ui">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-ghost-ice/70 mb-2">
                    Difficulty Calibration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setDifficulty(level);
                          playMechanicalToggle(true);
                        }}
                        onMouseEnter={playHoverTick}
                        data-sfx="toggle"
                        className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                          difficulty === level
                            ? level === 'HARD'
                              ? 'border-ghost-heat bg-ghost-heat/20 text-ghost-heat'
                              : 'border-ghost-blue bg-ghost-blue/20 text-white'
                            : 'border-ghost-ice/15 bg-[#000307] text-ghost-ice/60'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-ghost-ice/70 mb-2">
                    Inquiry Count
                  </label>
                  <div className="flex gap-2">
                    {[3, 5, 10].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setQuestionCount(count);
                          playMechanicalToggle(true);
                        }}
                        onMouseEnter={playHoverTick}
                        data-sfx="toggle"
                        className={`flex-1 py-2 rounded-xl border font-mono text-xs font-bold transition-all ${
                          questionCount === count
                            ? 'border-ghost-blue bg-ghost-blue text-white shadow-sm shadow-ghost-blue/30'
                            : 'border-ghost-ice/15 bg-[#000307] text-ghost-ice/60'
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartTest}
                  disabled={launching}
                  onMouseEnter={playHoverTick}
                  data-sfx="toggle"
                  className="ghost-button-blue w-full py-2.5 mt-2 flex items-center justify-center gap-2"
                >
                  {launching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>MOUNTING CHAMBER...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles className="w-4 h-4" />
                      <span>INITIALIZE MODULE SIMULATION</span>
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

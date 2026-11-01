import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FloatingPillNav from '../components/layout/FloatingPillNav';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
import {
  HiOutlineChip, HiOutlineVideoCamera, HiOutlineDocumentReport,
  HiOutlineTerminal, HiOutlineShieldCheck, HiOutlineSparkles,
  HiOutlineArrowRight, HiOutlineCubeTransparent, HiOutlineChevronDown,
  HiOutlineAdjustments, HiOutlineLightningBolt, HiOutlineCheck
} from 'react-icons/hi';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState('sde');
  const [telemetryFps, setTelemetryFps] = useState(59.8);
  const [activeTabTelemetry, setActiveTabTelemetry] = useState('gaze');

  // Subtle telemetry jitter simulating real-time browser WASM performance monitor
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryFps(prev => +(59.4 + Math.random() * 0.8).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFaq = (index) => {
    const next = activeFaq === index ? null : index;
    setActiveFaq(next);
    playMechanicalToggle(next !== null);
  };

  const engineeringTracks = {
    sde: {
      code: 'SYS-TRACK-SDE-01',
      title: 'Software Development Engineer [SDE]',
      coreStack: ['Java 21', 'Distributed Algorithms', 'System Architecture', 'Memory Allocation'],
      specs: [
        { label: 'Evaluation Model', value: 'AST Parsing + Semantic Graph Matching' },
        { label: 'Complexity Tolerance', value: 'O(N) Optimal / O(N log N) Acceptable' },
        { label: 'Memory Boundary', value: 'Zero-Leak Heap Allocation Check' },
        { label: 'Concurrency Scope', value: 'Virtual Threads + Lock-Free Rings' }
      ],
      samplePrompt: 'Demonstrate thread-safe concurrent LRU Cache eviction using Java ConcurrentHashMap and a bidirectional linked chain. Address lock striping trade-offs.'
    },
    backend: {
      code: 'SYS-TRACK-BE-02',
      title: 'Distributed Backend Systems Engineer',
      coreStack: ['Spring Boot 3.3', 'PostgreSQL / MySQL', 'Redis Mesh', 'gRPC / Kafka'],
      specs: [
        { label: 'Evaluation Model', value: 'ACID Transaction Boundary Verification' },
        { label: 'Index Optimization', value: 'B-Tree & Composite Key Query Execution' },
        { label: 'Throughput Benchmark', value: '10,000+ RPS Virtual Thread Isolation' },
        { label: 'Resilience Circuit', value: 'Exponential Backoff + Fallback Cache' }
      ],
      samplePrompt: 'Architect an idempotent distributed payment consumer that prevents dual-charge anomalies across Kafka partitions during rolling database restarts.'
    },
    fullstack: {
      code: 'SYS-TRACK-FS-03',
      title: 'Full Stack Product Engineer',
      coreStack: ['React 19', 'Next.js / Vite', 'Tailwind CSS', 'Web Audio / WASM'],
      specs: [
        { label: 'Evaluation Model', value: 'Atomic State Hydration & Zero Layout Shift' },
        { label: 'Latency Budget', value: '< 16.6ms Render Frame Target (60fps)' },
        { label: 'Security Boundary', value: 'HTTP-Only SameSite CSRF / JWT Protocol' },
        { label: 'Audio Engine', value: 'Procedural Web Audio low-pass synthesis' }
      ],
      samplePrompt: 'Implement an optimistic UI mutation queue in React with offline rollback persistence and real-time WebSocket state conflict resolution.'
    },
    data: {
      code: 'SYS-TRACK-DE-04',
      title: 'Data & High-Throughput Infrastructure',
      coreStack: ['Distributed SQL', 'Query Plan Telemetry', 'Columnar Parquet', 'ETL Pipelines'],
      specs: [
        { label: 'Evaluation Model', value: 'Query Cost Tree & Disk I/O Minimization' },
        { label: 'Partition Strategy', value: 'Range vs Hash Sharding Topology' },
        { label: 'Data Consistency', value: 'Eventual Consistency vs Raft Consensus' },
        { label: 'Cache Hit Ratio', value: '> 99.2% Tier-1 Redis cluster telemetry' }
      ],
      samplePrompt: 'Analyze a slow explain plan for a 50M-row partitioned join. Formulate index covering strategies and partition pruning parameters.'
    }
  };

  const specificationsFaq = [
    {
      q: '1.0 How does the zero-latency Web Audio procedural synthesis eliminate audio lag?',
      a: 'Rather than downloading multi-megabyte compressed audio files from cloud CDNs, Ghost Audio procedurally synthesizes mechanical switch tones, oscillator sweeps (3200Hz -> 1400Hz), and shaped white-noise bandpass pulses entirely inside browser memory using the Web Audio API with a warm 7,000Hz analog lowpass filter. Audio latency is guaranteed below 12 milliseconds.'
    },
    {
      q: '2.0 Is webcam video or biometric data streamed to any remote server or cloud bucket?',
      a: 'Zero bytes of camera imagery leave your workstation. Spatial computer vision executes locally in client memory via Google MediaPipe FaceLandmarker compiled to WebAssembly (WASM). Eye gaze vectors, facial fiducials, and attention metrics are calculated in real-time at 60 FPS directly on the client GPU/CPU.'
    },
    {
      q: '3.0 How does the 5-Pillar Neural Evaluation benchmark technical answers?',
      a: 'Submissions are cross-referenced against calibrated gold-standard engineering answers across 5 orthogonal vectors: Technical Accuracy, Completeness of Edge Cases, Communication Precision, Problem Relevance, and Delivery Confidence. Detailed analytical scorecards with pinpoint remediation notes are generated instantaneously.'
    },
    {
      q: '4.0 How are custom technical questions generated from physical resume PDF uploads?',
      a: 'The Resume Parsing Engine disassembles uploaded PDF/DOCX specification files, parses skill graphs, projects, frameworks, and architecture decisions, and primes the AI Engine to conduct deep, context-specific architectural cross-examinations matching your exact pedigree.'
    },
    {
      q: '5.0 How does proctoring telemetry enforce fair interview simulation integrity?',
      a: 'Window blur, focus loss, secondary display detection, and eye-off-axis telemetry are continuously monitored. Candidates receive real-time mechanical telemetry alerts when focus is interrupted, preserving legitimate placement benchmark conditions.'
    }
  ];

  return (
    <div className="min-h-screen bg-ghost-void text-ghost-ice font-ui selection:bg-ghost-blue selection:text-ghost-ice relative">
      
      {/* Ghost Minimalist Pill Navbar */}
      <FloatingPillNav />

      {/* ========================================================================= */}
      {/* CANVAS 1: VOID MODE (#00050a) — HIGH-TECH PRODUCT & COMPUTER VISION TELEMETRY */}
      {/* ========================================================================= */}
      <section id="core" className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 devices-matrix-grid overflow-hidden border-b border-ghost-ice/15">
        
        {/* Subtle Ethereal Glow Ring */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-ghost-blue/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Top Telemetry Hardware Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-ghost-ice/20 bg-ghost-void/90 backdrop-blur-md shadow-lg shadow-black/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] tracking-wider uppercase text-ghost-ice/90">
                CORE STATUS: NOMINAL // EDGE WASM VISION ACTIVE
              </span>
              <span className="font-mono text-[10px] text-ghost-ice/40 border-l border-ghost-ice/20 pl-2">
                {telemetryFps} FPS
              </span>
            </div>
          </div>

          {/* Monolithic Editorial Headline (Page 3 Optical Ink-Bleed Secret) */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="headline-monolithic text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tightest mb-6">
              AI CAREER APPLIANCE & PLACEMENT TELEMETRY
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-ghost-ice/70 font-ui font-normal max-w-2xl mx-auto leading-relaxed mb-10">
              A physical appliance-inspired simulation engine. Rejects generic bubbly chatbots for edge computer vision, procedural audio haptics, and rigorous technical interview benchmarking.
            </p>

            {/* Action CTA Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  onMouseEnter={playHoverTick}
                  data-sfx="toggle"
                  className="px-6 py-3 rounded-full bg-ghost-blue hover:bg-[#005bbb] text-ghost-ice font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-ghost-blue/25 flex items-center gap-2"
                >
                  <HiOutlineTerminal className="w-4 h-4" />
                  Launch Control Panel
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className="px-6 py-3 rounded-full bg-ghost-blue hover:bg-[#005bbb] text-ghost-ice font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-ghost-blue/25 flex items-center gap-2"
                  >
                    <HiOutlineLightningBolt className="w-4 h-4" />
                    Initialize Appliance
                  </Link>
                  <Link
                    to="/login"
                    onMouseEnter={playHoverTick}
                    className="px-6 py-3 rounded-full bg-ghost-void hover:bg-ghost-void/80 border border-ghost-ice/25 hover:border-ghost-ice/50 text-ghost-ice font-ui text-xs font-medium uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                  >
                    Authenticate Existing Core
                  </Link>
                </>
              )}
              <a
                href="#specifications"
                onMouseEnter={playHoverTick}
                className="px-6 py-3 rounded-full bg-ghost-paper text-[#00050a] hover:bg-white font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-md"
              >
                Inspect Spec Sheet
              </a>
            </div>
          </div>

          {/* ================================================================= */}
          {/* HARDWARE APPLIANCE TELEMETRY CHASSIS: INTERACTIVE CONSOLE PREVIEW */}
          {/* ================================================================= */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="ghost-panel p-1.5 sm:p-2 relative group">
              
              {/* Chassis Top Hardware Screws & Status Row */}
              <div className="px-4 py-2.5 flex items-center justify-between border-b border-ghost-ice/15 bg-ghost-void/90 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-ghost-blue shadow-sm shadow-ghost-blue animate-pulse" />
                  <span className="font-mono text-[11px] text-white tracking-widest uppercase">
                    INTERVIEW-IQ // APPLIANCE CHASSIS [CORE MK-IV]
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[10px] text-ghost-ice/60">
                  <span className="hidden sm:inline">SAMPLE RATE: 48,000Hz</span>
                  <span>FILTER: 7kHz LP</span>
                  <span className="text-emerald-400">LATENCY: 11.2ms</span>
                </div>
              </div>

              {/* Chassis Main Console Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 bg-ghost-void/60 backdrop-blur-md">
                
                {/* Left: Spatial Computer Vision Telemetry Feed Mockup */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="relative aspect-video rounded-xl bg-[#000307] border border-ghost-ice/20 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                    
                    {/* Vision Overlay Grid & Crosshairs */}
                    <div className="absolute inset-0 bg-[radial-gradient(#d6eaff_0.75px,transparent_0.75px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
                    
                    {/* Precision HUD Overlays */}
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-ghost-blue/20 border border-ghost-blue/40 text-[10px] font-mono text-ghost-ice tracking-wider">
                          CAM.01 // WASM EDGE
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 tracking-wider">
                          GAZE LOCK: 98.4%
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-ghost-ice/50">
                        LANDMARKS: 478 PTS
                      </div>
                    </div>

                    {/* Center Spatial Wireframe Target */}
                    <div className="relative z-10 self-center flex flex-col items-center">
                      <div className="w-32 h-40 border border-ghost-ice/25 rounded-3xl relative flex items-center justify-center">
                        <div className="w-16 h-16 border border-dashed border-ghost-blue/40 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                        <div className="absolute top-2 w-1.5 h-1.5 bg-ghost-blue rounded-full" />
                        <div className="absolute bottom-4 font-mono text-[9px] text-ghost-ice/60 tracking-wider">
                          FOCAL PLANE
                        </div>
                      </div>
                    </div>

                    {/* Bottom Telemetry HUD Data */}
                    <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-ghost-ice/70 bg-ghost-void/80 px-3 py-1.5 rounded-lg border border-ghost-ice/10">
                      <span>PITCH: -1.2°</span>
                      <span>YAW: +0.4°</span>
                      <span>ROLL: 0.0°</span>
                      <span className="text-emerald-400">PROCTOR: CLEAN</span>
                    </div>
                  </div>

                  {/* Audio Synthesizer Waveform Visualizer */}
                  <div className="p-3 rounded-xl bg-[#000307]/80 border border-ghost-ice/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-end gap-1 h-7">
                        <span className="wave-bar w-1 bg-ghost-blue rounded-full" />
                        <span className="wave-bar w-1 bg-ghost-blue rounded-full" />
                        <span className="wave-bar w-1 bg-ghost-ice rounded-full" />
                        <span className="wave-bar w-1 bg-ghost-ice rounded-full" />
                        <span className="wave-bar w-1 bg-ghost-blue rounded-full" />
                        <span className="wave-bar w-1 bg-ghost-ice rounded-full" />
                        <span className="wave-bar w-1 bg-ghost-blue rounded-full" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono text-white uppercase tracking-wider">
                          AUDIO SYNTHESIS ENGINE
                        </div>
                        <div className="text-[10px] font-mono text-ghost-ice/50">
                          PROCEDURAL SINE RAMP (3200Hz ➔ 1400Hz)
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => playMechanicalToggle(true)}
                      onMouseEnter={playHoverTick}
                      data-sfx="toggle"
                      className="px-3 py-1 rounded-full border border-ghost-ice/20 hover:border-ghost-ice/40 bg-ghost-void font-mono text-[10px] uppercase text-ghost-ice"
                    >
                      Test Relay Click
                    </button>
                  </div>
                </div>

                {/* Right: Real-time 5-Pillar Score Telemetry Card */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4 p-4 rounded-xl bg-[#000307]/70 border border-ghost-ice/15">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-ghost-ice/15">
                      <span className="text-xs font-mono uppercase tracking-widest text-ghost-ice/80">
                        5-PILLAR NEURAL EVALUATION
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-ghost-blue text-white font-mono text-[10px] font-bold">
                        9.4 / 10
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] font-mono text-ghost-ice/80 mb-1">
                          <span>1. Technical Accuracy</span>
                          <span className="text-white font-bold">96%</span>
                        </div>
                        <div className="h-1.5 w-full bg-ghost-ice/10 rounded-full overflow-hidden">
                          <div className="h-full bg-ghost-blue rounded-full" style={{ width: '96%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-mono text-ghost-ice/80 mb-1">
                          <span>2. Edge Case Completeness</span>
                          <span className="text-white font-bold">92%</span>
                        </div>
                        <div className="h-1.5 w-full bg-ghost-ice/10 rounded-full overflow-hidden">
                          <div className="h-full bg-ghost-blue rounded-full" style={{ width: '92%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-mono text-ghost-ice/80 mb-1">
                          <span>3. Architectural Clarity</span>
                          <span className="text-white font-bold">94%</span>
                        </div>
                        <div className="h-1.5 w-full bg-ghost-ice/10 rounded-full overflow-hidden">
                          <div className="h-full bg-ghost-blue rounded-full" style={{ width: '94%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-mono text-ghost-ice/80 mb-1">
                          <span>4. Problem Relevance</span>
                          <span className="text-white font-bold">98%</span>
                        </div>
                        <div className="h-1.5 w-full bg-ghost-ice/10 rounded-full overflow-hidden">
                          <div className="h-full bg-ghost-blue rounded-full" style={{ width: '98%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-mono text-ghost-ice/80 mb-1">
                          <span>5. Delivery & Stability</span>
                          <span className="text-white font-bold">90%</span>
                        </div>
                        <div className="h-1.5 w-full bg-ghost-ice/10 rounded-full overflow-hidden">
                          <div className="h-full bg-ghost-blue rounded-full" style={{ width: '90%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-ghost-ice/15">
                    <p className="text-[11px] font-mono text-ghost-ice/60 leading-normal">
                      &gt; AST matched: Lock striping &amp; exponential decay. Zero hallucination tolerance.
                    </p>
                  </div>
                </div>

              </div>

              {/* Chassis Bottom Telemetry Specs */}
              <div className="px-4 py-2 bg-ghost-void/90 rounded-b-xl border-t border-ghost-ice/15 flex flex-wrap items-center justify-between text-[10px] font-mono text-ghost-ice/40">
                <span>SPEC: IEC 60601-1 PHYSICALITY</span>
                <span>BUILD: 2026.11.R4</span>
                <span>ZERO CLOUD VIDEO STORAGE GUARANTEE</span>
              </div>
            </div>
          </div>

          {/* Core Hardware Metrics Ticker */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-4 rounded-xl bg-ghost-void/80 border border-ghost-ice/15 text-center">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">100+</div>
              <div className="text-[11px] font-mono text-ghost-ice/60 uppercase tracking-wider mt-1">
                Completed Mock Sessions
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ghost-void/80 border border-ghost-ice/15 text-center">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-ghost-blue tracking-tight">&lt; 15ms</div>
              <div className="text-[11px] font-mono text-ghost-ice/60 uppercase tracking-wider mt-1">
                Browser Audio Synthesis
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ghost-void/80 border border-ghost-ice/15 text-center">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">100%</div>
              <div className="text-[11px] font-mono text-ghost-ice/60 uppercase tracking-wider mt-1">
                Client-Side WASM Vision
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ghost-void/80 border border-ghost-ice/15 text-center">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">0 Bytes</div>
              <div className="text-[11px] font-mono text-ghost-ice/60 uppercase tracking-wider mt-1">
                Video Egress / Stored
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CANVAS 2: PAPER MODE (#f5f5f5) — HIGH-DENSITY TECHNICAL SPECIFICATIONS   */}
      {/* ========================================================================= */}
      <section id="specifications" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f5f5] text-[#00050a] devices-matrix-grid-paper border-b border-[#00050a]/20">
        <div className="max-w-7xl mx-auto">
          
          {/* Paper Section Header */}
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#00050a]/30 bg-white font-mono text-[10px] uppercase tracking-widest text-[#00050a] mb-4">
              [DOC: ENG-SPEC-2026 // PAPER MODE CANVAS]
            </div>
            <h2 className="headline-monolithic text-3xl sm:text-5xl font-bold text-[#00050a] tracking-tightest mb-4">
              TECHNICAL SPECIFICATION MANUAL
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-ui leading-relaxed">
              Standard engineering documentation for the InterviewIQ simulation core. Derived from physical appliance ergonomics, architectural drafting blueprints, and strict evaluation tolerances.
            </p>
          </div>

          {/* Architectural Drafting Spec Table */}
          <div className="border border-[#00050a]/25 rounded-xl bg-white shadow-sm overflow-hidden mb-16">
            <div className="px-6 py-4 bg-slate-100 border-b border-[#00050a]/20 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00050a]">
                SYSTEM ARCHITECTURE &amp; TOLERANCE MATRIX
              </span>
              <span className="font-mono text-[11px] text-slate-600">
                REVISION 4.1.0 // DIETER RAMS DISCIPLINE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-ui text-xs">
                <thead>
                  <tr className="border-b border-[#00050a]/15 bg-slate-50 font-mono text-[11px] text-slate-600 uppercase">
                    <th className="px-6 py-3 font-semibold">Subsystem Token</th>
                    <th className="px-6 py-3 font-semibold">Implementation Standard</th>
                    <th className="px-6 py-3 font-semibold">Engineering Tolerance</th>
                    <th className="px-6 py-3 font-semibold">Physicality Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-[#00050a]">SYS.CANVAS.VOID</td>
                    <td className="px-6 py-4">#00050a Obsidian Undertone Canvas</td>
                    <td className="px-6 py-4 font-mono text-slate-600">Exact CIE L*a*b* calibrated</td>
                    <td className="px-6 py-4">Telemetry console &amp; vision overlay</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-[#00050a]">SYS.CANVAS.PAPER</td>
                    <td className="px-6 py-4">#f5f5f5 Tactile Drafting Paper</td>
                    <td className="px-6 py-4 font-mono text-slate-600">Light reflect 92% spec</td>
                    <td className="px-6 py-4">High-density technical blueprint &amp; audit</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-[#00050a]">SYS.AUDIO.PROCEDURAL</td>
                    <td className="px-6 py-4">Web Audio API + 7,000Hz Lowpass</td>
                    <td className="px-6 py-4 font-mono text-slate-600">&lt; 15ms procedural synthesis</td>
                    <td className="px-6 py-4">Tactile mechanical click &amp; relay toggle</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-[#00050a]">SYS.VISION.EDGELANDMARK</td>
                    <td className="px-6 py-4">MediaPipe FaceLandmarker WASM</td>
                    <td className="px-6 py-4 font-mono text-slate-600">478 3D vertices @ 60 FPS</td>
                    <td className="px-6 py-4">Zero video network transmission</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-[#00050a]">SYS.EVAL.5PILLAR</td>
                    <td className="px-6 py-4">Multi-vector Semantic Alignment</td>
                    <td className="px-6 py-4 font-mono text-slate-600">Cosine similarity &gt; 0.94</td>
                    <td className="px-6 py-4">Comprehensive scoring &amp; remedial notes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TRACKS SELECTOR: ARCHITECTURAL DRAFTING BLUEPRINT */}
          {/* ========================================================================= */}
          <div id="tracks" className="pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                  [MODULE: TRACK-SELECTOR-04]
                </span>
                <h3 className="headline-monolithic text-2xl sm:text-4xl font-bold text-[#00050a] tracking-tight mt-1">
                  ENGINEERING TRACK SPECIFICATIONS
                </h3>
              </div>
              
              {/* Track Selector Buttons */}
              <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-200 border border-[#00050a]/15">
                {Object.keys(engineeringTracks).map((trackKey) => (
                  <button
                    key={trackKey}
                    onClick={() => {
                      setSelectedTrack(trackKey);
                      playMechanicalToggle(true);
                    }}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className={`px-3 py-1.5 rounded-lg font-ui text-xs uppercase tracking-wider font-semibold transition-all ${
                      selectedTrack === trackKey
                        ? 'bg-[#00050a] text-white shadow-sm'
                        : 'text-slate-700 hover:text-black hover:bg-white/50'
                    }`}
                  >
                    {trackKey.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Track Detailed Blueprint Card */}
            <div className="border-2 border-[#00050a]/20 rounded-2xl bg-white p-6 sm:p-8 shadow-sm relative">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#00050a]/15 gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-[#007dff]">
                    {engineeringTracks[selectedTrack].code}
                  </span>
                  <h4 className="headline-monolithic text-xl sm:text-2xl font-bold text-[#00050a] mt-0.5">
                    {engineeringTracks[selectedTrack].title}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {engineeringTracks[selectedTrack].coreStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-semibold text-slate-800 uppercase"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Blueprint Specs Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {engineeringTracks[selectedTrack].specs.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-mono text-[10px] uppercase text-slate-500">
                      {item.label}
                    </div>
                    <div className="font-ui text-xs font-bold text-[#00050a] mt-1">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Prompt Telemetry */}
              <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-300">
                <div className="font-mono text-[10px] uppercase text-slate-500 tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007dff]" />
                  EXEMPLAR INTERVIEW QUESTION SPEC
                </div>
                <p className="font-ui text-sm text-[#00050a] font-medium italic">
                  "{engineeringTracks[selectedTrack].samplePrompt}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-[11px] text-slate-500">
                  EVALUATION ENGINE: GEMINI 2.5 EXPERT PROMPT ARCHITECTURE
                </span>
                <Link
                  to="/interviews"
                  onMouseEnter={playHoverTick}
                  data-sfx="toggle"
                  className="px-4 py-2 rounded-full bg-[#00050a] hover:bg-black text-[#f5f5f5] font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                >
                  Configure Session <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CANVAS 1 (RESUMED): VOID MODE (#00050a) — SPATIAL TELEMETRY & AUDIT       */}
      {/* ========================================================================= */}
      <section id="telemetry" className="py-24 px-4 sm:px-6 lg:px-8 devices-matrix-grid border-b border-ghost-ice/15">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ghost-ice/20 bg-ghost-void font-mono text-[10px] uppercase tracking-wider text-ghost-ice mb-4">
              [SPATIAL AUDITING &amp; PRIVACY GUARANTEE]
            </div>
            <h2 className="headline-monolithic text-3xl sm:text-5xl font-bold text-white tracking-tightest mb-4">
              EDGE ARCHITECTURE WITH ZERO CLOUD INTRUSION
            </h2>
            <p className="text-sm sm:text-base text-ghost-ice/70 font-ui leading-relaxed">
              We engineered the entire perception pipeline to live exclusively inside your browser's WebAssembly sandbox. Video streams never touch a network socket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tile 1 */}
            <div className="ghost-panel p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-ghost-blue/15 border border-ghost-blue/30 flex items-center justify-center text-ghost-ice mb-4">
                  <HiOutlineVideoCamera className="w-5 h-5 text-ghost-blue" />
                </div>
                <div className="font-mono text-[10px] text-ghost-blue uppercase tracking-widest mb-1">
                  01 // WASM COMPILED
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  Client FaceLandmarker
                </h3>
                <p className="text-xs text-ghost-ice/70 font-ui leading-relaxed">
                  MediaPipe processes 478 spatial face landmarks in real-time on your hardware. Computes iris gaze vectors and head orientation without transmitting a single pixel off your machine.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ghost-ice/10 font-mono text-[10px] text-ghost-ice/50">
                PIPELINE: LOCAL WASM // 60 FPS
              </div>
            </div>

            {/* Tile 2 */}
            <div className="ghost-panel p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-ghost-blue/15 border border-ghost-blue/30 flex items-center justify-center text-ghost-ice mb-4">
                  <HiOutlineTerminal className="w-5 h-5 text-ghost-blue" />
                </div>
                <div className="font-mono text-[10px] text-ghost-blue uppercase tracking-widest mb-1">
                  02 // PROCEDURAL WEB AUDIO
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  7kHz Warm Analog Audio
                </h3>
                <p className="text-xs text-ghost-ice/70 font-ui leading-relaxed">
                  Lowpass-filtered procedural oscillators synthesize mechanical micro-ticks and relay toggles instantaneously. Zero slow MP3/WAV file downloads, zero click latency.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ghost-ice/10 font-mono text-[10px] text-ghost-ice/50">
                LATENCY: &lt; 12MS // 0 BYTES ASSET DOWNLOAD
              </div>
            </div>

            {/* Tile 3 */}
            <div className="ghost-panel p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-ghost-blue/15 border border-ghost-blue/30 flex items-center justify-center text-ghost-ice mb-4">
                  <HiOutlineShieldCheck className="w-5 h-5 text-ghost-blue" />
                </div>
                <div className="font-mono text-[10px] text-ghost-blue uppercase tracking-widest mb-1">
                  03 // AIR-GAPPED PRIVACY
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  Strict Zero Egress
                </h3>
                <p className="text-xs text-ghost-ice/70 font-ui leading-relaxed">
                  Only transcribed text is exchanged with the AI inference model. Webcam feeds, background environments, and raw biometrics are discarded at the frame buffer level.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ghost-ice/10 font-mono text-[10px] text-ghost-ice/50">
                AUDIT: COMPLIANT WITH GDPR / SOC2 APPLIANCE
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION: TACTILE MECHANICAL ACCORDION FAQ                                  */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-ghost-void border-b border-ghost-ice/15">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ghost-ice/50">
              [SUPPORT &amp; ARCHITECTURAL FAQ]
            </span>
            <h2 className="headline-monolithic text-3xl sm:text-5xl font-bold text-white tracking-tightest mt-2 mb-4">
              SYSTEM ARCHITECTURE SPECIFICATIONS
            </h2>
            <p className="text-xs sm:text-sm text-ghost-ice/60 font-ui">
              Click any question below to trigger the Web Audio procedural relay toggle switch.
            </p>
          </div>

          <div className="space-y-4">
            {specificationsFaq.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="ghost-panel overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => handleToggleFaq(idx)}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-display text-sm sm:text-base font-semibold text-white tracking-tight pr-4">
                      {item.q}
                    </span>
                    <div className={`p-1 rounded-full border border-ghost-ice/20 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-ghost-blue text-white' : 'text-ghost-ice/60'}`}>
                      <HiOutlineChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-ghost-ice/10 font-ui text-xs sm:text-sm text-ghost-ice/80 leading-relaxed bg-ghost-void/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CYBER-INDUSTRIAL APPLIANCE FOOTER                                         */}
      {/* ========================================================================= */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-[#000307] border-t border-ghost-ice/15 font-ui">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded bg-ghost-blue flex items-center justify-center text-white font-mono text-xs font-bold shadow-md shadow-ghost-blue/30">
                IQ
              </div>
              <span className="font-display font-bold text-white text-base tracking-tightest">
                INTERVIEW-IQ [GHOST CORE]
              </span>
            </div>
            <p className="text-xs text-ghost-ice/50 font-mono mt-2">
              Cyber-Industrial Physicality • Next.js Architecture • Web Audio Engine • WASM Vision
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-ghost-ice/70">
            <a href="#core" onMouseEnter={playHoverTick} className="hover:text-white transition-colors">Core</a>
            <a href="#specifications" onMouseEnter={playHoverTick} className="hover:text-white transition-colors">Specs</a>
            <a href="#tracks" onMouseEnter={playHoverTick} className="hover:text-white transition-colors">Tracks</a>
            <a href="#telemetry" onMouseEnter={playHoverTick} className="hover:text-white transition-colors">Telemetry</a>
            <Link to="/login" onMouseEnter={playHoverTick} className="hover:text-white transition-colors">Terminal</Link>
          </div>

          <div className="font-mono text-[10px] text-ghost-ice/40 border-l border-ghost-ice/15 pl-4 hidden lg:block">
            <div>SPEC: IEC 60601-1 PHYSICAL APPLIANCE</div>
            <div>FILTER: 7000Hz WARM LOWPASS SYNTH</div>
            <div>ZERO CLOUD VIDEO RETENTION</div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-ghost-ice/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-ghost-ice/40 gap-4">
          <div>© {new Date().getFullYear()} InterviewIQ. Derived from Ghost AI Core Product Ecosystem.</div>
          <div className="flex items-center gap-4">
            <span>DIETER RAMS MODEL</span>
            <span>TEENAGE ENGINEERING PHYSICALITY</span>
            <span>ARCHITECTURAL DRAFTING</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

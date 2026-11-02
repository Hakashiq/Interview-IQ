import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineVideoCamera,
  HiOutlineDocumentText, HiOutlineChartBar, HiOutlineCheckCircle,
  HiOutlineArrowRight, HiOutlineAcademicCap, HiOutlineShieldCheck,
  HiOutlineMicrophone, HiOutlineChevronDown, HiOutlineClock,
  HiOutlineBadgeCheck, HiOutlineUserGroup, HiOutlineLockClosed,
  HiOutlineMenu, HiOutlineX
} from 'react-icons/hi';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedRoleTab, setSelectedRoleTab] = useState('sde');

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const roleTracks = {
    sde: {
      title: 'Software Development Engineer (SDE)',
      skills: ['Java', 'Data Structures & Algorithms', 'System Design', 'OOP', 'SQL'],
      sampleQuestion: 'Explain the internal working of HashMap in Java. How does it resolve hash collisions under heavy load?',
      metrics: 'Evaluates time complexity, memory allocation, edge cases, and thread-safety considerations.'
    },
    backend: {
      title: 'Backend Engineer',
      skills: ['Java 21', 'Spring Boot', 'REST APIs', 'MySQL / PostgreSQL', 'Redis Caching'],
      sampleQuestion: 'How does Spring Boot auto-configuration work behind the scenes, and how do you customize bean creation?',
      metrics: 'Evaluates architectural layering, transaction boundaries, connection pooling, and REST conventions.'
    },
    fullstack: {
      title: 'Full Stack Developer',
      skills: ['React 19', 'JavaScript / TypeScript', 'Tailwind CSS', 'Node / Spring Boot', 'API Security'],
      sampleQuestion: 'Describe how you manage state and authentication tokens in a React SPA communicating with secured backend endpoints.',
      metrics: 'Evaluates frontend UX responsiveness, component isolation, state management, and end-to-end data flows.'
    },
    data: {
      title: 'Data Engineer',
      skills: ['SQL Optimization', 'DBMS Internals', 'ETL Pipelines', 'Distributed Systems', 'Python'],
      sampleQuestion: 'Compare indexing strategies (B-Tree vs Hash vs Clustered) and explain how you would troubleshoot a slow query execution plan.',
      metrics: 'Evaluates indexing cost, normalization tradeoffs, disk I/O, and query optimization patterns.'
    }
  };

  const faqs = [
    {
      q: 'How does the AI voice communication work without audio lag?',
      a: 'InterviewIQ uses high-performance in-browser Web Speech APIs. The AI question text is converted into natural audio using Speech Synthesis with customized interviewer personas, while your voice response is transcribed in real-time via Speech Recognition. Only clean text is sent to the backend, eliminating audio upload lag.'
    },
    {
      q: 'Is my webcam video recorded or sent to a remote server?',
      a: 'No. InterviewIQ runs Google MediaPipe FaceLandmarker directly inside your browser via WebAssembly (WASM). All face tracking, eye gaze estimation, and head orientation calculations occur locally on your machine. No video stream or webcam photos ever leave your computer.'
    },
    {
      q: 'Can I generate interview questions tailored specifically to my own resume?',
      a: 'Yes! Simply upload your resume (PDF or DOCX) in the Resume Analyzer. InterviewIQ extracts your technical skills, projects, and work experience, and can dynamically generate custom interview questions that target your specific background and target role.'
    },
    {
      q: 'How does the 5-pillar scoring system evaluate answers?',
      a: 'Every answer is analyzed against the benchmark ideal answer across 5 concrete dimensions: Technical Accuracy, Completeness, Communication Clarity, Question Relevance, and Confidence. You receive both quantitative scores (1-10) and qualitative advice on strengths, weaknesses, and key concepts missed.'
    },
    {
      q: 'What happens if I accidentally switch tabs during a proctored interview?',
      a: 'InterviewIQ monitors focus using window blur and visibility change events. You are granted warning allowances with real-time alerts. If persistent proctoring violations or tab-switches are recorded beyond the warning threshold, the session is protected and flagged to uphold interview integrity.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
              IQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-slate-900 tracking-tight">InterviewIQ</span>
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  AI Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Intelligent Placement Simulation</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">Role Tracks</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Integrity &amp; Privacy</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="btn-primary text-xs py-2 px-4 shadow-xs">
                  Dashboard
                </Link>
                <button onClick={logout} className="btn-ghost text-xs py-2 px-3">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="btn-secondary text-xs py-2 px-3.5">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4 shadow-xs">
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">How It Works</a>
            <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Role Tracks</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Integrity &amp; Privacy</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">FAQ</a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center w-full py-2.5">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary text-center w-full py-2">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center w-full py-2.5">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Next-Gen Placement Preparation Studio
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Master Technical Interviews with{' '}
            <span className="text-blue-600">Adaptive AI</span> &amp; Real-Time Proctoring
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed mb-10">
            Practice realistic interviews with dynamic questions, instant voice dictation, client-side gaze verification, and comprehensive 5-pillar evaluation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm py-3 px-6 shadow-sm flex items-center gap-2">
                Launch Dashboard <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-sm py-3 px-6 shadow-sm flex items-center gap-2">
                  <HiOutlineLightningBolt className="w-4 h-4" />
                  Start Free Mock Interview
                </Link>
                <Link to="/login" className="btn-secondary text-sm py-3 px-6 shadow-xs">
                  Candidate Login
                </Link>
              </>
            )}
            <a href="#how-it-works" className="btn-ghost text-sm py-3 px-5 text-slate-600 hover:text-slate-900">
              See How It Works
            </a>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-14 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900">100+</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Mock Interviews Completed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-blue-600">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">In-Browser Privacy (WASM)</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900">5-Pillar</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Detailed Rubric Scoring</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-600">&lt; 15ms</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Voice Recognition Latency</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Core Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
              Everything You Need to Ace Your Next Technical Round
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  <HiOutlineVideoCamera className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Adaptive AI Interviews</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dynamic technical questions generated by Google Gemini 2.0 tailored to your experience level and claimed skills.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                Natural Voice Synthesis <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <HiOutlineShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Client-Side Proctoring</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time face presence, eye gaze tracking, and tab-focus monitoring using MediaPipe WASM. No video uploaded.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                100% Air-Gapped Privacy <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                  <HiOutlineDocumentText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">ATS Resume Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload PDF or DOCX resumes to extract verified skills, audit keyword coverage, and generate targeted interview questions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-purple-600 flex items-center gap-1">
                5-Vector ATS Scoring <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                  <HiOutlineChartBar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">5-Pillar Scorecard</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive performance feedback evaluating technical accuracy, completeness, communication, relevance, and confidence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                Actionable Remediation <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Role Tracks Showcase */}
      <section id="roles" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Curriculum Roadmaps</h2>
          <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Role-Calibrated Interview Simulations
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Practice realistic questions targeted to specific software engineering tracks.
          </p>
        </div>

        {/* Track Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {Object.keys(roleTracks).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedRoleTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedRoleTab === key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {roleTracks[key].title.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Selected Track Details Card */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{roleTracks[selectedRoleTab].title}</h3>
              <p className="text-xs text-slate-500 mt-1">{roleTracks[selectedRoleTab].metrics}</p>
            </div>
            <Link to="/interviews" className="btn-primary text-xs py-2 px-4 shadow-xs self-start md:self-auto">
              Practice This Track
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Required Competencies:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {roleTracks[selectedRoleTab].skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
                Sample Live Question:
              </span>
              <p className="text-sm font-medium text-slate-800 italic">
                "{roleTracks[selectedRoleTab].sampleQuestion}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & In-Browser Privacy */}
      <section id="security" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 block">Privacy First Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              100% In-Browser Proctoring. Zero Video Recording.
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              We engineered the proctoring pipeline to execute exclusively inside your browser's WebAssembly sandbox. Video streams never touch external network sockets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <HiOutlineVideoCamera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">MediaPipe WASM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                478 facial landmarks and gaze vectors are calculated at 60 FPS directly on your device GPU/CPU.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <HiOutlineLockClosed className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Zero Cloud Storage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Video frames are immediately discarded from browser memory after landmark detection. No video is uploaded or stored.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <HiOutlineCheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Audited Integrity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Window blur events and multi-face detections trigger fair candidate warnings to uphold exam authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Got Questions?</h2>
          <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between font-semibold text-sm text-slate-900 focus:outline-none"
              >
                <span>{faq.q}</span>
                <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              IQ
            </div>
            <div>
              <span className="font-display font-bold text-sm text-slate-900">InterviewIQ</span>
              <p className="text-xs text-slate-500">Autonomous Technical Mock Interviews &amp; Resume Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600">How It Works</a>
            <a href="#roles" className="hover:text-blue-600">Roles</a>
            <a href="#security" className="hover:text-blue-600">Security</a>
            <a href="#faq" className="hover:text-blue-600">FAQ</a>
            <Link to="/login" className="hover:text-blue-600">Sign In</Link>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} InterviewIQ. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

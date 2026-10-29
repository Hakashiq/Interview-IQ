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
import ParticleBackground from '../components/layout/ParticleBackground';

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
      a: 'InterviewIQ uses high-performance in-browser Web Speech APIs. The AI question text is converted into human-like audio using Speech Synthesis with customized avatar personas, while your voice response is transcribed in real-time via Speech Recognition. Only clean text is communicated with the backend, eliminating slow audio upload latency.'
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
    <div className="min-h-screen bg-porcelain-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <ParticleBackground />

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
            <a href="#proctoring" className="hover:text-blue-600 transition-colors">AI Proctoring</a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">Role Tracks</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {user.fullName || user.email?.split('@')[0]}
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all active:scale-[0.99]"
                >
                  Dashboard
                  <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all active:scale-[0.99]"
                >
                  Get Started Free
                  <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <nav className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-blue-600">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-blue-600">How It Works</a>
              <a href="#proctoring" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-blue-600">AI Proctoring</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-blue-600">Role Tracks</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1.5 hover:text-blue-600">FAQ</a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 text-center text-xs font-semibold text-white bg-blue-600 rounded-lg"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs animate-fade-in">
            <HiOutlineSparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Next-Gen Placement Preparation & Technical AI Simulation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Ace Technical Interviews with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Adaptive Real-Time AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Practice voice-to-voice mock interviews, get instant 5-pillar evaluations, verify integrity with on-device MediaPipe vision proctoring, and optimize your resume for applicant tracking systems.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={user ? "/interviews" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all active:scale-[0.99]"
            >
              <HiOutlineLightningBolt className="w-4 h-4" />
              <span>{user ? "Start New Mock Interview" : "Start Free Mock Interview"}</span>
              <HiOutlineArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to={user ? "/resume" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
            >
              <HiOutlineDocumentText className="w-4 h-4 text-blue-600" />
              <span>Audit Resume with ATS</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineBadgeCheck className="w-4 h-4 text-emerald-600" />
              Gemini 2.0 Flash Powered
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineShieldCheck className="w-4 h-4 text-blue-600" />
              Private On-Device Proctoring
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineChartBar className="w-4 h-4 text-indigo-600" />
              5-Pillar Answer Rubric
            </span>
          </div>
        </div>

        {/* HERO INTERACTIVE SIMULATION PREVIEW */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
            
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-500 font-medium">interviewiq://live-session-simulation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  AI Proctor Active
                </span>
                <span className="font-mono text-[11px] text-slate-600 font-semibold">04:12</span>
              </div>
            </div>

            {/* Simulated Stage Area */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Question & AI Avatar Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      NL
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Neha Sharma • AI Technical Lead</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <HiOutlineMicrophone className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      Speaking Question 2 of 5 (Java Core & Architecture)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    DIFFICULTY: INTERMEDIATE
                  </span>
                </div>
              </div>

              {/* Question Text Box */}
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Interview Question</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900">
                  "Explain how a HashMap handles collisions in Java. What happens internally when two keys generate the exact same hash code, and how does the treeify threshold alter lookup performance?"
                </p>
              </div>

              {/* Real-Time Proctoring & Candidate Dictation Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Proctoring Status Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <HiOutlineVideoCamera className="w-4 h-4 text-blue-600" />
                      MediaPipe Proctoring
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      SECURE
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Face Orientation:</span>
                      <span className="font-semibold text-slate-900">Forward (98%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>People in Frame:</span>
                      <span className="font-semibold text-emerald-600">1 Detected</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Focus Violations:</span>
                      <span className="font-semibold text-slate-900">0 / 3</span>
                    </div>
                  </div>
                </div>

                {/* Candidate Dictation Speech Indicator */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <HiOutlineMicrophone className="w-4 h-4 text-emerald-600" />
                      Candidate Voice Transcript (Speech-to-Text)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">LIVE AUDIO RECOGNITION</span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "When keys collide, HashMap stores nodes in a linked list at the computed bucket index. When the bucket size exceeds 8 and total capacity is at least 64, it treeifies into a Red-Black Tree to improve worst-case search from O(n) to O(log n)..."
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Filler words detected: <strong className="text-slate-700">0</strong></span>
                    <span className="font-semibold text-blue-600">Estimated Score: 9.4 / 10 ✨</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* METRICS & SOCIAL PROOF STRIP */}
      <section className="border-y border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">10,000+</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Mock Interviews Completed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">5-Pillar</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Instant Grading Rubric</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">&lt;250ms</p>
              <p className="text-xs text-slate-500 font-medium mt-1">On-Device Proctoring Latency</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Private Edge Computer Vision</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
            Engineered for Modern Placement Rigor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to master technical rounds, eliminate interview anxiety, and beat ATS filters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <HiOutlineMicrophone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Voice-to-Voice AI Interviews</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time conversational flow using browser speech synthesis and recognition. Speak naturally as AI interviewer personas ask dynamic follow-ups based on your exact answers.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <HiOutlineShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Private MediaPipe Proctoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google MediaPipe WASM tracks gaze yaw/pitch, multi-person presence, and window focus directly in your browser. Complete exam-grade proctoring with zero server video recording.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <HiOutlineChartBar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">5-Pillar Answer Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get scored 1-10 on Technical Accuracy, Completeness, Relevance, Communication, and Confidence, with structured feedback highlighting missed edge cases and exact improvements.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <HiOutlineDocumentText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">ATS Resume Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extract technical skills from PDF/DOCX resumes, receive an ATS compatibility score, detect missing keywords, and automatically regenerate a recruiter-ready restructured resume.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <HiOutlineAcademicCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Curated Question Bank</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access hundreds of categorized technical questions spanning Java, Spring Boot, MySQL, REST APIs, System Design, DSA, and Behavioral rounds, filtered by exact difficulty.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-subtle hover:border-blue-300 hover:shadow-card transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <HiOutlineClock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Personalized Study Roadmaps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI tracks topics where your scores dip below 60% and compiles a tailored 4-week preparation plan complete with priority focus areas and recommended practice topics.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-md">
              Workflow Guide
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
              Three Simple Steps to Placement Readiness
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Go from uncertain preparation to confident interview execution in one unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle relative">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Select Role or Upload Resume</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose from predefined engineering tracks (SDE, Backend, Full Stack) or upload your resume to have questions dynamically generated from your real projects and skill set.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle relative">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Live Speech & Vision Simulation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Listen to the AI interviewer voice your questions, respond using voice dictation, and experience realistic pressure under automated MediaPipe proctoring.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle relative">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Review 5-Pillar Scorecard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect question-by-question scoring, compare your answer against ideal benchmarks, identify knowledge gaps, and receive a customized 4-week study roadmap.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ROLE TRACK EXPLORER */}
      <section id="roles" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Curriculum Alignment
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
            Tailored Engineering Tracks
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Explore domain questions aligned with industry roadmaps and top placement patterns.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {Object.keys(roleTracks).map((roleKey) => (
            <button
              key={roleKey}
              onClick={() => setSelectedRoleTab(roleKey)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedRoleTab === roleKey
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {roleTracks[roleKey].title.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Selected Track Details Card */}
        <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card">
          <h3 className="text-lg font-bold text-slate-900 mb-3">{roleTracks[selectedRoleTab].title}</h3>
          
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Evaluated Skills
            </span>
            <div className="flex flex-wrap gap-2">
              {roleTracks[selectedRoleTab].skills.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 mb-4">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
              Sample Interview Question
            </span>
            <p className="text-sm font-semibold text-slate-900">
              "{roleTracks[selectedRoleTab].sampleQuestion}"
            </p>
          </div>

          <p className="text-xs text-slate-500">
            <strong className="text-slate-700">Evaluation Criteria:</strong> {roleTracks[selectedRoleTab].metrics}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Includes Easy, Intermediate & Advanced rounds</span>
            <Link
              to={user ? "/interviews" : "/register"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Practice this track</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROCTORING PRIVACY HIGHLIGHT */}
      <section id="proctoring" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800">
                Data Privacy & Integrity
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Exam-Grade Proctoring Without Violating Privacy
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional proctoring uploads high-resolution video streams to remote servers, compromising candidate privacy and increasing network bandwidth requirements.
              </p>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>100% In-Browser Execution:</strong> MediaPipe runs purely in WebAssembly. No video frames are ever transmitted or saved on any server.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Gaze & Pose Detection:</strong> Measures pitch and yaw landmarks every 250ms to detect looking away or multiple faces.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Window & Focus Alerts:</strong> Real-time alerts for browser tab switches and multi-window detours ensure realistic mock discipline.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-xs font-mono font-semibold text-slate-300">AI PROCTOR ARCHITECTURE</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                  CLIENT-SIDE ZERO-DATA PIPELINE
                </span>
              </div>
              <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>1. Webcam Stream</span>
                  <span className="text-emerald-400 font-bold">Local HTMLVideo</span>
                </div>
                <div className="text-center text-slate-500">↓ (250ms RAF interval)</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>2. MediaPipe WASM</span>
                  <span className="text-blue-400 font-bold">In-Browser Landmark Extraction</span>
                </div>
                <div className="text-center text-slate-500">↓ (Math ratios: Yaw/Pitch)</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>3. Integrity State</span>
                  <span className="text-emerald-400 font-bold">Instant Local Feedback UI</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center pt-2">
                Server receives zero video bytes • Minimal bandwidth consumed
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Learn more about how InterviewIQ prepares you for campus placements and off-campus tech drives.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                <HiOutlineChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
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

      {/* BOTTOM CALL TO ACTION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-700 text-white p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          
          {/* Decorative radial circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
              Ready to Master Your Next Technical Interview?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Join candidates preparing for top tech roles. Experience adaptive voice mock interviews, instant 5-pillar evaluations, and ATS resume audits.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={user ? "/interviews" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 bg-white hover:bg-slate-50 shadow-md transition-all active:scale-[0.99]"
              >
                <span>{user ? "Go to Interviews" : "Create Free Account"}</span>
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={user ? "/dashboard" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-800/60 hover:bg-blue-800 border border-blue-400/30 transition-all"
              >
                <span>{user ? "View Dashboard" : "Sign In to Existing Account"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/90 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              IQ
            </div>
            <div>
              <span className="font-bold text-slate-900">InterviewIQ</span>
              <span className="ml-2 text-slate-400">© {new Date().getFullYear()} All rights reserved.</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#proctoring" className="hover:text-blue-600 transition-colors">Proctoring</a>
            <Link to="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-blue-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

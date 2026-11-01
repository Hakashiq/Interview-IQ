import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';
import {
  HiOutlineChartBar, HiOutlineChevronDown, HiOutlineClipboardList,
  HiOutlineClock, HiOutlineLightningBolt, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineAcademicCap, HiOutlineArrowRight,
  HiOutlineTrendingUp, HiOutlineRefresh
} from 'react-icons/hi';

function CleanScoreDial({ score, size = 140, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const progress = ((score || 0) / 10) * circumference;
      setOffset(circumference - progress);
    }, 200);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const strokeColor =
    score >= 8 ? '#10b981' :
    score >= 6 ? '#007dff' :
    score >= 4 ? '#ff5517' : '#9f0712';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#0c1524"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-mono font-bold tracking-tight text-white">
          {score?.toFixed(1) || '0.0'}
        </span>
        <span className="text-[10px] font-mono text-ghost-ice/40 uppercase mt-0.5">/ 10 PTS</span>
      </div>
    </div>
  );
}

export default function InterviewResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await api.get(`/interviews/${id}/results`);
        setResults(res.data);
      } catch (err) {
        toast.error('Failed to load interview results');
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ghost-void text-ghost-ice devices-matrix-grid">
        <div className="ghost-panel p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-2 border-ghost-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-ghost-ice/70 text-xs font-mono">Aggregating telemetry feedback &amp; scores...</p>
        </div>
      </div>
    );
  }

  const questions = results?.questionResults || results?.questions || [];
  const overallScore = results?.overallScore || 0;
  const totalQuestions = questions.length;
  const avgScore = totalQuestions > 0
    ? (questions.reduce((sum, q) => sum + (q.feedback?.overallScore || 0), 0) / totalQuestions).toFixed(1)
    : '0.0';

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handleToggleQuestion = (index) => {
    const next = expandedId === index ? null : index;
    setExpandedId(next);
    playMechanicalToggle(next !== null);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-ghost-ice/15">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="telemetry-chip-active text-[10px]">
                AUDIT // PERFORMANCE DEBRIEF
              </span>
              <span className="telemetry-chip text-[10px]">{results?.jobRole || 'General'}</span>
              {results?.difficulty && (
                <span className="telemetry-chip text-[10px] uppercase">{results.difficulty}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tightest">
              Simulation Debrief &amp; Assessment
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                playMechanicalToggle(true);
                navigate('/interviews');
              }}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="ghost-button-blue text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <HiOutlineRefresh className="w-3.5 h-3.5" />
              <span>New Chamber</span>
            </button>
            <button
              onClick={() => {
                playMechanicalToggle(true);
                navigate('/dashboard');
              }}
              onMouseEnter={playHoverTick}
              className="ghost-button-void text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5 text-ghost-ice/50" />
            </button>
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="ghost-panel p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-shrink-0">
              <CleanScoreDial score={overallScore} />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5">
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  overallScore >= 8
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : overallScore >= 6
                    ? 'bg-ghost-blue/15 border-ghost-blue/40 text-ghost-ice'
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                }`}>
                  {overallScore >= 8 ? 'STRONG HIRE TELEMETRY' :
                   overallScore >= 6 ? 'COMPETENT READINESS' :
                   overallScore >= 4 ? 'NEEDS REMEDIATION' : 'FOUNDATION DEFICIT'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                {overallScore >= 8
                  ? 'Exemplary Technical Mastery & Delivery'
                  : overallScore >= 6
                  ? 'Solid Domain Knowledge with Minor Boundaries'
                  : 'Key Concepts Require Further Practice'}
              </h2>
              <p className="text-xs sm:text-sm text-ghost-ice/70 font-ui max-w-2xl leading-relaxed">
                {overallScore >= 8
                  ? 'Your answers demonstrated structured thinking, accurate technical depth, and clear communication. Review the fine-grained insights below to achieve perfection.'
                  : overallScore >= 6
                  ? 'Good performance overall. You articulated core principles well, but could bolster system trade-offs and edge-case handling.'
                  : 'Review the areas for growth and suggested improvements below to refine your technical responses before real-world rounds.'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Questions', value: totalQuestions, icon: HiOutlineClipboardList, hint: 'EVALUATED' },
            { label: 'Mean Score', value: `${avgScore}/10`, icon: HiOutlineTrendingUp, hint: 'PER INQUIRY' },
            { label: 'Time Elapsed', value: formatTime(results?.totalTimeTaken || results?.timeTakenSeconds), icon: HiOutlineClock, hint: 'DURATION' },
            { label: 'Track Tier', value: results?.difficulty || 'Medium', icon: HiOutlineLightningBolt, hint: 'CALIBRATION' },
          ].map((stat) => (
            <div key={stat.label} className="ghost-panel p-4 sm:p-5">
              <div className="flex items-center justify-between text-ghost-ice/40 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ghost-ice/60">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-ghost-blue" />
              </div>
              <p className="text-2xl font-mono font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[9px] font-mono text-ghost-ice/40 mt-0.5">{stat.hint}</p>
            </div>
          ))}
        </div>

        {/* Question-by-Question Accordion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-ghost-blue" />
              Algorithmic Question Diagnostics
            </h2>
            <span className="text-xs text-ghost-ice/50 font-mono">
              {questions.length} PROMPTS EVALUATED
            </span>
          </div>

          <div className="space-y-3">
            {questions.map((q, index) => {
              const fb = q.feedback || {};
              const isExpanded = expandedId === index;
              const qScore = fb.overallScore || 0;

              return (
                <div
                  key={index}
                  className="ghost-panel overflow-hidden transition-all duration-200"
                >
                  {/* Trigger */}
                  <button
                    onClick={() => handleToggleQuestion(index)}
                    onMouseEnter={playHoverTick}
                    data-sfx="toggle"
                    className="w-full flex items-start gap-4 p-4 sm:p-5 text-left focus:outline-none"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm border ${
                      qScore >= 8
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : qScore >= 6
                        ? 'bg-ghost-blue/15 border-ghost-blue/40 text-ghost-ice'
                        : 'bg-red-950/60 border-red-500/40 text-red-300'
                    }`}>
                      {qScore}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-ghost-ice/50">
                          Q{index + 1}
                        </span>
                        {(q.category || q.question?.category?.name) && (
                          <span className="telemetry-chip text-[9px] uppercase">
                            {q.category || q.question?.category?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-display font-bold text-white leading-snug">
                        {q.questionText || q.question?.questionText || `Question ${index + 1}`}
                      </p>
                    </div>

                    <HiOutlineChevronDown
                      className={`w-5 h-5 text-ghost-ice/40 flex-shrink-0 transition-transform duration-200 mt-1 ${
                        isExpanded ? 'rotate-180 text-ghost-blue' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 space-y-4 border-t border-ghost-ice/10 pt-4 bg-[#000307]/50">
                      
                      {/* Candidate Answer */}
                      {q.answerText && (
                        <div className="p-4 rounded-xl bg-[#000307] border border-ghost-ice/15">
                          <p className="text-[10px] font-mono text-ghost-ice/50 uppercase tracking-widest mb-1.5 font-semibold">
                            SUBMITTED RESPONSE BUFFER
                          </p>
                          <p className="text-xs font-mono text-ghost-ice/90 leading-relaxed whitespace-pre-wrap">
                            {q.answerText}
                          </p>
                        </div>
                      )}

                      {/* Score Breakdown Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { label: 'Accuracy', score: fb.technicalAccuracy },
                          { label: 'Completeness', score: fb.completeness },
                          { label: 'Communication', score: fb.communication },
                          { label: 'Relevance', score: fb.relevance },
                        ].map(({ label, score }) => (
                          <div key={label} className="p-2.5 rounded-xl bg-ghost-void border border-ghost-ice/15 text-center">
                            <p className={`text-base font-bold font-mono ${
                              (score || 0) >= 8 ? 'text-emerald-400' :
                              (score || 0) >= 6 ? 'text-ghost-blue' : 'text-red-400'
                            }`}>
                              {score || 0}<span className="text-[10px] font-normal text-ghost-ice/40">/10</span>
                            </p>
                            <p className="text-[10px] font-mono text-ghost-ice/60 uppercase">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fb.strengths && (
                          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-ghost-ice">
                            <h4 className="text-xs font-mono font-semibold text-emerald-400 mb-1 flex items-center gap-1.5 uppercase">
                              <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                              Key Strengths
                            </h4>
                            <p className="text-xs font-ui text-ghost-ice/80 leading-relaxed">{fb.strengths}</p>
                          </div>
                        )}
                        {fb.weaknesses && (
                          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-ghost-ice">
                            <h4 className="text-xs font-mono font-semibold text-red-400 mb-1 flex items-center gap-1.5 uppercase">
                              <HiOutlineSparkles className="w-4 h-4 text-red-400" />
                              Areas for Improvement
                            </h4>
                            <p className="text-xs font-ui text-ghost-ice/80 leading-relaxed">{fb.weaknesses}</p>
                          </div>
                        )}
                      </div>

                      {fb.improvements && (
                        <div className="p-3.5 rounded-xl bg-ghost-blue/10 border border-ghost-blue/30 text-ghost-ice">
                          <h4 className="text-xs font-mono font-semibold text-ghost-blue mb-1 flex items-center gap-1.5 uppercase">
                            <HiOutlineLightningBolt className="w-4 h-4 text-ghost-blue" />
                            Suggested Strategy
                          </h4>
                          <p className="text-xs font-ui text-ghost-ice/80 leading-relaxed">{fb.improvements}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

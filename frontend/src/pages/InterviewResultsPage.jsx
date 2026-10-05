import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
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
    score >= 8 ? '#16a34a' :
    score >= 6 ? '#2563eb' :
    score >= 4 ? '#d97706' : '#dc2626';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
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
        <span className="text-3xl font-bold font-display tracking-tight text-slate-900">
          {score?.toFixed(1) || '0.0'}
        </span>
        <span className="text-[11px] font-mono text-slate-400 mt-0.5">/ 10</span>
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
      <div className="min-h-screen flex items-center justify-center bg-porcelain-50">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Aggregating interview feedback & scores...</p>
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Performance Evaluation
              </span>
              <span className="badge-neutral text-xs">{results?.jobRole || 'General'}</span>
              {results?.difficulty && (
                <span className="badge-neutral text-xs uppercase">{results.difficulty}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              Interview Debrief & Assessment
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/interviews')}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs"
            >
              <HiOutlineRefresh className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <HiOutlineArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-shrink-0">
              <CleanScoreDial score={overallScore} />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  overallScore >= 8
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : overallScore >= 6
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {overallScore >= 8 ? 'Strong Hire Indicator' :
                   overallScore >= 6 ? 'Competent Performance' :
                   overallScore >= 4 ? 'Needs Development' : 'Foundation Level'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-slate-900">
                {overallScore >= 8
                  ? 'Exemplary Technical Mastery & Delivery'
                  : overallScore >= 6
                  ? 'Solid Domain Knowledge with Minor Gaps'
                  : 'Key Concepts Require Further Practice'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {overallScore >= 8
                  ? 'Your answers demonstrated structured thinking, accurate technical depth, and clear communication. Review the fine-grained insights below to reach perfection.'
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
            { label: 'Total Questions', value: totalQuestions, icon: HiOutlineClipboardList, hint: 'Answered' },
            { label: 'Average Score', value: `${avgScore}/10`, icon: HiOutlineTrendingUp, hint: 'Per question mean' },
            { label: 'Time Elapsed', value: formatTime(results?.totalTimeTaken || results?.timeTakenSeconds), icon: HiOutlineClock, hint: 'Total duration' },
            { label: 'Difficulty Track', value: results?.difficulty || 'Medium', icon: HiOutlineLightningBolt, hint: 'Calibrated level' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-600">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-display font-bold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{stat.hint}</p>
            </div>
          ))}
        </div>

        {/* Question-by-Question Accordion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-blue-600" />
              Question-by-Question Analysis
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {questions.length} items evaluated
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
                  className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs transition-colors hover:border-slate-300"
                >
                  {/* Question Header Accordion Trigger */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : index)}
                    className="w-full flex items-start gap-4 p-4 sm:p-5 text-left focus:outline-none"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-display font-bold text-sm border ${
                      qScore >= 8
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : qScore >= 6
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      {qScore}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          Q{index + 1}
                        </span>
                        {(q.category || q.question?.category?.name) && (
                          <span className="badge-neutral text-[10px] uppercase">
                            {q.category || q.question?.category?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {q.questionText || q.question?.questionText || `Question ${index + 1}`}
                      </p>
                    </div>

                    <HiOutlineChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 mt-1 ${
                        isExpanded ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 space-y-4 border-t border-slate-100 pt-4 bg-slate-50/50">
                      
                      {/* Candidate Answer */}
                      {q.answerText && (
                        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                            Submitted Response
                          </p>
                          <p className="text-xs sm:text-sm font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
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
                          <div key={label} className="p-2.5 rounded-lg bg-white border border-slate-200/70 text-center">
                            <p className={`text-base font-bold font-display ${
                              (score || 0) >= 8 ? 'text-emerald-600' :
                              (score || 0) >= 6 ? 'text-blue-600' : 'text-rose-600'
                            }`}>
                              {score || 0}<span className="text-[10px] font-normal text-slate-400">/10</span>
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fb.strengths && (
                          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-slate-800">
                            <h4 className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                              <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />
                              Key Strengths
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed">{fb.strengths}</p>
                          </div>
                        )}
                        {fb.weaknesses && (
                          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-slate-800">
                            <h4 className="text-xs font-semibold text-rose-800 mb-1 flex items-center gap-1.5">
                              <HiOutlineSparkles className="w-4 h-4 text-rose-600" />
                              Areas for Improvement
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed">{fb.weaknesses}</p>
                          </div>
                        )}
                      </div>

                      {fb.improvements && (
                        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-slate-800">
                          <h4 className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                            <HiOutlineLightningBolt className="w-4 h-4 text-blue-600" />
                            Suggested Strategy
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed">{fb.improvements}</p>
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

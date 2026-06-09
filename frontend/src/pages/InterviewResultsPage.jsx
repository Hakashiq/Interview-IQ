import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';
import {
  HiOutlineChartBar, HiOutlineChevronDown, HiOutlineClipboardList,
  HiOutlineClock, HiOutlineLightningBolt, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineAcademicCap, HiOutlineArrowRight,
  HiOutlineTrendingUp
} from 'react-icons/hi';

function CircularProgress({ score, size = 160, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const progress = ((score || 0) / 10) * circumference;
      setOffset(circumference - progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const scoreColor = score >= 8 ? '#34d399' : score >= 6 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold font-display" style={{ color: scoreColor }}>
          {score?.toFixed(1) || '0.0'}
        </span>
        <span className="text-xs text-gray-500 mt-1">out of 10</span>
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
        toast.error('Failed to load results');
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Loading results...</p>
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
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineChartBar className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Interview Results</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Your <span className="gradient-text">Performance</span>
        </h1>
        <p className="text-gray-400 mt-2">
          {results?.jobRole && <span className="text-white font-medium">{results.jobRole}</span>}
          {results?.difficulty && <span className="ml-2 badge-warning text-xs">{results.difficulty}</span>}
        </p>
      </div>

      {/* Overall Score Circle */}
      <div className="glass-card p-8 mb-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <CircularProgress score={overallScore} />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              {overallScore >= 8 ? 'Excellent Performance! 🌟' :
               overallScore >= 6 ? 'Good Job! 💪' :
               overallScore >= 4 ? 'Keep Practicing! 📚' : 'Room for Improvement 🚀'}
            </h2>
            <p className="text-gray-400 max-w-lg">
              {overallScore >= 8
                ? 'You demonstrated strong knowledge and communication skills across the interview questions.'
                : overallScore >= 6
                ? 'You showed good understanding but there are areas where you can improve further.'
                : 'Focus on the feedback below to strengthen your weak areas and practice more.'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Questions', value: totalQuestions, icon: HiOutlineClipboardList, color: 'from-primary-500 to-purple-500' },
          { label: 'Average Score', value: `${avgScore}/10`, icon: HiOutlineTrendingUp, color: 'from-emerald-500 to-teal-500' },
          { label: 'Time Taken', value: formatTime(results?.totalTimeTaken || results?.timeTakenSeconds), icon: HiOutlineClock, color: 'from-amber-500 to-orange-500' },
          { label: 'Difficulty', value: results?.difficulty || '--', icon: HiOutlineLightningBolt, color: 'from-pink-500 to-rose-500' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="glass-card-hover p-5 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} inline-flex mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Per-Question Results */}
      <div className="mb-8">
        <h2 className="text-xl font-display font-bold text-white mb-4">
          <HiOutlineAcademicCap className="w-5 h-5 inline mr-2 text-primary-400" />
          Question-by-Question Breakdown
        </h2>
        <div className="space-y-3">
          {questions.map((q, index) => {
            const fb = q.feedback || {};
            const isExpanded = expandedId === index;
            const qScore = fb.overallScore || 0;

            return (
              <div
                key={index}
                className="glass-card-hover overflow-hidden animate-slide-up"
                style={{ animationDelay: `${(index + 4) * 80}ms` }}
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : index)}
                  className="w-full flex items-start gap-4 p-5 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    qScore >= 8 ? 'bg-emerald-500/10 text-emerald-400' :
                    qScore >= 6 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {qScore}/10
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-relaxed">
                      {q.questionText || q.question?.questionText || `Question ${index + 1}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {(q.category || q.question?.category?.name) && (
                        <span className="badge-info text-xs">{q.category || q.question?.category?.name}</span>
                      )}
                      <span className="text-xs text-gray-500">Q{index + 1}</span>
                    </div>
                  </div>
                  <HiOutlineChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 animate-fade-in">
                    {/* User's Answer */}
                    {q.answerText && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Your Answer</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{q.answerText}</p>
                      </div>
                    )}

                    {/* Score Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { label: 'Accuracy', score: fb.technicalAccuracy },
                        { label: 'Completeness', score: fb.completeness },
                        { label: 'Communication', score: fb.communication },
                        { label: 'Relevance', score: fb.relevance },
                        { label: 'Overall', score: fb.overallScore },
                      ].map(({ label, score }) => (
                        <div key={label} className="p-3 rounded-xl bg-white/5 text-center">
                          <p className={`text-2xl font-bold ${
                            score >= 8 ? 'text-emerald-400' :
                            score >= 6 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {score || 0}/10
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fb.strengths && (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          <h4 className="text-sm font-semibold text-emerald-400 mb-2">💪 Strengths</h4>
                          <p className="text-sm text-gray-300 leading-relaxed">{fb.strengths}</p>
                        </div>
                      )}
                      {fb.weaknesses && (
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                          <h4 className="text-sm font-semibold text-red-400 mb-2">📌 Areas to Improve</h4>
                          <p className="text-sm text-gray-300 leading-relaxed">{fb.weaknesses}</p>
                        </div>
                      )}
                    </div>

                    {fb.improvements && (
                      <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                        <h4 className="text-sm font-semibold text-primary-400 mb-2">💡 Suggestions</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{fb.improvements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
        <button
          onClick={() => navigate('/interviews')}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <HiOutlineSparkles className="w-5 h-5" />
          Practice Again
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary inline-flex items-center justify-center gap-2"
        >
          <HiOutlineArrowRight className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
    </AppLayout>
  );
}

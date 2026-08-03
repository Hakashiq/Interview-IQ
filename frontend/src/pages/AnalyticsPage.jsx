import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineAcademicCap,
  HiOutlineLightningBolt, HiOutlineClipboardList, HiOutlineClock
} from 'react-icons/hi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLight = document.documentElement.classList.contains('light');
  const chartTextColor = isLight ? '#475569' : 'rgba(255,255,255,0.7)';
  const chartGridColor = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.1)';
  const tooltipBg = isLight ? '#ffffff' : '#1e293b';
  const tooltipBorder = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.1)';
  const tooltipTitle = isLight ? '#0f172a' : '#fff';
  const tooltipBody = isLight ? '#475569' : 'rgba(255,255,255,0.8)';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/interviews/history');
        setInterviews(res.data || []);
      } catch {
        // No data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInterviews = interviews.length;
  const avgScore = totalInterviews > 0
    ? (interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / totalInterviews).toFixed(1)
    : '--';
  const totalTimeMinutes = interviews.reduce((sum, i) => sum + ((i.timeTakenSeconds || 0) / 60), 0);
  const totalTimeStr = totalTimeMinutes > 60 ? `${Math.floor(totalTimeMinutes / 60)}h ${Math.round(totalTimeMinutes % 60)}m` : `${Math.round(totalTimeMinutes)}m`;

  const easyCount = interviews.filter(i => i.difficulty === 'EASY').length;
  const mediumCount = interviews.filter(i => i.difficulty === 'MEDIUM').length;
  const hardCount = interviews.filter(i => i.difficulty === 'HARD').length;

  const stats = [
    { label: 'Total Interviews', value: totalInterviews.toString(), icon: HiOutlineClipboardList, color: 'from-primary-500 to-purple-500' },
    { label: 'Average Score', value: avgScore === '--' ? '--' : `${avgScore}/10`, icon: HiOutlineTrendingUp, color: 'from-emerald-500 to-teal-500' },
    { label: 'Difficulties Tried', value: `${[easyCount > 0, mediumCount > 0, hardCount > 0].filter(Boolean).length}/3`, icon: HiOutlineLightningBolt, color: 'from-amber-500 to-orange-500' },
    { label: 'Total Time', value: totalInterviews > 0 ? totalTimeStr : '0m', icon: HiOutlineClock, color: 'from-pink-500 to-rose-500' },
  ];

  // Line Chart Data — Score over time
  const sortedInterviews = [...interviews]
    .filter(i => i.overallScore != null)
    .sort((a, b) => new Date(a.createdAt || a.startedAt) - new Date(b.createdAt || b.startedAt));

  const lineData = {
    labels: sortedInterviews.map((i, idx) => {
      const d = new Date(i.createdAt || i.startedAt);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || `#${idx + 1}`;
    }),
    datasets: [
      {
        label: 'Overall Score',
        data: sortedInterviews.map(i => i.overallScore || 0),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: chartGridColor, drawBorder: false },
        ticks: { color: chartTextColor, font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 10,
        grid: { color: chartGridColor, drawBorder: false },
        ticks: { color: chartTextColor, stepSize: 2, font: { size: 11 } },
      },
    },
  };

  // Doughnut Chart Data — Difficulty Distribution
  const doughnutData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [easyCount, mediumCount, hardCount],
        backgroundColor: [
          'rgba(52, 211, 153, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(248, 113, 113, 0.8)',
        ],
        borderColor: [
          'rgba(52, 211, 153, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(248, 113, 113, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartTextColor,
          padding: 20,
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  };

  // Skill bars from unique job roles
  const roleCounts = {};
  interviews.forEach(i => {
    const role = i.jobRole || 'Unknown';
    if (!roleCounts[role]) roleCounts[role] = { count: 0, totalScore: 0 };
    roleCounts[role].count++;
    roleCounts[role].totalScore += (i.overallScore || 0);
  });

  const skillBars = Object.entries(roleCounts)
    .map(([role, data]) => ({
      name: role,
      level: Math.round((data.totalScore / data.count) * 10),
      maxLevel: 100,
    }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 6);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <HiOutlineChartBar className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-purple-400 font-medium">Analytics</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Your <span className="gradient-text">Performance</span>
        </h1>
        <p className="text-gray-400 mt-2">Track your interview preparation progress and skill development.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="glass-card-hover p-6 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} inline-flex mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {totalInterviews === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <HiOutlineChartBar className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">No Data Yet</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Complete your first interview to see performance charts, score trends, and detailed analytics here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Trend Line Chart */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-lg font-display font-semibold text-white mb-6">Score Trends</h2>
            <div className="h-64">
              {sortedInterviews.length > 0 ? (
                <Line data={lineData} options={lineOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Complete interviews to see score trends
                </div>
              )}
            </div>
          </div>

          {/* Difficulty Distribution Doughnut */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-lg font-display font-semibold text-white mb-6">Difficulty Distribution</h2>
            <div className="h-64">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          {/* Role Performance */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <h2 className="text-lg font-display font-semibold text-white mb-6">Performance by Role</h2>
            <div className="space-y-5">
              {skillBars.length > 0 ? (
                skillBars.map(({ name, level, maxLevel }) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300 font-medium">{name}</span>
                      <span className="text-xs text-gray-500">{level}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all duration-700"
                        style={{ width: `${(level / maxLevel) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No role data available
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Placeholder */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
            <h2 className="text-lg font-display font-semibold text-white mb-6">AI Recommendations</h2>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <HiOutlineLightningBolt className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400">
                {totalInterviews >= 3
                  ? 'Focus on improving your weak areas identified in recent interviews.'
                  : 'Complete at least 3 interviews for AI-powered learning suggestions.'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {totalInterviews >= 3
                  ? `Based on ${totalInterviews} interviews analyzed`
                  : `${3 - totalInterviews} more interview(s) needed`}
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

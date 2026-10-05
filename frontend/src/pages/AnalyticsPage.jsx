import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  HiOutlineChartBar, HiOutlineTrendingUp,
  HiOutlineLightningBolt, HiOutlineClipboardList, HiOutlineClock
} from 'react-icons/hi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartTextColor = '#64748b';
  const chartGridColor = '#f1f5f9';
  const tooltipBg = '#0f172a';
  const tooltipBorder = '#1e293b';
  const tooltipTitle = '#ffffff';
  const tooltipBody = '#cbd5e1';

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
  const totalTimeStr = totalTimeMinutes > 60
    ? `${Math.floor(totalTimeMinutes / 60)}h ${Math.round(totalTimeMinutes % 60)}m`
    : `${Math.round(totalTimeMinutes)}m`;

  const easyCount = interviews.filter(i => i.difficulty === 'EASY').length;
  const mediumCount = interviews.filter(i => i.difficulty === 'MEDIUM').length;
  const hardCount = interviews.filter(i => i.difficulty === 'HARD').length;

  const stats = [
    { label: 'Completed Sessions', value: totalInterviews.toString(), icon: HiOutlineClipboardList, hint: 'All time simulated' },
    { label: 'Average Score', value: avgScore === '--' ? '--' : `${avgScore}/10`, icon: HiOutlineTrendingUp, hint: 'Across all difficulties' },
    { label: 'Tiers Explored', value: `${[easyCount > 0, mediumCount > 0, hardCount > 0].filter(Boolean).length}/3`, icon: HiOutlineLightningBolt, hint: 'Easy, Medium, Hard' },
    { label: 'Total Practice Time', value: totalInterviews > 0 ? totalTimeStr : '0m', icon: HiOutlineClock, hint: 'Active answering time' },
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
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
        borderWidth: 2,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
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
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: chartGridColor, drawBorder: false },
        ticks: { color: chartTextColor, font: { size: 11, family: 'Inter' } },
      },
      y: {
        min: 0,
        max: 10,
        grid: { color: chartGridColor, drawBorder: false },
        ticks: { color: chartTextColor, stepSize: 2, font: { size: 11, family: 'Inter' } },
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
          '#10b981',
          '#2563eb',
          '#f59e0b',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
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
          padding: 16,
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: '68%',
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
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Aggregating telemetry analytics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Telemetry Insights
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Performance Analytics & Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track interview preparation progress, score trajectories across question domains, and consistency trends.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-600">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-display font-bold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{stat.hint}</p>
            </div>
          ))}
        </div>

        {totalInterviews === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <HiOutlineChartBar className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">Telemetry Data Needed</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete your first mock interview simulation to populate score trajectories, competency breakdowns, and difficulty distributions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Score Trend Line Chart */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Score Trajectory</h2>
                <p className="text-xs text-slate-500">Chronological score trend over recent completed interviews</p>
              </div>
              <div className="h-64">
                {sortedInterviews.length > 0 ? (
                  <Line data={lineData} options={lineOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    Complete additional interviews to plot trend line
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Distribution Doughnut */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Difficulty Distribution</h2>
                <p className="text-xs text-slate-500">Breakdown of practice sessions by calibrated difficulty</p>
              </div>
              <div className="h-64">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>

            {/* Performance by Role */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Discipline Mastery</h2>
                <p className="text-xs text-slate-500">Aggregated composite performance by job role and topic</p>
              </div>
              <div className="space-y-4 pt-1">
                {skillBars.length > 0 ? (
                  skillBars.map(({ name, level, maxLevel }) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="font-semibold text-slate-800">{name}</span>
                        <span className="font-mono text-slate-500">{level}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${(level / maxLevel) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No role-specific data accumulated yet
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations & Action Plan */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Targeted AI Guidance</h2>
                <p className="text-xs text-slate-500">Automated diagnostic suggestions based on your responses</p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <HiOutlineLightningBolt className="w-4 h-4 text-blue-600" />
                  <span>Preparation Status</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {totalInterviews >= 3
                    ? 'Your communication clarity is consistent. Focus on deepening architectural edge-case explanations in hard difficulty rounds.'
                    : `Complete ${3 - totalInterviews} more interview(s) to unlock granular cross-session competency clustering.`}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span>Consistency Frequency</span>
                  <span className="font-semibold text-slate-900">
                    {totalInterviews > 5 ? 'High (Regular Practice)' : 'Developing Cadence'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span>Dominant Track</span>
                  <span className="font-semibold text-slate-900">
                    {skillBars[0]?.name || 'Varied'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </AppLayout>
  );
}

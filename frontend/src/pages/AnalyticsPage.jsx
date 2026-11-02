import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { playHoverTick } from '../utils/soundEffects';
import {
  HiOutlineChartBar, HiOutlineTrendingUp,
  HiOutlineLightningBolt, HiOutlineClipboardList, HiOutlineClock
} from 'react-icons/hi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cyber-Industrial Chart Tokens
  const chartTextColor = 'rgba(214, 234, 255, 0.7)';
  const chartGridColor = 'rgba(214, 234, 255, 0.08)';
  const tooltipBg = '#00050a';
  const tooltipBorder = 'rgba(214, 234, 255, 0.25)';
  const tooltipTitle = '#ffffff';
  const tooltipBody = '#d6eaff';

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
    { label: 'Completed Sessions', value: totalInterviews.toString(), icon: HiOutlineClipboardList, hint: 'ALL TIME LOGGED' },
    { label: 'Mean Score', value: avgScore === '--' ? '--' : `${avgScore}/10`, icon: HiOutlineTrendingUp, hint: 'ACROSS ALL CALIBRATIONS' },
    { label: 'Tiers Explored', value: `${[easyCount > 0, mediumCount > 0, hardCount > 0].filter(Boolean).length}/3`, icon: HiOutlineLightningBolt, hint: 'EASY, MEDIUM, HARD' },
    { label: 'Total Practice Time', value: totalInterviews > 0 ? totalTimeStr : '0m', icon: HiOutlineClock, hint: 'ACTIVE ANCHOR TIME' },
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
        borderColor: '#007dff',
        backgroundColor: 'rgba(0, 125, 255, 0.12)',
        borderWidth: 2,
        pointBackgroundColor: '#007dff',
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
        ticks: { color: chartTextColor, font: { size: 10, family: 'Archivo Narrow' } },
      },
      y: {
        min: 0,
        max: 10,
        grid: { color: chartGridColor, drawBorder: false },
        ticks: { color: chartTextColor, stepSize: 2, font: { size: 10, family: 'Archivo Narrow' } },
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
          '#007dff',
          '#ff5517',
        ],
        borderColor: '#00050a',
        borderWidth: 3,
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
          font: { size: 11, family: 'Archivo Narrow' },
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
          <div className="iq-panel p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-8 h-8 border-2 border-iq-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-iq-ice/60 text-xs font-mono">Aggregating telemetry analytics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="pb-3 border-b border-iq-ice/15">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="telemetry-chip-active text-[10px]">
              MOD.05 // TELEMETRY INSIGHTS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tightest">
            Diagnostic Analytics &amp; Metrics
          </h1>
          <p className="text-xs sm:text-sm text-iq-ice/60 font-ui mt-1">
            Historical cadence evaluation, technical competence tracking, and time-series performance graphs.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="iq-panel p-4 sm:p-5">
              <div className="flex items-center justify-between text-iq-ice/50 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-iq-ice/60">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-iq-blue" />
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[9px] font-mono text-iq-ice/40 mt-1">{stat.hint}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Performance Trend Line Chart */}
          <div className="lg:col-span-8 iq-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-iq-ice/15 pb-3">
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Evaluation Trajectory
                </h3>
                <p className="text-[11px] font-mono text-iq-ice/50">Historical overall score progression (1-10)</p>
              </div>
              <span className="telemetry-chip text-[9px]">TIME SERIES</span>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              {sortedInterviews.length > 0 ? (
                <Line data={lineData} options={lineOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-iq-ice/40 font-mono text-xs">
                  Awaiting interview telemetry records
                </div>
              )}
            </div>
          </div>

          {/* Difficulty Doughnut Chart */}
          <div className="lg:col-span-4 iq-panel p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-iq-ice/15 pb-3">
              <div>
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                  Tier Calibrations
                </h3>
                <p className="text-[11px] font-mono text-iq-ice/50">Distribution by difficulty level</p>
              </div>
              <span className="telemetry-chip text-[9px]">SPECTRUM</span>
            </div>

            <div className="h-64 sm:h-72 w-full flex items-center justify-center pt-2">
              {totalInterviews > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="text-iq-ice/40 font-mono text-xs">
                  Zero sessions logged
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Skill Proficiency Ranks */}
        <div className="iq-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-iq-ice/15 pb-3">
            <div>
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Module Performance Matrix
              </h3>
              <p className="text-[11px] font-mono text-iq-ice/50">
                Mean performance scores across distinct tracks and subject modules
              </p>
            </div>
            <span className="telemetry-chip text-[9px]">{skillBars.length} MODULES RANKED</span>
          </div>

          {skillBars.length === 0 ? (
            <div className="py-8 text-center text-iq-ice/40 font-mono text-xs">
              Complete mock interview runs to compile module proficiency ranks.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {skillBars.map((skill) => (
                <div key={skill.name} className="p-3.5 rounded-xl bg-[#000307]/70 border border-iq-ice/15">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="font-display font-bold text-white">{skill.name}</span>
                    <span className="font-bold text-iq-blue">{skill.level}% ACCURACY</span>
                  </div>
                  <div className="w-full bg-iq-ice/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-iq-blue rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(skill.level, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

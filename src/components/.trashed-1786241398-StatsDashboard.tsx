import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, Award, Zap, Activity, Clock, Trash2, HelpCircle } from 'lucide-react';
import { TypingStats } from '../types';
import { saveStats, INITIAL_STATS } from '../utils/storage';

/* v8 ignore start */


interface StatsDashboardProps {
  stats: TypingStats;
  onStatsReset: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, onStatsReset }) => {
  const [selectedModeFilter, setSelectedModeFilter] = React.useState<'all' | 'mobile_keyboard' | 'external_keyboard'>('all');

  const filteredHistory = React.useMemo(() => {
    if (selectedModeFilter === 'all') return stats.history;
    return stats.history.filter(h => {
      if (selectedModeFilter === 'mobile_keyboard') {
        return h.typingMode === 'mobile_keyboard' || !h.typingMode; // Default to mobile if field is missing
      }
      return h.typingMode === 'external_keyboard';
    });
  }, [stats.history, selectedModeFilter]);

  const bestWpm = React.useMemo(() => {
    if (filteredHistory.length === 0) return 0;
    return Math.max(...filteredHistory.map(h => h.wpm));
  }, [filteredHistory]);

  const avgWpm = React.useMemo(() => {
    if (filteredHistory.length === 0) return 0;
    return Math.round(filteredHistory.reduce((acc, h) => acc + h.wpm, 0) / filteredHistory.length);
  }, [filteredHistory]);

  const totalAccuracy = React.useMemo(() => {
    if (filteredHistory.length === 0) return 0;
    return Math.round(filteredHistory.reduce((acc, h) => acc + h.accuracy, 0) / filteredHistory.length);
  }, [filteredHistory]);

  const totalMinutes = React.useMemo(() => {
    return filteredHistory.reduce((acc, h) => acc + (h.timeSpentSeconds / 60), 0);
  }, [filteredHistory]);

  const totalSessions = filteredHistory.length;

  const speedTier = (wpm: number) => {
    if (wpm === 0) return 'None';
    if (wpm < 25) return 'Rookie (Slow)';
    if (wpm < 45) return 'Average (Fluid)';
    if (wpm < 65) return 'Expert (Fast)';
    if (wpm < 85) return 'Pro (Elite)';
    return 'Hyper-Sonic (Master)';
  };

  const speedTierColor = (wpm: number) => {
    if (wpm === 0) return 'text-slate-400 border-slate-100';
    if (wpm < 25) return 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400';
    if (wpm < 45) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
    if (wpm < 65) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400';
    if (wpm < 85) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
    return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 animate-pulse';
  };

  // Extract keys mistyped
  const mistypedSorted = Object.entries(stats.mistypedKeys || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 10);

  // SVG Line Chart builder for the last 10 practice sessions
  const renderHistoryChart = () => {
    const historyData = [...filteredHistory].reverse().slice(-10);
    if (historyData.length < 2) {
      return (
        <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50">
          <Activity className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-1" />
          <p className="text-xs text-slate-500 dark:text-zinc-400">Complete at least 2 sessions in this mode to populate your progress trajectory chart.</p>
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const padding = 30;

    const maxWpm = Math.max(...historyData.map(d => d.wpm), 40);
    const minWpm = 0;

    // Map coordinates
    const points = historyData.map((d, index) => {
      const x = padding + (index * (width - 2 * padding) / (historyData.length - 1));
      const y = height - padding - ((d.wpm - minWpm) * (height - 2 * padding) / (maxWpm - minWpm));
      return { x, y, ...d };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[350px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - 2 * padding);
            const label = Math.round(maxWpm - ratio * (maxWpm - minWpm));
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeWidth="0.5" 
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-zinc-800"
                />
                <text 
                  x={padding - 5} 
                  y={y + 3} 
                  textAnchor="end" 
                  fontSize="8" 
                  className="fill-slate-400 dark:fill-zinc-500 font-mono font-bold"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Sparkline path */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#chartGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Interactive dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="5" 
                className="fill-primary-600 dark:fill-amber-500 stroke-white dark:stroke-zinc-950" 
                strokeWidth="2" 
              />
              <text 
                x={p.x} 
                y={p.y - 8} 
                textAnchor="middle" 
                fontSize="8" 
                className="fill-slate-700 dark:fill-zinc-300 font-bold font-mono"
              >
                {p.wpm}
              </text>
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--theme-primary, #3b82f6)" />
              <stop offset="50%" stopColor="var(--theme-secondary, #8b5cf6)" />
              <stop offset="100%" stopColor="var(--theme-tertiary, #ec4899)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* Dynamic Mode Filter Selection Tabs */}
      <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-800/80 self-start">
        <button
          onClick={() => setSelectedModeFilter('all')}
          className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all cursor-pointer ${
            selectedModeFilter === 'all'
              ? 'bg-primary-500 text-on-primary shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          🌐 All Modes
        </button>
        <button
          onClick={() => setSelectedModeFilter('mobile_keyboard')}
          className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1 ${
            selectedModeFilter === 'mobile_keyboard'
              ? 'bg-primary-500 text-on-primary shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          📱 Mobile Keyboards
        </button>
        <button
          onClick={() => setSelectedModeFilter('external_keyboard')}
          className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1 ${
            selectedModeFilter === 'external_keyboard'
              ? 'bg-primary-500 text-on-primary shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          ⌨️ External Keyboards
        </button>
      </div>

      {/* Overview Metric Bento Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" /> Best Speed
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 font-mono mt-2">
            {bestWpm} <span className="text-xs text-slate-400 font-semibold">WPM</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">{speedTier(bestWpm)}</div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500" /> Avg Speed
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 font-mono mt-2">
            {avgWpm} <span className="text-xs text-slate-400 font-semibold">WPM</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Average speed</div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-500" /> Avg Accuracy
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-2">
            {totalAccuracy || 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Target is 95%+</div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4 text-rose-500" /> Daily Streak
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-2">
            {stats.streak} <span className="text-xs text-slate-400 font-semibold">days</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Longest: {stats.longestStreak || stats.streak} days</div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-violet-500" /> Practice Time
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 font-mono mt-2">
            {Math.round(totalMinutes * 10) / 10} <span className="text-xs text-slate-400 font-semibold">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active typing</div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-500" /> Total Drills
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 font-mono mt-2">
            {totalSessions}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Completed runs</div>
        </div>
      </div>

      {/* Trajectory & Mistakes Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trajectory Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-3xl lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary-500" /> Speed Trajectory (Last 10 Drills)
          </h4>
          {renderHistoryChart()}
        </div>

        {/* Frequently Mistyped Keys */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-3xl">
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-rose-500" /> Frequently Mistyped Keys
          </h4>
          {mistypedSorted.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-3">
              <span className="text-3xl">🎯</span>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">No errors recorded yet! Maintain that pristine accuracy.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] text-slate-400">These characters need focused muscle reinforcement:</p>
              <div className="grid grid-cols-2 gap-2">
                {mistypedSorted.map(([key, count], idx) => {
                  const severityPct = Math.min(100, (((count as number) / (mistypedSorted[0][1] as number)) * 100));
                  let heatColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-100';
                  if (severityPct > 70) heatColor = 'bg-rose-500 text-white border-rose-600';
                  else if (severityPct > 35) heatColor = 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 border-rose-200 dark:border-rose-800';

                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold ${heatColor}`}
                    >
                      <span className="font-mono text-base font-bold bg-white/20 px-2 py-0.5 rounded">
                        {key === ' ' ? 'Space' : key}
                      </span>
                      <span className="text-[10px] font-mono">{count} errors</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Session Logs Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary-500" /> Full History Log
          </h4>
          {filteredHistory.length > 0 && (
            <button
              onClick={onStatsReset}
              className="flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Wipe Analytics
            </button>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-zinc-500 text-xs">
            No session history has been recorded yet for this input mode. Click on Practice or Time Tests to start logging metrics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-semibold">
                  <th className="py-2.5">Date & Drill</th>
                  <th className="py-2.5">Mode</th>
                  <th className="py-2.5">Speed</th>
                  <th className="py-2.5">Accuracy</th>
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Mistakes</th>
                  <th className="py-2.5 text-right">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                {filteredHistory.map((session, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                    <td className="py-3">
                      <div className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">{session.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{session.date}</div>
                    </td>
                    <td className="py-3">
                      {session.typingMode === 'external_keyboard' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-extrabold text-[8px] uppercase tracking-wider">
                          ⌨️ HW BOARD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 font-extrabold text-[8px] uppercase tracking-wider">
                          📱 MOBILE
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {session.wpm} <span className="text-[10px] text-slate-400 font-normal">WPM</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {session.accuracy}%
                    </td>
                    <td className="py-3 font-mono">
                      {session.timeSpentSeconds}s
                    </td>
                    <td className="py-3 font-mono text-rose-500">
                      {session.mistakesCount}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border ${speedTierColor(session.wpm)}`}>
                        {speedTier(session.wpm).split(' ')[0]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


/* v8 ignore stop */

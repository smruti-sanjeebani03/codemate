import React, { useState, useEffect, useCallback } from 'react';
import { 
  Flame, 
  Trophy, 
  Target, 
  CheckCircle2, 
  Calendar, 
  BarChart3, 
  Code2, 
  Layers, 
  ArrowUpRight, 
  RefreshCw, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  BookOpen,
  PieChart,
  Tag,
  Activity,
  Award,
  ChevronRight
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { authService } from '../services/authService';

export const DashboardView = ({ onNavigateToProblemManager, onAskCodeCat }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTarget, setUpdatingTarget] = useState(false);
  const [targetSuccessMsg, setTargetSuccessMsg] = useState('');
  const [activeTooltip, setActiveTooltip] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to connect to CodeMate dashboard API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleUpdateTarget = async (newTarget) => {
    if (newTarget < 1 || newTarget > 100) return;
    try {
      setUpdatingTarget(true);
      setTargetSuccessMsg('');
      const res = await dashboardService.updateDailyTarget(newTarget);
      
      // Update local state optimistically / reactively
      setDashboardData(prev => {
        if (!prev) return prev;
        const solved = prev.today.solved;
        const target = res.dailyTarget;
        const remaining = Math.max(0, target - solved);
        const completionPercentage = Math.min(100, Math.round((solved / target) * 100));
        const targetCompleted = solved >= target;

        return {
          ...prev,
          today: {
            ...prev.today,
            target,
            remaining,
            completionPercentage,
            targetCompleted
          }
        };
      });

      setTargetSuccessMsg(`Daily target updated to ${newTarget} problem${newTarget > 1 ? 's' : ''}!`);
      setTimeout(() => setTargetSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update daily target');
    } finally {
      setUpdatingTarget(false);
    }
  };

  const cachedUser = authService.getCachedUser();
  const userName = cachedUser?.name || 'Developer';

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  if (loading && !dashboardData) {
    return (
      <div className="glass-panel-strong rounded-3xl p-8 space-y-6 animate-pulse transition-colors">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl w-48"></div>
            <div className="h-4 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl w-72"></div>
          </div>
          <div className="h-10 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl w-28"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 glass-panel-subtle rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 glass-panel-subtle rounded-2xl lg:col-span-2"></div>
          <div className="h-64 glass-panel-subtle rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="glass-panel rounded-3xl border border-rose-300/40 dark:border-rose-900/50 p-8 text-center transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to Load Dashboard</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">{error}</p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const {
    summary = { totalProblems: 0, logicProblems: 0, dsaProblems: 0, solvedThisWeek: 0 },
    today = { target: 3, solved: 0, remaining: 3, completionPercentage: 0, targetCompleted: false },
    streak = { currentStreak: 0, longestStreak: 0, isActiveToday: false, lastActiveDate: null },
    recentProblems = [],
    activity = [],
    categoryDistribution = { DSA: 0, LOGIC: 0 },
    difficultyDistribution = { EASY: 0, MEDIUM: 0, HARD: 0 },
    platformDistribution = {},
    languageDistribution = {},
    topicDistribution = {}
  } = dashboardData || {};

  const totalDiffCount = (difficultyDistribution.EASY || 0) + (difficultyDistribution.MEDIUM || 0) + (difficultyDistribution.HARD || 0);
  const easyPct = totalDiffCount > 0 ? Math.round(((difficultyDistribution.EASY || 0) / totalDiffCount) * 100) : 0;
  const medPct = totalDiffCount > 0 ? Math.round(((difficultyDistribution.MEDIUM || 0) / totalDiffCount) * 100) : 0;
  const hardPct = totalDiffCount > 0 ? Math.round(((difficultyDistribution.HARD || 0) / totalDiffCount) * 100) : 0;

  const totalCatCount = (categoryDistribution.DSA || 0) + (categoryDistribution.LOGIC || 0);
  const dsaPct = totalCatCount > 0 ? Math.round(((categoryDistribution.DSA || 0) / totalCatCount) * 100) : 0;
  const logicPct = totalCatCount > 0 ? Math.round(((categoryDistribution.LOGIC || 0) / totalCatCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Status Banner (Frosted Hero Glass) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-indigo-950/90 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-indigo-950/95 backdrop-blur-xl border border-white/10">
        {/* Subtle decorative background accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-20 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold mb-3">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>{todayFormatted}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {userName}! 👋
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-xl">
              {today.targetCompleted 
                ? "🎉 Incredible effort! You've conquered today's coding target. Keep the momentum going!"
                : today.solved > 0
                ? `You've solved ${today.solved} of your ${today.target} target problem${today.target > 1 ? 's' : ''} today. Only ${today.remaining} left to reach your goal!`
                : `Ready to practice? Solve ${today.target} problem${today.target > 1 ? 's' : ''} today to build your streak and master DSA/Logic!`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboard}
              title="Refresh live metrics"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all backdrop-blur-md cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Metrics</span>
            </button>

            {onNavigateToProblemManager && (
              <button
                onClick={onNavigateToProblemManager}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Solved Problem</span>
              </button>
            )}
          </div>
        </div>

        {/* Milestone / Target celebration alert if completed */}
        {today.targetCompleted && (
          <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3 text-xs bg-emerald-500/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-400/30">
            <div className="flex items-center gap-2 text-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">Daily Target Completed ({today.solved}/{today.target} Problems)!</span>
            </div>
            <span className="text-emerald-300 font-mono text-[11px] font-bold">100% Achieved</span>
          </div>
        )}
      </div>

      {/* 2. Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Target */}
        <div className="glass-panel-interactive rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Target</span>
            <div className={`p-2 rounded-xl ${today.targetCompleted ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'}`}>
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2 my-1">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {today.solved}
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500"> / {today.target}</span>
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                today.targetCompleted ? 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60' : 'glass-pill text-slate-700 dark:text-slate-300'
              }`}>
                {today.completionPercentage}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  today.targetCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${today.completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{today.targetCompleted ? 'Target achieved! 🎉' : `${today.remaining} more to reach target`}</span>
            {/* Quick Adjust Stepper */}
            <div className="inline-flex items-center gap-1 glass-panel-subtle rounded-xl p-0.5">
              <button
                disabled={updatingTarget || today.target <= 1}
                onClick={() => handleUpdateTarget(today.target - 1)}
                title="Decrease daily target"
                className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/60 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300 text-xs transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 text-slate-700 dark:text-slate-200">{today.target}</span>
              <button
                disabled={updatingTarget || today.target >= 100}
                onClick={() => handleUpdateTarget(today.target + 1)}
                title="Increase daily target"
                className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/60 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300 text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Current Streak */}
        <div className="glass-panel-interactive rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Streak</span>
            <div className={`p-2 rounded-xl ${streak.currentStreak > 0 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-500/10 text-slate-400'}`}>
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{streak.currentStreak}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">day{streak.currentStreak === 1 ? '' : 's'}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {streak.isActiveToday ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active today
                </span>
              ) : streak.currentStreak > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">Solve today to keep streak</span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Solve a problem to ignite streak</span>
              )}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Status</span>
            <span className={`font-semibold ${streak.isActiveToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {streak.isActiveToday ? 'Extended Today' : 'Pending Today'}
            </span>
          </div>
        </div>

        {/* Card 3: Longest Streak */}
        <div className="glass-panel-interactive rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Longest Streak</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{streak.longestStreak}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">day{streak.longestStreak === 1 ? '' : 's'}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {streak.longestStreak > 0 
                ? `All-time personal record`
                : 'No streak record yet'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Last Active</span>
            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
              {streak.lastActiveDate || 'N/A'}
            </span>
          </div>
        </div>

        {/* Card 4: Total Problems & Weekly Velocity */}
        <div className="glass-panel-interactive rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Solved</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{summary.totalProblems}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full glass-pill text-slate-700 dark:text-slate-300">
                {summary.solvedThisWeek} this week
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{summary.dsaProblems} DSA</span>
              <span>•</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{summary.logicProblems} Logic</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Weekly Target Pace</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {summary.solvedThisWeek} solved
            </span>
          </div>
        </div>
      </div>

      {/* Target Feedback alert message */}
      {targetSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 backdrop-blur-md">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{targetSuccessMsg}</span>
        </div>
      )}

      {/* 3. Mid Section: Categorization & Difficulty Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Logic vs DSA Taxonomy Split + Activity Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box A: Logic vs DSA Taxonomy Split */}
          <div className="glass-panel-strong rounded-3xl p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Category Breakdown: LOGIC vs DSA
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  CodeMate's dual taxonomy separates foundational logic mastery from classic algorithmic patterns.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{summary.totalProblems} Total Solved</span>
            </div>

            {/* Split Bar */}
            <div className="space-y-3">
              <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full h-3 flex overflow-hidden">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-500" 
                  style={{ width: `${dsaPct}%` }}
                  title={`DSA: ${summary.dsaProblems} (${dsaPct}%)`}
                ></div>
                <div 
                  className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-500" 
                  style={{ width: `${logicPct}%` }}
                  title={`Logic: ${summary.logicProblems} (${logicPct}%)`}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-300/30 dark:border-indigo-800/40 flex items-start gap-3 backdrop-blur-md">
                  <div className="p-2 bg-indigo-100/90 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-900 dark:text-indigo-300 font-bold uppercase tracking-wider">DSA (Data Structures &amp; Algo)</div>
                    <div className="text-xl font-extrabold text-indigo-950 dark:text-indigo-100 mt-0.5">
                      {summary.dsaProblems} <span className="text-xs font-normal text-indigo-700 dark:text-indigo-400">({dsaPct}%)</span>
                    </div>
                    <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-1">
                      Arrays, Trees, Graphs, DP, Sliding Window, Binary Search
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/30 dark:border-amber-800/40 flex items-start gap-3 backdrop-blur-md">
                  <div className="p-2 bg-amber-100/90 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-900 dark:text-amber-300 font-bold uppercase tracking-wider">LOGIC (Fundamentals &amp; Math)</div>
                    <div className="text-xl font-extrabold text-amber-950 dark:text-amber-100 mt-0.5">
                      {summary.logicProblems} <span className="text-xs font-normal text-amber-700 dark:text-amber-400">({logicPct}%)</span>
                    </div>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1">
                      Number Theory, Prime Sieve, Palindromes, Loops &amp; Patterns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Box B: 60-Day Coding Activity Heatmap */}
          <div className="glass-panel-strong rounded-3xl p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Coding Activity Timeline (Last 60 Days)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Consistent daily problem solving builds lasting problem-solving intuition.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></span>
                <span className="w-2.5 h-2.5 rounded bg-emerald-200 dark:bg-emerald-900"></span>
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 dark:bg-emerald-700"></span>
                <span className="w-2.5 h-2.5 rounded bg-emerald-600 dark:bg-emerald-500"></span>
                <span>More</span>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="pt-2">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
                {activity.map((point) => {
                  let bgClass = 'bg-slate-200/60 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700';
                  if (point.count === 1) bgClass = 'bg-emerald-200 dark:bg-emerald-900 hover:bg-emerald-300';
                  else if (point.count === 2 || point.count === 3) bgClass = 'bg-emerald-400 dark:bg-emerald-700 hover:bg-emerald-500';
                  else if (point.count >= 4) bgClass = 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700';

                  return (
                    <div
                      key={point.date}
                      onMouseEnter={() => setActiveTooltip(point)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      className={`w-3.5 h-3.5 rounded-xs transition-colors cursor-pointer ${bgClass}`}
                      title={`${point.date}: ${point.count} problem${point.count === 1 ? '' : 's'} solved`}
                    />
                  );
                })}
              </div>

              {/* Tooltip display bar */}
              <div className="mt-3 py-2.5 px-3.5 glass-panel-subtle rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>
                  {activeTooltip 
                    ? `${activeTooltip.date}: ${activeTooltip.count} problem${activeTooltip.count === 1 ? '' : 's'} solved`
                    : 'Hover over activity squares to view daily solve count'}
                </span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {activity.filter(a => a.count > 0).length} active days recorded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Difficulty Distribution + Platform & Language Breakdown */}
        <div className="space-y-6">
          {/* Difficulty Card */}
          <div className="glass-panel-strong rounded-3xl p-6 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Difficulty Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Breakdown by challenge complexity</p>

            <div className="space-y-4">
              {/* Easy */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    EASY
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono">{difficultyDistribution.EASY || 0} ({easyPct}%)</span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${easyPct}%` }}></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    MEDIUM
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono">{difficultyDistribution.MEDIUM || 0} ({medPct}%)</span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${medPct}%` }}></div>
                </div>
              </div>

              {/* Hard */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    HARD
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono">{difficultyDistribution.HARD || 0} ({hardPct}%)</span>
                </div>
                <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${hardPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Platforms & Languages Card */}
          <div className="glass-panel-strong rounded-3xl p-6 space-y-4 transition-colors">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Platforms &amp; Languages
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Identified via zero-scraping platform detection</p>
            </div>

            {/* Platform Badges */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Platforms</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(platformDistribution).length > 0 ? (
                  Object.entries(platformDistribution).map(([plat, count]) => (
                    <span 
                      key={plat} 
                      className="px-2.5 py-1 glass-panel-subtle rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{plat}</span>
                      <span className="text-[10px] bg-slate-200/80 dark:bg-slate-700/80 px-1.5 py-0.2 rounded-full font-mono text-slate-600 dark:text-slate-300">{count}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">No platforms recorded yet</span>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Languages</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(languageDistribution).length > 0 ? (
                  Object.entries(languageDistribution).map(([lang, count]) => (
                    <span 
                      key={lang} 
                      className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5 backdrop-blur-xs"
                    >
                      <span>{lang}</span>
                      <span className="text-[10px] bg-blue-200/60 dark:bg-blue-900/60 px-1.5 py-0.2 rounded-full font-mono text-blue-900 dark:text-blue-200">{count}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">No languages recorded yet</span>
                )}
              </div>
            </div>

            {/* Top Topics */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Topics</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(topicDistribution).slice(0, 6).map(([top, count]) => (
                  <span 
                    key={top} 
                    className="px-2 py-0.5 glass-panel-subtle rounded-lg text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    {top} ({count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Solved Problems Feed */}
      <div className="glass-panel-strong rounded-3xl p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Recently Solved Problems
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your latest solved challenges logged to CodeMate</p>
          </div>

          {onNavigateToProblemManager && (
            <button
              onClick={onNavigateToProblemManager}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Problems</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentProblems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="glass-panel-subtle text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="py-2.5 px-3">Title &amp; Topic</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Difficulty</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Solved Date</th>
                  <th className="py-2.5 px-3 text-right">Companion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
                {recentProblems.map((p) => {
                  const solvedDateStr = p.solvedAt ? new Date(p.solvedAt).toLocaleDateString() : 'N/A';
                  return (
                    <tr key={p.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {p.title}
                          {p.problemUrl && (
                            <a
                              href={p.problemUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Open original problem URL"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.topic}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          p.category === 'DSA' ? 'bg-indigo-100/90 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50' : 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'
                        }`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-lg glass-panel-subtle font-medium text-slate-700 dark:text-slate-300">
                          {p.platform || 'Custom'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          p.difficulty === 'EASY'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : p.difficulty === 'MEDIUM'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {p.programmingLanguage || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                        {solvedDateStr}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {onAskCodeCat && (
                          <button
                            onClick={() => onAskCodeCat({
                              title: p.title,
                              category: p.category,
                              topic: p.topic,
                              difficulty: p.difficulty,
                              language: p.programmingLanguage,
                              problemUrl: p.problemUrl
                            })}
                            className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer backdrop-blur-xs"
                            title="Discuss problem with CodeCat"
                          >
                            <span>🐱</span>
                            <span>Ask</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No problems solved yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start logging problems to see your recent activity feed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

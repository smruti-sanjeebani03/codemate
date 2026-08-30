import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { 
  Code2, 
  Flame, 
  Target, 
  Bot, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  Cpu, 
  BarChart3, 
  ExternalLink,
  ChevronRight,
  Star,
  Check,
  TrendingUp,
  Hash,
  Play,
  RotateCcw,
  Compass,
  Laptop
} from 'lucide-react';

export function HomeView({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'logic' | 'dsa'
  const [interactiveCatMood, setInteractiveCatMood] = useState('happy'); // 'happy' | 'thinking' | 'encouraging'
  const [interactiveProblemType, setInteractiveProblemType] = useState('logic');

  // Sample quick teaser for CodeCat
  const [activeHintLevel, setActiveHintLevel] = useState(1);

  const catHints = {
    1: "🐱 CodeCat Nudge: Notice that you only need to keep track of the count of elements seen so far. Can a Hash Map or Frequency Array help avoid nested loops?",
    2: "🐱 CodeCat Direction: Think about the two-pointer approach from both ends. What invariant holds true as the left pointer moves forward?",
    3: "🐱 CodeCat Algorithm: Traverse once. For each element X, check if (Target - X) already exists in your table. If yes, return indices in O(N) time and O(N) space!"
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] dark:bg-[#090D16] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Ambient background glows for glassmorphic depth */}
      <div className="ambient-glow-top-left"></div>
      <div className="ambient-glow-top-right"></div>
      <div className="ambient-glow-mid-right"></div>
      <div className="ambient-glow-bottom-left"></div>

      {/* ========================================================================= */}
      {/* 1. PUBLIC TOP NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 glass-header transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-slate-800 text-white flex items-center justify-center font-black text-sm shadow-sm ring-1 ring-white/10 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-all duration-200 group-hover:scale-105">
                <Code2 className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  CodeMate<span className="text-blue-600 dark:text-blue-400">.</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:inline">
                  Companion
                </span>
              </div>
            </button>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl glass-panel-subtle space-x-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a 
              href="#features" 
              className="px-3 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Features
            </a>
            <a 
              href="#logic-dsa" 
              className="px-3 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Logic vs DSA
            </a>
            <a 
              href="#codecat" 
              className="px-3 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Meet CodeCat
            </a>
            <a 
              href="#how-it-works" 
              className="px-3 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              How It Works
            </a>
          </nav>

          {/* Right Action Items: Theme Toggle + Auth Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Selector */}
            <ThemeSelector variant="compact" showLabels={false} />

            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Authenticated user banner if logged in */}
      {isAuthenticated && (
        <div className="relative z-10 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md text-white py-2 px-4 text-xs font-medium border-b border-blue-500/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Welcome back, {user?.name || 'Coder'}!</span>
              <span className="hidden sm:inline text-blue-100">You are signed in. Your active coding workspace is ready.</span>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col: Hero Messaging */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Consistency-Driven Coding Workspace</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Daily Streaks
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Your coding companion for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 dark:from-blue-400 dark:via-indigo-300 dark:to-amber-400">building consistency.</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Track what you solve across <strong className="text-slate-900 dark:text-white font-semibold">Programming Logic</strong> and <strong className="text-slate-900 dark:text-white font-semibold">DSA</strong>. Maintain your daily streaks, hit problem goals, and master algorithms with your pedagogical AI buddy, <strong className="text-amber-600 dark:text-amber-400 font-semibold">CodeCat</strong>.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'register')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#features"
                  className="w-full sm:w-auto px-6 py-3.5 glass-panel-interactive text-slate-800 dark:text-slate-200 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span>Explore Features</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Automatic Platform Detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No Solution Spoilers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-time Streak Engine</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Visual Card with CodeCat Identity */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer Frosted Glass Card */}
              <div className="glass-panel-strong rounded-3xl p-6 relative overflow-hidden transition-colors">
                
                {/* Top Status Bar */}
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-2 font-bold">
                      codemate-session.sh
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>7 Day Streak</span>
                  </div>
                </div>

                {/* CodeCat Hero Avatar Badge */}
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent dark:from-amber-950/40 dark:via-slate-900/40 dark:to-transparent border border-amber-300/40 dark:border-amber-900/40 flex items-start gap-3.5 backdrop-blur-md">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/20 ring-2 ring-white/20">
                      🐱
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center" title="Online & Ready to Help">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>CodeCat AI</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100/90 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                          Pedagogical Buddy
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">active</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      "Your coding buddy is here! 🐾 Let's build your streak with 3 solved problems today."
                    </p>
                  </div>
                </div>

                {/* Problem Tracking Glass Mini-Cards */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl glass-panel-subtle">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100/90 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                          DSA
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          Two Sum (Hash Map)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                        Solved ✓
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>LeetCode #1</span>
                      <span className="text-slate-400 dark:text-slate-500">O(N) Time • O(N) Space</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel-subtle">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100/90 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                          Logic
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          Pyramid Star Pattern
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                        Solved ✓
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Loops &amp; Spaces Logic</span>
                      <span className="text-slate-400 dark:text-slate-500">Nested Loops</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Daily Goal Progress */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                      <span>Today's Target Progress</span>
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">2 / 3 Solved (67%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/60 dark:bg-slate-800/80 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[67%]"></div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURES SECTION (6 CARDS) */}
      {/* ========================================================================= */}
      <section id="features" className="relative z-10 py-16 sm:py-24 border-y border-slate-200/60 dark:border-slate-800/60 glass-panel-subtle transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Engineered for Developers &amp; Students
            </h2>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Everything you need to master problem solving
            </p>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              CodeMate bridges the gap between fundamental logic building and algorithmic mastery through disciplined tracking and intelligent AI guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Track Problems */}
            <div className="glass-panel-interactive rounded-3xl p-6 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-blue-100 dark:border-blue-900/60">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Track Problems
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep a comprehensive record of every problem solved across LeetCode, HackerRank, GFG, CodeChef, Codeforces, and custom homework sets.
              </p>
            </div>

            {/* Feature 2: Logic + DSA */}
            <div className="glass-panel-interactive rounded-3xl p-6 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-purple-100 dark:border-purple-900/60">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Logic + DSA
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice both foundational programming logic (loops, patterns, math) and advanced Data Structures &amp; Algorithms with granular category metrics.
              </p>
            </div>

            {/* Feature 3: Build Your Streak */}
            <div className="glass-panel-interactive rounded-3xl p-6 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-amber-100 dark:border-amber-900/60">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Build Your Streak
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stay accountable with activity-based coding streaks, daily logs, milestone celebrations, and habit-forming consistency mechanisms.
              </p>
            </div>

            {/* Feature 4: Daily Target */}
            <div className="glass-panel-interactive rounded-3xl p-6 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-900/60">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Daily Target
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Set a daily problem target (e.g. 3 problems/day) and track your real-time progress bar toward reaching your daily milestone.
              </p>
            </div>

            {/* Feature 5: Progress Insights */}
            <div className="glass-panel-interactive rounded-3xl p-6 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-indigo-100 dark:border-indigo-900/60">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Progress Insights
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Understand your activity through weekly velocity charts, difficulty distributions (Easy, Medium, Hard), and topic mastery heatmaps.
              </p>
            </div>

            {/* Feature 6: CodeCat */}
            <div className="glass-panel-interactive rounded-3xl p-6 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-amber-100 dark:border-amber-900/60">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                CodeCat AI Buddy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get Socratic hints, algorithmic intuition, Big-O complexity analysis, and debugging tips without having solutions spoiled.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LOGIC + DSA SECTION */}
      {/* ========================================================================= */}
      <section id="logic-dsa" className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Curriculum &amp; Taxonomy
            </h2>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              From Logic Building to DSA Mastery
            </p>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              Most platforms only focus on competitive DSA. CodeMate recognizes that beginners must master programming logic first before tackling complex algorithms.
            </p>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: Logic Building */}
            <div className="glass-panel-strong rounded-3xl p-8 relative overflow-hidden transition-colors border-t-2 border-t-purple-500/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100/90 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200/50 dark:border-purple-800/50">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Programming Logic
                    </h3>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      Phase 1 • Core Fundamentals
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl border border-purple-200/60 dark:border-purple-800/60">
                  Foundation
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Build your computational thinking and code-writing fluency without being overwhelmed by advanced asymptotic optimizations.
              </p>

              <div className="space-y-3">
                <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Key Logic Topics Covered:
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Number Problems &amp; Primes</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Pyramid &amp; Star Patterns</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Nested Loops &amp; Iteration</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Conditional Branching</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Mathematical Logic</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Basic Array Manipulation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Data Structures & Algorithms */}
            <div className="glass-panel-strong rounded-3xl p-8 relative overflow-hidden transition-colors border-t-2 border-t-blue-500/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/90 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold border border-blue-200/50 dark:border-blue-800/50">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Data Structures &amp; Algorithms
                    </h3>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Phase 2 • Technical Interviews
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200/60 dark:border-blue-800/60">
                  Algorithmic
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Master classical algorithms, time &amp; space trade-offs, graph traversals, and dynamic programming patterns for technical interviews.
              </p>

              <div className="space-y-3">
                <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Key DSA Topics Covered:
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Arrays, Strings &amp; Two Pointers</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Binary Search &amp; Sorting</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Linked Lists, Stacks &amp; Queues</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Binary Trees &amp; BSTs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Graphs, BFS &amp; DFS Traversal</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Dynamic Programming &amp; Greedy</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CODECAT SECTION */}
      {/* ========================================================================= */}
      <section id="codecat" className="relative z-10 py-16 sm:py-24 border-y border-slate-200/60 dark:border-slate-800/60 glass-panel-strong transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: CodeCat Details & Capabilities */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-300">
                <span>🐱 Pedagogical AI Companion</span>
                <span className="text-amber-400/60">•</span>
                <span>Powered by Gemini 3.7 Flash</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                Meet CodeCat 🐱<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-400 dark:to-amber-200">
                  Your AI coding companion.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Unlike generic LLMs that immediately spit out full answers and ruin the learning process, CodeCat is trained as a patient tutor that guides you through intuition, progressive hints, and debugging.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold">Progressive Hinting:</strong> Offers small gentle nudges first, revealing deeper details only when you get stuck.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold">DSA Pattern Recognition:</strong> Identifies underlying patterns like sliding window, monotonic stacks, and two pointers.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold">Targeted Debugging:</strong> Pinpoints off-by-one errors and edge case failures without rewriting your code.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold">Big-O Complexity Breakdown:</strong> Analyzes Time &amp; Space complexities with trade-off explanations.
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate(isAuthenticated ? 'codecat' : 'login')}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-slate-950" />
                  <span>{isAuthenticated ? 'Chat with CodeCat Now' : 'Meet CodeCat (Sign In)'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>

            </div>

            {/* Right: Interactive CodeCat Dialogue Teaser */}
            <div className="lg:col-span-6">
              <div className="glass-panel-strong rounded-3xl p-6 space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      🐱
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">CodeCat Dialogue Simulation</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Context: Two Sum (LeetCode #1)</div>
                    </div>
                  </div>

                  <span className="text-[10px] glass-pill text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg font-mono">
                    Progressive Mode
                  </span>
                </div>

                {/* Simulated Chat Bubbles */}
                <div className="space-y-3 text-xs">
                  {/* User Query */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-sm shadow-sm">
                      "I keep getting Time Limit Exceeded with my O(N²) nested loop for Two Sum. How do I optimize it?"
                    </div>
                  </div>

                  {/* CodeCat Hint Levels */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                      🐱
                    </div>
                    <div className="glass-panel-subtle text-slate-800 dark:text-slate-200 p-3.5 rounded-2xl rounded-tl-xs max-w-md space-y-2">
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>Hint Tier {activeHintLevel} of 3</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map(lvl => (
                            <button
                              key={lvl}
                              onClick={() => setActiveHintLevel(lvl)}
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all ${
                                activeHintLevel === lvl
                                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                                  : 'glass-pill text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              Tier {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                        {catHints[activeHintLevel]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Micro interactivity bar */}
                <div className="p-2.5 rounded-2xl glass-panel-subtle flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>💡 Try switching hint tiers above to preview CodeCat's pedagogical scaffolding!</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HOW CODEMATE WORKS (3 STEPS) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Simple Daily Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              How CodeMate Works
            </p>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              A frictionless 3-step loop designed to turn occasional problem solving into a lasting daily habit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1: Solve */}
            <div className="glass-panel-interactive rounded-3xl p-8 relative overflow-hidden">
              <div className="text-4xl font-black text-slate-300 dark:text-slate-700 mb-4 font-mono">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span>Solve</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Solve a Logic or DSA problem on your favorite coding platform (LeetCode, HackerRank, GeeksforGeeks, CodeChef, Codeforces) or in your local IDE.
              </p>
            </div>

            {/* Step 2: Track */}
            <div className="glass-panel-interactive rounded-3xl p-8 relative overflow-hidden">
              <div className="text-4xl font-black text-blue-300 dark:text-blue-700/60 mb-4 font-mono">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span>Track</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Add the problem URL to CodeMate. The platform automatically detects the platform, difficulty, and categorization while updating your streak.
              </p>
            </div>

            {/* Step 3: Improve */}
            <div className="glass-panel-interactive rounded-3xl p-8 relative overflow-hidden">
              <div className="text-4xl font-black text-amber-300 dark:text-amber-700/60 mb-4 font-mono">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span>Improve</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Track your consistency metrics, hit your daily targets, and ask CodeCat for progressive hints and complexity trade-offs whenever you need a nudge.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 sm:py-20 bg-gradient-to-br from-blue-600/90 via-indigo-700/90 to-purple-800/90 backdrop-blur-lg text-white relative overflow-hidden border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto shadow-xl ring-1 ring-white/30">
            <Flame className="w-8 h-8 text-amber-300 fill-amber-300" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to build your coding streak?
          </h2>

          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Join CodeMate today. Start logging your solved problems, maintain your daily momentum, and learn with CodeCat AI.
          </p>

          <div className="pt-4 flex items-center justify-center">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl text-sm font-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isAuthenticated ? 'Go to My Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 glass-panel-subtle py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-200/60 dark:border-slate-800/60">
            
            {/* Brand & Mission */}
            <div className="space-y-2 text-center md:text-left max-w-md">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                  <Code2 className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  CodeMate<span className="text-blue-600">.</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The developer-centric coding companion for tracking Logic &amp; DSA problems, building daily streaks, and learning with CodeCat AI.
              </p>
            </div>

            {/* Navigation links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
              <button 
                onClick={() => onNavigate('home')} 
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Home
              </button>
              <a 
                href="#features" 
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Features
              </a>
              <a 
                href="#logic-dsa" 
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Logic vs DSA
              </a>
              <button 
                onClick={() => onNavigate(isAuthenticated ? 'codecat' : 'login')} 
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                CodeCat AI
              </button>
              <button 
                onClick={() => onNavigate('login')} 
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigate('register')} 
                className="hover:text-slate-900 dark:hover:text-white transition-colors text-blue-600 dark:text-blue-400"
              >
                Register
              </button>
            </div>

          </div>

          {/* Copyright & Meta */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <div>
              © {new Date().getFullYear()} CodeMate Companion. All rights reserved.
            </div>
            <div className="text-center sm:text-right">
              Built with innovation &amp; curiosity by{' '}
              <a
                href="https://www.linkedin.com/in/smruti-sanjeebani/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Smruti Sanjeebani on LinkedIn"
                className="font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 underline decoration-slate-300 dark:decoration-slate-700 hover:decoration-blue-500 transition-colors"
              >
                Smruti Sanjeebani
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

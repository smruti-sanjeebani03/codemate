import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Header } from './components/Header.jsx';
import { HomeView } from './components/HomeView.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { ProblemManager } from './components/ProblemManager.jsx';
import { CodeCatView } from './components/CodeCatView.jsx';
import { ProfileSettingsView } from './components/ProfileSettingsView.jsx';
import { AuthView } from './components/AuthView.jsx';

// Verifier / Tester Components (Unified in Verifier Suite tab)
import { CodeCatTester } from './components/CodeCatTester.jsx';
import { DashboardEngineTester } from './components/DashboardEngineTester.jsx';
import { SecurityIsolationVerifier } from './components/SecurityIsolationVerifier.jsx';
import { PlatformDetectionTester } from './components/PlatformDetectionTester.jsx';
import { AuthConsole } from './components/AuthConsole.jsx';
import { SecurityArchitectureViewer } from './components/SecurityArchitectureViewer.jsx';
import { EntityArchitectureViewer } from './components/EntityArchitectureViewer.jsx';
import { CategoryLogicDsaViewer } from './components/CategoryLogicDsaViewer.jsx';
import { HealthChecker } from './components/HealthChecker.jsx';
import { ArchitectureCard } from './components/ArchitectureCard.jsx';
import { EnvConfigViewer } from './components/EnvConfigViewer.jsx';
import { FolderStructureViewer } from './components/FolderStructureViewer.jsx';

import { 
  Flame, 
  Layers, 
  Bot, 
  Settings, 
  Cpu, 
  Code2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Globe,
  Database,
  Lock,
  Terminal,
  Activity
} from 'lucide-react';

function CodeMateApp() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Supported routes: 'home' | 'dashboard' | 'problems' | 'codecat' | 'settings' | 'verifier' | 'login' | 'register'
  const [activeRoute, setActiveRoute] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (['home', 'dashboard', 'problems', 'codecat', 'settings', 'profile', 'verifier', 'login', 'register'].includes(hash)) {
        return hash === 'profile' ? 'settings' : hash;
      }
    }
    return 'home';
  });

  const [codeCatProblemContext, setCodeCatProblemContext] = useState(null);
  const [prefillProblemData, setPrefillProblemData] = useState(null);
  const [verifierSubTab, setVerifierSubTab] = useState('codecat'); // 'codecat' | 'dashboard' | 'security' | 'platform' | 'architecture'
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  // Sync route changes with URL hash
  const navigateTo = useCallback((route) => {
    setActiveRoute(route);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${route}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash && ['home', 'dashboard', 'problems', 'codecat', 'settings', 'profile', 'verifier', 'login', 'register'].includes(hash)) {
        setActiveRoute(hash === 'profile' ? 'settings' : hash);
      } else if (!hash) {
        setActiveRoute('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Context-aware Ask CodeCat action from problems / dashboard
  const handleAskCodeCat = useCallback((problemContext) => {
    setCodeCatProblemContext(problemContext);
    navigateTo('codecat');
  }, [navigateTo]);

  const handleSelectUrlForProblem = useCallback((url, platform) => {
    setPrefillProblemData({ url, platform });
    navigateTo('problems');
  }, [navigateTo]);

  const handleTargetUpdated = useCallback((newTarget) => {
    setDashboardRefreshTrigger(prev => prev + 1);
  }, []);

  // Loading Screen during initial session initialization
  if (authLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col items-center justify-center p-4 transition-colors">
        <div className="ambient-glow-top-left"></div>
        <div className="ambient-glow-top-right"></div>
        <div className="relative z-10 glass-panel-strong p-8 rounded-3xl flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center shadow-lg shadow-slate-300/40 dark:shadow-black animate-pulse">
            <Code2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">CodeMate</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Initializing authenticated coding workspace...</p>
          </div>
          <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  // 1. Dedicated Public Homepage
  if (activeRoute === 'home' || activeRoute === '') {
    return (
      <HomeView onNavigate={navigateTo} />
    );
  }

  // 2. Unauthenticated Feature Guard & Login / Register View
  if (!isAuthenticated) {
    const isExplicitAuthMode = activeRoute === 'login' || activeRoute === 'register';
    const target = isExplicitAuthMode ? 'dashboard' : activeRoute;

    return (
      <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col transition-colors">
        <div className="ambient-glow-top-left"></div>
        <div className="ambient-glow-top-right"></div>
        <div className="ambient-glow-mid-right"></div>
        
        <Header activeRoute={activeRoute} onNavigate={navigateTo} />
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <AuthView 
            initialMode={activeRoute === 'register' ? 'register' : 'login'} 
            targetRoute={!isExplicitAuthMode ? activeRoute : undefined}
            onAuthSuccess={() => navigateTo(target || 'dashboard')} 
          />
        </main>
        
        {/* Unified Frosted Footer */}
        <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 glass-panel-subtle py-6 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">CodeMate<span className="text-blue-600">.</span></span> — Consistency Companion for Logic &amp; DSA.
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-right">
              Built with innovation &amp; curiosity by{' '}
              <a
                href="https://www.linkedin.com/in/smruti-sanjeebani/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Smruti Sanjeebani on LinkedIn"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 underline decoration-slate-300 dark:decoration-slate-700 hover:decoration-blue-500 transition-colors"
              >
                Smruti Sanjeebani
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Authenticated Application
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
      {/* Ambient background glows that shimmer gently behind frosted glass cards */}
      <div className="ambient-glow-top-left"></div>
      <div className="ambient-glow-top-right"></div>
      <div className="ambient-glow-mid-right"></div>
      <div className="ambient-glow-bottom-left"></div>

      {/* Top Application Navigation */}
      <Header activeRoute={activeRoute} onNavigate={navigateTo} />

      {/* Main View Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD (PART 5 & PART 2) */}
        {/* ========================================================================= */}
        {activeRoute === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DashboardView 
              key={dashboardRefreshTrigger}
              onNavigateToProblemManager={() => navigateTo('problems')}
              onAskCodeCat={handleAskCodeCat}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PROBLEM MANAGER (PART 4) */}
        {/* ========================================================================= */}
        {activeRoute === 'problems' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ProblemManager 
              activeUser={user} 
              prefillData={prefillProblemData} 
              onAskCodeCat={handleAskCodeCat}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: CODECAT AI CODING COMPANION (PART 6) */}
        {/* ========================================================================= */}
        {activeRoute === 'codecat' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CodeCatView 
              initialProblemContext={codeCatProblemContext} 
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: PROFILE & SETTINGS (PART 7) */}
        {/* ========================================================================= */}
        {(activeRoute === 'settings' || activeRoute === 'profile') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ProfileSettingsView 
              onTargetUpdated={handleTargetUpdated}
              onNavigateToCodeCat={() => navigateTo('codecat')}
              onNavigateToDashboard={() => navigateTo('dashboard')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: VERIFIER SUITE & ARCHITECTURE (PARTS 1 TO 7 SUITE) */}
        {/* ========================================================================= */}
        {activeRoute === 'verifier' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Verifier Header Card */}
            <div className="glass-panel rounded-2xl p-6 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center ring-1 ring-white/10">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      CodeMate Automated Verifier &amp; Test Suite
                    </h1>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Integrated testing consoles verifying Parts 1 through 7 requirements, security isolation, streaks, and AI capabilities.
                  </p>
                </div>

                {/* Sub-tab Switcher */}
                <div className="flex items-center space-x-1 glass-panel-subtle p-1 rounded-2xl overflow-x-auto">
                  <button
                    onClick={() => setVerifierSubTab('codecat')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      verifierSubTab === 'codecat'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🐱 CodeCat AI (Part 6)
                  </button>

                  <button
                    onClick={() => setVerifierSubTab('dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      verifierSubTab === 'dashboard'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🔥 Streak &amp; Target (Part 5)
                  </button>

                  <button
                    onClick={() => setVerifierSubTab('security')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      verifierSubTab === 'security'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🛡️ Security Isolation (Part 3)
                  </button>

                  <button
                    onClick={() => setVerifierSubTab('platform')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      verifierSubTab === 'platform'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🌐 Platform Detection (Part 4)
                  </button>

                  <button
                    onClick={() => setVerifierSubTab('architecture')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      verifierSubTab === 'architecture'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🏛️ System Architecture
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-tab Content */}
            {verifierSubTab === 'codecat' && (
              <CodeCatTester onLaunchCodeCatWithContext={handleAskCodeCat} />
            )}

            {verifierSubTab === 'dashboard' && (
              <DashboardEngineTester />
            )}

            {verifierSubTab === 'security' && (
              <div className="space-y-6">
                <SecurityIsolationVerifier />
                <AuthConsole onAuthChange={() => {}} />
              </div>
            )}

            {verifierSubTab === 'platform' && (
              <PlatformDetectionTester onSelectUrl={handleSelectUrlForProblem} />
            )}

            {verifierSubTab === 'architecture' && (
              <div className="space-y-6">
                <SecurityArchitectureViewer />
                <CategoryLogicDsaViewer />
                <EntityArchitectureViewer />
                <HealthChecker />
                <ArchitectureCard />
                <EnvConfigViewer />
                <FolderStructureViewer />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Unified Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 glass-panel-subtle py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white">CodeMate<span className="text-blue-600">.</span></span>
            <span>— Consistency Companion for Logic &amp; DSA.</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70">
              Verified
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-right">
            Built with innovation &amp; curiosity by{' '}
            <a
              href="https://www.linkedin.com/in/smruti-sanjeebani/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Smruti Sanjeebani on LinkedIn"
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 underline decoration-slate-300 dark:decoration-slate-700 hover:decoration-blue-500 transition-colors"
            >
              Smruti Sanjeebani
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CodeMateApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

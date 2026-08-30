import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { 
  Code2, 
  Sparkles, 
  Flame, 
  Target, 
  Bot, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Zap,
  LogIn,
  UserPlus
} from 'lucide-react';

export function AuthView({ initialMode = 'login', onAuthSuccess, targetRoute, initialError = null }) {
  const { login, register, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(initialError);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Validation
  const validateForm = () => {
    setErrorMsg(null);
    if (mode === 'register' && !name.trim()) {
      setErrorMsg('Please enter your full name');
      return false;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return false;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'register') {
        await register(name, email, password);
        setSuccessMsg('Account created successfully! Redirecting to dashboard...');
      } else {
        await login(email, password);
        setSuccessMsg('Logged in successfully! Redirecting to dashboard...');
      }
      
      if (onAuthSuccess) {
        setTimeout(() => onAuthSuccess(), 400);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleOAuth = () => {
    setErrorMsg(null);
    setSubmitting(true);
    // Real Google OAuth 2.0 / OpenID Connect redirect via Spring Security
    const oauthUrl = authService.getGoogleOAuthUrl();
    window.location.href = oauthUrl;
  };

  const handleGithubOAuth = () => {
    setErrorMsg(null);
    setSubmitting(true);
    // Real GitHub OAuth 2.0 redirect via Spring Security
    const oauthUrl = authService.getGithubOAuthUrl();
    window.location.href = oauthUrl;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch glass-panel-strong rounded-3xl overflow-hidden shadow-2xl transition-colors">
        
        {/* Left Col: Brand / Value Proposition */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-indigo-950/95 p-8 sm:p-10 text-white flex flex-col justify-between h-full min-h-[460px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  CodeMate<span className="text-amber-400">.</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Consistency Companion
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-3">
              Build your coding streak every single day.
            </h1>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Track your daily solved problems across Logic &amp; DSA, achieve your daily coding targets, and master algorithms with CodeCat AI.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Logic &amp; DSA Problem Tracker</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <span>Daily Targets &amp; Streak Engine</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span>CodeCat Pedagogical AI Buddy</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>JWT &amp; BCrypt Protected</span>
            </span>
            <span>v1.0.0 Production</span>
          </div>
        </div>

        {/* Right Col: Authentication Form */}
        <div className="md:col-span-7 p-8 sm:p-10 glass-panel-subtle flex flex-col justify-center">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4 mb-6">
            <div className="flex items-center space-x-1 glass-panel-subtle p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-xs backdrop-blur-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-xs backdrop-blur-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              {mode === 'login' ? 'Welcome back' : 'Get started free'}
            </span>
          </div>

          {/* Target Route Notice Banner */}
          {targetRoute && (
            <div className="mb-5 p-3.5 bg-blue-500/15 border border-blue-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200 backdrop-blur-xs animate-in fade-in">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Sign in required: </span>
                <span>To access <strong className="capitalize">{targetRoute}</strong> and all companion features, please sign in or create an account.</span>
              </div>
            </div>
          )}

          {/* Error & Success Banners */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 backdrop-blur-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authentication Notice: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 backdrop-blur-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Success! </span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Real Social OAuth 2.0 Buttons (Google & GitHub) */}
          <div className="space-y-2.5">
            {/* Real Google OAuth 2.0 Button */}
            <button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={submitting}
              className="w-full py-2.5 px-4 glass-panel-interactive rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-3 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Real GitHub OAuth 2.0 Button */}
            <button
              type="button"
              onClick={handleGithubOAuth}
              disabled={submitting}
              className="w-full py-2.5 px-4 glass-panel-interactive rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-3 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-slate-800 dark:text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/60 dark:border-slate-800/60"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span className="glass-panel-subtle px-3 py-0.5 rounded-full font-bold">Or with Email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    required
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl glass-input text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@codemate.dev"
                  required
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl glass-input text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl glass-input text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl glass-input text-slate-800 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to CodeMate</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

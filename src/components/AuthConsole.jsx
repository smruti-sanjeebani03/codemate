import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Globe, 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService } from '../services/authService';

export const AuthConsole = ({ onAuthChange }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Authenticated state
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [decodedClaims, setDecodedClaims] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('form'); // 'form' | 'jwt' | 'protectedApi'

  // Protected endpoint test state
  const [protectedTesting, setProtectedTesting] = useState(false);
  const [protectedResult, setProtectedResult] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    const savedToken = authService.getToken();
    const cachedUser = authService.getCachedUser();
    if (savedToken) {
      setToken(savedToken);
      decodeToken(savedToken);
      if (cachedUser) {
        setCurrentUser(cachedUser);
      }
      // verify with backend /api/auth/me
      authService.getMe()
        .then(u => {
          setCurrentUser(u);
          if (onAuthChange) onAuthChange(u);
        })
        .catch(err => {
          console.warn('Token validation failed:', err);
        });
    }
  }, []);

  const decodeToken = (rawToken) => {
    try {
      const parts = rawToken.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        setDecodedClaims(payload);
      }
    } catch {
      setDecodedClaims(null);
    }
  };

  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let res;
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        res = await authService.register(name, email, password);
        setSuccessMsg(`Welcome to CodeMate, ${res.user.name}! Account registered.`);
      } else {
        res = await authService.login(email, password);
        setSuccessMsg(`Signed in successfully as ${res.user.name}`);
      }

      setToken(res.token);
      setCurrentUser(res.user);
      decodeToken(res.token);
      if (onAuthChange) onAuthChange(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    // Real Google OAuth 2.0 redirect via Spring Security
    window.location.href = authService.getGoogleOAuthUrl();
  };

  const handleGithubOAuth = () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    // Real GitHub OAuth 2.0 redirect via Spring Security
    window.location.href = authService.getGithubOAuthUrl();
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setCurrentUser(null);
    setDecodedClaims(null);
    setSuccessMsg('Logged out successfully. JWT cleared.');
    if (onAuthChange) onAuthChange(null);
  };

  const testProtectedEndpoint = async (useInvalidToken = false) => {
    setProtectedTesting(true);
    setProtectedResult(null);

    const startTime = performance.now();
    try {
      let headers = {};
      if (!useInvalidToken && token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (useInvalidToken) {
        headers['Authorization'] = `Bearer invalid_expired_tampered_token_xyz`;
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          'Accept': 'application/json',
          ...headers
        }
      });

      const elapsed = Math.round(performance.now() - startTime);
      const data = await res.json();

      setProtectedResult({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
        elapsed,
        sentHeader: headers['Authorization'] || 'None (Unauthenticated request)'
      });
    } catch (err) {
      setProtectedResult({
        status: 0,
        statusText: 'Network Error',
        ok: false,
        data: { message: err.message },
        elapsed: Math.round(performance.now() - startTime),
        sentHeader: 'None'
      });
    } finally {
      setProtectedTesting(false);
    }
  };

  const copyTokenToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Interactive Authentication &amp; JWT Console
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test Email/Password registration, BCrypt verification, Google OAuth 2.0, and Spring Security stateless JWT.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('form')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSubTab === 'form'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {currentUser ? 'User Session' : 'Login / Register'}
          </button>
          <button
            onClick={() => setActiveSubTab('jwt')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'jwt'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>JWT Inspector</span>
          </button>
          <button
            onClick={() => setActiveSubTab('protectedApi')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === 'protectedApi'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span>Protected /api/auth/me</span>
          </button>
        </div>
      </div>

      {/* Main Tab 1: Form / Session */}
      {activeSubTab === 'form' && (
        <div className="mt-6">
          {currentUser ? (
            /* Authenticated Session Card */
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg overflow-hidden border-2 border-white shadow-xs">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        currentUser.authProvider === 'GOOGLE' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {currentUser.authProvider || 'LOCAL'} Auth
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">User ID (Database)</div>
                  <div className="text-slate-900 font-bold mt-1">#{currentUser.id}</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Auth Provider</div>
                  <div className="text-slate-900 font-bold mt-1">{currentUser.authProvider}</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Registration Timestamp</div>
                  <div className="text-slate-700 text-[11px] mt-1 truncate">
                    {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : 'Recent'}
                  </div>
                </div>
              </div>

              {/* JWT Quick Bar */}
              <div className="mt-4 p-3 bg-slate-900 text-white rounded-lg font-mono text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 text-[11px] font-sans">Active JWT:</span>
                  <span className="text-emerald-400 text-[11px] truncate">{token}</span>
                </div>
                <button
                  onClick={copyTokenToClipboard}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                  <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login & Register Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-7 space-y-4">
                {/* Mode Tab */}
                <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 text-center rounded-md transition-all ${
                      mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In (Existing Developer)
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 text-center rounded-md transition-all ${
                      mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Account (Register)
                  </button>
                </div>

                {/* Real OAuth Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleOAuth}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGithubOAuth}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                      <span className="bg-white px-2">or continue with email</span>
                    </div>
                  </div>

                {/* Local Email/Password Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Chen"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="developer@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>{error}</div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>{successMsg}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Sign In' : 'Create CodeMate Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Quick Info & Security Column */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Authentication Architecture</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    CodeMate uses secure stateless JWT authentication with BCrypt password hashing and Google OAuth verification.
                  </p>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-slate-800">Email & Password Auth</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">BCrypt salt rounds (10), salt-hashed at registration</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-slate-800">Google OAuth 2.0</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Verified via OpenID Connect identity tokens</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  <span className="font-bold">Security Notice:</span> Tokens issued are stateless HMAC-SHA256 JWTs. They expire in 24 hours and are validated on every secured API request.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Tab 2: JWT Inspector */}
      {activeSubTab === 'jwt' && (
        <div className="mt-6 space-y-4">
          {token ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="text-slate-400 text-[11px] font-sans font-bold uppercase tracking-wider">Raw Encoded JWT (Base64URL)</span>
                  <button
                    onClick={copyTokenToClipboard}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                    <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="break-all text-emerald-400 leading-relaxed selection:bg-emerald-900">
                  {token}
                </div>
              </div>

              {/* Decoded Claims Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-sans font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                    Header (Algorithm &amp; Type)
                  </div>
                  <pre className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800">
{JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2)}
                  </pre>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-sans font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                    Payload Claims (Hydrated in SecurityContext)
                  </div>
                  <pre className="p-3 bg-white rounded-lg border border-slate-200 text-indigo-900">
{JSON.stringify(decodedClaims || { sub: currentUser?.email, userId: currentUser?.id, name: currentUser?.name }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No Active JWT Token</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Sign in with Email/Password or Continue with Google to generate a signed JWT and inspect its claims here.
              </p>
              <button
                onClick={() => setActiveSubTab('form')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Tab 3: Protected API Test Console */}
      {activeSubTab === 'protectedApi' && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Test Endpoint: <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">GET /api/auth/me</code>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Spring Security verifies the Bearer token in the <code className="font-mono">Authorization</code> header.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => testProtectedEndpoint(false)}
                  disabled={protectedTesting}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {protectedTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                  <span>Call with Bearer Token</span>
                </button>
                <button
                  onClick={() => testProtectedEndpoint(true)}
                  disabled={protectedTesting}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Test with Invalid Token (401)</span>
                </button>
              </div>
            </div>

            {protectedResult && (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    protectedResult.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    HTTP {protectedResult.status} {protectedResult.statusText}
                  </span>
                  <span className="text-slate-400">Latency: {protectedResult.elapsed}ms</span>
                  <span className="text-slate-600 truncate">Header: {protectedResult.sentHeader}</span>
                </div>

                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto">
{JSON.stringify(protectedResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

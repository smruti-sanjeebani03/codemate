import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  UserCheck, 
  Globe, 
  CheckCircle2, 
  FileCode2, 
  ArrowRight, 
  Layers,
  Cpu,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const SecurityArchitectureViewer = () => {
  const [activeTab, setActiveTab] = useState('pipeline');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Part 3: Spring Security &amp; Stateless JWT Architecture
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enterprise-grade stateless authentication integrating Spring Security 6, BCrypt, JJWT, and Google OAuth 2.0.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'pipeline'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auth Pipeline
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'matrix'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Route Protection Matrix
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'components'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security Components
          </button>
        </div>
      </div>

      {activeTab === 'pipeline' && (
        <div className="mt-6 space-y-6">
          {/* Step 1: Authentication Workflow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Credential Submission</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Local or Google OIDC</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Client submits email/password to <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">/api/auth/login</code> or Google verified ID token to <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">/api/auth/google</code>.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                <div className="text-slate-400">// Password Security</div>
                <div className="text-emerald-700">BCrypt.hashpw(pass, salt)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Stateless Token Issuance</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Signed HMAC-SHA256 JWT</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Backend signs a cryptographically secure 24-hour JWT containing <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">userId</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">email</code>, and <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">sub</code>.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                <div className="text-slate-400">// Response Payload</div>
                <div className="text-indigo-700 font-semibold">{`{ token, tokenType: "Bearer" }`}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Protected API Verification</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Filter Interception</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">JwtAuthenticationFilter</code> validates signature on each request, hydrating the <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">SecurityContext</code>.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                <div className="text-slate-400">// Header Authorization</div>
                <div className="text-slate-800">Authorization: Bearer &lt;token&gt;</div>
              </div>
            </div>
          </div>

          {/* Key Architectural Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-1">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Zero Server Sessions</span>
              </div>
              <p className="text-xs text-indigo-700/80">
                Purely stateless architecture. Ideal for horizontal scaling across Render backend containers.
              </p>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                <Key className="w-4 h-4 text-blue-600" />
                <span>BCrypt Hashing</span>
              </div>
              <p className="text-xs text-blue-700/80">
                Plain-text passwords never touch database rows. Salting &amp; adaptive cost factor built-in.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Google OIDC Linking</span>
              </div>
              <p className="text-xs text-emerald-700/80">
                Seamlessly binds Google sub identifiers to identical verified email records in PostgreSQL.
              </p>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>SecurityContext Auth</span>
              </div>
              <p className="text-xs text-amber-700/80">
                Backend derives identity strictly from validated JWT claims — never trusting client user IDs.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="mt-6 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Endpoint</th>
                  <th className="py-2.5 px-3">Access Level</th>
                  <th className="py-2.5 px-3">Security Enforcement</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-blue-600">POST</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">/api/auth/register</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-sans font-bold">Public</span></td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">Bean Validation + Duplicate Check</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">Register new account via Email + Password</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-blue-600">POST</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">/api/auth/login</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-sans font-bold">Public</span></td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">AuthenticationManager + BCrypt</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">Authenticate credentials &amp; return JWT</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-blue-600">POST</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">/api/auth/google</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-sans font-bold">Public</span></td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">Google ID Token Parser/Verifier</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">Login/Register with Google OAuth</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-emerald-600">GET</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">/api/auth/me</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-sans font-bold">Protected</span></td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">JwtAuthenticationFilter (Bearer token)</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">Get authenticated user identity</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-emerald-600">GET</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">/api/health</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-sans font-bold">Public</span></td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">PermitAll()</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">System health and uptime ping</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
              <FileCode2 className="w-4 h-4 text-blue-600" />
              <span>JwtUtils.java</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Core cryptographic helper handling HMAC-SHA256 signing with 256-bit environment secret, token expiration checks, and claim extraction (userId, email).
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
              io.jsonwebtoken:jjwt-api:0.12.6
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
              <FileCode2 className="w-4 h-4 text-indigo-600" />
              <span>JwtAuthenticationFilter.java</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Extends <code className="text-indigo-600">OncePerRequestFilter</code>. Parses HTTP Authorization header, verifies JWT validity, and binds UserPrincipal to Spring's SecurityContextHolder.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
              org.springframework.security.web.authentication
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
              <FileCode2 className="w-4 h-4 text-emerald-600" />
              <span>SecurityConfig.java</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Main security filter chain definition. Configures stateless session policy, CORS origin filtering, CSRF disabling for REST, and registers BCryptPasswordEncoder bean.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
              @EnableWebSecurity + @EnableMethodSecurity
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
              <FileCode2 className="w-4 h-4 text-amber-600" />
              <span>JwtAuthenticationEntryPoint.java</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Intercepts unauthenticated requests to protected endpoints, preventing default HTML redirect pages and returning a clean, uniform JSON ErrorResponse with HTTP 401.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
              HTTP 401 Unauthorized (Clean JSON)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

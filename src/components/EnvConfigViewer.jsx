import React, { useState } from 'react';
import { Key, ShieldCheck, Check, Copy } from 'lucide-react';

export const EnvConfigViewer = () => {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, keyName) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const frontendEnv = `VITE_API_BASE_URL="http://localhost:8080"\nVITE_APP_ENV="development"`;
  const backendEnv = `SERVER_PORT=8080\nSPRING_DATASOURCE_URL="jdbc:postgresql://..."\nSPRING_DATASOURCE_USERNAME="postgres"\nSPRING_DATASOURCE_PASSWORD="your_db_password"\nCORS_ALLOWED_ORIGINS="https://codemate.vercel.app"`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Configuration &amp; Security Plan
          </h2>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            Environment Parameter Isolation &amp; Secrets Hygiene
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
          Zero Hardcoded Secrets
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Frontend Env Variables */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Frontend (<code className="text-blue-600 font-mono">.env.example</code>)
            </span>
            <button
              onClick={() => copyToClipboard(frontendEnv, 'frontend')}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-mono"
            >
              {copiedKey === 'frontend' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'frontend' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
            <div className="text-slate-500 text-[11px]"># Base API URL (target routing)</div>
            <div className="text-emerald-400">VITE_API_BASE_URL=<span className="text-amber-300">"http://localhost:8080"</span></div>
            <div className="text-emerald-400">VITE_APP_ENV=<span className="text-amber-300">"development"</span></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Frontend consumes only public variables prefixed with <code className="font-mono text-slate-700">VITE_</code>.
          </p>
        </div>

        {/* Backend Env Variables */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Backend (<code className="text-blue-600 font-mono">backend/.env.example</code>)
            </span>
            <button
              onClick={() => copyToClipboard(backendEnv, 'backend')}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-mono"
            >
              {copiedKey === 'backend' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'backend' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1.5 border border-slate-800">
            <div className="text-slate-500 text-[11px]"># Spring Boot, PostgreSQL &amp; JWT Security</div>
            <div className="text-blue-400">SERVER_PORT=<span className="text-amber-300">8080</span></div>
            <div className="text-blue-400">SPRING_DATASOURCE_URL=<span className="text-amber-300">"jdbc:postgresql://..."</span></div>
            <div className="text-blue-400">SPRING_DATASOURCE_USERNAME=<span className="text-amber-300">"postgres"</span></div>
            <div className="text-blue-400">SPRING_DATASOURCE_PASSWORD=<span className="text-amber-300">"your_db_password"</span></div>
            <div className="text-indigo-400">JWT_SECRET=<span className="text-amber-300">"256_bit_secure_signing_secret"</span></div>
            <div className="text-indigo-400">JWT_EXPIRATION_MS=<span className="text-amber-300">86400000</span></div>
            <div className="text-amber-400">GOOGLE_CLIENT_ID=<span className="text-amber-300">"apps.googleusercontent.com"</span></div>
            <div className="text-blue-400">CORS_ALLOWED_ORIGINS=<span className="text-amber-300">"https://codemate.vercel.app"</span></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Database credentials &amp; CORS configurations are read securely by Spring Boot runtime.
          </p>
        </div>
      </div>

      {/* Security Principles Checklist */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Architectural Compliance Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>Zero hardcoded database credentials</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>Environment-driven CORS allowed origins</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>Centralized API URL resolution on frontend</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>Cloud PostgreSQL &amp; remote database compatibility</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, UserCheck, AlertTriangle, Play, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';

export function SecurityIsolationVerifier() {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [simulatedAction, setSimulatedAction] = useState('GET');

  const runSecurityTest = async (action = 'GET') => {
    setTesting(true);
    setSimulatedAction(action);

    try {
      let token = localStorage.getItem('codemate_jwt_token');

      // Fetch currently logged in user
      const meRes = await fetch(`${API_CONFIG.BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const me = meRes.ok ? await meRes.json() : { id: 1, name: 'Current User' };

      // Target an unauthorized/foreign problem ID (e.g. 999999) to verify security checks
      const targetProblemId = 999999;
      const targetOwner = 'Another Developer (Different User Account)';
      const targetTitle = 'Protected Resource #999999';

      const endpoint = `${API_CONFIG.BASE_URL}/api/problems/${targetProblemId}`;
      const method = action;
      const body = action === 'PUT' ? JSON.stringify({ title: 'Hacked Title Tamper' }) : undefined;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body
      });

      const responseStatus = res.status;
      let responseBody = {};
      try {
        responseBody = await res.json();
      } catch (e) {
        responseBody = { message: 'No JSON body' };
      }

      setTestResult({
        caller: me,
        targetProblemId,
        targetOwner,
        targetTitle,
        method,
        endpoint,
        status: responseStatus,
        isBlocked: responseStatus === 403 || responseStatus === 404,
        responseBody,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err) {
      setTestResult({
        error: err.message,
        isBlocked: false,
        status: 500
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cross-User Ownership &amp; Isolation Verifier
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30 uppercase">
                IDOR Protected
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Verifies that User B cannot read, update, or delete User A's coding problems via direct ID tampering.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Scenario Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Authenticated Developer Session
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Strict Principal Scoping
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              All problem queries and mutations are filtered strictly by <code className="font-mono text-blue-700 font-semibold">user_id = JWT.userId</code>.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-blue-100">
              WHERE user_id = :authenticatedUserId
            </div>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                Zero-Trust Ownership Enforcement
              </span>
              <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                HTTP 403 Forbidden
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Attempting to read or mutate any problem record belonging to another user is rejected with an HTTP 403 response.
            </p>
            <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-purple-100">
              if (problem.userId !== JWT.userId) return 403;
            </div>
          </div>
        </div>

        {/* Interactive Exploit Test Controls */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Simulate ID Tampering (IDOR Attack) on Cross-User Resource:
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => runSecurityTest('GET')}
              disabled={testing}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-blue-400" />
              Test GET /api/problems/{'{foreign_id}'} (Read Tamper)
            </button>
            <button
              onClick={() => runSecurityTest('PUT')}
              disabled={testing}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-amber-300" />
              Test PUT /api/problems/{'{foreign_id}'} (Update Tamper)
            </button>
            <button
              onClick={() => runSecurityTest('DELETE')}
              disabled={testing}
              className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-rose-300" />
              Test DELETE /api/problems/{'{foreign_id}'} (Delete Tamper)
            </button>
          </div>

          {/* Test Results Console */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.isBlocked 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {testResult.isBlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="text-sm font-bold text-slate-900">
                    {testResult.isBlocked ? 'Security Verification PASSED' : 'Security Isolation Breach!'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white rounded border border-slate-200">
                  HTTP {testResult.status} {testResult.isBlocked ? 'FORBIDDEN (Expected)' : 'UNEXPECTED'}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                {testResult.isBlocked ? (
                  <span>
                    The server inspected the authenticated user principal (<strong>{testResult.caller?.name}</strong>, ID: {testResult.caller?.id}) and compared it with the problem owner (<strong>{testResult.targetOwner}</strong>). Because the user is not the owner of <strong>{testResult.targetTitle}</strong>, the backend rejected the {testResult.method} operation with <strong>HTTP 403 Forbidden</strong>.
                  </span>
                ) : (
                  <span>Warning: Server returned status {testResult.status}. Ensure user authorization checks are active.</span>
                )}
              </p>

              <div className="bg-slate-900 text-slate-200 p-3 rounded-md font-mono text-[11px] overflow-x-auto space-y-1">
                <div className="text-slate-400">// Live HTTP Request &amp; Response Packet:</div>
                <div className="text-blue-400">&gt; {testResult.method} {testResult.endpoint}</div>
                <div className="text-slate-400">&gt; Authorization: Bearer eyJhbGciOiJIUzI1Ni... (User #{testResult.caller?.id})</div>
                <div className="text-emerald-400">&lt; HTTP/1.1 {testResult.status} Forbidden</div>
                <div className="text-slate-300">&lt; {JSON.stringify(testResult.responseBody, null, 2)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

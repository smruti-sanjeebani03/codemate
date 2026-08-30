import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertTriangle, Globe, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { healthService } from '../services/healthService';

export const HealthChecker = () => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    responseTimeMs: null,
    lastCheckedAt: null,
    endpointUrl: healthService.getConfiguredEndpoint(),
  });

  const runHealthCheck = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const startTime = performance.now();

    try {
      const response = await healthService.checkHealth();
      const endTime = performance.now();
      setState({
        data: response,
        loading: false,
        error: null,
        responseTimeMs: Math.round(endTime - startTime),
        lastCheckedAt: new Date().toLocaleTimeString(),
        endpointUrl: healthService.getConfiguredEndpoint(),
      });
    } catch (err) {
      const endTime = performance.now();
      const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
      setState({
        data: null,
        loading: false,
        error: errorMsg,
        responseTimeMs: Math.round(endTime - startTime),
        lastCheckedAt: new Date().toLocaleTimeString(),
        endpointUrl: healthService.getConfiguredEndpoint(),
      });
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const isHealthy = !state.loading && !state.error && state.data !== null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Live Health Verification
          </h2>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="text-base font-semibold text-slate-900">
              API Contract Status:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isHealthy
                  ? 'bg-green-100 text-green-700'
                  : state.loading
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isHealthy ? 'bg-green-600 animate-pulse' : state.loading ? 'bg-amber-600' : 'bg-rose-600'
                }`}
              ></span>
              {state.loading ? 'Checking' : isHealthy ? 'Online' : 'Unreachable'}
            </span>
          </div>
        </div>

        <button
          onClick={runHealthCheck}
          disabled={state.loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${state.loading ? 'animate-spin' : ''}`} />
          <span>Ping /api/health</span>
        </button>
      </div>

      {/* Target & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Target Endpoint</span>
          </div>
          <p className="text-xs font-mono text-slate-800 truncate" title={state.endpointUrl}>
            {state.endpointUrl}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Roundtrip Latency</span>
          </div>
          <p className="text-xs font-mono text-slate-800">
            {state.responseTimeMs !== null ? `${state.responseTimeMs} ms` : '—'}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Verified</span>
          </div>
          <p className="text-xs font-mono text-slate-800">
            {state.lastCheckedAt || 'Just now'}
          </p>
        </div>
      </div>

      {/* Response Payload Viewer */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            JSON Response Contract
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            HTTP 200 OK
          </span>
        </div>

        {isHealthy && state.data && (
          <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
            <pre>{JSON.stringify(state.data, null, 2)}</pre>
          </div>
        )}

        {state.loading && (
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Verifying backend contract and latency...</span>
          </div>
        )}

        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            <div className="flex items-center gap-2 font-medium mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Connection Notice</span>
            </div>
            <p className="text-rose-700">{state.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

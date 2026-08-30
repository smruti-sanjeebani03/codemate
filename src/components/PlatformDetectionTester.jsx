import React, { useState } from 'react';
import { Globe, CheckCircle, ExternalLink, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { problemService } from '../services/problemService';

const PRESET_URLS = [
  { name: 'LeetCode', url: 'https://leetcode.com/problems/two-sum/', category: 'DSA' },
  { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/problems/armstrong-numbers2727/1', category: 'LOGIC' },
  { name: 'CodeChef', url: 'https://www.codechef.com/problems/FLOW001', category: 'LOGIC' },
  { name: 'Codeforces', url: 'https://codeforces.com/problemset/problem/4/A', category: 'LOGIC' },
  { name: 'HackerRank', url: 'https://www.hackerrank.com/challenges/simple-array-sum/problem', category: 'DSA' },
  { name: 'Coding Ninjas', url: 'https://www.naukri.com/code360/problems/two-sum', category: 'DSA' },
  { name: 'AtCoder', url: 'https://atcoder.jp/contests/abc300/tasks/abc300_a', category: 'DSA' },
  { name: 'SPOJ', url: 'https://www.spoj.com/problems/PRIME1/', category: 'LOGIC' },
  { name: 'Project Euler', url: 'https://projecteuler.net/problem=1', category: 'LOGIC' },
  { name: 'NeetCode', url: 'https://neetcode.io/problems/contains-duplicate', category: 'DSA' },
  { name: 'Custom URL', url: 'https://mycustomjudge.org/contest/1/problem/A', category: 'OTHER' }
];

export function PlatformDetectionTester({ onSelectUrl }) {
  const [inputUrl, setInputUrl] = useState('https://leetcode.com/problems/trapping-rain-water/');
  const [detectionResult, setDetectionResult] = useState({
    platform: 'LeetCode',
    domain: 'leetcode.com',
    recognized: true
  });
  const [isDetecting, setIsDetecting] = useState(false);

  const handleTestUrl = async (urlToTest) => {
    const url = urlToTest || inputUrl;
    if (!url.trim()) return;
    setIsDetecting(true);
    try {
      const res = await problemService.detectPlatform(url);
      setDetectionResult(res);
    } catch (err) {
      // Local fallback detection
      let host = '';
      try {
        const u = new URL(url.startsWith('http') ? url : 'https://' + url);
        host = u.hostname.replace(/^www\./, '');
      } catch (e) {
        host = 'unknown';
      }
      setDetectionResult({
        platform: host.includes('leetcode') ? 'LeetCode' : host,
        domain: host,
        recognized: false
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Automatic Platform Detection Engine
              <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30 uppercase">
                Zero Scraping
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic, lightning-fast domain parsing without external HTTP scraping or fragile HTML parsers.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Interactive URL Input & Detector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Test Problem URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  handleTestUrl(e.target.value);
                }}
                placeholder="Paste any coding problem URL (e.g. https://leetcode.com/problems/...)"
                className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
              />
            </div>
            <button
              onClick={() => handleTestUrl(inputUrl)}
              disabled={isDetecting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isDetecting ? 'Detecting...' : 'Detect Platform'}
            </button>
          </div>
        </div>

        {/* Live Detection Outcome Badge */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base ${
              detectionResult.recognized 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {detectionResult.recognized ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Detected Platform</div>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>{detectionResult.platform}</span>
                {detectionResult.recognized ? (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-semibold rounded border border-emerald-200">
                    Recognized CP Platform
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-mono font-semibold rounded border border-slate-200">
                    Custom Domain
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Domain: {detectionResult.domain || 'N/A'}
              </div>
            </div>
          </div>

          {onSelectUrl && (
            <button
              onClick={() => onSelectUrl(inputUrl, detectionResult.platform)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
            >
              Use in Problem Form
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Preset Sample URLs for Quick Verification */}
        <div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Click to test supported competitive platforms:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_URLS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setInputUrl(preset.url);
                  handleTestUrl(preset.url);
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  inputUrl === preset.url
                    ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{preset.name}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                  preset.category === 'LOGIC' 
                    ? 'bg-amber-100 text-amber-700' 
                    : preset.category === 'DSA'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {preset.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

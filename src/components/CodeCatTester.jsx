import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Cpu, 
  Sparkles, 
  Lock, 
  RefreshCw, 
  Bot, 
  Layers, 
  Code2, 
  Lightbulb, 
  Bug, 
  Clock 
} from 'lucide-react';
import { codeCatService } from '../services/codeCatService';
import { authService } from '../services/authService';

export function CodeCatTester({ onLaunchCodeCatWithContext }) {
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioOutput, setScenarioOutput] = useState(null);
  const [loadingScenario, setLoadingScenario] = useState(false);

  const SCENARIOS = [
    {
      id: 'logic-armstrong',
      title: 'Logic Building: Armstrong Number Trap',
      category: 'LOGIC',
      prompt: 'Why does my Armstrong number code fail when input is 1634 in Java?',
      problemContext: {
        title: 'Armstrong Numbers',
        category: 'LOGIC',
        topic: 'Armstrong Number',
        difficulty: 'EASY',
        language: 'Java',
        userCode: `public boolean isArmstrong(int n) {\n  int sum = 0, temp = n;\n  while (temp > 0) {\n    int d = temp % 10;\n    sum += Math.pow(d, 3); // Hardcoded power 3\n    temp /= 10;\n  }\n  return sum == n;\n}`
      }
    },
    {
      id: 'dsa-pattern',
      title: 'DSA Pattern: Two Pointers vs Hash Map',
      category: 'DSA',
      prompt: 'If the array is already sorted in non-decreasing order, what is the best pattern to find two numbers that sum to target?',
      problemContext: {
        title: 'Two Sum II - Input Array Is Sorted',
        category: 'DSA',
        topic: 'Two Pointers',
        difficulty: 'MEDIUM',
        language: 'Java'
      }
    },
    {
      id: 'debug-binary-search',
      title: 'Code Debugging: Binary Search Overflow',
      category: 'DSA',
      prompt: 'Why is mid = (left + right) / 2 considered dangerous for large inputs in Java and C++?',
      problemContext: {
        title: 'Binary Search',
        category: 'DSA',
        topic: 'Binary Search',
        difficulty: 'EASY',
        language: 'Java',
        userCode: `int mid = (left + right) / 2;\nif (nums[mid] == target) return mid;`
      }
    },
    {
      id: 'complexity-fib',
      title: 'Complexity Analysis: Fibonacci Tree vs DP',
      category: 'LOGIC',
      prompt: 'Analyze Time and Space complexity for naive recursion O(2^n) vs iterative DP for Fibonacci.',
      problemContext: {
        title: 'Fibonacci Number',
        category: 'LOGIC',
        topic: 'Fibonacci',
        difficulty: 'EASY',
        language: 'Java'
      }
    }
  ];

  const runAllSecurityAndLogicTests = async () => {
    setRunning(true);
    setTestResults([]);
    const results = [];

    // Helper to log test result
    const logTest = (name, passed, detail) => {
      results.push({ name, passed, detail, timestamp: new Date().toLocaleTimeString() });
      setTestResults([...results]);
    };

    try {
      // Test 1: Service Status Check
      const status = await codeCatService.getStatus();
      if (status && status.status === 'active') {
        logTest('AI Service Status Endpoint', true, `Active (${status.provider}, model: ${status.model})`);
      } else {
        logTest('AI Service Status Endpoint', false, 'Service status did not report active');
      }

      // Test 2: Ensure Auth Token is required (Security)
      const cachedToken = localStorage.getItem('codemate_token');
      // Simulated unauthorized fetch
      const unauthRes = await fetch('/api/codecat/conversations', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (unauthRes.status === 401) {
        logTest('Authentication Enforcement (401 Unauthorized)', true, 'Unauthenticated request correctly rejected with 401');
      } else {
        logTest('Authentication Enforcement (401 Unauthorized)', false, `Expected 401 but received ${unauthRes.status}`);
      }

      // Test 3: User Conversation Retrieval
      const userConversations = await codeCatService.getConversations();
      if (Array.isArray(userConversations)) {
        logTest('User Conversation Listing', true, `Retrieved ${userConversations.length} conversation(s)`);
      } else {
        logTest('User Conversation Listing', false, 'Failed to retrieve conversations array');
      }

      // Test 4: Cross-User Conversation Isolation Check
      const crossUserRes = await fetch('/api/codecat/conversations/3', {
        headers: {
          'Authorization': `Bearer ${cachedToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (crossUserRes.status === 403 || crossUserRes.status === 404) {
        logTest('Cross-User Data Isolation (403 Forbidden)', true, `Access to foreign conversation correctly blocked with HTTP ${crossUserRes.status}`);
      } else {
        logTest('Cross-User Data Isolation (403 Forbidden)', false, `Expected 403/404 for other user conversation, got ${crossUserRes.status}`);
      }

      // Test 5: Logic & DSA Problem Context Injection Chat
      const chatRes = await codeCatService.sendMessage({
        message: 'Can you give me a progressive hint on Armstrong number logic in Java?',
        problemContext: {
          title: 'Armstrong Numbers',
          category: 'LOGIC',
          topic: 'Armstrong Number',
          difficulty: 'EASY',
          language: 'Java'
        }
      });

      if (chatRes && chatRes.message && chatRes.conversationId) {
        logTest('CodeCat Pedagogical Response Generation', true, `Successfully received structured response from ${chatRes.provider} in Conversation #${chatRes.conversationId}`);
      } else {
        logTest('CodeCat Pedagogical Response Generation', false, 'Did not receive valid structured chat response');
      }

      // Test 6: API Key Leakage Protection Verification
      const responseStr = JSON.stringify(chatRes);
      const hasApiKeyLeak = responseStr.includes('AIza') || responseStr.includes('sk-') || responseStr.includes('key=');
      if (!hasApiKeyLeak) {
        logTest('API Key Leakage Protection', true, 'Zero secret keys exposed in client response payload');
      } else {
        logTest('API Key Leakage Protection', false, 'WARNING: Potential API key string detected in response payload');
      }

    } catch (err) {
      logTest('Test Suite Execution Exception', false, err.message || 'Error occurred during test run');
    } finally {
      setRunning(false);
    }
  };

  const handleRunScenario = async (scenario) => {
    setActiveScenario(scenario.id);
    setLoadingScenario(true);
    setScenarioOutput(null);

    try {
      const res = await codeCatService.sendMessage({
        message: scenario.prompt,
        problemContext: scenario.problemContext
      });
      setScenarioOutput(res);
    } catch (err) {
      setScenarioOutput({ error: err.message || 'Scenario failed to execute' });
    } finally {
      setLoadingScenario(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Part 6 Verification
            </span>
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              CodeCat AI &amp; Security Isolation Suite
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated test engine verifying Logic, DSA, Debugging, Multi-turn Context, and Multi-user Data Isolation.
          </p>
        </div>

        <button
          onClick={runAllSecurityAndLogicTests}
          disabled={running}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          <span>Run All Tests</span>
        </button>
      </div>

      {/* Automated Tests Table */}
      {testResults.length > 0 && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Automated Test Executions</span>
            <span>
              {testResults.filter(t => t.passed).length} / {testResults.length} Passed
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {testResults.map((t, idx) => (
              <div key={idx} className="p-3 flex items-start justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-start gap-2.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-slate-800">{t.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{t.detail}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {t.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Scenario Testers */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Interactive Capability Demonstrations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCENARIOS.map(sc => (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border transition-all ${
                activeScenario === sc.id
                  ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sc.category === 'DSA' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {sc.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{sc.problemContext.language}</span>
              </div>

              <div className="font-bold text-xs text-slate-900 mb-1">{sc.title}</div>
              <p className="text-[11px] text-slate-500 italic mb-3">"{sc.prompt}"</p>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => handleRunScenario(sc)}
                  disabled={loadingScenario}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5"
                >
                  {loadingScenario && activeScenario === sc.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-white" />
                  )}
                  <span>Test with CodeCat</span>
                </button>

                {onLaunchCodeCatWithContext && (
                  <button
                    onClick={() => onLaunchCodeCatWithContext(sc.problemContext)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Open in Full Chat →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Scenario Output Viewer */}
        {scenarioOutput && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span>🐱 CodeCat Response Output</span>
                {scenarioOutput.provider && <span>({scenarioOutput.provider})</span>}
              </span>
              <span>Conversation #{scenarioOutput.conversationId || 'N/A'}</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pt-1 font-sans text-xs text-slate-200">
              {scenarioOutput.message || JSON.stringify(scenarioOutput, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

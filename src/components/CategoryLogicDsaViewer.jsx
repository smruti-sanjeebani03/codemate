import React, { useState } from 'react';
import { Sparkles, Layers, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export const CategoryLogicDsaViewer = () => {
  const [activeTab, setActiveTab] = useState('ALL');

  const logicTopics = [
    'Prime Numbers & Sieve',
    'Armstrong Numbers',
    'Palindrome Checks',
    'Fibonacci Sequences',
    'Factorials & Permutations',
    'GCD & LCM (Euclidean)',
    'Number Systems & Bases',
    'Pattern Printing Loops',
    'Nested Conditionals',
    'String Inversions & Anagrams',
    'Mathematical Modular Logic',
  ];

  const dsaTopics = [
    'Arrays & Two Pointers',
    'Sliding Window',
    'Binary Search',
    'Hashing & HashMaps',
    'Linked Lists',
    'Stacks & Queues',
    'Recursion & Backtracking',
    'Binary Trees & BST',
    'Heaps & Priority Queues',
    'Graphs (BFS / DFS / Dijkstra)',
    'Dynamic Programming',
    'Bit Manipulation',
    'Trie & Union-Find',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Taxonomy Architecture
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-1">
            Category (LOGIC vs DSA) &amp; Extensible Topic Hierarchy
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Pillars
          </button>
          <button
            onClick={() => setActiveTab('LOGIC')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'LOGIC' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            LOGIC
          </button>
          <button
            onClick={() => setActiveTab('DSA')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'DSA' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DSA
          </button>
        </div>
      </div>

      {/* Structural Hierarchy Banner */}
      <div className="mb-6 p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs border border-slate-800">
        <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-2">Relational Hierarchy Rule:</div>
        <div className="flex flex-wrap items-center gap-2 text-slate-100">
          <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 text-amber-300 font-bold">Problem</span>
          <span className="text-slate-500">→</span>
          <span className="px-2.5 py-1 bg-blue-900/60 rounded border border-blue-700/50 text-blue-300 font-bold">Category (Enum: LOGIC | DSA)</span>
          <span className="text-slate-500">→</span>
          <span className="px-2.5 py-1 bg-emerald-900/60 rounded border border-emerald-700/50 text-emerald-300 font-bold">Topic (Extensible String)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LOGIC Pillar */}
        {(activeTab === 'ALL' || activeTab === 'LOGIC') && (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-xs">
                  Category.LOGIC
                </span>
                <span className="text-xs text-slate-500 font-medium">Programming Fundamentals</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Focuses on coding logic, mathematical reasoning, loops, condition handling, and number theory.
            </p>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Example Logic Topics:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {logicTopics.map((topic, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DSA Pillar */}
        {(activeTab === 'ALL' || activeTab === 'DSA') && (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-xs">
                  Category.DSA
                </span>
                <span className="text-xs text-slate-500 font-medium">Data Structures &amp; Algorithms</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard competitive programming and technical interview structures from basic arrays to complex dynamic programming and graphs.
            </p>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Example DSA Topics:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dsaTopics.map((topic, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extensibility & Zero Migration Guarantee */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900 font-semibold">Extensibility Guarantee:</strong> Because <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">topic</code>, <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">platform</code>, and <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">programmingLanguage</code> are stored as typed strings rather than rigid database enums, thousands of new custom topics, platforms (LeetCode, GFG, CodeChef, Codeforces), and languages (Java, C++, Rust, Python) can be added dynamically in future phases without altering database tables.
        </p>
      </div>
    </div>
  );
};

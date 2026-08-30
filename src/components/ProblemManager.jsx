import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, Edit3, ExternalLink, Globe, Sparkles, 
  CheckCircle2, AlertCircle, Calendar, Code, Tag, Layers, RefreshCw, X
} from 'lucide-react';
import { problemService } from '../services/problemService';

const LOGIC_TOPICS = [
  'Number Problems',
  'Armstrong Number',
  'Palindrome',
  'Fibonacci',
  'Prime Numbers',
  'Factorial',
  'Pattern Printing',
  'Basic Math',
  'Bit Manipulation',
  'Recursion Basics',
  'Mathematical Logic',
  'Other Logic'
];

const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks & Queues',
  'Trees',
  'Binary Search Trees',
  'Binary Search',
  'Dynamic Programming',
  'Graphs',
  'Sliding Window',
  'Two Pointers',
  'Greedy',
  'Heaps',
  'Trie',
  'Backtracking',
  'Other DSA'
];

const PROGRAMMING_LANGUAGES = [
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'C#',
  'Kotlin',
  'C'
];

export function ProblemManager({ activeUser, onPrefillUrl, prefillData, onAskCodeCat }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters and Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [topicFilter, setTopicFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('solvedAt');
  const [sortDir, setSortDir] = useState('DESC');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [deletingProblemId, setDeletingProblemId] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formPlatform, setFormPlatform] = useState('');
  const [formCategory, setFormCategory] = useState('DSA');
  const [formTopic, setFormTopic] = useState('Arrays');
  const [formCustomTopic, setFormCustomTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('EASY');
  const [formLanguage, setFormLanguage] = useState('Java');
  const [formSolvedAt, setFormSolvedAt] = useState(new Date().toISOString().split('T')[0]);
  const [detectedPlatformPreview, setDetectedPlatformPreview] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch problems whenever filters change
  const loadProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await problemService.getProblems({
        search,
        category: categoryFilter,
        topic: topicFilter,
        difficulty: difficultyFilter,
        platform: platformFilter,
        language: languageFilter,
        sortBy,
        sortDir
      });
      setProblems(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load solved problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [search, categoryFilter, topicFilter, difficultyFilter, platformFilter, languageFilter, sortBy, sortDir, activeUser]);

  // If external prefill is passed
  useEffect(() => {
    if (prefillData) {
      openAddModal(prefillData.url, prefillData.platform);
    }
  }, [prefillData]);

  // Real-time URL platform detection as user types
  const handleUrlChange = async (url) => {
    setFormUrl(url);
    if (!url.trim()) {
      setDetectedPlatformPreview(null);
      setFormPlatform('');
      return;
    }

    setIsDetecting(true);
    try {
      const res = await problemService.detectPlatform(url);
      setDetectedPlatformPreview(res);
      setFormPlatform(res.platform);
    } catch (e) {
      // Fallback
      setDetectedPlatformPreview(null);
    } finally {
      setIsDetecting(false);
    }
  };

  const openAddModal = (initialUrl = '', initialPlatform = '') => {
    setEditingProblem(null);
    setFormTitle('');
    setFormUrl(initialUrl);
    setFormPlatform(initialPlatform);
    setFormCategory('DSA');
    setFormTopic('Arrays');
    setFormCustomTopic('');
    setFormDifficulty('EASY');
    setFormLanguage('Java');
    setFormSolvedAt(new Date().toISOString().split('T')[0]);
    setDetectedPlatformPreview(initialPlatform ? { platform: initialPlatform, recognized: true } : null);
    setFormError(null);
    setIsModalOpen(true);

    if (initialUrl) {
      handleUrlChange(initialUrl);
    }
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setFormTitle(problem.title);
    setFormUrl(problem.problemUrl || '');
    setFormPlatform(problem.platform || '');
    setFormCategory(problem.category);
    
    // Check if topic is in predefined lists
    const topicList = problem.category === 'LOGIC' ? LOGIC_TOPICS : DSA_TOPICS;
    if (topicList.includes(problem.topic)) {
      setFormTopic(problem.topic);
      setFormCustomTopic('');
    } else {
      setFormTopic('CUSTOM');
      setFormCustomTopic(problem.topic);
    }

    setFormDifficulty(problem.difficulty);
    setFormLanguage(problem.programmingLanguage);
    setFormSolvedAt(problem.solvedAt ? problem.solvedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
    setDetectedPlatformPreview(problem.platform ? { platform: problem.platform, recognized: true } : null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Problem title is required');
      return;
    }

    const resolvedTopic = formTopic === 'CUSTOM' ? formCustomTopic.trim() : formTopic;
    if (!resolvedTopic) {
      setFormError('Topic is required');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        title: formTitle.trim(),
        problemUrl: formUrl.trim() || undefined,
        platform: formPlatform.trim() || undefined,
        category: formCategory,
        topic: resolvedTopic,
        difficulty: formDifficulty,
        programmingLanguage: formLanguage.trim(),
        solvedAt: formSolvedAt ? new Date(formSolvedAt).toISOString() : new Date().toISOString()
      };

      if (editingProblem) {
        await problemService.updateProblem(editingProblem.id, payload);
        setSuccessMessage(`Problem "${payload.title}" updated successfully!`);
      } else {
        await problemService.createProblem(payload);
        setSuccessMessage(`Problem "${payload.title}" recorded to your CodeMate logs!`);
      }

      setIsModalOpen(false);
      loadProblems();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to save problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await problemService.deleteProblem(id);
      setSuccessMessage('Problem deleted successfully');
      setDeletingProblemId(null);
      loadProblems();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete problem');
      setDeletingProblemId(null);
    }
  };

  // Metrics
  const logicCount = problems.filter(p => p.category === 'LOGIC').length;
  const dsaCount = problems.filter(p => p.category === 'DSA').length;
  const easyCount = problems.filter(p => p.difficulty === 'EASY').length;
  const mediumCount = problems.filter(p => p.difficulty === 'MEDIUM').length;
  const hardCount = problems.filter(p => p.difficulty === 'HARD').length;

  return (
    <div className="glass-panel-strong rounded-3xl overflow-hidden transition-colors">
      {/* Header Bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900/95 to-indigo-950/95 dark:from-slate-950/95 dark:to-indigo-950/95 backdrop-blur-md text-white flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center backdrop-blur-xs">
            <Layers className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Problem Management &amp; Tracking Suite
              <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30 uppercase">
                Part 4 Core
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Record solved problems, auto-detect coding platforms, assign Logic/DSA categories, and manage topics.
            </p>
          </div>
        </div>

        <button
          onClick={() => openAddModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Solved Problem</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-500/15 dark:bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-medium backdrop-blur-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Global Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-500/15 dark:bg-rose-950/50 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs font-medium backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 glass-panel-interactive rounded-2xl">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Solved</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{problems.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300/30 dark:border-amber-900/40 backdrop-blur-md">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Logic Category</div>
            <div className="text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">{logicCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-300/30 dark:border-indigo-900/40 backdrop-blur-md">
            <div className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">DSA Category</div>
            <div className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">{dsaCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-300/30 dark:border-emerald-900/40 backdrop-blur-md">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Easy Diff.</div>
            <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">{easyCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-950/30 border border-blue-300/30 dark:border-blue-900/40 backdrop-blur-md">
            <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Medium / Hard</div>
            <div className="text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">{mediumCount + hardCount}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 glass-panel-subtle rounded-2xl space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search problems by title or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 glass-panel-subtle p-1 rounded-xl">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('LOGIC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'LOGIC'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                Logic
              </button>
              <button
                onClick={() => setCategoryFilter('DSA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === 'DSA'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-800 dark:text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                DSA
              </button>
            </div>
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs glass-input rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Platform
              </label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs glass-input rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Platforms</option>
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="CodeChef">CodeChef</option>
                <option value="Codeforces">Codeforces</option>
                <option value="HackerRank">HackerRank</option>
                <option value="Coding Ninjas">Coding Ninjas</option>
                <option value="AtCoder">AtCoder</option>
                <option value="Custom">Custom / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Language
              </label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs glass-input rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Languages</option>
                {PROGRAMMING_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Sort Order
              </label>
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDir(dir);
                }}
                className="w-full px-2.5 py-1.5 text-xs glass-input rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="solvedAt-DESC">Newest Solved First</option>
                <option value="solvedAt-ASC">Oldest Solved First</option>
                <option value="title-ASC">Title (A-Z)</option>
                <option value="difficulty-ASC">Difficulty (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems List Table */}
        {loading ? (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading problem records...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-3">
            <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Problems Found</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-1">
                {search || categoryFilter !== 'ALL' || difficultyFilter !== 'ALL'
                  ? 'No problems match the selected filters. Try clearing your filters.'
                  : 'Start tracking your journey by logging your first solved problem!'}
              </p>
            </div>
            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Problem</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl glass-panel-subtle">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="glass-panel-subtle border-b border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Problem Title &amp; URL</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Topic</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Difficulty</th>
                  <th className="py-3 px-3">Language</th>
                  <th className="py-3 px-3">Solved Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
                {problems.map((problem) => {
                  const isLogic = problem.category === 'LOGIC';
                  const diffColor = 
                    problem.difficulty === 'EASY' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                    problem.difficulty === 'MEDIUM' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                    'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';

                  return (
                    <tr key={problem.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <span>{problem.title}</span>
                          {problem.problemUrl && (
                            <a
                              href={problem.problemUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Open original problem link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {problem.problemUrl && (
                          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">
                            {problem.problemUrl}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                          isLogic 
                            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' 
                            : 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30'
                        }`}>
                          {problem.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {problem.topic}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full glass-panel-subtle text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          <Globe className="w-3 h-3 text-slate-500" />
                          {problem.platform || 'Custom'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[10px] border ${diffColor}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {problem.programmingLanguage}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {problem.solvedAt ? new Date(problem.solvedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onAskCodeCat && (
                            <button
                              onClick={() => onAskCodeCat({
                                title: problem.title,
                                category: problem.category,
                                topic: problem.topic,
                                difficulty: problem.difficulty,
                                language: problem.programmingLanguage,
                                problemUrl: problem.problemUrl
                              })}
                              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer backdrop-blur-xs"
                              title="Ask CodeCat about this problem"
                            >
                              <span>🐱</span>
                              <span>Ask CodeCat</span>
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(problem)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit Problem"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProblemId(problem.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Problem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal (Frosted Glass Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="glass-panel-strong rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-white/20 dark:border-white/10">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900/95 to-indigo-950/95 dark:from-slate-950/95 dark:to-indigo-950/95 text-white flex items-center justify-between border-b border-white/10">
              <h3 className="text-sm font-bold flex items-center gap-2">
                {editingProblem ? <Edit3 className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                {editingProblem ? 'Edit Solved Problem' : 'Record New Solved Problem'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Problem Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Problem Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Two Sum, Palindrome Number, Invert Binary Tree"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Problem URL & Live Platform Detection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Problem URL
                  </label>
                  {isDetecting && (
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 font-mono">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Detecting...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. https://leetcode.com/problems/two-sum/"
                  value={formUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-mono"
                />

                {/* Live Platform Badge Detection Result */}
                {formUrl && (
                  <div className="mt-2 p-2.5 glass-panel-subtle rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Detected Platform:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formPlatform || 'Custom'}</span>
                    </div>
                    {detectedPlatformPreview?.recognized && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-mono font-bold rounded-full">
                        Auto-detected
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Category: LOGIC vs DSA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    formCategory === 'LOGIC'
                      ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/20'
                      : 'glass-panel-subtle hover:border-amber-300/40'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        value="LOGIC"
                        checked={formCategory === 'LOGIC'}
                        onChange={() => {
                          setFormCategory('LOGIC');
                          setFormTopic('Number Problems');
                        }}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-bold text-xs text-amber-900 dark:text-amber-200">LOGIC</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5 leading-tight">
                      Fundamentals, math logic, Armstrong, Prime, Palindrome, Patterns.
                    </p>
                  </label>

                  <label className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    formCategory === 'DSA'
                      ? 'bg-indigo-500/15 border-indigo-400 ring-2 ring-indigo-400/20'
                      : 'glass-panel-subtle hover:border-indigo-300/40'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        value="DSA"
                        checked={formCategory === 'DSA'}
                        onChange={() => {
                          setFormCategory('DSA');
                          setFormTopic('Arrays');
                        }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200">DSA</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5 leading-tight">
                      Data Structures &amp; Algorithms: Arrays, Trees, Graphs, DP.
                    </p>
                  </label>
                </div>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Topic <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                >
                  {(formCategory === 'LOGIC' ? LOGIC_TOPICS : DSA_TOPICS).map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                  <option value="CUSTOM">-- Custom Topic --</option>
                </select>

                {formTopic === 'CUSTOM' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom topic name..."
                    value={formCustomTopic}
                    onChange={(e) => setFormCustomTopic(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                  />
                )}
              </div>

              {/* Difficulty & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Difficulty <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Language <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="w-full px-3 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                  >
                    {PROGRAMMING_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Solved */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Date Solved
                </label>
                <input
                  type="date"
                  value={formSolvedAt}
                  onChange={(e) => setFormSolvedAt(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs glass-input rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 glass-panel-interactive text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{editingProblem ? 'Save Changes' : 'Record Problem'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProblemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="glass-panel-strong rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 border border-white/20 dark:border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Problem Record?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete problem #{deletingProblemId}? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProblemId(null)}
                className="px-4 py-2 glass-panel-interactive text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingProblemId)}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

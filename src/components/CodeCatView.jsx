import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  Code2, 
  Copy, 
  Check, 
  Bot, 
  User as UserIcon, 
  Lightbulb, 
  Bug, 
  Clock, 
  Layers, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight, 
  Paperclip, 
  X, 
  HelpCircle, 
  Flame, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import { codeCatService } from '../services/codeCatService';
import { problemService } from '../services/problemService';
import { authService } from '../services/authService';

const QUICK_PROMPTS = [
  {
    icon: Lightbulb,
    label: 'Give me a hint (no spoiler)',
    prompt: 'Can you give me a progressive hint on how to approach this problem without giving away the full code?',
    category: 'HINT'
  },
  {
    icon: Sparkles,
    label: 'Identify DSA Pattern',
    prompt: 'What core DSA pattern (Two Pointers, Sliding Window, DP, Binary Search, etc.) applies here and why?',
    category: 'DSA'
  },
  {
    icon: Bug,
    label: 'Debug my code',
    prompt: 'Can you look at my code snippet, find what logical error or edge case is causing it to fail, and explain why?',
    category: 'DEBUG'
  },
  {
    icon: Clock,
    label: 'Analyze Time & Space Complexity',
    prompt: 'What is the optimal Time Complexity and Space Complexity for this problem, and why?',
    category: 'COMPLEXITY'
  },
  {
    icon: Code2,
    label: 'Show Java Solution & Walkthrough',
    prompt: 'Please provide the complete, clean Java solution with Approach, Step-by-Step Algorithm, Code, Complexity, and why it works.',
    category: 'CODE'
  },
  {
    icon: Layers,
    label: 'Explain Logic & Edge Cases',
    prompt: 'What are the sneaky edge cases and mathematical logic constraints I should be careful about for this problem?',
    category: 'LOGIC'
  }
];

export function CodeCatView({ initialProblemContext, onSelectProblem }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [userProblems, setUserProblems] = useState([]);
  
  // Active problem context for chat
  const [problemContext, setProblemContext] = useState(initialProblemContext || null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [snippetLanguage, setSnippetLanguage] = useState('Java');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showProblemSelector, setShowProblemSelector] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load initial service status and list of conversations
  useEffect(() => {
    loadServiceStatus();
    loadConversations();
    loadUserProblems();
  }, []);

  // Update context if parent provides new problem context
  useEffect(() => {
    if (initialProblemContext) {
      setProblemContext(initialProblemContext);
    }
  }, [initialProblemContext]);

  const loadServiceStatus = async () => {
    try {
      const status = await codeCatService.getStatus();
      setServiceStatus(status);
    } catch (e) {
      console.warn('Failed to load CodeCat status:', e);
    }
  };

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const list = await codeCatService.getConversations();
      setConversations(list || []);
      
      // If there are existing conversations and none is active, pick the most recent
      if (list && list.length > 0 && !activeConversationId) {
        selectConversation(list[0].id);
      }
    } catch (e) {
      console.error('Failed to load conversation history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadUserProblems = async () => {
    try {
      const list = await problemService.getProblems();
      setUserProblems(list || []);
    } catch (e) {
      console.warn('Failed to fetch user problems for context:', e);
    }
  };

  const selectConversation = async (convId) => {
    setActiveConversationId(convId);
    setLoading(true);
    setError(null);
    try {
      const history = await codeCatService.getConversation(convId);
      setMessages(history.messages || []);
      
      // If conversation has attached problem context, set it
      if (history.problemContext) {
        setProblemContext(history.problemContext);
      }
    } catch (e) {
      setError(e.message || 'Failed to load discussion messages');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputMessage('');
    setCodeSnippet('');
    setShowCodeInput(false);
    setError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendMessage = async (customPrompt = null) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim()) return;

    setError(null);
    const userMsgText = textToSend.trim();
    
    // Optimistically add user message to list
    const optimisticUserMsg = {
      id: Date.now(),
      role: 'USER',
      content: userMsgText,
      createdAt: new Date().toISOString(),
      problemContext: problemContext ? { ...problemContext } : undefined
    };

    setMessages(prev => [...prev, optimisticUserMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await codeCatService.sendMessage({
        message: userMsgText,
        conversationId: activeConversationId || undefined,
        problemContext: problemContext || undefined,
        codeSnippet: codeSnippet.trim() ? codeSnippet.trim() : undefined,
        codeLanguage: snippetLanguage || 'Java'
      });

      // Update conversation ID if newly created
      if (!activeConversationId && response.conversationId) {
        setActiveConversationId(response.conversationId);
      }

      // Add CodeCat response to messages
      const catReplyMsg = {
        id: Date.now() + 1,
        role: 'ASSISTANT',
        content: response.reply,
        createdAt: new Date().toISOString(),
        category: response.category,
        followUps: response.followUps || []
      };

      setMessages(prev => [...prev, catReplyMsg]);

      // If code was attached in input, clear after sending
      if (codeSnippet.trim()) {
        setCodeSnippet('');
        setShowCodeInput(false);
      }

      // Refresh sidebar conversations list
      loadConversations();
    } catch (err) {
      console.error('Failed to communicate with CodeCat:', err);
      setError(err.message || 'Failed to get a response from CodeCat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation history with CodeCat?')) return;
    try {
      await codeCatService.deleteConversation(convId);
      if (activeConversationId === convId) {
        startNewChat();
      }
      loadConversations();
    } catch (err) {
      alert(err.message || 'Failed to delete conversation');
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredConversations = conversations.filter(c => 
    !searchFilter || c.title?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner (Frosted Hero Glass) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-indigo-950/90 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-indigo-950/95 backdrop-blur-xl border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-3xl shadow-inner shrink-0 backdrop-blur-md">
              🐱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  CodeCat<span className="text-amber-400">.</span>
                </h1>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wider backdrop-blur-xs">
                  AI Companion
                </span>
              </div>
              <p className="text-slate-300 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                Your smart, supportive coding buddy for Logic Building &amp; DSA Mastery
              </p>
            </div>
          </div>

          {/* Service Status and AI Model pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/15 dark:border-slate-800 text-xs flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${serviceStatus?.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-slate-200">
                {serviceStatus?.hasApiKey 
                  ? (serviceStatus?.provider || 'Google Gemini')
                  : 'AI Provider (Key Required on Server)'}
              </span>
            </div>

            <button
              onClick={startNewChat}
              className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Discussion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Conversations History */}
        <div className="lg:col-span-4 glass-panel-strong rounded-3xl overflow-hidden flex flex-col h-[700px] transition-colors">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">Discussions History</h2>
            </div>
            <button
              onClick={startNewChat}
              className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Start New Discussion"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs glass-input rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 dark:text-slate-500 text-xs">
                <p>No discussions found.</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">Ask CodeCat any Logic or DSA question to start!</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = activeConversationId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`group w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-500/15 dark:bg-blue-950/40 border-blue-400/40 text-blue-900 dark:text-blue-200 shadow-2xs backdrop-blur-xs'
                        : 'border-transparent hover:bg-white/40 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs truncate flex-1">
                        {conv.title}
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all rounded-lg cursor-pointer"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        conv.category === 'DSA'
                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                          : conv.category === 'LOGIC'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'glass-panel-subtle text-slate-600 dark:text-slate-400'
                      }`}>
                        {conv.category}
                      </span>
                      <span>•</span>
                      <span>{conv.messageCount || 0} messages</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Context Attachment Tray at bottom of sidebar */}
          <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 glass-panel-subtle">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                Problem Context
              </span>
              {problemContext && (
                <button
                  onClick={() => setProblemContext(null)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-700 text-[10px] font-bold cursor-pointer"
                >
                  Detach
                </button>
              )}
            </div>

            {problemContext ? (
              <div className="p-2.5 glass-panel-interactive rounded-xl border-blue-400/40 space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {problemContext.title}
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="px-1.5 py-0.2 rounded-full font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    {problemContext.category}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{problemContext.topic}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{problemContext.language || 'Java'}</span>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setShowProblemSelector(!showProblemSelector)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all glass-panel-interactive cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Solved Problem</span>
                </button>

                {showProblemSelector && (
                  <div className="mt-2 p-2 glass-panel-strong rounded-2xl shadow-xl max-h-40 overflow-y-auto space-y-1 border border-white/20">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Select Problem</p>
                    {userProblems.length === 0 ? (
                      <p className="text-xs text-slate-400 p-1">No solved problems recorded yet.</p>
                    ) : (
                      userProblems.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setProblemContext({
                              title: p.title,
                              category: p.category,
                              topic: p.topic,
                              difficulty: p.difficulty,
                              language: p.programmingLanguage,
                              problemUrl: p.problemUrl
                            });
                            setShowProblemSelector(false);
                          }}
                          className="w-full text-left p-1.5 text-xs rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200 truncate flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium truncate">{p.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{p.difficulty}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Main Chat Panel */}
        <div className="lg:col-span-8 glass-panel-strong rounded-3xl flex flex-col h-[700px] overflow-hidden transition-colors">
          
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4 glass-panel-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-lg backdrop-blur-xs">
                🐱
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>CodeCat Companion</span>
                  {activeConversationId && (
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                      (Chat #{activeConversationId})
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {problemContext 
                    ? `Discussing: ${problemContext.title} (${problemContext.category} • ${problemContext.topic})`
                    : 'Ask anything about logic patterns, algorithms, or debug snippets'}
                </p>
              </div>
            </div>

            {problemContext && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-400/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold backdrop-blur-xs">
                <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {problemContext.title}
              </span>
            )}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              /* Empty / Welcome State */
              <div className="max-w-xl mx-auto py-8 text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 text-slate-900 dark:text-amber-300 flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
                  🐾
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Welcome to CodeCat!
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    I'm your dedicated coding buddy sitting beside you. Whether you're building loop logic, mastering Two Pointers, or debugging a tricky recursion, I'll guide you step-by-step!
                  </p>
                </div>

                {/* Capability Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 rounded-2xl glass-panel-interactive">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
                      <Lightbulb className="w-4 h-4" />
                      <span>Logic Building</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Fibonacci, Armstrong, Palindromes, Prime numbers, loop &amp; condition flow.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel-interactive">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>DSA Patterns</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Two Pointers, Sliding Window, Binary Search, Trees, Graphs, Dynamic Programming.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel-interactive">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
                      <Bug className="w-4 h-4" />
                      <span>Code Debugging</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Paste your code and uncover exact logical bugs, edge-case failures, and clean fixes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel-interactive">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Big-O Complexity</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Deep-dive into Time &amp; Space Big-O complexity with mathematical reasoning.
                    </p>
                  </div>
                </div>

                {/* Starter Prompts */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Try a Quick Prompt Starter
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_PROMPTS.slice(0, 4).map((qp, idx) => {
                      const Icon = qp.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qp.prompt)}
                          className="px-3.5 py-1.5 rounded-xl glass-panel-interactive text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{qp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((msg, idx) => {
                const isUser = msg.role === 'USER';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-2xs">
                        🐱
                      </div>
                    )}

                    <div className={`space-y-1.5 max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Message author badge */}
                      <div className="flex items-center gap-2 px-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        <span>{isUser ? 'You' : 'CodeCat'}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'glass-panel-strong text-slate-800 dark:text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        {/* Attached problem context tag inside user message */}
                        {isUser && msg.problemContext && msg.problemContext.title && (
                          <div className="mb-2 pb-2 border-b border-blue-500/50 text-[11px] font-medium text-blue-100 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Context: <strong>{msg.problemContext.title}</strong> ({msg.problemContext.category} • {msg.problemContext.language || 'Java'})</span>
                          </div>
                        )}

                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert text-slate-800 dark:text-slate-100 prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-code:bg-slate-200/60 dark:prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-700 dark:prose-code:text-indigo-300 prose-pre:bg-slate-900/90 prose-pre:text-slate-100">
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const rawCode = String(children).replace(/\n$/, '');
                                  if (!inline && (match || rawCode.includes('\n'))) {
                                    const lang = match ? match[1] : 'code';
                                    const snippetId = `${idx}-${lang}`;
                                    return (
                                      <div className="my-3 rounded-2xl overflow-hidden bg-slate-900/90 text-slate-100 shadow-md border border-white/10">
                                        <div className="px-3.5 py-1.5 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800">
                                          <span className="font-bold uppercase text-slate-300">{lang}</span>
                                          <button
                                            onClick={() => copyToClipboard(rawCode, snippetId)}
                                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer"
                                            title="Copy snippet"
                                          >
                                            {copiedIndex === snippetId ? (
                                              <>
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-emerald-400 font-sans">Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span className="font-sans">Copy</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                        <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed bg-slate-900/80 m-0">
                                          <code>{children}</code>
                                        </pre>
                                      </div>
                                    );
                                  }
                                  return (
                                    <code className="bg-slate-200/60 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded font-mono text-xs" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-2xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                  🐱
                </div>
                <div className="glass-panel-subtle rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-medium">CodeCat is thinking &amp; formatting guidance...</span>
                </div>
              </div>
            )}

            {/* Friendly CodeCat Service Unavailable Card */}
            {error && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 text-slate-800 dark:text-slate-200 text-xs space-y-2 backdrop-blur-md">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>CodeCat AI Companion Unavailable</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {error}
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-amber-500/20 flex items-center justify-between">
                  <span>AI credentials remain strictly protected on the backend server.</span>
                  <button 
                    onClick={() => setError(null)}
                    className="text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips (Always available right above the input) */}
          <div className="px-4 py-2 border-t border-slate-200/60 dark:border-slate-800/60 glass-panel-subtle flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
                className="px-2.5 py-1 rounded-xl glass-panel-interactive text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 whitespace-nowrap transition-all disabled:opacity-50 cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Optional Code Snippet Input Drawer */}
          {showCodeInput && (
            <div className="p-3 bg-slate-900/90 backdrop-blur-md border-t border-white/10 text-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">Attached Code Snippet</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={snippetLanguage}
                    onChange={(e) => setSnippetLanguage(e.target.value)}
                    className="bg-slate-800/80 text-slate-200 text-xs rounded-xl px-2.5 py-1 border border-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Go">Go</option>
                  </select>
                  <button
                    onClick={() => {
                      setShowCodeInput(false);
                      setCodeSnippet('');
                    }}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste your Java / Python / C++ code here to analyze or debug..."
                rows={4}
                className="w-full font-mono text-xs bg-slate-950/80 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed resize-none"
              />
            </div>
          )}

          {/* Input Box Area */}
          <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 glass-panel-subtle">
            <div className="flex items-end gap-2 glass-panel-subtle rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <button
                type="button"
                onClick={() => setShowCodeInput(!showCodeInput)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  showCodeInput || codeSnippet.trim()
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700'
                }`}
                title="Attach or edit code snippet"
              >
                <Code2 className="w-4 h-4" />
              </button>

              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask CodeCat anything... (e.g., 'How do I solve Armstrong Number in Java?' or 'Identify the pattern')"
                rows={2}
                disabled={loading}
                className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:outline-none resize-none py-1.5 px-2"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1">
              <span>Press <kbd className="px-1.5 py-0.5 glass-panel-subtle rounded-md font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 glass-panel-subtle rounded-md font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
              <span>CodeCat AI Companion • Server-Side Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

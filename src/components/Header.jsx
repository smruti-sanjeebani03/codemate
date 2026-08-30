import React, { useState, useRef, useEffect } from 'react';
import { 
  Code2, 
  Flame, 
  Target, 
  Bot, 
  Layers, 
  Settings, 
  User, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X,
  Cpu,
  Zap,
  LogIn,
  Home,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';

export const Header = ({ activeRoute, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Flame, badge: null },
    { id: 'problems', label: 'Problems', icon: Layers, badge: null },
    { id: 'codecat', label: 'CodeCat AI', icon: Bot, badge: 'AI Buddy' },
    { id: 'settings', label: 'Profile & Settings', icon: Settings, badge: null },
    { id: 'verifier', label: 'Test Verifier', icon: Cpu, badge: 'Part 1-7' },
  ];

  return (
    <header className="glass-header sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800/90 text-white flex items-center justify-center font-black text-sm shadow-sm ring-1 ring-white/10 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-all duration-200 group-hover:scale-105">
              <Code2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  CodeMate<span className="text-blue-600 dark:text-blue-400">.</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden md:inline">
                  Companion
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center p-1 rounded-2xl glass-panel-subtle space-x-1">
            {/* Quick Home Link */}
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeRoute === 'home'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
              }`}
              title="View Public Homepage"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id || (item.id === 'problems' && activeRoute === 'problems-new');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? item.id === 'codecat'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-400/40'
                        : 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100/90 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Section: Theme Toggle + User Pill / Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Selector Toggle (Light / Dark / System) */}
          <ThemeSelector variant="compact" showLabels={false} />

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
              >
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'user')}`}
                  alt={user?.name || 'User'}
                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 object-cover"
                />
                <span className="hidden sm:inline font-bold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel-strong py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-slate-200/50 dark:border-slate-800/60">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{user?.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{user?.email}</div>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        user?.authProvider === 'GOOGLE' 
                          ? 'bg-purple-100/80 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' 
                          : 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                      }`}>
                        {user?.authProvider === 'GOOGLE' ? 'Google Auth' : 'Email/Password'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('home');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      <Home className="w-3.5 h-3.5 text-slate-400" />
                      <span>Public Homepage</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Dashboard &amp; Streaks</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Profile &amp; Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('codecat');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-500" />
                      <span>CodeCat AI Companion</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 glass-pill"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60 glass-panel-strong px-4 py-3 space-y-1 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeRoute === 'home'
                ? 'bg-slate-100/90 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4" />
              <span>Public Homepage</span>
            </div>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id || (item.id === 'problems' && activeRoute === 'problems-new');
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? item.id === 'codecat'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-900 dark:bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

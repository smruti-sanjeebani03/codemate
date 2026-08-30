import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dashboardService } from '../services/dashboardService';
import { 
  User, 
  Settings, 
  Target, 
  Flame, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Mail, 
  Calendar, 
  KeyRound, 
  Bot, 
  Layers,
  Code2,
  Zap,
  Sun,
  Moon,
  Laptop,
  Camera,
  Image as ImageIcon,
  Upload,
  Edit3,
  Save,
  RotateCcw,
  Check,
  Palette,
  Eye,
  Link,
  Trash2
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

// Curated high-res cover background presets
const COVER_PRESETS = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    accent: '#6366f1'
  },
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    accent: '#8b5cf6'
  },
  {
    id: 'sunset-terminal',
    name: 'Sunset Terminal',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    accent: '#f59e0b'
  },
  {
    id: 'minimal-slate',
    name: 'Minimal Slate',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    accent: '#64748b'
  },
  {
    id: 'geometric-indigo',
    name: 'Geometric Grid',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    accent: '#3b82f6'
  },
  {
    id: 'aurora-emerald',
    name: 'Aurora Emerald',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    accent: '#10b981'
  }
];

// Curated avatar seeds & styles for quick developer avatar picking
const AVATAR_PRESETS = [
  { id: 'bot-1', label: 'Bot Alpha', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=alpha' },
  { id: 'bot-2', label: 'Bot Alex', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex' },
  { id: 'bot-3', label: 'Cyber Cat', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=codecat' },
  { id: 'bot-4', label: 'Matrix Byte', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=matrix' },
  { id: 'dev-1', label: 'Dev Nova', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nova' },
  { id: 'dev-2', label: 'Dev Felix', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { id: 'dev-3', label: 'Dev Maya', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya' },
  { id: 'dev-4', label: 'Pixel Pro', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=codemate' },
];

const SUGGESTED_BIO_TAGS = [
  '💻 Full-Stack Software Engineer',
  '🚀 Solving 3 DSA problems daily',
  '🧠 Mastering Trees, Graphs & DP',
  '⚡ Java & Python enthusiast',
  '🎯 Preparing for FAANG interviews',
  '🔥 Maintaining daily coding streak'
];

export function ProfileSettingsView({ onTargetUpdated, onNavigateToCodeCat, onNavigateToDashboard }) {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'

  // Profile Form States
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatarUrl || '');
  const [coverUrlInput, setCoverUrlInput] = useState(user?.coverUrl || '');

  // UI Modals & Pickers
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Status & Feedback
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Daily Target States
  const [dailyTarget, setDailyTarget] = useState(3);
  const [customTarget, setCustomTarget] = useState('');
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetSuccess, setTargetSuccess] = useState(null);
  const [targetError, setTargetError] = useState(null);

  const [companionTone, setCompanionTone] = useState('PROGRESSIVE_HINTS');
  const [confirmLogout, setConfirmLogout] = useState(false);

  const coverFileInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  // Sync state whenever user profile data changes
  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setBioInput(user.bio || '');
      setAvatarUrlInput(user.avatarUrl || '');
      setCoverUrlInput(user.coverUrl || '');
    }
  }, [user]);

  // Load existing target from backend
  useEffect(() => {
    let isMounted = true;
    async function loadTarget() {
      try {
        const res = await dashboardService.getDailyTarget();
        if (isMounted && res && typeof res.dailyTarget === 'number') {
          setDailyTarget(res.dailyTarget);
        }
      } catch (err) {
        console.warn('Failed to load daily target in settings:', err);
      }
    }
    loadTarget();
    return () => { isMounted = false; };
  }, [user]);

  // Handle Cover Photo File Upload
  const handleCoverFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Cover image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (typeof dataUrl === 'string') {
        setCoverUrlInput(dataUrl);
        setShowCoverModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Avatar Photo File Upload
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Avatar image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (typeof dataUrl === 'string') {
        setAvatarUrlInput(dataUrl);
        setShowAvatarModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    if (!nameInput.trim()) {
      setProfileError('Display Name cannot be empty.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      if (updateProfile) {
        await updateProfile({
          name: nameInput.trim(),
          bio: bioInput.trim(),
          avatarUrl: avatarUrlInput || undefined,
          coverUrl: coverUrlInput || undefined
        });
      }
      setProfileSuccess('Profile updated successfully! All changes have been saved.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Reset/Discard Profile Changes
  const handleResetProfile = () => {
    if (user) {
      setNameInput(user.name || '');
      setBioInput(user.bio || '');
      setAvatarUrlInput(user.avatarUrl || '');
      setCoverUrlInput(user.coverUrl || '');
    }
    setProfileError(null);
    setProfileSuccess(null);
  };

  // Has unsaved changes check
  const hasUnsavedChanges = 
    nameInput !== (user?.name || '') ||
    bioInput !== (user?.bio || '') ||
    avatarUrlInput !== (user?.avatarUrl || '') ||
    coverUrlInput !== (user?.coverUrl || '');

  // Handle Daily Target Update
  const handleUpdateTarget = async (newVal) => {
    const val = Number(newVal);
    if (isNaN(val) || val < 1 || val > 100) {
      setTargetError('Daily target must be an integer between 1 and 100');
      return;
    }

    setIsSavingTarget(true);
    setTargetError(null);
    setTargetSuccess(null);

    try {
      const res = await dashboardService.updateDailyTarget(val);
      setDailyTarget(res.dailyTarget || val);
      setTargetSuccess(`Daily target updated to ${val} problems/day!`);
      if (onTargetUpdated) {
        onTargetUpdated(val);
      }
      setTimeout(() => setTargetSuccess(null), 4000);
    } catch (err) {
      setTargetError(err.message || 'Failed to update daily target');
    } finally {
      setIsSavingTarget(false);
    }
  };

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Active Member';

  // Fallback default cover
  const activeCoverUrl = coverUrlInput || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  const activeAvatarUrl = avatarUrlInput || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'codemate')}`;

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. HERO COVER PAGE & PROFILE SHOWCASE BANNER */}
      {/* ========================================================================= */}
      <div className="glass-panel-strong rounded-3xl overflow-hidden transition-colors">
        
        {/* Cover Image Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-950 overflow-hidden group">
          <img
            src={activeCoverUrl}
            alt="Profile Cover Page"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
            onError={(e) => {
              e.currentTarget.src = COVER_PRESETS[0].url;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

          {/* Cover Edit Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowCoverModal(true)}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl backdrop-blur-md text-xs font-bold transition-all flex items-center gap-2 border border-white/20 shadow-lg cursor-pointer hover:border-white/40"
              title="Change Cover Image"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Cover</span>
            </button>
          </div>

          {/* Cover Label / Theme Indicator */}
          <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md text-white/80 rounded-xl text-[11px] font-mono border border-white/10">
            <Palette className="w-3 h-3 text-amber-400" />
            <span>Custom Cover Page</span>
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            
            {/* Avatar & User Details */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              
              {/* Avatar with Camera Trigger */}
              <div className="relative group self-start">
                <img
                  src={activeAvatarUrl}
                  alt={nameInput || user?.name || 'User'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 object-cover shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'user')}`;
                  }}
                />
                
                {/* Change Avatar Button */}
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-1 right-1 p-2 bg-slate-900 text-white hover:bg-blue-600 rounded-xl shadow-md border-2 border-white dark:border-slate-900 transition-all cursor-pointer group-hover:scale-110"
                  title="Change Profile Picture"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Active Session" />
              </div>

              {/* Names & Badges */}
              <div className="space-y-1.5 pt-2 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {nameInput || user?.name || 'CodeMate User'}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    user?.authProvider === 'GOOGLE' 
                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30' 
                      : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                  }`}>
                    {user?.authProvider === 'GOOGLE' ? 'Google Auth' : 'Email Account'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{user?.email || 'user@codemate.dev'}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Joined {formattedDate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Navigation Tabs & Sign Out */}
            <div className="flex items-center gap-2 self-start sm:self-end pt-2 sm:pt-0">
              <div className="flex glass-panel-subtle p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-xs backdrop-blur-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-xs backdrop-blur-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Preferences</span>
                </button>
              </div>

              <button
                onClick={() => setConfirmLogout(true)}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* User Bio Preview on Header */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {bioInput || user?.bio || (
                <span className="italic text-slate-400 dark:text-slate-500">
                  No bio added yet. Click &quot;Edit Profile Details&quot; below to share your coding background, targets, and favorite languages.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Update Feedback Banners */}
      {profileSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 shadow-xs backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{profileSuccess}</span>
          </div>
          <button onClick={() => setProfileSuccess(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {profileError && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300 shadow-xs backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">{profileError}</span>
          </div>
          <button onClick={() => setProfileError(null)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE MANAGEMENT & CUSTOMIZATION */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols): Edit Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Edit Profile Card */}
            <div className="glass-panel-strong rounded-3xl p-6 space-y-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    <span>Edit Profile Details</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize your display name, bio, profile picture, and cover page.
                  </p>
                </div>

                {hasUnsavedChanges && (
                  <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-full text-[10px] font-bold animate-pulse backdrop-blur-xs">
                    Unsaved Changes
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* 1. Display Name Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Full Display Name</span>
                    <span className="text-[10px] text-slate-400 font-mono">{nameInput.length}/60 chars</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={60}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl glass-input text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* 2. Bio Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Bio &amp; Coding Interests</span>
                    <span className="text-[10px] text-slate-400 font-mono">{bioInput.length}/300 chars</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Tell your coding story (e.g., Full-stack engineer solving DSA problems daily | Mastering Dynamic Programming & Graph algorithms)..."
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-2xl glass-input text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden transition-all resize-none leading-relaxed"
                  />

                  {/* Suggested Bio Quick-Chips */}
                  <div className="pt-1">
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-1.5">
                      Quick Ideas:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_BIO_TAGS.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!bioInput) {
                              setBioInput(tag);
                            } else if (!bioInput.includes(tag)) {
                              setBioInput(prev => `${prev} • ${tag}`.slice(0, 300));
                            }
                          }}
                          className="px-2.5 py-1 glass-panel-interactive text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-xl text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Quick Visual Asset Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Avatar Picker Card */}
                  <div className="p-4 rounded-2xl glass-panel-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        <span>Profile Picture</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAvatarModal(true)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={activeAvatarUrl}
                        alt="Avatar preview"
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 object-cover shadow-xs"
                      />
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        Choose from developer avatars or upload your own picture.
                      </div>
                    </div>
                  </div>

                  {/* Cover Page Picker Card */}
                  <div className="p-4 rounded-2xl glass-panel-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>Cover Page Banner</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCoverModal(true)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Change Cover
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={activeCoverUrl}
                        alt="Cover preview"
                        className="w-16 h-10 rounded-xl bg-slate-900 border border-slate-200 dark:border-slate-600 object-cover shadow-xs"
                      />
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        Select curated coding themes or upload a custom hero banner.
                      </div>
                    </div>
                  </div>

                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    disabled={!hasUnsavedChanges || isSavingProfile}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Changes</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingProfile || !nameInput.trim()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Security & Data Privacy Card */}
            <div className="glass-panel-strong rounded-3xl p-6 space-y-4 transition-colors">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Security &amp; Data Isolation Safeguards</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-900 dark:text-emerald-300">Strict User Isolation</div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                      All coding logs, streaks, and CodeCat sessions are isolated per authenticated user via server-side verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-900 dark:text-blue-300">Protected API Credentials</div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400/90 mt-0.5">
                      Gemini API keys, JWT secrets, and database credentials remain strictly within server environment variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1 Col): Account Summary & Test Switcher */}
          <div className="space-y-6">
            
            {/* Account Info Details */}
            <div className="glass-panel-strong rounded-3xl p-6 space-y-4 transition-colors">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Account Summary</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl glass-panel-subtle">
                  <div className="text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Display Name</div>
                  <div className="font-bold text-slate-900 dark:text-white">{user?.name || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-2xl glass-panel-subtle">
                  <div className="text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Email Address</div>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">{user?.email || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-2xl glass-panel-subtle">
                  <div className="text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Authentication Provider</div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{user?.authProvider === 'GOOGLE' ? 'Google OAuth (Verified)' : 'Email + BCrypt Encrypted'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl glass-panel-subtle">
                  <div className="text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Member Since</div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feature Navigation */}
            <div className="glass-panel-strong rounded-3xl p-6 space-y-3 transition-colors">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Quick Actions</span>
              </h3>

              <div className="space-y-2">
                {onNavigateToDashboard && (
                  <button
                    onClick={onNavigateToDashboard}
                    className="w-full p-3 rounded-2xl glass-panel-interactive hover:text-blue-700 dark:hover:text-blue-400 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>View My Dashboard</span>
                    </span>
                    <span>→</span>
                  </button>
                )}

                {onNavigateToCodeCat && (
                  <button
                    onClick={onNavigateToCodeCat}
                    className="w-full p-3 rounded-2xl glass-panel-interactive hover:text-amber-900 dark:hover:text-amber-300 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-amber-600" />
                      <span>Chat with CodeCat AI</span>
                    </span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SETTINGS & PREFERENCES */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          
          {/* Appearance & Theme Preference */}
          <div className="glass-panel-strong rounded-3xl p-6 space-y-4 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sun className="w-5 h-5 text-indigo-500" />
                  <span>Theme &amp; Appearance</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose between Light, Dark, or System mode. System mode automatically matches your operating system theme preference.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <ThemeSelector />
            </div>
          </div>

          {/* Daily Target Setting */}
          <div className="glass-panel-strong rounded-3xl p-6 space-y-5 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  <span>Daily Coding Target</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Set how many coding problems you commit to solving every single day. This drives your daily target progress bar and streak completion.
                </p>
              </div>

              <span className="px-3.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-full font-mono text-sm font-black backdrop-blur-xs">
                {dailyTarget} / day
              </span>
            </div>

            {targetSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 backdrop-blur-md animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{targetSuccess}</span>
              </div>
            )}

            {targetError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300 backdrop-blur-md animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{targetError}</span>
              </div>
            )}

            {/* Target Options */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Target Selection:</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 5, 10].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleUpdateTarget(t)}
                    disabled={isSavingTarget}
                    className={`py-3 px-4 rounded-2xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      dailyTarget === t
                        ? 'border-amber-400 bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40 shadow-xs backdrop-blur-xs'
                        : 'glass-panel-interactive text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-base font-black font-mono">{t}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t === 1 ? 'problem' : 'problems'}</span>
                  </button>
                ))}
              </div>

              {/* Custom Target Input */}
              <div className="pt-3 flex items-center gap-3 max-w-sm">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder="Custom target (1-100)"
                  className="flex-1 px-3.5 py-2 text-xs rounded-2xl glass-input text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-hidden"
                />
                <button
                  onClick={() => {
                    if (customTarget) {
                      handleUpdateTarget(customTarget);
                      setCustomTarget('');
                    }
                  }}
                  disabled={isSavingTarget || !customTarget}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-40 shadow-sm cursor-pointer"
                >
                  {isSavingTarget ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Set Custom'}
                </button>
              </div>
            </div>
          </div>

          {/* CodeCat Companion Guidance Mode */}
          <div className="glass-panel-strong rounded-3xl p-6 space-y-4 transition-colors">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>CodeCat AI Guidance Mode</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize CodeCat&apos;s pedagogical interaction style for your practice sessions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => setCompanionTone('PROGRESSIVE_HINTS')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  companionTone === 'PROGRESSIVE_HINTS'
                    ? 'border-blue-400 bg-blue-500/20 text-blue-950 dark:text-blue-200 ring-2 ring-blue-400/40 backdrop-blur-xs'
                    : 'glass-panel-interactive text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs mb-1">Progressive Hinting (Default)</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Offers small nudge-hints first, revealing full solution only if stuck.
                </p>
              </button>

              <button
                onClick={() => setCompanionTone('SOCRATIC')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  companionTone === 'SOCRATIC'
                    ? 'border-blue-400 bg-blue-500/20 text-blue-950 dark:text-blue-200 ring-2 ring-blue-400/40 backdrop-blur-xs'
                    : 'glass-panel-interactive text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs mb-1">Socratic Inquirer</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Asks guiding questions to help you derive data structures independently.
                </p>
              </button>

              <button
                onClick={() => setCompanionTone('COMPLEXITY')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  companionTone === 'COMPLEXITY'
                    ? 'border-blue-400 bg-blue-500/20 text-blue-950 dark:text-blue-200 ring-2 ring-blue-400/40 backdrop-blur-xs'
                    : 'glass-panel-interactive text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs mb-1">Complexity &amp; Big-O Focus</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Prioritizes optimal Time &amp; Space Big-O tradeoffs and edge cases.
                </p>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="glass-panel-strong rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Sign Out of Session</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Clear JWT tokens and safely exit this browser session.</div>
            </div>

            <button
              onClick={() => setConfirmLogout(true)}
              className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CHANGE COVER PAGE BANNER */}
      {/* ========================================================================= */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel-strong rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  <span>Choose Cover Page Banner</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a curated theme, enter an image URL, or upload from device.
                </p>
              </div>
              <button
                onClick={() => setShowCoverModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Curated Themes:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCoverUrlInput(preset.url);
                      setShowCoverModal(false);
                    }}
                    className={`relative h-20 rounded-2xl overflow-hidden border-2 text-left group transition-all cursor-pointer ${
                      coverUrlInput === preset.url
                        ? 'border-blue-500 ring-2 ring-blue-400/40'
                        : 'border-transparent hover:border-slate-400/40'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[11px] font-bold text-white leading-none truncate">
                        {preset.name}
                      </span>
                    </div>
                    {coverUrlInput === preset.url && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input & Upload Row */}
            <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Or Custom Image:</div>
              
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="Paste direct image URL (https://...)"
                  className="flex-1 px-3.5 py-2 text-xs rounded-2xl glass-input text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customCoverUrl.trim()) {
                      setCoverUrlInput(customCoverUrl.trim());
                      setCustomCoverUrl('');
                      setShowCoverModal(false);
                    }
                  }}
                  disabled={!customCoverUrl.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  Apply
                </button>
              </div>

              {/* Device File Upload */}
              <div className="flex items-center justify-between pt-1">
                <input
                  type="file"
                  ref={coverFileInputRef}
                  onChange={handleCoverFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-4 py-2 glass-panel-interactive text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  <span>Upload Image from Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCoverUrlInput(COVER_PRESETS[0].url);
                    setShowCoverModal(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHANGE AVATAR / PROFILE PICTURE */}
      {/* ========================================================================= */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel-strong rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <span>Choose Profile Picture</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick a developer avatar, upload a photo, or paste an image URL.
                </p>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Developer Avatars:</div>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrlInput(preset.url);
                      setShowAvatarModal(false);
                    }}
                    className={`flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer group ${
                      avatarUrlInput === preset.url
                        ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-400/40'
                        : 'glass-panel-subtle hover:border-slate-400/40'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-12 h-12 rounded-xl object-cover bg-white dark:bg-slate-900 group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1.5 truncate max-w-full text-center">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input & Upload Row */}
            <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Or Custom Photo URL:</div>
              
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="Paste avatar URL (https://...)"
                  className="flex-1 px-3.5 py-2 text-xs rounded-2xl glass-input text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl.trim()) {
                      setAvatarUrlInput(customAvatarUrl.trim());
                      setCustomAvatarUrl('');
                      setShowAvatarModal(false);
                    }
                  }}
                  disabled={!customAvatarUrl.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-40 shadow-sm cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Device File Upload */}
              <div className="flex items-center justify-between pt-1">
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  onChange={handleAvatarFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="px-4 py-2 glass-panel-interactive text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  <span>Upload from Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrlInput(`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'user')}`);
                    setShowAvatarModal(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LOGOUT CONFIRMATION */}
      {/* ========================================================================= */}
      {confirmLogout && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel-strong rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Sign Out of CodeMate?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your session token will be cleared and you will return to the public homepage.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmLogout(false);
                  logout();
                }}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

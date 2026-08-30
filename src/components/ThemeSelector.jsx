import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeSelector({ variant = 'compact', showLabels = true, className = '' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      ariaLabel: 'Select Light theme',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      ariaLabel: 'Select Dark theme',
    },
    {
      id: 'system',
      label: 'System',
      icon: Laptop,
      ariaLabel: 'Select System theme',
    },
  ];

  // Segmented control variant (useful for settings / mobile / drawer)
  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className={`inline-flex items-center p-1 rounded-2xl glass-panel-subtle ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={opt.ariaLabel}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs ring-1 ring-slate-200/50 dark:ring-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected && opt.id === 'light' ? 'text-amber-500' : isSelected && opt.id === 'dark' ? 'text-blue-400' : ''}`} />
              {showLabels && <span>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown / Compact Button variant (fits header and navbar)
  const CurrentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;
  const currentLabel = options.find((o) => o.id === theme)?.label || 'System';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme: ${currentLabel}. Click to switch theme`}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer focus:outline-none"
      >
        <CurrentIcon className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : theme === 'dark' ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
        {showLabels && <span className="hidden sm:inline">{currentLabel}</span>}
        <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Theme options"
          className="absolute right-0 mt-1.5 w-36 rounded-2xl glass-panel-strong py-1.5 z-50 animate-in fade-in zoom-in-95"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200/50 dark:border-slate-800/50 mb-1">
            Appearance
          </div>

          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${opt.id === 'light' ? 'text-amber-500' : opt.id === 'dark' ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

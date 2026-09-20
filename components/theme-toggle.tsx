'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface ThemeToggleProps {
  className?: string;
}

const emptySubscribe = () => () => {};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      id="theme-mode-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 cursor-pointer select-none group border shrink-0 ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-amber-300 shadow-xs shadow-amber-500/10 hover:border-amber-400/40'
          : 'bg-white/80 hover:bg-white border-slate-200/90 text-slate-700 hover:text-indigo-600 shadow-xs hover:border-indigo-300'
      } ${className}`}
    >
      <div className="relative w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {/* Sun Icon (Visible in dark mode or transitioning) */}
        <Sun
          className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 absolute transition-all duration-300 transform ${
            isDark
              ? 'scale-100 rotate-0 opacity-100 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
              : 'scale-0 -rotate-90 opacity-0 text-slate-700'
          }`}
        />

        {/* Moon Icon (Visible in light mode or transitioning) */}
        <Moon
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 absolute transition-all duration-300 transform ${
            isDark
              ? 'scale-0 rotate-90 opacity-0 text-amber-400'
              : 'scale-100 rotate-0 opacity-100 text-slate-700 group-hover:text-indigo-600'
          }`}
        />
      </div>

      {/* Screen reader label */}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
};

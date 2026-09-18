'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ShieldCheck, Layers, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';

interface NavbarProps {
  onOpenSubmit: () => void;
  totalProducts: number;
  onOpenSeoInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmit,
  totalProducts,
  onOpenSeoInfo,
}) => {
  const { user, isLoading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = (user?.email?.[0] || user?.user_metadata?.full_name?.[0] || 'U').toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8">
      <div className="liquid-glass rounded-2xl px-4 py-3 sm:px-6 flex items-center justify-between gap-4 transition-all">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 text-white shadow-md shadow-indigo-900/10 dark:shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <Layers className="w-5 h-5 text-indigo-200" />
            <div className="absolute inset-0 rounded-xl bg-white/10 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                Deepchill
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                Directory ({totalProducts})
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">
              High-authority launchpad &amp; SEO backlinks for makers
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backlink SEO Perks modal trigger */}
          <button
            id="nav-seo-guide-btn"
            onClick={onOpenSeoInfo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs"
            title="Learn how our DoFollow backlinks boost your website's domain authority"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>SEO &amp; Backlinks</span>
          </button>

          {/* Color Mode Switcher */}
          <ThemeToggle />

          {/* User Authentication Status */}
          {!isLoading && (
            <>
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs"
                    title={user.email || 'User Account'}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover border border-indigo-200 dark:border-indigo-800"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {userInitial}
                      </div>
                    )}
                    <span className="hidden md:inline-block text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[110px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 liquid-glass rounded-2xl border border-white/80 dark:border-white/10 shadow-xl py-2 z-50 animate-fadeIn">
                      <div className="px-3.5 py-2 border-b border-slate-200/60 dark:border-slate-800/60">
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          Signed in as
                        </p>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onOpenSubmit();
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Submit New Project</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        <button
                          onClick={async () => {
                            setDropdownOpen(false);
                            await signOut();
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs"
                >
                  <LogIn className="w-4 h-4 text-indigo-500" />
                  <span>Sign In</span>
                </Link>
              )}
            </>
          )}

          {/* Submit Project Button */}
          <button
            id="nav-submit-project-btn"
            onClick={onOpenSubmit}
            className="liquid-btn-primary flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};

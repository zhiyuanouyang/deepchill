'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Plus,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  LayoutGrid,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';

interface NavbarProps {
  onOpenSubmit: () => void;
  totalProducts?: number;
  onOpenSeoInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmit,
  onOpenSeoInfo,
}) => {
  const { user, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdown or mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userInitial = (
    user?.email?.[0] ||
    user?.user_metadata?.full_name?.[0] ||
    'U'
  ).toUpperCase();
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header
      ref={headerRef}
      className="sticky top-2 sm:top-3 md:top-4 z-40 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 mb-3 sm:mb-6"
    >
      <div className="liquid-glass rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 border border-white/80 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/20 transition-all overflow-hidden">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
          {/* Brand / Logo */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 min-w-0"
          >
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl overflow-hidden shadow-sm shadow-indigo-950/10 dark:shadow-indigo-500/20 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo.svg"
                alt="Deepchill Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight text-slate-900 dark:text-white truncate block">
                Deepchill
              </span>
              <p className="hidden xl:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Launchpad &amp; SEO backlinks for makers
              </p>
            </div>
          </Link>

          {/* Center Nav Links (Visible on large screens >= 1024px to prevent overflow on medium screens) */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                pathname === '/'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Directory
            </Link>
            <Link
              href="/categories"
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                pathname === '/categories'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              Categories
            </Link>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Backlink SEO Perks modal trigger (Extra large screens only) */}
            <button
              id="nav-seo-guide-btn"
              onClick={onOpenSeoInfo}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs"
              title="Learn how our DoFollow backlinks boost your website's domain authority"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>SEO &amp; Backlinks</span>
            </button>

            {/* Color Mode Switcher */}
            <ThemeToggle />

            {/* User Authentication Status */}
            {isLoading ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-16 md:h-8 rounded-lg sm:rounded-xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 p-1 sm:px-2 sm:py-1 md:px-2.5 md:py-1.5 rounded-lg sm:rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs shrink-0"
                  title={user.email || 'User Account'}
                  aria-label="User Account Menu"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-indigo-200 dark:border-indigo-800 shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-xs shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden xl:inline-block text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 transition-transform hidden sm:inline-block shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 liquid-glass rounded-2xl border border-white/80 dark:border-white/10 shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-3.5 py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
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
                        <Plus className="w-3.5 h-3.5" />
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
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs shrink-0"
                title="Sign In"
                aria-label="Sign In"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Submit Project Button (Responsive: icon-only on < 380px, 'Submit' on 380px-639px, 'Submit Project' on >= 640px) */}
            <button
              id="nav-submit-project-btn"
              onClick={onOpenSubmit}
              className="liquid-btn-primary flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 md:px-3.5 md:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white cursor-pointer shadow-md shrink-0 whitespace-nowrap"
              title="Submit Project"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Submit Project</span>
              <span className="hidden min-[380px]:inline sm:hidden">Submit</span>
            </button>

            {/* Mobile / Tablet Menu Hamburger Toggle (shown on screens < 1024px) */}
            <button
              id="nav-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs shrink-0"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-200" />
              ) : (
                <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  pathname === '/'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Directory Home</span>
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  pathname === '/categories'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>All Categories</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSeoInfo();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>SEO &amp; DoFollow Backlinks Guide</span>
              </button>
            </nav>

            {/* Quick Mobile Submit Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSubmit();
              }}
              className="liquid-btn-primary flex items-center justify-center gap-2 w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md cursor-pointer mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Project</span>
            </button>

            {/* Mobile Footer Status */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Indie &amp; Open Source Launchpad
              </span>
              {!user ? (
                <div className="flex items-center gap-3 text-xs">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-600 dark:text-slate-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Create Account
                  </Link>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                  }}
                  className="text-rose-600 dark:text-rose-400 font-medium hover:underline text-[11px]"
                >
                  Sign Out ({user.email?.split('@')[0]})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


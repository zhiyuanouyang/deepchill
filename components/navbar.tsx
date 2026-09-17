'use client';

import React from 'react';
import { Plus, Search, Bot, ShieldCheck, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenSubmit: () => void;
  activeMode: 'keyword' | 'ai';
  onToggleMode: (mode: 'keyword' | 'ai') => void;
  totalProducts: number;
  onOpenSeoInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmit,
  activeMode,
  onToggleMode,
  totalProducts,
  onOpenSeoInfo,
}) => {
  return (
    <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8">
      <div className="liquid-glass rounded-2xl px-4 py-3 sm:px-6 flex items-center justify-between gap-4 transition-all">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white shadow-md shadow-indigo-900/10">
            <Layers className="w-5 h-5 text-indigo-200" />
            <div className="absolute inset-0 rounded-xl bg-white/10 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                OpenIndie
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50/90 text-indigo-700 border border-indigo-200/60">
                Directory ({totalProducts})
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              High-authority launchpad &amp; SEO backlinks for makers
            </p>
          </div>
        </div>

        {/* Discovery Mode Selector */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100/80 border border-slate-200/70 text-xs font-semibold">
          <button
            id="nav-mode-keyword"
            onClick={() => onToggleMode('keyword')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'keyword'
                ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Catalog</span>
          </button>
          <button
            id="nav-mode-ai"
            onClick={() => onToggleMode('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI (Gemini)</span>
            <span className="px-1 py-0.2 text-[9px] uppercase tracking-wider rounded bg-indigo-400/30 text-white">
              Smart
            </span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backlink SEO Perks modal trigger */}
          <button
            id="nav-seo-guide-btn"
            onClick={onOpenSeoInfo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white/70 hover:bg-white border border-slate-200/80 transition-all cursor-pointer"
            title="Learn how our DoFollow backlinks boost your website's domain authority"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SEO &amp; Backlinks</span>
          </button>

          {/* Submit Project Button */}
          <button
            id="nav-submit-project-btn"
            onClick={onOpenSubmit}
            className="liquid-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};

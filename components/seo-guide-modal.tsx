'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ShieldCheck, Zap, Globe, Search, Award, ArrowRight } from 'lucide-react';

interface SeoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmit: () => void;
}

export const SeoGuideModal: React.FC<SeoGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSubmit,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 p-6 sm:p-8 rounded-3xl liquid-glass border border-white/80 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-extrabold text-slate-900 tracking-tight">
                  High-Value SEO Backlinks Architecture
                </Dialog.Title>
                <Dialog.Description className="text-xs sm:text-sm text-slate-500 font-medium">
                  How our directory helps indie makers &amp; open source devs climb search engine ranks.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                id="seo-guide-close-btn"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>1. Pure Direct DoFollow Backlinks</span>
              </div>
              <p className="text-slate-600">
                Unlike social networks or aggregators that wrap links in tracking redirects or apply restrictive{' '}
                <code className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
                  rel=&quot;nofollow ugc&quot;
                </code>{' '}
                tags, our directory renders <strong>direct canonical hyperlinks</strong> directly to your root domain. Search engine crawlers (Googlebot, Bingbot) pass link equity directly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>2. Contextual Developer &amp; Category Grounding</span>
              </div>
              <p className="text-slate-600">
                Search engines rank backlinks higher when surrounded by topical, semantic relevance. Because each project card is tagged with accurate tech stack keywords (e.g.{' '}
                <em>PostgreSQL, Self-Hosted, Docker, Next.js</em>), your project receives rich topical authority signals.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>3. Fast Crawling &amp; Indexation Signal</span>
              </div>
              <p className="text-slate-600">
                Active directories with regular submissions and updates attract search engine bots multiple times a day. When a new indie product is published here, search crawlers discover your new product page significantly faster.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>4. Reciprocal Trust Badges</span>
              </div>
              <p className="text-slate-600">
                Embedding our lightweight verified badge in your README or footer reinforces your project&apos;s authenticity and builds a high-trust web graph.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Close Guide
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSubmit();
              }}
              className="liquid-btn-primary px-5 py-2.5 rounded-xl font-bold text-white text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit Your Project Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  Copy,
  Check,
  Calendar,
  Award,
} from 'lucide-react';
import { GithubIcon } from './icons';
import { Product } from '@/lib/types';

interface ProjectDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpvote: (productId: string) => void;
  isUpvoted?: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onUpvote,
  isUpvoted = false,
}) => {
  const [badgeFormat, setBadgeFormat] = useState<'markdown' | 'html'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indiedirectory.dev';
  const directoryProductUrl = `${appUrl}/#product-${product.id}`;

  const markdownSnippet = `[![Featured on OpenIndie Directory](https://img.shields.io/badge/OpenIndie-Featured%20Project-6366f1?style=for-the-badge&logo=rocket&logoColor=white)](${directoryProductUrl})`;

  const htmlSnippet = `<a href="${directoryProductUrl}" target="_blank" rel="noopener" title="Featured on OpenIndie Product Directory">
  <img src="https://img.shields.io/badge/OpenIndie-Featured%20Project-6366f1?style=for-the-badge&logo=rocket&logoColor=white" alt="Featured on OpenIndie Directory" />
</a>`;

  const currentSnippet = badgeFormat === 'markdown' ? markdownSnippet : htmlSnippet;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-50 p-6 sm:p-8 rounded-3xl liquid-glass border border-white/80 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-100 border border-white shadow-inner flex items-center justify-center shrink-0">
                {product.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.logoUrl}
                    alt={`${product.name} logo`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="font-extrabold text-indigo-700 text-xl select-none">
                  {product.name.charAt(0)}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Dialog.Title className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {product.name}
                  </Dialog.Title>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {product.pricing}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {product.category}
                  </span>
                  {product.dofollowApproved && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Direct DoFollow
                    </span>
                  )}
                  {product.totalPaid !== undefined && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      🔥 ${product.totalPaid} Bid
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 leading-snug">
                  {product.tagline}
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                id="project-detail-close-btn"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Action Row: Direct Linkout, Upvote, GitHub */}
          <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl bg-white/80 border border-slate-200/70 mb-6">
            <a
              id="detail-modal-visit-site"
              href={product.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white flex items-center gap-2 cursor-pointer"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {product.repoUrl && (
              <a
                id="detail-modal-visit-repo"
                href={product.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Source Code {product.starsCount ? `(★ ${product.starsCount.toLocaleString()})` : ''}</span>
              </a>
            )}

            <button
              id={`detail-upvote-${product.id}`}
              onClick={() => onUpvote(product.id)}
              className={`ml-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isUpvoted
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{product.upvotes} Upvotes</span>
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              About the Project
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Meta & Tech Stack Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tech Stack &amp; Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 shadow-2xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/60 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Creator &amp; Release
                </h4>
                <p className="text-xs text-slate-600">
                  Built by <strong className="text-slate-900">{product.makerName}</strong>
                  {product.makerHandle && (
                    <span className="text-indigo-600 ml-1">({product.makerHandle})</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-200/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>Launched on {product.launchDate}</span>
              </div>
            </div>
          </div>

          {/* SEO Backlink & Embed Badge Station */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 border border-indigo-200/70 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Embed Badge &amp; Maximize SEO Authority
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add this badge to your website footer or GitHub README to complete reciprocal trust signaling.
                  </p>
                </div>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  onClick={() => setBadgeFormat('markdown')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    badgeFormat === 'markdown' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setBadgeFormat('html')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                    badgeFormat === 'html' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  HTML
                </button>
              </div>
            </div>

            {/* Badge Preview */}
            <div className="flex items-center justify-center p-4 rounded-xl bg-white border border-slate-200/80 mb-3 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://img.shields.io/badge/OpenIndie-Featured%20Project-6366f1?style=for-the-badge&logo=rocket&logoColor=white"
                alt="OpenIndie Featured Project Badge"
                className="rounded shadow-xs"
              />
            </div>

            {/* Snippet Code Box */}
            <div className="relative">
              <pre className="p-3 rounded-xl bg-slate-900 text-indigo-200 text-xs font-mono overflow-x-auto select-all pr-24">
                {currentSnippet}
              </pre>
              <button
                id="btn-copy-badge-code"
                onClick={handleCopy}
                className="absolute right-2 top-2 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

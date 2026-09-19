'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  DollarSign,
  Star,
  MousePointerClick,
  FileText,
} from 'lucide-react';
import { Product } from '@/lib/types';

/* ─────────────────────────────────────────────────────────────────────────────
 * PrimaryProductListItem — Trending Projects (Hero / Primary Showcase)
 * Rich Apple-inspired card exposing:
 * - Distinct Rank badge (#1 Gold, #2 Silver, #3 Bronze) with left accent bar
 * - 44px squircle logo, verified DoFollow SEO badge, pricing model, category
 * - Multi-proof metrics: Paid Bid, Clicks, Stars, Upvotes, SEO Details link
 * - Tagline & rich description snippet
 * - Interactive tech stack / tags (clickable) & maker attribution
 * ────────────────────────────────────────────────────────────────────────── */

interface PrimaryProductListItemProps {
  product: Product;
  rank: number;
  onSelectTag: (tag: string) => void;
  onRecordClick: (productId: string) => void;
  onUpvote: (productId: string) => void;
  isUpvoted?: boolean;
}

export const PrimaryProductListItem: React.FC<PrimaryProductListItemProps> = ({
  product,
  rank,
  onSelectTag,
  onRecordClick,
  onUpvote,
  isUpvoted = false,
}) => {
  const handleCardClick = () => {
    onRecordClick(product.id);
    if (typeof window !== 'undefined' && product.websiteUrl) {
      window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const paidBidAmount = product.totalPaid ?? 0;
  const clickCount = product.clicks ?? 0;

  const rankBadgeStyle = (r: number) => {
    if (r === 1)
      return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs shadow-amber-500/40 ring-1 ring-amber-300/60 font-black';
    if (r === 2)
      return 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-xs ring-1 ring-slate-300/60 font-black';
    if (r === 3)
      return 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-xs ring-1 ring-amber-600/60 font-black';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 font-bold';
  };

  return (
    <article
      id={`product-list-item-${product.id}`}
      onClick={handleCardClick}
      title={`Open ${product.name} — ${product.websiteUrl}`}
      className="group relative cursor-pointer"
    >
      <div className="relative rounded-2xl p-3.5 sm:p-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
        {/* Top 3 left accent indicator */}
        {rank <= 3 && (
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              rank === 1
                ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600'
                : rank === 2
                ? 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500'
                : 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800'
            }`}
          />
        )}

        {/* Row 1: Rank + Logo + Title & Badges + Proof Metrics */}
        <div className="flex items-start gap-3">
          {/* Rank Badge */}
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 select-none mt-0.5 ${rankBadgeStyle(
              rank
            )}`}
          >
            {rank}
          </span>

          {/* Squircle App Logo */}
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-2xs">
            {product.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.logoUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base select-none">
              {product.name.charAt(0)}
            </span>
          </div>

          {/* Main Title & Proof Metrics Block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Title & Status Badges */}
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <h3
                  id={`primary-product-title-${product.id}`}
                  className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1 truncate"
                >
                  <span>{product.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </h3>

                {product.dofollowApproved && (
                  <span
                    title="Verified Direct DoFollow Backlink"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800/60 shrink-0"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">DoFollow</span>
                  </span>
                )}

                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                  {product.pricing}
                </span>

                <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline shrink-0">
                  {product.category}
                </span>
              </div>

              {/* Right Side Metrics Bar */}
              <div className="flex items-center gap-1.5 shrink-0 text-xs">
                {paidBidAmount > 0 && (
                  <span
                    title={`Featured Total Bid: $${paidBidAmount}`}
                    className="inline-flex items-center gap-0.5 font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800/60 text-[11px]"
                  >
                    <DollarSign className="w-3 h-3 text-amber-600" />
                    <span>{paidBidAmount} Bid</span>
                  </span>
                )}

                <span
                  title={`${clickCount} outbound clicks`}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] bg-indigo-50/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50"
                >
                  <MousePointerClick className="w-3 h-3" />
                  <span>{clickCount}</span>
                </span>

                {product.starsCount ? (
                  <span
                    title={`${product.starsCount} GitHub Stars`}
                    className="hidden sm:inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px] bg-amber-50/60 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/40"
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{(product.starsCount / 1000).toFixed(1)}k</span>
                  </span>
                ) : null}

                {/* Upvote Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpvote(product.id);
                  }}
                  title={isUpvoted ? 'Upvoted' : 'Upvote project'}
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    isUpvoted
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <ArrowUpRight
                    className={`w-3 h-3 ${
                      isUpvoted
                        ? 'rotate-[-45deg] text-indigo-600 dark:text-indigo-400'
                        : '-rotate-45 text-slate-400'
                    }`}
                  />
                  <span>{product.upvotes}</span>
                </button>

                {/* SEO Landing Page Link */}
                <Link
                  id={`seo-page-btn-${product.id}`}
                  href={`/directory/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`View SEO page for ${product.name}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Row 2: Tagline & Rich Description */}
            <div className="mt-1.5 space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1 leading-snug">
                {product.tagline}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Row 3: Maker Attribution & Interactive Tags */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                {/* Maker Name */}
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                  <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                    {product.makerName.charAt(0)}
                  </span>
                  <span>
                    by{' '}
                    <strong className="font-semibold text-slate-700 dark:text-slate-300">
                      {product.makerName}
                    </strong>
                  </span>
                  {product.makerHandle && (
                    <span className="text-slate-400 dark:text-slate-500 hidden md:inline">
                      ({product.makerHandle})
                    </span>
                  )}
                </span>

                {/* Interactive Tech Stack / Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.tags.slice(0, 4).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTag(tag);
                        }}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                    {product.tags.length > 4 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        +{product.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Trailing Visit Link CTA */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                <span>Visit site</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * SideProductListItem — Newest Releases (Secondary Sidebar Feed)
 * Minimal, clean, and understated row:
 * - Smaller 28px squircle icon
 * - Compact 2-line title & relative time
 * - 1-line muted tagline
 * - Quiet, low-contrast metric (no loud buttons or overshadowing colors)
 * ────────────────────────────────────────────────────────────────────────── */

interface SideProductListItemProps {
  product: Product;
  onRecordClick: (productId: string) => void;
  onUpvote: (productId: string) => void;
  isUpvoted?: boolean;
}

export const SideProductListItem: React.FC<SideProductListItemProps> = ({
  product,
  onRecordClick,
  onUpvote,
  isUpvoted = false,
}) => {
  const handleCardClick = () => {
    onRecordClick(product.id);
    if (typeof window !== 'undefined' && product.websiteUrl) {
      window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formattedRelativeTime = React.useMemo(() => {
    if (!product.paidAt) return 'Recent';
    try {
      const diffMs = Date.now() - new Date(product.paidAt).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return '1d ago';
      if (diffDays < 30) return `${diffDays}d ago`;
      return new Date(product.paidAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  }, [product.paidAt]);

  return (
    <div
      id={`side-product-item-${product.id}`}
      onClick={handleCardClick}
      title={`Open ${product.name} — ${product.websiteUrl}`}
      className="group flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Small 28x28 Squircle Logo */}
        <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
          {product.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logoUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}
          <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px] select-none">
            {product.name.charAt(0)}
          </span>
        </div>

        {/* Minimal 2-line Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {product.name}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
              · {formattedRelativeTime}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
            {product.tagline}
          </p>
        </div>
      </div>

      {/* Minimal trailing info: quiet subtle upvote count & subtle SEO page link */}
      <div className="flex items-center gap-1.5 shrink-0 text-slate-400 dark:text-slate-500">
        <Link
          href={`/directory/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title={`View ${product.name} directory page`}
        >
          <FileText className="w-3.5 h-3.5" />
        </Link>

        <span
          onClick={(e) => {
            e.stopPropagation();
            onUpvote(product.id);
          }}
          title={isUpvoted ? 'Upvoted' : 'Upvote'}
          className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
            isUpvoted
              ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50'
              : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <ArrowUpRight className={`w-3 h-3 ${isUpvoted ? 'rotate-[-45deg]' : '-rotate-45'}`} />
          <span>{product.upvotes}</span>
        </span>
      </div>
    </div>
  );
};


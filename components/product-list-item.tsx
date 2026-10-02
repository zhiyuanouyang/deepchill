'use client';

import React from 'react';
import {
  ExternalLink,
  ArrowUpRight,
  DollarSign,
  Star,
  MousePointerClick,
  Crown,
  Clock,
} from 'lucide-react';
import { Product, TrendingProduct, NewestReleaseProduct } from '@/lib/types';
import { formatRelativeTime, formatExactDateTime } from '@/lib/utils';
import { CategoryBadge } from '@/components/category-badge';
import { VerifiedBadge } from '@/components/verification/verified-badge';

/* ─────────────────────────────────────────────────────────────────────────────
 * RankHatIcon — Crown for Top 3, Stylish Hat for Rank 4+
 * 1st place: Golden Crown
 * 2nd place: Silver Crown
 * 3rd place: Bronze Crown
 * Rank 4+: Grey classic hat style
 * ────────────────────────────────────────────────────────────────────────── */
const RankHatIcon: React.FC<{ rank: number; className?: string }> = ({
  rank,
  className = 'w-3 h-3',
}) => {
  if (rank === 1) {
    return <Crown className={`${className} fill-amber-950 stroke-amber-950`} />;
  }
  if (rank === 2) {
    return (
      <Crown
        className={`${className} fill-slate-800 stroke-slate-800 dark:fill-slate-900 dark:stroke-slate-900`}
      />
    );
  }
  if (rank === 3) {
    return <Crown className={`${className} fill-amber-200 stroke-amber-200`} />;
  }
  // Rank 4+: classic hat style other than crown (stylish top hat / fedora)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} stroke-current`}
      aria-hidden="true"
    >
      <path d="M2 18h20" />
      <path d="M6 18V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11" />
      <path d="M6 14h12" />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * PrimaryProductListItem — Trending Projects (Hero / Primary Showcase)
 * Rich Apple-inspired card exposing:
 * - Stacked Rank Hat/Crown badge (#1 Gold, #2 Silver, #3 Bronze, #4+ Grey Hat) above icon
 * - Bigger 56px squircle logo, verified DoFollow SEO badge, SaaS category mini-chip
 * - Multi-proof metrics: Paid Bid, Clicks, Stars
 * - Tagline & rich description snippet
 * - Interactive tech stack / tags (clickable) & maker attribution
 * ────────────────────────────────────────────────────────────────────────── */

interface PrimaryProductListItemProps {
  product: TrendingProduct | Product;
  rank: number;
  onSelectTag: (tag: string) => void;
  onRecordClick: (productId: string) => void;
  onUpvote?: (productId: string) => void;
  isUpvoted?: boolean;
  onOpenBid?: (product: TrendingProduct | Product) => void;
}

export const PrimaryProductListItem: React.FC<PrimaryProductListItemProps> = ({
  product,
  rank,
  onSelectTag,
  onRecordClick,
  onOpenBid,
}) => {
  const handleCardClick = () => {
    onRecordClick(product.id);
    if (typeof window !== 'undefined' && product.websiteUrl) {
      window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const totalBidAmount = product.totalBid ?? (product as Product).totalPaid ?? 0;
  const recentBidAmount =
    product.mostRecentBid?.bidPrice ??
    (product as Product).mostRecentBid?.bidPrice ??
    0;
  const clickCount = product.totalClicks ?? (product as Product).clicks ?? 0;
  const displayTags = product.categoryTags ?? (product as Product).tags ?? [];

  const rawDate =
    product.latestBidTime ||
    product.mostRecentBid?.bidTime ||
    (product as Product).paidAt ||
    product.launchDate;

  const [now, setNow] = React.useState<number>(() => Date.now());
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [product.logoUrl]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const relativeTime = React.useMemo(() => {
    return formatRelativeTime(rawDate, now);
  }, [rawDate, now]);

  const exactDateTime = React.useMemo(() => {
    return formatExactDateTime(rawDate);
  }, [rawDate]);

  const rankBadgeStyle = (r: number) => {
    if (r === 1)
      return 'bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-amber-950 shadow-xs shadow-amber-500/40 ring-1 ring-amber-400/80 font-black';
    if (r === 2)
      return 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 text-slate-850 dark:text-slate-900 shadow-xs shadow-slate-400/30 ring-1 ring-slate-300/80 font-black';
    if (r === 3)
      return 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-100 shadow-xs shadow-amber-900/40 ring-1 ring-amber-600/80 font-black';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 font-bold shadow-2xs';
  };

  return (
    <article
      id={`product-list-item-${product.id}`}
      onClick={handleCardClick}
      title={`Open ${product.name} — ${product.domain || product.websiteUrl}`}
      className="group relative cursor-pointer"
    >
      <div className="relative rounded-2xl p-3 sm:p-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
        {/* Top 3 left accent indicator */}
        {rank <= 3 && (
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${rank === 1
              ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600'
              : rank === 2
                ? 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500'
                : 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800'
              }`}
          />
        )}

        {/* Main Row: (Left: Rank Crown/Hat + Bigger Logo) + (Right: Title, Badges, Metrics, Content) */}
        <div className="flex items-start gap-2.5 sm:gap-3.5">
          {/* Left Column: Stacked Rank Crown/Hat Badge + Bigger Squircle App Logo */}
          <div className="flex flex-col items-center shrink-0">
            {/* Rank Crown/Hat Badge with Number */}
            <div
              className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-[10px] tracking-tight shrink-0 select-none transition-transform duration-200 group-hover:-translate-y-0.5 ${rankBadgeStyle(
                rank
              )}`}
              title={`Rank #${rank}`}
            >
              <RankHatIcon rank={rank} className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>{rank}</span>
            </div>

            {/* Squircle App Logo */}
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-xs mt-1 sm:mt-1.5 transition-transform duration-200 group-hover:scale-[1.02]">
              {product.logoUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.logoUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl select-none">
                  {product.name ? product.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
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

                <VerifiedBadge project={product} size="sm" />

                {product.category && (
                  <CategoryBadge
                    category={product.category}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTag(product.category);
                    }}
                  />
                )}
              </div>

              {/* Right Side Metrics Bar */}
              <div className="flex items-center gap-1.5 shrink-0 text-xs">
                {/* Outbound User Clicks Metric */}
                <span
                  title={`${clickCount.toLocaleString()} user clicks through to website`}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] bg-indigo-50/90 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50 transition-all duration-150"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span key={clickCount} className="tabular-nums transition-transform inline-block">
                    {clickCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 font-medium">clicks</span>
                </span>

                {/* Total Bid Amount (Interactive Action) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBid?.(product);
                  }}
                  title={
                    totalBidAmount > 0
                      ? `Total Bid: $${totalBidAmount}${recentBidAmount > 0 ? ` · Latest bid: $${recentBidAmount}` : ''} — Click to add a new bid!`
                      : 'No active bid ($0) — Click to be the first backer!'
                  }
                  className={`group/bid inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border text-[11px] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs select-none ${totalBidAmount > 0
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-100/80 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 border-slate-200/60 dark:border-slate-700/60 hover:border-amber-300/60'
                    }`}
                >
                  <DollarSign className="w-3 h-3 text-amber-600 dark:text-amber-400 group-hover/bid:rotate-12 transition-transform" />
                  <span>{totalBidAmount} Bid</span>
                  <span className="text-[10px] font-black text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-800/80 px-1 py-0 rounded group-hover/bid:bg-amber-300 dark:group-hover:bg-amber-700 transition-colors ml-0.5">
                    +
                  </span>
                </button>


                {product.starsCount ? (
                  <span
                    title={`${product.starsCount} GitHub Stars`}
                    className="hidden sm:inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px] bg-amber-50/60 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/40"
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{(product.starsCount / 1000).toFixed(1)}k</span>
                  </span>
                ) : null}
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
                {displayTags && displayTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {displayTags.slice(0, 4).map((tag) => (
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
                    {displayTags.length > 4 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        +{displayTags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Add Bid CTA & Trailing Visit Link */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                  <span>Visit site</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
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
 * Slim, minimal, and balanced 3-tier card:
 * - Left: Rank badge & 32px squircle logo
 * - Content: Product name + Bid badge, plus short description that wraps
 *   gracefully across 2 lines without being prematurely cut off
 * - Meta footer: Timestamp on left; Outbound clicks & Bid price on right
 * ────────────────────────────────────────────────────────────────────────── */

interface SideProductListItemProps {
  product: NewestReleaseProduct | Product;
  rank: number;
  onRecordClick: (productId: string) => void;
  onUpvote?: (productId: string) => void;
  isUpvoted?: boolean;
  onOpenBid?: (product: NewestReleaseProduct | Product) => void;
}

export const SideProductListItem: React.FC<SideProductListItemProps> = ({
  product,
  rank,
  onRecordClick,
  onOpenBid,
}) => {
  const handleCardClick = () => {
    onRecordClick(product.id);
    if (typeof window !== 'undefined' && product.websiteUrl) {
      window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const recentBidAmount = product.mostRecentBid?.bidPrice ?? 0;
  const totalBidAmount =
    product.totalBid ??
    ('totalBid' in product ? (product as { totalBid?: number }).totalBid : undefined) ??
    (product as Product).totalPaid ??
    0;
  const displayBidAmount = recentBidAmount > 0 ? recentBidAmount : totalBidAmount;
  const clickCount = product.totalClicks ?? (product as Product).clicks ?? 0;

  const rankBadgeStyle = (r: number) => {
    if (r === 1)
      return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-2xs ring-1 ring-amber-300/60 font-black';
    if (r === 2)
      return 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-2xs ring-1 ring-slate-300/60 font-black';
    if (r === 3)
      return 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-2xs ring-1 ring-amber-600/60 font-black';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 font-bold';
  };

  const rawDate =
    product.latestBidTime ||
    product.mostRecentBid?.bidTime ||
    (product as Product).paidAt ||
    product.launchDate;
  const [now, setNow] = React.useState<number>(() => Date.now());
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [product.logoUrl]);

  React.useEffect(() => {
    // Tick every 30 seconds to keep real-time relative times like "just now", "2 mins ago" freshly updated
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const relativeTime = React.useMemo(() => {
    return formatRelativeTime(rawDate, now);
  }, [rawDate, now]);

  const exactDateTime = React.useMemo(() => {
    return formatExactDateTime(rawDate);
  }, [rawDate]);

  return (
    <article
      id={`side-product-item-${product.id}`}
      onClick={handleCardClick}
      title={`Open ${product.name} — ${product.domain || product.websiteUrl}`}
      className="group relative cursor-pointer"
    >
      <div className="relative rounded-2xl p-2.5 sm:p-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xs hover:shadow-xs hover:border-indigo-300/80 dark:hover:border-indigo-500/30 transition-all duration-200">
        {/* Row 1: Smaller Rank & Icon + Product Name (Left) & SEO Button (Right) */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Smaller Rank Badge */}
            <span
              className={`min-w-4 h-4 px-1 rounded flex items-center justify-center text-[9px] font-bold shrink-0 select-none ${rankBadgeStyle(
                rank
              )}`}
              title={`Rank #${rank}`}
            >
              #{rank}
            </span>

            {/* Smaller Squircle Icon */}
            <div className="relative w-5 h-5 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
              {product.logoUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.logoUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="font-bold text-slate-600 dark:text-slate-300 text-[10px] select-none">
                  {product.name ? product.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate min-w-0">
              {product.name}
            </h4>

            {product.category && (
              <CategoryBadge category={product.category} size="xs" className="shrink-0" />
            )}
          </div>
        </div>

        {/* Row 2: Description Text (Single line with ellipsis, expands on hover) */}
        <p
          title={product.tagline || product.description}
          className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 hover:line-clamp-none group-hover:line-clamp-none transition-all duration-200 leading-relaxed mt-1.5"
        >
          {product.tagline || product.description}
        </p>

        {/* Row 3: Meta Footer: Timestamp (Left) & Clicks + Reduced Bid Price Badge (Right) */}
        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-1.5 flex-wrap text-[10px]">
          {/* Left: Timestamp with Clock icon */}
          <div
            suppressHydrationWarning
            title={`Launch / bid timestamp: ${exactDateTime} (${relativeTime})`}
            className="flex items-center gap-1 text-slate-400 dark:text-slate-500 shrink-0 select-none text-[10px]"
          >
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span suppressHydrationWarning>{relativeTime}</span>
          </div>

          {/* Right: Outbound Clicks Counter & Reduced-size Bid Price Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              title={`${clickCount.toLocaleString()} user clicks through to website`}
              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium"
            >
              <MousePointerClick className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span key={clickCount} className="tabular-nums transition-transform inline-block">
                {clickCount.toLocaleString()}
              </span>
            </span>

            <span className="text-slate-200 dark:text-slate-700 select-none">·</span>

            {/* Interactive Bid Price Button & Quick Bid CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenBid?.(product);
              }}
              title={`Bid: $${displayBidAmount}${totalBidAmount > displayBidAmount ? ` · Total: $${totalBidAmount}` : ''} — Click to add a new bid!`}
              className={`group/sidebid inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded border text-[9px] shrink-0 leading-none transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs select-none ${displayBidAmount > 0
                ? 'text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 bg-slate-100/80 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 border-slate-200/50 dark:border-slate-700/60'
                }`}
            >
              <DollarSign className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 group-hover/sidebid:rotate-12 transition-transform" />
              <span>{displayBidAmount}</span>
              <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 opacity-70 group-hover/sidebid:opacity-100 ml-0.5">
                +
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};


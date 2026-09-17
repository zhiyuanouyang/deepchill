'use client';

import React from 'react';
import { ExternalLink, ArrowUpRight, ShieldCheck, DollarSign, Clock, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '@/lib/types';

interface PrimaryProductListItemProps {
  product: Product;
  rank: number;
  onSelectTag: (tag: string) => void;
  onOpenDetails: (product: Product) => void;
  onUpvote: (productId: string) => void;
  isUpvoted?: boolean;
}

export const PrimaryProductListItem: React.FC<PrimaryProductListItemProps> = ({
  product,
  rank,
  onSelectTag,
  onOpenDetails,
  onUpvote,
  isUpvoted = false,
}) => {
  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpvote(product.id);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    try {
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { x, y },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'],
        ticks: 100,
      });
    } catch {
      // ignore
    }
  };

  const getPricingBadge = (pricing: Product['pricing']) => {
    switch (pricing) {
      case 'Open Source':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
      case 'Free':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60';
      case 'Freemium':
        return 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60';
      case 'Paid':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700';
    }
  };

  const getRankBadgeStyle = (r: number) => {
    if (r === 1) return 'bg-amber-500 text-white shadow-xs shadow-amber-500/20';
    if (r === 2) return 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs';
    if (r === 3) return 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  };

  const paidBidAmount = product.totalPaid ?? 0;

  return (
    <article
      id={`product-list-item-${product.id}`}
      className="liquid-glass-card rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md group relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/80 dark:border-white/10"
    >
      {/* Top subtle highlight reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/15 to-transparent opacity-80" />

      {/* Main Info Area: Rank, Logo, Title, Tagline, Tags */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
        {/* Rank Number Badge */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none ${getRankBadgeStyle(
            rank
          )}`}
          title={`Trending Rank #${rank}`}
        >
          #{rank}
        </div>

        {/* Logo */}
        <div
          onClick={() => onOpenDetails(product)}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/60 border border-white dark:border-slate-700/60 shadow-inner flex items-center justify-center shrink-0 cursor-pointer"
        >
          {product.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.logoUrl}
              alt={`${product.name} logo`}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}
          <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-lg sm:text-xl select-none">
            {product.name.charAt(0)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <button
              id={`primary-product-title-${product.id}`}
              onClick={() => onOpenDetails(product)}
              className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors tracking-tight text-left cursor-pointer truncate max-w-[240px] sm:max-w-md"
            >
              {product.name}
            </button>

            {/* Bidding Amount Pill */}
            <span
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs"
              title={`Total paid bidding amount: $${paidBidAmount}`}
            >
              <DollarSign className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>${paidBidAmount} Bid</span>
            </span>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPricingBadge(
                product.pricing
              )}`}
            >
              {product.pricing}
            </span>

            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
              • {product.category}
            </span>
          </div>

          {/* Tagline */}
          <p
            onClick={() => onOpenDetails(product)}
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-1 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            {product.tagline}
          </p>

          {/* Meta line: Tags & Maker & GitHub stars */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  id={`primary-tag-${product.id}-${tag}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag(tag);
                  }}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/70 dark:border-slate-700/60 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              by <strong className="text-slate-700 dark:text-slate-300 font-semibold">{product.makerName}</strong>
            </span>

            {product.starsCount ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {(product.starsCount / 1000).toFixed(1)}k
              </span>
            ) : null}

            {product.dofollowApproved && (
              <span
                title="Verified DoFollow SEO Link"
                className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[11px]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Action Area: Upvote & View/Visit */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1 sm:hidden text-xs text-slate-400 dark:text-slate-500">
          <span>Rank #{rank}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <button
            onClick={() => onOpenDetails(product)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer hidden md:flex items-center gap-1"
          >
            <span>Details</span>
          </button>

          <a
            href={product.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open website directly"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Upvote Button */}
          <button
            id={`primary-upvote-btn-${product.id}`}
            onClick={handleUpvoteClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer select-none text-xs font-bold ${
              isUpvoted
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-700 dark:border-indigo-400 shadow-md shadow-indigo-500/20'
                : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200/90 dark:border-slate-700/90 shadow-2xs'
            }`}
            title="Upvote project"
          >
            <ArrowUpRight
              className={`w-3.5 h-3.5 transition-transform ${
                isUpvoted ? 'rotate-[-45deg] scale-110' : '-rotate-45 group-hover:translate-x-0.5'
              }`}
            />
            <span>{product.upvotes}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

interface SideProductListItemProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onUpvote: (productId: string) => void;
  isUpvoted?: boolean;
}

export const SideProductListItem: React.FC<SideProductListItemProps> = ({
  product,
  onOpenDetails,
  onUpvote,
  isUpvoted = false,
}) => {
  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpvote(product.id);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    try {
      confetti({
        particleCount: 16,
        spread: 35,
        origin: { x, y },
        colors: ['#6366f1', '#10b981', '#f59e0b'],
        ticks: 80,
      });
    } catch {
      // ignore
    }
  };

  const formattedRelativeTime = React.useMemo(() => {
    if (!product.paidAt) return 'Recent';
    try {
      return new Date(product.paidAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  }, [product.paidAt]);

  return (
    <article
      id={`side-product-item-${product.id}`}
      onClick={() => onOpenDetails(product)}
      className="liquid-glass-card rounded-xl p-3 sm:p-3.5 transition-all hover:bg-white/90 dark:hover:bg-slate-800/90 group relative cursor-pointer border border-white/70 dark:border-white/10"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Logo */}
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/60 border border-white dark:border-slate-700/60 shadow-2xs flex items-center justify-center shrink-0">
            {product.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.logoUrl}
                alt={`${product.name} logo`}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <span className="font-bold text-indigo-700 dark:text-indigo-400 text-sm select-none">
              {product.name.charAt(0)}
            </span>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[140px]">
                {product.name}
              </h4>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded">
                <Clock className="w-2.5 h-2.5" />
                {formattedRelativeTime}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 leading-snug">
              {product.tagline}
            </p>

            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{product.pricing}</span>
              <span>•</span>
              <span className="truncate">{product.category}</span>
            </div>
          </div>
        </div>

        {/* Upvote Pill */}
        <button
          id={`side-upvote-btn-${product.id}`}
          onClick={handleUpvoteClick}
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg border transition-all cursor-pointer select-none shrink-0 ${
            isUpvoted
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-700 dark:border-indigo-400'
              : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200 dark:border-slate-700'
          }`}
          title="Upvote"
        >
          <ArrowUpRight
            className={`w-3 h-3 ${isUpvoted ? 'rotate-[-45deg]' : '-rotate-45'}`}
          />
          <span className="text-[10px] font-bold leading-tight">{product.upvotes}</span>
        </button>
      </div>
    </article>
  );
};

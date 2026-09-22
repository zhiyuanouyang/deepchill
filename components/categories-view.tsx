'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  ExternalLink,
  Terminal,
  Server,
  Bot,
  Zap,
  Palette,
  BarChart3,
  ShieldCheck,
  Wrench,
  DollarSign,
  MousePointerClick,
  Crown,
  Clock,
  Flame,
  Sparkles,
  Plus,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  TrendingProduct,
  NewestReleaseProduct,
  toTrendingProduct,
  toNewestReleaseProduct,
} from '@/lib/types';
import { extractDomain, formatRelativeTime, formatExactDateTime } from '@/lib/utils';
import { INITIAL_PRODUCTS } from '@/data/initial-products';
import { CATEGORY_DESCRIPTIONS } from '@/data/category-descriptions';
import { Navbar } from '@/components/navbar';
import { SubmitModal } from '@/components/submit-modal';
import { SeoGuideModal } from '@/components/seo-guide-modal';

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const CATEGORIES: ProductCategory[] = [
  'DevTools',
  'Open Source Infrastructure',
  'AI & Machine Learning',
  'Productivity',
  'Design & Creative',
  'SaaS & Analytics',
  'Security & Privacy',
  'Developer Utilities',
];

const CATEGORY_ICONS: Record<ProductCategory, React.ElementType> = {
  DevTools: Terminal,
  'Open Source Infrastructure': Server,
  'AI & Machine Learning': Bot,
  Productivity: Zap,
  'Design & Creative': Palette,
  'SaaS & Analytics': BarChart3,
  'Security & Privacy': ShieldCheck,
  'Developer Utilities': Wrench,
};

const CATEGORY_THEMES: Record<
  ProductCategory,
  { bg: string; text: string; ring: string; border: string }
> = {
  DevTools: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
  },
  'Open Source Infrastructure': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
  },
  'AI & Machine Learning': {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/20',
    border: 'border-purple-200/60 dark:border-purple-800/40',
  },
  Productivity: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    border: 'border-amber-200/60 dark:border-amber-800/40',
  },
  'Design & Creative': {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-600 dark:text-pink-400',
    ring: 'ring-pink-500/20',
    border: 'border-pink-200/60 dark:border-pink-800/40',
  },
  'SaaS & Analytics': {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/20',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
  },
  'Security & Privacy': {
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    ring: 'ring-teal-500/20',
    border: 'border-teal-200/60 dark:border-teal-800/40',
  },
  'Developer Utilities': {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-500/20',
    border: 'border-orange-200/60 dark:border-orange-800/40',
  },
};

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface CategoryData {
  name: ProductCategory;
  description: string;
  projectCount: number;
  primaryTopProjects: TrendingProduct[];
  secondaryRecentProjects: NewestReleaseProduct[];
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function rankPrimaryTopProducts(products: Product[]): TrendingProduct[] {
  return [...products]
    .sort((a, b) => {
      // 1. Total bid amount descending
      const aPaid = a.totalBid ?? a.totalPaid ?? 0;
      const bPaid = b.totalBid ?? b.totalPaid ?? 0;
      if (bPaid !== aPaid) return bPaid - aPaid;

      // 2. Click count descending
      const aClicks = a.totalClicks ?? a.clicks ?? 0;
      const bClicks = b.totalClicks ?? b.clicks ?? 0;
      if (bClicks !== aClicks) return bClicks - aClicks;

      // 3. Most recent bid time descending
      const aTime = new Date(a.mostRecentBid?.bidTime || a.paidAt || a.launchDate).getTime();
      const bTime = new Date(b.mostRecentBid?.bidTime || b.paidAt || b.launchDate).getTime();
      return bTime - aTime;
    })
    .slice(0, 3)
    .map(toTrendingProduct);
}

function rankSecondaryRecentProducts(products: Product[]): NewestReleaseProduct[] {
  return [...products]
    .sort((a, b) => {
      // 1. Most recent bid time descending
      const aTime = new Date(a.mostRecentBid?.bidTime || a.paidAt || a.launchDate).getTime();
      const bTime = new Date(b.mostRecentBid?.bidTime || b.paidAt || b.launchDate).getTime();
      if (bTime !== aTime) return bTime - aTime;

      // 2. Bid price descending
      const aBid =
        a.mostRecentBid?.bidPrice ?? a.totalBid ?? a.totalPaid ?? 0;
      const bBid =
        b.mostRecentBid?.bidPrice ?? b.totalBid ?? b.totalPaid ?? 0;
      return bBid - aBid;
    })
    .slice(0, 3)
    .map(toNewestReleaseProduct);
}

function buildCategoryData(products: Product[]): CategoryData[] {
  const grouped: Record<string, Product[]> = {};
  for (const p of products) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  return CATEGORIES.map((cat) => {
    const catProds = grouped[cat] || [];
    return {
      name: cat,
      description: CATEGORY_DESCRIPTIONS[cat] ?? '',
      projectCount: catProds.length,
      primaryTopProjects: rankPrimaryTopProducts(catProds),
      secondaryRecentProjects: rankSecondaryRecentProducts(catProds),
    };
  });
}

function categorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/* ─── Rank Crown/Hat Component ─────────────────────────────────────────────── */

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

const primaryRankBadgeStyle = (r: number) => {
  if (r === 1)
    return 'bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-amber-950 shadow-xs shadow-amber-500/40 ring-1 ring-amber-400/80 font-black';
  if (r === 2)
    return 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 dark:from-slate-200 dark:via-slate-100 dark:to-slate-300 text-slate-850 dark:text-slate-900 shadow-xs shadow-slate-400/30 ring-1 ring-slate-300/80 font-black';
  if (r === 3)
    return 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-100 shadow-xs shadow-amber-900/40 ring-1 ring-amber-600/80 font-black';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 font-bold';
};

const secondaryRankBadgeStyle = (r: number) => {
  if (r === 1)
    return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-2xs ring-1 ring-amber-300/60 font-black';
  if (r === 2)
    return 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-2xs ring-1 ring-slate-300/60 font-black';
  if (r === 3)
    return 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-2xs ring-1 ring-amber-600/60 font-black';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 font-bold';
};

/* ─── Hero Component ───────────────────────────────────────────────────────── */

const CategoriesHero: React.FC<{ totalProducts: number; categoryCount: number }> = ({
  totalProducts,
  categoryCount,
}) => (
  <section className="pt-2 pb-5 sm:pb-8 text-center max-w-4xl mx-auto categories-entrance">
    {/* Subtle badge with live ping dot matching main page */}
    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white/80 dark:bg-slate-800/80 border border-indigo-100/80 dark:border-indigo-900/60 shadow-xs mb-4 sm:mb-5 max-w-full">
      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
      <span className="truncate">Category Directory &amp; Tech Ecosystem Map</span>
    </div>

    {/* Hero Headline with Gradient Text */}
    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.18] sm:leading-[1.15] mb-3 sm:mb-4 px-1">
      Explore Verified Projects by{' '}
      <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
        Category
      </span>
    </h1>

    <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-5 sm:mb-6 max-w-2xl mx-auto px-2">
      Discover the highest-ranked tools, indie SaaS, and open-source infrastructure across
      specialized niches, ranked by maker backing and real-time community engagement.
    </p>

    {/* Metric Stats Pills */}
    <div className="flex items-center justify-center gap-1.5 sm:gap-4 flex-wrap text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 px-1">
      <div className="liquid-glass-pill px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>
          <strong className="text-slate-900 dark:text-white">{categoryCount}</strong> Categories
        </span>
      </div>
      <div className="liquid-glass-pill px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          <strong className="text-slate-900 dark:text-white">{totalProducts}</strong> Curated Projects
        </span>
      </div>
      <div className="liquid-glass-pill px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong className="text-slate-900 dark:text-white">100%</strong> Direct DoFollow SEO Links
        </span>
      </div>
      <div className="liquid-glass-pill px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5">
        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          <strong className="text-slate-900 dark:text-white">Live</strong> Bid Rankings
        </span>
      </div>
    </div>
  </section>
);

/* ─── Vivid Category Selector Bar ─────────────────────────────────────────── */

const CategoryIndex: React.FC<{
  categories: CategoryData[];
  activeSlug: string | null;
  onJumpTo: (slug: string) => void;
}> = ({ categories, activeSlug, onJumpTo }) => (
  <nav
    aria-label="Category quick navigation"
    className="sticky top-16 sm:top-20 z-30 mb-6 sm:mb-8 categories-entrance"
  >
    <div className="liquid-glass rounded-2xl p-1.5 sm:p-2 shadow-xs border border-white/80 dark:border-white/10">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1 py-0.5 scroll-smooth">
        {categories.map((cat) => {
          const slug = categorySlug(cat.name);
          const isActive = activeSlug === slug;
          const IconComponent = CATEGORY_ICONS[cat.name] || Layers;

          return (
            <button
              key={cat.name}
              id={`cat-nav-${slug}`}
              onClick={() => onJumpTo(slug)}
              className={`group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${isActive
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm ring-1 ring-slate-900/10 dark:ring-indigo-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80'
                }`}
            >
              <IconComponent
                className={`w-3.5 h-3.5 transition-colors ${isActive
                  ? 'text-indigo-300 dark:text-indigo-200'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
              />
              <span>{cat.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${isActive
                  ? 'bg-slate-800 dark:bg-indigo-700/80 text-slate-300 dark:text-indigo-100'
                  : 'bg-slate-100/90 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
              >
                {cat.projectCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

/* ─── Primary Item Row (Top 3 by Total Bid) ────────────────────────────────── */

const PrimaryCategoryRow: React.FC<{
  project: TrendingProduct;
  rank: number;
  onRecordClick: (id: string) => void;
}> = ({ project, rank, onRecordClick }) => {
  const paidBidAmount = project.totalBid ?? 0;
  const clickCount = project.totalClicks ?? 0;
  const domain = project.domain || extractDomain(project.websiteUrl);

  const handleClick = () => {
    onRecordClick(project.id);
    if (typeof window !== 'undefined' && project.websiteUrl) {
      window.open(project.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      id={`cat-primary-${project.id}`}
      onClick={handleClick}
      title={`Open ${project.name} — ${domain}`}
      className="group relative cursor-pointer"
    >
      <div className="relative rounded-2xl p-3 sm:p-3.5 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800/90 border border-slate-200/60 dark:border-white/[0.06] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-xs transition-all duration-200 overflow-hidden">
        {/* Top 3 left subtle accent strip */}
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

        <div className="flex items-start gap-3">
          {/* Left Column: Stacked Rank Crown/Hat Badge + Squircle Logo */}
          <div className="flex flex-col items-center shrink-0">
            {/* Rank Crown/Hat Badge with Number */}
            <div
              className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] tracking-tight shrink-0 select-none transition-transform duration-200 group-hover:-translate-y-0.5 ${primaryRankBadgeStyle(
                rank
              )}`}
              title={`Rank #${rank} in category`}
            >
              <RankHatIcon rank={rank} className="w-2.5 h-2.5 shrink-0" />
              <span>{rank}</span>
            </div>

            {/* Squircle App Logo */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-2xs mt-1 transition-transform duration-200 group-hover:scale-[1.02]">
              {project.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base sm:text-lg select-none">
                {project.name.charAt(0)}
              </span>
            </div>
          </div>

          {/* Right Column: Title, Badges, Tagline, Proof Metrics */}
          <div className="flex-1 min-w-0">
            {/* Top row: Name + Verified Badge + Metrics */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1 truncate">
                  <span>{project.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </h4>

                {project.dofollowApproved && (
                  <span
                    title="Verified Direct DoFollow Backlink"
                    className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/70 dark:border-emerald-800/60 shrink-0"
                  >
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    <span>DoFollow</span>
                  </span>
                )}
              </div>

              {/* Total Bid & Clicks Counters */}
              <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-medium">
                {paidBidAmount > 0 && (
                  <span
                    className="inline-flex items-center gap-0.5 font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/80 dark:border-amber-800/60 text-[10px] shrink-0"
                    title={`Total Bid: $${paidBidAmount}`}
                  >
                    <DollarSign className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{paidBidAmount}</span>
                  </span>
                )}

                <span
                  className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400 text-[10px]"
                  title={`${clickCount.toLocaleString()} clicks`}
                >
                  <MousePointerClick className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>{clickCount.toLocaleString()}</span>
                </span>
              </div>
            </div>

            {/* Tagline / Description snippet */}
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed mt-0.5">
              {project.tagline || project.description}
            </p>

            {/* Domain URL indicator */}
            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                {domain}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ─── Secondary Item Row (Bottom 3 by Recent Bid) ─────────────────────────── */

const SecondaryCategoryRow: React.FC<{
  product: NewestReleaseProduct;
  rank: number;
  now: number;
  onRecordClick: (id: string) => void;
}> = ({ product, rank, now, onRecordClick }) => {
  const handleClick = () => {
    onRecordClick(product.id);
    if (typeof window !== 'undefined' && projectWebsiteUrl(product)) {
      window.open(projectWebsiteUrl(product), '_blank', 'noopener,noreferrer');
    }
  };

  const projectWebsiteUrl = (p: NewestReleaseProduct) => p.websiteUrl;
  const bidPrice = product.mostRecentBid?.bidPrice ?? 0;
  const clickCount = product.totalClicks ?? 0;
  const rawDate = product.mostRecentBid?.bidTime || product.launchDate;

  const relativeTime = useMemo(() => {
    return formatRelativeTime(rawDate, now);
  }, [rawDate, now]);

  const exactDateTime = useMemo(() => {
    return formatExactDateTime(rawDate);
  }, [rawDate]);

  return (
    <article
      id={`cat-secondary-${product.id}`}
      onClick={handleClick}
      title={`Open ${product.name} — ${product.domain || product.websiteUrl}`}
      className="group relative cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors duration-150">
        {/* Left: Mini rank, Mini 20px squircle logo, Product name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Mini Rank Badge */}
          <span
            className={`min-w-4 h-4 px-1 rounded flex items-center justify-center text-[8.5px] font-bold shrink-0 select-none ${secondaryRankBadgeStyle(
              rank
            )}`}
            title={`Recent bid rank #${rank}`}
          >
            #{rank}
          </span>

          {/* Mini Squircle Logo */}
          <div className="relative w-5 h-5 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
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
            <span className="font-bold text-slate-600 dark:text-slate-300 text-[9px] select-none">
              {product.name.charAt(0)}
            </span>
          </div>

          {/* Product Name */}
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {product.name}
          </h5>
        </div>

        {/* Right: Timestamp & Small Bid Price / Clicks */}
        <div className="flex items-center gap-2 shrink-0 text-[10px]">
          {/* Relative Time with Clock */}
          <span
            suppressHydrationWarning
            title={`Bid time: ${exactDateTime}`}
            className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium select-none"
          >
            <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span suppressHydrationWarning>{relativeTime}</span>
          </span>

          {/* Outbound Clicks */}
          <span
            title={`${clickCount.toLocaleString()} clicks`}
            className="hidden sm:inline-flex items-center gap-0.5 text-slate-400 dark:text-slate-500"
          >
            <MousePointerClick className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
            <span>{clickCount}</span>
          </span>

          {/* Small Bid Price Badge */}
          {bidPrice > 0 && (
            <span
              title={`Recent Bid: $${bidPrice}`}
              className="inline-flex items-center gap-0.5 font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1 py-0.5 rounded text-[9px] shrink-0 border border-amber-200/70 dark:border-amber-800/50"
            >
              <DollarSign className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span>{bidPrice}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

/* ─── Primary Item Placeholder (When < 3 Top Bid Items) ───────────────────── */

const PrimaryCategoryPlaceholder: React.FC<{
  rank: number;
  categoryName: string;
  onOpenSubmit: (category?: ProductCategory) => void;
}> = ({ rank, categoryName, onOpenSubmit }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenSubmit(categoryName as ProductCategory)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenSubmit(categoryName as ProductCategory);
        }
      }}
      aria-label={`Submit your project to claim Rank #${rank} in ${categoryName}`}
      className="group relative rounded-2xl bg-slate-50/40 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/70 border-2 border-dashed border-slate-200/90 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-indigo-500/70 p-3 sm:p-3.5 transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer"
    >
      <div className="relative">
        {/* Top 3 rank colored left accent line */}
        {rank <= 3 && (
          <div
            className={`absolute -left-3 sm:-left-3.5 top-2 bottom-2 w-1 rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity ${rank === 1
              ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600'
              : rank === 2
                ? 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500'
                : 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800'
              }`}
          />
        )}

        <div className="flex items-start gap-3">
          {/* Left Column: Stacked Rank Crown/Hat Badge + Squircle Add Logo */}
          <div className="flex flex-col items-center shrink-0">
            {/* Rank Crown/Hat Badge with Number */}
            <div
              className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] tracking-tight shrink-0 select-none transition-transform duration-200 group-hover:-translate-y-0.5 opacity-80 group-hover:opacity-100 ${primaryRankBadgeStyle(
                rank
              )}`}
              title={`Available Rank #${rank} in ${categoryName}`}
            >
              <RankHatIcon rank={rank} className="w-2.5 h-2.5 shrink-0" />
              <span>{rank}</span>
            </div>

            {/* Squircle App Logo Placeholder */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-950/30 flex items-center justify-center shrink-0 ring-1 ring-black/[0.04] dark:ring-white/[0.04] shadow-2xs mt-1 transition-all duration-200 group-hover:scale-[1.03]">
              <Plus className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>

          {/* Right Column: Title, Badges, Tagline, Call to Action */}
          <div className="flex-1 min-w-0">
            {/* Top row: Claim Rank + Spot Badge + Quick Action */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1 truncate">
                  <span>Claim Rank #{rank}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </h4>

                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md border border-indigo-200/70 dark:border-indigo-800/60 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  <span>Available Spot</span>
                </span>
              </div>

              {/* Total Bid / CTA prompt */}
              <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-medium">
                <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-[10px] font-semibold transition-colors">
                  <Plus className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                  <span>Submit Project</span>
                </span>
              </div>
            </div>

            {/* Tagline snippet */}
            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 leading-relaxed mt-0.5">
              Launch in {categoryName} to gain high-authority backlinks &amp; traffic
            </p>

            {/* Domain indicator */}
            <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
              <span className="truncate group-hover:underline">
                + Click to submit your product here
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Secondary Item Placeholder (When < 3 Recent Bid Items) ────────────────── */

const SecondaryCategoryPlaceholder: React.FC<{
  rank: number;
  categoryName: string;
  onOpenSubmit: (category?: ProductCategory) => void;
}> = ({ rank, categoryName, onOpenSubmit }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenSubmit(categoryName as ProductCategory)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenSubmit(categoryName as ProductCategory);
        }
      }}
      title={`Submit project for recent bids slot #${rank} in ${categoryName}`}
      className="group relative cursor-pointer block"
    >
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border border-dashed border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-all duration-150">
        {/* Left: Mini rank, Mini 20px squircle add icon, prompt text */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Mini Rank Badge */}
          <span
            className={`min-w-4 h-4 px-1 rounded flex items-center justify-center text-[8.5px] font-bold shrink-0 select-none opacity-80 group-hover:opacity-100 ${secondaryRankBadgeStyle(
              rank
            )}`}
            title={`Available recent bid slot #${rank}`}
          >
            #{rank}
          </span>

          {/* Mini Squircle Add Logo */}
          <div className="relative w-5 h-5 rounded-md overflow-hidden bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 group-hover:border-indigo-400 flex items-center justify-center shrink-0 transition-colors">
            <Plus className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>

          {/* Placeholder Name */}
          <h5 className="text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            Submit new project (Slot #{rank})
          </h5>
        </div>

        {/* Right: Small action badge */}
        <div className="flex items-center gap-2 shrink-0 text-[10px]">
          <span className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded text-[9px] shrink-0 border border-indigo-200/70 dark:border-indigo-800/50 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
            <Plus className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
            <span>Submit</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Primary Empty Placeholder (Non-clickable filler slot) ────────────────── */

const PrimaryEmptyPlaceholder: React.FC<{ rank: number }> = ({ rank }) => (
  <div aria-hidden="true" className="relative rounded-2xl bg-slate-50/20 dark:bg-slate-800/10 border border-dashed border-slate-100/80 dark:border-white/[0.04] p-3 sm:p-3.5">
    <div className="flex items-start gap-3 opacity-30">
      <div className="flex flex-col items-center shrink-0">
        <div className={`inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] tracking-tight shrink-0 select-none ${primaryRankBadgeStyle(rank)}`}>
          <RankHatIcon rank={rank} className="w-2.5 h-2.5 shrink-0" />
          <span>{rank}</span>
        </div>
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/30 flex items-center justify-center shrink-0 mt-1" />
      </div>
      <div className="flex-1 min-w-0 pt-1 space-y-1.5">
        <div className="h-3.5 w-28 rounded bg-slate-200/60 dark:bg-slate-700/40" />
        <div className="h-2.5 w-40 rounded bg-slate-100/60 dark:bg-slate-700/30" />
      </div>
    </div>
  </div>
);

/* ─── Secondary Empty Placeholder (Non-clickable filler slot) ───────────────── */

const SecondaryEmptyPlaceholder: React.FC<{ rank: number }> = ({ rank }) => (
  <div aria-hidden="true" className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl opacity-25">
    <span
      className={`min-w-4 h-4 px-1 rounded flex items-center justify-center text-[8.5px] font-bold shrink-0 select-none ${secondaryRankBadgeStyle(rank)}`}
    >
      #{rank}
    </span>
    <div className="w-5 h-5 rounded-md bg-slate-200/50 dark:bg-slate-700/30 border border-dashed border-slate-200 dark:border-slate-700 shrink-0" />
    <div className="h-2.5 w-28 rounded bg-slate-200/50 dark:bg-slate-700/30" />
  </div>
);

/* ─── Vivid Category Card Component ────────────────────────────────────────── */

const CategorySection: React.FC<{
  category: CategoryData;
  index: number;
  now: number;
  onRecordClick: (id: string) => void;
  onOpenSubmit: (category?: ProductCategory) => void;
}> = ({ category, index, now, onRecordClick, onOpenSubmit }) => {
  const IconComponent = CATEGORY_ICONS[category.name] || Layers;
  const theme = CATEGORY_THEMES[category.name] || {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/20',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
  };

  const primaryRemaining = Math.max(0, 3 - category.primaryTopProjects.length);
  const secondaryRemaining = Math.max(0, 3 - category.secondaryRecentProjects.length);

  return (
    <section
      id={`category-${categorySlug(category.name)}`}
      className="categories-entrance h-full"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <div className="h-full rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-md transition-all duration-300 p-4 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Card Header: Vivid Category Badge, Title, Description, and Count */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ring-1 mt-0.5 ${theme.bg} ${theme.text} ${theme.ring}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {category.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl whitespace-nowrap">
                {category.projectCount} {category.projectCount === 1 ? 'project' : 'projects'}
              </span>
              <Link
                href={`/?category=${encodeURIComponent(category.name)}`}
                className="group/cta inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                <span>Explore all</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover/cta:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Primary List: Top 3 Ranked by Total Bid (with Placeholders if < 3) */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />
                <span>Top Ranked by Total Bid</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Primary Showcase
              </span>
            </div>

            <div className="space-y-2.5">
              {category.primaryTopProjects.map((project, i) => (
                <PrimaryCategoryRow
                  key={project.id}
                  project={project}
                  rank={i + 1}
                  onRecordClick={onRecordClick}
                />
              ))}

              {/* One clickable Submit placeholder, then silent empty slots */}
              {primaryRemaining > 0 &&
                Array.from({ length: primaryRemaining }).map((_, idx) => {
                  const rank = category.primaryTopProjects.length + idx + 1;
                  if (idx === 0) {
                    return (
                      <PrimaryCategoryPlaceholder
                        key={`prim-placeholder-${category.name}-${rank}`}
                        rank={rank}
                        categoryName={category.name}
                        onOpenSubmit={onOpenSubmit}
                      />
                    );
                  }
                  return (
                    <PrimaryEmptyPlaceholder
                      key={`prim-empty-${category.name}-${rank}`}
                      rank={rank}
                    />
                  );
                })}
            </div>
          </div>
        </div>

        {/* Secondary List: 3 Ranked by Most Recent Bid (with Placeholders if < 3) */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/70">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>Recent Bids</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Latest Activity
            </span>
          </div>

          <div className="space-y-1">
            {category.secondaryRecentProjects.map((project, i) => (
              <SecondaryCategoryRow
                key={project.id}
                product={project}
                rank={i + 1}
                now={now}
                onRecordClick={onRecordClick}
              />
            ))}

            {/* One clickable Submit placeholder, then silent empty slots */}
            {secondaryRemaining > 0 &&
              Array.from({ length: secondaryRemaining }).map((_, idx) => {
                const rank = category.secondaryRecentProjects.length + idx + 1;
                if (idx === 0) {
                  return (
                    <SecondaryCategoryPlaceholder
                      key={`sec-placeholder-${category.name}-${rank}`}
                      rank={rank}
                      categoryName={category.name}
                      onOpenSubmit={onOpenSubmit}
                    />
                  );
                }
                return (
                  <SecondaryEmptyPlaceholder
                    key={`sec-empty-${category.name}-${rank}`}
                    rank={rank}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Skeleton Loader ──────────────────────────────────────────────────────── */

const CategorySkeleton: React.FC = () => (
  <div className="rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-start gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
      <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
      </div>
      <div className="w-16 h-6 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
    </div>

    {/* Primary 3 Items Skeleton */}
    <div className="space-y-2.5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="rounded-2xl p-3 bg-slate-50/70 dark:bg-slate-800/50 flex items-start gap-3"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
      ))}
    </div>

    {/* Secondary 3 Items Skeleton */}
    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/70 space-y-2">
      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2 py-1">
          <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ─── Main Component ────────────────────────────────────────────────────────── */

export function CategoriesView() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isClientReady, setIsClientReady] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitCategory, setSubmitCategory] = useState<ProductCategory | undefined>(undefined);
  const [isSeoGuideOpen, setIsSeoGuideOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  const handleOpenSubmit = useCallback((cat?: ProductCategory) => {
    setSubmitCategory(cat);
    setIsSubmitOpen(true);
  }, []);

  // Real-time ticker for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Hydrate from localStorage (same pattern as DirectoryView)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedProducts = localStorage.getItem('indie_directory_products');
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(parsed.map((p: Product) => p.id));
            const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
            const hydrated = parsed.map((p: Product) => {
              const fallback = INITIAL_PRODUCTS.find((init) => init.id === p.id);
              const totalBid =
                p.totalBid ?? p.totalPaid ?? fallback?.totalBid ?? fallback?.totalPaid ?? 0;
              const totalClicks =
                p.totalClicks ?? p.clicks ?? fallback?.totalClicks ?? fallback?.clicks ?? 0;
              const domain =
                p.domain || fallback?.domain || extractDomain(p.websiteUrl || fallback?.websiteUrl);
              const categoryTags =
                p.categoryTags || fallback?.categoryTags || [p.category, ...(p.tags || [])];
              const mostRecentBid =
                p.mostRecentBid ||
                fallback?.mostRecentBid || {
                  bidPrice: totalBid,
                  bidTime: p.paidAt || fallback?.paidAt || p.launchDate || new Date().toISOString(),
                };

              return {
                ...p,
                domain,
                totalBid,
                totalPaid: totalBid,
                totalClicks,
                clicks: totalClicks,
                categoryTags,
                mostRecentBid,
              };
            });
            setProducts([...hydrated, ...missing]);
          }
        }
      } catch (e) {
        console.warn('Failed to load stored directory state:', e);
      } finally {
        setIsClientReady(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Scrollspy to automatically highlight the current category in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      let currentSlug: string | null = null;

      for (const cat of CATEGORIES) {
        const slug = categorySlug(cat);
        const el = document.getElementById(`category-${slug}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentSlug = slug;
            break;
          }
        }
      }

      if (currentSlug) {
        setActiveSlug(currentSlug);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Record outbound click
  const handleRecordClick = useCallback((productId: string) => {
    setProducts((prods) =>
      prods.map((p) => {
        if (p.id === productId) {
          const updatedClicks = (p.totalClicks ?? p.clicks ?? 0) + 1;
          return { ...p, totalClicks: updatedClicks, clicks: updatedClicks };
        }
        return p;
      })
    );
  }, []);

  // Add new submitted project
  const handleAddProduct = useCallback((newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  // Build category data with primary top 3 and secondary bottom 3
  const categoryData = useMemo(() => buildCategoryData(products), [products]);

  // Smooth scroll to category section
  const handleJumpTo = useCallback((slug: string) => {
    setActiveSlug(slug);
    const el = document.getElementById(`category-${slug}`);
    if (el) {
      const offset = 140; // account for sticky navbar + sticky category index
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0b0f19] pb-20 transition-colors duration-250">
      {/* Navigation */}
      <Navbar
        onOpenSubmit={() => handleOpenSubmit(undefined)}
        totalProducts={products.length}
        onOpenSeoInfo={() => setIsSeoGuideOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6">
        {/* Editorial Hero Section */}
        <CategoriesHero totalProducts={products.length} categoryCount={categoryData.length} />

        {/* Modern Sticky Category Selector */}
        <CategoryIndex
          categories={categoryData}
          activeSlug={activeSlug}
          onJumpTo={handleJumpTo}
        />

        {/* Category Dual-List Showcase Grid */}
        {!isClientReady ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {categoryData.map((cat, i) => (
              <CategorySection
                key={cat.name}
                category={cat}
                index={i}
                now={now}
                onRecordClick={handleRecordClick}
                onOpenSubmit={handleOpenSubmit}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 mt-16 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-indigo-300 dark:text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Deepchill Directory</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Directory
          </Link>
          <button
            onClick={() => setIsSeoGuideOpen(true)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            SEO Guidelines
          </button>
          <button
            onClick={() => handleOpenSubmit(undefined)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Submit Project
          </button>
        </div>
      </footer>

      {/* Modals */}
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => {
          setIsSubmitOpen(false);
          setSubmitCategory(undefined);
        }}
        onSubmitProduct={handleAddProduct}
        defaultCategory={submitCategory}
      />

      <SeoGuideModal
        isOpen={isSeoGuideOpen}
        onClose={() => setIsSeoGuideOpen(false)}
        onOpenSubmit={() => handleOpenSubmit(undefined)}
      />
    </div>
  );
}

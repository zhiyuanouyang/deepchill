'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Flame,
  Clock,
  Star,
  Plus,
  Bot,
  ShieldCheck,
  Tag,
  X,
  Layers,
  Terminal,
  Server,
  Zap,
  Palette,
  BarChart3,
  Wrench,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  TrendingProduct,
  NewestReleaseProduct,
  toTrendingProduct,
  toNewestReleaseProduct,
} from '@/lib/types';
import { extractDomain } from '@/lib/utils';
import { INITIAL_PRODUCTS } from '@/data/initial-products';
import { Navbar } from '@/components/navbar';
import { PrimaryProductListItem, SideProductListItem } from '@/components/product-list-item';
import { PaginationControls } from '@/components/pagination-controls';
import { CompoundSearchBar } from '@/components/compound-search-bar';
import { SubmitModal } from '@/components/submit-modal';
import { SeoGuideModal } from '@/components/seo-guide-modal';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'DevTools',
  'Open Source Infrastructure',
  'AI & Machine Learning',
  'Productivity',
  'Design & Creative',
  'SaaS & Analytics',
  'Security & Privacy',
  'Developer Utilities',
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  All: Layers,
  DevTools: Terminal,
  'Open Source Infrastructure': Server,
  'AI & Machine Learning': Bot,
  Productivity: Zap,
  'Design & Creative': Palette,
  'SaaS & Analytics': BarChart3,
  'Security & Privacy': ShieldCheck,
  'Developer Utilities': Wrench,
};

const PRIMARY_PAGE_SIZE = 6;
const SIDE_PAGE_SIZE = 6;

export function DirectoryView() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [isClientReady, setIsClientReady] = useState(false);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Pagination states
  const [primaryPage, setPrimaryPage] = useState(1);
  const [sidePage, setSidePage] = useState(1);

  // Discovery Mode: 'keyword' | 'ai'
  const [activeMode, setActiveMode] = useState<'keyword' | 'ai'>('keyword');

  // AI Filtering: populated only after user confirms Ask AI
  const [aiFilterIds, setAiFilterIds] = useState<string[] | null>(null);
  const [aiFilterQuery, setAiFilterQuery] = useState<string | null>(null);

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSeoGuideOpen, setIsSeoGuideOpen] = useState(false);

  // Handlers that reset pagination when filters change
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setPrimaryPage(1);
    setSidePage(1);
  };

  const handleCategoryChange = (cat: 'All' | ProductCategory) => {
    setSelectedCategory(cat);
    setPrimaryPage(1);
    setSidePage(1);
  };

  const handleTagChange = (tag: string | null) => {
    setActiveTag(tag);
    setPrimaryPage(1);
    setSidePage(1);
  };

  const handleModeChange = (newMode: 'keyword' | 'ai') => {
    setActiveMode(newMode);
    if (newMode === 'keyword') {
      setAiFilterIds(null);
      setAiFilterQuery(null);
    }
    setPrimaryPage(1);
    setSidePage(1);
  };

  // Hydrate from localStorage once client mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedProducts = localStorage.getItem('indie_directory_products');
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(parsed.map((p: Product) => p.id));
            const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));

            // Ensure any saved product gets proper defaults for ground-truth schema
            const hydrated = parsed.map((p: Product) => {
              const fallback = INITIAL_PRODUCTS.find((init) => init.id === p.id);
              // If seed product has legacy pre-Sept-17 test timestamp, refresh to realistic real-time seed timestamp
              const hasLegacySeedDate =
                fallback &&
                p.paidAt &&
                new Date(p.paidAt).getTime() < new Date('2026-09-17T00:00:00.000Z').getTime();

              const paidAt =
                (hasLegacySeedDate ? fallback?.paidAt : (p.paidAt ?? fallback?.paidAt)) ??
                p.launchDate ??
                new Date().toISOString();

              const totalBid =
                p.totalBid ?? p.totalPaid ?? fallback?.totalBid ?? fallback?.totalPaid ?? 0;
              const totalClicks =
                p.totalClicks ?? p.clicks ?? fallback?.totalClicks ?? fallback?.clicks ?? 0;
              const domain =
                p.domain ||
                fallback?.domain ||
                extractDomain(p.websiteUrl || fallback?.websiteUrl);
              const categoryTags =
                p.categoryTags ||
                fallback?.categoryTags || [p.category, ...(p.tags || [])];

              const mostRecentBid =
                (hasLegacySeedDate ? fallback?.mostRecentBid : p.mostRecentBid) ||
                fallback?.mostRecentBid || {
                  bidPrice: totalBid,
                  bidTime: paidAt,
                };

              return {
                ...p,
                domain,
                totalBid,
                totalPaid: totalBid,
                mostRecentBid,
                paidAt: mostRecentBid.bidTime,
                totalClicks,
                clicks: totalClicks,
                categoryTags,
              };
            });

            setProducts([...hydrated, ...missing]);
          }
        }

        const savedUpvotes = localStorage.getItem('indie_upvoted_ids');
        if (savedUpvotes) {
          const parsedVotes = JSON.parse(savedUpvotes);
          if (Array.isArray(parsedVotes)) {
            setUpvotedIds(new Set(parsedVotes));
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

  // Save products to localStorage on updates
  useEffect(() => {
    if (!isClientReady) return;
    try {
      localStorage.setItem('indie_directory_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to save products:', e);
    }
  }, [products, isClientReady]);

  // Save upvotes to localStorage on updates
  useEffect(() => {
    if (!isClientReady) return;
    try {
      localStorage.setItem('indie_upvoted_ids', JSON.stringify(Array.from(upvotedIds)));
    } catch (e) {
      console.warn('Failed to save upvotes:', e);
    }
  }, [upvotedIds, isClientReady]);



  // Record outbound click on product
  const handleRecordClick = (productId: string) => {
    setProducts((prods) =>
      prods.map((p) => {
        if (p.id === productId) {
          const updatedClicks = (p.totalClicks ?? p.clicks ?? 0) + 1;
          return {
            ...p,
            totalClicks: updatedClicks,
            clicks: updatedClicks,
          };
        }
        return p;
      })
    );
  };

  // Add new submitted project
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Base filtered products (common filter for category, pricing, tags, search)
  const baseFilteredProducts = useMemo(() => {
    return products.filter((product) => {
      // In Ask AI mode: if AI recommendation was confirmed, filter to recommended IDs
      if (activeMode === 'ai' && aiFilterIds !== null) {
        if (!aiFilterIds.some((id) => id.toLowerCase() === product.id.toLowerCase())) {
          return false;
        }
      }

      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (
        activeTag &&
        !(product.categoryTags || product.tags || []).some(
          (t) => t.toLowerCase() === activeTag.toLowerCase()
        )
      ) {
        return false;
      }

      // Keyword filtering applies only in Catalog mode
      if (activeMode === 'keyword' && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDomain = product.domain?.toLowerCase().includes(q);
        const matchTagline = product.tagline?.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchTags = (product.categoryTags || product.tags || []).some((t) =>
          t.toLowerCase().includes(q)
        );
        const matchMaker = product.makerName.toLowerCase().includes(q);
        if (!matchName && !matchDomain && !matchTagline && !matchDesc && !matchTags && !matchMaker) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, activeTag, searchQuery, activeMode, aiFilterIds]);

  // 1. Trending List: Partial projection from grounding truth, ranked by total bids
  const trendingProducts: TrendingProduct[] = useMemo(() => {
    return [...baseFilteredProducts]
      .sort((a, b) => {
        const aPaid = a.totalBid ?? a.totalPaid ?? 0;
        const bPaid = b.totalBid ?? b.totalPaid ?? 0;
        if (bPaid !== aPaid) {
          return bPaid - aPaid;
        }
        const aClicks = a.totalClicks ?? a.clicks ?? 0;
        const bClicks = b.totalClicks ?? b.clicks ?? 0;
        if (bClicks !== aClicks) {
          return bClicks - aClicks;
        }
        const aTime = new Date(
          a.mostRecentBid?.bidTime || a.paidAt || a.launchDate
        ).getTime();
        const bTime = new Date(
          b.mostRecentBid?.bidTime || b.paidAt || b.launchDate
        ).getTime();
        return bTime - aTime;
      })
      .map(toTrendingProduct);
  }, [baseFilteredProducts]);

  // 2. Newest List: Partial projection from grounding truth, ranked by latest bid timestamp
  const newestProducts: NewestReleaseProduct[] = useMemo(() => {
    return [...baseFilteredProducts]
      .sort((a, b) => {
        const aTime = new Date(
          a.mostRecentBid?.bidTime || a.paidAt || a.launchDate
        ).getTime();
        const bTime = new Date(
          b.mostRecentBid?.bidTime || b.paidAt || b.launchDate
        ).getTime();
        return bTime - aTime;
      })
      .map(toNewestReleaseProduct);
  }, [baseFilteredProducts]);

  // Paginated slices
  const totalTrendingPages = Math.max(1, Math.ceil(trendingProducts.length / PRIMARY_PAGE_SIZE));
  const paginatedTrending = useMemo(() => {
    const start = (primaryPage - 1) * PRIMARY_PAGE_SIZE;
    return trendingProducts.slice(start, start + PRIMARY_PAGE_SIZE);
  }, [trendingProducts, primaryPage]);

  const totalNewestPages = Math.max(1, Math.ceil(newestProducts.length / SIDE_PAGE_SIZE));
  const paginatedNewest = useMemo(() => {
    const start = (sidePage - 1) * SIDE_PAGE_SIZE;
    return newestProducts.slice(start, start + SIDE_PAGE_SIZE);
  }, [newestProducts, sidePage]);

  const openSourceCount = useMemo(() => {
    return products.filter((p) => p.pricing === 'Open Source').length;
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0b0f19] pb-20 transition-colors duration-250">
      {/* Background Liquid Ambient Light Blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full liquid-blob-1 blur-3xl pointer-events-none -z-10 animate-pulse duration-1000" />
      <div className="fixed top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full liquid-blob-2 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-[32rem] h-[32rem] rounded-full liquid-blob-3 blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        onOpenSubmit={() => setIsSubmitOpen(true)}
        totalProducts={products.length}
        onOpenSeoInfo={() => setIsSeoGuideOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <section className="pt-2 pb-6 sm:pb-8 text-center max-w-4xl mx-auto">
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white/80 dark:bg-slate-800/80 border border-indigo-100/80 dark:border-indigo-900/60 shadow-xs mb-5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>High-Authority Directory &amp; SEO Launchpad for Makers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
            Discover Great{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
              Indie &amp; Open Source
            </span>{' '}
            Projects
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-6 max-w-2xl mx-auto">
            A curated directory where independent developers launch their tools, gain real early
            traction, and earn verified, high-authority DoFollow backlinks for SEO.
          </p>

          {/* Metric Stats Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs font-medium text-slate-600 dark:text-slate-300 mb-8">
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                <strong className="text-slate-900 dark:text-white">{products.length}</strong> Curated Projects
              </span>
            </div>
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>
                <strong className="text-slate-900 dark:text-white">{openSourceCount}</strong> Open Source Repos
              </span>
            </div>
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong className="text-slate-900 dark:text-white">100%</strong> Direct DoFollow SEO Links
              </span>
            </div>
          </div>

          {/* Modern Compound SaaS Search Bar */}
          <CompoundSearchBar
            mode={activeMode}
            onModeChange={handleModeChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            products={products}
            onSelectProduct={(p) => {
              handleRecordClick(p.id);
              if (p.websiteUrl) {
                window.open(p.websiteUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            onApplyTagFilter={(tag) => {
              handleTagChange(tag);
              handleModeChange('keyword');
            }}
            activeTag={activeTag}
            onClearTagFilter={() => handleTagChange(null)}
            onAiFilterApply={(recommendedIds, query) => {
              setAiFilterIds(recommendedIds);
              setAiFilterQuery(query);
              setPrimaryPage(1);
              setSidePage(1);
            }}
            onAiFilterClear={() => {
              setAiFilterIds(null);
              setAiFilterQuery(null);
              setPrimaryPage(1);
              setSidePage(1);
            }}
          />
        </section>

        {/* Category & Filter Navigation Controls */}
        <section className="mb-6 space-y-3">
          {/* Main Category Bar */}
          <div className="liquid-glass rounded-2xl p-1.5 sm:p-2 shadow-xs border border-white/80 dark:border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1 py-0.5 scroll-smooth">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                const IconComponent = CATEGORY_ICONS[cat] || Layers;
                const count = categoryCounts[cat] ?? 0;

                return (
                  <button
                    key={cat}
                    id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    onClick={() => {
                      handleCategoryChange(cat);
                      handleTagChange(null);
                    }}
                    className={`group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm ring-1 ring-slate-900/10 dark:ring-indigo-500/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive
                          ? 'text-indigo-300 dark:text-indigo-200'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                        isActive
                          ? 'bg-slate-800 dark:bg-indigo-700/80 text-slate-300 dark:text-indigo-100'
                          : 'bg-slate-100/90 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-toolbar: Active Tags, Product Counter, and Reset */}
          <div className="flex items-center justify-between gap-3 px-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span>
                Showing <strong className="text-slate-900 dark:text-slate-200 font-bold">{baseFilteredProducts.length}</strong> of{' '}
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{products.length}</span> curated projects
                {activeMode === 'ai' && aiFilterQuery && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1.5 inline-flex items-center gap-1">
                    (AI matches for &quot;{aiFilterQuery}&quot;)
                  </span>
                )}
              </span>

              {/* Active Tag indicator */}
              {activeTag && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
                  <Tag className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  <span>Tag: #{activeTag}</span>
                  <button
                    onClick={() => handleTagChange(null)}
                    className="hover:text-indigo-950 dark:hover:text-white ml-0.5 cursor-pointer"
                    title="Remove tag filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Reset Filter Button */}
            {(searchQuery || selectedCategory !== 'All' || activeTag || (activeMode === 'ai' && aiFilterIds !== null)) && (
              <button
                id="clear-all-filters-btn"
                onClick={() => {
                  handleSearchChange('');
                  handleCategoryChange('All');
                  handleTagChange(null);
                  setAiFilterIds(null);
                  setAiFilterQuery(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </section>

        {/* Dual List View Layout (Primary: Trending on left, Secondary: Newest on right) */}
        {baseFilteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14 items-start">
            {/* Primary List: Trending (Takes ~67% / 8 cols) */}
            <section className="lg:col-span-8 flex flex-col space-y-4">
              {/* Primary Header */}
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Trending Projects
                    </h2>
                  </div>
                </div>

                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                  Ranked by Bids · Page {primaryPage} of {totalTrendingPages}
                </span>
              </div>

              {/* Primary List Items */}
              <div className="flex flex-col space-y-3.5">
                {paginatedTrending.map((product, idx) => (
                  <PrimaryProductListItem
                    key={product.id}
                    product={product}
                    rank={(primaryPage - 1) * PRIMARY_PAGE_SIZE + idx + 1}
                    onSelectTag={(tag) => setActiveTag(tag)}
                    onRecordClick={handleRecordClick}
                  />
                ))}
              </div>

              {/* Primary Pagination */}
              <PaginationControls
                currentPage={primaryPage}
                totalPages={totalTrendingPages}
                totalItems={trendingProducts.length}
                pageSize={PRIMARY_PAGE_SIZE}
                onPageChange={setPrimaryPage}
              />
            </section>

            {/* Secondary Side List: Newest Releases (Takes ~33% / 4 cols) */}
            <aside className="lg:col-span-4 flex flex-col space-y-4">
              {/* Secondary Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                    Newest Releases
                  </h3>
                </div>
              </div>

              {/* Secondary List Items */}
              <div className="flex flex-col space-y-2.5">
                {paginatedNewest.map((product, idx) => (
                  <SideProductListItem
                    key={product.id}
                    product={product}
                    rank={(sidePage - 1) * SIDE_PAGE_SIZE + idx + 1}
                    onRecordClick={handleRecordClick}
                  />
                ))}
              </div>

              {/* Side Pagination (Compact) */}
              <PaginationControls
                currentPage={sidePage}
                totalPages={totalNewestPages}
                totalItems={newestProducts.length}
                pageSize={SIDE_PAGE_SIZE}
                onPageChange={setSidePage}
                compact
              />
            </aside>
          </div>
        ) : (
          <div className="liquid-glass rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No matching projects found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              We couldn&apos;t find any project matching your exact criteria. Try broadening your keywords or submit the first tool in this category!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleSearchChange('');
                  handleCategoryChange('All');
                  handleTagChange(null);
                  setAiFilterIds(null);
                  setAiFilterQuery(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Clear Search
              </button>
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit It Now</span>
              </button>
            </div>
          </div>
        )}

        {/* SEO & Backlink Value Banner */}
        <section className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-white/10 shadow-md mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Indie Developer SEO Launchpad</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                Why Submit Your Indie or Open Source Product?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Backlinks remain one of Google&apos;s strongest organic ranking signals. We provide pure, uncloaked, direct canonical links on contextual pages tagged with your actual technologies. No tracking redirects, no artificial nofollow blocks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center lg:items-end">
              <button
                id="banner-submit-btn"
                onClick={() => setIsSubmitOpen(true)}
                className="liquid-btn-primary px-5 py-3 rounded-xl font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/10 dark:shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Project (Free)</span>
              </button>
              <button
                id="banner-seo-guide-btn"
                onClick={() => setIsSeoGuideOpen(true)}
                className="px-4 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs text-center transition-colors cursor-pointer shadow-xs"
              >
                Read SEO &amp; Backlink Architecture
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-indigo-300 dark:text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Indie &amp; Open Source Product Directory</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setIsSeoGuideOpen(true)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            SEO Guidelines
          </button>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Submit Tool
          </button>
          <button
            onClick={() => handleModeChange(activeMode === 'ai' ? 'keyword' : 'ai')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
          >
            Gemini AI Ask
          </button>
        </div>
      </footer>

      {/* Modals */}
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmitProduct={handleAddProduct}
      />

      <SeoGuideModal
        isOpen={isSeoGuideOpen}
        onClose={() => setIsSeoGuideOpen(false)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />
    </div>
  );
}

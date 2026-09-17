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
  Sparkles,
} from 'lucide-react';
import { Product, ProductCategory, PricingModel } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/data/initial-products';
import { Navbar } from '@/components/navbar';
import { PrimaryProductListItem, SideProductListItem } from '@/components/product-list-item';
import { PaginationControls } from '@/components/pagination-controls';
import { AiSearchPanel } from '@/components/ai-search-panel';
import { SubmitModal } from '@/components/submit-modal';
import { ProjectDetailModal } from '@/components/project-detail-modal';
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

const PRICING_FILTERS: ('All' | PricingModel)[] = ['All', 'Open Source', 'Free', 'Freemium', 'Paid'];

const PRIMARY_PAGE_SIZE = 6;
const SIDE_PAGE_SIZE = 6;

export function DirectoryView() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [isClientReady, setIsClientReady] = useState(false);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedPricing, setSelectedPricing] = useState<'All' | PricingModel>('All');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Pagination states
  const [primaryPage, setPrimaryPage] = useState(1);
  const [sidePage, setSidePage] = useState(1);

  // Discovery Mode: 'keyword' | 'ai'
  const [activeMode, setActiveMode] = useState<'keyword' | 'ai'>('keyword');

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isSeoGuideOpen, setIsSeoGuideOpen] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setPrimaryPage(1);
    setSidePage(1);
  }, [searchQuery, selectedCategory, selectedPricing, activeTag]);

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
            
            // Ensure any saved product gets proper defaults if missing totalPaid or paidAt
            const hydrated = parsed.map((p: Product) => {
              const fallback = INITIAL_PRODUCTS.find((init) => init.id === p.id);
              return {
                ...p,
                totalPaid: p.totalPaid ?? fallback?.totalPaid ?? 0,
                paidAt: p.paidAt ?? fallback?.paidAt ?? p.launchDate ?? new Date().toISOString(),
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

  // Handle Upvote toggle
  const handleUpvote = (productId: string) => {
    const isAlreadyUpvoted = upvotedIds.has(productId);

    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (isAlreadyUpvoted) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    setProducts((prods) =>
      prods.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            upvotes: isAlreadyUpvoted ? Math.max(0, p.upvotes - 1) : p.upvotes + 1,
          };
        }
        return p;
      })
    );

    if (detailProduct && detailProduct.id === productId) {
      setDetailProduct((prev) =>
        prev
          ? {
              ...prev,
              upvotes: isAlreadyUpvoted ? Math.max(0, prev.upvotes - 1) : prev.upvotes + 1,
            }
          : null
      );
    }
  };

  // Add new submitted project
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    // Automatically open its detail view
    setDetailProduct(newProduct);
  };

  // Base filtered products (common filter for category, pricing, tags, search)
  const baseFilteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedPricing !== 'All' && product.pricing !== selectedPricing) {
        return false;
      }
      if (activeTag && !product.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchTagline = product.tagline.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchTags = product.tags.some((t) => t.toLowerCase().includes(q));
        const matchMaker = product.makerName.toLowerCase().includes(q);
        if (!matchName && !matchTagline && !matchDesc && !matchTags && !matchMaker) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, selectedPricing, activeTag, searchQuery]);

  // 1. Trending List: Ranked by total paid bidding (higher = higher rank)
  const trendingProducts = useMemo(() => {
    return [...baseFilteredProducts].sort((a, b) => {
      const aPaid = a.totalPaid ?? 0;
      const bPaid = b.totalPaid ?? 0;
      if (bPaid !== aPaid) {
        return bPaid - aPaid;
      }
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes;
      }
      const aTime = new Date(a.paidAt || a.launchDate).getTime();
      const bTime = new Date(b.paidAt || b.launchDate).getTime();
      return bTime - aTime;
    });
  }, [baseFilteredProducts]);

  // 2. Newest List: Ranked by payment timestamp (latest paid shows first)
  const newestProducts = useMemo(() => {
    return [...baseFilteredProducts].sort((a, b) => {
      const aTime = new Date(a.paidAt || a.launchDate).getTime();
      const bTime = new Date(b.paidAt || b.launchDate).getTime();
      return bTime - aTime;
    });
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

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-900 bg-slate-50/60 pb-20">
      {/* Background Liquid Ambient Light Blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full liquid-blob-1 blur-3xl pointer-events-none -z-10 animate-pulse duration-1000" />
      <div className="fixed top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full liquid-blob-2 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-[32rem] h-[32rem] rounded-full liquid-blob-3 blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        onOpenSubmit={() => setIsSubmitOpen(true)}
        activeMode={activeMode}
        onToggleMode={(mode) => setActiveMode(mode)}
        totalProducts={products.length}
        onOpenSeoInfo={() => setIsSeoGuideOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <section className="pt-2 pb-8 sm:pb-10 text-center max-w-3xl mx-auto">
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 bg-white/80 border border-indigo-100/80 shadow-xs mb-5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>High-Authority Directory &amp; SEO Launchpad for Makers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            Discover Great{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
              Indie &amp; Open Source
            </span>{' '}
            Projects
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-6">
            A curated directory where independent developers launch their tools, gain real early
            traction, and earn verified, high-authority DoFollow backlinks for SEO.
          </p>

          {/* Metric Stats Pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-xs font-medium text-slate-600 mb-8">
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                <strong>{products.length}</strong> Curated Projects
              </span>
            </div>
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>
                <strong>{openSourceCount}</strong> Open Source Repos
              </span>
            </div>
            <div className="liquid-glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                <strong>100%</strong> Direct DoFollow SEO Links
              </span>
            </div>
          </div>

          {/* Quick Search & AI Toggle Bar */}
          <div className="max-w-2xl mx-auto">
            {activeMode === 'keyword' ? (
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  id="main-keyword-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by project name, keywords, tech stack (e.g. Postgres, Docker)..."
                  className="w-full liquid-glass-input rounded-2xl pl-12 pr-28 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-24 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
                <button
                  id="hero-switch-ai-btn"
                  onClick={() => setActiveMode('ai')}
                  className="absolute right-2 top-2 bottom-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Switch to conversational Gemini AI search"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {/* AI Ask Search Panel (active when AI mode is enabled) */}
        {activeMode === 'ai' && (
          <AiSearchPanel
            products={products}
            onSelectProduct={(p) => setDetailProduct(p)}
            onApplyTagFilter={(tag) => {
              setActiveTag(tag);
              setActiveMode('keyword');
            }}
            onClose={() => setActiveMode('keyword')}
          />
        )}

        {/* Category & Filter Navigation Controls */}
        <section className="mb-6 space-y-4">
          {/* Categories Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveTag(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'liquid-btn-primary text-white shadow-sm'
                      : 'liquid-glass text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Secondary Filters: Pricing Model, Active Tag, Clear filters (Sorting buttons removed) */}
          <div className="liquid-glass rounded-2xl p-3 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 flex-wrap text-xs font-medium">
            {/* Pricing pills */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-400 mr-1 hidden sm:inline">Pricing:</span>
              {PRICING_FILTERS.map((pf) => (
                <button
                  key={pf}
                  id={`pricing-filter-${pf.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                  onClick={() => setSelectedPricing(pf)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedPricing === pf
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {pf}
                </button>
              ))}
            </div>

            {/* Active Tag indicator */}
            {activeTag && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
                <Tag className="w-3 h-3" />
                <span>Tag: #{activeTag}</span>
                <button
                  onClick={() => setActiveTag(null)}
                  className="hover:text-indigo-950 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Directory Results Counter / Reset */}
            <div className="flex items-center gap-3 ml-auto text-slate-500 font-medium">
              <span>
                Matching <strong>{baseFilteredProducts.length}</strong> of{' '}
                <strong>{products.length}</strong> products
              </span>
              {(searchQuery || selectedCategory !== 'All' || selectedPricing !== 'All' || activeTag) && (
                <button
                  id="clear-all-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedPricing('All');
                    setActiveTag(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Dual List View Layout (Primary: Trending on left, Secondary: Newest on right) */}
        {baseFilteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14 items-start">
            {/* Primary List: Trending (Takes ~67% / 8 cols) */}
            <section className="lg:col-span-8 flex flex-col space-y-4">
              {/* Primary Header */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Trending Projects</span>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                        Ranked by Total Paid Bids
                      </span>
                    </h2>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Page {primaryPage} of {totalTrendingPages}
                </span>
              </div>

              {/* List View Items */}
              <div className="flex flex-col space-y-3">
                {paginatedTrending.map((product, idx) => (
                  <PrimaryProductListItem
                    key={product.id}
                    product={product}
                    rank={(primaryPage - 1) * PRIMARY_PAGE_SIZE + idx + 1}
                    onSelectTag={(tag) => setActiveTag(tag)}
                    onOpenDetails={(p) => setDetailProduct(p)}
                    onUpvote={handleUpvote}
                    isUpvoted={upvotedIds.has(product.id)}
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
              {/* Side Header */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Newest Releases
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Latest Paid
                </span>
              </div>

              {/* Side List Items */}
              <div className="flex flex-col space-y-2.5">
                {paginatedNewest.map((product) => (
                  <SideProductListItem
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setDetailProduct(p)}
                    onUpvote={handleUpvote}
                    isUpvoted={upvotedIds.has(product.id)}
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
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching projects found</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We couldn&apos;t find any project matching your exact criteria. Try broadening your keywords or submit the first tool in this category!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedPricing('All');
                  setActiveTag(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Clear Search
              </button>
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="liquid-btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit It Now</span>
              </button>
            </div>
          </div>
        )}

        {/* SEO & Backlink Value Banner */}
        <section className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Indie Developer SEO Launchpad</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Why Submit Your Indie or Open Source Product?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Backlinks remain one of Google&apos;s strongest organic ranking signals. We provide pure, uncloaked, direct canonical links on contextual pages tagged with your actual technologies. No tracking redirects, no artificial nofollow blocks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center lg:items-end">
              <button
                id="banner-submit-btn"
                onClick={() => setIsSubmitOpen(true)}
                className="liquid-btn-primary px-5 py-3 rounded-xl font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/10"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Project (Free)</span>
              </button>
              <button
                id="banner-seo-guide-btn"
                onClick={() => setIsSeoGuideOpen(true)}
                className="px-4 py-2.5 rounded-xl font-semibold text-slate-700 hover:text-indigo-600 bg-white/70 hover:bg-white border border-slate-200/80 text-xs text-center transition-colors cursor-pointer"
              >
                Read SEO &amp; Backlink Architecture
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-200/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
          </div>
          <span className="font-bold text-slate-800">Indie &amp; Open Source Product Directory</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setIsSeoGuideOpen(true)}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            SEO Guidelines
          </button>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Submit Tool
          </button>
          <button
            onClick={() => setActiveMode(activeMode === 'ai' ? 'keyword' : 'ai')}
            className="hover:text-indigo-600 transition-colors text-indigo-600 font-semibold cursor-pointer"
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

      <ProjectDetailModal
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onUpvote={handleUpvote}
        isUpvoted={detailProduct ? upvotedIds.has(detailProduct.id) : false}
      />

      <SeoGuideModal
        isOpen={isSeoGuideOpen}
        onClose={() => setIsSeoGuideOpen(false)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />
    </div>
  );
}

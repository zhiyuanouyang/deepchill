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
} from 'lucide-react';
import { Product, ProductCategory, PricingModel } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/data/initial-products';
import { Navbar } from '@/components/navbar';
import { ProductCard } from '@/components/product-card';
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

export function DirectoryView() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [isClientReady, setIsClientReady] = useState(false);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedPricing, setSelectedPricing] = useState<'All' | PricingModel>('All');
  const [activeSort, setActiveSort] = useState<'trending' | 'newest' | 'featured'>('trending');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Discovery Mode: 'keyword' | 'ai'
  const [activeMode, setActiveMode] = useState<'keyword' | 'ai'>('keyword');

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isSeoGuideOpen, setIsSeoGuideOpen] = useState(false);

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
            setProducts([...parsed, ...missing]);
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
    // Automatically open its detail view to show badge code
    setDetailProduct(newProduct);
  };

  // Filtered & Sorted products calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
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
      })
      .sort((a, b) => {
        if (activeSort === 'trending') {
          return b.upvotes - a.upvotes;
        }
        if (activeSort === 'newest') {
          return new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime();
        }
        if (activeSort === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.upvotes - a.upvotes;
        }
        return 0;
      });
  }, [products, selectedCategory, selectedPricing, activeTag, searchQuery, activeSort]);

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
        <section className="pt-2 pb-10 sm:pb-12 text-center max-w-3xl mx-auto">
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

          {/* Secondary Filters: Pricing Model, Active Tag, Sorting */}
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

            {/* Sorting controls */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-slate-400 mr-1 hidden md:inline">Sort:</span>
              <button
                id="sort-trending-btn"
                onClick={() => setActiveSort('trending')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSort === 'trending'
                    ? 'bg-white font-bold text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending</span>
              </button>
              <button
                id="sort-newest-btn"
                onClick={() => setActiveSort('newest')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSort === 'newest'
                    ? 'bg-white font-bold text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Newest</span>
              </button>
              <button
                id="sort-featured-btn"
                onClick={() => setActiveSort('featured')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSort === 'featured'
                    ? 'bg-white font-bold text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-violet-500" />
                <span>Featured</span>
              </button>
            </div>
          </div>
        </section>

        {/* Directory Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-4 px-1">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of{' '}
            <strong>{products.length}</strong> indie projects
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
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectTag={(tag) => setActiveTag(tag)}
                onOpenDetails={(p) => setDetailProduct(p)}
                onUpvote={handleUpvote}
                isUpvoted={upvotedIds.has(product.id)}
              />
            ))}
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

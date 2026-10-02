'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Check,
  ChevronDown,
  ArrowUp,
  Compass,
  TrendingUp,
  ArrowDownAZ,
  Layers,
} from 'lucide-react';
import { ProductCategory } from '@/lib/types';
import { getCategoryIcon } from '@/components/category-combobox';

export interface CategoryIndexItem {
  id?: string;
  name: ProductCategory;
  projectCount: number;
  description?: string;
}

export interface CategoryIndexBarProps {
  categories: CategoryIndexItem[];
  activeSlug: string | null;
  onJumpTo: (slug: string) => void;
  className?: string;
}

export function categorySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function CategoryIndexBar({
  categories,
  activeSlug,
  onJumpTo,
  className = '',
}: CategoryIndexBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverButtonRef = useRef<HTMLButtonElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverSearch, setPopoverSearch] = useState('');
  const [popoverSort, setPopoverSort] = useState<'page' | 'count' | 'alpha'>('page');

  // Filter out categories with zero count from the horizontal bar unless it's currently the active slug
  const visibleCategories = useMemo(() => {
    return categories.filter((cat) => {
      const slug = categorySlug(cat.name);
      if (activeSlug && slug === activeSlug) return true;
      return (cat.projectCount ?? 0) > 0;
    });
  }, [categories, activeSlug]);

  // Check scroll boundary state to toggle left/right scroll navigation buttons
  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const hasLeft = el.scrollLeft > 2;
    const hasRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;

    setCanScrollLeft(hasLeft);
    setCanScrollRight(hasRight);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollState();

    const handleScroll = () => {
      checkScrollState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollState);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState, visibleCategories]);

  // Bidirectional sync: As the user scrolls the page and activeSlug changes,
  // automatically scroll the sticky category bar to keep the active category chip visible in center
  useEffect(() => {
    if (!activeSlug) return;
    const activeEl = itemRefs.current[activeSlug];
    if (activeEl && scrollContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeSlug]);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPopoverOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        popoverButtonRef.current &&
        !popoverButtonRef.current.contains(target)
      ) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  // Scroll actions
  const scrollByDelta = (delta: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  // Support mouse wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  // Categories in the Quick Index Popover
  const popoverCategories = useMemo(() => {
    let list = categories.filter((c) => (c.projectCount ?? 0) > 0);

    const q = popoverSearch.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      if (popoverSort === 'count') {
        const countDiff = (b.projectCount ?? 0) - (a.projectCount ?? 0);
        if (countDiff !== 0) return countDiff;
      } else if (popoverSort === 'alpha') {
        return a.name.localeCompare(b.name);
      }
      return 0; // 'page' preserves natural page order
    });
  }, [categories, popoverSearch, popoverSort]);

  const handleItemClick = (slug: string) => {
    onJumpTo(slug);
    setIsPopoverOpen(false);
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsPopoverOpen(false);
  };

  const totalActiveCount = useMemo(() => {
    return categories.filter((c) => (c.projectCount ?? 0) > 0).length;
  }, [categories]);

  return (
    <nav
      aria-label="Categories page section navigation"
      className={`sticky top-16 sm:top-20 z-30 mb-6 sm:mb-8 categories-entrance ${className}`}
    >
      {/* Main Glass Bar Container */}
      <div className="liquid-glass rounded-2xl p-1.5 sm:p-2 shadow-sm border border-white/80 dark:border-white/10 flex items-center relative gap-1.5 sm:gap-2">
        {/* Scrollable Track Section */}
        <div
          className="relative flex-1 min-w-0 overflow-hidden flex items-center"
          onWheel={handleWheel}
        >
          {/* Scroll Left Button & Fade Gradient */}
          {canScrollLeft && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/95 dark:from-[#0b0f19]/95 to-transparent pointer-events-none z-10 rounded-l-xl" />
              <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20">
                <button
                  type="button"
                  onClick={() => scrollByDelta(-280)}
                  aria-label="Scroll categories left"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 shadow-md border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Scrollable Category Chips Track */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1 py-0.5 scroll-smooth"
          >
            {visibleCategories.map((cat) => {
              const slug = categorySlug(cat.name);
              const isActive = activeSlug === slug;
              const IconComponent = getCategoryIcon(cat.name);
              const count = cat.projectCount ?? 0;

              return (
                <button
                  key={cat.name}
                  ref={(el) => {
                    itemRefs.current[slug] = el;
                  }}
                  id={`cat-nav-${slug}`}
                  onClick={() => handleItemClick(slug)}
                  title={`Jump to ${cat.name}`}
                  className={`group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
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
                  <span>{cat.name}</span>
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

          {/* Scroll Right Button & Fade Gradient */}
          {canScrollRight && (
            <>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/95 dark:from-[#0b0f19]/95 to-transparent pointer-events-none z-10 rounded-r-xl" />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20">
                <button
                  type="button"
                  onClick={() => scrollByDelta(280)}
                  aria-label="Scroll categories right"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 shadow-md border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-800 shrink-0" />

        {/* Pinned Quick Index / Jump Popover Trigger */}
        <div className="relative shrink-0">
          <button
            ref={popoverButtonRef}
            type="button"
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            aria-expanded={isPopoverOpen}
            aria-haspopup="true"
            id="categories-quick-index-btn"
            className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
              isPopoverOpen
                ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-500 shadow-sm'
                : 'text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
            }`}
          >
            <Compass
              className={`w-3.5 h-3.5 transition-colors ${
                isPopoverOpen ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'
              }`}
            />
            <span className="hidden sm:inline">Quick Jump</span>
            <span className="sm:hidden">Jump</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isPopoverOpen
                  ? 'bg-slate-800 dark:bg-indigo-700 text-slate-200 dark:text-indigo-100'
                  : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50'
              }`}
            >
              {totalActiveCount}
            </span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                isPopoverOpen ? 'rotate-180 text-white' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Quick Index Dropdown Popover */}
          {isPopoverOpen && (
            <div
              ref={popoverRef}
              className="absolute right-0 top-full mt-2 w-[320px] sm:w-[380px] max-w-[calc(100vw-24px)] z-50 rounded-2xl liquid-glass border border-slate-200/90 dark:border-slate-700/90 shadow-2xl backdrop-blur-2xl p-3.5 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/70 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Page Index
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Jump straight to any category section
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPopoverOpen(false)}
                  className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Instant Search Bar */}
              <div className="relative mb-2.5">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={popoverSearch}
                  onChange={(e) => setPopoverSearch(e.target.value)}
                  placeholder="Find category on this page..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                {popoverSearch && (
                  <button
                    type="button"
                    onClick={() => setPopoverSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort Tabs for TOC */}
              <div className="flex items-center justify-between gap-1 mb-2 px-0.5 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {popoverCategories.length} {popoverCategories.length === 1 ? 'category' : 'categories'}
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setPopoverSort('page')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors cursor-pointer ${
                      popoverSort === 'page'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Order</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopoverSort('count')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors cursor-pointer ${
                      popoverSort === 'count'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Popular</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopoverSort('alpha')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors cursor-pointer ${
                      popoverSort === 'alpha'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ArrowDownAZ className="w-3 h-3" />
                    <span>A-Z</span>
                  </button>
                </div>
              </div>

              {/* Categories Scrollable List */}
              <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {popoverCategories.map((cat) => {
                  const slug = categorySlug(cat.name);
                  const isCurrent = activeSlug === slug;
                  const Icon = getCategoryIcon(cat.name);
                  const count = cat.projectCount ?? 0;

                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleItemClick(slug)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/80 dark:border-indigo-800/80'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isCurrent
                              ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    </button>
                  );
                })}

                {popoverCategories.length === 0 && (
                  <div className="py-5 text-center text-xs text-slate-400">
                    No categories found matching &quot;{popoverSearch}&quot;
                  </div>
                )}
              </div>

              {/* Popover Footer: Top of Page Action */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {categories.length} total sections
                </span>
                <button
                  type="button"
                  onClick={handleBackToTop}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Back to Top</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Bot,
  X,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Tag,
  RefreshCw,
  CornerDownLeft,
} from 'lucide-react';
import { Product, AiAskResponse } from '@/lib/types';

interface CompoundSearchBarProps {
  mode: 'keyword' | 'ai';
  onModeChange: (mode: 'keyword' | 'ai') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onApplyTagFilter: (tag: string) => void;
  activeTag: string | null;
  onClearTagFilter: () => void;
  onAiFilterApply?: (recommendedIds: string[], query: string) => void;
  onAiFilterClear?: () => void;
}


export const CompoundSearchBar: React.FC<CompoundSearchBarProps> = ({
  mode,
  onModeChange,
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
  onApplyTagFilter,
  activeTag,
  onClearTagFilter,
  onAiFilterApply,
  onAiFilterClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiAskResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Global keyboard shortcut: cmd+k or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (
        e.key === '/' &&
        document.activeElement !== inputRef.current &&
        !(
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRunAi = async (overridePrompt?: string) => {
    const text = (overridePrompt ?? aiQuery).trim();
    if (!text) return;

    if (overridePrompt) {
      setAiQuery(overridePrompt);
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            tagline: p.tagline,
            category: p.category,
            pricing: p.pricing,
            tags: p.tags,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: AiAskResponse = await res.json();
      setAiResponse(data);
      if (onAiFilterApply) {
        onAiFilterApply(data.recommendedProductIds || [], text);
      }
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Unable to reach AI assistant. Please try again.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (mode === 'ai') {
        e.preventDefault();
        handleRunAi();
      }
    } else if (e.key === 'Escape') {
      if (mode === 'ai') {
        if (aiQuery) {
          setAiQuery('');
          setAiResponse(null);
          onAiFilterClear?.();
        } else if (aiResponse) {
          setAiResponse(null);
          onAiFilterClear?.();
        }
      } else {
        if (searchQuery) {
          onSearchChange('');
        }
      }
    }
  };

  const handleDismissAi = () => {
    setAiResponse(null);
    onAiFilterClear?.();
  };

  const recommendedProducts = React.useMemo(() => {
    if (!aiResponse || !aiResponse.recommendedProductIds) return [];
    return aiResponse.recommendedProductIds
      .map((id) => products.find((p) => p.id.toLowerCase() === id.toLowerCase()))
      .filter((p): p is Product => Boolean(p));
  }, [aiResponse, products]);

  const isAi = mode === 'ai';

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 transition-all">
      {/* Compound Search Box Container */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 transition-all duration-300 liquid-glass border ${
          isAi
            ? 'border-indigo-300/80 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20'
            : 'border-slate-200/90 shadow-lg shadow-slate-900/5 hover:border-slate-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/15'
        }`}
      >
        {/* Subtle AI gradient aura highlight on top border */}
        {isAi && (
          <div className="absolute -top-[1px] left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full pointer-events-none" />
        )}

        <div className="flex items-center gap-2">
          {/* Space-optimized Compact Mode Selector */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100/90 border border-slate-200/70 text-xs shrink-0">
            <button
              type="button"
              id="searchbar-mode-catalog"
              onClick={() => {
                onModeChange('keyword');
                inputRef.current?.focus();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                !isAi
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
              title="Filter catalog live by keyword"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catalog</span>
            </button>

            <button
              type="button"
              id="searchbar-mode-ai"
              onClick={() => {
                onModeChange('ai');
                inputRef.current?.focus();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                isAi
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-indigo-600 font-medium'
              }`}
              title="Conversational Gemini AI search"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAi ? 'text-indigo-200' : 'text-indigo-500'}`} />
              <span>AI</span>
            </button>
          </div>

          {/* Search Input Field with dynamic context */}
          <div className="relative flex-1 flex items-center min-w-0">
            <input
              ref={inputRef}
              id="compound-search-input"
              type="text"
              value={isAi ? aiQuery : searchQuery}
              onChange={(e) => {
                if (isAi) {
                  // In Ask AI mode: buffer user typing locally without triggering live list filtering
                  setAiQuery(e.target.value);
                } else {
                  // In Catalog mode: live instant filter
                  onSearchChange(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isAi
                  ? "Ask AI anything (e.g. 'Open-source Firebase alternative with SQL')..."
                  : 'Search 28+ indie tools, tech stack, makers...'
              }
              className="w-full bg-transparent px-2.5 py-1.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none border-0"
            />

            {/* Clear Input Button */}
            {(isAi ? aiQuery : searchQuery) && (
              <button
                type="button"
                id="searchbar-clear-btn"
                onClick={() => {
                  if (isAi) {
                    setAiQuery('');
                    setAiResponse(null);
                    onAiFilterClear?.();
                  } else {
                    onSearchChange('');
                  }
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer mr-1"
                title="Clear query (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 shrink-0 pr-1">
            {isAi ? (
              <button
                type="button"
                id="searchbar-ai-submit-btn"
                onClick={() => handleRunAi()}
                disabled={aiLoading || !aiQuery.trim()}
                className="liquid-btn-primary bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Ask AI</span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-indigo-200 hidden sm:inline" />
                  </>
                )}
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Pill indicator if activeTag is set */}
      {activeTag && (
        <div className="mt-2.5 flex items-center gap-2 px-1">
          <span className="text-xs text-slate-500">Filtered by tag:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            #{activeTag}
            <button
              onClick={onClearTagFilter}
              className="hover:text-indigo-900 transition-colors cursor-pointer"
              title="Clear tag filter"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}


      {/* Error Notice */}
      {aiError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          {aiError}
        </div>
      )}

      {/* Embedded AI Intelligence Card (shown when AI response is confirmed and returned) */}
      {aiResponse && (
        <div className="mt-4 rounded-3xl liquid-glass p-5 sm:p-7 border border-indigo-200/70 shadow-xl shadow-indigo-500/5 animate-in fade-in duration-300">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Gemini AI Recommendation
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Filtered directory matches displayed below
                </p>
              </div>
            </div>

            <button
              type="button"
              id="ai-clear-results-btn"
              onClick={handleDismissAi}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close AI analysis and reset directory view"
            >
              <RefreshCw className="w-3 h-3" /> Dismiss
            </button>
          </div>

          {/* AI Answer Text */}
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal mb-5">
            {aiResponse.answer}
          </p>

          {/* Key Takeaways */}
          {aiResponse.keyTakeaways && aiResponse.keyTakeaways.length > 0 && (
            <div className="mb-5 p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80">
              <h4 className="text-xs font-bold text-indigo-900 mb-2">Key Highlights</h4>
              <ul className="space-y-1.5">
                {aiResponse.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Matching Products Cards */}
          {recommendedProducts.length > 0 ? (
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Recommended Directory Matches ({recommendedProducts.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    id={`ai-match-card-${p.id}`}
                    onClick={() => onSelectProduct(p)}
                    className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer group shadow-2xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-slate-600 font-semibold">
                          {p.pricing}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                        {p.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                      <span>{p.category}</span>
                      <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic mb-4">
              Explore the full catalog below to filter by category or tech stack.
            </p>
          )}

          {/* Related search tags */}
          {aiResponse.searchTags && aiResponse.searchTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Filter by tag:
              </span>
              {aiResponse.searchTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  id={`ai-tag-filter-${tag.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                  onClick={() => onApplyTagFilter(tag)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

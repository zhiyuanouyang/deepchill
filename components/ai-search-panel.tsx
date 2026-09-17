'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { Product, AiAskResponse } from '@/lib/types';

interface AiSearchPanelProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onApplyTagFilter: (tag: string) => void;
  onClose: () => void;
}

const SAMPLE_PROMPTS = [
  'Open source Firebase alternative with real-time & SQL',
  'Self-hosted Heroku replacement for Docker containers',
  'Fast, Git-friendly API client without cloud sync',
  'Open source DocuSign alternative for digital signatures',
  'Interactive whiteboard with hand-drawn style',
];

export const AiSearchPanel: React.FC<AiSearchPanelProps> = ({
  products,
  onSelectProduct,
  onApplyTagFilter,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiAskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (promptToUse?: string) => {
    const text = promptToUse || query;
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

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
        throw new Error(`Server returned ${res.status}`);
      }

      const data: AiAskResponse = await res.json();
      setResponse(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach AI assistant. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const recommendedProducts = React.useMemo(() => {
    if (!response || !response.recommendedProductIds) return [];
    return response.recommendedProductIds
      .map((id) => products.find((p) => p.id.toLowerCase() === id.toLowerCase()))
      .filter((p): p is Product => Boolean(p));
  }, [response, products]);

  return (
    <div className="liquid-glass rounded-3xl p-5 sm:p-7 border border-indigo-200/50 shadow-lg mb-8 relative overflow-hidden">
      {/* Header bar inside panel */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Gemini AI Search &amp; Discovery
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Natural Language
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Ask in plain English: find open-source alternatives, indie stacks, or tools by problem
            </p>
          </div>
        </div>

        <button
          id="ai-panel-close-btn"
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer"
        >
          Switch to Standard
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-4">
        <input
          id="ai-query-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk();
          }}
          placeholder="e.g., 'What is the best self-hosted alternative to Heroku for Docker apps?'"
          className="w-full liquid-glass-input rounded-2xl pl-4 pr-28 sm:pr-32 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all"
        />
        <button
          id="ai-ask-submit-btn"
          onClick={() => handleAsk()}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 px-4 rounded-xl liquid-btn-primary text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
            </>
          ) : (
            <>
              <span>Ask AI</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            </>
          )}
        </button>
      </div>

      {/* Suggested prompts pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Suggestions:
        </span>
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            id={`sample-prompt-${prompt.slice(0, 10).toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            onClick={() => {
              setQuery(prompt);
              handleAsk(prompt);
            }}
            className="text-xs px-3 py-1 rounded-full bg-white/70 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200/80 transition-all text-left cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-4">
          {error}
        </div>
      )}

      {/* AI Response Output */}
      {response && (
        <div className="rounded-2xl bg-white/90 p-5 sm:p-6 border border-slate-200/80 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Gemini Analysis &amp; Recommendation
              </h3>
            </div>
            <button
              id="ai-reset-results-btn"
              onClick={() => {
                setResponse(null);
                setQuery('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
          </div>

          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal mb-5">
            {response.answer}
          </p>

          {/* Key takeaways */}
          {response.keyTakeaways && response.keyTakeaways.length > 0 && (
            <div className="mb-5 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-700 mb-2">Key Highlights</h4>
              <ul className="space-y-1.5">
                {response.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Matching Products from Directory */}
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
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">
                          {p.pricing}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                        {p.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-200/60">
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
              No direct name matches in the directory, but you can explore our full catalog below!
            </p>
          )}

          {/* Related search tags */}
          {response.searchTags && response.searchTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Filter by tag:
              </span>
              {response.searchTags.map((tag) => (
                <button
                  key={tag}
                  id={`ai-tag-filter-${tag.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                  onClick={() => onApplyTagFilter(tag)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors cursor-pointer"
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

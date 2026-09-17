'use client';

import React from 'react';
import { ExternalLink, ArrowUpRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GithubIcon } from './icons';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onSelectTag: (tag: string) => void;
  onOpenDetails: (product: Product) => void;
  onUpvote: (productId: string) => void;
  isUpvoted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectTag,
  onOpenDetails,
  onUpvote,
  isUpvoted = false,
}) => {
  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpvote(product.id);

    // Trigger subtle confetti burst on upvoting
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    try {
      confetti({
        particleCount: 22,
        spread: 45,
        origin: { x, y },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'],
        ticks: 120,
      });
    } catch {
      // Ignore if confetti context fails
    }
  };

  const getPricingBadge = (pricing: Product['pricing']) => {
    switch (pricing) {
      case 'Open Source':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Free':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
      case 'Freemium':
        return 'bg-violet-50 text-violet-700 border-violet-200/80';
      case 'Paid':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  return (
    <article
      id={`product-card-${product.id}`}
      className="liquid-glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top subtle highlight reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

      {/* Card Header: Logo, Title, Badges, Upvote */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-start gap-3.5">
            {/* Logo or initial placeholder */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-50 border border-white shadow-inner flex items-center justify-center shrink-0">
              {product.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.logoUrl}
                  alt={`${product.name} logo`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to text initials if image fails
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="font-extrabold text-indigo-700 text-lg select-none">
                {product.name.charAt(0)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id={`product-title-${product.id}`}
                  onClick={() => onOpenDetails(product)}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight text-left cursor-pointer"
                >
                  {product.name}
                </button>
                {product.featured && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100/80 text-indigo-700 border border-indigo-200/60">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPricingBadge(
                    product.pricing
                  )}`}
                >
                  {product.pricing}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-[11px] font-medium text-slate-500">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Upvote Button */}
          <button
            id={`upvote-btn-${product.id}`}
            onClick={handleUpvoteClick}
            className={`flex flex-col items-center justify-center min-w-[50px] px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
              isUpvoted
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-500/20'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 border-slate-200/90 shadow-sm'
            }`}
            title="Upvote this project to increase its visibility rank"
          >
            <ArrowUpRight
              className={`w-4 h-4 transition-transform ${
                isUpvoted ? 'rotate-[-45deg] scale-110' : '-rotate-45 group-hover:translate-x-0.5'
              }`}
            />
            <span className="text-xs font-bold leading-tight mt-0.5">
              {product.upvotes}
            </span>
          </button>
        </div>

        {/* Tagline */}
        <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-snug mb-3">
          {product.tagline}
        </p>

        {/* Short description preview */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.tags.slice(0, 4).map((tag) => (
            <button
              key={tag}
              id={`tag-${product.id}-${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTag(tag);
              }}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 bg-slate-100/90 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/70 transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
          {product.tags.length > 4 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{product.tags.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Maker, GitHub Stars, Direct Links */}
      <div className="pt-3 border-t border-slate-100/90 flex items-center justify-between gap-2 mt-auto text-xs">
        {/* Maker details */}
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span className="text-slate-400">by</span>
          <span className="text-slate-800 font-semibold truncate max-w-[110px]">
            {product.makerName}
          </span>
          {product.dofollowApproved && (
            <span
              title="Verified High-Value DoFollow SEO Backlink"
              className="inline-flex items-center text-emerald-600 ml-0.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Action Links: Details / Repo / Direct Site */}
        <div className="flex items-center gap-1.5">
          {product.repoUrl && (
            <a
              id={`repo-link-${product.id}`}
              href={product.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              title="View GitHub Repository"
              onClick={(e) => e.stopPropagation()}
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}

          <button
            id={`details-btn-${product.id}`}
            onClick={() => onOpenDetails(product)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 border border-indigo-100/70 transition-colors cursor-pointer"
          >
            Badge &amp; SEO
          </button>

          {/* Direct SEO Backlink Anchor */}
          <a
            id={`external-link-${product.id}`}
            href={product.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-slate-100/90 hover:bg-slate-200/80 transition-colors"
            title={`Visit ${product.name} (Direct SEO link)`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>Visit</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>
    </article>
  );
};

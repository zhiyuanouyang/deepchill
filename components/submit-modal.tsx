'use client';

import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, Plus, Loader2, ShieldCheck, Info, ListChecks, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, ProductCategory, PricingModel } from '@/lib/types';
import { extractDomain } from '@/lib/utils';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProduct: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = [
  'DevTools',
  'AI & Machine Learning',
  'Productivity',
  'Design & Creative',
  'Open Source Infrastructure',
  'SaaS & Analytics',
  'Security & Privacy',
  'Developer Utilities',
];

const PRICING_OPTIONS: PricingModel[] = ['Free', 'Open Source', 'Freemium', 'Paid'];

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmitProduct,
}) => {
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [category, setCategory] = useState<ProductCategory>('DevTools');
  const [pricing, setPricing] = useState<PricingModel>('Open Source');
  const [tagsInput, setTagsInput] = useState('');
  const [makerName, setMakerName] = useState('');
  const [makerHandle, setMakerHandle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [biddingAmount, setBiddingAmount] = useState<number>(50);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Computed SEO slug
  const previewSlug = useMemo(() => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'your-product-name';
  }, [name]);

  const handleAiEnhance = async () => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Please enter a project name first' }));
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/enhance-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.polishedTagline && !tagline) {
          setTagline(data.polishedTagline);
        }
        if (data.suggestedTags && Array.isArray(data.suggestedTags)) {
          const currentTags = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
          const merged = Array.from(new Set([...currentTags, ...data.suggestedTags]));
          setTagsInput(merged.join(', '));
        }
        if (data.suggestedFeatures && Array.isArray(data.suggestedFeatures) && !featuresInput) {
          setFeaturesInput(data.suggestedFeatures.join('\n'));
        }
        if (data.targetAudience && !targetAudience) {
          setTargetAudience(data.targetAudience);
        }
        if (data.seoAdvice) {
          setAiTip(data.seoAdvice);
        }
      }
    } catch (err) {
      console.error('Failed to enhance submission:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!websiteUrl.trim()) {
      newErrors.websiteUrl = 'Direct website URL is required for SEO backlink';
    } else if (!/^https?:\/\//i.test(websiteUrl)) {
      newErrors.websiteUrl = 'URL must begin with http:// or https://';
    }
    if (!tagline.trim()) newErrors.tagline = 'A concise tagline is required for search listings';
    if (!description.trim()) newErrors.description = 'Please provide a detailed project description for SEO crawling';
    if (!makerName.trim()) newErrors.makerName = 'Maker name or handle is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const parsedFeatures = featuresInput
      .split('\n')
      .map((f) => f.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);

    const rawDomain = extractDomain(websiteUrl.trim());
    const tagsArray = parsedTags.length > 0 ? parsedTags : ['Indie', 'DevTools'];
    const nowIso = new Date().toISOString();

    const newProduct: Product = {
      id: previewSlug,
      domain: rawDomain,
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      websiteUrl: websiteUrl.trim(),
      repoUrl: repoUrl.trim() || undefined,
      category,
      pricing,
      tags: tagsArray,
      categoryTags: [category, ...tagsArray],
      features: parsedFeatures.length > 0 ? parsedFeatures : undefined,
      targetAudience: targetAudience.trim() || undefined,
      makerName: makerName.trim(),
      makerHandle: makerHandle.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      upvotes: 1,
      clicks: 0,
      totalClicks: 0,
      totalBid: biddingAmount,
      mostRecentBid: {
        bidPrice: biddingAmount,
        bidTime: nowIso,
      },
      featured: false,
      launchDate: nowIso.split('T')[0],
      dofollowApproved: true,
      starsCount: repoUrl ? 1 : undefined,
      totalPaid: biddingAmount,
      paidAt: nowIso,
    };

    onSubmitProduct(newProduct);

    // Confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch {
      // Ignore
    }

    // Reset form
    setName('');
    setWebsiteUrl('');
    setRepoUrl('');
    setTagline('');
    setDescription('');
    setFeaturesInput('');
    setTargetAudience('');
    setTagsInput('');
    setMakerName('');
    setMakerHandle('');
    setLogoUrl('');
    setAiTip(null);
    setErrors({});
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/75 backdrop-blur-md z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 p-6 sm:p-8 rounded-3xl liquid-glass dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Dialog.Title className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Launch Your Product
                </Dialog.Title>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Authority DoFollow Backlink
                </span>
              </div>
              <Dialog.Description className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                Submit your product to the directory to gain visibility, direct outbound clicks, and maker discovery.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                id="submit-modal-close-btn"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* 1. Core Identity & URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-product-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Supabase, Cal.com"
                  className={`w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none ${
                    errors.name ? 'border-rose-400' : ''
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Website URL <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-website-url"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourproduct.com"
                  className={`w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none ${
                    errors.websiteUrl ? 'border-rose-400' : ''
                  }`}
                />
                {errors.websiteUrl && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.websiteUrl}</p>
                )}
              </div>
            </div>

            {/* Category & Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Category</label>
                <select
                  id="select-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2.5 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pricing Model</label>
                <select
                  id="select-pricing"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value as PricingModel)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2.5 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {PRICING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logo URL & GitHub Repo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Logo / Brand Icon URL <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  id="input-logo-url"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Repository <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  id="input-repo-url"
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>
            </div>

            {/* Tagline + AI Optimize Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  SEO Tagline (1-Sentence Value Prop) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  id="btn-ai-enhance-tagline"
                  onClick={handleAiEnhance}
                  disabled={aiLoading}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  )}
                  <span>AI Polish &amp; SEO Auto-Suggest</span>
                </button>
              </div>
              <input
                id="input-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., The open source Firebase alternative with Postgres"
                className={`w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none ${
                  errors.tagline ? 'border-rose-400' : ''
                }`}
              />
              {errors.tagline && <p className="text-[11px] text-rose-600 mt-1">{errors.tagline}</p>}
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Comprehensive Description (SEO Content) <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="textarea-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what problem your product solves, core architecture, and unique benefits for organic search crawling..."
                className={`w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none ${
                  errors.description ? 'border-rose-400' : ''
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Key Features for SEO Landing Page */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-indigo-500" />
                <span>Key Features &amp; Highlights (1 per line)</span>
                <span className="text-slate-400 text-xs font-normal">(displayed in SEO feature grid)</span>
              </label>
              <textarea
                id="textarea-features"
                rows={3}
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="Realtime database subscriptions&#10;Instant auto-generated REST/GraphQL APIs&#10;Vector store for AI embeddings with pgvector"
                className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none font-mono text-xs"
              />
            </div>

            {/* Target Audience & Keywords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Target Audience</span>
                  <span className="text-slate-400 text-xs font-normal">(who it&apos;s for)</span>
                </label>
                <input
                  id="input-target-audience"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Full-stack engineers, SaaS founders, teams"
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keywords / Tech Stack <span className="text-slate-400 text-xs">(comma separated)</span>
                </label>
                <input
                  id="input-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="PostgreSQL, Auth, Docker, TypeScript, Next.js"
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>
            </div>

            {/* Maker Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maker Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-maker-name"
                  type="text"
                  value={makerName}
                  onChange={(e) => setMakerName(e.target.value)}
                  placeholder="e.g., Paul Copplestone"
                  className={`w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none ${
                    errors.makerName ? 'border-rose-400' : ''
                  }`}
                />
                {errors.makerName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.makerName}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maker Twitter / GitHub Handle
                </label>
                <input
                  id="input-maker-handle"
                  type="text"
                  value={makerHandle}
                  onChange={(e) => setMakerHandle(e.target.value)}
                  placeholder="@kiwicopple"
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>
            </div>

            {/* Bidding Amount / Sponsor Trending Rank */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-1.5">
                  <span>🔥 Sponsor Boost &amp; Trending Rank</span>
                  <span className="text-[11px] font-normal text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                    Determines Trending List Ranking
                  </span>
                </label>
                <span className="text-sm font-extrabold text-amber-900 dark:text-amber-300">${biddingAmount}</span>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/70 mb-3">
                Higher total paid bidding secures top placement in the Trending directory list and drives more outbound clicks.
              </p>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                {[0, 25, 50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBiddingAmount(amt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      biddingAmount === amt
                        ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40'
                    }`}
                  >
                    {amt === 0 ? 'Free ($0)' : `$${amt}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-amber-900 dark:text-amber-300">Custom amount:</span>
                <div className="relative w-32">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={biddingAmount}
                    onChange={(e) => setBiddingAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full liquid-glass-input rounded-xl pl-7 pr-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* AI SEO Advice */}
            {aiTip && (
              <div className="p-3 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-snug">
                  <span className="font-bold">Gemini SEO Tip:</span> {aiTip}
                </p>
              </div>
            )}

            {/* Submit Actions */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                id="btn-cancel-submission"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-project-final"
                className="liquid-btn-primary px-6 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/10"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Product</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

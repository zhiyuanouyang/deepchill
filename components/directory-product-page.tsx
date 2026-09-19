'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Calendar,
  MousePointerClick,
  Award,
  Copy,
  Check,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  Share2,
  ChevronRight,
  HelpCircle,
  DollarSign,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { GithubIcon } from '@/components/icons';
import { Navbar } from '@/components/navbar';
import { SubmitModal } from '@/components/submit-modal';
import { SeoGuideModal } from '@/components/seo-guide-modal';

interface DirectoryProductPageProps {
  initialProduct: Product;
  relatedProducts: Product[];
}

export function DirectoryProductPage({
  initialProduct,
  relatedProducts,
}: DirectoryProductPageProps) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [badgeFormat, setBadgeFormat] = useState<'markdown' | 'html'>('markdown');
  const [badgeCopied, setBadgeCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSeoGuideOpen, setIsSeoGuideOpen] = useState(false);
  const router = useRouter();

  // Sync with client localStorage if newer state exists
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedProducts = localStorage.getItem('indie_directory_products');
        if (savedProducts) {
          const parsed: Product[] = JSON.parse(savedProducts);
          const match = parsed.find((p) => p.id.toLowerCase() === initialProduct.id.toLowerCase());
          if (match) {
            setProduct(match);
          }
        }

        const savedUpvotes = localStorage.getItem('indie_upvoted_ids');
        if (savedUpvotes) {
          const parsedVotes: string[] = JSON.parse(savedUpvotes);
          if (parsedVotes.includes(initialProduct.id)) {
            setIsUpvoted(true);
          }
        }
      } catch {
        // Ignore
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [initialProduct.id]);

  const handleRecordOutboundClick = () => {
    const updatedClicks = (product.clicks ?? 0) + 1;
    const updated = { ...product, clicks: updatedClicks };
    setProduct(updated);

    try {
      const saved = localStorage.getItem('indie_directory_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        const next = parsed.map((p) => (p.id === product.id ? { ...p, clicks: updatedClicks } : p));
        localStorage.setItem('indie_directory_products', JSON.stringify(next));
      }
    } catch {
      // Ignore
    }
  };

  const handleUpvote = (e: React.MouseEvent) => {
    const nextUpvoted = !isUpvoted;
    const nextCount = nextUpvoted ? product.upvotes + 1 : Math.max(0, product.upvotes - 1);

    setIsUpvoted(nextUpvoted);
    setProduct((prev) => ({ ...prev, upvotes: nextCount }));

    try {
      // Upvotes list
      const savedUpvotes = localStorage.getItem('indie_upvoted_ids');
      const parsedVotes: string[] = savedUpvotes ? JSON.parse(savedUpvotes) : [];
      let nextVotes = parsedVotes;
      if (nextUpvoted) {
        if (!nextVotes.includes(product.id)) nextVotes.push(product.id);
      } else {
        nextVotes = nextVotes.filter((id) => id !== product.id);
      }
      localStorage.setItem('indie_upvoted_ids', JSON.stringify(nextVotes));

      // Update product in list
      const saved = localStorage.getItem('indie_directory_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        const next = parsed.map((p) => (p.id === product.id ? { ...p, upvotes: nextCount } : p));
        localStorage.setItem('indie_directory_products', JSON.stringify(next));
      }

      if (nextUpvoted) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { x, y },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'],
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleCopyBadge = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indiedirectory.dev';
    const targetUrl = `${origin}/directory/${product.id}`;
    const badgeImg = 'https://img.shields.io/badge/OpenIndie-Featured%20Project-6366f1?style=for-the-badge&logo=rocket&logoColor=white';

    const snippet =
      badgeFormat === 'markdown'
        ? `[![Featured on OpenIndie Directory](${badgeImg})](${targetUrl})`
        : `<a href="${targetUrl}" target="_blank" rel="noopener" title="Featured on OpenIndie Directory"><img src="${badgeImg}" alt="Featured on OpenIndie Directory" /></a>`;

    try {
      navigator.clipboard.writeText(snippet);
      setBadgeCopied(true);
      setTimeout(() => setBadgeCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      try {
        navigator.clipboard.writeText(window.location.href);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch {
        // Ignore
      }
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indiedirectory.dev';
  const targetUrl = `${origin}/directory/${product.id}`;
  const badgeImg = 'https://img.shields.io/badge/OpenIndie-Featured%20Project-6366f1?style=for-the-badge&logo=rocket&logoColor=white';
  const badgeSnippet =
    badgeFormat === 'markdown'
      ? `[![Featured on OpenIndie Directory](${badgeImg})](${targetUrl})`
      : `<a href="${targetUrl}" target="_blank" rel="noopener" title="Featured on OpenIndie Directory">\n  <img src="${badgeImg}" alt="Featured on OpenIndie Directory" />\n</a>`;

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0b0f19] pb-24 transition-colors duration-250">
      {/* Background Liquid Ambient Light Blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full liquid-blob-1 blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full liquid-blob-2 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-[32rem] h-[32rem] rounded-full liquid-blob-3 blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        onOpenSubmit={() => setIsSubmitOpen(true)}
        totalProducts={100}
        onOpenSeoInfo={() => setIsSeoGuideOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Breadcrumb Navigation for SEO Schema */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 flex-wrap"
        >
          <Link
            href="/"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Directory</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/?category=${encodeURIComponent(product.category)}`}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-white font-bold truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Hero Card */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-white/10 shadow-xl relative overflow-hidden mb-8">
          {/* Top highlight bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-700" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Logo & Core Info */}
            <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/60 border border-white dark:border-slate-700/60 shadow-md flex items-center justify-center shrink-0">
                {product.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.logoUrl}
                    alt={`${product.name} logo`}
                    className="w-full h-full object-cover"
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-2xl sm:text-3xl select-none">
                  {product.name.charAt(0)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                    {product.pricing}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {product.category}
                  </span>
                  {product.dofollowApproved && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified DoFollow</span>
                    </span>
                  )}
                  {product.totalPaid !== undefined && product.totalPaid > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                      <DollarSign className="w-3 h-3 text-amber-600" />
                      <span>${product.totalPaid} Bid Boost</span>
                    </span>
                  )}
                </div>

                {/* H1 SEO Title */}
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  {product.name}
                </h1>

                {/* Tagline / Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-snug mb-3">
                  {product.tagline}
                </p>

                {/* Meta row: Maker, Stars, Clicks */}
                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Created by{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {product.makerName}
                    </strong>
                    {product.makerHandle && (
                      <span className="text-indigo-600 dark:text-indigo-400 ml-1">
                        ({product.makerHandle})
                      </span>
                    )}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span>{product.clicks ?? 0} Direct Outbound Clicks</span>
                  </span>
                  {product.starsCount && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.starsCount.toLocaleString()} GitHub Stars</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5 shrink-0">
              <a
                id="hero-visit-official-site"
                href={product.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleRecordOutboundClick}
                className="liquid-btn-primary px-5 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/15 cursor-pointer text-sm"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2">
                {product.repoUrl && (
                  <a
                    id="hero-visit-github-repo"
                    href={product.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Source</span>
                  </a>
                )}

                <button
                  id="hero-upvote-button"
                  onClick={handleUpvote}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    isUpvoted
                      ? 'bg-indigo-600 text-white border-indigo-700 dark:border-indigo-400'
                      : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ArrowUpRight
                    className={`w-3.5 h-3.5 ${isUpvoted ? 'rotate-[-45deg] scale-110' : '-rotate-45'}`}
                  />
                  <span>{product.upvotes} Upvotes</span>
                </button>

                <button
                  onClick={handleShare}
                  title="Copy permanent URL"
                  className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {urlCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column SEO Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview / Story */}
            <section className="liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-white/10">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
                <span>About {product.name}</span>
              </h2>
              <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {product.description}
              </div>
            </section>

            {/* Key Features Grid */}
            {product.features && product.features.length > 0 && (
              <section className="liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-white/10">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Key Features &amp; Capabilities</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {product.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Target Audience */}
            {product.targetAudience && (
              <section className="liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-white/10 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Who Is {product.name} Built For?
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.targetAudience}
                  </p>
                </div>
              </section>
            )}

            {/* Tech Stack & Keyword Tags */}
            <section className="liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-white/10">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Tech Stack &amp; Search Keywords</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/?tag=${encodeURIComponent(t)}`}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </section>

            {/* Structured FAQ for Google Rich Snippets */}
            <section className="liquid-glass-card rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-white/10">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    What is {product.name} and what problem does it solve?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.name} is a {product.category.toLowerCase()} tool described as &quot;{product.tagline}&quot;. It is designed for {product.targetAudience || 'developers, founders, and modern technical teams'} looking for high-performance solutions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    What is the pricing model for {product.name}?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.name} is offered under a <strong>{product.pricing}</strong> model. You can explore its full offering by visiting the official website.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Does {product.name} provide open-source code?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {product.repoUrl ? (
                      <>
                        Yes, {product.name} is open source. You can inspect its repository and star count on GitHub at{' '}
                        <a
                          href={product.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 underline font-semibold"
                        >
                          {product.repoUrl}
                        </a>.
                      </>
                    ) : (
                      <>{product.name} does not currently link an open-source repository on its listing.</>
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Metadata Card */}
            <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 border border-white/80 dark:border-white/10 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Listing Specifications
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.category}</span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Pricing</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.pricing}</span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Verified Backlink</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct DoFollow
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Total Outbound Clicks</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span>{product.clicks ?? 0}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Community Upvotes</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.upvotes}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Launch Date
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{product.launchDate}</span>
                </div>
              </div>
            </div>

            {/* Reciprocal Backlink & Embed Badge */}
            <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 border border-indigo-200/70 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/70 via-white/80 to-violet-50/70 dark:from-indigo-950/40 dark:via-slate-800/70 dark:to-violet-950/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Embed Featured Badge
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Signal trust &amp; reciprocal SEO authority
                  </p>
                </div>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] my-3">
                <button
                  onClick={() => setBadgeFormat('markdown')}
                  className={`flex-1 py-1 rounded font-semibold transition-all cursor-pointer ${
                    badgeFormat === 'markdown'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setBadgeFormat('html')}
                  className={`flex-1 py-1 rounded font-semibold transition-all cursor-pointer ${
                    badgeFormat === 'html'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  HTML
                </button>
              </div>

              {/* Badge Preview */}
              <div className="flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 mb-3 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badgeImg}
                  alt="OpenIndie Featured Project Badge"
                  className="rounded shadow-2xs"
                />
              </div>

              {/* Code Snippet */}
              <div className="relative">
                <pre className="p-2.5 rounded-xl bg-slate-900 text-indigo-200 text-[11px] font-mono overflow-x-auto select-all pr-20">
                  {badgeSnippet}
                </pre>
                <button
                  onClick={handleCopyBadge}
                  className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  {badgeCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Related Projects in Category */}
            {relatedProducts.length > 0 && (
              <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 border border-white/80 dark:border-white/10">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Similar in {product.category}</span>
                  </h3>
                  <Link
                    href={`/?category=${encodeURIComponent(product.category)}`}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {relatedProducts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/directory/${rel.id}`}
                      className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-indigo-600">
                        {rel.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rel.logoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span>{rel.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {rel.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            ★ {rel.upvotes}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {rel.tagline}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmitProduct={(newP) => {
          router.push(`/directory/${newP.id}`);
        }}
      />

      <SeoGuideModal
        isOpen={isSeoGuideOpen}
        onClose={() => setIsSeoGuideOpen(false)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />
    </div>
  );
}

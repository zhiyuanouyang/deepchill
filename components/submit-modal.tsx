'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Sparkles,
  Globe,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, ProductCategory } from '@/lib/types';
import { extractDomain, validateWebsiteUrl } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';
import { ProjectBidCard } from '@/components/project-bid-card';
import { CategoryCombobox } from '@/components/category-combobox';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProduct: (product: Product) => void;
  defaultCategory?: ProductCategory | string;
  categories?: Array<{ id?: string; display_name: string }> | string[];
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  onClose,
  onSubmitProduct,
  defaultCategory,
  categories: categoriesProp,
}) => {
  const [protocol, setProtocol] = useState<'https' | 'http'>('https');
  const [domainInput, setDomainInput] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(
    defaultCategory && defaultCategory !== 'All' ? defaultCategory : 'Other'
  );
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [iconUrl, setIconUrl] = useState('');
  const [biddingAmount, setBiddingAmount] = useState<number>(0);

  // Form expansion state (initially folded)
  const [isExpanded, setIsExpanded] = useState(false);

  // UI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainCheckResult, setDomainCheckResult] = useState<{
    domain: string;
    exists: boolean;
    projectName?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iconError, setIconError] = useState(false);
  const [aiAutoFilling, setAiAutoFilling] = useState(false);

  const { profile, displayName } = useAuth();

  // Fetch categories from categories table or use passed prop
  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      // 1. If categories prop was provided, use it
      if (categoriesProp && categoriesProp.length > 0) {
        const names = categoriesProp.map((c) =>
          typeof c === 'string' ? c : c.display_name
        );
        if (isMounted) {
          setCategoryOptions(names);
          const fallback = names.includes('Other') ? 'Other' : names[0] || 'Other';
          const target = defaultCategory && defaultCategory !== 'All' && names.includes(defaultCategory)
            ? defaultCategory
            : fallback;
          setCategory((prev) => (prev && names.includes(prev) ? prev : target));
        }
        return;
      }

      // 2. Otherwise fetch live from categories table
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && Array.isArray(data.categories)) {
            const names = data.categories.map((c: { display_name: string }) => c.display_name);
            if (isMounted && names.length > 0) {
              setCategoryOptions(names);
              const fallback = names.includes('Other') ? 'Other' : names[0] || 'Other';
              const target = defaultCategory && defaultCategory !== 'All' && names.includes(defaultCategory)
                ? defaultCategory
                : fallback;
              setCategory((prev) => (prev && names.includes(prev) ? prev : target));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load categories from table:', err);
      }
    }

    if (isOpen) {
      loadCategories();
      setIsExpanded(false);
      setErrors({});
      setAiSuccessMessage(null);
      setDomainCheckResult(null);
      setIsCheckingDomain(false);
      setAiAutoFilling(false);
      setIconError(false);
      if (defaultCategory && defaultCategory !== 'All') {
        setCategory(defaultCategory);
      } else {
        setCategory('Other');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, categoriesProp, defaultCategory]);

  // Derive the full URL from protocol + domainInput so all downstream logic stays the same
  const websiteUrl = useMemo(
    () => (domainInput.trim() ? `${protocol}://${domainInput.trim()}` : ''),
    [protocol, domainInput]
  );

  const cleanDomain = useMemo(() => extractDomain(websiteUrl), [websiteUrl]);

  // Debounced domain availability check
  useEffect(() => {
    const trimmed = websiteUrl.trim();
    if (!trimmed) {
      setDomainCheckResult(null);
      setIsCheckingDomain(false);
      return;
    }

    const validation = validateWebsiteUrl(trimmed);
    if (!validation.isValid || !validation.domain) {
      setDomainCheckResult(null);
      setIsCheckingDomain(false);
      return;
    }

    const domainToCheck = validation.domain;
    let isCurrent = true;
    setIsCheckingDomain(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/projects/check-domain?domain=${encodeURIComponent(
            domainToCheck
          )}&url=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isCurrent) {
            if (data.exists) {
              setDomainCheckResult({
                domain: domainToCheck,
                exists: true,
                projectName: data.project?.name,
              });
              setErrors((prev) => ({
                ...prev,
                websiteUrl: `Domain "${domainToCheck}" has already been submitted${
                  data.project?.name ? ` (${data.project.name})` : ''
                }.`,
              }));
            } else {
              setDomainCheckResult({ domain: domainToCheck, exists: false });
              setErrors((prev) => {
                const next = { ...prev };
                if (
                  next.websiteUrl &&
                  next.websiteUrl.includes('already been submitted')
                ) {
                  delete next.websiteUrl;
                }
                return next;
              });

              // Domain is free — fire AI metadata extraction automatically
              setAiAutoFilling(true);
              setAiSuccessMessage(null);
              try {
                const aiRes = await fetch('/api/ai/extract-metadata', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: trimmed }),
                });
                if (aiRes.ok && isCurrent) {
                  const aiData = await aiRes.json();
                  if (aiData.success && aiData.metadata) {
                    const { metadata } = aiData;
                    if (metadata.name) setName(metadata.name);
                    if (metadata.description) setDescription(metadata.description);
                    if (metadata.category) {
                      setCategory(metadata.category);
                      setCategoryOptions((prev) =>
                        prev.includes(metadata.category) ? prev : [metadata.category, ...prev]
                      );
                    }
                    if (metadata.iconUrl) {
                      setIconUrl(metadata.iconUrl);
                      setIconError(false);
                    }
                    const hasData = Boolean(metadata.name || metadata.description);
                    if (hasData) {
                      setIsExpanded(true);
                      setAiSuccessMessage(`✨ AI filled metadata for ${domainToCheck}`);
                    }
                  }
                }
              } catch (aiErr) {
                console.warn('Auto AI fill notice:', aiErr);
                // Silently fall back — user can still use the manual AI button
                if (data.suggested && isCurrent) {
                  setName(data.suggested.name || '');
                  setDescription(data.suggested.description || '');
                  setIconUrl(data.suggested.iconUrl || '');
                  setIconError(false);
                  const hasAnyPopulated = Boolean(data.suggested.name || data.suggested.description);
                  if (hasAnyPopulated) {
                    setIsExpanded(true);
                    setAiSuccessMessage(`✨ Metadata detected for ${domainToCheck}`);
                  }
                }
              } finally {
                if (isCurrent) setAiAutoFilling(false);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Domain availability check notice:', err);
      } finally {
        if (isCurrent) {
          setIsCheckingDomain(false);
        }
      }
    }, 350);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [websiteUrl]);

  const effectiveIconUrl = useMemo(() => {
    if (iconUrl.trim()) return iconUrl.trim();
    if (cleanDomain) {
      return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
    }
    return '';
  }, [iconUrl, cleanDomain]);

  const isDomainVerified = Boolean(
    cleanDomain &&
      domainCheckResult &&
      !domainCheckResult.exists &&
      domainCheckResult.domain === cleanDomain &&
      !errors.websiteUrl
  );

  const handleDomainInputChange = (val: string) => {
    // Strip any protocol the user may paste in (e.g. "https://example.com" → "example.com")
    const stripped = val.replace(/^https?:\/\//i, '');
    const newFullUrl = stripped.trim() ? `${protocol}://${stripped.trim()}` : '';
    const newDomain = extractDomain(newFullUrl);
    if (newDomain !== cleanDomain) {
      setIconUrl('');
    }
    setDomainInput(stripped);
    setAiSuccessMessage(null);
    setIconError(false);

    if (!stripped.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.websiteUrl;
        return next;
      });
      setDomainCheckResult(null);
      setIsCheckingDomain(false);
      return;
    }

    const validation = validateWebsiteUrl(newFullUrl);
    if (!validation.isValid) {
      setErrors((prev) => ({
        ...prev,
        websiteUrl: validation.error || 'Please enter a valid website link',
      }));
      setDomainCheckResult(null);
      setIsCheckingDomain(false);
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        if (
          next.websiteUrl &&
          !next.websiteUrl.includes('already been submitted')
        ) {
          delete next.websiteUrl;
        }
        return next;
      });
    }
  };

  // AI Autofill from project URL
  const handleAiAutoFill = async () => {
    const urlValidation = validateWebsiteUrl(websiteUrl);
    if (!urlValidation.isValid) {
      setErrors((prev) => ({
        ...prev,
        websiteUrl: urlValidation.error || 'Please enter a valid website link first',
      }));
      return;
    }

    setAiLoading(true);
    setAiSuccessMessage(null);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.websiteUrl;
      return next;
    });

    try {
      const res = await fetch('/api/ai/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract metadata');
      }

      const { metadata } = data;

      if (metadata.name) setName(metadata.name);
      if (metadata.description) setDescription(metadata.description);
      if (metadata.category) {
        setCategory(metadata.category);
        setCategoryOptions((prev) =>
          prev.includes(metadata.category) ? prev : [metadata.category, ...prev]
        );
      }
      if (metadata.iconUrl) {
        setIconUrl(metadata.iconUrl);
        setIconError(false);
      }
      if (metadata.url && !domainInput.trim()) {
        // Sync protocol + domain from the metadata URL
        const metaProto = metadata.url.startsWith('http://') ? 'http' : 'https';
        const metaDomain = metadata.url.replace(/^https?:\/\//i, '').split('/')[0];
        setProtocol(metaProto as 'https' | 'http');
        setDomainInput(metaDomain);
      }

      // Automatically pop down & expand the form fields
      setIsExpanded(true);
      setAiSuccessMessage(`✨ Metadata filled by AI for ${cleanDomain || 'project'}`);
    } catch (err: unknown) {
      console.warn('AI Autofill fallback:', err);
      if (cleanDomain) {
        const guessedName =
          cleanDomain.split('.')[0].charAt(0).toUpperCase() +
          cleanDomain.split('.')[0].slice(1);
        setName(guessedName);
        setDescription(`${guessedName} provides tools for developers and creators.`);
        setIconUrl(`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`);
        setIconError(false);
        setIsExpanded(true);
        setAiSuccessMessage(`Populated metadata for ${cleanDomain}`);
      } else {
        setErrors({ websiteUrl: 'Could not inspect this URL. Please check and try again.' });
      }
    } finally {
      setAiLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const urlValidation = validateWebsiteUrl(websiteUrl);
    if (!urlValidation.isValid) {
      newErrors.websiteUrl = urlValidation.error || 'Please enter a valid website link';
    } else if (
      domainCheckResult?.exists &&
      domainCheckResult.domain === urlValidation.domain
    ) {
      newErrors.websiteUrl = `Domain "${urlValidation.domain}" has already been submitted${
        domainCheckResult.projectName ? ` (${domainCheckResult.projectName})` : ''
      }.`;
    }

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Syntax validation of website URL
    const urlValidation = validateWebsiteUrl(websiteUrl);
    if (!urlValidation.isValid || !urlValidation.domain) {
      setErrors((prev) => ({
        ...prev,
        websiteUrl: urlValidation.error || 'Please enter a valid website link',
      }));
      return;
    }

    // 2. Check if domain already exists
    if (
      domainCheckResult?.exists &&
      domainCheckResult.domain === urlValidation.domain
    ) {
      setErrors((prev) => ({
        ...prev,
        websiteUrl: `Domain "${urlValidation.domain}" has already been submitted${
          domainCheckResult.projectName ? ` (${domainCheckResult.projectName})` : ''
        }.`,
      }));
      return;
    }

    // Direct pre-flight check if domain check hasn't finished or was not run for current domain
    if (!domainCheckResult || domainCheckResult.domain !== urlValidation.domain) {
      try {
        const checkRes = await fetch(
          `/api/projects/check-domain?domain=${encodeURIComponent(
            urlValidation.domain
          )}&url=${encodeURIComponent(websiteUrl.trim())}`
        );
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.exists) {
            setDomainCheckResult({
              domain: urlValidation.domain,
              exists: true,
              projectName: checkData.project?.name,
            });
            setErrors((prev) => ({
              ...prev,
              websiteUrl: `Domain "${urlValidation.domain}" has already been submitted${
                checkData.project?.name ? ` (${checkData.project.name})` : ''
              }.`,
            }));
            return;
          } else if (checkData.suggested) {
            setName(checkData.suggested.name || '');
            setDescription(checkData.suggested.description || '');
            setIconUrl(checkData.suggested.iconUrl || '');
            setIconError(false);
          }
        }
      } catch (checkErr) {
        console.warn('Pre-flight domain check notice:', checkErr);
      }
    }

    // If details are folded and user hasn't filled name yet, trigger AI auto-fill first
    if (!name.trim() || !description.trim()) {
      if (!isExpanded) {
        setIsExpanded(true);
      }
      if (websiteUrl.trim() && !name.trim()) {
        await handleAiAutoFill();
        return;
      }
      validate();
      return;
    }

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    const nowIso = new Date().toISOString();
    const finalIcon = effectiveIconUrl || undefined;
    const authorName = profile?.display_name || displayName || 'Maker';

    let newProduct: Product = {
      id: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'project',
      domain: cleanDomain || urlValidation.domain,
      name: name.trim(),
      description: description.trim(),
      websiteUrl: websiteUrl.trim(),
      category: category as ProductCategory,
      pricing: 'Free',
      tags: [category, 'Indie'],
      categoryTags: [category, 'Indie'],
      makerName: authorName,
      logoUrl: finalIcon,
      upvotes: 1,
      clicks: 0,
      totalClicks: 0,
      totalBid: biddingAmount,
      mostRecentBid: {
        bidPrice: biddingAmount,
        bidTime: nowIso,
        hasBid: biddingAmount > 0,
      },
      latestBidTime: biddingAmount > 0 ? nowIso : null,
      hasBid: biddingAmount > 0,
      featured: biddingAmount >= 100,
      launchDate: nowIso.split('T')[0],
      dofollowApproved: true,
      totalPaid: biddingAmount,
      paidAt: nowIso,
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          websiteUrl: websiteUrl.trim(),
          description: description.trim(),
          category,
          icon_url: finalIcon,
          logoUrl: finalIcon,
          biddingAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          websiteUrl: data.error || 'Failed to submit project. Please try again.',
        }));
        setIsSubmitting(false);
        return;
      }

      if (data.product) {
        newProduct = {
          ...newProduct,
          ...data.product,
          id: data.product.id || newProduct.id,
        };
      }
    } catch (err: unknown) {
      console.error('Backend submission error:', err);
      setErrors((prev) => ({
        ...prev,
        websiteUrl:
          err instanceof Error ? err.message : 'Failed to submit project. Please try again.',
      }));
      setIsSubmitting(false);
      return;
    } finally {
      setIsSubmitting(false);
    }

    onSubmitProduct(newProduct);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#f59e0b', '#10b981'],
      });
    } catch {
      // Safe fallback
    }

    // Reset & close
    setProtocol('https');
    setDomainInput('');
    setName('');
    setDescription('');
    setIconUrl('');
    setBiddingAmount(0);
    setIsExpanded(false);
    setErrors({});
    setAiSuccessMessage(null);
    setDomainCheckResult(null);
    setIsCheckingDomain(false);
    setIconError(false);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          aria-describedby="submit-modal-description"
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] sm:w-full max-w-lg max-h-[92dvh] overflow-y-auto z-50 p-5 sm:p-6 rounded-3xl liquid-glass dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <Dialog.Title className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Submit Project
              </Dialog.Title>
              <Dialog.Description
                id="submit-modal-description"
                className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
              >
                Enter your website URL to launch your project.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                id="submit-modal-close-btn"
                aria-label="Close modal"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Clean URL Input + AI Autofill Button */}
            <div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Protocol selector + domain input combined pill */}
                <div className={`relative flex-1 flex items-center liquid-glass-input rounded-xl overflow-hidden ${
                  errors.websiteUrl ? 'border-rose-400 dark:border-rose-500' : ''
                }`}>
                  {/* Site icon / Globe — far left of pill */}
                  <div className="flex items-center justify-center w-9 shrink-0 self-stretch bg-slate-50/60 dark:bg-slate-800/40 border-r border-slate-200/70 dark:border-slate-700/60">
                    {isDomainVerified && effectiveIconUrl && !iconError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={effectiveIconUrl}
                        alt="Website icon"
                        className="w-4 h-4 rounded-sm object-contain transition-opacity duration-200"
                        referrerPolicy="no-referrer"
                        onError={() => setIconError(true)}
                      />
                    ) : (
                      <Globe className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* Protocol toggle button */}
                  <button
                    type="button"
                    id="btn-protocol-toggle"
                    onClick={() => setProtocol((p) => (p === 'https' ? 'http' : 'https'))}
                    className="flex items-center gap-1 pl-2.5 pr-2 py-2.5 shrink-0 text-[11px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer select-none border-r border-slate-200/70 dark:border-slate-700/60"
                    title="Click to toggle between https and http"
                  >
                    {protocol === 'https' ? (
                      <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M8 1a4 4 0 0 1 4 4v1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1V5a4 4 0 0 1 4-4zm0 1.5A2.5 2.5 0 0 0 5.5 5v1h5V5A2.5 2.5 0 0 0 8 2.5zM8 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                      </svg>
                    ) : (
                      <Globe className="w-3 h-3 shrink-0" />
                    )}
                    <span>{protocol}://</span>
                  </button>

                  {/* Domain-only input */}
                  <input
                    id="input-website-url"
                    type="text"
                    value={domainInput}
                    onChange={(e) => handleDomainInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAiAutoFill();
                      }
                    }}
                    placeholder="yourproject.com"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 bg-transparent outline-none font-medium text-xs sm:text-sm py-2.5 pl-2.5 pr-3"
                  />
                </div>

                <button
                  type="button"
                  id="btn-ai-autofill"
                  onClick={handleAiAutoFill}
                  disabled={aiLoading || Boolean(errors.websiteUrl)}
                  className="liquid-btn-primary px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Filling...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Auto-fill with AI</span>
                    </>
                  )}
                </button>
              </div>

              {errors.websiteUrl ? (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.websiteUrl}</span>
                </p>
              ) : isCheckingDomain ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0 text-indigo-500" />
                  <span>Checking domain availability...</span>
                </p>
              ) : aiAutoFilling ? (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0 text-indigo-500" />
                  <span>AI is filling your project details...</span>
                </p>
              ) : domainCheckResult && !domainCheckResult.exists && cleanDomain ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Domain &quot;{cleanDomain}&quot; is available</span>
                </p>
              ) : null}

              {aiSuccessMessage && !aiLoading && (
                <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{aiSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* Separator with "or fill manually" toggle */}
            <div className="relative flex items-center justify-center pt-1 pb-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>or fill manually</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Folded / Expanded Form Fields */}
            {isExpanded && (
              <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                {/* Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Project Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-product-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Supabase"
                      className={`w-full liquid-glass-input rounded-xl px-3 py-2 text-xs sm:text-sm outline-none font-medium ${
                        errors.name ? 'border-rose-400 dark:border-rose-500' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <CategoryCombobox
                      value={category}
                      onChange={setCategory}
                      options={categoryOptions}
                      placeholder="Search or pick category..."
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="textarea-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what your product does..."
                    className={`w-full liquid-glass-input rounded-xl px-3 py-2 text-xs sm:text-sm outline-none font-medium leading-relaxed ${
                      errors.description ? 'border-rose-400 dark:border-rose-500' : ''
                    }`}
                  />
                  {errors.description && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{errors.description}</p>
                  )}
                </div>

              </div>
            )}

            {/* Concise Bid Card */}
            <ProjectBidCard
              amount={biddingAmount}
              onChangeAmount={setBiddingAmount}
            />

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-cancel-submission"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-submit-project-final"
                disabled={
                  isSubmitting ||
                  isCheckingDomain ||
                  Boolean(errors.websiteUrl) ||
                  Boolean(
                    domainCheckResult?.exists &&
                      cleanDomain &&
                      domainCheckResult.domain === cleanDomain
                  )
                }
                className="liquid-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {biddingAmount > 0
                        ? `Submit with $${biddingAmount} Bid`
                        : 'Submit Project (Free)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

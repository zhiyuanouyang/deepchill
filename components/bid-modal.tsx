'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  DollarSign,
  TrendingUp,
  Sparkles,
  Loader2,
  CheckCircle2,
  Flame,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, TrendingProduct, NewestReleaseProduct } from '@/lib/types';
import { VerifiedBadge } from '@/components/verification/verified-badge';

export interface BidTargetProject {
  id: string;
  name: string;
  logoUrl?: string;
  category?: string;
  websiteUrl?: string;
  domain?: string;
  totalBid?: number;
  totalPaid?: number;
  rank?: number;
  dofollowApproved?: boolean;
  isVerified?: boolean;
}

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BidTargetProject | TrendingProduct | NewestReleaseProduct | Product | null;
  onBidSuccess: (
    projectId: string,
    addedAmount: number,
    newTotalBids: number,
    updatedAt: string
  ) => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  project,
  onBidSuccess,
}) => {
  const [amount, setAmount] = useState<number>(25);
  const [customInput, setCustomInput] = useState<string>('25');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successNewTotal, setSuccessNewTotal] = useState<number>(0);
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    setLogoError(false);
  }, [project?.logoUrl]);

  // Compute current total bid for the project
  const currentTotal = useMemo(() => {
    if (!project) return 0;
    return (
      project.totalBid ??
      ('totalPaid' in project ? (project as Product).totalPaid : undefined) ??
      0
    );
  }, [project]);

  // Projected new total
  const projectedTotal = currentTotal + (amount > 0 ? amount : 0);

  // Reset state when modal opens with a project
  useEffect(() => {
    if (isOpen) {
      setAmount(25);
      setCustomInput('25');
      setIsSubmitting(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setSuccessNewTotal(0);
    }
  }, [isOpen, project]);

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomInput(val.toString());
    setErrorMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
      setErrorMessage(null);
    } else {
      setAmount(0);
    }
  };

  const handleQuickAdd = (delta: number) => {
    const next = Math.max(1, amount + delta);
    setAmount(next);
    setCustomInput(next.toString());
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    if (amount <= 0 || !Number.isInteger(amount)) {
      setErrorMessage('Please enter a valid bid amount of at least $1.');
      return;
    }

    if (amount > 1000000) {
      setErrorMessage('Maximum bid amount is $1,000,000.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit bid. Please try again.');
      }

      const newTotal = data.totalBids ?? projectedTotal;
      const updatedAt = data.updatedAt ?? new Date().toISOString();

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
        });
      } catch {
        // Safe fallback if canvas-confetti is unavailable
      }

      setSuccessNewTotal(newTotal);
      setIsSuccess(true);

      // Notify parent to immediately update project's total_bids on UI
      onBidSuccess(project.id, amount, newTotal, updatedAt);

      // Auto-close after showing success state
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content
          aria-describedby="bid-modal-description"
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-[50%] -translate-y-[50%] rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.1] p-6 sm:p-7 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {isSuccess ? (
            /* ─── SUCCESS STATE ─── */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Bid Placed Successfully!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  You added <strong className="text-amber-600 dark:text-amber-400">+${amount}</strong> to{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">{project.name}</span>.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-300/40 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 text-sm font-bold">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>New Total Backing: ${successNewTotal.toLocaleString()}</span>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Project rankings and live counters have been updated in real-time.
              </p>
            </div>
          ) : (
            /* ─── BIDDING FORM ─── */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Header: Project preview & Current Standing */}
              <div className="flex items-start gap-3.5 pr-8">
                {/* Project Logo Squircle */}
                <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center shrink-0 shadow-xs">
                  {project.logoUrl && !logoError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.logoUrl}
                      alt={project.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xl select-none">
                      {project.name ? project.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Dialog.Title className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                      Add Bid for {project.name}
                    </Dialog.Title>

                    <VerifiedBadge project={project} size="xs" />
                  </div>

                  <p id="bid-modal-description" className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {'category' in project && project.category ? (
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {String(project.category)} ·{' '}
                      </span>
                    ) : null}
                    Boost visibility and climb the leaderboard rankings.
                  </p>
                </div>
              </div>

              {/* Dynamic Live Calculation Card */}
              <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-amber-500/[0.07] via-slate-50 to-indigo-500/[0.05] dark:from-amber-500/[0.12] dark:via-slate-800/60 dark:to-indigo-500/[0.08] border border-amber-200/70 dark:border-amber-700/40">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Current Total
                    </span>
                    <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                      ${currentTotal.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold text-sm sm:text-base">
                    <span>+</span>
                    <span>${amount > 0 ? amount : 0}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
                  </div>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      New Total Backing
                    </span>
                    <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                      ${projectedTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Bids directly power placement in <strong>Trending Projects</strong> and <strong>Category leaderboards</strong>.
                  </span>
                </div>
              </div>

              {/* Quick Select Preset Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Quick Select Amount
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AMOUNTS.map((val) => {
                    const isSelected = amount === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectPreset(val)}
                        className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                        }`}
                      >
                        +${val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Input Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="custom-bid-amount"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Custom Bid Amount ($ USD)
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(10)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      +$10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(50)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      +$50
                    </button>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-slate-300 dark:border-slate-700 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 bg-slate-50/50 dark:bg-slate-800/50 transition-all">
                  <div className="absolute left-3.5 top-[50%] -translate-y-[50%] text-slate-400 dark:text-slate-500 font-bold text-lg select-none">
                    $
                  </div>
                  <input
                    id="custom-bid-amount"
                    type="text"
                    inputMode="numeric"
                    value={customInput}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-12 py-3 bg-transparent text-slate-900 dark:text-white font-extrabold text-lg sm:text-xl outline-none"
                  />
                  <div className="absolute right-3.5 top-[50%] -translate-y-[50%] text-xs font-bold text-slate-400 dark:text-slate-500 uppercase select-none">
                    USD
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="rounded-xl p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || amount <= 0}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/30 transition-all duration-150 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                      <span>Placing Bid...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900/30" />
                      <span>Confirm &amp; Place Bid · ${amount > 0 ? amount : 0}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

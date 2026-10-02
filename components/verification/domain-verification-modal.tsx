'use client';

import React, { useState, useEffect, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  LogIn,
  Sparkles,
  ArrowRight,
  Globe,
  FileCode2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/components/auth/auth-provider';
import { extractDomain } from '@/lib/utils';
import Link from 'next/link';

export interface DomainVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    websiteUrl?: string;
    domain?: string;
    isVerified?: boolean;
  } | null;
  onVerified?: (projectId: string) => void;
}

export function DomainVerificationModal({
  isOpen,
  onClose,
  project,
  onVerified,
}: DomainVerificationModalProps) {
  const { user, displayName, isLoading: isAuthLoading } = useAuth();

  const [copiedField, setCopiedField] = useState<'filename' | 'content' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedHost, setVerifiedHost] = useState<string>('');

  // Extract clean host/subdomain
  const targetHost = useMemo(() => {
    if (!project) return '';
    if (project.domain && project.domain.trim()) {
      return project.domain.trim().toLowerCase().replace(/^www\./i, '');
    }
    if (project.websiteUrl) {
      try {
        const raw = project.websiteUrl.trim();
        const hasProto = /^https?:\/\//i.test(raw);
        const parsed = new URL(hasProto ? raw : `https://${raw}`);
        return parsed.hostname.replace(/^www\./i, '').toLowerCase();
      } catch {
        return extractDomain(project.websiteUrl);
      }
    }
    return '';
  }, [project]);

  const fileName = 'deepchill-verify.txt';
  const fileContent = useMemo(() => {
    if (!project) return '';
    return `deepchill-verification-code=${project.id}`;
  }, [project]);

  const targetFileUrl = useMemo(() => {
    if (!targetHost) return '';
    return `https://${targetHost}/${fileName}`;
  }, [targetHost]);

  // Reset state when project or open state changes
  useEffect(() => {
    if (isOpen) {
      setIsVerifying(false);
      setErrorMessage(null);
      setCopiedField(null);
      if (project?.isVerified) {
        setIsSuccess(true);
        setVerifiedHost(targetHost);
      } else {
        setIsSuccess(false);
      }
    }
  }, [isOpen, project, targetHost]);

  const handleCopy = (type: 'filename' | 'content', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleDownloadFile = () => {
    if (!fileContent) return;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    if (!project) return;
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/projects/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: project.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || 'Verification failed. Please ensure the file is reachable at your domain.'
        );
        setIsVerifying(false);
        return;
      }

      // Success!
      setIsSuccess(true);
      setVerifiedHost(data.domain || targetHost);
      setIsVerifying(false);

      if (onVerified) {
        onVerified(project.id);
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#3b82f6', '#ec4899'],
        });
      } catch {
        // Confetti optional
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Network error occurred while connecting to verification service.'
      );
      setIsVerifying(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 duration-200 focus:outline-none animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSuccess
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                    : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {isSuccess ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Verify Domain Ownership</span>
                  {isSuccess && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/70 dark:border-emerald-800/60">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  )}
                </Dialog.Title>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Project: <strong className="text-slate-700 dark:text-slate-200">{project.name}</strong>
                  {targetHost && (
                    <>
                      {' · '}
                      <code className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {targetHost}
                      </code>
                    </>
                  )}
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Modal Content */}
          <div className="mt-5 space-y-4">
            {/* Condition 1: Already Verified State */}
            {isSuccess ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                      Domain Ownership Verified
                    </p>
                    <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                      Ownership of <strong className="font-semibold">{verifiedHost || targetHost}</strong> has been proven via file verification.
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px] pt-1">
                      This project now proudly displays the verified badge across all directory and category leaderboards.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : !user && !isAuthLoading ? (
              /* Condition 2: Not logged in prompt */
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 flex items-start gap-3 text-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      Sign in Required
                    </p>
                    <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      You must be signed in to verify and claim domain ownership of{' '}
                      <strong>{project.name}</strong>. This ensures the verified ownership record is securely linked to your account.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Why verify your domain?
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <li>Earn the green Verified Trust badge on directory leaderboards</li>
                    <li>Boost project authenticity and CTR for backlinks</li>
                    <li>Claim project governance and future maker features</li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="w-full sm:w-auto liquid-btn-primary flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In to Verify</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Condition 3: Logged in & Verification Steps */
              <div className="space-y-4">
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Verify domain ownership by uploading a small text file with a unique verification token to your website root (just like Google Search Console).
                </div>

                {/* Step 1: Create verification file */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                        1
                      </span>
                      <span>Create Verification File</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleDownloadFile}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer"
                      title="Download ready-to-use verification file"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download File</span>
                    </button>
                  </div>

                  {/* File Name Row */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      File Name
                    </label>
                    <div className="flex items-center gap-1.5">
                      <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 select-all">
                        {fileName}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('filename', fileName)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        title="Copy file name"
                      >
                        {copiedField === 'filename' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px]">
                          {copiedField === 'filename' ? 'Copied' : 'Copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* File Content Row */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      File Content
                    </label>
                    <div className="flex items-center gap-1.5">
                      <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 select-all truncate">
                        {fileContent}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('content', fileContent)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        title="Copy file content"
                      >
                        {copiedField === 'content' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px]">
                          {copiedField === 'content' ? 'Copied' : 'Copy'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Upload to root of domain */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                      2
                    </span>
                    <span>Upload to Root Directory</span>
                  </span>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload the file so it is publicly accessible at your root domain or subdomain (e.g. in Next.js, Vite, or Astro put it into the <code className="font-mono text-indigo-600 dark:text-indigo-400">public/</code> folder):
                  </p>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-indigo-600 dark:text-indigo-400 truncate">
                      {targetFileUrl}
                    </code>
                    {targetFileUrl && (
                      <a
                        href={targetFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 shrink-0"
                        title="Test file URL in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-[11px]">Test</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="rounded-xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-900 dark:text-rose-200">
                        Verification Unsuccessful
                      </p>
                      <p className="leading-relaxed">{errorMessage}</p>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400 pt-1">
                        Tip: Open <code className="font-mono">{targetFileUrl}</code> in your browser to verify it responds with 200 OK and contains the token.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    Verifying as {displayName || user?.email?.split('@')[0] || 'User'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="liquid-btn-primary flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking domain...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify Ownership</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

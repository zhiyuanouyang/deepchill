import React, { Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function ErrorContent({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading error details...</div>}>
      <ErrorDetails searchParams={searchParams} />
    </Suspense>
  );
}

async function ErrorDetails({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const resolvedParams = await searchParams;
  const message = resolvedParams?.message || 'The verification link has expired or has already been used.';

  return (
    <div className="w-full max-w-md p-8 liquid-glass rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5 border border-rose-200/50 dark:border-rose-800/50 shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        Authentication Error
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/login"
          className="liquid-btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

export default async function AuthCodeErrorPage(props: {
  searchParams: Promise<{ message?: string }>;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Ambient background glow */}
      <div className="liquid-blob-1 absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none filter blur-3xl opacity-70" />
      <div className="liquid-blob-2 absolute -bottom-40 -right-40 w-96 h-96 rounded-full pointer-events-none filter blur-3xl opacity-70" />

      <ErrorContent searchParams={props.searchParams} />
    </main>
  );
}

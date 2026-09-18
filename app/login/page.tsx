import React, { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Deepchill Directory',
  description: 'Sign in to Deepchill to submit your projects and manage your launches.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic ambient liquid background glows */}
      <div className="liquid-blob-1 absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none filter blur-3xl opacity-70" />
      <div className="liquid-blob-2 absolute -bottom-40 -right-40 w-96 h-96 rounded-full pointer-events-none filter blur-3xl opacity-70" />
      <div className="liquid-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none filter blur-3xl opacity-30" />

      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 liquid-glass rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl flex items-center justify-center min-h-[400px]">
            <div className="text-slate-400 text-sm">Loading sign in...</div>
          </div>
        }
      >
        <AuthCard initialMode="signin" />
      </Suspense>
    </main>
  );
}

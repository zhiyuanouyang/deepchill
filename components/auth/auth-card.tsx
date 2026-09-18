'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/auth-provider';
import { GoogleIcon, GithubIcon, MicrosoftIcon, DiscordIcon } from '@/components/icons';
import { Provider } from '@supabase/supabase-js';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup';
}

export const AuthCard: React.FC<AuthCardProps> = ({ initialMode = 'signin' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next') || '/';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const [supabase] = useState(() => createClient());

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [method, setMethod] = useState<'password' | 'magic-link'>('password');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & loading states
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Sync mode with props if initialMode changes
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  // Handle OAuth Sign-in
  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'azure' | 'discord') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingAction(`oauth-${provider}`);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoadingAction(null);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to initiate social login');
      setLoadingAction(null);
    }
  };

  // Handle Password Sign In or Sign Up
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoadingAction('password-submit');
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (data.session) {
          setSuccessMessage('Account created successfully! Redirecting...');
          setTimeout(() => router.push(next), 1200);
        } else {
          // Email confirmation enabled on Supabase
          setSuccessMessage('Account created! Please check your email to confirm your registration.');
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'An error occurred during sign up.');
      } finally {
        setLoadingAction(null);
      }
    } else {
      // Sign In
      setLoadingAction('password-submit');
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Signed in successfully! Redirecting...');
          setTimeout(() => router.push(next), 800);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to sign in.');
      } finally {
        setLoadingAction(null);
      }
    }
  };

  // Handle Magic Link (OTP)
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoadingAction('magic-link-submit');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMagicLinkSent(true);
        setSuccessMessage(`A magic link has been sent to ${cleanEmail}. Click the link in your email to sign in!`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send magic link.');
    } finally {
      setLoadingAction(null);
    }
  };

  // If user is already authenticated, show friendly active session card
  if (!isAuthLoading && user) {
    return (
      <div className="w-full max-w-md p-8 sm:p-10 liquid-glass rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 border border-indigo-200/50 dark:border-indigo-800/50 shadow-inner">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Already Signed In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Signed in as</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 py-1.5 px-3 rounded-xl inline-block border border-slate-200/60 dark:border-slate-700/60 mb-6">
          {user.email}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(next)}
            className="liquid-btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-md cursor-pointer"
          >
            <span>Continue to App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={signOut}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 sm:p-9 liquid-glass rounded-3xl border border-white/70 dark:border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      {/* Decorative inner glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 text-white shadow-lg shadow-indigo-900/15 dark:shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <Layers className="w-5 h-5 text-indigo-200" />
            <div className="absolute inset-0 rounded-xl bg-white/10 pointer-events-none" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            Deepchill
          </span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {mode === 'signin'
            ? 'Sign in to manage your submissions and upvotes'
            : 'Join makers launching and discovering great products'}
        </p>
      </div>

      {/* Mode Switch Tabs (Sign In / Sign Up) */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/50 dark:bg-slate-800/60 rounded-xl mb-6 border border-slate-200/70 dark:border-slate-700/70">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMessage(null);
            setSuccessMessage(null);
            setMagicLinkSent(false);
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'signin'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMessage(null);
            setSuccessMessage(null);
            setMagicLinkSent(false);
          }}
          className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === 'signup'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error & Success Feedback Alerts */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* Social OAuth Buttons Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <button
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={loadingAction !== null}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60"
          title="Sign in with Google"
        >
          {loadingAction === 'oauth-google' ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          ) : (
            <GoogleIcon className="w-4 h-4" />
          )}
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          disabled={loadingAction !== null}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60"
          title="Sign in with GitHub"
        >
          {loadingAction === 'oauth-github' ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          ) : (
            <GithubIcon className="w-4 h-4" />
          )}
          <span>GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn('azure')}
          disabled={loadingAction !== null}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60"
          title="Sign in with Microsoft"
        >
          {loadingAction === 'oauth-azure' ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          ) : (
            <MicrosoftIcon className="w-4 h-4" />
          )}
          <span>Microsoft</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn('discord')}
          disabled={loadingAction !== null}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60"
          title="Sign in with Discord"
        >
          {loadingAction === 'oauth-discord' ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          ) : (
            <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
          )}
          <span>Discord</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
        <span className="absolute px-3 text-[11px] font-semibold tracking-wider uppercase bg-[#f8fafc] dark:bg-[#0f172a] text-slate-400 dark:text-slate-500 rounded-full">
          Or with email
        </span>
      </div>

      {/* Method Switch: Password vs Magic Link */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setMethod('password');
            setErrorMessage(null);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            method === 'password'
              ? 'liquid-glass-active text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Password
        </button>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <button
          type="button"
          onClick={() => {
            setMethod('magic-link');
            setErrorMessage(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            method === 'magic-link'
              ? 'liquid-glass-active text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Magic Link</span>
        </button>
      </div>

      {/* Magic Link Sent State */}
      {magicLinkSent && method === 'magic-link' ? (
        <div className="text-center py-4 px-2">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Check your inbox
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            We sent a sign-in link to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
            Click the link in your email to instantly authenticate.
          </p>
          <button
            type="button"
            onClick={() => {
              setMagicLinkSent(false);
              setSuccessMessage(null);
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Didn&apos;t receive it? Click to resend
          </button>
        </div>
      ) : method === 'magic-link' ? (
        /* Magic Link Form */
        <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maker@example.com"
                className="liquid-glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>We will send you a passwordless sign-in link</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loadingAction !== null}
            className="liquid-btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md cursor-pointer disabled:opacity-60 transition-all"
          >
            {loadingAction === 'magic-link-submit' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Send Magic Link</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Password Form */
        <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maker@example.com"
                className="liquid-glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMethod('magic-link');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                className="liquid-glass-input w-full pl-9 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="liquid-glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                {confirmPassword && confirmPassword === password && (
                  <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3 pointer-events-none" />
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingAction !== null}
            className="liquid-btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md cursor-pointer disabled:opacity-60 transition-all mt-2"
          >
            {loadingAction === 'password-submit' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer Switch Prompt */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        {mode === 'signin' ? (
          <p>
            Don&apos;t have an account?{' '}
            <Link
              href={`/signup?next=${encodeURIComponent(next)}`}
              onClick={(e) => {
                e.preventDefault();
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              onClick={(e) => {
                e.preventDefault();
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

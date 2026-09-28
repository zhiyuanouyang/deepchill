'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  displayName: string;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateDisplayName: (newName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  displayName: '',
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  updateDisplayName: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
        setSession(data.session ?? null);
        setProfile(data.profile ?? null);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error checking auth session:', err);
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitialSession() {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setUser(data.user ?? null);
            setSession(data.session ?? null);
            setProfile(data.profile ?? null);
          }
        } else if (!ignore) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
        if (!ignore) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitialSession();

    // Re-verify session when window gains focus
    const handleFocus = () => {
      fetchSession();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      ignore = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSession]);

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Error during sign out:', err);
    }
  };

  const updateDisplayName = async (newName: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: newName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Derive display name from profile.display_name first, then metadata, then email
  const displayName = useMemo(() => {
    if (profile?.display_name && profile.display_name.trim()) {
      return profile.display_name.trim();
    }
    const meta = user?.user_metadata?.display_name || user?.user_metadata?.full_name;
    if (typeof meta === 'string' && meta.trim()) {
      return meta.trim();
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '';
  }, [profile, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        displayName,
        isLoading,
        signOut,
        refreshSession: fetchSession,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


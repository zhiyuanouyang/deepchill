'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Error checking auth session:', err);
      setUser(null);
      setSession(null);
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
          }
        } else if (!ignore) {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
        if (!ignore) {
          setUser(null);
          setSession(null);
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
    } catch (err) {
      console.error('Error during sign out:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        refreshSession: fetchSession,
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


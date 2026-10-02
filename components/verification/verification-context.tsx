'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DomainVerificationModal } from './domain-verification-modal';

export interface VerificationProjectTarget {
  id: string;
  name: string;
  websiteUrl?: string;
  domain?: string;
  isVerified?: boolean;
}

interface VerificationContextType {
  isProjectVerified: (projectId: string, fallback?: boolean) => boolean;
  openVerificationModal: (project: VerificationProjectTarget) => void;
  closeVerificationModal: () => void;
  markProjectVerified: (projectId: string) => void;
  refreshOwnerships: () => Promise<void>;
  activeProject: VerificationProjectTarget | null;
  isModalOpen: boolean;
}

const VerificationContext = createContext<VerificationContextType | null>(null);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [verifiedSet, setVerifiedSet] = useState<Set<string>>(new Set());
  const [activeProject, setActiveProject] = useState<VerificationProjectTarget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOwnerships = useCallback(async () => {
    try {
      const res = await fetch('/api/projects/ownerships', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.verifiedProjectIds)) {
          setVerifiedSet((prev) => {
            const next = new Set(prev);
            data.verifiedProjectIds.forEach((id: string) => next.add(id));
            return next;
          });
        }
      }
    } catch {
      // Gracefully ignore fetch errors
    }
  }, []);

  useEffect(() => {
    fetchOwnerships();
  }, [fetchOwnerships]);

  const isProjectVerified = useCallback(
    (projectId: string, fallback?: boolean): boolean => {
      if (verifiedSet.has(projectId)) return true;
      return Boolean(fallback);
    },
    [verifiedSet]
  );

  const openVerificationModal = useCallback((project: VerificationProjectTarget) => {
    setActiveProject(project);
    setIsModalOpen(true);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const markProjectVerified = useCallback((projectId: string) => {
    setVerifiedSet((prev) => {
      const next = new Set(prev);
      next.add(projectId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isProjectVerified,
      openVerificationModal,
      closeVerificationModal,
      markProjectVerified,
      refreshOwnerships: fetchOwnerships,
      activeProject,
      isModalOpen,
    }),
    [
      isProjectVerified,
      openVerificationModal,
      closeVerificationModal,
      markProjectVerified,
      fetchOwnerships,
      activeProject,
      isModalOpen,
    ]
  );

  return (
    <VerificationContext.Provider value={value}>
      {children}
      <DomainVerificationModal
        isOpen={isModalOpen}
        onClose={closeVerificationModal}
        project={activeProject}
        onVerified={(projectId) => {
          markProjectVerified(projectId);
        }}
      />
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}

'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useVerification } from './verification-context';

export interface VerifiedBadgeProps {
  project: {
    id: string;
    name: string;
    websiteUrl?: string;
    domain?: string;
    isVerified?: boolean;
    dofollowApproved?: boolean;
  };
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  project,
  size = 'sm',
  showLabel = true,
  className = '',
  onClick,
}) => {
  const { isProjectVerified, openVerificationModal } = useVerification();
  const verified = isProjectVerified(project.id, project.isVerified);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick(e);
    } else {
      openVerificationModal({
        id: project.id,
        name: project.name,
        websiteUrl: project.websiteUrl,
        domain: project.domain,
        isVerified: verified,
      });
    }
  };

  // Size styling variants
  const sizeConfig = {
    xs: {
      badge: 'text-[9px] px-1.5 py-0.5 rounded-md gap-0.5',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      badge: 'text-[10px] px-2 py-0.5 rounded-full gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'text-xs px-2.5 py-0.5 rounded-full gap-1.5',
      icon: 'w-3.5 h-3.5',
    },
  }[size];

  if (verified) {
    return (
      <button
        type="button"
        onClick={handleClick}
        id={`verified-chip-${project.id}`}
        title="Verified Domain Ownership — Click to view details"
        aria-label="Verified Domain Ownership"
        className={`inline-flex items-center font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 shrink-0 ${sizeConfig.badge} ${className}`}
      >
        <ShieldCheck className={`${sizeConfig.icon} text-emerald-600 dark:text-emerald-400 shrink-0`} />
        {showLabel && (
          <span className="truncate">
            <span className="hidden sm:inline">Verified</span>
            <span className="sm:hidden">Verif.</span>
          </span>
        )}
      </button>
    );
  }

  // Unverified status and color
  return (
    <button
      type="button"
      onClick={handleClick}
      id={`unverified-chip-${project.id}`}
      title="Unverified Domain — Click to verify ownership"
      aria-label="Unverified Domain — Click to verify ownership"
      className={`inline-flex items-center font-semibold text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/50 hover:bg-amber-100/90 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 shrink-0 group ${sizeConfig.badge} ${className}`}
    >
      <ShieldAlert className={`${sizeConfig.icon} text-amber-500 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform`} />
      {showLabel && (
        <span className="truncate">
          <span className="hidden sm:inline">Unverified</span>
          <span className="sm:hidden">Verify</span>
        </span>
      )}
    </button>
  );
};

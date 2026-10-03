'use client';

import React from 'react';
import {
  Terminal,
  Server,
  Bot,
  Zap,
  Palette,
  BarChart3,
  ShieldCheck,
  Wrench,
  Tag,
  LucideIcon,
} from 'lucide-react';
import { ProductCategory } from '@/lib/types';

interface CategoryBadgeTheme {
  icon: LucideIcon;
  badgeClass: string;
  iconClass: string;
  dotClass: string;
}

const CATEGORY_MAP: Record<string, CategoryBadgeTheme> = {
  DevTools: {
    icon: Terminal,
    badgeClass:
      'bg-blue-500/[0.08] dark:bg-blue-500/[0.16] text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60 hover:bg-blue-500/[0.14]',
    iconClass: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500 shadow-blue-500/40',
  },
  'Open Source Infrastructure': {
    icon: Server,
    badgeClass:
      'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.16] text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-500/[0.14]',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500 shadow-emerald-500/40',
  },
  'AI & Machine Learning': {
    icon: Bot,
    badgeClass:
      'bg-purple-500/[0.08] dark:bg-purple-500/[0.16] text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60 hover:bg-purple-500/[0.14]',
    iconClass: 'text-purple-600 dark:text-purple-400',
    dotClass: 'bg-purple-500 shadow-purple-500/40',
  },
  Productivity: {
    icon: Zap,
    badgeClass:
      'bg-amber-500/[0.08] dark:bg-amber-500/[0.16] text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60 hover:bg-amber-500/[0.14]',
    iconClass: 'text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500 shadow-amber-500/40',
  },
  'Design & Creative': {
    icon: Palette,
    badgeClass:
      'bg-pink-500/[0.08] dark:bg-pink-500/[0.16] text-pink-700 dark:text-pink-300 border-pink-200/70 dark:border-pink-800/60 hover:bg-pink-500/[0.14]',
    iconClass: 'text-pink-600 dark:text-pink-400',
    dotClass: 'bg-pink-500 shadow-pink-500/40',
  },
  'SaaS & Analytics': {
    icon: BarChart3,
    badgeClass:
      'bg-indigo-500/[0.08] dark:bg-indigo-500/[0.16] text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60 hover:bg-indigo-500/[0.14]',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    dotClass: 'bg-indigo-500 shadow-indigo-500/40',
  },
  'Security & Privacy': {
    icon: ShieldCheck,
    badgeClass:
      'bg-teal-500/[0.08] dark:bg-teal-500/[0.16] text-teal-700 dark:text-teal-300 border-teal-200/70 dark:border-teal-800/60 hover:bg-teal-500/[0.14]',
    iconClass: 'text-teal-600 dark:text-teal-400',
    dotClass: 'bg-teal-500 shadow-teal-500/40',
  },
  'Developer Utilities': {
    icon: Wrench,
    badgeClass:
      'bg-orange-500/[0.08] dark:bg-orange-500/[0.16] text-orange-700 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60 hover:bg-orange-500/[0.14]',
    iconClass: 'text-orange-600 dark:text-orange-400',
    dotClass: 'bg-orange-500 shadow-orange-500/40',
  },
};

const DEFAULT_THEME: CategoryBadgeTheme = {
  icon: Tag,
  badgeClass:
    'bg-slate-500/[0.08] dark:bg-slate-500/[0.16] text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-500/[0.14]',
  iconClass: 'text-slate-600 dark:text-slate-400',
  dotClass: 'bg-slate-400 shadow-slate-400/40',
};

export interface CategoryBadgeProps {
  category?: ProductCategory | string;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  showLabel?: boolean;
  labelClassName?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>) => void;
}

/**
 * State-of-the-art SaaS Category Mini-Chip
 *
 * Implements modern SaaS design standards:
 * - Subtle translucent tinted background with hairline border
 * - Micro category glyph icon with optical alignment
 * - Crisp typography and tight tracking
 * - Optional interactive state with smooth micro-interactions
 */
export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'sm',
  showIcon = true,
  showLabel = true,
  labelClassName = '',
  className = '',
  onClick,
}) => {
  if (!category) return null;

  const theme = CATEGORY_MAP[category] || DEFAULT_THEME;
  const Icon = theme.icon;

  const sizeClasses = {
    xs: {
      container: 'px-1.5 py-0.5 text-[9px] gap-1 rounded-md font-medium tracking-tight',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      container: 'px-2 py-0.5 text-[10px] gap-1.5 rounded-md font-medium tracking-tight',
      icon: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    },
    md: {
      container: 'px-2.5 py-0.5 text-xs gap-1.5 rounded-lg font-semibold tracking-tight',
      icon: 'w-3.5 h-3.5',
    },
  }[size];

  const interactiveClasses = onClick
    ? 'cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-150 shadow-2xs'
    : 'select-none transition-colors duration-150';

  const content = (
    <>
      {showIcon && (
        <Icon
          className={`${sizeClasses.icon} ${theme.iconClass} shrink-0 stroke-[2.2]`}
          aria-hidden="true"
        />
      )}
      {showLabel && <span className={`truncate leading-none ${labelClassName}`}>{category}</span>}
    </>
  );

  const sharedClasses = `inline-flex items-center shrink-0 border backdrop-blur-xs ${theme.badgeClass} ${sizeClasses.container} ${interactiveClasses} ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={`Category: ${category} (Click to filter)`}
        className={sharedClasses}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      title={`Category: ${category}`}
      className={sharedClasses}
    >
      {content}
    </span>
  );
};

export default CategoryBadge;

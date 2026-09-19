import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a timestamp into a human-friendly relative time string
 * (e.g., "just now", "1 min ago", "12 mins ago", "2 hours ago", "3 days ago").
 */
export function formatRelativeTime(
  dateInput: string | Date | number | undefined | null,
  now = Date.now()
): string {
  if (!dateInput) return 'Recent';
  const time =
    typeof dateInput === 'number' ? dateInput : new Date(dateInput).getTime();

  if (isNaN(time)) return 'Recent';

  const diffMs = now - time;
  // Clock skew or within the last 45 seconds
  if (diffMs < 45 * 1000) {
    return 'just now';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes < 1) {
    return 'just now';
  }
  if (diffMinutes === 1) {
    return '1 min ago';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }
  if (diffHours === 1) {
    return '1 hour ago';
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) {
    return '1 day ago';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffWeeks === 1) {
    return '1 week ago';
  }
  if (diffWeeks < 4) {
    return `${diffWeeks} weeks ago`;
  }
  if (diffMonths === 1) {
    return '1 month ago';
  }
  if (diffMonths < 12) {
    return `${diffMonths} months ago`;
  }
  if (diffYears === 1) {
    return '1 year ago';
  }
  return `${diffYears} years ago`;
}

/**
 * Formats a timestamp into a formatted exact date/time string (YYYY-MM-DD HH:mm:ss).
 */
export function formatExactDateTime(
  dateInput: string | Date | number | undefined | null
): string {
  if (!dateInput) return 'Recent';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Recent';
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  } catch {
    return 'Recent';
  }
}

/**
 * Extracts a clean hostname / domain from a website URL
 * e.g., "https://supabase.com/docs" -> "supabase.com"
 */
export function extractDomain(url: string | undefined | null): string {
  if (!url) return '';
  try {
    const parsed = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0] || '';
  }
}



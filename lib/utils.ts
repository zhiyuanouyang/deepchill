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
 * Result of website URL syntax validation
 */
export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  domain?: string;
  cleanOrigin?: string;
  normalizedUrl?: string;
}

/**
 * Validates a user-supplied website URL.
 * - Allows protocols: http and https (or prepends https:// if omitted)
 * - Disallows other protocols (e.g. ftp, mailto, javascript)
 * - Allows domain / host (domain name, localhost, or IP)
 * - Allows optional port (1-65535)
 * - Ignores path, query parameters, hash/fragments
 */
export function validateWebsiteUrl(input: string | undefined | null): UrlValidationResult {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Website URL is required' };
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Website URL is required' };
  }

  // Disallow unsupported protocols (ftp, javascript, mailto, etc.)
  const protocolMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (protocolMatch) {
    const proto = protocolMatch[1].toLowerCase();
    if (proto !== 'http' && proto !== 'https') {
      return { isValid: false, error: 'Protocol must be http or https' };
    }
  }

  // Ensure URL can be parsed by new URL()
  const urlWithProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(urlWithProto);
  } catch {
    return { isValid: false, error: 'Please enter a valid website link format' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Protocol must be http or https' };
  }

  const hostname = parsed.hostname;
  if (!hostname || hostname.length < 1) {
    return { isValid: false, error: 'Missing domain or host' };
  }

  // Validate port if present
  if (parsed.port) {
    const port = Number(parsed.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return { isValid: false, error: 'Port must be between 1 and 65535' };
    }
  }

  // Validate hostname syntax: localhost, IP address, or standard domain
  const lowerHost = hostname.toLowerCase();
  const isLocalhost = lowerHost === 'localhost' || lowerHost === '127.0.0.1';
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(lowerHost);
  const isDomain = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(lowerHost);

  if (!isLocalhost && !isIpv4 && !isDomain) {
    return { isValid: false, error: 'Please enter a valid domain (e.g. example.com)' };
  }

  // Extract clean domain (ignoring path, query parameters, port, and leading www.)
  const domain = lowerHost.replace(/^www\./i, '');

  return {
    isValid: true,
    domain,
    cleanOrigin: `${parsed.protocol}//${parsed.host}`,
    normalizedUrl: parsed.href,
  };
}

/**
 * Extracts a clean hostname / domain from a website URL, ignoring paths, queries, ports, and www.
 * e.g., "https://supabase.com/docs?ref=1" -> "supabase.com"
 * e.g., "http://localhost:3000/app" -> "localhost"
 */
export function extractDomain(url: string | undefined | null): string {
  if (!url) return '';
  const validation = validateWebsiteUrl(url);
  if (validation.isValid && validation.domain) {
    return validation.domain;
  }
  try {
    const trimmed = url.trim();
    const hasProto = /^https?:\/\//i.test(trimmed);
    const parsed = new URL(hasProto ? trimmed : `https://${trimmed}`);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return (
      url
        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
        .split('/')[0]
        .split('?')[0]
        .split('#')[0]
        .split(':')[0]
        .toLowerCase() || ''
    );
  }
}



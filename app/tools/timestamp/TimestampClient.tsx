'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import CopyButton from '@/app/components/tools/CopyButton';
import ClearButton from '@/app/components/tools/ClearButton';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';
import SubdomainCTA from '@/app/components/tools/SubdomainCTA';

type InputMode = 'timestamp' | 'date';

function nowTs() { return Math.floor(Date.now() / 1000); }

function formatRelative(ts: number): string {
    const diff = Math.abs(Math.floor(Date.now() / 1000) - ts);
    if (diff < 60) return `${diff} second${diff !== 1 ? 's' : ''} ${ts > nowTs() ? 'from now' : 'ago'}`;
    if (diff < 3600) { const m = Math.floor(diff / 60); return `${m} minute${m !== 1 ? 's' : ''} ${ts > nowTs() ? 'from now' : 'ago'}`; }
    if (diff < 86400) { const h = Math.floor(diff / 3600); return `${h} hour${h !== 1 ? 's' : ''} ${ts > nowTs() ? 'from now' : 'ago'}`; }
    const d = Math.floor(diff / 86400);
    return `${d} day${d !== 1 ? 's' : ''} ${ts > nowTs() ? 'from now' : 'ago'}`;
}

interface ParsedTime {
    unix: number;
    utc: string;
    local: string;
    iso: string;
    relative: string;
    dayOfWeek: string;
    ms: number;
}

function parseTimestamp(value: string): { result: ParsedTime | null; error: string | null } {
    if (!value.trim()) return { result: null, error: null };
    const n = Number(value.trim());
    if (!isNaN(n)) {
        const ms = n > 1e10 ? n : n * 1000; // auto-detect ms vs s
        const d = new Date(ms);
        if (isNaN(d.getTime())) return { result: null, error: 'Invalid timestamp value.' };
        return {
            result: {
                unix: Math.floor(ms / 1000),
                ms,
                utc: d.toUTCString(),
                local: d.toLocaleString(),
                iso: d.toISOString(),
                relative: formatRelative(Math.floor(ms / 1000)),
                dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()],
            },
            error: null,
        };
    }
    // Try as a date string
    const d = new Date(value.trim());
    if (isNaN(d.getTime())) return { result: null, error: 'Could not parse as a timestamp or date string.' };
    const unix = Math.floor(d.getTime() / 1000);
    return {
        result: {
            unix,
            ms: d.getTime(),
            utc: d.toUTCString(),
            local: d.toLocaleString(),
            iso: d.toISOString(),
            relative: formatRelative(unix),
            dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()],
        },
        error: null,
    };
}

const SHORTCUTS = [
    { keys: ['⌘', 'Shift', 'N'], description: 'Insert current timestamp' },
    { keys: ['Esc'], description: 'Clear' },
];

const FAQS = [
    { question: 'What is a Unix timestamp?', answer: 'A Unix timestamp (also called Epoch time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC. It is a universal, timezone-independent way to represent a point in time.' },
    { question: 'Is Unix time in seconds or milliseconds?', answer: 'The classic Unix timestamp is in seconds. JavaScript\'s Date.now() returns milliseconds. This tool automatically detects which you\'ve entered based on the magnitude of the number.' },
    { question: 'What is the maximum Unix timestamp?', answer: 'A 32-bit signed integer can hold Unix timestamps up to 2,147,483,647, which is January 19, 2038 — the "Year 2038 problem". Most modern systems use 64-bit integers, which extend far beyond that.' },
    { question: 'How do I get the current Unix timestamp in code?', answer: 'In JavaScript: Math.floor(Date.now() / 1000). In Python: import time; int(time.time()). In Go: time.Now().Unix(). In Bash: date +%s.' },
    { question: 'Can I convert a date like "2024-01-15" to a timestamp?', answer: 'Yes — switch to Date Input mode and type or paste any ISO date string, human-readable date, or datetime. The tool will convert it to a Unix timestamp automatically.' },
];

export default function TimestampClient() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<InputMode>('timestamp');
    const [result, setResult] = useState<ParsedTime | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentTs, setCurrentTs] = useState(nowTs());
    const inputRef = useRef<HTMLInputElement>(null);

    // Live clock
    useEffect(() => {
        const id = setInterval(() => setCurrentTs(nowTs()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const { result: r, error: e } = parseTimestamp(input);
        setResult(r); setError(e);
    }, [input]);

    const handleClear = useCallback(() => {
        setInput(''); setResult(null); setError(null);
        inputRef.current?.focus();
    }, []);

    const insertNow = useCallback(() => {
        setInput(String(nowTs()));
        setMode('timestamp');
    }, []);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.shiftKey && e.key === 'N') { e.preventDefault(); insertNow(); }
            if (e.key === 'Escape') handleClear();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [insertNow, handleClear]);

    const OutputRow = ({ label, value, id }: { label: string; value: string; id: string }) => (
        <div className="flex items-center justify-between gap-4 py-3 border-b border-white/6 last:border-0">
            <span className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">{label}</span>
            <span className="text-sm font-mono text-slate-200 flex-1 min-w-0 break-all">{value}</span>
            <CopyButton getValue={() => value} id={`copy-${id}`} />
        </div>
    );

    return (
        <div className="container-lg">
            <ToolHeader
                title="Unix Timestamp Converter"
                description="Convert Unix timestamps to human-readable dates and back. Shows UTC, local time, ISO 8601, relative time, and more."
            />

            {/* Live clock */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/3 border border-white/8 w-fit">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-xs text-slate-500">Current Unix timestamp:</span>
                <span className="text-sm font-mono text-emerald-400 font-semibold">{currentTs.toLocaleString()}</span>
                <button
                    onClick={insertNow}
                    className="text-xs text-slate-500 hover:text-indigo-400 transition-colors underline underline-offset-2"
                    id="btn-use-now"
                    aria-label="Use current timestamp as input"
                >
                    Use →
                </button>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-3 mb-6">
                {/* Input mode tabs */}
                <div className="flex items-center gap-1 p-1 bg-white/4 rounded-xl w-fit border border-white/8">
                    {([
                        { value: 'timestamp', label: 'Timestamp → Date' },
                        { value: 'date', label: 'Date → Timestamp' },
                    ] as { value: InputMode; label: string }[]).map((m) => (
                        <button
                            key={m.value}
                            onClick={() => setMode(m.value)}
                            aria-pressed={mode === m.value}
                            id={`ts-mode-${m.value}`}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${mode === m.value ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40' : 'text-slate-400 hover:text-white hover:bg-white/6'}`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <input
                            ref={inputRef}
                            id="ts-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'timestamp' ? 'e.g. 1712345678 or 1712345678000' : 'e.g. 2024-04-05 or April 5, 2024'}
                            aria-label={mode === 'timestamp' ? 'Unix timestamp input' : 'Date string input'}
                            className={`w-full bg-white/3 border rounded-xl text-slate-300 text-sm font-mono px-4 py-3 outline-none placeholder:text-slate-700 transition-colors ${error ? 'border-red-500/40' : 'border-white/10 focus:border-rose-500/40'}`}
                        />
                    </div>
                    <ClearButton onClear={handleClear} id="ts-btn-clear" />
                </div>

                {error && (
                    <p role="alert" className="text-xs text-red-400 flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>

            {/* Output panel */}
            {result && (
                <div className="rounded-xl border border-white/10 bg-white/2 overflow-hidden mb-6">
                    <div className="px-5 py-3 border-b border-white/8 bg-white/2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Conversion Results</span>
                    </div>
                    <div className="px-5">
                        <OutputRow label="Unix (seconds)" value={String(result.unix)} id="unix-s" />
                        <OutputRow label="Unix (ms)" value={String(result.ms)} id="unix-ms" />
                        <OutputRow label="ISO 8601" value={result.iso} id="iso" />
                        <OutputRow label="UTC" value={result.utc} id="utc" />
                        <OutputRow label="Local time" value={result.local} id="local" />
                        <OutputRow label="Day of week" value={result.dayOfWeek} id="dow" />
                        <OutputRow label="Relative" value={result.relative} id="relative" />
                    </div>
                </div>
            )}

            {!result && !error && (
                <div className="h-40 rounded-xl border border-white/8 bg-white/2 flex items-center justify-center text-slate-700 text-sm mb-6">
                    Enter a timestamp or date above to convert it
                </div>
            )}

            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />
            <div className="divider my-12" />

            <SubdomainCTA
                headline="Working with time-sensitive data in interviews?"
                description="InterviewGPT helps you ace system design questions around distributed timestamps, event ordering, and time-series data."
                ctaLabel="Try InterviewGPT"
                ctaHref="https://interviewgpt.deepchill.app"
                features={['System design prep', 'Distributed systems', 'Interview practice']}
            />

            <div className="divider my-12" />

            <SEOSection
                toolName="Unix Timestamp Converter"
                what="A Unix timestamp (also called Epoch time or POSIX time) is a number representing how many seconds have elapsed since January 1, 1970, 00:00:00 UTC. It is universally used in databases, APIs, log files, and programming languages as a compact, timezone-independent way to store dates and times."
                why="Deepchill's Timestamp Converter auto-detects whether you entered seconds or milliseconds, converts in both directions (timestamp ↔ date string), shows a live clock, and displays UTC, local, relative, and ISO 8601 formats simultaneously. It is faster and cleaner than Epoch Converter or similar tools."
                useCases={[
                    { title: 'Debugging log files', description: 'Convert Unix timestamps in logs to human-readable dates to understand when events occurred.' },
                    { title: 'Database time fields', description: 'Databases like PostgreSQL and MongoDB store times as timestamps — convert to verify correctness.' },
                    { title: 'API response inspection', description: 'REST and GraphQL APIs return timestamps in various formats — convert them to local time for context.' },
                    { title: 'Scheduling and expiry', description: 'Calculate when a JWT token expires, an API key is invalidated, or a scheduled job will run.' },
                ]}
                example={{
                    input: '1712345678',
                    output: 'UTC: Fri, 05 Apr 2024 19:34:38 GMT\nISO: 2024-04-05T19:34:38.000Z\nRelative: about 1 day ago',
                    label: 'Unix timestamp → multiple formats',
                }}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="Unix Timestamp Converter" pageUrl="https://deepchill.app/tools/timestamp" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="timestamp" />
        </div>
    );
}

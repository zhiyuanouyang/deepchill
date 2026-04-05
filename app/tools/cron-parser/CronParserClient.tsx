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

const STORAGE_KEY = 'dc_cron_input';

const PRESETS = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every day at midnight', value: '0 0 * * *' },
    { label: 'Every day at noon', value: '0 12 * * *' },
    { label: 'Every Monday at 9am', value: '0 9 * * 1' },
    { label: 'Every weekday at 8am', value: '0 8 * * 1-5' },
    { label: 'Every Sunday at midnight', value: '0 0 * * 0' },
    { label: 'First day of month', value: '0 0 1 * *' },
    { label: 'First of Jan & Jul', value: '0 0 1 1,7 *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
];

const FIELD_NAMES = ['Minute', 'Hour', 'Day', 'Month', 'Weekday'];
const FIELD_RANGES = ['0-59', '0-23', '1-31', '1-12', '0-6'];
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SHORTCUTS = [
    { keys: ['Esc'], description: 'Clear' },
];

const FAQS = [
    {
        question: 'What is a cron expression?',
        answer: 'A cron expression is a string of 5 fields (minute, hour, day of month, month, day of week) that defines a scheduled task\'s recurrence. For example, "0 9 * * 1-5" means "9:00 AM every weekday".',
    },
    {
        question: 'What do * and */ mean in cron?',
        answer: '"*" means "every valid value". "*/n" means "every n units" — for example "*/15" in the minute field means every 15 minutes.',
    },
    {
        question: 'Can I use commas and hyphens?',
        answer: 'Yes. Commas separate a list of values (e.g. "1,3,5"). Hyphens define a range (e.g. "1-5"). You can combine them: "1-5,10" means 1,2,3,4,5,10.',
    },
    {
        question: 'What is the difference between 5-field and 6-field (Quartz) cron?',
        answer: 'Standard cron has 5 fields: minute, hour, day, month, weekday. Quartz cron adds a seconds field at the start, making 6 fields. This tool supports both.',
    },
    {
        question: 'Does this tool send my expression to a server?',
        answer: 'No. Everything is computed locally in your browser using JavaScript. Your cron expression is never sent to any server.',
    },
    {
        question: 'How do I share my cron expression?',
        answer: 'The URL automatically updates as you type. Just copy the address bar and share it — the recipient will see the same expression pre-loaded.',
    },
];

function explainField(value: string, fieldIdx: number): string {
    if (value === '*') return `every ${FIELD_NAMES[fieldIdx].toLowerCase()}`;
    if (value.startsWith('*/')) {
        const n = value.slice(2);
        return `every ${n} ${FIELD_NAMES[fieldIdx].toLowerCase()}${Number(n) !== 1 ? 's' : ''}`;
    }
    if (value.includes('-')) {
        const [a, b] = value.split('-');
        if (fieldIdx === 4) return `${WEEKDAY_NAMES[Number(a)]}–${WEEKDAY_NAMES[Number(b)]}`;
        if (fieldIdx === 3) return `${MONTH_NAMES[Number(a) - 1]}–${MONTH_NAMES[Number(b) - 1]}`;
        return `${a} through ${b}`;
    }
    if (value.includes(',')) {
        const parts = value.split(',');
        if (fieldIdx === 4) return parts.map((p) => WEEKDAY_NAMES[Number(p)]).join(', ');
        if (fieldIdx === 3) return parts.map((p) => MONTH_NAMES[Number(p) - 1]).join(', ');
        return parts.join(', ');
    }
    if (fieldIdx === 4) return WEEKDAY_NAMES[Number(value)] ?? value;
    if (fieldIdx === 3) return MONTH_NAMES[Number(value) - 1] ?? value;
    if (fieldIdx === 1) {
        const h = Number(value);
        const period = h < 12 ? 'AM' : 'PM';
        const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${display}:00 ${period}`;
    }
    return value;
}

function buildHumanReadable(fields: string[]): string {
    if (fields.length < 5) return 'Invalid expression';
    const [min, hour, day, month, weekday] = fields;

    const parts: string[] = [];

    // Time
    if (min === '*' && hour === '*') {
        parts.push('every minute');
    } else if (min.startsWith('*/') && hour === '*') {
        parts.push(`every ${min.slice(2)} minutes`);
    } else if (hour !== '*' && min === '0') {
        parts.push(`at ${explainField(hour, 1)}`);
    } else if (hour !== '*') {
        parts.push(`at minute ${explainField(min, 0)} of ${explainField(hour, 1)}`);
    } else {
        parts.push(`at minute ${explainField(min, 0)}`);
    }

    // Day / weekday
    if (day !== '*' && weekday !== '*') {
        parts.push(`on day ${explainField(day, 2)} of the month or ${explainField(weekday, 4)}`);
    } else if (day !== '*') {
        parts.push(`on day ${explainField(day, 2)} of the month`);
    } else if (weekday !== '*') {
        parts.push(`on ${explainField(weekday, 4)}`);
    }

    // Month
    if (month !== '*') {
        parts.push(`in ${explainField(month, 3)}`);
    }

    return parts.join(', ');
}

function matchesField(value: string, n: number, max: number): boolean {
    if (value === '*') return true;
    if (value.startsWith('*/')) {
        const step = parseInt(value.slice(2));
        return !isNaN(step) && n % step === 0;
    }
    if (value.includes(',')) {
        return value.split(',').some((v) => matchesField(v.trim(), n, max));
    }
    if (value.includes('-') && !value.includes('/')) {
        const [a, b] = value.split('-').map(Number);
        return n >= a && n <= b;
    }
    if (value.includes('-') && value.includes('/')) {
        const [range, step] = value.split('/');
        const [a, b] = range.split('-').map(Number);
        const s = parseInt(step);
        return n >= a && n <= b && (n - a) % s === 0;
    }
    return parseInt(value) === n;
}

function getNextRuns(fields: string[], timezone: string, count = 5): Date[] {
    const results: Date[] = [];
    const now = new Date();
    let cursor = new Date(now);
    // Round up to next minute
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);

    const maxIterations = 60 * 24 * 366 * 5; // max ~5 years
    let iterations = 0;

    const [minF, hourF, dayF, monthF, weekdayF] = fields;

    while (results.length < count && iterations < maxIterations) {
        iterations++;
        // Use Intl to get date parts in the target timezone
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: false,
            weekday: 'narrow',
        }).formatToParts(cursor);
        const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? '0');
        const month = get('month');
        const day = get('day');
        const hour = get('hour') % 24;
        const minute = get('minute');
        // weekday: narrow gives Sun=0? We need a numeric approach
        const wd = cursor.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short' });
        const wdIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);

        if (
            matchesField(monthF, month, 12) &&
            matchesField(dayF, day, 31) &&
            (weekdayF === '*' || matchesField(weekdayF, wdIdx, 6)) &&
            matchesField(hourF, hour, 23) &&
            matchesField(minF, minute, 59)
        ) {
            results.push(new Date(cursor));
            cursor = new Date(cursor);
            cursor.setMinutes(cursor.getMinutes() + 1);
        } else {
            cursor.setMinutes(cursor.getMinutes() + 1);
        }
    }
    return results;
}

function validateExpression(expr: string): { fields: string[]; error: string | null } {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
        return { fields: [], error: `Expected 5 fields, got ${parts.length}. Example: "0 9 * * 1-5"` };
    }
    // Use last 5 fields (handle Quartz 6-field by ignoring seconds)
    const fields = parts.length === 6 ? parts.slice(1) : parts;
    return { fields, error: null };
}

export default function CronParserClient() {
    const [expr, setExpr] = useState('0 9 * * 1-5');
    const [timezone, setTimezone] = useState('UTC');
    const [error, setError] = useState<string | null>(null);
    const [nextRuns, setNextRuns] = useState<Date[]>([]);
    const [humanReadable, setHumanReadable] = useState('');
    const [fields, setFields] = useState<string[]>([]);
    const [timezones, setTimezones] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Build timezone list once
    useEffect(() => {
        try {
            const tzList = (Intl as any).supportedValuesOf('timeZone') as string[];
            setTimezones(tzList);
        } catch {
            setTimezones(['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']);
        }
        // Auto-detect local timezone
        const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (local) setTimezone(local);
    }, []);

    // Load from URL / localStorage
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlExpr = params.get('e');
        if (urlExpr) {
            try { setExpr(decodeURIComponent(urlExpr)); } catch { /* noop */ }
        } else {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setExpr(saved);
        }
        inputRef.current?.focus();
    }, []);

    // Process with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const { fields: f, error: e } = validateExpression(expr);
            setError(e);
            setFields(f);
            if (!e && f.length === 5) {
                setHumanReadable(buildHumanReadable(f));
                try {
                    setNextRuns(getNextRuns(f, timezone));
                } catch {
                    setNextRuns([]);
                }
            } else {
                setHumanReadable('');
                setNextRuns([]);
            }
            if (expr) localStorage.setItem(STORAGE_KEY, expr);
            else localStorage.removeItem(STORAGE_KEY);
            try {
                const url = new URL(window.location.href);
                if (expr) url.searchParams.set('e', encodeURIComponent(expr));
                else url.searchParams.delete('e');
                window.history.replaceState(null, '', url.toString());
            } catch { /* noop */ }
        }, 80);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [expr, timezone]);

    const handleClear = useCallback(() => {
        setExpr('');
        setError(null);
        setNextRuns([]);
        setHumanReadable('');
        setFields([]);
        localStorage.removeItem(STORAGE_KEY);
        inputRef.current?.focus();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClear();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleClear]);

    const formatRunTime = (d: Date) =>
        new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(d);

    const isValid = !error && fields.length === 5;

    return (
        <div className="container-lg">
            <ToolHeader
                title="Cron Expression Parser"
                description="Paste any cron expression to instantly decode it into plain English and see the next scheduled run times."
            />

            {/* Main Input */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cron Expression</span>
                    <div className="flex items-center gap-2">
                        <select
                            value={PRESETS.find((p) => p.value === expr)?.label ?? ''}
                            onChange={(e) => {
                                const preset = PRESETS.find((p) => p.label === e.target.value);
                                if (preset) setExpr(preset.value);
                            }}
                            className="text-xs bg-white/5 text-slate-400 border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/50 hover:bg-white/8 transition-all cursor-pointer"
                            id="preset-select"
                            aria-label="Select a preset cron expression"
                        >
                            <option value="">Presets…</option>
                            {PRESETS.map((p) => (
                                <option key={p.value} value={p.label}>{p.label}</option>
                            ))}
                        </select>
                        <ClearButton onClear={handleClear} id="btn-clear" />
                    </div>
                </div>

                <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${error ? 'border-red-500/40 bg-red-500/3' : isValid ? 'border-emerald-500/30 bg-white/3' : 'border-white/10 bg-white/3'} focus-within:border-indigo-500/40`}>
                    <span className="text-slate-600 font-mono text-lg select-none">⏰</span>
                    <input
                        ref={inputRef}
                        id="cron-input"
                        type="text"
                        value={expr}
                        onChange={(e) => setExpr(e.target.value)}
                        placeholder="* * * * *"
                        spellCheck={false}
                        aria-label="Cron expression input"
                        className="flex-1 bg-transparent text-white font-mono text-lg outline-none placeholder:text-slate-700 tracking-widest"
                    />
                    {isValid && (
                        <span className="text-xs text-emerald-400 font-medium select-none">✓ Valid</span>
                    )}
                </div>

                {/* Field labels */}
                <div className="flex gap-2 mt-2 px-11">
                    {FIELD_NAMES.map((name, i) => (
                        <div key={name} className="flex-1 text-center">
                            <div className="text-[10px] text-slate-600 uppercase tracking-wider">{name}</div>
                            {fields[i] && (
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{fields[i]}</div>
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5 mt-2 px-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>

            {/* Human readable + Next runs */}
            {isValid && (
                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                    {/* Explanation panel */}
                    <div className="rounded-xl border border-white/10 bg-white/3 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Plain English</span>
                            <CopyButton getValue={() => humanReadable} label="Copy" id="btn-copy-human" />
                        </div>
                        <p className="text-white text-base font-medium leading-relaxed capitalize">{humanReadable}</p>
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {FIELD_NAMES.map((name, i) => (
                                <div key={name} className="text-center p-2.5 rounded-lg bg-white/4 border border-white/6">
                                    <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{name}</div>
                                    <div className="text-xs font-mono text-indigo-300 font-semibold">{fields[i] || '*'}</div>
                                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">{explainField(fields[i] || '*', i)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next runs panel */}
                    <div className="rounded-xl border border-white/10 bg-white/3 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Next 5 Run Times</span>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="text-xs bg-white/5 text-slate-400 border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-indigo-500/50 cursor-pointer max-w-[180px] truncate"
                                id="timezone-select"
                                aria-label="Select timezone"
                            >
                                {timezones.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                        {nextRuns.length > 0 ? (
                            <ol className="space-y-2.5">
                                {nextRuns.map((d, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-slate-600'}`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-slate-300 font-mono">{formatRunTime(d)}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="flex items-center justify-center h-24 text-slate-600 text-sm">
                                Could not compute next runs
                            </div>
                        )}
                        {nextRuns.length > 0 && (
                            <CopyButton
                                getValue={() => nextRuns.map((d, i) => `${i + 1}. ${formatRunTime(d)}`).join('\n')}
                                label="Copy schedule"
                                id="btn-copy-schedule"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Keyboard hints */}
            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />

            <div className="divider my-12" />

            <SubdomainCTA
                headline="Need production cron monitoring?"
                description="Track scheduled job execution, receive failure alerts, and view run history with our advanced cron monitoring service."
                ctaLabel="Explore Cron Monitor"
                ctaHref="https://cron.deepchill.app"
                features={['Execution alerts', 'Run history', 'Slack & email notifications', 'Multi-region']}
            />

            <div className="divider my-12" />

            <SEOSection
                toolName="Cron Parser"
                what="A cron parser decodes a cron expression — a compact schedule notation used by Unix cron, CI/CD systems, and cloud schedulers — into human-readable English. For example '0 9 * * 1-5' becomes 'At 9:00 AM, Monday through Friday'. It also computes upcoming execution times so you can verify a schedule is correct before deploying."
                why="Deepchill's Cron Parser runs entirely in your browser with zero dependencies. It supports both standard 5-field cron and 6-field Quartz cron, includes timezone-aware next-run calculation using the built-in Intl API, and updates the URL as you type so you can share expressions with teammates instantly."
                useCases={[
                    { title: 'Verifying CI/CD schedules', description: 'Paste your GitHub Actions or GitLab CI cron trigger and confirm it runs at the right time before pushing.' },
                    { title: 'Kubernetes CronJob debugging', description: 'Decode complex K8s cron schedules and see exactly when the next pods will spin up.' },
                    { title: 'Cloud scheduler validation', description: 'Check AWS EventBridge, GCP Cloud Scheduler, or Azure Logic App cron expressions before saving.' },
                    { title: 'Teaching cron syntax', description: 'Use the field-by-field breakdown and plain-English output to help teammates understand cron notation.' },
                ]}
                example={{
                    input: '0 9 * * 1-5',
                    output: 'At 9:00 AM, Monday through Friday',
                    label: 'Expression → Plain English',
                }}
            />

            <div className="divider my-12" />

            <FAQSection
                faqs={FAQS}
                toolName="Cron Parser"
                pageUrl="https://deepchill.app/tools/cron-parser"
            />

            <div className="divider my-12" />

            <RelatedTools currentSlug="cron-parser" />
        </div>
    );
}

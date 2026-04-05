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

const STORAGE_LEFT = 'dc_diff_left';
const STORAGE_RIGHT = 'dc_diff_right';

interface DiffLine {
    type: 'added' | 'removed' | 'unchanged';
    content: string;
    lineLeft: number | null;
    lineRight: number | null;
}

function computeDiff(a: string, b: string): DiffLine[] {
    const linesA = a.split('\n');
    const linesB = b.split('\n');
    const result: DiffLine[] = [];
    // Simple LCS-based diff
    const m = linesA.length, n = linesB.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--)
        for (let j = n - 1; j >= 0; j--)
            dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

    let i = 0, j = 0, leftLine = 1, rightLine = 1;
    while (i < m || j < n) {
        if (i < m && j < n && linesA[i] === linesB[j]) {
            result.push({ type: 'unchanged', content: linesA[i], lineLeft: leftLine++, lineRight: rightLine++ });
            i++; j++;
        } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
            result.push({ type: 'added', content: linesB[j], lineLeft: null, lineRight: rightLine++ });
            j++;
        } else {
            result.push({ type: 'removed', content: linesA[i], lineLeft: leftLine++, lineRight: null });
            i++;
        }
    }
    return result;
}

const SHORTCUTS = [
    { keys: ['⌘', 'Shift', 'C'], description: 'Copy diff' },
    { keys: ['Esc'], description: 'Clear both' },
];

const FAQS = [
    { question: 'What is a text diff tool?', answer: 'A text diff compares two versions of text and highlights which lines were added, removed, or unchanged. It is commonly used to review code changes, document edits, and log comparisons.' },
    { question: 'Is this the same as git diff?', answer: 'This tool uses a line-level diff algorithm similar to the classic Unix diff utility that powers git. It shows the same logical changes though without git metadata like commit information.' },
    { question: 'Can I compare code files?', answer: 'Yes — paste any code, prose, CSV, or other text. The tool works with any UTF-8 text. For binary files or images, use a dedicated binary diff tool.' },
    { question: 'Does my text get sent anywhere?', answer: 'No. The diff runs entirely in your browser using JavaScript. Your text is never transmitted to any server.' },
    { question: 'Can I share the diff with someone?', answer: 'The URL encodes both inputs so you can copy and share the link. The recipient will see exactly the same diff.' },
];

export default function TextDiffClient() {
    const [left, setLeft] = useState('');
    const [right, setRight] = useState('');
    const [diff, setDiff] = useState<DiffLine[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const l = params.get('left'), r = params.get('right');
        if (l) { try { setLeft(decodeURIComponent(l)); } catch { /**/ } }
        else { const s = localStorage.getItem(STORAGE_LEFT); if (s) setLeft(s); }
        if (r) { try { setRight(decodeURIComponent(r)); } catch { /**/ } }
        else { const s = localStorage.getItem(STORAGE_RIGHT); if (s) setRight(s); }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const d = (left || right) ? computeDiff(left, right) : [];
            setDiff(d);
            if (left) localStorage.setItem(STORAGE_LEFT, left); else localStorage.removeItem(STORAGE_LEFT);
            if (right) localStorage.setItem(STORAGE_RIGHT, right); else localStorage.removeItem(STORAGE_RIGHT);
            try {
                const url = new URL(window.location.href);
                if (left) url.searchParams.set('left', encodeURIComponent(left)); else url.searchParams.delete('left');
                if (right) url.searchParams.set('right', encodeURIComponent(right)); else url.searchParams.delete('right');
                window.history.replaceState(null, '', url.toString());
            } catch { /**/ }
        }, 80);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [left, right]);

    const handleClear = useCallback(() => {
        setLeft(''); setRight(''); setDiff([]);
        localStorage.removeItem(STORAGE_LEFT); localStorage.removeItem(STORAGE_RIGHT);
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClear();
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                const text = diff.map(d => `${d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' '} ${d.content}`).join('\n');
                navigator.clipboard.writeText(text);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [diff, handleClear]);

    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;

    const getDiffText = () => diff.map(d => `${d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' '} ${d.content}`).join('\n');

    return (
        <div className="container-xl">
            <ToolHeader
                title="Text Diff Checker"
                description="Paste two versions of text to instantly see what changed. Line-by-line diff with additions in green, removals in red."
            />

            {/* Stats bar */}
            {(added > 0 || removed > 0) && (
                <div className="flex items-center gap-4 mb-4 text-xs font-medium">
                    {added > 0 && <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />+{added} added</span>}
                    {removed > 0 && <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />-{removed} removed</span>}
                    <div className="ml-auto flex gap-2">
                        <CopyButton getValue={getDiffText} label="Copy diff" id="btn-copy-diff" />
                        <ClearButton onClear={handleClear} label="Clear all" id="btn-clear-diff" />
                    </div>
                </div>
            )}

            {/* Inputs */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                {[
                    { label: 'Original (A)', value: left, onChange: setLeft, placeholder: 'Paste original text here...', id: 'diff-left' },
                    { label: 'Modified (B)', value: right, onChange: setRight, placeholder: 'Paste modified text here...', id: 'diff-right' },
                ].map((panel) => (
                    <div key={panel.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{panel.label}</span>
                        </div>
                        <textarea
                            id={panel.id}
                            value={panel.value}
                            onChange={(e) => panel.onChange(e.target.value)}
                            placeholder={panel.placeholder}
                            spellCheck={false}
                            aria-label={panel.label}
                            className="h-52 w-full bg-white/3 border border-white/10 focus:border-indigo-500/40 rounded-xl text-slate-300 text-sm font-mono resize-none p-4 outline-none placeholder:text-slate-700 leading-relaxed transition-colors"
                        />
                    </div>
                ))}
            </div>

            {/* Diff output */}
            {diff.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/2 overflow-hidden mb-4">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Diff Output</span>
                        <CopyButton getValue={getDiffText} label="Copy" id="btn-copy-diff-2" />
                    </div>
                    <div className="overflow-auto max-h-96">
                        {diff.map((line, i) => (
                            <div
                                key={i}
                                className={`flex text-xs font-mono leading-relaxed ${line.type === 'added'
                                    ? 'bg-emerald-500/8 text-emerald-300 border-l-2 border-emerald-500'
                                    : line.type === 'removed'
                                        ? 'bg-red-500/8 text-red-300 border-l-2 border-red-500'
                                        : 'text-slate-500 border-l-2 border-transparent'
                                    }`}
                            >
                                <div className="w-8 flex-shrink-0 text-right pr-2 py-1 text-[10px] text-slate-700 select-none border-r border-white/6">
                                    {line.lineLeft ?? ''}
                                </div>
                                <div className="w-8 flex-shrink-0 text-right pr-2 py-1 text-[10px] text-slate-700 select-none border-r border-white/6">
                                    {line.lineRight ?? ''}
                                </div>
                                <span className="w-5 flex-shrink-0 text-center py-1 select-none">
                                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                                </span>
                                <pre className="flex-1 py-1 pr-4 whitespace-pre-wrap break-all">{line.content || ' '}</pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />
            <div className="divider my-12" />

            <SubdomainCTA
                headline="Need AI-powered code review?"
                description="InterviewGPT can analyze code diffs, explain what changed, and suggest improvements using AI."
                ctaLabel="Try InterviewGPT"
                ctaHref="https://interviewgpt.deepchill.app"
                features={['AI diff explanation', 'Code quality feedback', 'Suggest improvements']}
            />

            <div className="divider my-12" />

            <SEOSection
                toolName="Text Diff Checker"
                what="A text diff tool compares two strings of text and identifies what was added, removed, or unchanged. It performs a line-by-line comparison using the LCS (Longest Common Subsequence) algorithm — the same algorithm that powers git diff and Unix diff."
                why="Deepchill's Text Diff runs entirely in your browser, preserving your privacy. It offers a clean, colorized line-level view with addition/removal counts, shareable URLs, and keyboard shortcuts. It is faster and less cluttered than diffchecker.com or text-compare.com."
                useCases={[
                    { title: 'Code review', description: 'Compare two versions of a file to see what changed before a pull request.' },
                    { title: 'Document editing', description: 'Track changes between draft versions of essays, reports, or emails.' },
                    { title: 'Configuration comparison', description: 'Spot differences between environment config files or YAML/JSON settings.' },
                    { title: 'Log analysis', description: 'Compare application logs from two time periods to find what changed.' },
                ]}
                example={{
                    input: 'Hello World\nThis is line two\nGoodbye',
                    output: 'Hello World\n+ This is line two — MODIFIED\n- This is line two\nGoodbye',
                    label: 'Line-level diff visualization',
                }}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="Text Diff Checker" pageUrl="https://deepchill.app/tools/text-diff" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="text-diff" />
        </div>
    );
}

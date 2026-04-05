'use client';

import { useState } from 'react';

interface Shortcut {
    keys: string[];
    description: string;
}

interface KeyboardShortcutsHintProps {
    shortcuts: Shortcut[];
}

export default function KeyboardShortcutsHint({ shortcuts }: KeyboardShortcutsHintProps) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 px-3 rounded-xl bg-white/3 border border-white/8 text-xs text-slate-500">
            <span className="text-slate-600 font-medium">Shortcuts:</span>
            {shortcuts.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    {s.keys.map((k, j) => (
                        <kbd
                            key={j}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/8 border border-white/12 text-slate-400 font-mono text-[11px] leading-none"
                        >
                            {k}
                        </kbd>
                    ))}
                    <span className="text-slate-600">{s.description}</span>
                </span>
            ))}
            <button
                onClick={() => setVisible(false)}
                aria-label="Dismiss keyboard shortcuts"
                className="ml-auto text-slate-700 hover:text-slate-500 transition-colors"
            >
                ✕
            </button>
        </div>
    );
}

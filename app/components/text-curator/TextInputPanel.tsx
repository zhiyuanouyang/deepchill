import React from 'react';
import ClearButton from '@/app/components/tools/ClearButton';
import { TextStats } from '../../hooks/useTextCurator';

type Props = {
    value: string;
    onChange: (val: string) => void;
    onClear: () => void;
    stats: TextStats;
};

export default function TextInputPanel({ value, onChange, onClear, stats }: Props) {
    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Input Text
                </span>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-mono">
                        {stats.chars} chars • {stats.words} words • {stats.lines} lines
                    </span>
                    <ClearButton onClear={onClear} id="tc-btn-clear" />
                </div>
            </div>
            
            <textarea
                className="flex-1 bg-white/3 border border-white/10 focus:border-purple-500/40 rounded-xl text-slate-300 text-sm font-mono resize-none p-4 outline-none placeholder:text-slate-700 leading-relaxed transition-colors"
                placeholder="Type or paste text here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                aria-label="Text Curator Input"
            />
        </div>
    );
}

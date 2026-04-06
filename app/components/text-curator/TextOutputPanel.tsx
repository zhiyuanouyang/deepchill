import React from 'react';
import CopyButton from '@/app/components/tools/CopyButton';
import { TextStats } from '../../hooks/useTextCurator';

type Props = {
    value: string;
    stats: TextStats;
    onSwap: () => void;
};

export default function TextOutputPanel({ value, stats, onSwap }: Props) {
    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Output Text
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono hidden sm:inline-block mr-2">
                        {stats.chars} chars • {stats.words} words • {stats.lines} lines
                    </span>
                    <button 
                        onClick={onSwap} 
                        disabled={!value}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Use output as input" 
                        id="tc-btn-swap"
                    >
                        ⇄ Swap
                    </button>
                    <CopyButton getValue={() => value} label="Copy" id="tc-btn-copy" />
                </div>
            </div>
            
            <textarea
                className="flex-1 bg-white/3 border border-white/10 focus:border-purple-500/40 rounded-xl text-slate-300 text-sm font-mono resize-none p-4 outline-none placeholder:text-slate-700 leading-relaxed transition-colors"
                readOnly
                value={value}
                spellCheck={false}
                placeholder="Curated output text..."
                aria-label="Text Curator Output"
            />
        </div>
    );
}

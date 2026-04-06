import React, { useState } from 'react';
import { CORE_FUNCTIONS } from '../../lib/text-processing/core';
import { TextFunction } from '../../lib/text-processing/types';
import { Search, Undo2, Redo2 } from 'lucide-react';

type Props = {
    onApply: (functionId: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
};

export default function FunctionToolbar({
    onApply,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}: Props) {
    const categories = ['Case', 'Whitespace', 'Lines', 'Cleanup', 'Formatting', 'Advanced'];
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const allFunctions = Object.values(CORE_FUNCTIONS);

    const filteredFunctions = searchQuery 
        ? allFunctions.filter(f => f.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : allFunctions.filter(f => f.category === activeCategory);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-1 p-1 bg-white/4 rounded-xl border border-white/8 overflow-x-auto hide-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                                !searchQuery && activeCategory === cat 
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/6'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tools... (Cmd+K)"
                            className="bg-white/3 border border-white/10 text-sm rounded-xl pl-9 pr-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 w-full md:w-56 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[44px]">
                {filteredFunctions.map((func) => (
                    <button
                        key={func.id}
                        onClick={() => onApply(func.id)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 rounded-lg flex items-center text-sm font-medium text-slate-300 hover:text-purple-300 transition-all active:scale-95 shadow-sm"
                    >
                        {func.label}
                    </button>
                ))}
                {filteredFunctions.length === 0 && (
                    <div className="text-sm text-slate-500 py-1.5 flex items-center">
                        No function found matching "{searchQuery}"
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center sm:hidden pt-2 border-t border-white/10">
                <div className="flex gap-2">
                    <button onClick={onUndo} disabled={!canUndo} className="p-1.5 text-slate-400 disabled:opacity-50 hover:text-white rounded-lg hover:bg-white/10"><Undo2 className="w-4 h-4" /></button>
                    <button onClick={onRedo} disabled={!canRedo} className="p-1.5 text-slate-400 disabled:opacity-50 hover:text-white rounded-lg hover:bg-white/10"><Redo2 className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
}

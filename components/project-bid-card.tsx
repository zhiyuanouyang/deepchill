'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface ProjectBidCardProps {
  amount: number;
  onChangeAmount: (newAmount: number) => void;
  className?: string;
}

const PRESET_AMOUNTS = [0, 25, 50, 100];

export const ProjectBidCard: React.FC<ProjectBidCardProps> = ({
  amount,
  onChangeAmount,
  className = '',
}) => {
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
    onChangeAmount(isNaN(val) ? 0 : Math.max(0, val));
  };

  return (
    <div
      className={`rounded-2xl p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Trending Boost Bid</span>
          <span className="text-[10px] text-slate-400 font-normal">(optional)</span>
        </label>
        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
          {amount > 0 ? `$${amount}` : 'Free ($0)'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {PRESET_AMOUNTS.map((val) => {
          const isSelected = amount === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChangeAmount(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300'
              }`}
            >
              {val === 0 ? 'Free ($0)' : `$${val}`}
            </button>
          );
        })}

        <div className="relative w-24 sm:w-28 ml-auto">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Custom"
            value={PRESET_AMOUNTS.includes(amount) ? '' : (amount === 0 ? '' : amount)}
            onChange={handleCustomChange}
            className="w-full liquid-glass-input rounded-xl pl-6 pr-2 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
        Projects rank by total bids in the Trending list. Higher bids get top placement.
      </p>
    </div>
  );
};

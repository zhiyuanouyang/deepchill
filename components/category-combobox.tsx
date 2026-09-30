'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Check,
  Search,
  X,
  Terminal,
  Server,
  Bot,
  Zap,
  Palette,
  BarChart3,
  ShieldCheck,
  Wrench,
  Cpu,
  ShoppingBag,
  GraduationCap,
  Tv,
  DollarSign,
  Utensils,
  Gamepad2,
  Landmark,
  HeartPulse,
  Briefcase,
  Scale,
  Smile,
  Megaphone,
  Newspaper,
  Headphones,
  Heart,
  Home,
  Microscope,
  Users,
  Trophy,
  Plane,
  Car,
  Video,
  Tag,
} from 'lucide-react';

export function getCategoryIcon(name: string): React.ElementType {
  const lower = (name || '').toLowerCase();
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('gpt')) return Bot;
  if (lower.includes('infra') || lower.includes('cloud') || lower.includes('database') || lower.includes('open source')) return Server;
  if (lower.includes('devtools') || lower.includes('developer tools')) return Terminal;
  if (lower.includes('utility') || lower.includes('utilities')) return Wrench;
  if (lower.includes('productivity') || lower.includes('task') || lower.includes('calendar')) return Zap;
  if (lower.includes('design') || lower.includes('creative') || lower.includes('ui')) return Palette;
  if (lower.includes('analytics') || lower.includes('saas') || lower.includes('metrics')) return BarChart3;
  if (lower.includes('security') || lower.includes('privacy') || lower.includes('auth')) return ShieldCheck;
  if (lower.includes('finance') || lower.includes('crypto')) return DollarSign;
  if (lower.includes('health') || lower.includes('fitness')) return HeartPulse;
  if (lower.includes('career') || lower.includes('job') || lower.includes('business')) return Briefcase;
  if (lower.includes('commerce') || lower.includes('shopping')) return ShoppingBag;
  if (lower.includes('marketing') || lower.includes('sales')) return Megaphone;
  if (lower.includes('media') || lower.includes('publishing') || lower.includes('news')) return Newspaper;
  if (lower.includes('music') || lower.includes('audio')) return Headphones;
  if (lower.includes('education') || lower.includes('learning')) return GraduationCap;
  if (lower.includes('game')) return Gamepad2;
  if (lower.includes('video') || lower.includes('entertainment')) return Tv;
  if (lower.includes('social') || lower.includes('community')) return Users;
  if (lower.includes('legal') || lower.includes('compliance')) return Scale;
  if (lower.includes('real estate') || lower.includes('property')) return Home;
  if (lower.includes('science') || lower.includes('research')) return Microscope;
  if (lower.includes('sport')) return Trophy;
  if (lower.includes('travel')) return Plane;
  if (lower.includes('hardware') || lower.includes('iot')) return Cpu;
  if (lower.includes('food') || lower.includes('drink')) return Utensils;
  if (lower.includes('social impact') || lower.includes('nonprofit')) return Heart;
  if (lower.includes('gov') || lower.includes('civic')) return Landmark;
  if (lower.includes('auto') || lower.includes('car')) return Car;
  if (lower.includes('lifestyle')) return Smile;
  if (lower.includes('content')) return Video;
  return Tag;
}

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select or type category...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal text when external value changes
  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If user typed something that matches nothing, revert to current value
        if (value && searchQuery !== value) {
          setSearchQuery(value);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, searchQuery]);

  // Filtered options based on partial type-in text
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setSearchQuery(categoryName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } else if (searchQuery.trim()) {
        handleSelect(searchQuery.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  const CurrentIcon = getCategoryIcon(value || searchQuery);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field with Icon */}
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
          <CurrentIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full liquid-glass-input rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm outline-none font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all cursor-text"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
                setIsOpen(true);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scrollable Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-md p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const Icon = getCategoryIcon(opt);
              const isSelected = opt.toLowerCase() === value.toLowerCase();

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-2.5 transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}
                    />
                    <span className="truncate">{opt}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No matching category for &quot;{searchQuery}&quot;
              </p>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => handleSelect(searchQuery.trim())}
                  className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Use &quot;{searchQuery.trim()}&quot; as category
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

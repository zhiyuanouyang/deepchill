'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  compact?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  compact = false,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200/60 text-xs">
        <span className="text-slate-500 font-medium">
          Page <strong className="text-slate-800">{currentPage}</strong> of{' '}
          <strong className="text-slate-800">{totalPages}</strong>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous Page"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const startItem = totalItems !== undefined && pageSize !== undefined ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems !== undefined && pageSize !== undefined
      ? Math.min(currentPage * pageSize, totalItems)
      : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/60 mt-4">
      {startItem && endItem && totalItems ? (
        <span className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{startItem}</strong> -{' '}
          <strong className="text-slate-800">{endItem}</strong> of{' '}
          <strong className="text-slate-800">{totalItems}</strong> results
        </span>
      ) : (
        <span className="text-xs text-slate-500 font-medium">
          Page {currentPage} of {totalPages}
        </span>
      )}

      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          title="First page"
          className="p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
          className="p-1.5 px-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400 font-bold select-none">
                  ...
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(Number(page))}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'liquid-btn-primary text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
          className="p-1.5 px-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          title="Last page"
          className="p-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

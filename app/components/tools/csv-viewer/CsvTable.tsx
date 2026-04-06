import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface CsvTableProps {
    data: any[];
    fields: string[];
}

export default function CsvTable({ data, fields }: CsvTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 10,
    });

    if (data.length === 0 || fields.length === 0) {
        return <div className="p-8 text-center text-base-content/50">No data available to display.</div>;
    }

    return (
        <div 
            ref={parentRef} 
            className="w-full h-[600px] overflow-auto bg-base-100 rounded-lg border border-base-content/10 shadow-sm relative no-scrollbar"
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-base-200 border-b border-base-content/10 flex shadow-sm w-max min-w-full">
                    <div className="w-16 flex-shrink-0 px-4 py-2 border-r border-base-content/10 text-xs font-medium text-base-content/70 flex items-center">#</div>
                    {fields.map((field) => (
                        <div key={field} className="w-48 flex-shrink-0 px-4 py-2 border-r border-base-content/10 text-xs font-semibold text-base-content truncate" title={field}>
                            {field}
                        </div>
                    ))}
                </div>

                {/* Virtualized Rows */}
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const rowData = data[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.index}
                            className="absolute top-0 left-0 hover:bg-base-200/50 flex border-b border-base-content/5 w-max min-w-full transition-colors"
                            style={{
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <div className="w-16 flex-shrink-0 px-4 py-2 border-r border-base-content/5 text-xs text-base-content/50 bg-base-100 flex items-center">
                                {virtualRow.index + 1}
                            </div>
                            {fields.map((field) => (
                                <div key={field} className="w-48 flex-shrink-0 px-4 py-2 border-r border-base-content/5 text-sm text-base-content truncate overflow-hidden flex items-center" title={rowData?.[field] || ''}>
                                    {rowData?.[field] || ''}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

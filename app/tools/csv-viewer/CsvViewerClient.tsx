'use client';

import React, { useMemo } from 'react';
import { useCsvParser } from '../../hooks/useCsvParser';
import ToolHeader from '@/app/components/tools/ToolHeader';
import CopyButton from '@/app/components/tools/CopyButton';
import ClearButton from '@/app/components/tools/ClearButton';
import DragDropZone from '../../components/tools/csv-viewer/DragDropZone';
import CsvTable from '../../components/tools/csv-viewer/CsvTable';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';

const FAQS = [
    {
        question: 'What is the maximum file size I can upload?',
        answer: 'You can upload CSV files up to 50MB. Because we process the file entirely in your browser using local resources, larger files might slow down your browser context depending on available RAM.',
    },
    {
        question: 'Is my data secure?',
        answer: '100% secure. Everything happens client-side in your own browser using our optimized parsing engine. No data is ever sent to our servers.',
    },
    {
        question: 'Does it support comma, tab, or pipe delimiters?',
        answer: 'Yes! The reader automatically detects your delimiter, whether it is a comma, tab, or pipe.',
    }
];

export default function CsvViewerClient() {
    const { parseFile, parseText, clearResult, result, isLoading, error } = useCsvParser();

    const renderContent = () => {
        if (result && result.data && result.meta?.fields) {
            return (
                <div className="flex flex-col gap-4 fade-in">
                    <div className="flex justify-between items-center bg-white/4 p-4 rounded-xl border border-white/8">
                        <div className="flex gap-4 text-sm font-medium text-slate-400">
                            <span>Rows: <strong className="text-white">{result.meta.rowCount}</strong></span>
                            <span>Columns: <strong className="text-white">{result.meta.fields.length}</strong></span>
                            <span>Delimiter: <strong className="text-white bg-white/10 px-2 py-0.5 rounded text-xs">{result.meta.delimiter === '\t' ? 'TAB' : result.meta.delimiter}</strong></span>
                            {result.meta.truncated && <span className="text-amber-400">Data truncated</span>}
                        </div>
                        <div className="flex gap-2">
                            <CopyButton
                                getValue={() => Papa.unparse(result.data)}
                                label="Copy All (CSV)"
                                id="csv-btn-copy"
                            />
                            <ClearButton
                                onClear={clearResult}
                                id="csv-btn-clear"
                                label="Clear Data"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="text-xs text-red-400 flex items-start gap-1.5 px-1 py-2">
                            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                            </svg>
                            {error}
                        </div>
                    )}
                    <CsvTable data={result.data} fields={result.meta.fields} />
                </div>
            );
        }

        return (
            <div className="fade-in">
                {error && (
                    <div className="text-xs text-red-400 flex items-start gap-1.5 px-1 mb-4 shadow-sm py-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                        </svg>
                        {error}
                    </div>
                )}
                <DragDropZone onFileDrop={parseFile} onTextPaste={parseText} isLoading={isLoading} />
            </div>
        );
    };

    return (
        <div className="container-lg">
            <ToolHeader
                title="CSV Viewer"
                description="Instantly open, view, and analyze large CSV files natively within your browser without sharing any data externally."
            />

            <div className="mb-12">
                {renderContent()}
            </div>

            <div className="divider my-12" />

            <SEOSection
                toolName="CSV Viewer Desktop Alternative"
                what="Our online CSV reader allows developers, marketers, and data engineers to instantly preview comma-separated or tab-separated string tables without downloading heavyweight desktop software like Excel or Numbers. Since we use virtualization, you can smoothly navigate millions of points of data directly in Chrome, Firefox, or Safari."
                why="Because your privacy matters and speed is crucial. We bypass server round-trips by parsing your files directly in your Local Machine memory using powerful web workers. This ensures that large files open effortlessly, and sensitive company data never leaks onto external networks."
                useCases={[
                    { title: 'Log Inspection', description: 'Quickly open trailing error logs or user session exports by dragging the file directly into the drop zone.' },
                    { title: 'Data Cleaning', description: 'Verify raw outputs of large datasets and SQL dumps in spreadsheet format before importing them into heavy CRM platforms.' }
                ]}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="CSV Viewer" pageUrl="https://deepchill.app/tools/csv-viewer" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="csv-viewer" />
        </div>
    );
}

// We need to import Papa so the copy button works
import Papa from 'papaparse';

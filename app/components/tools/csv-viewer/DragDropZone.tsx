import React, { useCallback, useState } from 'react';

interface DragDropZoneProps {
    onFileDrop: (file: File) => void;
    onTextPaste: (text: string) => void;
    isLoading?: boolean;
}

export default function DragDropZone({ onFileDrop, onTextPaste, isLoading }: DragDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileDrop(e.dataTransfer.files[0]);
        }
    }, [onFileDrop]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileDrop(e.target.files[0]);
        }
    }, [onFileDrop]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text/plain');
        if (text) {
            onTextPaste(text);
        }
    }, [onTextPaste]);

    return (
        <div
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-base-content/20 bg-base-100 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
        >
            {isLoading ? (
                <div className="flex flex-col items-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                    <p className="text-base-content font-medium">Processing your data...</p>
                </div>
            ) : (
                <>
                    <svg className="w-12 h-12 text-base-content/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="text-lg font-medium text-base-content mb-1">
                        Drag and drop your CSV file here
                    </p>
                    <p className="text-sm text-base-content/60 mb-6">
                        or click to browse, or just press Cmd+V to paste CSV text
                    </p>
                    <label className="btn btn-primary px-8 cursor-pointer">
                        Browse File
                        <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFileInput} />
                    </label>
                </>
            )}
        </div>
    );
}

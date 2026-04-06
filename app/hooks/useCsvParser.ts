import { useState, useCallback } from 'react';
import Papa from 'papaparse';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface CsvParseResult {
    data: any[];
    meta: {
        fields?: string[];
        delimiter: string;
        truncated: boolean;
        rowCount: number;
    };
    errors: Papa.ParseError[];
}

export function useCsvParser() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CsvParseResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parseFile = useCallback((file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            setError(`File is too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            return;
        }

        setIsLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            // worker: true can sometimes throw in Next.js environment depending on config, but papaparse tries to handle it.
            // If the chunking is used, it handles large files better without memory crashes.
            complete: (results) => {
                setResult({
                    data: results.data,
                    meta: {
                        fields: results.meta.fields,
                        delimiter: results.meta.delimiter,
                        truncated: results.meta.aborted,
                        rowCount: results.data.length
                    },
                    errors: results.errors
                });
                setIsLoading(false);
            },
            error: (err: Error) => {
                setError(err.message);
                setIsLoading(false);
            }
        });
    }, []);

    const parseText = useCallback((text: string) => {
        setIsLoading(true);
        setError(null);

        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setResult({
                    data: results.data,
                    meta: {
                        fields: results.meta.fields,
                        delimiter: results.meta.delimiter,
                        truncated: results.meta.aborted,
                        rowCount: results.data.length
                    },
                    errors: results.errors
                });
                setIsLoading(false);
            },
            error: (err: Error) => {
                setError(err.message);
                setIsLoading(false);
            }
        });
    }, []);

    const clearResult = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return { parseFile, parseText, clearResult, result, isLoading, error };
}

export type TextFunction = {
    id: string;
    label: string;
    category: 'Case' | 'Whitespace' | 'Lines' | 'Cleanup' | 'Formatting' | 'Advanced';
    description?: string;
    execute: (input: string, options?: any) => string;
    requiresOptions?: boolean;
};

export type PipelineStep = {
    id: string;
    functionId: string;
    options?: any;
    enabled: boolean;
};

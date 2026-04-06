import { TextFunction } from './types';

export const CORE_FUNCTIONS: Record<string, TextFunction> = {
    // ==== CASE ====
    uppercase: {
        id: 'uppercase',
        label: 'UPPERCASE',
        category: 'Case',
        execute: (str) => str.toUpperCase(),
    },
    lowercase: {
        id: 'lowercase',
        label: 'lowercase',
        category: 'Case',
        execute: (str) => str.toLowerCase(),
    },
    titleCase: {
        id: 'titleCase',
        label: 'Title Case',
        category: 'Case',
        execute: (str) =>
            str.replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
            ),
    },
    sentenceCase: {
        id: 'sentenceCase',
        label: 'Sentence case',
        category: 'Case',
        execute: (str) => {
            return str.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
        },
    },
    camelCase: {
        id: 'camelCase',
        label: 'camelCase',
        category: 'Case',
        execute: (str) =>
            str
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                    index === 0 ? word.toLowerCase() : word.toUpperCase()
                )
                .replace(/\s+/g, ''),
    },
    pascalCase: {
        id: 'pascalCase',
        label: 'PascalCase',
        category: 'Case',
        execute: (str) =>
            str
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
                .replace(/\s+/g, ''),
    },
    snakeCase: {
        id: 'snakeCase',
        label: 'snake_case',
        category: 'Case',
        execute: (str) =>
            str
                .replace(/\W+/g, ' ')
                .split(/ |\B(?=[A-Z])/)
                .map((word) => word.toLowerCase())
                .join('_'),
    },
    kebabCase: {
        id: 'kebabCase',
        label: 'kebab-case',
        category: 'Case',
        execute: (str) =>
            str
                .replace(/\W+/g, ' ')
                .split(/ |\B(?=[A-Z])/)
                .map((word) => word.toLowerCase())
                .join('-'),
    },

    // ==== WHITESPACE ====
    trim: {
        id: 'trim',
        label: 'Trim',
        category: 'Whitespace',
        execute: (str) => str.trim(),
    },
    removeExtraSpaces: {
        id: 'removeExtraSpaces',
        label: 'Remove Extra Spaces',
        category: 'Whitespace',
        execute: (str) => str.replace(/[^\S\r\n]+/g, ' '),
    },
    removeEmptyLines: {
        id: 'removeEmptyLines',
        label: 'Remove Empty Lines',
        category: 'Whitespace',
        execute: (str) => str.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, ''),
    },
    normalizeWhitespace: {
        id: 'normalizeWhitespace',
        label: 'Normalize Whitespace',
        category: 'Whitespace',
        execute: (str) => str.replace(/\s+/g, ' ').trim(),
    },
    removeLeadingSpaces: {
        id: 'removeLeadingSpaces',
        label: 'Remove Leading Spaces',
        category: 'Whitespace',
        execute: (str) => str.replace(/^[^\S\r\n]+/gm, ''),
    },
    removeTrailingSpaces: {
        id: 'removeTrailingSpaces',
        label: 'Remove Trailing Spaces',
        category: 'Whitespace',
        execute: (str) => str.replace(/[^\S\r\n]+$/gm, ''),
    },

    // ==== LINES ====
    removeDuplicateLines: {
        id: 'removeDuplicateLines',
        label: 'Remove Duplicate Lines',
        category: 'Lines',
        execute: (str) => Array.from(new Set(str.split('\n'))).join('\n'),
    },
    sortLinesAsc: {
        id: 'sortLinesAsc',
        label: 'Sort Lines (A-Z)',
        category: 'Lines',
        execute: (str) => str.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'),
    },
    sortLinesDesc: {
        id: 'sortLinesDesc',
        label: 'Sort Lines (Z-A)',
        category: 'Lines',
        execute: (str) => str.split('\n').sort((a, b) => b.localeCompare(a)).join('\n'),
    },
    reverseLines: {
        id: 'reverseLines',
        label: 'Reverse Lines',
        category: 'Lines',
        execute: (str) => str.split('\n').reverse().join('\n'),
    },
    shuffleLines: {
        id: 'shuffleLines',
        label: 'Shuffle Lines',
        category: 'Lines',
        execute: (str) => {
            const arr = str.split('\n');
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr.join('\n');
        },
    },
    numberLines: {
        id: 'numberLines',
        label: 'Number Lines',
        category: 'Lines',
        execute: (str) => str.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'),
    },

    // ==== CLEANUP ====
    removePunctuation: {
        id: 'removePunctuation',
        label: 'Remove Punctuation',
        category: 'Cleanup',
        execute: (str) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''),
    },
    removeNumbers: {
        id: 'removeNumbers',
        label: 'Remove Numbers',
        category: 'Cleanup',
        execute: (str) => str.replace(/\d+/g, ''),
    },
    removeSpecialCharacters: {
        id: 'removeSpecialCharacters',
        label: 'Remove Special Characters',
        category: 'Cleanup',
        execute: (str) => str.replace(/[^a-zA-Z0-9\s]/g, ''),
    },
    removeHtmlTags: {
        id: 'removeHtmlTags',
        label: 'Remove HTML Tags',
        category: 'Cleanup',
        execute: (str) => str.replace(/<[^>]*>?/gm, ''),
    },
    removeEmojis: {
        id: 'removeEmojis',
        label: 'Remove Emojis',
        category: 'Cleanup',
        execute: (str) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''),
    },

    // ==== FORMATTING ====
    indentText: {
        id: 'indentText',
        label: 'Indent Text',
        category: 'Formatting',
        execute: (str) => str.split('\n').map(l => `    ${l}`).join('\n'),
    },
    unindentText: {
        id: 'unindentText',
        label: 'Unindent Text',
        category: 'Formatting',
        execute: (str) => str.split('\n').map(l => l.replace(/^ {1,4}|\t/, '')).join('\n'),
    },

    // ==== ADVANCED ====
    extractEmails: {
        id: 'extractEmails',
        label: 'Extract Emails',
        category: 'Advanced',
        execute: (str) => {
            const matches = str.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/g);
            return matches ? Array.from(new Set(matches)).join('\n') : '';
        },
    },
    extractUrls: {
        id: 'extractUrls',
        label: 'Extract URLs',
        category: 'Advanced',
        execute: (str) => {
            const matches = str.match(/https?:\/\/[^\s]+/g);
            return matches ? Array.from(new Set(matches)).join('\n') : '';
        },
    },
    extractNumbers: {
        id: 'extractNumbers',
        label: 'Extract Numbers',
        category: 'Advanced',
        execute: (str) => {
            const matches = str.match(/\b\d+(?:\.\d+)?\b/g);
            return matches ? Array.from(new Set(matches)).join('\n') : '';
        },
    },
    extractUniqueWords: {
        id: 'extractUniqueWords',
        label: 'Extract Unique Words',
        category: 'Advanced',
        execute: (str) => {
            const words = str.toLowerCase().match(/\b\w+\b/g);
            return words ? Array.from(new Set(words)).sort().join('\n') : '';
        },
    },
};

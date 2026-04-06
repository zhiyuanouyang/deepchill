'use client';

import React, { useEffect } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import { useTextCurator } from '../../hooks/useTextCurator';
import TextInputPanel from '../../components/text-curator/TextInputPanel';
import TextOutputPanel from '../../components/text-curator/TextOutputPanel';
import FunctionToolbar from '../../components/text-curator/FunctionToolbar';
import PipelineEditor from '../../components/text-curator/PipelineEditor';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';

const SHORTCUTS = [
    { keys: ['⌘', 'Z'], description: 'Undo action' },
    { keys: ['⌘', 'Shift', 'Z'], description: 'Redo action' },
    { keys: ['⌘', 'Shift', 'C'], description: 'Copy output' },
];

const FAQS = [
    {
        question: 'What is Text Curator?',
        answer: 'Text Curator is an advanced, free all-in-one text processing tool built for developers and general users. It allows you to format case, remove duplicates, normalize whitespace, extract patterns, and more—all instantly within your browser.',
    },
    {
        question: 'Is my data private and secure?',
        answer: 'Yes! All text processing is done client-side directly in your browser. None of your text is sent to our servers or saved anywhere else, ensuring 100% privacy.',
    },
    {
        question: 'What is Pipeline Mode?',
        answer: 'Pipeline Mode allows you to chain multiple formatting operations together. Instead of applying just one transformation, you can queue "lowercase" then "remove punctuation" and "sort lines" to build a complex workflow that automatically processes your text.',
    },
    {
        question: 'Are there keyboard shortcuts available?',
        answer: 'Yes! We follow a keyboard-first philosophy. You can use Cmd/Ctrl + Z for Undo, Cmd/Ctrl + Shift + Z for Redo, and other standard commands to improve your productivity while editing text.',
    }
];

export default function TextCuratorClient() {
    const curator = useTextCurator();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                curator.undo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                curator.redo();
            }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                navigator.clipboard.writeText(curator.output);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [curator]);

    return (
        <div className="container-lg">
            <ToolHeader 
                title="Text Curator" 
                description="The ultimate free toolkit to format, clean, and process text instantly without your data ever leaving your browser."
            />

            {/* Toolbar */}
            <div className="mb-4">
                <FunctionToolbar 
                    onApply={curator.applyFunction}
                    onUndo={curator.undo}
                    onRedo={curator.redo}
                    canUndo={curator.canUndo}
                    canRedo={curator.canRedo}
                />
                <PipelineEditor
                    pipelineSteps={curator.pipelineSteps}
                    onRemoveStep={curator.removeStep}
                    onClearPipeline={curator.clearPipeline}
                />
            </div>

            {/* Split Panes */}
            <div className="grid lg:grid-cols-2 gap-4 h-[500px] mb-8">
                <TextInputPanel 
                    value={curator.input} 
                    onChange={curator.updateInput} 
                    onClear={() => curator.updateInput('')}
                    stats={curator.inputStats}
                />
                <TextOutputPanel 
                    value={curator.output}
                    stats={curator.outputStats}
                    onSwap={() => curator.swapInOut(curator.output)}
                />
            </div>

            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />

            <div className="divider my-12" />

            <SEOSection 
                toolName="Text Curator"
                what="Text Curator is engineered to be the definitive online text cleaner. Designed specifically for developers, writers, and analysts, this utility combines everything you need into a single, fast workspace."
                why="No more hopping between a specialized 'case converter', a 'duplicate line remover', and a 'words extractor'. It's all here, running entirely within your browser for maximum privacy and zero latency."
                useCases={[
                    { title: 'Developers & Engineers', description: 'Convert variables to camelCase or snake_case, format JSON fragments, remove whitespace, and extract unique URLs.' },
                    { title: 'Data & Marketing', description: 'Clean up CSV columns, deduplicate email mailing lists, remove special characters, and sort thousands of entries alphabetically in milliseconds.' }
                ]}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="Text Curator" pageUrl="https://deepchill.app/tools/text-curator" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="text-curator" />
        </div>
    );
}

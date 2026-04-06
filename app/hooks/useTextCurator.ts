import { useState, useMemo, useCallback } from 'react';
import { CORE_FUNCTIONS } from '../lib/text-processing/core';

export type TextStats = {
    chars: number;
    words: number;
    lines: number;
};

const getStats = (text: string): TextStats => {
    return {
        chars: text.length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text ? text.split('\n').length : 0,
    };
};

export const useTextCurator = () => {
    const [input, setInput] = useState('');
    const [pipelineSteps, setPipelineSteps] = useState<string[]>([]);
    
    // Undo/Redo stack for input + pipeline state
    const [history, setHistory] = useState<{ input: string; pipeline: string[] }[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const saveHistory = useCallback((newInput: string, newPipeline: string[]) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push({ input: newInput, pipeline: newPipeline });
            // keep last 50 states
            if (newHistory.length > 50) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [historyIndex]);

    const updateInput = (newInput: string) => {
        setInput(newInput);
        saveHistory(newInput, pipelineSteps);
    };

    const applyFunction = (functionId: string) => {
        const newSteps = [...pipelineSteps, functionId];
        setPipelineSteps(newSteps);
        saveHistory(input, newSteps);
    };

    const removeStep = (index: number) => {
        const newSteps = [...pipelineSteps];
        newSteps.splice(index, 1);
        setPipelineSteps(newSteps);
        saveHistory(input, newSteps);
    };

    const clearPipeline = () => {
        setPipelineSteps([]);
        saveHistory(input, []);
    };

    const swapInOut = (currentOutput: string) => {
        const newInput = currentOutput;
        setInput(newInput);
        setPipelineSteps([]);
        saveHistory(newInput, []);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const step = history[historyIndex - 1];
            setInput(step.input);
            setPipelineSteps(step.pipeline);
            setHistoryIndex(historyIndex - 1);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const step = history[historyIndex + 1];
            setInput(step.input);
            setPipelineSteps(step.pipeline);
            setHistoryIndex(historyIndex + 1);
        }
    };

    const output = useMemo(() => {
        let result = input;
        for (const step of pipelineSteps) {
            const func = CORE_FUNCTIONS[step];
            if (func) {
                result = func.execute(result);
            }
        }
        return result;
    }, [input, pipelineSteps]);

    const inputStats = useMemo(() => getStats(input), [input]);
    const outputStats = useMemo(() => getStats(output), [output]);

    return {
        input,
        updateInput,
        output,
        pipelineSteps,
        applyFunction,
        removeStep,
        clearPipeline,
        swapInOut,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        inputStats,
        outputStats
    };
};

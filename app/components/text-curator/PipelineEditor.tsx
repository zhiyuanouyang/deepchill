import React from 'react';
import { CORE_FUNCTIONS } from '../../lib/text-processing/core';
import { X, Layers, ArrowRight } from 'lucide-react';

type Props = {
    pipelineSteps: string[];
    onRemoveStep: (index: number) => void;
    onClearPipeline: () => void;
};

export default function PipelineEditor({ pipelineSteps, onRemoveStep, onClearPipeline }: Props) {
    if (pipelineSteps.length === 0) return null;

    return (
        <div className="bg-white/2 border border-white/10 rounded-xl p-4 mt-2">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-purple-400">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline</span>
                </div>
                {pipelineSteps.length > 0 && (
                    <button 
                        onClick={onClearPipeline}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                {pipelineSteps.map((stepId, index) => {
                    const func = CORE_FUNCTIONS[stepId];
                    if (!func) return null;
                    return (
                        <React.Fragment key={`${stepId}-${index}`}>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg shadow-sm">
                                <span className="text-sm font-medium text-slate-200">{func.label}</span>
                                <button
                                    onClick={() => onRemoveStep(index)}
                                    className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded hover:bg-white/10"
                                    aria-label={`Remove ${func.label}`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {index < pipelineSteps.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-purple-400/50" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

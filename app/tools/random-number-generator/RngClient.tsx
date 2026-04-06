'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';
import { generateBatch } from '../../lib/math/distributions';
import Histogram from '../../components/tools/random-number/Histogram';
import CopyButton from '@/app/components/tools/CopyButton';

const FAQS = [
    {
        question: 'What is a normal (Gaussian) distribution?',
        answer: 'A normal distribution, often called a bell curve, means that most of the randomly generated numbers will cluster around the mean (average), with fewer numbers appearing at the extremes. It is heavily used in statistics and machine learning simulations.',
    },
    {
        question: 'Are the random numbers truly random?',
        answer: 'They are pseudorandom, generated mathematically by your browser\'s native algorithms. While perfect for games, simulations, and general developer needs, they should not be used for cryptographic security.',
    },
    {
        question: 'How do I generate a list of integers instead of decimals?',
        answer: 'Simply toggle the "Integers Only" switch in the controls. The generator will automatically round values to the nearest whole numbers.',
    }
];

export default function RngClient() {
    // State
    const [distType, setDistType] = useState<'uniform' | 'normal' | 'exponential' | 'poisson' | 'binomial'>('uniform');
    const [count, setCount] = useState<number>(100);
    const [isInteger, setIsInteger] = useState<boolean>(false);

    // Distribution specific params
    const [uniformParams, setUniformParams] = useState({ min: 1, max: 100 });
    const [normalParams, setNormalParams] = useState({ mean: 0, stdDev: 1 });
    const [expParams, setExpParams] = useState({ lambda: 1 });
    const [poissonParams, setPoissonParams] = useState({ lambda: 5 });
    const [binomialParams, setBinomialParams] = useState({ trials: 10, probability: 0.5 });

    const [results, setResults] = useState<number[]>([]);

    const regenerate = useCallback(() => {
        let params = {};
        switch (distType) {
            case 'uniform': params = uniformParams; break;
            case 'normal': params = normalParams; break;
            case 'exponential': params = expParams; break;
            case 'poisson': params = poissonParams; break;
            case 'binomial': params = binomialParams; break;
        }

        try {
            const batch = generateBatch(distType, count, params, isInteger);
            setResults(batch);
        } catch (e) {
            console.error('Generation error', e);
        }
    }, [distType, count, isInteger, uniformParams, normalParams, expParams, poissonParams, binomialParams]);

    useEffect(() => {
        regenerate();
    }, [regenerate]);

    return (
        <div className="container-lg">
            <ToolHeader
                title="Random Number Generator"
                description="Generate lists of random numbers across multiple statistical distributions with instant visual histograms."
            />

            <div className="grid lg:grid-cols-12 gap-8 mb-12 fade-in">
                {/* Controls */}
                <div className="lg:col-span-4 flex flex-col gap-6 bg-white/4 p-6 rounded-xl border border-white/8">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Distribution Type</label>
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none transition-colors"
                            value={distType}
                            onChange={(e) => setDistType(e.target.value as any)}
                        >
                            <option value="uniform">Uniform</option>
                            <option value="normal">Normal (Gaussian)</option>
                            <option value="exponential">Exponential</option>
                            <option value="poisson">Poisson</option>
                            <option value="binomial">Binomial</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Generate Count</label>
                            <input
                                type="number"
                                min="1" max="10000"
                                className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none transition-colors"
                                value={count}
                                onChange={(e) => setCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="cursor-pointer flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Integers</span>
                                <input
                                    type="checkbox"
                                    className="cursor-pointer accent-green-500 w-4 h-4"
                                    checked={isInteger}
                                    onChange={(e) => setIsInteger(e.target.checked)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-white/8 my-2"></div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Parameters</div>

                    {distType === 'uniform' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase text-slate-500 mb-1">Min</label>
                                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={uniformParams.min} onChange={e => setUniformParams({ ...uniformParams, min: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase text-slate-500 mb-1">Max</label>
                                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={uniformParams.max} onChange={e => setUniformParams({ ...uniformParams, max: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                    )}

                    {distType === 'normal' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase text-slate-500 mb-1">Mean &mu;</label>
                                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={normalParams.mean} onChange={e => setNormalParams({ ...normalParams, mean: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase text-slate-500 mb-1">StdDev &sigma;</label>
                                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={normalParams.stdDev} onChange={e => setNormalParams({ ...normalParams, stdDev: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                    )}

                    {distType === 'exponential' && (
                        <div>
                            <label className="block text-[10px] uppercase text-slate-500 mb-1">Rate &lambda;</label>
                            <input type="number" min="0.01" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={expParams.lambda} onChange={e => setExpParams({ ...expParams, lambda: parseFloat(e.target.value) || 0 })} />
                        </div>
                    )}

                    {distType === 'poisson' && (
                        <div>
                            <label className="block text-[10px] uppercase text-slate-500 mb-1">Event Rate &lambda;</label>
                            <input type="number" min="0.01" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={poissonParams.lambda} onChange={e => setPoissonParams({ ...poissonParams, lambda: parseFloat(e.target.value) || 0 })} />
                        </div>
                    )}

                    {distType === 'binomial' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase text-slate-500 mb-1">Trials (n)</label>
                                <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={binomialParams.trials} onChange={e => setBinomialParams({ ...binomialParams, trials: parseInt(e.target.value) || 1 })} />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase text-slate-500 mb-1">Prob (p)</label>
                                <input type="number" min="0" max="1" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none" value={binomialParams.probability} onChange={e => setBinomialParams({ ...binomialParams, probability: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <button onClick={regenerate} className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-green-900/40">Regenerate Now</button>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/2 border border-white/8 rounded-xl p-6 pt-4">
                        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Distribution Histogram</h3>
                        <Histogram data={results} bins={30} />
                    </div>

                    <div className="bg-white/2 border border-white/8 rounded-xl flex flex-col flex-grow">
                        <div className="flex justify-between items-center p-4 border-b border-white/8 bg-white/4 rounded-t-xl">
                            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Generated Sequence</h3>
                            <div className="flex gap-2">
                                <CopyButton getValue={() => results.join('\n')} label="CSV" />
                                <CopyButton getValue={() => JSON.stringify(results, null, 2)} label="JSON" />
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-5 md:grid-cols-10 gap-2 overflow-auto max-h-[300px]">
                            {results.map((num, i) => (
                                <div key={i} className="text-[10px] font-mono text-center bg-white/5 text-slate-300 rounded py-1 border border-white/10">
                                    {isInteger ? num : num.toFixed(4)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="divider my-12" />

            <SEOSection
                toolName="Advanced Random Number Generator"
                what="A browser-based pseudo-random number generator that goes beyond simple 1-100 limits. It fully supports standard statistical distribution patterns including Uniform, Gaussian (Normal), Exponential, Poisson, and Binomial distributions."
                why="Because developers and data scientists often need test data that mimics real-world scenarios. A plain uniform random generator is rarely enough for load testing or data mocking. Our tool generates robust lists natively in your browser and renders the density with beautiful live histograms."
                useCases={[
                    { title: 'Test Data Mocking', description: 'Create realistic user sign-up intervals using an exponential distribution to feed into your database mock.' },
                    { title: 'Game Development', description: 'Simulate natural loot drops or character attribute scores using the Normal (Gaussian) setting to prevent completely skewed extremes.' }
                ]}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="Random Number Generator" pageUrl="https://deepchill.app/tools/random-number-generator" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="random-number-generator" />
        </div>
    );
}

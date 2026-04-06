'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';
import { useTimezoneStore } from '../../hooks/useTimezoneStore';
import { formatInTimeZone } from 'date-fns-tz';
import { addMinutes, startOfDay, differenceInMinutes, format } from 'date-fns';

const FAQS = [
    {
        question: 'Does this handle Daylight Saving Time (DST) automatically?',
        answer: 'Yes! The tool uses native timezone engines (IANA Time Zone Database) under the hood to ensure all offset conversions perfectly align with precise real-time historical and regional DST rules.',
    },
    {
        question: 'How do I compare team working hours?',
        answer: 'Add the timezones for all your team members, and adjust the slider. The interface highlights standard working hours (9 AM - 5 PM) so you can easily spot overlapping availabilities.',
    },
    {
        question: 'Are my timezone selections saved?',
        answer: 'Yes, your configured timezones are saved locally in your browser so they will be waiting for you exactly as you left them during your next visit.',
    }
];

export default function TimezoneClient() {
    const { timezones, isLoaded, addTimezone, removeTimezone } = useTimezoneStore();

    // Time control
    const [referenceDate, setReferenceDate] = useState<Date>(new Date());
    const [sliderMinutes, setSliderMinutes] = useState<number>(0);
    const [newTzInput, setNewTzInput] = useState('');

    // Only fetch supported zones once mounted to avoid hydration errors
    const allZones = useMemo(() => {
        if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
            return Intl.supportedValuesOf('timeZone');
        }
        return ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    }, []);

    // Set slider to current time of day for reference Date upon load
    useEffect(() => {
        if (isLoaded) {
            const now = new Date();
            const start = startOfDay(now);
            const diff = differenceInMinutes(now, start);
            setSliderMinutes(diff);
        }
    }, [isLoaded]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderMinutes(parseInt(e.target.value));
    };

    const resetToNow = () => {
        const now = new Date();
        setReferenceDate(now);
        setSliderMinutes(differenceInMinutes(now, startOfDay(now)));
    };

    const calculatedDate = useMemo(() => {
        const start = startOfDay(referenceDate);
        return addMinutes(start, sliderMinutes);
    }, [referenceDate, sliderMinutes]);

    const handleAdd = () => {
        if (newTzInput && allZones.includes(newTzInput)) {
            addTimezone(newTzInput);
            setNewTzInput('');
        }
    };

    if (!isLoaded) return <div className="p-8 text-center"><span className="loading loading-spinner"></span></div>;

    return (
        <div className="container-lg">
            <ToolHeader
                title="Timezone Converter & Meeting Planner"
                description="Easily visualize overlapping working hours across the globe and convert meeting times instantly."
            />

            <div className="mb-12 fade-in">
                {/* Control Panel */}
                <div className="bg-white/4 p-6 rounded-xl border border-white/8 mb-6 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                list="tz-list"
                                className="w-full md:w-64 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 p-2 focus:border-green-500/40 outline-none transition-colors"
                                placeholder="Search timezone (e.g. Asia/Tokyo)"
                                value={newTzInput}
                                onChange={e => setNewTzInput(e.target.value)}
                            />
                            <datalist id="tz-list">
                                {allZones.map(tz => <option key={tz} value={tz} />)}
                            </datalist>
                            <button onClick={handleAdd} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-green-900/40">Add</button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={resetToNow} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium border border-white/10 transition-colors">Reset to Now</button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-slate-300">Adjust Meeting Time</span>
                            <span className="font-mono bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-sm">
                                {format(calculatedDate, 'MMM do, yyyy')}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-1440" // Go back 1 day
                            max="2880"  // Go forward 1 day
                            value={sliderMinutes}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 px-2 mt-1">
                            <span>Previous Day</span>
                            <span>Today</span>
                            <span>Next Day</span>
                        </div>
                    </div>
                </div>

                {/* Timezone Grid */}
                <div className="grid gap-4">
                    {timezones.map((tz) => {
                        const localTimeStr = formatInTimeZone(calculatedDate, tz, "HH:mm");
                        const dateStr = formatInTimeZone(calculatedDate, tz, "MMM d, yyyy");
                        const abbrev = formatInTimeZone(calculatedDate, tz, "zzz");
                        const time12h = formatInTimeZone(calculatedDate, tz, "h:mm a");

                        const hour = parseInt(formatInTimeZone(calculatedDate, tz, "H"));
                        const isWorkingHour = hour >= 9 && hour < 17;
                        const isNight = hour < 6 || hour >= 22;

                        let cardClass = "bg-white/2 border-white/8";
                        let statusIcon = "☀️"; // Default daytime/neutral
                        if (isWorkingHour) {
                            cardClass = "bg-green-500/5 border-green-500/30 ring-1 ring-green-500/20";
                            statusIcon = "💼"; // Work hour
                        } else if (isNight) {
                            cardClass = "bg-white/5 border-white/5 opacity-80";
                            statusIcon = "🌙"; // Night time
                        }

                        return (
                            <div key={tz} className={`flex flex-col md:flex-row justify-between items-center p-6 rounded-xl border transition-colors relative group ${cardClass}`}>
                                <div className="flex flex-col md:w-1/3 mb-4 md:mb-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{statusIcon}</span>
                                        <h3 className="text-lg font-bold text-white truncate pr-4" title={tz}>
                                            {tz.split('/').pop()?.replace(/_/g, ' ')}
                                        </h3>
                                    </div>
                                    <span className="text-sm text-slate-500">{tz}</span>
                                </div>

                                <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                                    <div className="flex items-baseline gap-3">
                                        <div className="text-4xl font-mono tracking-tight text-white font-semibold">
                                            {localTimeStr}
                                        </div>
                                        <div className="text-sm font-bold text-slate-400 w-12 text-center bg-white/5 py-1 rounded">
                                            {abbrev}
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-400 mt-2 font-medium">
                                        {time12h} &bull; {dateStr}
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeTimezone(tz)}
                                    className="md:absolute md:top-4 md:right-4 px-2 py-1 text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all mt-4 md:mt-0"
                                >
                                    Remove
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="divider my-12" />

            <SEOSection
                toolName="Global Timezone Converter"
                what="An intuitive visual slider tool allowing you to compare up to 10 international time regions simultaneously. It inherently recognizes complex DST (Daylight Saving Time) constraints locally and abroad to automatically calculate exact overlapping synchronization."
                why="Because simple 1-to-1 converters require you to calculate backward and forward when managing group meetings. Using this interactive time slider, you immediately visually identify standard 9-to-5 working hours (💼) versus deep night cycles (🌙) for colleagues scattered in London, Tokyo, and New York simultaneously."
                useCases={[
                    { title: 'Global Remote Teams', description: 'Find the thin 1-hour overlap where standard company operating hours sync for a worldwide all-hands meeting.' },
                    { title: 'International DevOps', description: 'Schedule non-disruptive maintenance windows by ensuring deployment time falls precisely during the lowest-traffic night shift for consecutive global server regions.' }
                ]}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="Timezone Converter" pageUrl="https://deepchill.app/tools/timezone-converter" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="timezone-converter" />
        </div>
    );
}

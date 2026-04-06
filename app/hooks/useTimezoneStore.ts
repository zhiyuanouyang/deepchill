import { useState, useEffect } from 'react';

const STORAGE_KEY = 'timezone-converter-selections';

export function useTimezoneStore() {
    const [timezones, setTimezones] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setTimezones(JSON.parse(stored));
            } catch (e) {
                // fallback to default
                setDefaultTimezones();
            }
        } else {
            setDefaultTimezones();
        }
        setIsLoaded(true);
    }, []);

    const setDefaultTimezones = () => {
        const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const defaults = [local];
        if (local !== 'UTC') defaults.push('UTC');
        if (local !== 'America/New_York' && local !== 'UTC') defaults.push('America/New_York');
        setTimezones(defaults.slice(0, 3));
    };

    const addTimezone = (tz: string) => {
        if (!timezones.includes(tz)) {
            const newTz = [...timezones, tz];
            setTimezones(newTz);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newTz));
        }
    };

    const removeTimezone = (tz: string) => {
        const newTz = timezones.filter(t => t !== tz);
        setTimezones(newTz);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTz));
    };

    const reorderTimezones = (startIndex: number, endIndex: number) => {
        const result = Array.from(timezones);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        setTimezones(result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    };

    return {
        timezones,
        isLoaded,
        addTimezone,
        removeTimezone,
        reorderTimezones
    };
}

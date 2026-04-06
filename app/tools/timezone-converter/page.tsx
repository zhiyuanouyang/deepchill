import { Metadata } from 'next';
import TimezoneClient from './TimezoneClient';

export const metadata: Metadata = {
    title: 'Timezone Converter & Global Meeting Planner',
    description: 'Instantly compare multiple time zones side-by-side. Drag the slider to seamlessly find overlapping working hours and schedule international meetings without confusion.',
    alternates: {
        canonical: 'https://deepchill.app/tools/timezone-converter',
    },
    openGraph: {
        title: 'Interactive Timezone Converter',
        description: 'Visual timezone converter and global scheduling tool. Free & client-side.',
        url: 'https://deepchill.app/tools/timezone-converter',
        type: 'website',
    },
};

export default function TimezoneConverterPage() {
    return <TimezoneClient />;
}

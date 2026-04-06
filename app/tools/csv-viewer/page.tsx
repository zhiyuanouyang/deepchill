import { Metadata } from 'next';
import CsvViewerClient from './CsvViewerClient';

export const metadata: Metadata = {
    title: 'CSV Viewer | Fast Online Spreadsheet & Data Reader',
    description: 'Instantly view, filter, and sort large CSV files directly in your browser. Features auto-delimiter detection, drag & drop, and zero server uploads for 100% privacy.',
    alternates: {
        canonical: 'https://deepchill.app/tools/csv-viewer',
    },
    openGraph: {
        title: 'CSV Viewer | Secure Client-Side Data Reader',
        description: 'Read and analyze massive CSV files securely online. No data is sent to our servers.',
        url: 'https://deepchill.app/tools/csv-viewer',
        type: 'website',
    },
};

export default function CsvViewerPage() {
    return <CsvViewerClient />;
}

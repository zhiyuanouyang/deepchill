import { Metadata } from 'next';
import TextCuratorClient from './TextCuratorClient';

export const metadata: Metadata = {
    title: 'Text Curator | Free Online Text Formatting & Processing Tool',
    description: 'The ultimate online text cleaner. Easily change case, remove duplicate lines, extract emails, remove whitespace, and format your text strings safely in your browser.',
    alternates: {
        canonical: 'https://deepchill.app/tools/text-curator',
    },
    openGraph: {
        title: 'Text Curator | All-in-One Text Processing Toolkit',
        description: 'Clean, format, and organize any text data instantly. A secure, client-side only utility by Deepchill.',
        url: 'https://deepchill.app/tools/text-curator',
        type: 'website',
    },
};

export default function TextCuratorPage() {
    return <TextCuratorClient />;
}

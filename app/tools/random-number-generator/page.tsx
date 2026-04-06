import { Metadata } from 'next';
import RngClient from './RngClient';

export const metadata: Metadata = {
    title: 'Random Number Generator | Uniform, Normal, & Poisson Distributions',
    description: 'A powerful random number generator supporting uniform, gaussian (normal), exponential, and binomial distributions. Copy lists instantly or download as CSV.',
    alternates: {
        canonical: 'https://deepchill.app/tools/random-number-generator',
    },
    openGraph: {
        title: 'Random Number Generator with Distributions',
        description: 'Generate advanced random sequences instantly. Includes live histograms and zero data tracking.',
        url: 'https://deepchill.app/tools/random-number-generator',
        type: 'website',
    },
};

export default function RandomNumberGeneratorPage() {
    return <RngClient />;
}

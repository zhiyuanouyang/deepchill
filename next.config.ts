
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: '*.deepchill.app',
            },
            {
                protocol: 'https',
                hostname: 'interviewgpt.deepchill.app',
            },
        ],
    },
};

export default nextConfig;

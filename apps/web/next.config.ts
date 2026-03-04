import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'maettbueysvonubqpmhv.supabase.co',
            },
        ],
    },

    // Silence build-time type errors from missing npm packages
    // (resolved at runtime when node_modules are present)
    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;

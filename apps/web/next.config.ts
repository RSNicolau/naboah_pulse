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

        typescript: {
                    ignoreBuildErrors: true,
        },

        eslint: {
                    ignoreDuringBuilds: true,
        },
};

export default nextConfig;

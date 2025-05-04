import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
    assetPrefix: 'https://www.innovativesolutions.com.tr',
  basePath: '/dietAI',
};




export default nextConfig;

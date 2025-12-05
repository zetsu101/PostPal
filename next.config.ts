import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable production source maps to get readable stack traces in Vercel
  productionBrowserSourceMaps: true,
  // Allow build to proceed with ESLint warnings (warnings won't break production)
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint during builds to allow warnings
    dirs: ['src'],
  },
  typescript: {
    // Don't fail build on type errors during build (for faster iteration)
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

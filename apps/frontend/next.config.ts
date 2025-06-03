// apps/frontend/next.config.ts
import { NextConfig } from 'next'; // Import the NextConfig type

const nextConfig: NextConfig = {
  reactStrictMode: true, // Or whatever other configs you have
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '', // Usually empty for https
        pathname: '/**', // Allow any path under this hostname
      },
      // You can add other trusted image hostnames here if needed
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'another-image-provider.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
  // ... any other configurations you might have
};

export default nextConfig; // Use ES module export
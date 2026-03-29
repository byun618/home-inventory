import type { NextConfig } from 'next';

const API_URL = process.env.API_INTERNAL_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  transpilePackages: ['@home-inventory/shared-types'],
  rewrites: async () => [
    { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
    { source: '/socket.io/:path*', destination: `${API_URL}/socket.io/:path*` },
  ],
};

export default nextConfig;

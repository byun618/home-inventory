import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@home-inventory/shared-types'],
};

export default nextConfig;

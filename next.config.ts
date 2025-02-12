import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // distDir: 'out',   // <-- Add this line to override the default .next folder
  webpack: (config, { isServer }) => {
    // Exclude firebaseRulesTest files from the build
    config.module.rules.push({
      test: /firebaseRulesTest\.(ts|js)$/,
      loader: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;

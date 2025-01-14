import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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


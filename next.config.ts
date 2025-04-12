import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['react-split-pane'],
};

export default nextConfig;

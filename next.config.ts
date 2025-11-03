import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/chacara-jardim-ypiranga',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;

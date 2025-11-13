import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Remover 'output: export' durante desenvolvimento para permitir SSR
  // output: 'export',
  basePath: isProd ? '/chacara-jardim-ypiranga' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;

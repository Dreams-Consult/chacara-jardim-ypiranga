import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Remover 'output: export' para permitir API Routes dinâmicas
  // output: 'export', // Desabilitado - incompatível com API Routes
  basePath: isProd ? '/chacara-jardim-ypiranga' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  
  // Aumentar limite de body para suportar PDFs grandes
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Remover 'output: export' para permitir API Routes dinâmicas
  // output: 'export', // Desabilitado - incompatível com API Routes
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  
  // Configurações experimentais
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
      allowedOrigins: ['*'],
    },
  },
};

export default nextConfig;

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
      bodySizeLimit: '500mb',
      allowedOrigins: ['*'],
    },
  },

  // Configuração do Turbopack para resolver alias
  turbopack: {
    resolveAlias: {
      canvas: './lib/canvas-mock.ts',
    },
  },
};

export default nextConfig;

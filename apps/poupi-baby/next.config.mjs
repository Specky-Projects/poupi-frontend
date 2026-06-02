import { withSentryConfig } from '@sentry/nextjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(appDir, '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@poupi-frontend/ui', '@poupi-frontend/api-client', '@poupi-frontend/types', '@poupi-frontend/utils'],
  turbopack: {
    root: workspaceRoot,
  },
  images: {
    remotePatterns: [
      // Marketplaces gerais
      { protocol: 'https', hostname: '**.amazon.com.br' },
      { protocol: 'https', hostname: '**.mlstatic.com' },
      { protocol: 'https', hostname: '**.kabum.com.br' },
      { protocol: 'https', hostname: '**.magazineluiza.com.br' },
      // Farmácias brasileiras
      { protocol: 'https', hostname: '**.drogasil.com.br' },
      { protocol: 'https', hostname: '**.drogaraia.com.br' },
      { protocol: 'https', hostname: '**.drogariasaopaulo.com.br' },
      { protocol: 'https', hostname: '**.drogariapacheco.com.br' },
      { protocol: 'https', hostname: '**.consularemedios.com.br' },
      { protocol: 'https', hostname: '**.farma22.com.br' },
      { protocol: 'https', hostname: '**.extrafarma.com.br' },
      { protocol: 'https', hostname: '**.ultrafarma.com.br' },
      { protocol: 'https', hostname: '**.netfarma.com.br' },
      { protocol: 'https', hostname: '**.farmaciaindiana.com.br' },
      { protocol: 'https', hostname: '**.panvel.com' },
      { protocol: 'https', hostname: '**.drogaleste.com.br' },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? '',
  project: process.env.SENTRY_PROJECT ?? 'poupi-frontend',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});

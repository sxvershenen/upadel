import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // Validation builds can run without replacing an active local dev server's output.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  poweredByHeader: false,
  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
    if (process.env.NODE_ENV === 'production') {
      headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' })
    }
    return [
      { source: '/api/media/file/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/:path*', headers },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(dirname, '../..'),
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return config
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

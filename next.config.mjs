import { withPayload } from '@payloadcms/next/withPayload'

const NodeStuffPlugin = {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('NodeStuffPlugin', (nmf) => {
      nmf.hooks.beforeResolve.tap('NodeStuffPlugin', (resolve) => {
        if (resolve.request && resolve.request.startsWith('node:')) {
          resolve.request = resolve.request.replace(/^node:/, '')
        }
      })
    })
  },
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'maxfitai.com',
        'admin.maxfitai.com',
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://admin.maxfitai.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'www.cielhr.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    if (!isServer) {
      webpackConfig.plugins.push(NodeStuffPlugin)

      const nodeModules = [
        'async_hooks',
        'assert',
        'assert/strict',
        'buffer',
        'child_process',
        'cluster',
        'console',
        'constants',
        'crypto',
        'dgram',
        'dns',
        'domain',
        'fs',
        'http',
        'http2',
        'https',
        'inspector',
        'module',
        'net',
        'os',
        'path',
        'perf_hooks',
        'process',
        'punycode',
        'querystring',
        'readline',
        'repl',
        'stream',
        'stream/web',
        'string_decoder',
        'sys',
        'timers',
        'timers/promises',
        'tls',
        'trace_events',
        'tty',
        'url',
        'util',
        'util/types',
        'v8',
        'vm',
        'wasi',
        'worker_threads',
        'zlib',
        'sqlite',
        'diagnostics_channel',
        'node:sqlite',
        'node:diagnostics_channel',
        'node:async_hooks',
        'node:assert',
        'node:buffer',
        'node:fs',
        'node:http',
        'node:https',
        'node:net',
        'node:os',
        'node:path',
        'node:stream',
        'node:tls',
        'node:url',
        'node:util',
        'node:zlib',
        'node:worker_threads',
      ]

      nodeModules.forEach((mod) => {
        webpackConfig.resolve.alias[mod] = false
        webpackConfig.resolve.alias[`node:${mod}`] = false
      })
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

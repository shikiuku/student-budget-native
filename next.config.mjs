import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // WSL環境でのホットリロード対応
  webpack: (config, { dev, isServer }) => {
    // Path alias resolution for Vercel
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./'),
    }
    
    if (dev && !isServer) {
      // ファイル監視の設定
      config.watchOptions = {
        poll: 1000, // 1秒ごとにポーリング
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
}

export default nextConfig

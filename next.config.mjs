/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // WSL環境でのホットリロード対応
  webpack: (config, { dev, isServer }) => {
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

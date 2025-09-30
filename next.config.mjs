/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization to prevent build issues
  output: 'export',
  trailingSlash: true,
  
  // Image optimization settings
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },
  
  // Experimental features
  experimental: {
    esmExternals: false,
    serverComponentsExternalPackages: ['sqlite3'],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle SQLite3 and other Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        sqlite3: false,
      }
    }
    
    // Optimize bundle
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    }
    
    return config
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'neofocus-desktop',
    BUILD_TIME: new Date().toISOString(),
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Asset prefix
  assetPrefix: './',
}

export default nextConfig

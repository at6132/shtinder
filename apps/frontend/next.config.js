/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway works BEST with standalone mode
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    // Allow build to continue even with warnings (img tags)
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Allow build to continue even with type errors (if any)
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: false, // Enable optimization in production for better performance
  },
}

module.exports = nextConfig


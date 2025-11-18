/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.pravatar.cc', 's3.amazonaws.com'],
  },
}

module.exports = nextConfig


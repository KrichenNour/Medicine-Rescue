/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'ui-avatars.com'],
  },
  env: {
    NEXT_PUBLIC_ARCGIS_API_KEY: process.env.NEXT_PUBLIC_ARCGIS_API_KEY,
  },
}

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  distDir: 'out'
}

module.exports = nextConfig
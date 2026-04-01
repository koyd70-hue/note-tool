import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // open-graph-scraper는 서버사이드 전용이므로 클라이언트 번들에서 제외
  serverExternalPackages: ['open-graph-scraper'],
}

export default nextConfig

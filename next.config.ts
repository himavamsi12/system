import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // keep old static URLs (index.html, videos.html#ep7, ...) working
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/videos', destination: '/', permanent: true },
      { source: '/videos.html', destination: '/', permanent: true },
      { source: '/:page(manual|case-study).html', destination: '/:page', permanent: true },
    ];
  },
};

export default nextConfig;

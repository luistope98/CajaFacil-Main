import type { NextConfig } from "next";

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

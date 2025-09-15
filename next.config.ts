import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "picsum.photos",
        protocol: "https",
      },
      {
        protocol: "https",
        hostname: "pub-037c6b81a5b843e3a9094fd35dc49821.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

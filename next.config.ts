import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
    ],
  },
  // Serverless-friendly: force dynamic for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // For Excel uploads
    },
  },
};

export default nextConfig;

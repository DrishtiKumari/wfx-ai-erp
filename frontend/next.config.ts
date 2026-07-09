import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker/Render deployment
  output: "standalone",

  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;

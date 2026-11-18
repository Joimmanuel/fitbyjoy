import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['muscles.wiki'],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

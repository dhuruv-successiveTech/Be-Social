import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com','via.placeholder.com'], // Add this line
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  
  images: {
    unoptimized: true,
  },
  
  trailingSlash: true,
  
  experimental: {
    mdxRs: true,
  },
};

export default nextConfig;


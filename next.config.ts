import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  
  // Image optimization disabled for potential static export
  images: {
    unoptimized: true,
  },
  
  // Better for static hosting
  trailingSlash: true,
  
  experimental: {
    mdxRs: true,
  },
  
  // Note: output: 'export' is NOT enabled yet because we still have API routes
  // API routes (/api/*) need to remain as serverless functions
  // Deployment strategy:
  //   - Frontend pages → Static export → Spaceship
  //   - API routes → Serverless → Vercel
  // Phase 9 will handle the split deployment configuration
};

export default nextConfig;


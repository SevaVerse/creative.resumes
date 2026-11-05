import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Native/libSQL and PDF parsing packages must stay external to the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql", "mammoth"],
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


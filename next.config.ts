import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Native/libSQL and PDF parsing packages must stay external to the server bundle.
  serverExternalPackages: ["@libsql/client", "libsql", "mammoth"],
  // The PDF route compiles Tailwind at runtime from this stylesheet (see src/lib/pdf/tailwind.ts),
  // which is read from disk and so must be copied into that function explicitly.
  outputFileTracingIncludes: {
    "/api/export-pdf": ["./node_modules/tailwindcss/index.css"],
  },
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


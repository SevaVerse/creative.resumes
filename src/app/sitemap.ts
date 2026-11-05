import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/baseUrl";
import { BLOG_POSTS } from "@/lib/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2025-09-18"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(BLOG_POSTS[0]?.published ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated ?? post.published),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

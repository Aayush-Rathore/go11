import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const LAST_MODIFIED = new Date("2026-03-24T00:00:00.000Z");

const CORE_ROUTES = [
  { path: "/", changeFrequency: "daily" as const, priority: 1 },
  { path: "/download", changeFrequency: "daily" as const, priority: 0.95 },
  { path: "/apk", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/how-to-play", changeFrequency: "weekly" as const, priority: 0.86 },
  { path: "/login-register", changeFrequency: "weekly" as const, priority: 0.82 },
  { path: "/referral-code", changeFrequency: "weekly" as const, priority: 0.88 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.66 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.84 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls: MetadataRoute.Sitemap = CORE_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogUrls: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.78,
  }));

  return [...staticUrls, ...blogUrls];
}


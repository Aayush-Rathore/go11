import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const STATIC_LAST_MODIFIED = new Date();

const CORE_ROUTES = [
  { path: "/", changeFrequency: "daily" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.78 },
  { path: "/editorial-policy", changeFrequency: "monthly" as const, priority: 0.74 },
  { path: "/download", changeFrequency: "daily" as const, priority: 0.95 },
  { path: "/goplay11-app-download", changeFrequency: "weekly" as const, priority: 0.91 },
  { path: "/goplay11-fantasy-app", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/apk", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/how-to-play", changeFrequency: "weekly" as const, priority: 0.86 },
  { path: "/responsible-play", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/login-register", changeFrequency: "weekly" as const, priority: 0.82 },
  { path: "/referral-code", changeFrequency: "weekly" as const, priority: 0.88 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.66 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.84 },
];

function buildLanguageAlternates(path: string) {
  const url = `${SITE_URL}${path}`;

  return {
    languages: {
      "en-IN": url,
      "en-US": url,
      "x-default": url,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls: MetadataRoute.Sitemap = CORE_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: buildLanguageAlternates(route.path),
  }));

  const blogUrls: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.78,
    alternates: buildLanguageAlternates(`/blog/${post.slug}`),
  }));

  return [...staticUrls, ...blogUrls];
}

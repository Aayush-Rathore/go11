import Link from "next/link";

import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { CtaButtons } from "@/components/cta-buttons";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { getAllPosts } from "@/lib/blog";
import { buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";

const PAGE_TITLE = "Goplay11 Blog - Fantasy Tips, APK Guides, and Comparisons";
const PAGE_DESCRIPTION =
  "Read SEO-focused blog content on fantasy strategy, app comparisons, and Goplay11 onboarding best practices.";

function formatDate(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/blog",
  keywords: ["goplay11 blog", "best fantasy apps in india", "is goplay11 safe or real"],
});

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />

      <PageHero
        eyebrow="SEO Content Hub"
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
      >
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Blog" },
          ]}
        />
        <CtaButtons />
      </PageHero>

      <section className="section section-tight">
        <div className="container blog-grid">
          {posts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <p className="meta">Updated: {formatDate(post.updatedAt)}</p>
              <h2>
                <Link className="text-link" href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              <p>{post.excerpt}</p>
              <Link className="text-link" href={`/blog/${post.slug}`}>
                Read article
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}


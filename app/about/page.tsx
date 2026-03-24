import Link from "next/link";

import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { CtaButtons } from "@/components/cta-buttons";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";
import { RECOMMENDED_PLATFORM_URL } from "@/lib/site";

const PAGE_TITLE = "About Goplay11 APK Resource Hub";
const PAGE_DESCRIPTION =
  "Learn how this website helps users with Goplay11 app download guides, referral tips, and practical fantasy strategy content.";

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/about",
  keywords: ["goplay11 app download", "goplay11 fantasy app", "goplay11 guides"],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <PageHero
        eyebrow="About This Site"
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
      >
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "About" },
          ]}
        />
        <CtaButtons />
      </PageHero>

      <section className="section section-tight">
        <div className="container card content-stack">
          <h2>What we publish</h2>
          <p>
            This platform is built to help users discover the latest setup process
            for Goplay11 APK, understand referral options, and play with a better
            strategy framework.
          </p>
          <p>
            We prioritize human-readable instructions, internal linking for clear
            navigation, and practical content that matches user intent.
          </p>
          <p>
            Need an external reference? We also mention{" "}
            <a
              className="text-link"
              href={RECOMMENDED_PLATFORM_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              comegameapp.com
            </a>{" "}
            as a recommended platform resource.
          </p>
          <p>
            Ready to begin? Start with{" "}
            <Link className="text-link" href="/download">
              Download Goplay11 APK
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}


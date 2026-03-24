import Link from "next/link";

import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { CtaButtons } from "@/components/cta-buttons";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";
import { AFFILIATE_LINK } from "@/lib/site";

const PAGE_TITLE = "Contact and Support - Goplay11 APK Guide";
const PAGE_DESCRIPTION =
  "Need help with Goplay11 app download, install flow, referral setup, or fantasy onboarding? Use this support resource page.";

const SUPPORT_TOPICS = [
  "Download and install troubleshooting",
  "Login/register sequence support",
  "Referral code onboarding flow",
  "Contest preparation and gameplay basics",
];

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/contact",
  keywords: ["goplay11 support", "goplay11 app download help", "goplay11 register"],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <PageHero
        eyebrow="Support Hub"
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
      >
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
        />
      </PageHero>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>Common support topics</h2>
            <ul className="tick-list">
              {SUPPORT_TOPICS.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Quick action links</h2>
            <p>
              Start installation from{" "}
              <Link className="text-link" href="/download">
                Download Goplay11 APK
              </Link>{" "}
              and continue with{" "}
              <Link className="text-link" href="/login-register">
                login/register setup
              </Link>
              .
            </p>
            <p>
              For bonus activation, visit{" "}
              <Link className="text-link" href="/referral-code">
                Goplay11 referral code
              </Link>
              .
            </p>
            <p>
              Direct affiliate access:{" "}
              <a className="text-link" href={AFFILIATE_LINK} rel="noopener noreferrer" target="_blank">
                Open campaign link
              </a>
            </p>
          </article>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <CtaButtons />
        </div>
      </section>
    </>
  );
}


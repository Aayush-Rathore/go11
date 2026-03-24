import Link from "next/link";

import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { CtaButtons } from "@/components/cta-buttons";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { buildBreadcrumbSchema, buildFaqSchema, buildMetadata } from "@/lib/seo";
import { REFERRAL_FAQS } from "@/lib/site";

const PAGE_TITLE = "Goplay11 Referral Code - Earn Bonus Instantly";
const PAGE_DESCRIPTION =
  "Use a valid Goplay11 referral code during signup, unlock instant bonus offers, and earn extra rewards when friends join.";

const REFERRAL_POINTS = [
  "Enter referral code during signup",
  "Get instant bonus",
  "Invite friends for extra rewards",
];

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/referral-code",
  keywords: ["goplay11 referral code", "goplay11 register", "goplay11 bonus"],
});

export default function ReferralCodePage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Referral Code", path: "/referral-code" },
        ])}
      />
      <JsonLd data={buildFaqSchema(REFERRAL_FAQS)} />

      <PageHero
        eyebrow="Bonus Activation"
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
      >
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Referral Code" },
          ]}
        />
        <div className="ref-code-box">
          Campaign code in affiliate link: <code>6FHW28S2</code>
        </div>
        <CtaButtons />
      </PageHero>

      <section className="section section-tight">
        <div className="container card">
          <h2>How referral rewards work</h2>
          <ul className="tick-list">
            {REFERRAL_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p>
            Complete signup from the{" "}
            <Link className="text-link" href="/login-register">
              login/register page
            </Link>{" "}
            and keep the referral field filled before final account confirmation.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>Where to use this page in your flow</h2>
          <p>
            Start with{" "}
            <Link className="text-link" href="/download">
              Download Goplay11 APK
            </Link>{" "}
            and then return here before your first contest to make sure your bonus
            field is not skipped.
          </p>
        </div>
      </section>

      <FaqList items={REFERRAL_FAQS} title="Referral Code FAQs" />
    </>
  );
}


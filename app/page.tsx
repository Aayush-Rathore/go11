import Image from "next/image";
import Link from "next/link";

import { CtaButtons } from "@/components/cta-buttons";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildMetadata,
  buildSoftwareApplicationSchema,
} from "@/lib/seo";
import { HOME_FAQS, RECOMMENDED_PLATFORM_URL } from "@/lib/site";

const PAGE_TITLE = "Goplay11 App Download - Play Fantasy Games & Win Real Rewards";
const PAGE_DESCRIPTION =
  "Goplay11 is one of the fastest-growing fantasy gaming platforms in India where users can create teams, join contests, and win real rewards using skill and strategy.";

const FEATURE_CARDS = [
  "Easy team creation",
  "Live score updates",
  "Secure payments",
  "Multiple contests",
  "Daily rewards",
];

const TRUST_BADGES = [
  "Lightweight Android APK",
  "Real-time score tracking",
  "Transparent contest flow",
  "Responsible play guidance",
];

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildSoftwareApplicationSchema(PAGE_DESCRIPTION, "/")} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Goplay11 App Download", path: "/" },
        ])}
      />
      <JsonLd data={buildFaqSchema(HOME_FAQS)} />

      <PageHero
        eyebrow="Fantasy Sports 2026"
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
      >
        <p className="lead-muted">
          Users can easily download the latest Goplay11 APK and start playing
          instantly. The platform supports multiple sports including cricket and
          football with live scoring.
        </p>
        <CtaButtons />
      </PageHero>

      <section className="section section-tight">
        <div className="container two-col">
          <div className="card">
            <h2>Start in Four Steps</h2>
            <ol className="step-list">
              <li>Click your preferred download button.</li>
              <li>Install the APK on your Android phone.</li>
              <li>Register your account and complete profile setup.</li>
              <li>Join contests and begin your fantasy game journey.</li>
            </ol>
            <p>
              Need the exact install sequence? Visit{" "}
              <Link className="text-link" href="/download">
                Download Goplay11 APK
              </Link>{" "}
              for the latest setup guide.
            </p>
          </div>

          <div className="hero-card floating-card">
            <Image
              alt="Goplay11 app logo"
              className="logo-image"
              height={180}
              priority
              src="/logo.svg"
              width={180}
            />
            <p className="card-lead">
              Mobile-first interface made for fast lineup edits and quick contest
              entry.
            </p>
            <ul className="tick-list">
              <li>Clean lobby navigation</li>
              <li>Fast match refresh</li>
              <li>Simple wallet flow</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Features That Keep Players Active</h2>
          <div className="card-grid">
            {FEATURE_CARDS.map((feature) => (
              <article className="card" key={feature}>
                <h3>{feature}</h3>
                <p>
                  Built to reduce friction so users can focus on decision-making,
                  team strategy, and contest timing.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>Internal and External Resource Links</h2>
          <p>
            Use this quick path to{" "}
            <Link className="text-link" href="/download">
              Download Goplay11 APK
            </Link>{" "}
            and continue to account setup with the{" "}
            <Link className="text-link" href="/login-register">
              login/register guide
            </Link>
            .
          </p>
          <p>
            Strategy seekers can use our guide to{" "}
            <Link className="text-link" href="/how-to-play">
              Play fantasy games online
            </Link>{" "}
            with better role balance and contest discipline.
          </p>
          <p>
            You can also explore{" "}
            <a
              className="text-link"
              href={RECOMMENDED_PLATFORM_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              comegameapp.com
            </a>{" "}
            as a recommended platform reference.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <h2>Trust Factors</h2>
          <div className="badge-row">
            {TRUST_BADGES.map((badge) => (
              <div className="badge" key={badge}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqList items={HOME_FAQS} title="Goplay11 FAQs" />
    </>
  );
}


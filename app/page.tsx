import Image from "next/image";
import Link from "next/link";

import { CtaButtons } from "@/components/cta-buttons";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { getAllPosts } from "@/lib/blog";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildMetadata,
  buildSoftwareApplicationSchema,
} from "@/lib/seo";
import { EXTERNAL_REL, HOME_FAQS, LOGO_PATH, RECOMMENDED_PLATFORM_URL } from "@/lib/site";

const PAGE_TITLE = "Goplay11 APK Download, Fantasy Tips, and Bonus Guide";
const PAGE_DESCRIPTION =
  "Download Goplay11 APK, learn proven fantasy gaming strategy, and use a clear onboarding path to improve rankings, retention, and conversion.";

const FEATURE_CARDS = [
  {
    title: "Faster Android Onboarding",
    description:
      "Step-by-step install and account setup guidance helps new users move from first click to first contest without confusion.",
  },
  {
    title: "Intent-Matched Content Clusters",
    description:
      "Pages are structured for informational, transactional, and comparison intent so users find the exact guide they need.",
  },
  {
    title: "Conversion-Focused Internal Links",
    description:
      "Each section routes users to the next action page, reducing dead ends and improving session depth.",
  },
  {
    title: "Practical Fantasy Strategy",
    description:
      "You get lineup frameworks, contest selection logic, and bankroll rules designed for beginners and regular players.",
  },
  {
    title: "Trust and Safety Layer",
    description:
      "Source verification, permission checks, and responsible play guidance improve confidence before paid entries.",
  },
  {
    title: "SEO + UX in One Flow",
    description:
      "Readable headings, helpful FAQs, schema markup, and structured CTAs support both users and search engines.",
  },
];

const ONBOARDING_STEPS = [
  "Open the download page and install the latest Android package from a trusted source.",
  "Complete registration and profile setup before match lock to avoid delayed entries.",
  "Apply referral details during signup to unlock valid campaign bonuses.",
  "Start with low-risk contests while building lineup discipline and score review habits.",
];

const TRUST_BADGES = [
  "GO11 brand-led guidance",
  "Role-based lineup playbook",
  "Beginner-first onboarding path",
  "SEO-friendly intent architecture",
  "Responsible play reminders",
];

const STRATEGY_BLOCKS = [
  {
    heading: "1) Build lineups with role logic, not hype picks",
    points: [
      "Start by balancing dependable players with a few upside selections. This lowers volatility while preserving win potential.",
      "Captain and vice-captain decisions should be based on role certainty, current form, and probable match context.",
      "Avoid copying public teams blindly. Use your own framework and adapt to confirmed playing elevens.",
    ],
  },
  {
    heading: "2) Match contest type to your risk profile",
    points: [
      "Small-entry contests are ideal while you are building consistency and learning scoring behavior.",
      "Move to higher-stake contests only when your process is stable for multiple match cycles.",
      "Track exposure so one poor slate does not erase your weekly progress.",
    ],
  },
  {
    heading: "3) Run a post-match review loop every week",
    points: [
      "After each contest, review what worked, what failed, and what signals were missed before lock time.",
      "Maintain a short record of captain outcomes, role balance, and contest selection quality.",
      "This review loop builds long-term skill and helps you avoid emotional, reactive decisions.",
    ],
  },
];

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  const featuredPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <JsonLd data={buildSoftwareApplicationSchema(PAGE_DESCRIPTION, "/")} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Goplay11 APK Download", path: "/" },
        ])}
      />
      <JsonLd data={buildFaqSchema(HOME_FAQS)} />

      <PageHero
        eyebrow="Fantasy Sports Hub 2026"
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
      >
        <p className="lead-muted">
          This page combines APK onboarding, fantasy strategy fundamentals, and a
          conversion-focused resource path so users can install faster, play smarter,
          and move confidently from first visit to contest entry.
        </p>
        <CtaButtons />
      </PageHero>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>Start in Four Steps</h2>
            <ol className="step-list">
              {ONBOARDING_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p>
              Need a complete walkthrough? Use{" "}
              <Link className="text-link" href="/download">
                Download Goplay11 APK
              </Link>{" "}
              first, then finish onboarding with the{" "}
              <Link className="text-link" href="/login-register">
                Login/Register guide
              </Link>
              .
            </p>
          </article>

          <aside className="hero-card floating-card">
            <Image
              alt="GO11 app logo"
              className="logo-image"
              height={190}
              priority
              src={LOGO_PATH}
              width={190}
            />
            <p className="card-lead">
              GO11-focused UI flow: clear route discovery, quick contest navigation,
              and direct links to the right support pages at every stage.
            </p>
            <ul className="tick-list">
              <li>Fast setup sequence for new users</li>
              <li>Lower-friction path to first contest</li>
              <li>SEO-friendly guidance for high-intent actions</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container card content-stack">
          <h2>Comprehensive Fantasy Gaming Guide for Beginners and Regular Players</h2>
          <p>
            Many fantasy sites lose users because they focus only on promotion and not
            on guidance. This page is built differently. We structure every section to
            match a real user journey: install, register, understand contest types,
            build lineups, and improve decision quality. That structure helps users
            stay longer, complete more actions, and return for updated strategy
            content.
          </p>
          <p>
            For SEO, this matters because search engines reward pages that satisfy
            intent across multiple query types. A user searching for goplay11 app
            download expects transactional clarity. Another searching for how to play
            fantasy games online expects a process guide. A third searching for is
            goplay11 safe or real expects trust signals and verification steps. By
            combining these intents in a readable, internally linked structure, the
            homepage gains topical depth while still staying conversion-focused.
          </p>
          <p>
            If you are just starting, begin with basic discipline: select low-risk
            contests, avoid all-in exposure, and focus on consistent process quality.
            If you already play regularly, use this hub to tighten your weekly review
            cycle and improve lineup construction logic. Better outcomes usually come
            from cleaner decision systems, not random high-stake entries.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Core Features That Improve Rankings, Trust, and Conversion</h2>
          <div className="card-grid">
            {FEATURE_CARDS.map((feature) => (
              <article className="card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card content-stack">
          <h2>Internal Resource Map for Better Session Flow</h2>
          <h3>Install and Onboarding Intent</h3>
          <p>
            Users who arrive with direct install intent should move quickly into setup.
            Route them from homepage to{" "}
            <Link className="text-link" href="/download">
              Download
            </Link>{" "}
            and then to{" "}
            <Link className="text-link" href="/apk">
              APK Guide
            </Link>{" "}
            for compatibility and source checks.
          </p>
          <h3>Account and Bonus Intent</h3>
          <p>
            After install, guide users toward account completion. The best route is{" "}
            <Link className="text-link" href="/login-register">
              Login/Register
            </Link>{" "}
            followed by{" "}
            <Link className="text-link" href="/referral-code">
              Referral Code
            </Link>{" "}
            so signup incentives are not missed.
          </p>
          <h3>Strategy and Retention Intent</h3>
          <p>
            New and returning players should enter the education funnel through{" "}
            <Link className="text-link" href="/how-to-play">
              How To Play
            </Link>{" "}
            and then continue to the{" "}
            <Link className="text-link" href="/blog">
              Fantasy Blog
            </Link>{" "}
            for deeper comparisons, safety checks, and decision frameworks.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container card content-stack">
          <h2>Contest Selection and Lineup Strategy Framework</h2>
          {STRATEGY_BLOCKS.map((block) => (
            <section key={block.heading}>
              <h3>{block.heading}</h3>
              {block.points.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </section>
          ))}
        </div>
      </section>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>Responsible Play Checklist</h2>
            <ul className="tick-list">
              <li>Set a daily and weekly budget before you enter any contest.</li>
              <li>Cap per-contest exposure to control variance and protect bankroll.</li>
              <li>Avoid revenge entries after losses; follow your predefined plan.</li>
              <li>Review outcomes weekly and keep process notes for improvement.</li>
            </ul>
          </article>
          <article className="card">
            <h2>Safety and Authenticity Verification</h2>
            <ul className="tick-list">
              <li>Use official install links with transparent version details.</li>
              <li>Review app permissions and deny unnecessary access requests.</li>
              <li>Confirm support, payout policy, and terms before larger deposits.</li>
              <li>Protect account credentials and never share OTP or wallet PIN.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card content-stack">
          <h2>Helpful Internal and External References</h2>
          <p>
            Start with{" "}
            <Link className="text-link" href="/download">
              Download Goplay11 APK
            </Link>{" "}
            and continue to{" "}
            <Link className="text-link" href="/login-register">
              account setup
            </Link>{" "}
            so you can enter contests faster.
          </p>
          <p>
            Improve contest decision quality using the{" "}
            <Link className="text-link" href="/how-to-play">
              gameplay strategy guide
            </Link>{" "}
            and our latest{" "}
            <Link className="text-link" href="/blog">
              blog updates
            </Link>
            .
          </p>
          <p>
            For broader mobile gaming references, you can also review{" "}
            <a
              className="text-link"
              href={RECOMMENDED_PLATFORM_URL}
              rel={EXTERNAL_REL}
              target="_blank"
            >
              comegameapp.com
            </a>
            .
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <h2>Latest Blog Insights</h2>
          <div className="blog-grid">
            {featuredPosts.map((post) => (
              <article className="blog-card" key={post.slug}>
                <h3>
                  <Link className="text-link" href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p>{post.excerpt}</p>
                <Link className="text-link" href={`/blog/${post.slug}`}>
                  Read full guide
                </Link>
              </article>
            ))}
          </div>
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

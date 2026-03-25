import Link from "next/link";

import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
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

const PAGE_TITLE = "Goplay11 App Download - Play Fantasy Games and Win Rewards";
const PAGE_DESCRIPTION =
  "Download the latest Goplay11 APK, complete setup in minutes, and start playing fantasy contests with a smooth user-friendly flow.";

const APP_INFO = [
  "App Name: Goplay11",
  "Version: Latest 2026",
  "File Size: Lightweight APK",
  "Compatibility: Android devices",
];

const ABOUT_POINTS = [
  "Create your dream team with real match players",
  "Join multiple contests based on your budget",
  "Compete with real players in skill-based formats",
  "Track live match performance and team points",
];

const FEATURE_POINTS = [
  "Easy-to-use interface for quick navigation",
  "Multiple game options across fantasy categories",
  "Fast withdrawals with secure processing",
  "Safe platform with user-data protection focus",
  "24/7 support for onboarding and account help",
];

const REGISTER_STEPS = [
  "Download and install the Goplay11 APK.",
  "Open the app and tap Register or Sign Up.",
  "Enter your mobile number or email details.",
  "Set a password and verify via OTP.",
  "Complete profile details to activate your account.",
];

const LOGIN_STEPS = [
  "Open the Goplay11 app and tap Login.",
  "Enter your registered mobile number or email.",
  "Enter your account password.",
  "Access your dashboard and contest lobby.",
];

const DOWNLOAD_STEPS = [
  "Visit the trusted download source.",
  "Tap the Download Goplay11 App button.",
  "Allow installation from trusted sources on Android.",
  "Install the APK and open the app.",
  "Create your team and start joining contests.",
];

const PLAY_STEPS = [
  "Select a live or upcoming match.",
  "Create your fantasy team with balanced roles.",
  "Join one or more contests.",
  "Earn points from real player performance.",
  "Win rewards based on leaderboard rank.",
];

const WHY_POINTS = [
  "Trusted fantasy gaming experience",
  "Smooth gameplay for beginners and regular users",
  "Multiple earning opportunities through contests",
  "Regular updates with feature improvements",
];

const PROS = [
  "Easy registration process",
  "Fast gameplay and simple entry flow",
  "Multiple contest options",
  "Beginner-friendly interface",
];

const CONS = [
  "Requires stable internet connection",
  "Needs skill learning for consistent results",
];

const PAGE_FAQS = [
  {
    question: "What is Goplay11?",
    answer:
      "Goplay11 is an online fantasy gaming platform where users can create teams, join contests, and win rewards based on match performance.",
  },
  {
    question: "Is Goplay11 app free to download?",
    answer:
      "Yes, the Goplay11 app download process is free. Users can install the APK and then choose free or paid contest formats.",
  },
  {
    question: "How do I download the Goplay11 app?",
    answer:
      "Use the official download page, install the APK on Android, finish registration, and then access contests from your dashboard.",
  },
  {
    question: "Is Goplay11 safe to use?",
    answer:
      "The platform is positioned with secure systems and account protection controls. Always use trusted links and review permissions before install.",
  },
  {
    question: "Can beginners play Goplay11?",
    answer:
      "Yes. The interface is beginner-friendly, and users can start with lower-risk contests while learning scoring and lineup basics.",
  },
];

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/goplay11-app-download",
  keywords: [
    "goplay11 app download",
    "download goplay11 apk for android",
    "goplay11 app latest version",
    "goplay11 register",
    "goplay11 login",
  ],
});

export default function Goplay11AppDownloadPage() {
  return (
    <>
      <JsonLd
        data={buildSoftwareApplicationSchema(PAGE_DESCRIPTION, "/goplay11-app-download")}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Goplay11 App Download", path: "/goplay11-app-download" },
        ])}
      />
      <JsonLd data={buildFaqSchema(PAGE_FAQS)} />

      <PageHero
        eyebrow="Download Resource"
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
      >
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Goplay11 App Download" },
          ]}
        />
        <CtaButtons />
      </PageHero>

      <section className="section section-tight">
        <div className="container card">
          <h2>Goplay11 App Snapshot</h2>
          <div className="badge-row">
            {APP_INFO.map((item) => (
              <div className="badge" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>About Goplay11 App</h2>
            <p>
              Goplay11 is built for users who enjoy fantasy gaming, strategy, and
              competitive match-day decisions.
            </p>
            <ul className="tick-list">
              {ABOUT_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Core Features</h2>
            <ul className="tick-list">
              {FEATURE_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>Goplay11 Register Process</h2>
            <ol className="step-list">
              {REGISTER_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="card">
            <h2>Goplay11 Login Process</h2>
            <ol className="step-list">
              {LOGIN_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>Goplay11 Download Process</h2>
            <ol className="step-list">
              {DOWNLOAD_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="card">
            <h2>How to Play Goplay11 Game</h2>
            <ol className="step-list">
              {PLAY_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>Why Choose Goplay11</h2>
            <ul className="tick-list">
              {WHY_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Pros and Cons</h2>
            <p className="card-lead">Pros</p>
            <ul className="tick-list">
              {PROS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="card-lead">Cons</p>
            <ul className="tick-list">
              {CONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>Continue with Fantasy Strategy and Rewards</h2>
          <p>
            After installation, review the{" "}
            <Link className="text-link" href="/goplay11-fantasy-app">
              Goplay11 fantasy app strategy page
            </Link>{" "}
            for winning tips and contest planning.
          </p>
          <p>
            For referral onboarding, use the{" "}
            <Link className="text-link" href="/referral-code">
              Goplay11 referral code
            </Link>{" "}
            guide before your first paid contest entry.
          </p>
        </div>
      </section>

      <FaqList items={PAGE_FAQS} title="Goplay11 App Download FAQs" />
    </>
  );
}

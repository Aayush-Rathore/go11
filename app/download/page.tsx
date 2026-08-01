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
import { CONTENT_LAST_REVIEWED } from "@/lib/site";

const PAGE_TITLE = "Goplay 11 APK Download — Latest Version 2026 | GoPlay 11";
const H1_TITLE = "Goplay 11 APK — Download Latest Version 2026";
const PAGE_DESCRIPTION =
  "Goplay 11 APK (also known as GoPlay 11) is now available for free download on Android. Follow the steps below to install it on your device and start playing fantasy cricket contests for real cash prizes.";

const DOWNLOAD_FEATURES = [
  "Lightweight APK",
  "Android Compatible",
  "Fast Installation",
  "Secure & Safe",
];

const DOWNLOAD_STEPS = [
  "Click download button",
  "Install APK",
  "Register account",
  "Start playing",
];

const DOWNLOAD_FAQS = [
  {
    question: "Is this page updated for the latest Goplay 11 APK version?",
    answer:
      "Yes. This guide is designed for the current 2026 install flow and focuses on Android users.",
  },
  {
    question: "What should I do if installation is blocked on Android?",
    answer:
      "Enable installation from trusted sources in your phone settings, then restart the install process.",
  },
  {
    question: "Is the GoPlay 11 file safe to install?",
    answer:
      "Only download it from the official link on this page. Files from random third-party sites are sometimes repackaged and are not verified by us.",
  },
  {
    question: "How much storage does it need?",
    answer:
      "It's a lightweight file, so most Android phones with at least 100MB of free storage can install it without any issues.",
  },
  {
    question: "Can I use it on any Android version?",
    answer:
      "It generally supports Android 6.0 and above. Very old devices running outdated Android versions may face compatibility issues.",
  },
];

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/download",
  keywords: [
    "goplay 11",
    "goplay 11 apk",
    "goplay 11 apk download",
    "goplay 11 download",
    "download goplay 11 app",
    "goplay 11 app latest version",
    "goplay 11 apk latest version",
  ],
});

export default function DownloadPage() {
  return (
    <>
      <JsonLd data={buildSoftwareApplicationSchema(PAGE_DESCRIPTION, "/download")} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/goplay-11" },
          { name: "Download", path: "/download" },
        ])}
      />
      <JsonLd data={buildFaqSchema(DOWNLOAD_FAQS)} />

      <PageHero
        eyebrow="Official Install Guide"
        title={H1_TITLE}
        description={PAGE_DESCRIPTION}
      >
        {/* <p className="lead-muted">
          Whether you&apos;re installing for the first time or setting up
          Goplay 11 APK on a new phone, this guide walks you through the entire
          process — from checking your device is compatible to registering
          your account and joining your first fantasy cricket contest.
        </p> */}
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/goplay-11" },
            { label: "Download" },
          ]}
        />
        <p className="lead-muted">Review date: {CONTENT_LAST_REVIEWED}</p>
        <CtaButtons />
      </PageHero>

      <section className="section section-tight">
        <div className="container card">
          <h2>What is GoPlay 11 APK?</h2>
          <p>
            GoPlay 11 APK is the direct installer file for the GoPlay 11 fantasy cricket
            platform, built for Android users who prefer installing the app outside the
            Play Store. Instead of scrolling through a store listing, you can grab the
            file directly, install it in a few taps, and get straight to
            building fantasy teams for ongoing cricket matches. This page covers
            everything you need before installing it — device requirements,
            permissions, and a few safety checks — so first-time users don&apos;t run
            into confusion during setup. If you&apos;re new to the platform, it also
            helps to visit the{" "}
            <Link className="text-link" href="/goplay-11">
              GoPlay 11 homepage
            </Link>{" "}
            first to understand how the fantasy cricket contests, join fees, and
            prize pools work before you commit to an install. Once you&apos;re
            familiar with the basics, downloading and setting up the app on your
            phone only takes a few minutes.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>GoPlay 11 Download Features</h2>
          <p>
            The app is built to be lightweight, so it installs quickly even on
            entry-level Android phones with limited storage. Because the file is
            distributed directly rather than through a marketplace, this download
            skips some of the extra background services that store-listed apps
            often carry, which keeps the overall install size smaller. Here&apos;s what
            you can expect from the current build:
          </p>
          <div className="badge-row">
            {DOWNLOAD_FEATURES.map((feature) => (
              <div className="badge" key={feature}>
                {feature}
              </div>
            ))}
          </div>
          <p>
            Beyond the core install, the current build also focuses on faster app
            open times, smoother scrolling through live match cards, and a cleaner
            onboarding flow for first-time users. Contest listings load quickly
            even on slower mobile data connections, which matters most during
            peak match hours when thousands of users are checking lineups and
            joining contests at the same time.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>Goplay 11 APK System Requirements</h2>
          <p>
            Before you download the Goplay 11 APK, it helps to check whether your
            phone meets the basic requirements. Most Android devices released in the
            last few years run it without any trouble, but a quick
            check saves you from a failed install later. It typically
            needs Android 6.0 or higher, around 100MB of free internal storage, and a
            stable internet connection for downloading and for live match updates
            once the app is running. If your phone is older or running low on
            storage, clearing some space before you start the download
            will make the install process smoother.
          </p>
          <p>
            It&apos;s also worth checking your phone&apos;s available RAM if you&apos;re
            on an older or budget device — devices with 2GB of RAM or more
            generally run the app without lag, even during live scoring updates
            when the screen is refreshing frequently. A steady Wi-Fi or mobile
            data connection during the actual download avoids partial or
            corrupted files, which is one of the most common reasons an install
            fails on the first attempt.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container two-col">
          <article className="card">
            <h2>How to Download GoPlay 11 APK on Android</h2>
            <p>
              Installing it takes only a few minutes when you follow the
              steps in order. Since the file is downloaded outside the Play Store,
              Android will initially block the install until you allow apps from
              unknown sources — this is a standard Android security prompt and isn&apos;t
              specific to this file. Once that setting is switched on, it
              installs like any other app, and you can register an account right
              after opening it for the first time.
            </p>
            <p>
              After registration, you&apos;ll be asked to verify a phone number
              and set up your profile before you can join contests. Take a
              moment to double-check the permissions the app requests during
              first launch, and only grant the ones that are genuinely needed
              for account verification and match notifications.
            </p>
            <ol className="step-list">
              {DOWNLOAD_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="card">
            <h2>Is the GoPlay 11 App Safe to Download?</h2>
            <p>
              A fair question before installing any APK is whether it&apos;s safe, and
              the same applies here. Since it isn&apos;t distributed
              through Google Play, it&apos;s worth downloading it only from
              the official link on this page rather than random file-sharing sites,
              which sometimes repackage APKs with unwanted extras. Keeping Play Protect
              scanning turned on adds another layer of verification even when you
              install outside the store. If you&apos;ve already installed it
              and are unsure about a permission prompt, check the app&apos;s
              official support channel before granting access.
            </p>
            <p>
              As a general rule, treat any APK link shared through unofficial
              WhatsApp groups, forums, or unfamiliar websites with caution —
              stick to the link provided here and bookmark this page for future
              updates so you always know where the latest, verified version is
              coming from.
            </p>
            <p>
              Continue with the{" "}
              <Link className="text-link" href="/apk">
                GoPlay 11 APK setup walkthrough
              </Link>{" "}
              and then complete account onboarding with the{" "}
              <Link className="text-link" href="/login-register">
                GoPlay 11 login guide
              </Link>
              .
            </p>
            <p>
              Want gameplay strategy after install? Use{" "}
              <Link className="text-link" href="/how-to-play">
                How to play GoPlay 11
              </Link>{" "}
              to study lineup planning basics.
            </p>
            <p>
              For quality standards, see{" "}
              <Link className="text-link" href="/editorial-policy">
                Editorial Policy
              </Link>
              .
            </p>
          </article>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>Why Users Choose This Install Method Over the Play Store</h2>
          <p>
            Some Android users prefer the Goplay 11 APK route instead of waiting on
            a store listing, especially when they want the latest build as soon as
            it&apos;s released. Downloading the file directly also helps
            users on devices where the Play Store version isn&apos;t available in
            their region or account. Because it comes as a single install
            file, updates can be applied manually whenever a new version is
            published, giving you more control over when the app changes on your
            device. This approach is common across fantasy sports apps in India,
            where direct APK downloads are often the fastest way to get started.
          </p>
          <p>
            It also means you&apos;re not dependent on Play Store review delays
            or regional availability restrictions that sometimes affect fantasy
            sports apps. For users who&apos;ve used the platform before and just
            need to reinstall after switching phones, a direct download is
            usually the quickest way back into their existing account.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>Troubleshooting Common Installation Issues</h2>
          <p>
            If the Goplay 11 APK doesn&apos;t install on the first try, a few quick
            checks usually solve the problem. First, confirm that installation from
            unknown sources is enabled for the browser or file manager you used to
            download it — this setting is separate for each app on
            newer Android versions. Second, make sure the file
            finished downloading completely, since an interrupted download is one
            of the most common reasons an install fails. Third, restart your phone
            if the installer seems stuck, then try running it
            again. If none of these steps work, uninstalling any older version
            before reinstalling the app often clears the issue.
          </p>
          <p>
            An "app not installed" error usually points to a corrupted or
            incomplete download, so re-downloading the file from this page is
            the quickest fix. A "parse error" typically means the file was
            partially downloaded or the phone&apos;s storage ran out mid-install
            — clearing a bit more space and trying again generally resolves it.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container card">
          <h2>Keeping the App Updated</h2>
          <p>
            Because the Goplay 11 APK isn&apos;t tied to automatic Play Store
            updates, it&apos;s a good habit to check this page periodically for the
            newest build. Each new release may include bug fixes,
            performance improvements, or new contest formats, so staying on the
            latest version helps avoid glitches during live matches. Before
            installing an update, you don&apos;t need to remove the existing
            app — simply install the new file over the old one and your
            account data will remain intact.
          </p>
          <p>
            Check back periodically for announcements about upcoming feature
            releases or maintenance windows that might affect app availability
            during a major tournament.
          </p>
        </div>
      </section>

      <FaqList items={DOWNLOAD_FAQS} title="Download FAQs" />
    </>
  );
}
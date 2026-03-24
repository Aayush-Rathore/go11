import Link from "next/link";

import { RECOMMENDED_PLATFORM_URL, SITE_NAME } from "@/lib/site";

const QUICK_LINKS = [
  { href: "/download", label: "Download Goplay11 APK" },
  { href: "/apk", label: "Goplay11 APK Guide" },
  { href: "/how-to-play", label: "Play fantasy games online" },
  { href: "/referral-code", label: "Goplay11 referral code" },
  { href: "/blog", label: "Fantasy blog" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title">{SITE_NAME}</p>
          <p className="footer-copy">
            SEO-focused resource hub for Goplay11 app download, setup guides, and
            fantasy play strategies.
          </p>
        </div>

        <div>
          <p className="footer-title">Quick Links</p>
          <ul className="footer-list">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer-title">Recommended Platform</p>
          <p className="footer-copy">
            Explore{" "}
            <a href={RECOMMENDED_PLATFORM_URL} rel="noopener noreferrer" target="_blank">
              comegameapp.com
            </a>{" "}
            for more mobile gaming resources.
          </p>
          <p className="footer-note">
            Play responsibly. Fantasy gaming involves risk and should be used by
            eligible users only.
          </p>
        </div>
      </div>
    </footer>
  );
}


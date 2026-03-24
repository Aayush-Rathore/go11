import Link from "next/link";

import { AFFILIATE_LINK, NAV_LINKS } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-shell">
        <Link className="brand-mark" href="/">
          Goplay11 APK
        </Link>

        <nav aria-label="Primary navigation" className="top-nav">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} className="nav-link" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          className="btn btn-primary btn-compact"
          href={AFFILIATE_LINK}
          rel="noopener noreferrer"
          target="_blank"
        >
          Download APK
        </a>
      </div>
    </header>
  );
}


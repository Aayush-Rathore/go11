"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  AFFILIATE_LINK,
  AFFILIATE_REL,
  LOGO_PATH,
  NAV_LINKS,
  SITE_NAME,
} from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-shell">
        <div className="header-bar">
          <Link className="brand-mark" href="/goplay-11" onClick={closeMenu}>
            <Image
              alt="GoPlay11 APK — GoPlay11 logo"
              className="brand-logo"
              height={44}
              priority
              src={LOGO_PATH}
              width={44}
            />
            <span className="brand-text-wrap">
              <span className="brand-name">{SITE_NAME}</span>
              <span className="brand-tag">Fantasy Gaming Resource Hub</span>
            </span>
          </Link>

          <button
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            className="menu-toggle"
            onClick={() => setIsMenuOpen((value) => !value)}
            type="button"
          >
            <span className="menu-icon" aria-hidden="true">
              {isMenuOpen ? "✕" : "☰"}
            </span>
            <span className="menu-text">
              {isMenuOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Primary navigation"
          className={`top-nav${isMenuOpen ? " is-open" : ""}`}
          id="primary-navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`nav-link${
                pathname === link.href ? " is-active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile CTA Buttons */}
          <a
            className="btn btn-secondary btn-compact mobile-cta"
            href="https://web-in.comewindnet.com/en/affiliate-invited?c=WWWXXEWKFE&s=1"
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Download ComeAPK
          </a>

          <a
            className="btn btn-secondary btn-compact mobile-cta"
            href="https://rs9-in.rs9uniors.com/en/affiliate-invited?c=WWWXGXJBG&s=1"
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Download RS9 APK
          </a>

          <a
            className="btn btn-primary btn-compact mobile-cta"
            href={AFFILIATE_LINK}
            rel={AFFILIATE_REL}
            target="_blank"
          >
            Download GoPlay11 APK
          </a>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="header-actions">
          <a
            className="btn btn-primary btn-compact"
            href="https://web-in.comewindnet.com/en/affiliate-invited?c=WWWXXEWKFE&s=1"
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Download ComeAPK
          </a>

          <a
            className="btn btn-primary btn-compact"
            href="https://rs9-in.rs9uniors.com/en/affiliate-invited?c=WWWXGXJBG&s=1"
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Download RS9 APK
          </a>

          <a
            className="btn btn-primary btn-compact"
            href={AFFILIATE_LINK}
            rel={AFFILIATE_REL}
            target="_blank"
          >
            Download GoPlay11 APK
          </a>
        </div>
      </div>
    </header>
  );
}
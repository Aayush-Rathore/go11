"use client";

import Link from "next/link";
import { useState } from "react";

import { AFFILIATE_LINK, NAV_LINKS } from "@/lib/site";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-shell">
        <div className="header-bar">
          <Link className="brand-mark" href="/">
            Goplay11 APK
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
              {isMenuOpen ? "x" : "|||"}
            </span>
            <span className="menu-text">{isMenuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>

        <nav
          aria-label="Primary navigation"
          className={`top-nav${isMenuOpen ? " is-open" : ""}`}
          id="primary-navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="nav-link"
              href={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <a
            className="btn btn-primary btn-compact mobile-cta"
            href={AFFILIATE_LINK}
            rel="noopener noreferrer"
            target="_blank"
          >
            Download APK
          </a>
        </nav>

        <a
          className="btn btn-primary btn-compact header-cta"
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

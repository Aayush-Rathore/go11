import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyCta } from "@/components/sticky-cta";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  LONG_TAIL_KEYWORDS,
  PRIMARY_KEYWORDS,
  SECONDARY_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const GLOBAL_KEYWORDS = Array.from(
  new Set([...PRIMARY_KEYWORDS, ...SECONDARY_KEYWORDS, ...LONG_TAIL_KEYWORDS]),
);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Goplay11 APK",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: GLOBAL_KEYWORDS,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Goplay11 app download logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="site-body">
        <SiteHeader />
        <main className="site-main">{children}</main>
        <SiteFooter />
        <StickyCta />
      </body>
    </html>
  );
}

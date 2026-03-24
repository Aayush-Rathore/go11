import type { Metadata } from "next";

import {
  AFFILIATE_LINK,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  LONG_TAIL_KEYWORDS,
  PRIMARY_KEYWORDS,
  SECONDARY_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  type FaqItem,
} from "@/lib/site";

type MetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  openGraphType?: "website" | "article";
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type ArticleSchemaOptions = {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
};

const ALL_KEYWORDS = Array.from(
  new Set([...PRIMARY_KEYWORDS, ...SECONDARY_KEYWORDS, ...LONG_TAIL_KEYWORDS]),
);

function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${SITE_URL}${path}`;
  }

  return `${SITE_URL}/${path}`;
}

export function buildMetadata(options: MetadataOptions = {}): Metadata {
  const title = options.title ?? DEFAULT_TITLE;
  const description = options.description ?? DEFAULT_DESCRIPTION;
  const url = absoluteUrl(options.path ?? "/");
  const keywords = Array.from(new Set([...(options.keywords ?? []), ...ALL_KEYWORDS]));

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: options.openGraphType ?? "website",
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: "en_IN",
      images: [
        {
          url: `${SITE_URL}/logo.svg`,
          width: 512,
          height: 512,
          alt: "Goplay11 app download",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/logo.svg`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildSoftwareApplicationSchema(description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Goplay11 Fantasy App",
    applicationCategory: "GameApplication",
    operatingSystem: "Android",
    description,
    url: absoluteUrl(path),
    downloadUrl: AFFILIATE_LINK,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };
}

export function buildArticleSchema(options: ArticleSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    mainEntityOfPage: absoluteUrl(options.path),
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}


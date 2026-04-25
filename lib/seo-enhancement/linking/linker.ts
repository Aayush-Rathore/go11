/**
 * Internal Linking - Link Inventory and Relevance Scoring
 *
 * Builds a comprehensive inventory of all blog posts and site pages,
 * and provides relevance scoring for internal link opportunities.
 */

import type { BlogPost } from '@/lib/blog';
import type { LinkInventory, SitePage } from './types';

/**
 * Static inventory of key site pages with their keywords and purpose.
 */
const SITE_PAGES: SitePage[] = [
  {
    path: '/',
    title: 'GoPlay11 Home',
    keywords: ['goplay11', 'fantasy app', 'go play 11'],
    description: 'GoPlay11 fantasy gaming platform homepage',
  },
  {
    path: '/download',
    title: 'Download GoPlay11',
    keywords: ['download goplay11', 'goplay11 apk download', 'download apk'],
    description: 'Download the GoPlay11 APK',
  },
  {
    path: '/how-to-play',
    title: 'How to Play GoPlay11',
    keywords: ['how to play goplay11', 'fantasy tips', 'goplay11 guide'],
    description: 'Guide on how to play GoPlay11',
  },
  {
    path: '/login-register',
    title: 'Login or Register',
    keywords: ['goplay11 login', 'goplay11 register', 'sign up'],
    description: 'Login or register for GoPlay11',
  },
  {
    path: '/referral-code',
    title: 'GoPlay11 Referral Code',
    keywords: ['goplay11 referral code', 'referral bonus', 'invite code'],
    description: 'GoPlay11 referral code and bonus',
  },
  {
    path: '/goplay11-app-download',
    title: 'GoPlay11 App Download',
    keywords: ['goplay11 app download', 'install goplay11', 'goplay11 app'],
    description: 'GoPlay11 app download page',
  },
  {
    path: '/goplay11-fantasy-app',
    title: 'GoPlay11 Fantasy App',
    keywords: ['goplay11 fantasy app', 'fantasy gaming', 'goplay11 app'],
    description: 'GoPlay11 fantasy app overview',
  },
  {
    path: '/responsible-play',
    title: 'Responsible Play',
    keywords: ['responsible gaming', 'safe play', 'gaming limits'],
    description: 'Responsible gaming guidelines',
  },
  {
    path: '/contact',
    title: 'Contact GoPlay11',
    keywords: ['contact goplay11', 'support', 'help'],
    description: 'Contact GoPlay11 support',
  },
  {
    path: '/apk',
    title: 'GoPlay11 APK',
    keywords: ['goplay11 apk', 'apk download', 'android app'],
    description: 'GoPlay11 APK download page',
  },
];

/**
 * Extract topic words from a blog post's sections and keywords.
 *
 * Combines section headings, keywords, title, and description into a
 * deduplicated list of significant topic words (length > 3).
 */
function extractTopicsFromPost(post: BlogPost): string[] {
  const words = new Set<string>();

  // From keywords
  for (const kw of post.keywords) {
    for (const word of kw.toLowerCase().split(/\s+/)) {
      if (word.length > 3) words.add(word);
    }
  }

  // From title
  for (const word of post.title.toLowerCase().split(/\s+/)) {
    if (word.length > 3) words.add(word);
  }

  // From section headings
  for (const section of post.sections) {
    for (const word of section.heading.toLowerCase().split(/\s+/)) {
      if (word.length > 3) words.add(word);
    }
  }

  return Array.from(words);
}

/**
 * Build a comprehensive link inventory from all blog posts and site pages.
 *
 * @param allPosts - All blog posts in the site
 * @returns A LinkInventory containing blog post metadata and site page metadata
 */
export function buildLinkInventory(allPosts: BlogPost[]): LinkInventory {
  const blogPosts = allPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    keywords: post.keywords,
    topics: extractTopicsFromPost(post),
  }));

  const sitePages = SITE_PAGES.map((page) => ({
    path: page.path,
    title: page.title,
    keywords: page.keywords,
    purpose: page.description,
  }));

  return { blogPosts, sitePages };
}

/**
 * Tokenise a string into lowercase words, stripping HTML tags and punctuation.
 */
function tokenise(text: string): string[] {
  return text
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase()
    .split(/[\s,.\-!?;:()"']+/)
    .filter((w) => w.length > 0);
}

/**
 * Count how many of the target keywords appear in the source text.
 *
 * Each keyword phrase is checked as a substring of the normalised source.
 * Returns a value normalised to [0, 1].
 */
function countKeywordOverlap(sourceText: string, targetKeywords: string[]): number {
  if (targetKeywords.length === 0) return 0;

  const normalisedSource = sourceText.replace(/<[^>]*>/g, ' ').toLowerCase();
  let matches = 0;

  for (const kw of targetKeywords) {
    if (normalisedSource.includes(kw.toLowerCase())) {
      matches++;
    }
  }

  return matches / targetKeywords.length;
}

/**
 * Calculate topic similarity between source text and a set of topic words.
 *
 * Extracts significant words from the source and measures overlap with the
 * target topic words. Returns a value normalised to [0, 1].
 */
function calculateTopicSimilarity(sourceText: string, targetTopics: string[]): number {
  if (targetTopics.length === 0) return 0;

  const sourceWords = new Set(tokenise(sourceText).filter((w) => w.length > 3));
  if (sourceWords.size === 0) return 0;

  let matches = 0;
  for (const topic of targetTopics) {
    if (sourceWords.has(topic)) {
      matches++;
    }
  }

  // Normalise against the smaller set to avoid penalising rich targets
  const denominator = Math.min(targetTopics.length, sourceWords.size);
  return matches / denominator;
}

/**
 * Assess contextual fit: how naturally the target subject appears in the source.
 *
 * Checks whether any individual keyword token from the target appears in the
 * source text tokens. Returns a value normalised to [0, 1].
 */
function assessContextualFit(sourceText: string, targetKeywords: string[]): number {
  if (targetKeywords.length === 0) return 0;

  const sourceTokens = new Set(tokenise(sourceText));

  // Flatten all keyword tokens from the target
  const targetTokens = targetKeywords
    .flatMap((kw) => kw.toLowerCase().split(/\s+/))
    .filter((w) => w.length > 3);

  if (targetTokens.length === 0) return 0;

  const uniqueTargetTokens = [...new Set(targetTokens)];
  let matches = 0;
  for (const token of uniqueTargetTokens) {
    if (sourceTokens.has(token)) {
      matches++;
    }
  }

  return matches / uniqueTargetTokens.length;
}

/**
 * Generic phrases that should never be used as anchor text.
 */
const GENERIC_PHRASES = new Set([
  'click here',
  'read more',
  'learn more',
  'here',
  'this page',
  'this article',
  'this post',
  'more info',
  'more information',
  'find out more',
  'see more',
  'visit here',
]);

/**
 * Strip HTML tags from a string and normalise whitespace.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Return true if the candidate phrase is a generic anchor text that should be avoided.
 */
function isGenericPhrase(phrase: string): boolean {
  return GENERIC_PHRASES.has(phrase.toLowerCase().trim());
}

/**
 * Extract all overlapping word n-grams (3–6 words) from a text string.
 */
function extractNgrams(text: string, minWords = 3, maxWords = 6): string[] {
  const words = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const ngrams: string[] = [];
  for (let size = minWords; size <= maxWords; size++) {
    for (let i = 0; i <= words.length - size; i++) {
      ngrams.push(words.slice(i, i + size).join(' '));
    }
  }
  return ngrams;
}

/**
 * Trim a title to between minWords and maxWords words.
 */
function trimTitle(title: string, minWords = 3, maxWords = 6): string {
  const words = title.trim().split(/\s+/);
  if (words.length <= maxWords) {
    // Already within range; pad check: if too short, return as-is
    return words.join(' ');
  }
  return words.slice(0, maxWords).join(' ');
}

/**
 * Generate natural anchor text for an internal link.
 *
 * Strategy:
 * 1. Scan the source context for 3–6 word phrases that contain one of the
 *    target's keywords. Return the first such phrase that is not generic.
 * 2. If no keyword-containing phrase is found, fall back to the target's title
 *    trimmed to 3–6 words.
 * 3. Never return a generic phrase ("click here", "read more", etc.).
 * 4. Return plain text (no HTML tags).
 *
 * @param sourceContext - The surrounding paragraph or section text
 * @param target - The destination SitePage or BlogPost
 * @returns A 3–6 word anchor text string
 */
export function generateAnchorText(
  sourceContext: string,
  target: SitePage | BlogPost,
): string {
  const targetKeywords: string[] = target.keywords;
  const cleanContext = stripHtml(sourceContext).toLowerCase();

  // Try to find a natural phrase in the context that contains a target keyword
  const ngrams = extractNgrams(sourceContext);
  for (const ngram of ngrams) {
    const cleanNgram = stripHtml(ngram);
    if (isGenericPhrase(cleanNgram)) continue;

    const lowerNgram = cleanNgram.toLowerCase();
    const containsKeyword = targetKeywords.some((kw) =>
      lowerNgram.includes(kw.toLowerCase()),
    );

    if (containsKeyword) {
      return cleanNgram;
    }
  }

  // Fallback: use the target title trimmed to 3–6 words
  const title = target.title;
  const trimmed = trimTitle(title);
  if (!isGenericPhrase(trimmed)) {
    return trimmed;
  }

  // Last resort: return the raw title (shouldn't normally be generic)
  return title;
}

/**
 * Calculate a relevance score between a source context string and a target page or post.
 *
 * Scoring formula:
 *   score = (keywordOverlap × 0.4) + (topicSimilarity × 0.4) + (contextualFit × 0.2)
 *
 * @param sourceContext - The paragraph or section text being evaluated
 * @param target - A SitePage or BlogPost to score against
 * @returns A relevance score in the range [0, 1]
 *
 * @example
 * const score = calculateRelevanceScore(
 *   'Download the GoPlay11 APK from a trusted source.',
 *   { path: '/download', title: 'Download GoPlay11', keywords: ['download goplay11', 'goplay11 apk download'], description: '...' }
 * );
 * // Returns a high score because the context directly mentions download and APK
 */
export function calculateRelevanceScore(
  sourceContext: string,
  target: SitePage | BlogPost,
): number {
  // Resolve keywords and topics depending on whether target is a SitePage or BlogPost
  let targetKeywords: string[];
  let targetTopics: string[];

  if ('path' in target) {
    // SitePage
    targetKeywords = target.keywords;
    // Derive topics from keywords + title words
    targetTopics = [
      ...target.keywords.flatMap((kw) =>
        kw.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
      ),
      ...target.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
    ];
    // Deduplicate
    targetTopics = [...new Set(targetTopics)];
  } else {
    // BlogPost
    targetKeywords = target.keywords;
    targetTopics = extractTopicsFromPost(target);
  }

  const keywordOverlap = countKeywordOverlap(sourceContext, targetKeywords);
  const topicSimilarity = calculateTopicSimilarity(sourceContext, targetTopics);
  const contextualFit = assessContextualFit(sourceContext, targetKeywords);

  return keywordOverlap * 0.4 + topicSimilarity * 0.4 + contextualFit * 0.2;
}

// ---------------------------------------------------------------------------
// Task 5.3 – Link insertion logic
// Validates: Requirements 3.1, 3.5, 3.6, 3.7
// ---------------------------------------------------------------------------

import type { LinkableContent, LinkOpportunity, LinkedBlogPost } from './types';

/**
 * Identify candidate link insertion points across all sections of a post.
 *
 * Algorithm:
 * 1. For each paragraph in each section, score it against every site page and
 *    blog post (excluding the current post itself).
 * 2. Collect the top-5 scoring targets for each paragraph (not just the best),
 *    so that when the best target is maxed out at 3 links, we can fall back to
 *    the next-best target for that paragraph.
 * 3. Select up to `targetCount` opportunities, distributed across sections,
 *    respecting a maximum of 3 links per target URL.
 *
 * @param content - The post to link from, plus all posts and site pages
 * @param targetCount - Desired number of link opportunities (e.g. 22)
 * @returns Array of LinkOpportunity objects, sorted by section then paragraph
 */
export function identifyLinkOpportunities(
  content: LinkableContent,
  targetCount: number,
): LinkOpportunity[] {
  const { post, allPosts, sitePages } = content;

  // Build the pool of link targets (exclude the current post)
  const blogTargets = allPosts.filter((p) => p.slug !== post.slug);

  // Collect all candidates: top-5 targets per paragraph for diversity
  interface Candidate {
    sectionIndex: number;
    paragraphIndex: number;
    targetUrl: string;
    anchorText: string;
    relevanceScore: number;
    sourceText: string;
  }

  const candidates: Candidate[] = [];

  for (let si = 0; si < post.sections.length; si++) {
    const section = post.sections[si];
    for (let pi = 0; pi < section.paragraphs.length; pi++) {
      const paragraph = section.paragraphs[pi];
      if (!paragraph.trim()) continue;

      // Score all targets and collect top-5 per paragraph
      const scored: Array<{ url: string; anchor: string; score: number }> = [];

      // Score against site pages
      for (const page of sitePages) {
        const score = calculateRelevanceScore(paragraph, page);
        if (score > 0) {
          scored.push({ url: page.path, anchor: generateAnchorText(paragraph, page), score });
        }
      }

      // Score against other blog posts
      for (const target of blogTargets) {
        const score = calculateRelevanceScore(paragraph, target);
        if (score > 0) {
          scored.push({ url: `/blog/${target.slug}`, anchor: generateAnchorText(paragraph, target), score });
        }
      }

      // Sort by score descending and take top 5
      scored.sort((a, b) => b.score - a.score);
      const top5 = scored.slice(0, 5);

      for (const item of top5) {
        candidates.push({
          sectionIndex: si,
          paragraphIndex: pi,
          targetUrl: item.url,
          anchorText: item.anchor,
          relevanceScore: item.score,
          sourceText: paragraph,
        });
      }
    }
  }

  // Sort candidates by relevance score descending
  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Select up to targetCount opportunities, respecting max 3 per URL and
  // distributing across sections. Each (section, paragraph) pair can only
  // be used once.
  const urlCounts = new Map<string, number>();
  const sectionCounts = new Map<number, number>();
  const usedParagraphs = new Set<string>(); // "si:pi" keys
  const selected: Candidate[] = [];

  // Two passes: first fill sections evenly, then top up with best remaining
  const sectionCount = post.sections.length;
  const perSection = sectionCount > 0 ? Math.ceil(targetCount / sectionCount) : targetCount;

  // Pass 1: try to get `perSection` links per section
  for (const candidate of candidates) {
    if (selected.length >= targetCount) break;
    const urlCount = urlCounts.get(candidate.targetUrl) ?? 0;
    if (urlCount >= 3) continue;
    const secCount = sectionCounts.get(candidate.sectionIndex) ?? 0;
    if (secCount >= perSection) continue;
    const paraKey = `${candidate.sectionIndex}:${candidate.paragraphIndex}`;
    if (usedParagraphs.has(paraKey)) continue;

    selected.push(candidate);
    urlCounts.set(candidate.targetUrl, urlCount + 1);
    sectionCounts.set(candidate.sectionIndex, secCount + 1);
    usedParagraphs.add(paraKey);
  }

  // Pass 2: top up to targetCount with remaining high-relevance candidates
  for (const candidate of candidates) {
    if (selected.length >= targetCount) break;
    const urlCount = urlCounts.get(candidate.targetUrl) ?? 0;
    if (urlCount >= 3) continue;
    const paraKey = `${candidate.sectionIndex}:${candidate.paragraphIndex}`;
    if (usedParagraphs.has(paraKey)) continue;

    selected.push(candidate);
    urlCounts.set(candidate.targetUrl, urlCount + 1);
    const secCount = sectionCounts.get(candidate.sectionIndex) ?? 0;
    sectionCounts.set(candidate.sectionIndex, secCount + 1);
    usedParagraphs.add(paraKey);
  }
  // Sort final selection by section then paragraph for deterministic output
  selected.sort((a, b) =>
    a.sectionIndex !== b.sectionIndex
      ? a.sectionIndex - b.sectionIndex
      : a.paragraphIndex - b.paragraphIndex,
  );

  return selected.map((c) => ({
    sourceText: c.sourceText,
    targetUrl: c.targetUrl,
    anchorText: c.anchorText,
    relevanceScore: c.relevanceScore,
    sectionIndex: c.sectionIndex,
    paragraphIndex: c.paragraphIndex,
  }));
}

// ---------------------------------------------------------------------------
// Task 5.4 – Link distribution validation
// Validates: Requirements 3.5, 3.9
// ---------------------------------------------------------------------------

const KEY_PAGES = new Set([
  '/',
  '/download',
  '/how-to-play',
  '/login-register',
  '/referral-code',
  '/goplay11-app-download',
  '/goplay11-fantasy-app',
]);

const SUPPORTING_PAGES = new Set(['/responsible-play', '/contact', '/apk']);

/**
 * Count words in a plain-text string (HTML tags stripped).
 */
function countWords(text: string): number {
  return text
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/**
 * Validate the link distribution of a LinkedBlogPost.
 *
 * Checks:
 * 1. No single section holds > 50% of all links.
 * 2. Blog links (/blog/*) are 40–50% of total links.
 * 3. Key page links are 30–40% of total links.
 * 4. Supporting page links are 10–20% of total links.
 * 5. No two links appear within 50 words of each other in the same paragraph.
 *
 * @param post - A LinkedBlogPost produced by insertLinks()
 * @returns { valid: boolean; issues: string[] }
 */
export function validateLinkDistribution(
  post: LinkedBlogPost,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const { totalLinks } = post.linkingMetadata;

  // A post with no links is considered valid
  if (totalLinks === 0) {
    return { valid: true, issues: [] };
  }

  // ── 1. Section distribution: no section > 50% of all links ──────────────
  for (const [heading, count] of post.linkingMetadata.linkDistribution) {
    const pct = count / totalLinks;
    if (pct > 0.5) {
      issues.push(
        `Section "${heading}" contains ${count} of ${totalLinks} links (${Math.round(pct * 100)}%), exceeding the 50% maximum per section.`,
      );
    }
  }

  // ── 2–4. Link-type ratios ────────────────────────────────────────────────
  // Count each category by scanning the inserted <a> tags in the sections
  let blogLinkCount = 0;
  let keyPageCount = 0;
  let supportingPageCount = 0;

  for (const section of post.sections) {
    for (const paragraph of section.paragraphs) {
      const hrefMatches = [...paragraph.matchAll(/href="([^"]+)"/g)];
      for (const m of hrefMatches) {
        const href = m[1];
        if (href.startsWith('/blog/')) {
          blogLinkCount++;
        } else if (KEY_PAGES.has(href)) {
          keyPageCount++;
        } else if (SUPPORTING_PAGES.has(href)) {
          supportingPageCount++;
        }
      }
    }
  }

  const blogPct = blogLinkCount / totalLinks;
  const keyPct = keyPageCount / totalLinks;
  const supportingPct = supportingPageCount / totalLinks;

  if (blogPct < 0.4 || blogPct > 0.5) {
    issues.push(
      `Blog links are ${Math.round(blogPct * 100)}% of total links (${blogLinkCount}/${totalLinks}); expected 40–50%.`,
    );
  }

  if (keyPct < 0.3 || keyPct > 0.4) {
    issues.push(
      `Key page links are ${Math.round(keyPct * 100)}% of total links (${keyPageCount}/${totalLinks}); expected 30–40%.`,
    );
  }

  if (supportingPct < 0.1 || supportingPct > 0.2) {
    issues.push(
      `Supporting page links are ${Math.round(supportingPct * 100)}% of total links (${supportingPageCount}/${totalLinks}); expected 10–20%.`,
    );
  }

  // ── 5. Proximity check: no two links within 50 words in the same paragraph
  for (const section of post.sections) {
    for (const paragraph of section.paragraphs) {
      // Split paragraph on <a ...>...</a> boundaries to measure word gaps
      const parts = paragraph.split(/(<a\b[^>]*>.*?<\/a>)/);
      // parts alternates: text, link, text, link, ...
      // We only care about the text segments between consecutive links
      let prevLinkAnchor: string | null = null;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (/<a\b/.test(part)) {
          if (prevLinkAnchor !== null) {
            // The text between the previous link and this one is parts[i-1]
            const between = parts[i - 1] ?? '';
            const wordsBetween = countWords(between);
            if (wordsBetween < 50) {
              issues.push(
                `Two links are only ${wordsBetween} word(s) apart in a paragraph of section "${section.heading}" (minimum 50 words required between links).`,
              );
            }
          }
          prevLinkAnchor = part;
        }
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Insert internal links into a blog post based on pre-computed opportunities.
 *
 * For each opportunity the anchor text is located inside the target paragraph
 * and wrapped with `<a class="text-link" href="...">...</a>`.
 *
 * Rules enforced:
 * - Maximum 3 links to the same target URL (opportunities already filtered,
 *   but we double-check here for safety).
 * - Links are distributed across sections (tracked in linkDistribution).
 *
 * @param post - The source BlogPost
 * @param opportunities - Pre-computed link opportunities
 * @returns A LinkedBlogPost with updated sections and linkingMetadata
 */
export function insertLinks(
  post: BlogPost,
  opportunities: LinkOpportunity[],
): LinkedBlogPost {
  // Deep-clone sections so we don't mutate the original post
  const sections = post.sections.map((section) => ({
    ...section,
    paragraphs: [...section.paragraphs],
  }));

  const urlCounts = new Map<string, number>();
  const linkDistribution = new Map<string, number>(); // sectionHeading -> count
  let blogLinks = 0;
  let pageLinks = 0;
  let totalLinks = 0;

  for (const opp of opportunities) {
    // Enforce max 3 per URL
    const urlCount = urlCounts.get(opp.targetUrl) ?? 0;
    if (urlCount >= 3) continue;

    const section = sections[opp.sectionIndex];
    if (!section) continue;
    const paragraph = section.paragraphs[opp.paragraphIndex];
    if (paragraph === undefined) continue;

    // Find the anchor text in the paragraph (case-insensitive search)
    const anchorRegex = new RegExp(
      opp.anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i',
    );

    let linked: string;
    if (anchorRegex.test(paragraph)) {
      // Replace only the first occurrence to avoid double-linking
      linked = paragraph.replace(
        anchorRegex,
        `<a class="text-link" href="${opp.targetUrl}">${opp.anchorText}</a>`,
      );
    } else {
      // Anchor text not found verbatim — append a contextual sentence with the link
      linked =
        paragraph +
        ` For more information, see <a class="text-link" href="${opp.targetUrl}">${opp.anchorText}</a>.`;
    }

    section.paragraphs[opp.paragraphIndex] = linked;

    // Update counts
    urlCounts.set(opp.targetUrl, urlCount + 1);
    totalLinks++;

    const isBlogLink = opp.targetUrl.startsWith('/blog/');
    if (isBlogLink) {
      blogLinks++;
    } else {
      pageLinks++;
    }

    const heading = section.heading;
    linkDistribution.set(heading, (linkDistribution.get(heading) ?? 0) + 1);
  }

  const sectionCount = sections.length;
  const averageLinksPerSection = sectionCount > 0 ? totalLinks / sectionCount : 0;

  return {
    ...post,
    sections,
    linkingMetadata: {
      totalLinks,
      blogLinks,
      pageLinks,
      linkDistribution,
      averageLinksPerSection,
    },
  };
}

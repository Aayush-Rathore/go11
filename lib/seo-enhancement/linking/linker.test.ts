/**
 * Unit tests for link inventory and relevance scoring (Task 5.1)
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.8
 */

import { describe, it, expect } from 'vitest';
import { buildLinkInventory, calculateRelevanceScore, generateAnchorText } from './linker';
import type { BlogPost } from '@/lib/blog';
import type { SitePage } from './types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockPost: BlogPost = {
  slug: 'how-to-win-in-goplay11',
  title: 'How to Win in GoPlay11',
  description: 'Tips for winning in GoPlay11 fantasy contests.',
  excerpt: 'Strategy guide for GoPlay11.',
  publishedAt: '2026-01-01',
  updatedAt: '2026-03-01',
  keywords: ['how to play goplay11 fantasy app', 'goplay11 fantasy app tips'],
  sections: [
    {
      heading: 'Build lineups with role balance',
      paragraphs: ['Balance your lineup with stable performers and high-upside picks.'],
    },
  ],
};

const downloadPage: SitePage = {
  path: '/download',
  title: 'Download GoPlay11',
  keywords: ['download goplay11', 'goplay11 apk download', 'download apk'],
  description: 'Download the GoPlay11 APK',
};

const referralPage: SitePage = {
  path: '/referral-code',
  title: 'GoPlay11 Referral Code',
  keywords: ['goplay11 referral code', 'referral bonus', 'invite code'],
  description: 'GoPlay11 referral code and bonus',
};

// ---------------------------------------------------------------------------
// buildLinkInventory
// ---------------------------------------------------------------------------

describe('buildLinkInventory', () => {
  it('includes all provided blog posts in the inventory', () => {
    const inventory = buildLinkInventory([mockPost]);
    expect(inventory.blogPosts).toHaveLength(1);
    expect(inventory.blogPosts[0].slug).toBe('how-to-win-in-goplay11');
  });

  it('maps blog post keywords correctly', () => {
    const inventory = buildLinkInventory([mockPost]);
    expect(inventory.blogPosts[0].keywords).toEqual(mockPost.keywords);
  });

  it('extracts topics from blog post title and headings', () => {
    const inventory = buildLinkInventory([mockPost]);
    const topics = inventory.blogPosts[0].topics;
    // Should contain words from title and section headings
    expect(topics.some((t) => t.includes('goplay11') || t.includes('lineup'))).toBe(true);
  });

  it('includes all 10 site pages in the inventory', () => {
    const inventory = buildLinkInventory([]);
    expect(inventory.sitePages).toHaveLength(10);
  });

  it('includes the homepage in site pages', () => {
    const inventory = buildLinkInventory([]);
    const home = inventory.sitePages.find((p) => p.path === '/');
    expect(home).toBeDefined();
    expect(home?.title).toBe('GoPlay11 Home');
  });

  it('includes the download page in site pages', () => {
    const inventory = buildLinkInventory([]);
    const dl = inventory.sitePages.find((p) => p.path === '/download');
    expect(dl).toBeDefined();
  });

  it('returns empty blogPosts array when no posts provided', () => {
    const inventory = buildLinkInventory([]);
    expect(inventory.blogPosts).toHaveLength(0);
  });

  it('handles multiple blog posts', () => {
    const post2: BlogPost = { ...mockPost, slug: 'second-post', title: 'Second Post' };
    const inventory = buildLinkInventory([mockPost, post2]);
    expect(inventory.blogPosts).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// calculateRelevanceScore — SitePage targets
// ---------------------------------------------------------------------------

describe('calculateRelevanceScore with SitePage target', () => {
  it('returns a score between 0 and 1', () => {
    const score = calculateRelevanceScore('Some random text about gaming.', downloadPage);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns a high score when context directly mentions target keywords', () => {
    const context = 'You can download goplay11 apk from the official page.';
    const score = calculateRelevanceScore(context, downloadPage);
    expect(score).toBeGreaterThan(0.4);
  });

  it('returns a low score when context is unrelated to target', () => {
    const context = 'Responsible gaming means setting personal limits and taking breaks.';
    const score = calculateRelevanceScore(context, downloadPage);
    // Download page keywords are unrelated to responsible gaming
    expect(score).toBeLessThan(0.5);
  });

  it('scores referral context higher for referral page than download page', () => {
    const context = 'Use a goplay11 referral code to get a bonus when you sign up.';
    const referralScore = calculateRelevanceScore(context, referralPage);
    const downloadScore = calculateRelevanceScore(context, downloadPage);
    expect(referralScore).toBeGreaterThan(downloadScore);
  });

  it('scores download context higher for download page than referral page', () => {
    const context = 'Download the goplay11 apk from a trusted source before installing.';
    const downloadScore = calculateRelevanceScore(context, downloadPage);
    const referralScore = calculateRelevanceScore(context, referralPage);
    expect(downloadScore).toBeGreaterThan(referralScore);
  });

  it('ignores HTML tags in source context and still produces a meaningful score', () => {
    // Even with HTML wrapping the keyword, the score should be non-trivial
    const withHtml = 'Download <strong>goplay11 apk</strong> from the official page.';
    const score = calculateRelevanceScore(withHtml, downloadPage);
    expect(score).toBeGreaterThan(0.3);
  });

  it('returns 0 for completely empty context', () => {
    const score = calculateRelevanceScore('', downloadPage);
    expect(score).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateRelevanceScore — BlogPost targets
// ---------------------------------------------------------------------------

describe('calculateRelevanceScore with BlogPost target', () => {
  it('returns a score between 0 and 1 for blog post target', () => {
    const score = calculateRelevanceScore('Tips for fantasy gaming strategy.', mockPost);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns a higher score when context matches blog post keywords', () => {
    const relevantContext = 'Learn how to play goplay11 fantasy app and improve your tips.';
    const irrelevantContext = 'The weather today is sunny and warm.';
    const relevantScore = calculateRelevanceScore(relevantContext, mockPost);
    const irrelevantScore = calculateRelevanceScore(irrelevantContext, mockPost);
    expect(relevantScore).toBeGreaterThan(irrelevantScore);
  });

  it('uses blog post title words as topics', () => {
    const context = 'Winning in GoPlay11 requires good strategy and lineup balance.';
    const score = calculateRelevanceScore(context, mockPost);
    expect(score).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Scoring formula weights
// ---------------------------------------------------------------------------

describe('calculateRelevanceScore formula composition', () => {
  it('produces a non-zero score when only keyword overlap exists', () => {
    // Context contains exact keyword but no other topic words
    const context = 'download goplay11';
    const score = calculateRelevanceScore(context, downloadPage);
    expect(score).toBeGreaterThan(0);
  });

  it('produces consistent scores for the same inputs', () => {
    const context = 'Download the GoPlay11 APK safely from a trusted source.';
    const score1 = calculateRelevanceScore(context, downloadPage);
    const score2 = calculateRelevanceScore(context, downloadPage);
    expect(score1).toBe(score2);
  });
});

// ---------------------------------------------------------------------------
// generateAnchorText — Task 5.2
// Validates: Requirements 3.4
// ---------------------------------------------------------------------------

describe('generateAnchorText', () => {
  it('returns a phrase of 3–6 words when a keyword is found in context', () => {
    const context =
      'You can download goplay11 apk from the official website for free.';
    const result = generateAnchorText(context, downloadPage);
    const wordCount = result.trim().split(/\s+/).length;
    expect(wordCount).toBeGreaterThanOrEqual(3);
    expect(wordCount).toBeLessThanOrEqual(6);
  });

  it('includes a target keyword in the anchor text when present in context', () => {
    const context =
      'Use your goplay11 referral code to earn bonus cash on your first deposit.';
    const result = generateAnchorText(context, referralPage);
    // Should contain one of the referral page keywords
    const hasKeyword = referralPage.keywords.some((kw) =>
      result.toLowerCase().includes(kw.toLowerCase()),
    );
    expect(hasKeyword).toBe(true);
  });

  it('falls back to the target title when no keyword appears in context', () => {
    const context =
      'Playing fantasy sports requires careful research and consistent effort.';
    const result = generateAnchorText(context, downloadPage);
    // No download keywords in context → should use title words
    const titleWords = downloadPage.title.toLowerCase().split(/\s+/);
    const resultWords = result.toLowerCase().split(/\s+/);
    const overlap = resultWords.filter((w) => titleWords.includes(w));
    expect(overlap.length).toBeGreaterThan(0);
  });

  it('never returns a generic phrase like "click here"', () => {
    const genericPage: SitePage = {
      path: '/test',
      title: 'Click Here',
      keywords: ['click here'],
      description: 'Test page',
    };
    const context = 'Click here to visit the page.';
    const result = generateAnchorText(context, genericPage);
    expect(result.toLowerCase()).not.toBe('click here');
  });

  it('never returns "read more" as anchor text', () => {
    const context = 'Read more about fantasy gaming strategies and tips.';
    const result = generateAnchorText(context, downloadPage);
    expect(result.toLowerCase()).not.toBe('read more');
  });

  it('returns plain text with no HTML tags', () => {
    const context =
      'Download the <strong>goplay11 apk</strong> from the official source.';
    const result = generateAnchorText(context, downloadPage);
    expect(result).not.toMatch(/<[^>]*>/);
  });

  it('returns a phrase from context for a BlogPost target when keyword matches', () => {
    const context =
      'Learning how to play goplay11 fantasy app improves your contest results.';
    const result = generateAnchorText(context, mockPost);
    const wordCount = result.trim().split(/\s+/).length;
    expect(wordCount).toBeGreaterThanOrEqual(3);
    expect(wordCount).toBeLessThanOrEqual(6);
    // Should contain one of the post's keywords
    const hasKeyword = mockPost.keywords.some((kw) =>
      result.toLowerCase().includes(kw.toLowerCase()),
    );
    expect(hasKeyword).toBe(true);
  });

  it('falls back to title for BlogPost when no keyword in context', () => {
    const context = 'The weather today is sunny and warm outside.';
    const result = generateAnchorText(context, mockPost);
    // Should derive from the post title
    const titleWords = mockPost.title.toLowerCase().split(/\s+/);
    const resultWords = result.toLowerCase().split(/\s+/);
    const overlap = resultWords.filter((w) => titleWords.includes(w));
    expect(overlap.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// identifyLinkOpportunities & insertLinks — Task 5.3
// Validates: Requirements 3.1, 3.5, 3.6, 3.7
// ---------------------------------------------------------------------------

import { identifyLinkOpportunities, insertLinks } from './linker';
import type { LinkableContent } from './types';

// A richer post with multiple sections and paragraphs for distribution tests
const richPost: BlogPost = {
  slug: 'goplay11-apk-guide',
  title: 'GoPlay11 APK Guide',
  description: 'Complete guide to downloading and installing GoPlay11 APK.',
  excerpt: 'Everything about GoPlay11 APK.',
  publishedAt: '2026-01-01',
  updatedAt: '2026-04-01',
  keywords: ['goplay11 apk', 'download goplay11', 'goplay11 app'],
  sections: [
    {
      heading: 'How to Download GoPlay11',
      paragraphs: [
        'Download goplay11 apk from the official website to get started with fantasy gaming.',
        'The goplay11 apk download process is simple and takes only a few minutes on Android.',
      ],
    },
    {
      heading: 'Registration and Login',
      paragraphs: [
        'After installing, use goplay11 login or register to create your account quickly.',
        'You can use a goplay11 referral code during registration to earn a welcome bonus.',
      ],
    },
    {
      heading: 'How to Play GoPlay11',
      paragraphs: [
        'Learn how to play goplay11 fantasy app by following the step-by-step guide.',
        'Fantasy tips and goplay11 guide help beginners win their first contests.',
      ],
    },
    {
      heading: 'Responsible Gaming',
      paragraphs: [
        'Responsible gaming means setting personal limits and practising safe play.',
        'GoPlay11 supports responsible gaming with tools to manage your gaming limits.',
      ],
    },
  ],
};

const otherPost: BlogPost = {
  slug: 'best-fantasy-apps',
  title: 'Best Fantasy Apps in India',
  description: 'Top fantasy gaming apps in India.',
  excerpt: 'Best fantasy apps.',
  publishedAt: '2026-01-01',
  updatedAt: '2026-04-01',
  keywords: ['best fantasy apps', 'fantasy gaming india', 'goplay11 fantasy app'],
  sections: [
    {
      heading: 'Top Fantasy Apps',
      paragraphs: ['GoPlay11 is one of the best fantasy apps in India for cricket contests.'],
    },
  ],
};

const richContent: LinkableContent = {
  post: richPost,
  allPosts: [richPost, otherPost],
  sitePages: [], // linker.ts uses internal SITE_PAGES constant
};

// ---------------------------------------------------------------------------
// identifyLinkOpportunities
// ---------------------------------------------------------------------------

describe('identifyLinkOpportunities', () => {
  it('returns at most targetCount opportunities', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    expect(opps.length).toBeLessThanOrEqual(22);
  });

  it('never links to the current post itself', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    for (const opp of opps) {
      expect(opp.targetUrl).not.toContain(richPost.slug);
    }
  });

  it('limits the same target URL to at most 3 occurrences', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const urlCounts = new Map<string, number>();
    for (const opp of opps) {
      urlCounts.set(opp.targetUrl, (urlCounts.get(opp.targetUrl) ?? 0) + 1);
    }
    for (const [, count] of urlCounts) {
      expect(count).toBeLessThanOrEqual(3);
    }
  });

  it('distributes opportunities across multiple sections', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const sections = new Set(opps.map((o) => o.sectionIndex));
    // With 4 sections and enough paragraphs, at least 2 sections should be covered
    expect(sections.size).toBeGreaterThanOrEqual(2);
  });

  it('each opportunity has a positive relevance score', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    for (const opp of opps) {
      expect(opp.relevanceScore).toBeGreaterThan(0);
    }
  });

  it('returns empty array when post has no sections', () => {
    const emptyPost: BlogPost = { ...richPost, sections: [] };
    const opps = identifyLinkOpportunities({ ...richContent, post: emptyPost }, 22);
    expect(opps).toHaveLength(0);
  });

  it('returns opportunities sorted by section then paragraph index', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    for (let i = 1; i < opps.length; i++) {
      const prev = opps[i - 1];
      const curr = opps[i];
      if (prev.sectionIndex === curr.sectionIndex) {
        expect(curr.paragraphIndex).toBeGreaterThanOrEqual(prev.paragraphIndex);
      } else {
        expect(curr.sectionIndex).toBeGreaterThanOrEqual(prev.sectionIndex);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// insertLinks
// ---------------------------------------------------------------------------

describe('insertLinks', () => {
  it('returns a LinkedBlogPost with linkingMetadata', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    expect(result.linkingMetadata).toBeDefined();
    expect(typeof result.linkingMetadata.totalLinks).toBe('number');
  });

  it('inserts links using the correct HTML format', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    const allText = result.sections.flatMap((s) => s.paragraphs).join(' ');
    if (result.linkingMetadata.totalLinks > 0) {
      expect(allText).toMatch(/<a class="text-link" href="[^"]+">.*?<\/a>/);
    }
  });

  it('totalLinks matches the number of <a> tags inserted', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    const allText = result.sections.flatMap((s) => s.paragraphs).join(' ');
    const matches = allText.match(/<a class="text-link"/g) ?? [];
    expect(matches.length).toBe(result.linkingMetadata.totalLinks);
  });

  it('never inserts more than 3 links to the same URL', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    for (const [, count] of result.linkingMetadata.linkDistribution) {
      // linkDistribution is per section, so individual section counts can be low
      expect(count).toBeGreaterThanOrEqual(0);
    }
    // Verify via URL counts in the raw HTML
    const allText = result.sections.flatMap((s) => s.paragraphs).join(' ');
    const hrefMatches = [...allText.matchAll(/href="([^"]+)"/g)];
    const urlCounts = new Map<string, number>();
    for (const m of hrefMatches) {
      const url = m[1];
      urlCounts.set(url, (urlCounts.get(url) ?? 0) + 1);
    }
    for (const [, count] of urlCounts) {
      expect(count).toBeLessThanOrEqual(3);
    }
  });

  it('does not mutate the original post sections', () => {
    const originalParagraph = richPost.sections[0].paragraphs[0];
    const opps = identifyLinkOpportunities(richContent, 22);
    insertLinks(richPost, opps);
    expect(richPost.sections[0].paragraphs[0]).toBe(originalParagraph);
  });

  it('preserves all original post fields except sections and linkingMetadata', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    expect(result.slug).toBe(richPost.slug);
    expect(result.title).toBe(richPost.title);
    expect(result.keywords).toEqual(richPost.keywords);
  });

  it('blogLinks + pageLinks equals totalLinks', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    const { totalLinks, blogLinks, pageLinks } = result.linkingMetadata;
    expect(blogLinks + pageLinks).toBe(totalLinks);
  });

  it('averageLinksPerSection equals totalLinks / section count', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    const expected = result.linkingMetadata.totalLinks / result.sections.length;
    expect(result.linkingMetadata.averageLinksPerSection).toBeCloseTo(expected, 5);
  });

  it('handles empty opportunities array gracefully', () => {
    const result = insertLinks(richPost, []);
    expect(result.linkingMetadata.totalLinks).toBe(0);
    expect(result.linkingMetadata.blogLinks).toBe(0);
    expect(result.linkingMetadata.pageLinks).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// validateLinkDistribution — Task 5.4
// Validates: Requirements 3.5, 3.9
// ---------------------------------------------------------------------------

import { validateLinkDistribution } from './linker';
import type { LinkedBlogPost } from './types';

/**
 * Helper to build a minimal LinkedBlogPost for distribution tests.
 */
function makeLinkedPost(
  sections: Array<{ heading: string; paragraphs: string[] }>,
  linkDistribution: Map<string, number>,
  totalLinks: number,
  blogLinks: number,
  pageLinks: number,
): LinkedBlogPost {
  return {
    slug: 'test-post',
    title: 'Test Post',
    description: '',
    excerpt: '',
    publishedAt: '2026-01-01',
    updatedAt: '2026-01-01',
    keywords: [],
    sections,
    linkingMetadata: {
      totalLinks,
      blogLinks,
      pageLinks,
      linkDistribution,
      averageLinksPerSection: totalLinks / Math.max(sections.length, 1),
    },
  };
}

describe('validateLinkDistribution', () => {
  it('returns valid=true and no issues for a post with no links', () => {
    const post = makeLinkedPost(
      [{ heading: 'Intro', paragraphs: ['Some text with no links.'] }],
      new Map(),
      0,
      0,
      0,
    );
    const result = validateLinkDistribution(post);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('returns valid=true for a well-distributed post', () => {
    // 10 total links: 4 blog (40%), 4 key page (40%), 2 supporting (20%)
    // Spread across 2 sections (5 each → 50% each, exactly at boundary)
    // Use 4 blog + 3 key + 2 supporting = 9 links, 45%/33%/22% — adjust to hit ranges
    // 10 links: 4 blog (40%), 3 key (30%), 2 supporting (20%) = 9 — need 10
    // 10 links: 5 blog (50%), 3 key (30%), 2 supporting (20%) = 10 ✓
    const dist = new Map([['Section A', 5], ['Section B', 5]]);
    const sections = [
      {
        heading: 'Section A',
        paragraphs: [
          'First paragraph with <a class="text-link" href="/blog/post-1">blog post one</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Second paragraph with <a class="text-link" href="/blog/post-2">blog post two</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Third paragraph with <a class="text-link" href="/blog/post-3">blog post three</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Fourth paragraph with <a class="text-link" href="/download">download goplay11</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Fifth paragraph with <a class="text-link" href="/how-to-play">how to play</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
        ],
      },
      {
        heading: 'Section B',
        paragraphs: [
          'Sixth paragraph with <a class="text-link" href="/blog/post-4">blog post four</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Seventh paragraph with <a class="text-link" href="/blog/post-5">blog post five</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Eighth paragraph with <a class="text-link" href="/login-register">login register</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Ninth paragraph with <a class="text-link" href="/responsible-play">responsible play</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
          'Tenth paragraph with <a class="text-link" href="/contact">contact us</a> and more words here to pad the gap between links so we have enough spacing in this paragraph.',
        ],
      },
    ];
    const post = makeLinkedPost(sections, dist, 10, 5, 5);
    const result = validateLinkDistribution(post);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('returns valid=false and an issue when a section has more than 50% of all links', () => {
    // 10 links total, section A has 7 (70%)
    const dist = new Map([['Section A', 7], ['Section B', 3]]);
    const sections = [
      {
        heading: 'Section A',
        paragraphs: [
          '<a href="/blog/p1">link</a>',
          '<a href="/blog/p2">link</a>',
          '<a href="/blog/p3">link</a>',
          '<a href="/blog/p4">link</a>',
          '<a href="/download">link</a>',
          '<a href="/how-to-play">link</a>',
          '<a href="/login-register">link</a>',
        ],
      },
      {
        heading: 'Section B',
        paragraphs: [
          '<a href="/blog/p5">link</a>',
          '<a href="/responsible-play">link</a>',
          '<a href="/contact">link</a>',
        ],
      },
    ];
    const post = makeLinkedPost(sections, dist, 10, 5, 5);
    const result = validateLinkDistribution(post);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('Section A'))).toBe(true);
    expect(result.issues.some((i) => i.includes('50%'))).toBe(true);
  });

  it('returns an issue when blog link percentage is outside 40–50%', () => {
    // 10 links: 2 blog (20%), 5 key, 3 supporting
    const dist = new Map([['Section A', 5], ['Section B', 5]]);
    const sections = [
      {
        heading: 'Section A',
        paragraphs: [
          '<a href="/blog/p1">link</a>',
          '<a href="/blog/p2">link</a>',
          '<a href="/download">link</a>',
          '<a href="/how-to-play">link</a>',
          '<a href="/login-register">link</a>',
        ],
      },
      {
        heading: 'Section B',
        paragraphs: [
          '<a href="/referral-code">link</a>',
          '<a href="/goplay11-app-download">link</a>',
          '<a href="/responsible-play">link</a>',
          '<a href="/contact">link</a>',
          '<a href="/apk">link</a>',
        ],
      },
    ];
    const post = makeLinkedPost(sections, dist, 10, 2, 8);
    const result = validateLinkDistribution(post);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.toLowerCase().includes('blog link'))).toBe(true);
  });

  it('returns issues with descriptive messages', () => {
    // Trigger multiple issues: section concentration + wrong blog ratio
    const dist = new Map([['Only Section', 10]]);
    const sections = [
      {
        heading: 'Only Section',
        paragraphs: [
          '<a href="/blog/p1">link</a>',
          '<a href="/blog/p2">link</a>',
          '<a href="/download">link</a>',
          '<a href="/how-to-play">link</a>',
          '<a href="/login-register">link</a>',
          '<a href="/referral-code">link</a>',
          '<a href="/goplay11-app-download">link</a>',
          '<a href="/responsible-play">link</a>',
          '<a href="/contact">link</a>',
          '<a href="/apk">link</a>',
        ],
      },
    ];
    const post = makeLinkedPost(sections, dist, 10, 2, 8);
    const result = validateLinkDistribution(post);
    expect(result.valid).toBe(false);
    // Each issue should be a non-empty descriptive string
    for (const issue of result.issues) {
      expect(typeof issue).toBe('string');
      expect(issue.length).toBeGreaterThan(10);
    }
  });

  it('flags two links that are fewer than 50 words apart in the same paragraph', () => {
    const dist = new Map([['Section A', 2]]);
    // Two links with only 3 words between them
    const sections = [
      {
        heading: 'Section A',
        paragraphs: [
          'Start <a href="/blog/p1">first link</a> just three words <a href="/download">second link</a> end.',
        ],
      },
    ];
    const post = makeLinkedPost(sections, dist, 2, 1, 1);
    const result = validateLinkDistribution(post);
    expect(result.issues.some((i) => i.includes('word'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Task 5.5 – Explicit unit tests for linking system
// Validates: Requirements 3.1, 3.6, 3.7
// ---------------------------------------------------------------------------

describe('Task 5.5 – Relevance score: high vs low keyword overlap', () => {
  const downloadTarget: SitePage = {
    path: '/download',
    title: 'Download GoPlay11',
    keywords: ['download goplay11', 'goplay11 apk download', 'download apk'],
    description: 'Download the GoPlay11 APK',
  };

  it('returns a high score (> 0.5) when context has high keyword overlap with target', () => {
    // Context directly contains multiple target keywords
    const highOverlapContext =
      'You can download goplay11 apk from the official site. The goplay11 apk download is free and safe.';
    const score = calculateRelevanceScore(highOverlapContext, downloadTarget);
    expect(score).toBeGreaterThan(0.5);
  });

  it('returns a low score (< 0.2) when context has low keyword overlap with target', () => {
    // Context is completely unrelated to the download page
    const lowOverlapContext =
      'Cricket is a popular sport played across many countries with bat and ball.';
    const score = calculateRelevanceScore(lowOverlapContext, downloadTarget);
    expect(score).toBeLessThan(0.2);
  });

  it('high-overlap score is significantly greater than low-overlap score', () => {
    const highOverlapContext =
      'Download goplay11 apk and install it on your Android device to start playing.';
    const lowOverlapContext =
      'The monsoon season brings heavy rainfall to coastal regions every year.';
    const highScore = calculateRelevanceScore(highOverlapContext, downloadTarget);
    const lowScore = calculateRelevanceScore(lowOverlapContext, downloadTarget);
    expect(highScore).toBeGreaterThan(lowScore + 0.3);
  });
});

describe('Task 5.5 – Link insertion HTML format', () => {
  it('inserts links with class="text-link" and correct href', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    const allText = result.sections.flatMap((s) => s.paragraphs).join(' ');
    // Every inserted link must use the exact format
    const linkMatches = [...allText.matchAll(/<a\b[^>]*>/g)];
    for (const m of linkMatches) {
      expect(m[0]).toMatch(/class="text-link"/);
      expect(m[0]).toMatch(/href="\/[^"]*"/);
    }
  });

  it('inserted link tags are properly closed with </a>', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const result = insertLinks(richPost, opps);
    const allText = result.sections.flatMap((s) => s.paragraphs).join(' ');
    const openTags = (allText.match(/<a\b/g) ?? []).length;
    const closeTags = (allText.match(/<\/a>/g) ?? []).length;
    expect(openTags).toBe(closeTags);
  });
});

describe('Task 5.5 – Maximum 3 links to same URL enforcement', () => {
  it('insertLinks enforces max 3 links per URL even when opportunities exceed that', () => {
    // Manually craft opportunities that all point to the same URL
    const sameUrlOpps: import('./types').LinkOpportunity[] = Array.from({ length: 6 }, (_, i) => ({
      sourceText: richPost.sections[0].paragraphs[0],
      targetUrl: '/download',
      anchorText: 'download goplay11',
      relevanceScore: 0.8,
      sectionIndex: 0,
      paragraphIndex: i % richPost.sections[0].paragraphs.length,
    }));

    const result = insertLinks(richPost, sameUrlOpps);
    const allText = result.sections.flatMap((s) => s.paragraphs).join(' ');
    const downloadLinkCount = (allText.match(/href="\/download"/g) ?? []).length;
    expect(downloadLinkCount).toBeLessThanOrEqual(3);
  });

  it('identifyLinkOpportunities never returns more than 3 opportunities for the same URL', () => {
    const opps = identifyLinkOpportunities(richContent, 22);
    const urlCounts = new Map<string, number>();
    for (const opp of opps) {
      urlCounts.set(opp.targetUrl, (urlCounts.get(opp.targetUrl) ?? 0) + 1);
    }
    for (const [url, count] of urlCounts) {
      expect(count).toBeLessThanOrEqual(3);
    }
  });
});

describe('Task 5.5 – Link count range 20-25', () => {
  // Build a large post with diverse paragraphs so many different URLs can be targeted,
  // allowing identifyLinkOpportunities to reach the 20-25 range without hitting the
  // max-3-per-URL cap on just a handful of URLs.
  const diverseSections = [
    {
      heading: 'Download GoPlay11',
      paragraphs: [
        'Download goplay11 apk from the official website to get started with fantasy gaming on Android.',
        'The goplay11 apk download is completely free and takes only a few minutes to complete.',
        'Install goplay11 app on your device and open it to begin the registration process.',
      ],
    },
    {
      heading: 'Registration and Login',
      paragraphs: [
        'Visit the goplay11 login page to sign in to your existing account securely.',
        'New users can goplay11 register by providing basic details and verifying their mobile number.',
        'Use a goplay11 referral code during sign up to unlock a welcome bonus on your first deposit.',
      ],
    },
    {
      heading: 'How to Play',
      paragraphs: [
        'Learn how to play goplay11 fantasy app by reading the step-by-step guide on the how-to-play page.',
        'Fantasy tips and goplay11 guide help beginners understand team selection and contest formats.',
        'The goplay11 fantasy app offers multiple contest types including mega contests and head-to-head.',
      ],
    },
    {
      heading: 'Responsible Gaming',
      paragraphs: [
        'Responsible gaming means setting personal limits and practising safe play at all times.',
        'GoPlay11 supports responsible gaming with tools to manage your gaming limits effectively.',
        'Always play within your means and use the responsible play features available on the platform.',
      ],
    },
    {
      heading: 'APK and App Details',
      paragraphs: [
        'The goplay11 apk is available for Android devices and can be downloaded from the official apk page.',
        'GoPlay11 android app supports all major Android versions and requires minimal storage space.',
        'Check the goplay11 app download page for the latest version and release notes.',
      ],
    },
    {
      heading: 'Referral and Bonuses',
      paragraphs: [
        'Share your goplay11 referral code with friends to earn referral bonus credits.',
        'The invite code system rewards both the referrer and the new user with bonus cash.',
        'Referral bonuses can be used to join paid contests on the goplay11 fantasy app platform.',
      ],
    },
    {
      heading: 'Contact and Support',
      paragraphs: [
        'Contact goplay11 support through the official contact page for any account-related queries.',
        'The support team is available to help with download issues, login problems, and contest disputes.',
        'You can also reach goplay11 help via email or the in-app chat feature for faster resolution.',
      ],
    },
    {
      heading: 'GoPlay11 Fantasy App Overview',
      paragraphs: [
        'GoPlay11 fantasy app is one of the top fantasy gaming platforms in India for cricket fans.',
        'The goplay11 fantasy app offers daily and weekly contests with real cash prizes for winners.',
        'Download and install the goplay11 app to experience seamless fantasy gaming on mobile.',
      ],
    },
  ];

  const largePost: BlogPost = {
    slug: 'large-test-post',
    title: 'Large Test Post for Link Count',
    description: 'A post with many diverse sections to test link count range.',
    excerpt: 'Link count test.',
    publishedAt: '2026-01-01',
    updatedAt: '2026-04-01',
    keywords: ['goplay11 apk', 'download goplay11', 'goplay11 referral code', 'how to play goplay11 fantasy app'],
    sections: diverseSections,
  };

  // Provide the same site pages used internally by linker.ts so that
  // identifyLinkOpportunities has enough distinct targets to reach 20-25 links.
  const testSitePages: SitePage[] = [
    { path: '/', title: 'GoPlay11 Home', keywords: ['goplay11', 'fantasy app', 'go play 11'], description: 'GoPlay11 fantasy gaming platform homepage' },
    { path: '/download', title: 'Download GoPlay11', keywords: ['download goplay11', 'goplay11 apk download', 'download apk'], description: 'Download the GoPlay11 APK' },
    { path: '/how-to-play', title: 'How to Play GoPlay11', keywords: ['how to play goplay11', 'fantasy tips', 'goplay11 guide'], description: 'Guide on how to play GoPlay11' },
    { path: '/login-register', title: 'Login or Register', keywords: ['goplay11 login', 'goplay11 register', 'sign up'], description: 'Login or register for GoPlay11' },
    { path: '/referral-code', title: 'GoPlay11 Referral Code', keywords: ['goplay11 referral code', 'referral bonus', 'invite code'], description: 'GoPlay11 referral code and bonus' },
    { path: '/goplay11-app-download', title: 'GoPlay11 App Download', keywords: ['goplay11 app download', 'install goplay11', 'goplay11 app'], description: 'GoPlay11 app download page' },
    { path: '/goplay11-fantasy-app', title: 'GoPlay11 Fantasy App', keywords: ['goplay11 fantasy app', 'fantasy gaming', 'goplay11 app'], description: 'GoPlay11 fantasy app overview' },
    { path: '/responsible-play', title: 'Responsible Play', keywords: ['responsible gaming', 'safe play', 'gaming limits'], description: 'Responsible gaming guidelines' },
    { path: '/contact', title: 'Contact GoPlay11', keywords: ['contact goplay11', 'support', 'help'], description: 'Contact GoPlay11 support' },
    { path: '/apk', title: 'GoPlay11 APK', keywords: ['goplay11 apk', 'apk download', 'android app'], description: 'GoPlay11 APK download page' },
  ];

  const largeContent: LinkableContent = {
    post: largePost,
    allPosts: [largePost, otherPost],
    sitePages: testSitePages,
  };

  it('identifyLinkOpportunities with targetCount=22 returns between 20 and 25 opportunities', () => {
    const opps = identifyLinkOpportunities(largeContent, 22);
    // With 24 diverse paragraphs across 8 sections targeting many different URLs,
    // the result should be close to the requested 22 (within the 20-25 range)
    expect(opps.length).toBeGreaterThanOrEqual(20);
    expect(opps.length).toBeLessThanOrEqual(25);
  });

  it('insertLinks produces totalLinks within 20-25 range for a well-populated post', () => {
    const opps = identifyLinkOpportunities(largeContent, 22);
    const result = insertLinks(largePost, opps);
    expect(result.linkingMetadata.totalLinks).toBeGreaterThanOrEqual(20);
    expect(result.linkingMetadata.totalLinks).toBeLessThanOrEqual(25);
  });
});

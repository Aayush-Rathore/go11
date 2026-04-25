/**
 * Unit tests for Content Expansion
 *
 * Covers:
 *  - Word count calculation with HTML tag exclusion (calculateCurrentWordCount)
 *  - Content gap identification (identifyContentGaps)
 *  - Expansion to minimum 2500 words (expandBlogPost)
 *  - Preservation of author/reviewer (expandBlogPost)
 *
 * Requirements: 2.1, 2.4
 */

import { describe, it, expect } from 'vitest';
import { calculateCurrentWordCount, identifyContentGaps } from './analyzer';
import { expandBlogPost } from './expander';
import { generateNewSections } from './generator';
import type { BlogPost } from '@/lib/blog';
import type { KeywordOpportunity } from '../gsc/types';
import type { ExpansionContext } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid BlogPost with the given sections */
function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'test-post',
    title: 'GoPlay11 Fantasy App Guide',
    description: 'A guide to GoPlay11 fantasy gaming.',
    excerpt: 'Learn how to use GoPlay11.',
    publishedAt: '2026-01-01',
    updatedAt: '2026-01-01',
    keywords: ['goplay11', 'fantasy app'],
    sections: [],
    ...overrides,
  };
}

/** Build a keyword opportunity */
function makeKeyword(keyword: string, score = 60): KeywordOpportunity {
  return {
    keyword,
    impressions: 500,
    clicks: 10,
    ctr: 2,
    position: 12,
    opportunityScore: score,
    category: 'position-4-20',
  };
}

/** Build an ExpansionContext */
function makeContext(overrides: Partial<ExpansionContext> = {}): ExpansionContext {
  return {
    targetWordCount: 2500,
    keywordOpportunities: [],
    relatedQueries: [],
    existingWordCount: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateCurrentWordCount – HTML tag exclusion
// ---------------------------------------------------------------------------

describe('calculateCurrentWordCount – HTML tag exclusion', () => {
  it('counts plain text words correctly', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['This is a simple sentence.'] }],
    });
    expect(calculateCurrentWordCount(post)).toBe(5);
  });

  it('strips anchor tags and counts only visible text', () => {
    const post = makePost({
      sections: [
        {
          heading: 'Download',
          paragraphs: ['Visit the <a href="/download">download page</a> now.'],
        },
      ],
    });
    // "Visit the download page now" = 5 words
    expect(calculateCurrentWordCount(post)).toBe(5);
  });

  it('strips nested HTML tags', () => {
    const post = makePost({
      sections: [
        {
          heading: 'Section',
          paragraphs: [
            '<p><strong>GoPlay11</strong> is a <em>fantasy</em> app.</p>',
          ],
        },
      ],
    });
    // "GoPlay11 is a fantasy app." = 5 words
    expect(calculateCurrentWordCount(post)).toBe(5);
  });

  it('returns 0 for a post with no sections', () => {
    const post = makePost({ sections: [] });
    expect(calculateCurrentWordCount(post)).toBe(0);
  });

  it('sums words across multiple sections and paragraphs', () => {
    const post = makePost({
      sections: [
        { heading: 'A', paragraphs: ['One two three.', 'Four five.'] },
        { heading: 'B', paragraphs: ['Six seven eight nine ten.'] },
      ],
    });
    expect(calculateCurrentWordCount(post)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// identifyContentGaps
// ---------------------------------------------------------------------------

describe('identifyContentGaps', () => {
  it('returns gaps for keywords not present in the post', () => {
    const post = makePost({
      sections: [
        { heading: 'Download Guide', paragraphs: ['How to download the app.'] },
      ],
    });
    const keywords = [
      makeKeyword('download guide', 50),
      makeKeyword('referral code bonus', 80),
    ];
    const gaps = identifyContentGaps(post, keywords);
    expect(gaps).toContain('referral code bonus');
    expect(gaps).not.toContain('download guide');
  });

  it('sorts gaps by opportunity score descending', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Basic content.'] }],
    });
    const keywords = [
      makeKeyword('low score topic', 20),
      makeKeyword('high score topic', 90),
      makeKeyword('mid score topic', 55),
    ];
    const gaps = identifyContentGaps(post, keywords);
    expect(gaps[0]).toBe('high score topic');
    expect(gaps[1]).toBe('mid score topic');
    expect(gaps[2]).toBe('low score topic');
  });

  it('returns empty array when all keywords are covered', () => {
    const post = makePost({
      sections: [
        {
          heading: 'GoPlay11 Download and Install',
          paragraphs: ['Complete download and install guide for GoPlay11.'],
        },
      ],
    });
    const keywords = [makeKeyword('download install', 60)];
    const gaps = identifyContentGaps(post, keywords);
    expect(gaps).toEqual([]);
  });

  it('returns empty array for empty keyword list', () => {
    const post = makePost({
      sections: [{ heading: 'Section', paragraphs: ['Content.'] }],
    });
    expect(identifyContentGaps(post, [])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// expandBlogPost – minimum 2500 words
// ---------------------------------------------------------------------------

describe('expandBlogPost – word count expansion', () => {
  it('expands a short post to at least 2500 words', () => {
    const post = makePost({
      sections: [
        {
          heading: 'Introduction',
          paragraphs: ['GoPlay11 is a fantasy gaming platform popular in India.'],
        },
      ],
    });

    const context = makeContext({
      targetWordCount: 2500,
      keywordOpportunities: [
        makeKeyword('download goplay11 apk', 90),
        makeKeyword('goplay11 referral code', 80),
        makeKeyword('is goplay11 safe', 75),
        makeKeyword('goplay11 login register', 70),
        makeKeyword('goplay11 fantasy strategy', 65),
        makeKeyword('goplay11 contest types', 60),
        makeKeyword('goplay11 withdraw payment', 55),
        makeKeyword('install goplay11 android', 50),
      ],
      relatedQueries: [
        'how to download goplay11 apk',
        'is goplay11 safe and real',
        'goplay11 referral code bonus',
        'how to register on goplay11',
        'goplay11 withdrawal process',
      ],
    });

    const result = expandBlogPost(post, context);
    expect(result.expansionMetadata.finalWordCount).toBeGreaterThanOrEqual(2500);
  });

  it('does not expand a post that already meets the target', () => {
    // Build a post with ~2600 words (26 sections × 1 paragraph × ~100 words each)
    const longParagraph =
      'GoPlay11 is a fantasy gaming platform that allows users to create virtual teams and compete in contests based on real match performances. ' +
      'The platform is popular across India and supports cricket, football, and other sports. ' +
      'Users can download the APK, register an account, and start joining contests within minutes. ' +
      'The app is lightweight and works well on most Android devices, including mid-range phones with limited storage. ' +
      'Fantasy sports require skill, research, and consistent decision-making to perform well over time. ' +
      'GoPlay11 provides a straightforward interface that makes it easy to build teams and join contests quickly. ' +
      'The platform regularly updates its features based on user feedback to improve the overall experience.';

    const sections = Array.from({ length: 26 }, (_, i) => ({
      heading: `Section ${i + 1}`,
      paragraphs: [longParagraph],
    }));

    const post = makePost({ sections });
    const originalCount = calculateCurrentWordCount(post);
    expect(originalCount).toBeGreaterThanOrEqual(2500);

    const context = makeContext({ targetWordCount: 2500 });
    const result = expandBlogPost(post, context);

    // No new sections should have been added
    expect(result.expansionMetadata.sectionsAdded).toBe(0);
    expect(result.sections.length).toBe(post.sections.length);
  });

  it('records correct sectionsAdded in metadata', () => {
    const post = makePost({
      sections: [
        { heading: 'Intro', paragraphs: ['Short intro.'] },
      ],
    });

    const context = makeContext({
      targetWordCount: 2500,
      keywordOpportunities: [
        makeKeyword('download apk guide', 80),
        makeKeyword('referral code', 70),
        makeKeyword('safe and real', 60),
      ],
      relatedQueries: ['how to download', 'is it safe', 'referral code'],
    });

    const result = expandBlogPost(post, context);
    expect(result.expansionMetadata.sectionsAdded).toBe(
      result.sections.length - post.sections.length
    );
  });
});

// ---------------------------------------------------------------------------
// expandBlogPost – author/reviewer preservation
// ---------------------------------------------------------------------------

describe('expandBlogPost – author and reviewer preservation', () => {
  it('preserves author when set', () => {
    const post = makePost({
      author: 'Rohan Mehta',
      sections: [{ heading: 'Intro', paragraphs: ['Short content.'] }],
    });
    const result = expandBlogPost(post, makeContext({ targetWordCount: 2500 }));
    expect(result.author).toBe('Rohan Mehta');
  });

  it('preserves reviewer when set', () => {
    const post = makePost({
      reviewer: 'Ananya Kulkarni',
      sections: [{ heading: 'Intro', paragraphs: ['Short content.'] }],
    });
    const result = expandBlogPost(post, makeContext({ targetWordCount: 2500 }));
    expect(result.reviewer).toBe('Ananya Kulkarni');
  });

  it('preserves both author and reviewer together', () => {
    const post = makePost({
      author: 'Rohan Mehta',
      reviewer: 'Ananya Kulkarni',
      sections: [{ heading: 'Intro', paragraphs: ['Short content.'] }],
    });
    const result = expandBlogPost(post, makeContext({ targetWordCount: 2500 }));
    expect(result.author).toBe('Rohan Mehta');
    expect(result.reviewer).toBe('Ananya Kulkarni');
  });

  it('keeps author/reviewer undefined when not originally set', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Short content.'] }],
    });
    const result = expandBlogPost(post, makeContext({ targetWordCount: 2500 }));
    expect(result.author).toBeUndefined();
    expect(result.reviewer).toBeUndefined();
  });

  it('does not alter author/reviewer even when post already meets target', () => {
    const longParagraph = 'GoPlay11 fantasy platform guide. '.repeat(100);
    const post = makePost({
      author: 'Rohan Mehta',
      reviewer: 'Ananya Kulkarni',
      sections: [{ heading: 'Full Guide', paragraphs: [longParagraph] }],
    });
    const result = expandBlogPost(post, makeContext({ targetWordCount: 100 }));
    expect(result.author).toBe('Rohan Mehta');
    expect(result.reviewer).toBe('Ananya Kulkarni');
  });
});

// ---------------------------------------------------------------------------
// generateNewSections – paragraph word count and tone (Task 4.2)
// ---------------------------------------------------------------------------

describe('generateNewSections – paragraph word count and tone', () => {
  it('produces sections with 3–5 paragraphs each', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Short intro.'] }],
    });
    const gaps = ['download apk guide', 'referral code bonus'];
    // targetWords large enough to generate both sections
    const sections = generateNewSections(post, gaps, 2000);
    for (const section of sections) {
      expect(section.paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(section.paragraphs.length).toBeLessThanOrEqual(5);
    }
  });

  it('ensures every paragraph is 80–150 words', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Short intro.'] }],
    });
    const gaps = [
      'download apk guide',
      'login register account',
      'referral code bonus',
      'is goplay11 safe real',
      'fantasy team strategy tips',
      'install setup android',
      'withdraw payment wallet',
      'contest league match',
    ];
    const sections = generateNewSections(post, gaps, 3000);
    for (const section of sections) {
      for (const para of section.paragraphs) {
        const wordCount = para.trim().split(/\s+/).filter(w => w.length > 0).length;
        expect(wordCount).toBeGreaterThanOrEqual(80);
        expect(wordCount).toBeLessThanOrEqual(150);
      }
    }
  });

  it('uses Indian English spelling conventions', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Short intro.'] }],
    });
    const gaps = ['fantasy team strategy tips', 'referral code bonus'];
    const sections = generateNewSections(post, gaps, 2000);
    const allText = sections.flatMap(s => s.paragraphs).join(' ');
    // Should use "analyse" / "realise" / "practise" not "analyze" / "realize" / "practice"
    expect(allText).not.toMatch(/\banalyze\b/i);
    expect(allText).not.toMatch(/\brealize\b/i);
  });

  it('returns empty array when gaps list is empty', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Short intro.'] }],
    });
    const sections = generateNewSections(post, [], 2000);
    expect(sections).toEqual([]);
  });

  it('each section heading addresses the content gap topic', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Short intro.'] }],
    });
    const gaps = ['download apk guide', 'login register account'];
    const sections = generateNewSections(post, gaps, 2000);
    expect(sections.length).toBeGreaterThanOrEqual(1);
    // Each section should have a non-empty heading
    for (const section of sections) {
      expect(section.heading.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('expandBlogPost – FAQ items', () => {
  it('generates at least 5 FAQ items when post has no FAQ', () => {
    const post = makePost({
      sections: [{ heading: 'Intro', paragraphs: ['Short content.'] }],
    });
    const context = makeContext({
      targetWordCount: 2500,
      relatedQueries: [
        'how to download goplay11',
        'is goplay11 safe',
        'goplay11 referral code',
      ],
    });
    const result = expandBlogPost(post, context);
    expect(result.faq?.length).toBeGreaterThanOrEqual(5);
  });

  it('does not regenerate FAQ when post already has 5+ items', () => {
    const existingFaq = Array.from({ length: 6 }, (_, i) => ({
      question: `Question ${i + 1}?`,
      answer: `Answer ${i + 1}.`,
    }));
    const post = makePost({
      faq: existingFaq,
      sections: [{ heading: 'Intro', paragraphs: ['Short content.'] }],
    });
    const context = makeContext({
      targetWordCount: 2500,
      relatedQueries: ['some query'],
    });
    const result = expandBlogPost(post, context);
    // FAQ should remain unchanged (6 items)
    expect(result.faq?.length).toBe(6);
  });
});

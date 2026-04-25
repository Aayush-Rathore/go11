/**
 * Unit tests for Keyword Optimizer
 *
 * Requirements: 5.5
 */

import { describe, it, expect } from 'vitest';
import { calculateKeywordDensity, identifyKeywordPlacements } from './keyword-optimizer';
import type { BlogPost } from '@/lib/blog';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'test-post',
    title: 'Test Post',
    description: 'Test description',
    excerpt: 'Test excerpt',
    publishedAt: '2026-01-01',
    updatedAt: '2026-01-01',
    keywords: [],
    sections: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateKeywordDensity
// ---------------------------------------------------------------------------

describe('calculateKeywordDensity', () => {
  it('calculates density for a simple repeated keyword', () => {
    // "goplay11 goplay11 goplay11 other words" → 5 words, 3 occurrences → 60%
    const density = calculateKeywordDensity('goplay11 goplay11 goplay11 other words', 'goplay11');
    expect(density).toBeCloseTo(60, 1);
  });

  it('returns 0 for empty text', () => {
    expect(calculateKeywordDensity('', 'goplay11')).toBe(0);
  });

  it('is case-insensitive: "GoPlay11" matches keyword "goplay11"', () => {
    const density = calculateKeywordDensity('GoPlay11 other words', 'goplay11');
    // 1 occurrence / 3 words = 33.33%
    expect(density).toBeCloseTo(33.33, 1);
  });

  it('strips HTML tags before counting', () => {
    // "<b>goplay11</b> other words" → plain "goplay11 other words" → 3 words, 1 occurrence
    const density = calculateKeywordDensity('<b>goplay11</b> other words', 'goplay11');
    expect(density).toBeCloseTo(33.33, 1);
  });

  it('returns 0 when keyword is not present', () => {
    expect(calculateKeywordDensity('some random text here', 'goplay11')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// identifyKeywordPlacements
// ---------------------------------------------------------------------------

describe('identifyKeywordPlacements', () => {
  it('detects keyword in title', () => {
    const post = makePost({
      title: 'Download goplay11 today',
      sections: [{ heading: 'Section', paragraphs: ['Some content here.'] }],
    });

    const placements = identifyKeywordPlacements(post, ['goplay11']);
    expect(placements.inTitle).toContain('goplay11');
  });

  it('detects keyword in first paragraph', () => {
    const post = makePost({
      title: 'A Guide',
      sections: [
        {
          heading: 'Intro',
          paragraphs: ['goplay11 is a great platform for fantasy sports.'],
        },
      ],
    });

    const placements = identifyKeywordPlacements(post, ['goplay11']);
    expect(placements.inFirstParagraph).toContain('goplay11');
  });

  it('detects keyword in headings', () => {
    const post = makePost({
      title: 'A Guide',
      sections: [
        {
          heading: 'Why goplay11 stands out',
          paragraphs: ['Some paragraph content.'],
        },
      ],
    });

    const placements = identifyKeywordPlacements(post, ['goplay11']);
    expect(placements.inHeadings).toContain('goplay11');
  });

  it('detects keyword in FAQ', () => {
    const post = makePost({
      title: 'A Guide',
      sections: [{ heading: 'Section', paragraphs: ['Content.'] }],
      faq: [
        {
          question: 'What is goplay11?',
          answer: 'It is a fantasy sports platform.',
        },
      ],
    });

    const placements = identifyKeywordPlacements(post, ['goplay11']);
    expect(placements.inFAQ).toContain('goplay11');
  });

  it('does not report placement when keyword is absent', () => {
    const post = makePost({
      title: 'A Guide',
      sections: [{ heading: 'Section', paragraphs: ['Content.'] }],
    });

    const placements = identifyKeywordPlacements(post, ['goplay11']);
    expect(placements.inTitle).not.toContain('goplay11');
    expect(placements.inFirstParagraph).not.toContain('goplay11');
    expect(placements.inHeadings).not.toContain('goplay11');
    expect(placements.inFAQ).not.toContain('goplay11');
  });
});

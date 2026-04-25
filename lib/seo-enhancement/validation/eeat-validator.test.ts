/**
 * Unit tests for E-E-A-T Validator
 * Requirements: 4.1, 4.2, 4.3
 */

import { describe, it, expect } from 'vitest';
import type { BlogPost } from '@/lib/blog';
import {
  validateAuthorAttribution,
  validateReviewerAttribution,
  validateCredentials,
  detectExperienceIndicators,
  detectDataSupport,
  detectSafetyAddressing,
  validateFreshness,
  generateValidationResult,
} from './eeat-validator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'test-post',
    title: 'Test Post',
    description: 'A test post.',
    excerpt: 'Excerpt.',
    publishedAt: '2026-04-01',
    updatedAt: '2026-04-01',
    keywords: [],
    sections: [],
    ...overrides,
  };
}

function postWithContent(paragraphs: string[], overrides: Partial<BlogPost> = {}): BlogPost {
  return makePost({
    sections: [{ heading: 'Section', paragraphs }],
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// 1. validateAuthorAttribution
// ---------------------------------------------------------------------------

describe('validateAuthorAttribution', () => {
  it('returns true when post has a non-empty author', () => {
    const post = makePost({ author: 'Rohan Mehta' });
    expect(validateAuthorAttribution(post)).toBe(true);
  });

  it('returns false when author is absent', () => {
    const post = makePost({ author: undefined });
    expect(validateAuthorAttribution(post)).toBe(false);
  });

  it('returns false when author is an empty string', () => {
    const post = makePost({ author: '' });
    expect(validateAuthorAttribution(post)).toBe(false);
  });

  it('returns false when author is only whitespace', () => {
    const post = makePost({ author: '   ' });
    expect(validateAuthorAttribution(post)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. validateReviewerAttribution
// ---------------------------------------------------------------------------

describe('validateReviewerAttribution', () => {
  it('returns true when post has a non-empty reviewer', () => {
    const post = makePost({ reviewer: 'Ananya Kulkarni' });
    expect(validateReviewerAttribution(post)).toBe(true);
  });

  it('returns false when reviewer is absent', () => {
    const post = makePost({ reviewer: undefined });
    expect(validateReviewerAttribution(post)).toBe(false);
  });

  it('returns false when reviewer is an empty string', () => {
    const post = makePost({ reviewer: '' });
    expect(validateReviewerAttribution(post)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. validateCredentials
// ---------------------------------------------------------------------------

describe('validateCredentials', () => {
  it('passes when author has specific credentials with years of experience', () => {
    const post = makePost({ author: 'Name, Fantasy Strategy Analyst with 8+ years' });
    expect(validateCredentials(post)).toBe(true);
  });

  it('fails when author has a generic credential like "Writer"', () => {
    const post = makePost({ author: 'Name, Writer' });
    expect(validateCredentials(post)).toBe(false);
  });

  it('passes when author is a plain name with no credential suffix', () => {
    const post = makePost({ author: 'Rohan Mehta' });
    expect(validateCredentials(post)).toBe(true);
  });

  it('fails when reviewer has a generic credential like "Editor"', () => {
    const post = makePost({ author: 'Rohan Mehta', reviewer: 'Name, Editor' });
    expect(validateCredentials(post)).toBe(false);
  });

  it('passes when reviewer has a specific credential', () => {
    const post = makePost({
      author: 'Rohan Mehta',
      reviewer: 'Ananya Kulkarni, Senior SEO Specialist',
    });
    expect(validateCredentials(post)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. detectExperienceIndicators
// ---------------------------------------------------------------------------

describe('detectExperienceIndicators', () => {
  it('returns ["first-person language"] when post uses first-person pronouns', () => {
    const post = postWithContent(['I have tested this approach many times.']);
    const indicators = detectExperienceIndicators(post);
    expect(indicators).toContain('first-person language');
  });

  it('returns ["practical advice"] when post uses imperative verbs at sentence start', () => {
    const post = postWithContent(['Select your captain carefully. Avoid stacking star players.']);
    const indicators = detectExperienceIndicators(post);
    expect(indicators).toContain('practical advice');
  });

  it('returns empty array when no experience indicators are present', () => {
    const post = postWithContent(['The platform has many features.']);
    const indicators = detectExperienceIndicators(post);
    expect(indicators).toHaveLength(0);
  });

  it('detects multiple indicators when both first-person and practical advice are present', () => {
    const post = postWithContent([
      'I always recommend this. Choose your lineup wisely.',
    ]);
    const indicators = detectExperienceIndicators(post);
    expect(indicators).toContain('first-person language');
    expect(indicators).toContain('practical advice');
  });
});

// ---------------------------------------------------------------------------
// 5. detectDataSupport
// ---------------------------------------------------------------------------

describe('detectDataSupport', () => {
  it('returns ["metric references"] when post contains percentages', () => {
    const post = postWithContent(['Win rates improved by 45% after adjusting the lineup.']);
    const refs = detectDataSupport(post);
    expect(refs).toContain('metric references');
  });

  it('returns ["research references"] when post uses "according to"', () => {
    const post = postWithContent(['According to recent data, fantasy engagement is rising.']);
    const refs = detectDataSupport(post);
    expect(refs).toContain('research references');
  });

  it('returns empty array when no data references are present', () => {
    const post = postWithContent(['The app is easy to use.']);
    const refs = detectDataSupport(post);
    expect(refs).toHaveLength(0);
  });

  it('detects both metric and research references when both are present', () => {
    const post = postWithContent([
      'According to research, 60% of users prefer lightweight apps.',
    ]);
    const refs = detectDataSupport(post);
    expect(refs).toContain('metric references');
    expect(refs).toContain('research references');
  });
});

// ---------------------------------------------------------------------------
// 6. detectSafetyAddressing
// ---------------------------------------------------------------------------

describe('detectSafetyAddressing', () => {
  it('returns true when post mentions "responsible gaming"', () => {
    const post = postWithContent(['Practice responsible gaming and set daily limits.']);
    expect(detectSafetyAddressing(post)).toBe(true);
  });

  it('returns false when post has no safety-related content', () => {
    const post = postWithContent(['The app loads quickly and has many contests.']);
    expect(detectSafetyAddressing(post)).toBe(false);
  });

  it('returns true when post mentions account security keywords', () => {
    const post = postWithContent(['Use a strong password and enable two-factor authentication.']);
    expect(detectSafetyAddressing(post)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. validateFreshness
// ---------------------------------------------------------------------------

describe('validateFreshness', () => {
  it('passes when updatedAt is within 90 days of 2026-04-25', () => {
    const post = makePost({ updatedAt: '2026-04-01' });
    expect(validateFreshness(post)).toBe(true);
  });

  it('fails when updatedAt is older than 90 days from 2026-04-25', () => {
    const post = makePost({ updatedAt: '2025-01-01' });
    expect(validateFreshness(post)).toBe(false);
  });

  it('fails when updatedAt is missing', () => {
    const post = makePost({ updatedAt: undefined as unknown as string });
    expect(validateFreshness(post)).toBe(false);
  });

  it('fails when updatedAt is an invalid date string', () => {
    const post = makePost({ updatedAt: 'not-a-date' });
    expect(validateFreshness(post)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. generateValidationResult
// ---------------------------------------------------------------------------

describe('generateValidationResult', () => {
  it('returns passed=true and score >= 70 for a fully compliant post', () => {
    const post = postWithContent(
      [
        // first-person + practical advice (experience indicators)
        'I always recommend this approach. Select your captain based on form.',
        // metric + research references (data support)
        'According to data, 60% of top scorers use this strategy.',
        // safety
        'Practice responsible gaming and set budget limits.',
      ],
      {
        author: 'Rohan Mehta, Fantasy Strategy Analyst with 8+ years',
        reviewer: 'Ananya Kulkarni, Senior SEO Specialist',
        updatedAt: '2026-04-01',
      }
    );

    const result = generateValidationResult(post);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.checks.hasAuthor).toBe(true);
    expect(result.checks.hasReviewer).toBe(true);
  });

  it('returns passed=false and score < 70 for a post missing author, reviewer, and safety', () => {
    const post = postWithContent(['The app has many features.'], {
      author: undefined,
      reviewer: undefined,
      updatedAt: '2025-01-01', // stale
    });

    const result = generateValidationResult(post);
    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(70);
    expect(result.checks.hasAuthor).toBe(false);
    expect(result.checks.hasReviewer).toBe(false);
    expect(result.checks.addressesSafety).toBe(false);
  });

  it('includes issues for missing author and reviewer', () => {
    const post = makePost({ author: undefined, reviewer: undefined });
    const result = generateValidationResult(post);
    expect(result.issues.some((i) => i.toLowerCase().includes('author'))).toBe(true);
    expect(result.issues.some((i) => i.toLowerCase().includes('reviewer'))).toBe(true);
  });

  it('checks object reflects all validation outcomes', () => {
    const post = postWithContent(
      ['I tested this. Select your lineup carefully. According to research, 40% win more.'],
      {
        author: 'Rohan Mehta',
        reviewer: 'Ananya Kulkarni',
        updatedAt: '2026-04-10',
      }
    );
    const result = generateValidationResult(post);
    expect(result.checks.hasAuthor).toBe(true);
    expect(result.checks.hasReviewer).toBe(true);
    expect(result.checks.demonstratesExperience).toBe(true);
    expect(result.checks.hasDataSupport).toBe(true);
    expect(result.checks.isCurrentlyDated).toBe(true);
  });
});

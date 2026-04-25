/**
 * Keyword Optimizer
 *
 * Provides functions to calculate keyword density, identify keyword placements,
 * assess naturalness, optimize content, and generate optimization reports.
 */

import type { BlogPost } from '@/lib/blog';

export interface KeywordOptimizationContext {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  semanticVariations: string[];
  targetDensity: number; // 0.01 to 0.02 (1-2%)
}

export interface KeywordOptimizationResult {
  keywordDensity: Map<string, number>; // Keyword -> density percentage
  keywordPlacements: {
    inTitle: string[];
    inFirstParagraph: string[];
    inHeadings: string[];
    inFAQ: string[];
  };
  overOptimized: string[]; // Keywords exceeding target density
  underOptimized: string[]; // Keywords below minimum threshold
  naturalnessScore: number; // 0-100
}

/**
 * Strip HTML tags from a string, returning plain text.
 */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Tokenise plain text into an array of lowercase words.
 */
function tokenize(text: string): string[] {
  return stripHtml(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 0);
}

/**
 * Count how many times a keyword (phrase) appears in a plain-text string,
 * using case-insensitive matching.
 *
 * Multi-word keywords are matched as contiguous word sequences so that
 * "goplay11 app" is not counted inside "goplay11 application".
 */
function countOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;

  // Build a regex that matches the keyword as whole words / phrase
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'gi');
  const matches = stripHtml(text).match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Calculate the keyword density for a given keyword within a text.
 *
 * Formula: (keyword occurrences / total words) * 100
 *
 * HTML tags are stripped before counting. Matching is case-insensitive.
 * Returns 0 when the text contains no words.
 *
 * Requirements: 5.2, 5.5, 5.8
 *
 * @param text    - Raw text (may contain HTML)
 * @param keyword - Keyword or phrase to measure
 * @returns Density as a percentage (e.g. 1.5 means 1.5%)
 */
export function calculateKeywordDensity(text: string, keyword: string): number {
  const words = tokenize(text);
  if (words.length === 0) return 0;

  const occurrences = countOccurrences(text, keyword);
  return (occurrences / words.length) * 100;
}

/**
 * Identify where each keyword appears within a blog post.
 *
 * Checks:
 * - Title
 * - First 100 words of the first section's first paragraph
 * - All section headings
 * - FAQ questions and answers (if post.faq exists)
 *
 * Requirements: 5.2, 5.5, 5.8
 *
 * @param post     - The blog post to inspect
 * @param keywords - List of keywords to check
 * @returns Placement map showing which keywords appear in each location
 */
export function identifyKeywordPlacements(
  post: BlogPost,
  keywords: string[]
): KeywordOptimizationResult['keywordPlacements'] {
  const inTitle: string[] = [];
  const inFirstParagraph: string[] = [];
  const inHeadings: string[] = [];
  const inFAQ: string[] = [];

  // Build first-100-words text from the first paragraph of the first section
  const firstParagraphRaw =
    post.sections.length > 0 && post.sections[0].paragraphs.length > 0
      ? post.sections[0].paragraphs[0]
      : '';
  const first100Words = tokenize(firstParagraphRaw).slice(0, 100).join(' ');

  // Collect all heading text
  const headingsText = post.sections.map(s => s.heading).join(' ');

  // Collect all FAQ text
  const faqText = post.faq
    ? post.faq.map(f => `${f.question} ${f.answer}`).join(' ')
    : '';

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();

    // Title check
    if (countOccurrences(post.title, kw) > 0) {
      inTitle.push(keyword);
    }

    // First 100 words check
    if (countOccurrences(first100Words, kw) > 0) {
      inFirstParagraph.push(keyword);
    }

    // Headings check
    if (countOccurrences(headingsText, kw) > 0) {
      inHeadings.push(keyword);
    }

    // FAQ check (only when FAQ exists)
    if (faqText && countOccurrences(faqText, kw) > 0) {
      inFAQ.push(keyword);
    }
  }

  return { inTitle, inFirstParagraph, inHeadings, inFAQ };
}

/**
 * Assess how natural the keyword usage feels in a blog post.
 *
 * Starts at 100 and applies penalties:
 * - Keyword density > 2% for any keyword: -10 per over-optimised keyword
 * - Same keyword appears 3+ times consecutively in any paragraph: -15
 * - Keyword appears in every sentence of a paragraph: -10
 *
 * Requirements: 5.1, 5.3, 5.4
 *
 * @param post     - The blog post to assess
 * @param keywords - Keywords to evaluate
 * @returns Naturalness score 0-100
 */
export function assessNaturalness(post: BlogPost, keywords: string[]): number {
  // Build full text for density calculation
  const allText = [
    post.title,
    ...post.sections.flatMap(s => [s.heading, ...s.paragraphs]),
    ...(post.faq ? post.faq.flatMap(f => [f.question, f.answer]) : []),
  ].join(' ');

  let score = 100;

  for (const keyword of keywords) {
    // Penalty: density > 2%
    const density = calculateKeywordDensity(allText, keyword);
    if (density > 2) {
      score -= 10;
    }

    // Check each paragraph for consecutive repetition and every-sentence presence
    for (const section of post.sections) {
      for (const paragraph of section.paragraphs) {
        const plain = stripHtml(paragraph);

        // Penalty: keyword appears 3+ times in a row (consecutive occurrences with only whitespace between)
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const consecutivePattern = new RegExp(
          `(?:(?:^|\\s)${escaped}(?:\\s|$)){3,}`,
          'gi'
        );
        if (consecutivePattern.test(plain)) {
          score -= 15;
        }

        // Penalty: keyword appears in every sentence of a paragraph
        const sentences = plain
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
        if (sentences.length > 0 && sentences.every(s => countOccurrences(s, keyword) > 0)) {
          score -= 10;
        }
      }
    }
  }

  return Math.max(0, score);
}

/**
 * Optimise a blog post to ensure primary keywords are well-placed and
 * semantic variations are integrated to avoid repetition.
 *
 * - Ensures each primary keyword appears in the title (appends if missing)
 * - Ensures each primary keyword appears in the first 100 words (prepends a sentence if missing)
 * - Ensures each primary keyword appears in at least 2 headings (adds to heading text if needed)
 * - Replaces some occurrences of primary keywords with semantic variations
 *
 * Returns a new BlogPost — the original is not mutated.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.7
 *
 * @param post    - The blog post to optimise
 * @param context - Keyword optimisation context with primary/secondary keywords and variations
 * @returns Modified BlogPost
 */
export function optimizeContent(
  post: BlogPost,
  context: KeywordOptimizationContext
): BlogPost {
  // Deep-clone to avoid mutation
  let result: BlogPost = {
    ...post,
    sections: post.sections.map(s => ({
      ...s,
      paragraphs: [...s.paragraphs],
    })),
    faq: post.faq ? post.faq.map(f => ({ ...f })) : undefined,
  };

  const { primaryKeywords, semanticVariations } = context;

  // --- 1. Ensure primary keywords in title ---
  for (const keyword of primaryKeywords) {
    if (countOccurrences(result.title, keyword) === 0) {
      result = { ...result, title: `${result.title} - ${keyword}` };
    }
  }

  // --- 2. Ensure primary keywords in first 100 words ---
  if (result.sections.length > 0 && result.sections[0].paragraphs.length > 0) {
    const firstPara = result.sections[0].paragraphs[0];
    const first100 = tokenize(firstPara).slice(0, 100).join(' ');

    for (const keyword of primaryKeywords) {
      if (countOccurrences(first100, keyword) === 0) {
        // Prepend a sentence introducing the keyword
        const sentence = `This guide covers everything you need to know about ${keyword}.`;
        const updatedSections = result.sections.map((s, si) => {
          if (si !== 0) return s;
          const updatedParas = s.paragraphs.map((p, pi) => {
            if (pi !== 0) return p;
            return `${sentence} ${p}`;
          });
          return { ...s, paragraphs: updatedParas };
        });
        result = { ...result, sections: updatedSections };
      }
    }
  }

  // --- 3. Ensure primary keywords in at least 2 headings ---
  for (const keyword of primaryKeywords) {
    const headingsWithKeyword = result.sections.filter(
      s => countOccurrences(s.heading, keyword) > 0
    );

    if (headingsWithKeyword.length < 2) {
      const needed = 2 - headingsWithKeyword.length;
      let added = 0;
      const updatedSections = result.sections.map(s => {
        if (added >= needed) return s;
        if (countOccurrences(s.heading, keyword) > 0) return s;
        added++;
        return { ...s, heading: `${s.heading}: ${keyword}` };
      });
      result = { ...result, sections: updatedSections };
    }
  }

  // --- 4. Integrate semantic variations ---
  if (semanticVariations.length > 0) {
    // For each primary keyword, replace every other occurrence in paragraphs
    // with a semantic variation to reduce repetition
    for (const keyword of primaryKeywords) {
      let replacementIndex = 0;
      const updatedSections = result.sections.map(s => {
        const updatedParas = s.paragraphs.map(para => {
          const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'gi');
          let occurrenceCount = 0;
          return para.replace(pattern, match => {
            occurrenceCount++;
            // Replace every other occurrence (2nd, 4th, …) with a variation
            if (occurrenceCount % 2 === 0 && semanticVariations.length > 0) {
              const variation = semanticVariations[replacementIndex % semanticVariations.length];
              replacementIndex++;
              return variation;
            }
            return match;
          });
        });
        return { ...s, paragraphs: updatedParas };
      });
      result = { ...result, sections: updatedSections };
    }
  }

  return result;
}

/**
 * Generate a full keyword optimisation report for a blog post.
 *
 * - Calculates density for all primary and secondary keywords
 * - Identifies keyword placements using identifyKeywordPlacements()
 * - Flags over-optimised keywords (density > targetDensity * 100 * 1.5)
 * - Flags under-optimised keywords (density < targetDensity * 100 * 0.5)
 * - Calculates naturalness score
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.7
 *
 * @param post    - The blog post to analyse
 * @param context - Keyword optimisation context
 * @returns Full KeywordOptimizationResult
 */
export function generateOptimizationReport(
  post: BlogPost,
  context: KeywordOptimizationContext
): KeywordOptimizationResult {
  const { primaryKeywords, secondaryKeywords, targetDensity } = context;
  const allKeywords = [...primaryKeywords, ...secondaryKeywords];

  // Build full text for density calculation
  const allText = [
    post.title,
    ...post.sections.flatMap(s => [s.heading, ...s.paragraphs]),
    ...(post.faq ? post.faq.flatMap(f => [f.question, f.answer]) : []),
  ].join(' ');

  // Calculate density for each keyword
  const keywordDensity = new Map<string, number>();
  for (const keyword of allKeywords) {
    keywordDensity.set(keyword, calculateKeywordDensity(allText, keyword));
  }

  // Identify placements
  const keywordPlacements = identifyKeywordPlacements(post, allKeywords);

  // Thresholds based on targetDensity (e.g. 0.015 → 1.5%)
  const targetPercent = targetDensity * 100;
  const overThreshold = targetPercent * 1.5;
  const underThreshold = targetPercent * 0.5;

  const overOptimized: string[] = [];
  const underOptimized: string[] = [];

  for (const [keyword, density] of keywordDensity) {
    if (density > overThreshold) {
      overOptimized.push(keyword);
    } else if (density < underThreshold) {
      underOptimized.push(keyword);
    }
  }

  // Naturalness score (only primary keywords affect naturalness)
  const naturalnessScore = assessNaturalness(post, primaryKeywords);

  return {
    keywordDensity,
    keywordPlacements,
    overOptimized,
    underOptimized,
    naturalnessScore,
  };
}

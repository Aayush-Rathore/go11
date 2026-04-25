/**
 * Readability Metrics Calculator
 *
 * Implements Flesch Reading Ease score, average paragraph length,
 * and active voice percentage for SEO content quality assessment.
 *
 * Requirements: 6.1, 6.2, 6.4
 */

import { syllable } from 'syllable';
import type { BlogPost } from '@/lib/blog';

/**
 * Strip HTML tags from a string, returning plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Split text into sentences using . ! ? as delimiters.
 * Filters out empty strings after splitting.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Split text into words, filtering empty tokens.
 */
function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

/**
 * Calculate the Flesch Reading Ease score for a given text.
 *
 * Formula: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
 *
 * Returns 0 if there are no sentences or words.
 * Result is clamped to the range [0, 100].
 *
 * Requirements: 6.1
 */
export function calculateFleschScore(text: string): number {
  const plain = stripHtml(text);
  const sentences = splitSentences(plain);
  const words = splitWords(plain);

  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }

  const totalSyllables = words.reduce((sum, word) => sum + syllable(word), 0);

  const score =
    206.835 -
    1.015 * (words.length / sentences.length) -
    84.6 * (totalSyllables / words.length);

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate the average word count per paragraph across all sections of a post.
 *
 * Each paragraph string (which may contain HTML) is stripped before counting.
 * Returns 0 if the post has no paragraphs.
 *
 * Requirements: 6.2
 */
export function calculateAvgParagraphLength(post: BlogPost): number {
  const paragraphs: string[] = post.sections.flatMap((section) => section.paragraphs);

  if (paragraphs.length === 0) {
    return 0;
  }

  const totalWords = paragraphs.reduce((sum, para) => {
    const plain = stripHtml(para);
    return sum + splitWords(plain).length;
  }, 0);

  return totalWords / paragraphs.length;
}

/**
 * Passive voice patterns to detect.
 * Matches constructions like "was/were/is/are/been/being + past participle".
 * Covers both regular (-ed) and common irregular past participles.
 */
const IRREGULAR_PAST_PARTICIPLES =
  'written|done|seen|known|shown|given|taken|made|found|told|sent|built|brought|bought|caught|taught|thought|heard|held|kept|left|lost|met|paid|read|said|sold|spent|stood|understood|won|worn|broken|chosen|driven|eaten|fallen|forgotten|frozen|grown|hidden|ridden|risen|run|spoken|stolen|sworn|thrown|woken';

const PAST_PARTICIPLE = `(?:\\w+ed|${IRREGULAR_PAST_PARTICIPLES})`;

const PASSIVE_PATTERNS = [
  new RegExp(`\\bwas\\s+${PAST_PARTICIPLE}\\b`, 'i'),
  new RegExp(`\\bwere\\s+${PAST_PARTICIPLE}\\b`, 'i'),
  new RegExp(`\\bis\\s+${PAST_PARTICIPLE}\\b`, 'i'),
  new RegExp(`\\bare\\s+${PAST_PARTICIPLE}\\b`, 'i'),
  new RegExp(`\\bbeen\\s+${PAST_PARTICIPLE}\\b`, 'i'),
  new RegExp(`\\bbeing\\s+${PAST_PARTICIPLE}\\b`, 'i'),
];

/**
 * Calculate the percentage of sentences written in active voice.
 *
 * Passive voice is detected by matching common auxiliary + past-participle patterns.
 * Active voice % = (sentences without passive voice / total sentences) * 100
 *
 * Returns 100 if there are no sentences.
 *
 * Requirements: 6.4
 */
export function calculateActiveVoicePercent(text: string): number {
  const plain = stripHtml(text);
  const sentences = splitSentences(plain);

  if (sentences.length === 0) {
    return 100;
  }

  const passiveCount = sentences.filter((sentence) =>
    PASSIVE_PATTERNS.some((pattern) => pattern.test(sentence))
  ).length;

  const activeCount = sentences.length - passiveCount;
  return (activeCount / sentences.length) * 100;
}

/**
 * Quality Standards and Result interfaces
 *
 * Requirements: 6.3, 6.5, 6.6, 6.7, 6.8
 */
export interface QualityStandards {
  minFleschScore: number; // 60
  maxParagraphWords: number; // 150
  minActiveVoicePercent: number; // 80
  requiresExamples: boolean;
  requiresActionableSteps: boolean;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-100
  metrics: {
    fleschReadingEase: number;
    avgParagraphLength: number;
    activeVoicePercent: number;
    hasExamples: boolean;
    hasActionableSteps: boolean;
    logicalFlow: boolean;
    technicalTermsExplained: boolean;
    userIntentAlignment: number; // 0-100
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Detect whether the post contains examples.
 * Scans all paragraphs for common example-indicator phrases.
 *
 * Requirements: 6.5
 */
export function detectExamples(post: BlogPost): boolean {
  const EXAMPLE_PHRASES = [
    'for example',
    'for instance',
    'such as',
    ' like ',
    'e.g.',
    'consider',
    'imagine',
  ];

  const allText = post.sections
    .flatMap((s) => s.paragraphs)
    .join(' ')
    .toLowerCase();

  return EXAMPLE_PHRASES.some((phrase) => allText.includes(phrase));
}

/**
 * Detect whether the post contains actionable steps.
 * Looks for numbered lists, bullet points, or imperative verbs at sentence start.
 *
 * Requirements: 6.5
 */
export function detectActionableSteps(post: BlogPost): boolean {
  const IMPERATIVE_VERBS = [
    'select',
    'choose',
    'download',
    'install',
    'click',
    'go',
    'open',
    'enter',
    'set',
    'enable',
    'disable',
    'check',
    'verify',
    'follow',
    'start',
    'create',
    'add',
    'remove',
    'update',
  ];

  const numberedListPattern = /^\s*\d+\.\s/m;
  const bulletPattern = /^\s*[-*•]\s/m;
  const imperativePattern = new RegExp(
    `(?:^|[.!?]\\s+)(${IMPERATIVE_VERBS.join('|')})\\b`,
    'im'
  );

  const allText = post.sections.flatMap((s) => s.paragraphs).join('\n');
  const plainText = stripHtml(allText);

  return (
    numberedListPattern.test(plainText) ||
    bulletPattern.test(plainText) ||
    imperativePattern.test(plainText)
  );
}

/**
 * Assess whether the post has logical flow between sections.
 * Returns true if at least 30% of sections have transition words in their first paragraph.
 *
 * Requirements: 6.6
 */
export function assessLogicalFlow(post: BlogPost): boolean {
  const TRANSITION_WORDS = [
    'first',
    'next',
    'then',
    'finally',
    'additionally',
    'furthermore',
    'however',
    'in conclusion',
    'to summarise',
    'in summary',
    'as a result',
    'therefore',
  ];

  const sections = post.sections;
  if (sections.length === 0) return false;

  const sectionsWithTransitions = sections.filter((section) => {
    if (section.paragraphs.length === 0) return false;
    const firstPara = stripHtml(section.paragraphs[0]).toLowerCase();
    return TRANSITION_WORDS.some((word) => firstPara.includes(word));
  });

  return sectionsWithTransitions.length / sections.length >= 0.3;
}

/**
 * Assess how well the post aligns with user search intent via target keywords.
 * Returns a 0-100 score based on keyword presence in title, headings, and first paragraph.
 *
 * Requirements: 6.7
 */
export function assessUserIntentAlignment(
  post: BlogPost,
  targetKeywords: string[]
): number {
  if (targetKeywords.length === 0) return 0;

  const titleLower = post.title.toLowerCase();
  const headingsLower = post.sections.map((s) => s.heading.toLowerCase());
  const firstParaLower =
    post.sections.length > 0 && post.sections[0].paragraphs.length > 0
      ? stripHtml(post.sections[0].paragraphs[0]).toLowerCase()
      : '';

  let score = 0;

  for (const keyword of targetKeywords) {
    const kw = keyword.toLowerCase();
    if (titleLower.includes(kw)) score += 20;
    if (headingsLower.some((h) => h.includes(kw))) score += 15;
    if (firstParaLower.includes(kw)) score += 15;
  }

  return Math.min(100, score);
}

/**
 * Generate a comprehensive quality report for a blog post.
 *
 * Scoring rubric:
 *   Flesch >= minFleschScore:            20 pts
 *   Avg paragraph <= maxParagraphWords:  15 pts
 *   Active voice >= minActiveVoicePercent: 15 pts
 *   Has examples:                        15 pts
 *   Has actionable steps:                15 pts
 *   Logical flow:                        10 pts
 *   User intent alignment >= 50:         10 pts
 *
 * passed = score >= 70
 *
 * Requirements: 6.3, 6.8
 */
export function generateQualityReport(
  post: BlogPost,
  standards: QualityStandards,
  targetKeywords: string[] = []
): QualityCheckResult {
  // Gather full text for readability metrics
  const fullText = post.sections.flatMap((s) => s.paragraphs).join(' ');

  const fleschReadingEase = calculateFleschScore(fullText);
  const avgParagraphLength = calculateAvgParagraphLength(post);
  const activeVoicePercent = calculateActiveVoicePercent(fullText);
  const hasExamples = detectExamples(post);
  const hasActionableSteps = detectActionableSteps(post);
  const logicalFlow = assessLogicalFlow(post);
  const userIntentAlignment = assessUserIntentAlignment(post, targetKeywords);

  // technicalTermsExplained: proxy via examples detection (examples often explain terms)
  const technicalTermsExplained = hasExamples;

  // Calculate score
  let score = 0;
  if (fleschReadingEase >= standards.minFleschScore) score += 20;
  if (avgParagraphLength <= standards.maxParagraphWords) score += 15;
  if (activeVoicePercent >= standards.minActiveVoicePercent) score += 15;
  if (hasExamples) score += 15;
  if (hasActionableSteps) score += 15;
  if (logicalFlow) score += 10;
  if (userIntentAlignment >= 50) score += 10;

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (fleschReadingEase < standards.minFleschScore) {
    issues.push(
      `Flesch Reading Ease score (${fleschReadingEase.toFixed(1)}) is below the minimum of ${standards.minFleschScore}.`
    );
    recommendations.push(
      'Simplify sentences and use shorter words to improve readability.'
    );
  }

  if (avgParagraphLength > standards.maxParagraphWords) {
    issues.push(
      `Average paragraph length (${avgParagraphLength.toFixed(0)} words) exceeds the maximum of ${standards.maxParagraphWords} words.`
    );
    recommendations.push('Break long paragraphs into shorter, focused chunks.');
  }

  if (activeVoicePercent < standards.minActiveVoicePercent) {
    issues.push(
      `Active voice percentage (${activeVoicePercent.toFixed(1)}%) is below the minimum of ${standards.minActiveVoicePercent}%.`
    );
    recommendations.push(
      'Rewrite passive voice constructions to use active voice.'
    );
  }

  if (standards.requiresExamples && !hasExamples) {
    issues.push('No examples detected in the content.');
    recommendations.push(
      'Add concrete examples using phrases like "for example" or "such as".'
    );
  }

  if (standards.requiresActionableSteps && !hasActionableSteps) {
    issues.push('No actionable steps detected in the content.');
    recommendations.push(
      'Include numbered steps or imperative instructions to guide readers.'
    );
  }

  if (!logicalFlow) {
    issues.push('Content lacks sufficient transition words between sections.');
    recommendations.push(
      'Add transition phrases (e.g., "next", "furthermore", "in conclusion") to the opening of sections.'
    );
  }

  if (userIntentAlignment < 50) {
    issues.push(
      `User intent alignment score (${userIntentAlignment}) is below 50.`
    );
    recommendations.push(
      'Include target keywords in the title, headings, and opening paragraph.'
    );
  }

  return {
    passed: score >= 70,
    score,
    metrics: {
      fleschReadingEase,
      avgParagraphLength,
      activeVoicePercent,
      hasExamples,
      hasActionableSteps,
      logicalFlow,
      technicalTermsExplained,
      userIntentAlignment,
    },
    issues,
    recommendations,
  };
}

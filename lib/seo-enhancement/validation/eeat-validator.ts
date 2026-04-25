/**
 * EEAT Validator
 * Validates E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) standards.
 * Task 7.1: Author and credentials validation
 */

import type { BlogPost } from '@/lib/blog';
import type { EEATValidationResult } from './types';

/**
 * Generic/vague credential patterns that fail specificity check.
 * A credential is considered generic if it matches one of these patterns
 * and contains no additional qualifying detail.
 */
const GENERIC_CREDENTIAL_PATTERNS: RegExp[] = [
  /^writer$/i,
  /^editor$/i,
  /^author$/i,
  /^contributor$/i,
  /^staff$/i,
  /^admin$/i,
  /^blogger$/i,
  /^journalist$/i,
  /^reporter$/i,
  /^content\s+writer$/i,
  /^content\s+creator$/i,
  /^content\s+editor$/i,
  /^freelance\s+writer$/i,
  /^guest\s+writer$/i,
  /^guest\s+author$/i,
];

/**
 * Indicators that a credential string is specific and relevant.
 * At least one must be present for the credential to pass.
 */
const SPECIFICITY_INDICATORS: RegExp[] = [
  /\d+\+?\s*years?/i,           // "8+ years", "5 years"
  /analyst/i,                    // "Strategy Analyst"
  /specialist/i,                 // "SEO Specialist"
  /expert/i,                     // "Fantasy Expert"
  /strategist/i,                 // "Content Strategist"
  /consultant/i,                 // "Digital Consultant"
  /researcher/i,                 // "Data Researcher"
  /manager/i,                    // "Product Manager"
  /director/i,                   // "Editorial Director"
  /head\s+of/i,                  // "Head of Content"
  /lead\s+/i,                    // "Lead Analyst"
  /senior\s+/i,                  // "Senior Writer"
  /certified/i,                  // "Certified..."
  /degree|diploma|mba|phd/i,     // academic qualifications
  /in\s+(fantasy|gaming|cricket|sports|seo|digital|content|analytics|finance)/i,
];

/**
 * Checks whether a credential string is specific and relevant.
 * Returns false for generic single-word titles like "Writer" or "Editor".
 */
function isSpecificCredential(credential: string): boolean {
  const trimmed = credential.trim();

  // Reject if it matches a known generic pattern exactly
  for (const pattern of GENERIC_CREDENTIAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  // Must contain at least one specificity indicator
  for (const indicator of SPECIFICITY_INDICATORS) {
    if (indicator.test(trimmed)) {
      return true;
    }
  }

  // A credential with more than 4 words is likely specific enough
  // (e.g., "Fantasy Strategy Analyst with contest analytics background")
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount > 4) {
    return true;
  }

  return false;
}

/**
 * Validates that a blog post has an author field with a non-empty value.
 * Requirements: 4.1
 */
export function validateAuthorAttribution(post: BlogPost): boolean {
  return typeof post.author === 'string' && post.author.trim().length > 0;
}

/**
 * Validates that a blog post has a reviewer field with a non-empty value.
 * The reviewer field is optional — if absent the function returns false,
 * but callers should treat absence as a warning rather than a hard failure
 * unless the scoring rubric requires it.
 * Requirements: 4.2
 */
export function validateReviewerAttribution(post: BlogPost): boolean {
  return typeof post.reviewer === 'string' && post.reviewer.trim().length > 0;
}

/**
 * Validates that the author (and reviewer, if present) have specific,
 * relevant credentials rather than generic titles.
 *
 * The BlogPost interface stores author/reviewer as plain name strings
 * (e.g., "Rohan Mehta"). When credentials are embedded in the name field
 * (e.g., "Rohan Mehta, Fantasy Strategy Analyst with 8+ years") they are
 * validated for specificity. Plain names without a credential suffix are
 * accepted as-is because the credential detail may live elsewhere on the
 * page (author bio section). The check only fails when a credential suffix
 * is present but is generic (e.g., "Rohan Mehta, Writer").
 * Requirements: 4.3
 */
export function validateCredentials(post: BlogPost): boolean {
  const fieldsToCheck: (string | undefined)[] = [post.author, post.reviewer];

  for (const field of fieldsToCheck) {
    if (!field) continue;

    // If the field contains a comma, the part after the comma is treated
    // as the credential/title portion.
    const commaIndex = field.indexOf(',');
    if (commaIndex !== -1) {
      const credentialPart = field.slice(commaIndex + 1).trim();
      if (credentialPart.length > 0 && !isSpecificCredential(credentialPart)) {
        return false;
      }
    }
    // Plain name with no credential suffix — no credential to validate.
  }

  return true;
}

/**
 * Validates whether a blog post's updatedAt date is within the last 90 days
 * from the reference date 2026-04-25.
 * Requirements: 4.8
 */
export function validateFreshness(post: BlogPost): boolean {
  if (!post.updatedAt) return false;
  const updated = new Date(post.updatedAt);
  if (isNaN(updated.getTime())) return false;
  const reference = new Date('2026-04-25');
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  return reference.getTime() - updated.getTime() <= ninetyDaysMs;
}

/**
 * Generates a full EEATValidationResult using the scoring rubric:
 *   - Author attribution:    15 pts
 *   - Reviewer attribution:  10 pts
 *   - Credentials:            0 pts base, -10 pts if generic
 *   - Experience indicators: 10 pts (1 indicator) / 20 pts (2+ indicators)
 *   - Data support:          10 pts (1 reference) / 15 pts (2+ references)
 *   - Safety addressing:     15 pts
 *   - Freshness:             15 pts
 *   - Transparency:          10 pts (has both author AND reviewer)
 *
 * Minimum passing score: 70 / 100
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */
export function generateValidationResult(post: BlogPost): EEATValidationResult {
  // Run all checks
  const hasAuthor = validateAuthorAttribution(post);
  const hasReviewer = validateReviewerAttribution(post);
  const hasCredentials = validateCredentials(post);
  const experienceIndicators = detectExperienceIndicators(post);
  const dataReferences = detectDataSupport(post);
  const addressesSafety = detectSafetyAddressing(post);
  const isCurrentlyDated = validateFreshness(post);
  const demonstratesExperience = experienceIndicators.length >= 1;
  const hasDataSupport = dataReferences.length >= 1;

  // Calculate score
  let score = 0;

  // Author attribution: 15 pts
  if (hasAuthor) score += 15;

  // Reviewer attribution: 10 pts
  if (hasReviewer) score += 10;

  // Credentials: deduct 10 pts if generic
  if (!hasCredentials) score -= 10;

  // Experience indicators: 10 pts for 1, 20 pts for 2+
  if (experienceIndicators.length >= 2) {
    score += 20;
  } else if (experienceIndicators.length === 1) {
    score += 10;
  }

  // Data support: 10 pts for 1, 15 pts for 2+
  if (dataReferences.length >= 2) {
    score += 15;
  } else if (dataReferences.length === 1) {
    score += 10;
  }

  // Safety addressing: 15 pts
  if (addressesSafety) score += 15;

  // Freshness: 15 pts
  if (isCurrentlyDated) score += 15;

  // Transparency (both author AND reviewer): 10 pts
  if (hasAuthor && hasReviewer) score += 10;

  const passed = score >= 70;

  // Build issues and recommendations
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!hasAuthor) {
    issues.push('Missing author attribution.');
    recommendations.push(
      "Add an author field with the author's name and relevant credentials."
    );
  }

  if (!hasReviewer) {
    issues.push('Missing reviewer attribution.');
    recommendations.push(
      'Add a reviewer field to strengthen trustworthiness and earn the transparency bonus.'
    );
  }

  if (!hasCredentials) {
    issues.push('Author or reviewer credentials are too generic.');
    recommendations.push(
      'Use specific credentials such as "Fantasy Strategy Analyst with 8+ years in contest analytics" instead of generic titles like "Writer" or "Editor".'
    );
  }

  if (experienceIndicators.length === 0) {
    issues.push('No experience indicators detected in content.');
    recommendations.push(
      'Add first-person language, specific examples, practical advice, or platform-specific details to demonstrate real experience.'
    );
  } else if (experienceIndicators.length === 1) {
    recommendations.push(
      `Only 1 experience indicator found (${experienceIndicators[0]}). Add at least one more (e.g., first-person language, specific examples) to reach full experience score.`
    );
  }

  if (dataReferences.length === 0) {
    issues.push('No data support references detected.');
    recommendations.push(
      'Include statistics, percentages, research references, or performance metrics to support claims.'
    );
  } else if (dataReferences.length === 1) {
    recommendations.push(
      `Only 1 data reference found (${dataReferences[0]}). Add a second type (e.g., research references alongside metric references) to reach full data support score.`
    );
  }

  if (!addressesSafety) {
    issues.push('Content does not address safety or responsible play.');
    recommendations.push(
      'Include responsible gaming guidance, security tips, or account safety advice.'
    );
  }

  if (!isCurrentlyDated) {
    issues.push('Content has not been updated within the last 90 days.');
    recommendations.push(
      'Update the updatedAt date and refresh content to reflect current information (reference date: 2026-04-25).'
    );
  }

  return {
    passed,
    score,
    checks: {
      hasAuthor,
      hasReviewer,
      hasCredentials,
      demonstratesExperience,
      hasDataSupport,
      addressesSafety,
      isCurrentlyDated,
    },
    issues,
    recommendations,
  };
}

// ---------------------------------------------------------------------------
// Task 7.2: Experience and expertise detection
// Requirements: 4.4, 4.5, 4.6, 4.7
// ---------------------------------------------------------------------------

/**
 * Collects all paragraph text from a post's sections into a single array.
 */
function getAllParagraphs(post: BlogPost): string[] {
  return post.sections.flatMap((s) => s.paragraphs);
}

/**
 * Detects experience indicators in a blog post.
 * Scans all section paragraphs for first-person language, specific examples,
 * practical advice (imperative verbs), and platform-specific details.
 * Returns an array of indicator category strings found.
 * Requirements: 4.4, 4.5
 */
export function detectExperienceIndicators(post: BlogPost): string[] {
  const paragraphs = getAllParagraphs(post);
  const combined = paragraphs.join(' ');

  const found = new Set<string>();

  // First-person language
  if (/\b(I|we|my|our|I've|we've)\b/.test(combined)) {
    found.add('first-person language');
  }

  // Specific examples
  if (/\b(for example|for instance|such as|like when)\b/i.test(combined)) {
    found.add('specific examples');
  }

  // Practical advice — imperative verbs at sentence start
  // Sentence start = beginning of string, or after ". " / "! " / "? "
  const imperativePattern =
    /(?:^|[.!?]\s+)(Select|Choose|Avoid|Use|Check|Enable|Disable|Install|Download|Set|Review|Track|Apply|Start|Begin|Keep|Ensure|Verify|Confirm|Grant|Clear|Delete|Restart|Update|Scan|Follow)\b/;
  if (imperativePattern.test(combined)) {
    found.add('practical advice');
  }

  // Platform-specific details — GoPlay11 features, contest types, specific numbers
  const platformPattern =
    /\b(GoPlay11|Goplay11|goplay11|Go Play 11|contest|lineup|captain|vice-captain|bankroll|\d+\+?\s*years?|\d{3,})\b/i;
  if (platformPattern.test(combined)) {
    found.add('platform-specific details');
  }

  return Array.from(found);
}

/**
 * Detects data support references in a blog post.
 * Scans for metric references (percentages, currency amounts, word counts),
 * research references, and performance metrics.
 * Returns an array of data reference category strings found.
 * Requirements: 4.6
 */
export function detectDataSupport(post: BlogPost): string[] {
  const paragraphs = getAllParagraphs(post);
  const combined = paragraphs.join(' ');

  const found = new Set<string>();

  // Metric references: percentages, numbers with context, currency
  if (/\d+%|₹\d+|\d+\s*words?\b/i.test(combined)) {
    found.add('metric references');
  }

  // Research references
  if (/\b(according to|data shows?|research|statistics|study|studies)\b/i.test(combined)) {
    found.add('research references');
  }

  // Performance metrics
  if (/\b(clicks?|impressions?|CTR|ranking|position)\b/i.test(combined)) {
    found.add('performance metrics');
  }

  return Array.from(found);
}

/**
 * Detects whether a blog post addresses safety and responsible play.
 * Scans for responsible gaming language, security mentions, and account safety.
 * Returns true if any safety-related content is found.
 * Requirements: 4.7
 */
export function detectSafetyAddressing(post: BlogPost): boolean {
  const paragraphs = getAllParagraphs(post);
  const combined = paragraphs.join(' ');

  // Responsible play
  if (/\b(responsible gaming|responsible play|safe play|gaming limits?)\b/i.test(combined)) {
    return true;
  }

  // Security
  if (/\b(safe download|official source|trusted|secure|verify)\b/i.test(combined)) {
    return true;
  }

  // Account safety
  if (/\b(password|account security|two-factor)\b/i.test(combined)) {
    return true;
  }

  return false;
}

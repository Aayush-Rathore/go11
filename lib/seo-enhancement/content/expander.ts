/**
 * Content Expander
 *
 * Orchestrates the full blog post expansion pipeline:
 *   1. Calculate current word count
 *   2. Identify content gaps from keyword opportunities
 *   3. Generate new sections to fill those gaps
 *   4. Generate FAQ items from related queries
 *   5. Integrate target keywords naturally
 *   6. Return an ExpandedBlogPost with full expansion metadata
 */

import type { BlogPost } from '@/lib/blog';
import type { ExpansionContext, ExpandedBlogPost } from './types';
import { calculateCurrentWordCount, identifyContentGaps } from './analyzer';
import { generateNewSections, generateFAQItems } from './generator';

const MIN_FAQ_ITEMS = 5;

/**
 * Expand a blog post to meet the target word count.
 *
 * The function is pure — it never mutates the original post object.
 * Author and reviewer attributions are always preserved unchanged.
 *
 * @param post    - The original blog post to expand
 * @param context - Expansion parameters including target word count and keyword data
 * @returns       An ExpandedBlogPost with new sections, FAQ items, and metadata
 */
export function expandBlogPost(
  post: BlogPost,
  context: ExpansionContext
): ExpandedBlogPost {
  const { targetWordCount, keywordOpportunities, relatedQueries } = context;

  // Step 1 – baseline word count
  const originalWordCount = calculateCurrentWordCount(post);

  // Step 2 – short-circuit if already at target
  if (originalWordCount >= targetWordCount) {
    return buildExpandedPost(post, [], post.faq ?? [], originalWordCount, []);
  }

  // Step 3 – identify content gaps
  const gaps = identifyContentGaps(post, keywordOpportunities);

  // Step 4 – generate new sections to close the word-count gap
  const wordsNeeded = targetWordCount - originalWordCount;
  const newSections = generateNewSections(post, gaps, wordsNeeded);

  // Step 5 – generate FAQ items if needed
  const existingFaq = post.faq ?? [];
  let faqItems = [...existingFaq];
  if (existingFaq.length < MIN_FAQ_ITEMS) {
    const generated = generateFAQItems(post, relatedQueries);
    // Merge: keep existing, append generated (deduped by question text)
    const existingQs = new Set(existingFaq.map(f => f.question.toLowerCase()));
    for (const item of generated) {
      if (!existingQs.has(item.question.toLowerCase())) {
        faqItems.push(item);
        existingQs.add(item.question.toLowerCase());
      }
    }
  }

  // Step 6 – integrate target keywords into new sections
  const keywordsIntegrated = integrateKeywords(newSections, keywordOpportunities);

  return buildExpandedPost(post, newSections, faqItems, originalWordCount, keywordsIntegrated);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Assemble the final ExpandedBlogPost from the original post plus new content.
 */
function buildExpandedPost(
  post: BlogPost,
  newSections: import('@/lib/blog').BlogSection[],
  faqItems: import('@/lib/site').FaqItem[],
  originalWordCount: number,
  keywordsIntegrated: string[]
): ExpandedBlogPost {
  const expandedPost: BlogPost = {
    ...post,
    // Preserve author and reviewer exactly as-is
    author: post.author,
    reviewer: post.reviewer,
    sections: [...post.sections, ...newSections],
    faq: faqItems.length > 0 ? faqItems : post.faq,
  };

  const finalWordCount = calculateCurrentWordCount(expandedPost);

  return {
    ...expandedPost,
    expansionMetadata: {
      originalWordCount,
      finalWordCount,
      sectionsAdded: newSections.length,
      faqItemsAdded: faqItems.length - (post.faq?.length ?? 0),
      keywordsIntegrated,
      expansionDate: new Date().toISOString().split('T')[0],
    },
  };
}

/**
 * Integrate target keywords naturally into new section paragraphs.
 *
 * Targets a 1–2% keyword density across the new content. Returns the list
 * of keywords that were successfully woven in.
 */
function integrateKeywords(
  sections: import('@/lib/blog').BlogSection[],
  opportunities: import('../gsc/types').KeywordOpportunity[]
): string[] {
  if (sections.length === 0 || opportunities.length === 0) return [];

  // Count total words in new sections
  const totalNewWords = sections.reduce(
    (sum, s) =>
      sum +
      s.paragraphs.reduce(
        (pSum, p) => pSum + p.trim().split(/\s+/).filter(w => w.length > 0).length,
        0
      ),
    0
  );

  // Target: 1–2% density → allow up to 2% of total words as keyword mentions
  const maxKeywordMentions = Math.max(1, Math.floor(totalNewWords * 0.02));

  const integrated: string[] = [];
  let mentionsUsed = 0;

  // Sort by opportunity score descending so we integrate the most valuable keywords first
  const sorted = [...opportunities].sort((a, b) => b.opportunityScore - a.opportunityScore);

  for (const opp of sorted) {
    if (mentionsUsed >= maxKeywordMentions) break;

    const keyword = opp.keyword.toLowerCase();

    // Check if keyword already appears naturally in any new section
    const alreadyPresent = sections.some(s =>
      s.paragraphs.some(p => p.toLowerCase().includes(keyword))
    );

    if (alreadyPresent) {
      integrated.push(opp.keyword);
      mentionsUsed++;
      continue;
    }

    // Try to insert the keyword into the first paragraph of the first section
    // that doesn't already contain it, by appending a natural sentence
    for (const section of sections) {
      if (mentionsUsed >= maxKeywordMentions) break;
      const firstPara = section.paragraphs[0];
      if (!firstPara.toLowerCase().includes(keyword)) {
        section.paragraphs[0] =
          firstPara +
          ` For users searching for ${opp.keyword}, GoPlay11 remains one of the most reliable options available in India.`;
        integrated.push(opp.keyword);
        mentionsUsed++;
        break;
      }
    }
  }

  return integrated;
}

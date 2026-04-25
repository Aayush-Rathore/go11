/**
 * Content Analysis Utilities
 * 
 * Provides functions to analyze existing blog content and identify expansion opportunities.
 */

import type { BlogPost } from '@/lib/blog';
import type { KeywordOpportunity } from '../gsc/types';

/**
 * Calculate the current word count of a blog post
 * 
 * Counts all words in all paragraphs across all sections, excluding HTML tags.
 * This provides an accurate baseline for content expansion planning.
 * 
 * @param post - The blog post to analyze
 * @returns Total word count excluding HTML tags
 * 
 * @example
 * const post = {
 *   sections: [
 *     { heading: 'Intro', paragraphs: ['This has five words here.'] },
 *     { heading: 'Body', paragraphs: ['Another <a href="/link">five</a> words.'] }
 *   ]
 * };
 * const count = calculateCurrentWordCount(post); // Returns 10
 */
export function calculateCurrentWordCount(post: BlogPost): number {
  let totalWords = 0;

  for (const section of post.sections) {
    for (const paragraph of section.paragraphs) {
      // Remove HTML tags from the paragraph
      const textWithoutTags = paragraph.replace(/<[^>]*>/g, '');
      
      // Split by whitespace and filter out empty strings
      const words = textWithoutTags
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      totalWords += words.length;
    }
  }

  return totalWords;
}

/**
 * Identify content gaps by comparing existing sections with keyword opportunities
 * 
 * Analyzes the blog post's existing section headings and paragraph content to find
 * high-opportunity keywords that are not adequately covered. This helps guide
 * content expansion by identifying missing topics.
 * 
 * @param post - The blog post to analyze
 * @param keywords - Array of keyword opportunities from GSC analysis
 * @returns Array of keyword strings representing content gaps (topics not covered)
 * 
 * @example
 * const post = {
 *   slug: 'test-post',
 *   sections: [
 *     { heading: 'How to download', paragraphs: ['Download instructions...'] }
 *   ]
 * };
 * const keywords = [
 *   { keyword: 'download guide', opportunityScore: 50, ... },
 *   { keyword: 'installation tips', opportunityScore: 80, ... }
 * ];
 * const gaps = identifyContentGaps(post, keywords);
 * // Returns ['installation tips'] - 'download guide' is covered, 'installation tips' is not
 */
export function identifyContentGaps(
  post: BlogPost,
  keywords: KeywordOpportunity[]
): string[] {
  // Combine all existing content into a searchable text corpus
  const existingContent = buildContentCorpus(post);
  
  // Identify keywords that are not adequately covered
  const gaps: string[] = [];
  
  for (const keyword of keywords) {
    if (!isKeywordCovered(keyword.keyword, existingContent)) {
      gaps.push(keyword.keyword);
    }
  }
  
  // Sort by opportunity score (highest first) to prioritize most valuable gaps
  gaps.sort((a, b) => {
    const scoreA = keywords.find(k => k.keyword === a)?.opportunityScore ?? 0;
    const scoreB = keywords.find(k => k.keyword === b)?.opportunityScore ?? 0;
    return scoreB - scoreA;
  });
  
  return gaps;
}

/**
 * Build a searchable corpus of all content in the blog post
 * 
 * Combines section headings and paragraph text (with HTML removed) into a
 * single lowercase string for keyword matching.
 * 
 * @param post - The blog post to process
 * @returns Lowercase text corpus of all content
 */
function buildContentCorpus(post: BlogPost): string {
  const parts: string[] = [];
  
  // Include title and description
  parts.push(post.title.toLowerCase());
  parts.push(post.description.toLowerCase());
  
  // Include all section headings and paragraphs
  for (const section of post.sections) {
    parts.push(section.heading.toLowerCase());
    
    for (const paragraph of section.paragraphs) {
      // Remove HTML tags before adding to corpus
      const textWithoutTags = paragraph.replace(/<[^>]*>/g, '');
      parts.push(textWithoutTags.toLowerCase());
    }
  }
  
  // Include FAQ questions if present
  if (post.faq) {
    for (const faqItem of post.faq) {
      parts.push(faqItem.question.toLowerCase());
      parts.push(faqItem.answer.toLowerCase());
    }
  }
  
  return parts.join(' ');
}

/**
 * Check if a keyword is adequately covered in the existing content
 * 
 * Uses fuzzy matching to determine if a keyword or its variations appear
 * in the content corpus. A keyword is considered covered if:
 * - The exact phrase appears in the content, OR
 * - All significant words from the keyword appear in the content
 * 
 * @param keyword - The keyword to check
 * @param corpus - The content corpus to search
 * @returns true if keyword is covered, false if it's a content gap
 */
function isKeywordCovered(keyword: string, corpus: string): boolean {
  const normalizedKeyword = keyword.toLowerCase();
  
  // Check for exact phrase match
  if (corpus.includes(normalizedKeyword)) {
    return true;
  }
  
  // Check if all significant words from the keyword appear in the corpus
  // (allows for variations in phrasing)
  const keywordWords = normalizedKeyword
    .split(/\s+/)
    .filter(word => word.length > 3); // Filter out short words like "the", "and", "for"
  
  if (keywordWords.length === 0) {
    // If keyword is too short or only contains short words, require exact match
    return false;
  }
  
  // Keyword is covered if at least 70% of significant words appear in corpus
  const matchedWords = keywordWords.filter(word => corpus.includes(word));
  const coverageRatio = matchedWords.length / keywordWords.length;
  
  return coverageRatio >= 0.7;
}

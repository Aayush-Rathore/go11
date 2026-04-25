/**
 * Demo script to test content analyzer with real blog posts
 */

import { BLOG_POSTS } from '@/lib/blog';
import { calculateCurrentWordCount, identifyContentGaps } from './analyzer';
import type { KeywordOpportunity } from '../gsc/types';

// Test with the first blog post
const post = BLOG_POSTS[0];

console.log('=== Content Analysis Demo ===\n');
console.log(`Analyzing: "${post.title}"\n`);

// Calculate word count
const wordCount = calculateCurrentWordCount(post);
console.log(`Current word count: ${wordCount} words`);
console.log(`Target word count: 2500 words`);
console.log(`Words needed: ${2500 - wordCount} words\n`);

// Test content gap identification with sample keywords
const sampleKeywords: KeywordOpportunity[] = [
  {
    keyword: 'fantasy app comparison',
    impressions: 500,
    clicks: 25,
    ctr: 5,
    position: 8,
    opportunityScore: 85,
    category: 'high-impression-low-ctr'
  },
  {
    keyword: 'goplay11 features',
    impressions: 300,
    clicks: 30,
    ctr: 10,
    position: 5,
    opportunityScore: 70,
    category: 'position-4-20'
  },
  {
    keyword: 'download goplay11 app',
    impressions: 800,
    clicks: 80,
    ctr: 10,
    position: 3,
    opportunityScore: 90,
    category: 'high-impression-low-ctr'
  },
  {
    keyword: 'fantasy app security',
    impressions: 200,
    clicks: 10,
    ctr: 5,
    position: 12,
    opportunityScore: 60,
    category: 'position-4-20'
  }
];

const gaps = identifyContentGaps(post, sampleKeywords);

console.log('Content gaps identified (missing topics):');
if (gaps.length === 0) {
  console.log('  None - all keywords are covered!');
} else {
  gaps.forEach((gap, index) => {
    const keyword = sampleKeywords.find(k => k.keyword === gap);
    console.log(`  ${index + 1}. "${gap}" (score: ${keyword?.opportunityScore})`);
  });
}

console.log('\n=== Analysis Complete ===');

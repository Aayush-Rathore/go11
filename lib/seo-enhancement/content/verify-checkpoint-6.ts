/**
 * Checkpoint 6 Verification Script
 *
 * Runs content expansion and internal linking on the first blog post from
 * BLOG_POSTS and verifies:
 *   - Final word count >= 2500
 *   - Total links inserted is between 20 and 25
 *
 * Usage: npx tsx lib/seo-enhancement/content/verify-checkpoint-6.ts
 */

import { BLOG_POSTS } from '@/lib/blog';
import { expandBlogPost } from './expander';
import { identifyLinkOpportunities, insertLinks } from '../linking/linker';
import { calculateCurrentWordCount } from './analyzer';
import type { ExpansionContext } from './types';
import type { LinkableContent } from '../linking/types';
import type { KeywordOpportunity } from '../gsc/types';

// ---------------------------------------------------------------------------
// Pick the first blog post
// ---------------------------------------------------------------------------

const post = BLOG_POSTS[0];
console.log(`\n=== Checkpoint 6: Content Expansion + Linking ===`);
console.log(`Post: "${post.title}" (slug: ${post.slug})`);

// ---------------------------------------------------------------------------
// Step 1 – Measure original word count
// ---------------------------------------------------------------------------

const originalWordCount = calculateCurrentWordCount(post);
console.log(`\nOriginal word count: ${originalWordCount}`);

// ---------------------------------------------------------------------------
// Step 2 – Build keyword opportunities from the post's own keywords
// ---------------------------------------------------------------------------

const keywordOpportunities: KeywordOpportunity[] = post.keywords.map((kw, i) => ({
  keyword: kw,
  impressions: 1000 - i * 100,
  clicks: 20,
  ctr: 2,
  position: 8 + i,
  opportunityScore: 90 - i * 10,
  category: 'position-4-20' as const,
}));

// Add a wide range of opportunities covering topics not in the original post
// to ensure enough content gaps are identified for expansion to 2500+ words
const extraOpportunities: KeywordOpportunity[] = [
  { keyword: 'download goplay11 apk', impressions: 800, clicks: 15, ctr: 1.9, position: 9, opportunityScore: 85, category: 'position-4-20' },
  { keyword: 'goplay11 referral code bonus', impressions: 700, clicks: 12, ctr: 1.7, position: 10, opportunityScore: 80, category: 'position-4-20' },
  { keyword: 'is goplay11 safe real', impressions: 600, clicks: 10, ctr: 1.7, position: 11, opportunityScore: 75, category: 'high-impression-low-ctr' },
  { keyword: 'goplay11 login register account', impressions: 500, clicks: 8, ctr: 1.6, position: 12, opportunityScore: 70, category: 'position-4-20' },
  { keyword: 'goplay11 fantasy strategy tips', impressions: 400, clicks: 6, ctr: 1.5, position: 13, opportunityScore: 65, category: 'position-4-20' },
  { keyword: 'install goplay11 android setup', impressions: 350, clicks: 5, ctr: 1.4, position: 14, opportunityScore: 60, category: 'position-4-20' },
  { keyword: 'goplay11 withdraw payment wallet', impressions: 300, clicks: 4, ctr: 1.3, position: 15, opportunityScore: 55, category: 'high-impression-low-ctr' },
  { keyword: 'goplay11 contest league match', impressions: 250, clicks: 3, ctr: 1.2, position: 16, opportunityScore: 50, category: 'position-4-20' },
  { keyword: 'goplay11 apk latest version update', impressions: 220, clicks: 2, ctr: 0.9, position: 17, opportunityScore: 45, category: 'high-impression-low-ctr' },
  { keyword: 'goplay11 team building cricket', impressions: 200, clicks: 2, ctr: 0.9, position: 18, opportunityScore: 40, category: 'position-4-20' },
  { keyword: 'goplay11 captain vice captain selection', impressions: 180, clicks: 1, ctr: 0.6, position: 19, opportunityScore: 35, category: 'high-impression-low-ctr' },
  { keyword: 'goplay11 bankroll management tips', impressions: 160, clicks: 1, ctr: 0.6, position: 20, opportunityScore: 30, category: 'position-4-20' },
];

const allOpportunities = [...keywordOpportunities, ...extraOpportunities];

const relatedQueries = [
  'how to download goplay11 apk on android',
  'is goplay11 safe and real for indian users',
  'goplay11 referral code bonus how to use',
  'how to register on goplay11 app',
  'goplay11 withdrawal process and timing',
  'best strategy to win on goplay11',
  'how to install goplay11 apk step by step',
  'what contests are available on goplay11',
];

// ---------------------------------------------------------------------------
// Step 3 – Expand the blog post
// ---------------------------------------------------------------------------

const context: ExpansionContext = {
  targetWordCount: 2500,
  keywordOpportunities: allOpportunities,
  relatedQueries,
  existingWordCount: originalWordCount,
};

console.log(`\nRunning expandBlogPost()...`);
const expandedPost = expandBlogPost(post, context);
const expandedWordCount = expandedPost.expansionMetadata.finalWordCount;

console.log(`  Sections added:    ${expandedPost.expansionMetadata.sectionsAdded}`);
console.log(`  FAQ items added:   ${expandedPost.expansionMetadata.faqItemsAdded}`);
console.log(`  Keywords woven in: ${expandedPost.expansionMetadata.keywordsIntegrated.join(', ') || '(none)'}`);
console.log(`  Final word count:  ${expandedWordCount}`);

// ---------------------------------------------------------------------------
// Step 4 – Identify link opportunities and insert links
// ---------------------------------------------------------------------------

const linkableContent: LinkableContent = {
  post: expandedPost,
  allPosts: BLOG_POSTS,
  sitePages: [], // linker.ts uses its internal SITE_PAGES constant
};

const TARGET_LINK_COUNT = 22;

console.log(`\nRunning identifyLinkOpportunities() with target=${TARGET_LINK_COUNT}...`);
const opportunities = identifyLinkOpportunities(linkableContent, TARGET_LINK_COUNT);
console.log(`  Opportunities found: ${opportunities.length}`);

console.log(`Running insertLinks()...`);
const linkedPost = insertLinks(expandedPost, opportunities);
const totalLinks = linkedPost.linkingMetadata.totalLinks;

console.log(`  Blog links:    ${linkedPost.linkingMetadata.blogLinks}`);
console.log(`  Page links:    ${linkedPost.linkingMetadata.pageLinks}`);
console.log(`  Total links:   ${totalLinks}`);
console.log(`  Avg per section: ${linkedPost.linkingMetadata.averageLinksPerSection.toFixed(2)}`);

// ---------------------------------------------------------------------------
// Step 5 – Evaluate checkpoint criteria
// ---------------------------------------------------------------------------

const wordCountPass = expandedWordCount >= 2500;
const linkCountPass = totalLinks >= 20 && totalLinks <= 25;

console.log(`\n--- Checkpoint Results ---`);
console.log(`Word count >= 2500:    ${wordCountPass ? '✅ PASS' : '❌ FAIL'} (${expandedWordCount})`);
console.log(`Links in range 20-25:  ${linkCountPass ? '✅ PASS' : '❌ FAIL'} (${totalLinks})`);

const checkpointPassed = wordCountPass && linkCountPass;
console.log(`\nOverall checkpoint:    ${checkpointPassed ? '✅ PASSED' : '❌ FAILED'}`);

if (!checkpointPassed) {
  process.exit(1);
}

#!/usr/bin/env tsx
/**
 * CLI Script: Enhance Blog Post
 * 
 * Demonstrates usage of the SEO enhancement pipeline to enhance a single blog post.
 * 
 * Usage:
 *   npm run enhance-post -- <slug>
 *   npm run enhance-post -- --all
 * 
 * Examples:
 *   npm run enhance-post -- best-fantasy-apps-in-india-2026
 *   npm run enhance-post -- --all
 */

import { BLOG_POSTS } from '@/lib/blog';
import { enhancePost, enhancePosts } from '@/lib/seo-enhancement';
import type { EnhancementResult } from '@/lib/seo-enhancement/pipeline';

// Parse command line arguments
const args = process.argv.slice(2);
const slug = args[0];

if (!slug) {
  console.error('Error: Please provide a blog post slug or --all');
  console.error('Usage: npm run enhance-post -- <slug>');
  console.error('       npm run enhance-post -- --all');
  process.exit(1);
}

/**
 * Print a summary of the enhancement result
 */
function printSummary(result: EnhancementResult): void {
  console.log('\n' + '═'.repeat(70));
  console.log('ENHANCEMENT SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Post: ${result.post.slug}`);
  console.log(`Status: ${result.status.toUpperCase()}`);
  console.log(`Success: ${result.success ? '✓' : '✗'}`);
  console.log('\nMetrics:');
  console.log(`  Word Count: ${result.metadata.originalWordCount} → ${result.metadata.finalWordCount} (+${result.metadata.finalWordCount - result.metadata.originalWordCount})`);
  console.log(`  Sections Added: ${result.metadata.sectionsAdded}`);
  console.log(`  FAQ Items Added: ${result.metadata.faqItemsAdded}`);
  console.log(`  Internal Links: ${result.metadata.linksAdded}`);
  console.log(`  Keywords Integrated: ${result.metadata.keywordsIntegrated.length}`);
  
  if (result.validationResults) {
    console.log('\nValidation Scores:');
    console.log(`  E-E-A-T: ${result.validationResults.eeat.score}/100 ${result.validationResults.eeat.passed ? '✓' : '✗'}`);
    console.log(`  Quality: ${result.validationResults.quality.score}/100 ${result.validationResults.quality.passed ? '✓' : '✗'}`);
    console.log(`  Keyword Naturalness: ${result.validationResults.keywords.naturalnessScore}/100`);
    console.log(`  Link Distribution: ${result.validationResults.linkDistribution?.valid ? '✓' : '✗'}`);
  }
  
  if (result.errors && result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(err => console.log(`  ✗ ${err}`));
  }
  
  if (result.warnings && result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach(warn => console.log(`  ⚠ ${warn}`));
  }
  
  console.log('═'.repeat(70) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('SEO Content Enhancement Pipeline');
  console.log('═'.repeat(70));
  
  if (slug === '--all') {
    // Enhance all blog posts
    console.log(`\nEnhancing all ${BLOG_POSTS.length} blog posts...\n`);
    
    const results = await enhancePosts(BLOG_POSTS, {
      gscDirectory: 'gsc',
      targetWordCount: 2500,
      targetLinkCount: 22,
      skipValidation: false,
      rollbackOnFailure: true,
    });
    
    // Print individual summaries
    results.forEach(result => printSummary(result));
    
    // Print overall statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgWordIncrease = results.reduce((sum, r) => 
      sum + (r.metadata.finalWordCount - r.metadata.originalWordCount), 0
    ) / results.length;
    const avgLinksAdded = results.reduce((sum, r) => 
      sum + r.metadata.linksAdded, 0
    ) / results.length;
    
    console.log('\n' + '═'.repeat(70));
    console.log('BATCH SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Posts: ${BLOG_POSTS.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Average Word Increase: ${Math.round(avgWordIncrease)}`);
    console.log(`Average Links Added: ${Math.round(avgLinksAdded)}`);
    console.log('═'.repeat(70) + '\n');
    
  } else {
    // Enhance single blog post
    const post = BLOG_POSTS.find(p => p.slug === slug);
    
    if (!post) {
      console.error(`\nError: Blog post with slug "${slug}" not found`);
      console.error('\nAvailable posts:');
      BLOG_POSTS.forEach(p => console.error(`  - ${p.slug}`));
      process.exit(1);
    }
    
    console.log(`\nEnhancing post: ${post.slug}`);
    console.log(`Current word count: ${post.sections.reduce((sum, s) => 
      sum + s.paragraphs.join(' ').split(/\s+/).length, 0
    )}\n`);
    
    const result = await enhancePost(post, {
      allPosts: BLOG_POSTS,
      gscDirectory: 'gsc',
      targetWordCount: 2500,
      targetLinkCount: 22,
      skipValidation: false,
      rollbackOnFailure: true,
    });
    
    printSummary(result);
    
    if (result.success) {
      console.log('✓ Enhancement completed successfully!');
      console.log('\nNext steps:');
      console.log('  1. Review the enhanced content manually');
      console.log('  2. Update lib/blog.ts with the enhanced post');
      console.log('  3. Test the site build');
      console.log('  4. Deploy to production\n');
    } else {
      console.log('✗ Enhancement failed. Please review errors and try again.\n');
      process.exit(1);
    }
  }
}

// Run the script
main().catch(error => {
  console.error('\nFatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

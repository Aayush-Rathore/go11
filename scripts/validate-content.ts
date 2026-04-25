#!/usr/bin/env tsx
/**
 * CLI Script: Validate Content
 * 
 * Runs validation checks on blog posts without modifying content.
 * Useful for checking content quality before or after manual edits.
 * 
 * Usage:
 *   npm run validate -- <slug>     # Validate single post
 *   npm run validate -- --all      # Validate all posts
 * 
 * Examples:
 *   npm run validate -- best-fantasy-apps-in-india-2026
 *   npm run validate -- --all
 */

import { BLOG_POSTS } from '@/lib/blog';
import { calculateCurrentWordCount } from '@/lib/seo-enhancement/content/analyzer';
import { generateValidationResult } from '@/lib/seo-enhancement/validation/eeat-validator';
import { generateOptimizationReport } from '@/lib/seo-enhancement/content/keyword-optimizer';
import { generateQualityReport } from '@/lib/seo-enhancement/content/quality-checker';
import { generateAnalysisReport } from '@/lib/seo-enhancement/gsc/analyzer';
import type { BlogPost } from '@/lib/blog';
import type { KeywordOptimizationContext, QualityStandards } from '@/lib/seo-enhancement/validation/types';
import { SEO_ENHANCEMENT_CONFIG } from '@/lib/seo-enhancement/seo-enhancement.config';

// Parse command line arguments
const args = process.argv.slice(2);
const slug = args.find(arg => !arg.startsWith('--'));
const validateAll = args.includes('--all');

if (!slug && !validateAll) {
  console.error('Error: Please provide a blog post slug or --all');
  console.error('');
  console.error('Usage:');
  console.error('  npm run validate -- <slug>     # Validate single post');
  console.error('  npm run validate -- --all      # Validate all posts');
  console.error('');
  console.error('Examples:');
  console.error('  npm run validate -- best-fantasy-apps-in-india-2026');
  console.error('  npm run validate -- --all');
  process.exit(1);
}

/**
 * Validate a single blog post
 */
function validatePost(post: BlogPost, gscDirectory: string = 'gsc'): void {
  console.log('\n' + '═'.repeat(70));
  console.log(`VALIDATION REPORT: ${post.slug}`);
  console.log('═'.repeat(70));
  
  // Calculate word count
  const wordCount = calculateCurrentWordCount(post);
  console.log(`\nWord Count: ${wordCount} ${wordCount >= 2500 ? '✓' : '✗ (minimum 2500)'}`);
  
  // Count internal links
  const linkCount = post.sections.reduce((count, section) => {
    return count + section.paragraphs.reduce((pCount, para) => {
      const matches = para.match(/<a class="text-link"/g);
      return pCount + (matches ? matches.length : 0);
    }, 0);
  }, 0);
  console.log(`Internal Links: ${linkCount} ${linkCount >= 20 && linkCount <= 25 ? '✓' : '⚠ (target 20-25)'}`);
  
  // E-E-A-T Validation
  console.log('\n' + '─'.repeat(70));
  console.log('E-E-A-T VALIDATION');
  console.log('─'.repeat(70));
  
  const eeAtResult = generateValidationResult(post);
  console.log(`Score: ${eeAtResult.score}/100 ${eeAtResult.passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log('\nChecks:');
  console.log(`  Author Attribution:      ${eeAtResult.checks.hasAuthor ? '✓' : '✗'}`);
  console.log(`  Reviewer Attribution:    ${eeAtResult.checks.hasReviewer ? '✓' : '✗'}`);
  console.log(`  Credentials:             ${eeAtResult.checks.hasCredentials ? '✓' : '✗'}`);
  console.log(`  Experience Indicators:   ${eeAtResult.checks.demonstratesExperience ? '✓' : '✗'}`);
  console.log(`  Data Support:            ${eeAtResult.checks.hasDataSupport ? '✓' : '✗'}`);
  console.log(`  Safety Addressing:       ${eeAtResult.checks.addressesSafety ? '✓' : '✗'}`);
  console.log(`  Content Freshness:       ${eeAtResult.checks.isCurrentlyDated ? '✓' : '✗'}`);
  
  if (eeAtResult.issues.length > 0) {
    console.log('\nIssues:');
    eeAtResult.issues.forEach(issue => console.log(`  ✗ ${issue}`));
  }
  
  if (eeAtResult.recommendations.length > 0) {
    console.log('\nRecommendations:');
    eeAtResult.recommendations.forEach(rec => console.log(`  → ${rec}`));
  }
  
  // Keyword Optimization
  console.log('\n' + '─'.repeat(70));
  console.log('KEYWORD OPTIMIZATION');
  console.log('─'.repeat(70));
  
  try {
    const gscReport = generateAnalysisReport(gscDirectory);
    const postKeywords = post.keywords.map(k => k.toLowerCase());
    const relevantOpportunities = gscReport.keywordOpportunities.filter(opp => {
      const oppKeyword = opp.keyword.toLowerCase();
      return postKeywords.some(pk => 
        oppKeyword.includes(pk) || pk.includes(oppKeyword)
      );
    });
    
    const primaryKeywords = relevantOpportunities.slice(0, 3).map(opp => opp.keyword);
    const secondaryKeywords = relevantOpportunities.slice(3, 8).map(opp => opp.keyword);
    
    const semanticVariations: string[] = [];
    for (const [primary, variations] of gscReport.semanticClusters) {
      if (primaryKeywords.some(pk => pk.toLowerCase() === primary.toLowerCase())) {
        semanticVariations.push(...variations);
      }
    }
    
    const keywordContext: KeywordOptimizationContext = {
      primaryKeywords,
      secondaryKeywords,
      semanticVariations: semanticVariations.slice(0, 5),
      targetDensity: SEO_ENHANCEMENT_CONFIG.keywords.primaryDensityMin,
    };
    
    const keywordResult = generateOptimizationReport(post, keywordContext);
    console.log(`Naturalness Score: ${keywordResult.naturalnessScore}/100 ${keywordResult.naturalnessScore >= 70 ? '✓' : '✗'}`);
    
    console.log('\nKeyword Density:');
    for (const [keyword, density] of keywordResult.keywordDensity) {
      const status = density >= 1 && density <= 2 ? '✓' : density > 2 ? '⚠ high' : '⚠ low';
      console.log(`  ${keyword}: ${density.toFixed(2)}% ${status}`);
    }
    
    if (keywordResult.overOptimized.length > 0) {
      console.log('\nOver-optimized keywords:');
      keywordResult.overOptimized.forEach(kw => console.log(`  ⚠ ${kw}`));
    }
    
    if (keywordResult.underOptimized.length > 0) {
      console.log('\nUnder-optimized keywords:');
      keywordResult.underOptimized.forEach(kw => console.log(`  ⚠ ${kw}`));
    }
    
  } catch (error) {
    console.log('⚠️  Could not load GSC data for keyword analysis');
    console.log(`   Error: ${(error as Error).message}`);
  }
  
  // Content Quality
  console.log('\n' + '─'.repeat(70));
  console.log('CONTENT QUALITY');
  console.log('─'.repeat(70));
  
  const qualityStandards: QualityStandards = {
    minFleschScore: SEO_ENHANCEMENT_CONFIG.validation.minFleschScore,
    maxParagraphWords: SEO_ENHANCEMENT_CONFIG.content.maxParagraphWords,
    minActiveVoicePercent: SEO_ENHANCEMENT_CONFIG.validation.minActiveVoicePercent,
    requiresExamples: true,
    requiresActionableSteps: true,
  };
  
  const qualityResult = generateQualityReport(post, qualityStandards, post.keywords);
  console.log(`Score: ${qualityResult.score}/100 ${qualityResult.passed ? '✓ PASS' : '✗ FAIL'}`);
  
  console.log('\nMetrics:');
  console.log(`  Flesch Reading Ease:     ${qualityResult.metrics.fleschReadingEase.toFixed(1)} ${qualityResult.metrics.fleschReadingEase >= 60 ? '✓' : '✗'}`);
  console.log(`  Avg Paragraph Length:    ${qualityResult.metrics.avgParagraphLength.toFixed(0)} words ${qualityResult.metrics.avgParagraphLength <= 150 ? '✓' : '✗'}`);
  console.log(`  Active Voice:            ${qualityResult.metrics.activeVoicePercent.toFixed(1)}% ${qualityResult.metrics.activeVoicePercent >= 80 ? '✓' : '✗'}`);
  console.log(`  Has Examples:            ${qualityResult.metrics.hasExamples ? '✓' : '✗'}`);
  console.log(`  Has Actionable Steps:    ${qualityResult.metrics.hasActionableSteps ? '✓' : '✗'}`);
  console.log(`  Logical Flow:            ${qualityResult.metrics.logicalFlow ? '✓' : '✗'}`);
  console.log(`  Technical Terms Explained: ${qualityResult.metrics.technicalTermsExplained ? '✓' : '✗'}`);
  console.log(`  User Intent Alignment:   ${qualityResult.metrics.userIntentAlignment}/100`);
  
  if (qualityResult.issues.length > 0) {
    console.log('\nIssues:');
    qualityResult.issues.forEach(issue => console.log(`  ✗ ${issue}`));
  }
  
  if (qualityResult.recommendations.length > 0) {
    console.log('\nRecommendations:');
    qualityResult.recommendations.forEach(rec => console.log(`  → ${rec}`));
  }
  
  // Overall Status
  console.log('\n' + '─'.repeat(70));
  console.log('OVERALL STATUS');
  console.log('─'.repeat(70));
  
  const allPassed = eeAtResult.passed && qualityResult.passed && wordCount >= 2500;
  const status = allPassed ? '✓ PASS' : '✗ NEEDS IMPROVEMENT';
  console.log(`Status: ${status}`);
  
  console.log('═'.repeat(70) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('SEO Content Validation');
  console.log('═'.repeat(70));
  
  if (validateAll) {
    // Validate all blog posts
    console.log(`\nValidating all ${BLOG_POSTS.length} blog posts...\n`);
    
    let passCount = 0;
    let failCount = 0;
    
    for (const post of BLOG_POSTS) {
      validatePost(post);
      
      // Quick check for pass/fail
      const wordCount = calculateCurrentWordCount(post);
      const eeAtResult = generateValidationResult(post);
      const qualityStandards: QualityStandards = {
        minFleschScore: SEO_ENHANCEMENT_CONFIG.validation.minFleschScore,
        maxParagraphWords: SEO_ENHANCEMENT_CONFIG.content.maxParagraphWords,
        minActiveVoicePercent: SEO_ENHANCEMENT_CONFIG.validation.minActiveVoicePercent,
        requiresExamples: true,
        requiresActionableSteps: true,
      };
      const qualityResult = generateQualityReport(post, qualityStandards, post.keywords);
      
      if (eeAtResult.passed && qualityResult.passed && wordCount >= 2500) {
        passCount++;
      } else {
        failCount++;
      }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('VALIDATION SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Posts: ${BLOG_POSTS.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log('═'.repeat(70) + '\n');
    
    if (failCount > 0) {
      console.log('⚠️  Some posts failed validation. Review reports above.');
      process.exit(1);
    }
    
  } else {
    // Validate single blog post
    const post = BLOG_POSTS.find(p => p.slug === slug);
    
    if (!post) {
      console.error(`\nError: Blog post with slug "${slug}" not found`);
      console.error('\nAvailable posts:');
      BLOG_POSTS.forEach(p => console.error(`  - ${p.slug}`));
      process.exit(1);
    }
    
    validatePost(post);
  }
}

// Run the script
main().catch(error => {
  console.error('\nFatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

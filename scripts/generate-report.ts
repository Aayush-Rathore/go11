#!/usr/bin/env tsx
/**
 * CLI Script: Generate Report
 * 
 * Generates comprehensive analysis reports for SEO content enhancement.
 * 
 * Usage:
 *   npm run report -- gsc          # GSC data analysis report
 *   npm run report -- tracking     # Implementation tracking report
 *   npm run report -- summary      # Overall enhancement summary
 * 
 * Examples:
 *   npm run report -- gsc
 *   npm run report -- tracking
 *   npm run report -- summary
 */

import { BLOG_POSTS } from '@/lib/blog';
import { generateAnalysisReport } from '@/lib/seo-enhancement/gsc/analyzer';
import { calculateCurrentWordCount } from '@/lib/seo-enhancement/content/analyzer';
import { generateValidationResult } from '@/lib/seo-enhancement/validation/eeat-validator';
import { generateQualityReport } from '@/lib/seo-enhancement/content/quality-checker';
import { getUpdateRecord, generateProgressReport } from '@/lib/seo-enhancement/tracking/tracker';
import type { QualityStandards } from '@/lib/seo-enhancement/validation/types';
import { SEO_ENHANCEMENT_CONFIG } from '@/lib/seo-enhancement/seo-enhancement.config';

// Parse command line arguments
const args = process.argv.slice(2);
const reportType = args[0];

if (!reportType || !['gsc', 'tracking', 'summary'].includes(reportType)) {
  console.error('Error: Please specify a valid report type');
  console.error('');
  console.error('Usage:');
  console.error('  npm run report -- gsc          # GSC data analysis report');
  console.error('  npm run report -- tracking     # Implementation tracking report');
  console.error('  npm run report -- summary      # Overall enhancement summary');
  console.error('');
  console.error('Examples:');
  console.error('  npm run report -- gsc');
  console.error('  npm run report -- tracking');
  console.error('  npm run report -- summary');
  process.exit(1);
}

/**
 * Generate GSC Analysis Report
 */
function generateGSCReport(): void {
  console.log('═'.repeat(80));
  console.log('GSC DATA ANALYSIS REPORT');
  console.log('═'.repeat(80));
  console.log();

  try {
    const report = generateAnalysisReport('gsc');

    // Traffic Distribution
    console.log('─'.repeat(80));
    console.log('TRAFFIC DISTRIBUTION');
    console.log('─'.repeat(80));
    console.log(`Total Clicks:       ${report.trafficDistribution.totalClicks.toLocaleString()}`);
    console.log(`Total Impressions:  ${report.trafficDistribution.totalImpressions.toLocaleString()}`);
    console.log(`Average CTR:        ${(report.trafficDistribution.avgCTR * 100).toFixed(2)}%`);
    console.log(`Average Position:   ${report.trafficDistribution.avgPosition.toFixed(1)}`);
    console.log();

    // Keyword Opportunities
    console.log('─'.repeat(80));
    console.log('TOP KEYWORD OPPORTUNITIES');
    console.log('─'.repeat(80));
    console.log(`Total Opportunities: ${report.keywordOpportunities.length}\n`);

    const byCategory = {
      'high-impression-low-ctr': report.keywordOpportunities.filter(k => k.category === 'high-impression-low-ctr'),
      'position-4-20': report.keywordOpportunities.filter(k => k.category === 'position-4-20'),
      'zero-click': report.keywordOpportunities.filter(k => k.category === 'zero-click'),
    };

    console.log(`High Impression, Low CTR: ${byCategory['high-impression-low-ctr'].length}`);
    console.log(`Position 4-20 (Improvable): ${byCategory['position-4-20'].length}`);
    console.log(`Zero Clicks: ${byCategory['zero-click'].length}`);
    console.log();

    // Top 15 opportunities
    console.log('Top 15 Opportunities:');
    console.log('-'.repeat(80));
    report.keywordOpportunities.slice(0, 15).forEach((opp, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ${opp.keyword}`);
      console.log(`    Impressions: ${opp.impressions.toLocaleString()}, Clicks: ${opp.clicks}, CTR: ${(opp.ctr * 100).toFixed(2)}%, Position: ${opp.position.toFixed(1)}`);
      console.log(`    Score: ${opp.opportunityScore.toFixed(1)}, Category: ${opp.category}`);
    });
    console.log();

    // Semantic Clusters
    console.log('─'.repeat(80));
    console.log('SEMANTIC KEYWORD CLUSTERS');
    console.log('─'.repeat(80));
    console.log(`Total Clusters: ${report.semanticClusters.size}\n`);

    let clusterCount = 0;
    for (const [primary, variations] of report.semanticClusters) {
      clusterCount++;
      console.log(`${clusterCount}. "${primary}" (${variations.length} variations)`);
      console.log(`   ${variations.slice(0, 5).join(', ')}${variations.length > 5 ? '...' : ''}`);
      
      if (clusterCount >= 10) {
        const remaining = report.semanticClusters.size - 10;
        if (remaining > 0) {
          console.log(`\n... and ${remaining} more clusters`);
        }
        break;
      }
    }
    console.log();

    // Page Performance
    console.log('─'.repeat(80));
    console.log('PAGE PERFORMANCE');
    console.log('─'.repeat(80));

    const pagesByStatus = {
      'performing': report.pagePerformance.filter(p => p.status === 'performing'),
      'underperforming': report.pagePerformance.filter(p => p.status === 'underperforming'),
      'zero-traffic': report.pagePerformance.filter(p => p.status === 'zero-traffic'),
    };

    console.log(`Performing:       ${pagesByStatus.performing.length} pages`);
    console.log(`Underperforming:  ${pagesByStatus.underperforming.length} pages`);
    console.log(`Zero Traffic:     ${pagesByStatus['zero-traffic'].length} pages`);
    console.log();

    if (pagesByStatus['zero-traffic'].length > 0) {
      console.log('Pages with Zero Traffic:');
      pagesByStatus['zero-traffic'].forEach(page => {
        console.log(`  - ${page.url} (${page.impressions.toLocaleString()} impressions)`);
      });
      console.log();
    }

    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error generating GSC report:');
    console.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Generate Implementation Tracking Report
 */
function generateTrackingReport(): void {
  console.log('═'.repeat(80));
  console.log('IMPLEMENTATION TRACKING REPORT');
  console.log('═'.repeat(80));
  console.log();

  try {
    const progressReport = generateProgressReport();

    console.log('─'.repeat(80));
    console.log('PROGRESS OVERVIEW');
    console.log('─'.repeat(80));
    console.log(`Total Posts:       ${progressReport.totalPosts}`);
    console.log(`Completed:         ${progressReport.completedPosts}`);
    console.log(`In Progress:       ${progressReport.inProgressPosts}`);
    console.log(`Failed:            ${progressReport.failedPosts}`);
    console.log(`Pending:           ${progressReport.totalPosts - progressReport.completedPosts - progressReport.inProgressPosts - progressReport.failedPosts}`);
    console.log();

    // Aggregate Metrics
    console.log('─'.repeat(80));
    console.log('AGGREGATE METRICS');
    console.log('─'.repeat(80));
    console.log(`Avg Word Count Increase: ${Math.round(progressReport.aggregateMetrics.avgWordCountIncrease)}`);
    console.log(`Avg Links Added:         ${Math.round(progressReport.aggregateMetrics.avgLinksAdded)}`);
    console.log(`Avg E-E-A-T Score:       ${progressReport.aggregateMetrics.avgEEATScore.toFixed(1)}/100`);
    console.log(`Avg Quality Score:       ${progressReport.aggregateMetrics.avgQualityScore.toFixed(1)}/100`);
    console.log();

    // Timeline
    console.log('─'.repeat(80));
    console.log('TIMELINE');
    console.log('─'.repeat(80));
    console.log(`Start Date:           ${progressReport.timeline.startDate}`);
    console.log(`Last Update:          ${progressReport.timeline.lastUpdateDate}`);
    console.log(`Estimated Completion: ${progressReport.timeline.estimatedCompletion}`);
    console.log();

    // Individual Post Status
    console.log('─'.repeat(80));
    console.log('POST STATUS');
    console.log('─'.repeat(80));

    for (const post of BLOG_POSTS) {
      const record = getUpdateRecord(post.slug);
      
      if (record) {
        const statusIcon = record.status === 'completed' ? '✓' : 
                          record.status === 'in-progress' ? '⏳' : 
                          record.status === 'failed-validation' ? '✗' : '○';
        
        console.log(`${statusIcon} ${post.slug}`);
        console.log(`   Status: ${record.status}`);
        console.log(`   Word Count: ${record.changes.wordCountBefore} → ${record.changes.wordCountAfter} (+${record.changes.wordCountAfter - record.changes.wordCountBefore})`);
        console.log(`   Links Added: ${record.changes.linksAdded}`);
        console.log(`   E-E-A-T: ${record.validationResults.eeat.score}/100, Quality: ${record.validationResults.quality.score}/100`);
        console.log(`   Updated: ${record.updateDate}`);
      } else {
        console.log(`○ ${post.slug}`);
        console.log(`   Status: pending`);
      }
      console.log();
    }

    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error generating tracking report:');
    console.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Generate Overall Enhancement Summary
 */
function generateSummaryReport(): void {
  console.log('═'.repeat(80));
  console.log('SEO CONTENT ENHANCEMENT SUMMARY');
  console.log('═'.repeat(80));
  console.log();

  // Current State Analysis
  console.log('─'.repeat(80));
  console.log('CURRENT STATE');
  console.log('─'.repeat(80));

  let totalWordCount = 0;
  let totalLinks = 0;
  let passedEEAT = 0;
  let passedQuality = 0;

  const qualityStandards: QualityStandards = {
    minFleschScore: SEO_ENHANCEMENT_CONFIG.validation.minFleschScore,
    maxParagraphWords: SEO_ENHANCEMENT_CONFIG.content.maxParagraphWords,
    minActiveVoicePercent: SEO_ENHANCEMENT_CONFIG.validation.minActiveVoicePercent,
    requiresExamples: true,
    requiresActionableSteps: true,
  };

  for (const post of BLOG_POSTS) {
    const wordCount = calculateCurrentWordCount(post);
    totalWordCount += wordCount;

    const linkCount = post.sections.reduce((count, section) => {
      return count + section.paragraphs.reduce((pCount, para) => {
        const matches = para.match(/<a class="text-link"/g);
        return pCount + (matches ? matches.length : 0);
      }, 0);
    }, 0);
    totalLinks += linkCount;

    const eeAtResult = generateValidationResult(post);
    if (eeAtResult.passed) passedEEAT++;

    const qualityResult = generateQualityReport(post, qualityStandards, post.keywords);
    if (qualityResult.passed) passedQuality++;
  }

  const avgWordCount = Math.round(totalWordCount / BLOG_POSTS.length);
  const avgLinks = Math.round(totalLinks / BLOG_POSTS.length);

  console.log(`Total Posts:           ${BLOG_POSTS.length}`);
  console.log(`Average Word Count:    ${avgWordCount}`);
  console.log(`Average Internal Links: ${avgLinks}`);
  console.log(`E-E-A-T Compliance:    ${passedEEAT}/${BLOG_POSTS.length} (${((passedEEAT / BLOG_POSTS.length) * 100).toFixed(0)}%)`);
  console.log(`Quality Compliance:    ${passedQuality}/${BLOG_POSTS.length} (${((passedQuality / BLOG_POSTS.length) * 100).toFixed(0)}%)`);
  console.log();

  // Target State
  console.log('─'.repeat(80));
  console.log('TARGET STATE');
  console.log('─'.repeat(80));
  console.log(`Target Word Count:     2500+ per post`);
  console.log(`Target Internal Links: 20-25 per post`);
  console.log(`Target E-E-A-T Score:  70+/100`);
  console.log(`Target Quality Score:  70+/100`);
  console.log();

  // Gap Analysis
  console.log('─'.repeat(80));
  console.log('GAP ANALYSIS');
  console.log('─'.repeat(80));

  const postsNeedingExpansion = BLOG_POSTS.filter(p => calculateCurrentWordCount(p) < 2500).length;
  const postsNeedingLinks = BLOG_POSTS.filter(p => {
    const linkCount = p.sections.reduce((count, section) => {
      return count + section.paragraphs.reduce((pCount, para) => {
        const matches = para.match(/<a class="text-link"/g);
        return pCount + (matches ? matches.length : 0);
      }, 0);
    }, 0);
    return linkCount < 20;
  }).length;

  console.log(`Posts needing expansion:     ${postsNeedingExpansion}/${BLOG_POSTS.length}`);
  console.log(`Posts needing more links:    ${postsNeedingLinks}/${BLOG_POSTS.length}`);
  console.log(`Posts needing E-E-A-T work:  ${BLOG_POSTS.length - passedEEAT}/${BLOG_POSTS.length}`);
  console.log(`Posts needing quality work:  ${BLOG_POSTS.length - passedQuality}/${BLOG_POSTS.length}`);
  console.log();

  // Recommendations
  console.log('─'.repeat(80));
  console.log('RECOMMENDATIONS');
  console.log('─'.repeat(80));

  if (postsNeedingExpansion > 0) {
    console.log(`1. Expand ${postsNeedingExpansion} posts to 2500+ words`);
  }
  if (postsNeedingLinks > 0) {
    console.log(`2. Add internal links to ${postsNeedingLinks} posts (target 20-25 per post)`);
  }
  if (BLOG_POSTS.length - passedEEAT > 0) {
    console.log(`3. Improve E-E-A-T compliance for ${BLOG_POSTS.length - passedEEAT} posts`);
  }
  if (BLOG_POSTS.length - passedQuality > 0) {
    console.log(`4. Improve content quality for ${BLOG_POSTS.length - passedQuality} posts`);
  }

  console.log();
  console.log('Next Steps:');
  console.log('  - Run: npm run enhance -- --all');
  console.log('  - Review enhanced content manually');
  console.log('  - Run: npm run validate -- --all');
  console.log('  - Deploy to production');
  console.log();

  console.log('═'.repeat(80) + '\n');
}

/**
 * Main execution
 */
async function main() {
  switch (reportType) {
    case 'gsc':
      generateGSCReport();
      break;
    case 'tracking':
      generateTrackingReport();
      break;
    case 'summary':
      generateSummaryReport();
      break;
    default:
      console.error('Invalid report type');
      process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('\nFatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

#!/usr/bin/env tsx

/**
 * GSC Data Analysis Script
 * 
 * Analyzes Google Search Console CSV files and generates a comprehensive
 * keyword opportunities report for SEO content enhancement.
 */

import { generateAnalysisReport } from '../lib/seo-enhancement/gsc/analyzer';
import type { KeywordOpportunity, PagePerformance } from '../lib/seo-enhancement/gsc/types';

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function formatPercent(num: number): string {
  return `${(num * 100).toFixed(2)}%`;
}

function formatPosition(pos: number): string {
  return pos.toFixed(1);
}

console.log('='.repeat(80));
console.log('GSC DATA ANALYSIS REPORT');
console.log('SEO Content Enhancement - Phase 1');
console.log('='.repeat(80));
console.log();

try {
  // Generate analysis report from /gsc/ directory
  console.log('📊 Analyzing GSC data from /gsc/ directory...\n');
  const report = generateAnalysisReport('gsc');

  // Traffic Distribution Summary
  console.log('━'.repeat(80));
  console.log('TRAFFIC DISTRIBUTION SUMMARY');
  console.log('━'.repeat(80));
  console.log(`Total Clicks:       ${formatNumber(report.trafficDistribution.totalClicks)}`);
  console.log(`Total Impressions:  ${formatNumber(report.trafficDistribution.totalImpressions)}`);
  console.log(`Average CTR:        ${formatPercent(report.trafficDistribution.avgCTR)}`);
  console.log(`Average Position:   ${formatPosition(report.trafficDistribution.avgPosition)}`);
  console.log();

  // Keyword Opportunities
  console.log('━'.repeat(80));
  console.log('TOP KEYWORD OPPORTUNITIES');
  console.log('━'.repeat(80));
  console.log(`Found ${report.keywordOpportunities.length} keyword opportunities\n`);

  // Group by category
  const byCategory = {
    'high-impression-low-ctr': report.keywordOpportunities.filter(k => k.category === 'high-impression-low-ctr'),
    'position-4-20': report.keywordOpportunities.filter(k => k.category === 'position-4-20'),
    'zero-click': report.keywordOpportunities.filter(k => k.category === 'zero-click'),
  };

  console.log(`📈 High Impression, Low CTR: ${byCategory['high-impression-low-ctr'].length} keywords`);
  console.log(`🎯 Position 4-20 (Improvable): ${byCategory['position-4-20'].length} keywords`);
  console.log(`⚠️  Zero Clicks: ${byCategory['zero-click'].length} keywords`);
  console.log();

  // Show top 20 opportunities
  console.log('Top 20 Opportunities by Score:');
  console.log('-'.repeat(80));
  console.log('Rank | Keyword                          | Impr. | Clicks | CTR    | Pos  | Score | Category');
  console.log('-'.repeat(80));

  report.keywordOpportunities.slice(0, 20).forEach((opp, index) => {
    const rank = (index + 1).toString().padStart(4);
    const keyword = opp.keyword.padEnd(32).substring(0, 32);
    const impressions = formatNumber(opp.impressions).padStart(5);
    const clicks = formatNumber(opp.clicks).padStart(6);
    const ctr = formatPercent(opp.ctr).padStart(6);
    const position = formatPosition(opp.position).padStart(4);
    const score = opp.opportunityScore.toFixed(1).padStart(5);
    const category = opp.category === 'high-impression-low-ctr' ? 'High Imp/Low CTR' :
                     opp.category === 'position-4-20' ? 'Position 4-20' : 'Zero Click';

    console.log(`${rank} | ${keyword} | ${impressions} | ${clicks} | ${ctr} | ${position} | ${score} | ${category}`);
  });
  console.log();

  // Semantic Clusters
  console.log('━'.repeat(80));
  console.log('SEMANTIC KEYWORD CLUSTERS');
  console.log('━'.repeat(80));
  console.log(`Found ${report.semanticClusters.size} keyword clusters\n`);

  if (report.semanticClusters.size > 0) {
    console.log('Primary Keyword → Variations:');
    console.log('-'.repeat(80));

    let clusterCount = 0;
    for (const [primary, variations] of report.semanticClusters) {
      clusterCount++;
      console.log(`\n${clusterCount}. "${primary}"`);
      console.log(`   Variations (${variations.length}):`);
      variations.forEach(v => {
        console.log(`   - ${v}`);
      });

      // Only show first 10 clusters to keep output manageable
      if (clusterCount >= 10) {
        const remaining = report.semanticClusters.size - 10;
        if (remaining > 0) {
          console.log(`\n   ... and ${remaining} more clusters`);
        }
        break;
      }
    }
    console.log();
  }

  // Page Performance
  console.log('━'.repeat(80));
  console.log('PAGE PERFORMANCE ANALYSIS');
  console.log('━'.repeat(80));

  const pagesByStatus = {
    'performing': report.pagePerformance.filter(p => p.status === 'performing'),
    'underperforming': report.pagePerformance.filter(p => p.status === 'underperforming'),
    'zero-traffic': report.pagePerformance.filter(p => p.status === 'zero-traffic'),
  };

  console.log(`✅ Performing:       ${pagesByStatus.performing.length} pages`);
  console.log(`⚠️  Underperforming:  ${pagesByStatus.underperforming.length} pages`);
  console.log(`🚫 Zero Traffic:     ${pagesByStatus['zero-traffic'].length} pages`);
  console.log();

  // Show underperforming and zero-traffic pages
  if (pagesByStatus['zero-traffic'].length > 0) {
    console.log('Pages with Zero Traffic (Impressions but No Clicks):');
    console.log('-'.repeat(80));
    pagesByStatus['zero-traffic'].forEach(page => {
      console.log(`- ${page.url}`);
      console.log(`  Impressions: ${formatNumber(page.impressions)}, Position: ${formatPosition(page.position)}`);
    });
    console.log();
  }

  if (pagesByStatus.underperforming.length > 0) {
    console.log('Underperforming Pages (Low CTR or Improvable Position):');
    console.log('-'.repeat(80));
    pagesByStatus.underperforming.slice(0, 10).forEach(page => {
      console.log(`- ${page.url}`);
      console.log(`  Clicks: ${formatNumber(page.clicks)}, Impressions: ${formatNumber(page.impressions)}, CTR: ${formatPercent(page.ctr)}, Position: ${formatPosition(page.position)}`);
    });
    if (pagesByStatus.underperforming.length > 10) {
      console.log(`  ... and ${pagesByStatus.underperforming.length - 10} more underperforming pages`);
    }
    console.log();
  }

  // Key Insights and Recommendations
  console.log('━'.repeat(80));
  console.log('KEY INSIGHTS & RECOMMENDATIONS');
  console.log('━'.repeat(80));
  console.log();

  // Insight 1: Top opportunity keywords
  const topOpportunities = report.keywordOpportunities.slice(0, 5);
  console.log('1. TOP PRIORITY KEYWORDS FOR CONTENT EXPANSION:');
  topOpportunities.forEach((opp, i) => {
    console.log(`   ${i + 1}. "${opp.keyword}" - ${formatNumber(opp.impressions)} impressions, ${formatPercent(opp.ctr)} CTR`);
  });
  console.log();

  // Insight 2: Semantic clusters for content strategy
  if (report.semanticClusters.size > 0) {
    console.log('2. KEYWORD VARIATIONS TO INTEGRATE:');
    let count = 0;
    for (const [primary, variations] of report.semanticClusters) {
      if (count >= 3) break;
      console.log(`   - Use "${primary}" with variations: ${variations.slice(0, 3).join(', ')}`);
      count++;
    }
    console.log();
  }

  // Insight 3: Pages needing immediate attention
  if (pagesByStatus['zero-traffic'].length > 0) {
    console.log('3. PAGES REQUIRING IMMEDIATE ATTENTION (Zero Traffic):');
    pagesByStatus['zero-traffic'].forEach(page => {
      const path = new URL(page.url).pathname;
      console.log(`   - ${path} (${formatNumber(page.impressions)} impressions wasted)`);
    });
    console.log();
  }

  // Insight 4: CTR improvement potential
  const lowCtrOpportunities = byCategory['high-impression-low-ctr'];
  if (lowCtrOpportunities.length > 0) {
    const totalWastedImpressions = lowCtrOpportunities.reduce((sum, k) => sum + k.impressions, 0);
    const potentialClicks = totalWastedImpressions * 0.15; // Assume 15% CTR target
    console.log('4. CTR IMPROVEMENT POTENTIAL:');
    console.log(`   - ${lowCtrOpportunities.length} keywords with low CTR`);
    console.log(`   - ${formatNumber(totalWastedImpressions)} total impressions`);
    console.log(`   - Potential additional clicks if CTR improves to 15%: ${formatNumber(Math.round(potentialClicks))}`);
    console.log();
  }

  // Summary
  console.log('━'.repeat(80));
  console.log('ANALYSIS COMPLETE ✅');
  console.log('━'.repeat(80));
  console.log();
  console.log('Next Steps:');
  console.log('1. Review keyword opportunities and prioritize for content expansion');
  console.log('2. Integrate semantic keyword variations into blog posts');
  console.log('3. Address zero-traffic pages with content improvements');
  console.log('4. Optimize meta descriptions and titles for low-CTR keywords');
  console.log();

} catch (error) {
  console.error('❌ Error analyzing GSC data:');
  console.error(error);
  process.exit(1);
}

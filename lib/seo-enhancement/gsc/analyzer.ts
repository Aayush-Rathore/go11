import fs from 'fs';
import path from 'path';
import type { GSCQueryRow, GSCPageRow, GSCChartRow, KeywordOpportunity, PagePerformance, GSCAnalysisReport } from './types';
import { SEO_ENHANCEMENT_CONFIG } from '../seo-enhancement.config';

/**
 * GSC CSV Parser and Analyzer
 * Handles UTF-8 encoded CSV files from Google Search Console
 */

/**
 * Parse a CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Convert CTR percentage string to decimal number
 * Example: "18.46%" -> 0.1846
 */
function parseCTR(ctrString: string): number {
  const cleaned = ctrString.replace('%', '').trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value / 100;
}

/**
 * Parse Queries.csv file
 * @param filePath - Path to Queries.csv file
 * @returns Array of GSCQueryRow objects
 */
export function parseQueriesCSV(filePath: string): GSCQueryRow[] {
  try {
    // Read file with UTF-8 encoding to handle Hindi characters
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Skip header row
    const dataLines = lines.slice(1);
    const results: GSCQueryRow[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const fields = parseCSVLine(line);

      // Expected format: query, clicks, impressions, CTR, position
      if (fields.length < 5) {
        console.warn(`Skipping malformed row ${i + 2}: insufficient columns`);
        continue;
      }

      const [query, clicksStr, impressionsStr, ctrStr, positionStr] = fields;

      const clicks = parseInt(clicksStr, 10);
      const impressions = parseInt(impressionsStr, 10);
      const ctr = parseCTR(ctrStr);
      const position = parseFloat(positionStr);

      // Validate parsed values
      if (isNaN(clicks) || isNaN(impressions) || isNaN(position)) {
        console.warn(`Skipping malformed row ${i + 2}: invalid numeric values`);
        continue;
      }

      results.push({
        query,
        clicks,
        impressions,
        ctr,
        position,
      });
    }

    if (results.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }

    return results;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Parse Pages.csv file
 * @param filePath - Path to Pages.csv file
 * @returns Array of GSCPageRow objects
 */
export function parsePagesCSV(filePath: string): GSCPageRow[] {
  try {
    // Read file with UTF-8 encoding
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Skip header row
    const dataLines = lines.slice(1);
    const results: GSCPageRow[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const fields = parseCSVLine(line);

      // Expected format: url, clicks, impressions, CTR, position
      if (fields.length < 5) {
        console.warn(`Skipping malformed row ${i + 2}: insufficient columns`);
        continue;
      }

      const [url, clicksStr, impressionsStr, ctrStr, positionStr] = fields;

      const clicks = parseInt(clicksStr, 10);
      const impressions = parseInt(impressionsStr, 10);
      const ctr = parseCTR(ctrStr);
      const position = parseFloat(positionStr);

      // Validate parsed values
      if (isNaN(clicks) || isNaN(impressions) || isNaN(position)) {
        console.warn(`Skipping malformed row ${i + 2}: invalid numeric values`);
        continue;
      }

      results.push({
        url,
        clicks,
        impressions,
        ctr,
        position,
      });
    }

    if (results.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }

    return results;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Parse Chart.csv file
 * @param filePath - Path to Chart.csv file
 * @returns Array of GSCChartRow objects
 */
export function parseChartCSV(filePath: string): GSCChartRow[] {
  try {
    // Read file with UTF-8 encoding
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Skip header row
    const dataLines = lines.slice(1);
    const results: GSCChartRow[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const fields = parseCSVLine(line);

      // Expected format: date, clicks, impressions, CTR, position
      if (fields.length < 5) {
        console.warn(`Skipping malformed row ${i + 2}: insufficient columns`);
        continue;
      }

      const [date, clicksStr, impressionsStr, ctrStr, positionStr] = fields;

      const clicks = parseInt(clicksStr, 10);
      const impressions = parseInt(impressionsStr, 10);
      const ctr = parseCTR(ctrStr);
      const position = parseFloat(positionStr);

      // Validate parsed values
      if (isNaN(clicks) || isNaN(impressions) || isNaN(position)) {
        console.warn(`Skipping malformed row ${i + 2}: invalid numeric values`);
        continue;
      }

      results.push({
        date,
        clicks,
        impressions,
        ctr,
        position,
      });
    }

    if (results.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }

    return results;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Identify high-opportunity keywords from GSC query data
 * 
 * Analyzes queries to find optimization opportunities based on:
 * - High impressions with low CTR (< 10%)
 * - Queries ranking in positions 4-20 (improvable range)
 * - Pages with impressions but zero clicks
 * 
 * @param queries - Array of GSC query data
 * @returns Array of keyword opportunities sorted by opportunity score (descending)
 */
export function identifyHighOpportunityKeywords(queries: GSCQueryRow[]): KeywordOpportunity[] {
  const opportunities: KeywordOpportunity[] = [];
  const config = SEO_ENHANCEMENT_CONFIG.gsc;

  for (const query of queries) {
    const { query: keyword, clicks, impressions, ctr, position } = query;

    // Calculate opportunity score: (impressions * (1 - ctr)) * (1 / position)
    const opportunityScore = (impressions * (1 - ctr)) * (1 / position);

    // Determine category based on criteria
    let category: KeywordOpportunity['category'] | null = null;

    // Check for high impressions with low CTR
    if (impressions >= config.highOpportunityImpressions && ctr < config.lowCTRThreshold) {
      category = 'high-impression-low-ctr';
    }
    // Check for improvable position range (4-20)
    else if (position >= config.improvablePositionMin && position <= config.improvablePositionMax) {
      category = 'position-4-20';
    }
    // Check for zero clicks with impressions
    else if (impressions > 0 && clicks === 0) {
      category = 'zero-click';
    }

    // Only add if it matches at least one opportunity category
    if (category) {
      opportunities.push({
        keyword,
        impressions,
        clicks,
        ctr,
        position,
        opportunityScore,
        category,
      });
    }
  }

  // Sort by opportunity score descending (highest opportunities first)
  return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

/**
 * Calculate Levenshtein distance between two strings
 * Used to identify typos and close variations
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance between the strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create a 2D array for dynamic programming
  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  // Initialize base cases
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }
  
  // Fill the dp table
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }
  
  return dp[len1][len2];
}

/**
 * Calculate similarity score between two keywords
 * Combines Levenshtein distance and shared term analysis
 * 
 * @param keyword1 - First keyword
 * @param keyword2 - Second keyword
 * @returns Similarity score (0-1, where 1 is identical)
 */
function calculateSimilarity(keyword1: string, keyword2: string): number {
  const k1Lower = keyword1.toLowerCase();
  const k2Lower = keyword2.toLowerCase();
  
  // Exact match
  if (k1Lower === k2Lower) {
    return 1.0;
  }
  
  // Normalize: remove extra spaces and split into terms
  const terms1 = k1Lower.trim().split(/\s+/);
  const terms2 = k2Lower.trim().split(/\s+/);
  
  // Calculate shared terms ratio
  const allTerms = new Set([...terms1, ...terms2]);
  const sharedTerms = terms1.filter(term => terms2.includes(term));
  const sharedTermsRatio = sharedTerms.length / allTerms.size;
  
  // Calculate normalized Levenshtein similarity
  const maxLen = Math.max(k1Lower.length, k2Lower.length);
  const levDistance = levenshteinDistance(k1Lower, k2Lower);
  const levSimilarity = maxLen > 0 ? 1 - (levDistance / maxLen) : 0;
  
  // Special handling for space variations (e.g., "gopay11" vs "gopay 11")
  // Remove all spaces and compare
  const k1NoSpaces = k1Lower.replace(/\s+/g, '');
  const k2NoSpaces = k2Lower.replace(/\s+/g, '');
  const noSpaceSimilarity = k1NoSpaces === k2NoSpaces ? 1.0 : 0;
  
  // If removing spaces makes them identical, they're highly similar
  if (noSpaceSimilarity === 1.0) {
    return 0.9; // High similarity for space-only differences
  }
  
  // Calculate similarity for no-space versions
  const maxLenNoSpace = Math.max(k1NoSpaces.length, k2NoSpaces.length);
  const levDistanceNoSpace = levenshteinDistance(k1NoSpaces, k2NoSpaces);
  const levSimilarityNoSpace = maxLenNoSpace > 0 ? 1 - (levDistanceNoSpace / maxLenNoSpace) : 0;
  
  // Combine metrics with weights
  // Shared terms: 40%, Levenshtein with spaces: 20%, Levenshtein without spaces: 40%
  const combinedScore = (sharedTermsRatio * 0.4) + (levSimilarity * 0.2) + (levSimilarityNoSpace * 0.4);
  
  return combinedScore;
}

/**
 * Build semantic keyword clusters from GSC query data
 * Groups keyword variations (gopay11, goplay11, go play 11) into clusters
 * 
 * Algorithm:
 * 1. Sort queries by traffic (impressions + clicks) to identify primary keywords
 * 2. For each query, find similar queries using Levenshtein distance and shared terms
 * 3. Group similar queries into clusters with the highest-traffic keyword as the primary
 * 
 * @param queries - Array of GSC query data
 * @param similarityThreshold - Minimum similarity score to cluster (default: 0.6)
 * @returns Map where key is primary keyword and value is array of related variations
 */
export function buildSemanticClusters(
  queries: GSCQueryRow[],
  similarityThreshold: number = 0.55
): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const assigned = new Set<string>();
  
  // Sort queries by total traffic (impressions + clicks) descending
  // This ensures the most popular variant becomes the cluster primary
  const sortedQueries = [...queries].sort((a, b) => {
    const trafficA = a.impressions + a.clicks;
    const trafficB = b.impressions + b.clicks;
    return trafficB - trafficA;
  });
  
  // Build clusters
  for (const query of sortedQueries) {
    const keyword = query.query;
    
    // Skip if already assigned to a cluster
    if (assigned.has(keyword)) {
      continue;
    }
    
    // Start a new cluster with this keyword as primary
    const clusterVariations: string[] = [];
    assigned.add(keyword);
    
    // Find similar keywords
    for (const otherQuery of sortedQueries) {
      const otherKeyword = otherQuery.query;
      
      // Skip if same keyword or already assigned
      if (otherKeyword === keyword || assigned.has(otherKeyword)) {
        continue;
      }
      
      // Calculate similarity
      const similarity = calculateSimilarity(keyword, otherKeyword);
      
      // Add to cluster if similar enough
      if (similarity >= similarityThreshold) {
        clusterVariations.push(otherKeyword);
        assigned.add(otherKeyword);
      }
    }
    
    // Only create cluster if there are variations
    // (single keywords without variations are not clustered)
    if (clusterVariations.length > 0) {
      clusters.set(keyword, clusterVariations);
    }
  }
  
  return clusters;
}

/**
 * Identify underperforming pages from GSC page data
 * 
 * Analyzes pages to find optimization opportunities based on:
 * - Pages with impressions but zero clicks
 * - Pages with low CTR (< 10%)
 * - Pages ranking in positions 4-20 (improvable range)
 * 
 * @param pages - Array of GSC page data
 * @returns Array of page performance records
 */
export function identifyUnderperformingPages(pages: GSCPageRow[]): PagePerformance[] {
  const config = SEO_ENHANCEMENT_CONFIG.gsc;
  const results: PagePerformance[] = [];

  for (const page of pages) {
    const { url, clicks, impressions, ctr, position } = page;

    let status: PagePerformance['status'];

    // Determine page status (check in priority order)
    if (impressions > 0 && clicks === 0) {
      // Zero traffic is highest priority issue
      status = 'zero-traffic';
    } else if (
      impressions >= config.highOpportunityImpressions && 
      ctr < config.lowCTRThreshold
    ) {
      // High impressions with low CTR - clear underperformance
      status = 'underperforming';
    } else if (
      position >= config.improvablePositionMin && 
      position <= config.improvablePositionMax &&
      ctr < 0.20  // Only mark as underperforming if CTR is also below 20%
    ) {
      // Position in improvable range with suboptimal CTR
      status = 'underperforming';
    } else {
      // Everything else is performing
      status = 'performing';
    }

    results.push({
      url,
      clicks,
      impressions,
      ctr,
      position,
      status,
    });
  }

  return results;
}

/**
 * Generate comprehensive GSC analysis report
 * 
 * Produces a complete analysis including:
 * - Keyword opportunities sorted by opportunity score
 * - Page performance showing underperforming pages
 * - Semantic clusters mapping primary keywords to variations
 * - Traffic distribution metrics
 * 
 * @param gscDirectory - Path to directory containing GSC CSV files (default: 'gsc')
 * @returns Complete GSC analysis report
 */
export function generateAnalysisReport(gscDirectory: string = 'gsc'): GSCAnalysisReport {
  // Parse CSV files
  const queriesPath = path.join(gscDirectory, 'Queries.csv');
  const pagesPath = path.join(gscDirectory, 'Pages.csv');
  
  const queries = parseQueriesCSV(queriesPath);
  const pages = parsePagesCSV(pagesPath);

  // Identify opportunities
  const keywordOpportunities = identifyHighOpportunityKeywords(queries);
  const pagePerformance = identifyUnderperformingPages(pages);

  // Build semantic clusters
  const semanticClusters = buildSemanticClusters(queries);

  // Calculate traffic distribution
  const totalClicks = queries.reduce((sum, q) => sum + q.clicks, 0);
  const totalImpressions = queries.reduce((sum, q) => sum + q.impressions, 0);
  const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  
  // Calculate weighted average position
  const totalWeightedPosition = queries.reduce(
    (sum, q) => sum + (q.position * q.impressions), 
    0
  );
  const avgPosition = totalImpressions > 0 ? totalWeightedPosition / totalImpressions : 0;

  return {
    keywordOpportunities,
    pagePerformance,
    semanticClusters,
    trafficDistribution: {
      totalClicks,
      totalImpressions,
      avgCTR,
      avgPosition,
    },
  };
}

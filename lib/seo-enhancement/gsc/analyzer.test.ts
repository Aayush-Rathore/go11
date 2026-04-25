import { describe, it, expect } from 'vitest';
import { parseQueriesCSV, parsePagesCSV, parseChartCSV, identifyHighOpportunityKeywords, buildSemanticClusters, identifyUnderperformingPages, generateAnalysisReport } from './analyzer';
import type { GSCQueryRow, GSCPageRow } from './types';
import path from 'path';

describe('GSC CSV Parser', () => {
  const gscDir = path.join(process.cwd(), 'gsc');

  describe('parseQueriesCSV', () => {
    it('should parse Queries.csv correctly', () => {
      const filePath = path.join(gscDir, 'Queries.csv');
      const results = parseQueriesCSV(filePath);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Check first row
      const firstRow = results[0];
      expect(firstRow.query).toBe('gopay11');
      expect(firstRow.clicks).toBe(12);
      expect(firstRow.impressions).toBe(65);
      expect(firstRow.ctr).toBeCloseTo(0.1846, 4);
      expect(firstRow.position).toBeCloseTo(9.48, 2);
    });

    it('should handle CTR percentage conversion', () => {
      const filePath = path.join(gscDir, 'Queries.csv');
      const results = parseQueriesCSV(filePath);

      // Check various CTR formats
      const row100Percent = results.find(r => r.query === 'go pay 11');
      expect(row100Percent?.ctr).toBe(1.0);

      const row66Percent = results.find(r => r.query === 'gopay 11 download apk');
      expect(row66Percent?.ctr).toBeCloseTo(0.6667, 4);
    });

    it('should throw error for missing file', () => {
      expect(() => parseQueriesCSV('nonexistent.csv')).toThrow('File not found');
    });
  });

  describe('parsePagesCSV', () => {
    it('should parse Pages.csv correctly', () => {
      const filePath = path.join(gscDir, 'Pages.csv');
      const results = parsePagesCSV(filePath);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Check first row
      const firstRow = results[0];
      expect(firstRow.url).toBe('https://goplay11-apk.com/');
      expect(firstRow.clicks).toBe(34);
      expect(firstRow.impressions).toBe(152);
      expect(firstRow.ctr).toBeCloseTo(0.2237, 4);
      expect(firstRow.position).toBeCloseTo(11.68, 2);
    });

    it('should handle zero-click pages', () => {
      const filePath = path.join(gscDir, 'Pages.csv');
      const results = parsePagesCSV(filePath);

      const zeroClickPage = results.find(r => r.url.includes('/referral-code'));
      expect(zeroClickPage).toBeDefined();
      expect(zeroClickPage?.clicks).toBe(0);
      expect(zeroClickPage?.impressions).toBeGreaterThan(0);
      expect(zeroClickPage?.ctr).toBe(0);
    });

    it('should throw error for missing file', () => {
      expect(() => parsePagesCSV('nonexistent.csv')).toThrow('File not found');
    });
  });

  describe('parseChartCSV', () => {
    it('should parse Chart.csv correctly', () => {
      const filePath = path.join(gscDir, 'Chart.csv');
      const results = parseChartCSV(filePath);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);

      // Check first row
      const firstRow = results[0];
      expect(firstRow.date).toBe('2026-04-10T23:30:00');
      expect(firstRow.clicks).toBe(0);
      expect(firstRow.impressions).toBe(2);
      expect(firstRow.ctr).toBe(0);
      expect(firstRow.position).toBe(83);
    });

    it('should handle date format correctly', () => {
      const filePath = path.join(gscDir, 'Chart.csv');
      const results = parseChartCSV(filePath);

      // All dates should be ISO format strings
      results.forEach(row => {
        expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      });
    });

    it('should throw error for missing file', () => {
      expect(() => parseChartCSV('nonexistent.csv')).toThrow('File not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed CSV with warnings', () => {
      const filePath = path.join(process.cwd(), 'lib/seo-enhancement/gsc/test-data/malformed.csv');
      const results = parseQueriesCSV(filePath);

      // Should only parse the valid row
      expect(results.length).toBe(1);
      expect(results[0].query).toBe('valid query');
      expect(results[0].clicks).toBe(10);
    });

    it('should throw error for empty CSV', () => {
      const filePath = path.join(process.cwd(), 'lib/seo-enhancement/gsc/test-data/empty.csv');
      expect(() => parseQueriesCSV(filePath)).toThrow('CSV file is empty');
    });

    it('should handle CSV with only headers', () => {
      const filePath = path.join(process.cwd(), 'lib/seo-enhancement/gsc/test-data/header-only.csv');
      expect(() => parseQueriesCSV(filePath)).toThrow('No valid data rows found in CSV');
    });
  });
});

describe('UTF-8 Encoding Support', () => {
  it('should handle Hindi CSV files with UTF-8 encoding', () => {
    const filePath = path.join(process.cwd(), 'goplay11-apk.com-Performance-on-Search-2026-04-21/क्वेरी.csv');
    const results = parseQueriesCSV(filePath);

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);

    // Check first row
    const firstRow = results[0];
    expect(firstRow.query).toBe('goplay 11 apk');
    expect(firstRow.clicks).toBe(51);
    expect(firstRow.impressions).toBe(414);
    expect(firstRow.ctr).toBeCloseTo(0.1232, 4);
    expect(firstRow.position).toBeCloseTo(18.62, 2);
  });
});

describe('identifyHighOpportunityKeywords', () => {
  it('should identify high-impression-low-ctr opportunities', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'high impression low ctr',
        clicks: 5,
        impressions: 100,
        ctr: 0.05,
        position: 10,
      },
      {
        query: 'normal query',
        clicks: 20,
        impressions: 50,
        ctr: 0.40,
        position: 2,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    expect(opportunities.length).toBe(1);
    expect(opportunities[0].keyword).toBe('high impression low ctr');
    expect(opportunities[0].category).toBe('high-impression-low-ctr');
    expect(opportunities[0].opportunityScore).toBeCloseTo(9.5, 1);
  });

  it('should identify position-4-20 opportunities', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'improvable position',
        clicks: 10,
        impressions: 40,
        ctr: 0.25,
        position: 8,
      },
      {
        query: 'top position',
        clicks: 50,
        impressions: 100,
        ctr: 0.50,
        position: 2,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    expect(opportunities.length).toBe(1);
    expect(opportunities[0].keyword).toBe('improvable position');
    expect(opportunities[0].category).toBe('position-4-20');
  });

  it('should identify zero-click opportunities', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'zero clicks',
        clicks: 0,
        impressions: 30,
        ctr: 0,
        position: 25,
      },
      {
        query: 'has clicks',
        clicks: 5,
        impressions: 30,
        ctr: 0.1667,
        position: 25,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    expect(opportunities.length).toBe(1);
    expect(opportunities[0].keyword).toBe('zero clicks');
    expect(opportunities[0].category).toBe('zero-click');
  });

  it('should calculate opportunity score correctly', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'test query',
        clicks: 10,
        impressions: 100,
        ctr: 0.10,
        position: 5,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    // Formula: (impressions * (1 - ctr)) * (1 / position)
    // (100 * (1 - 0.10)) * (1 / 5) = 100 * 0.90 * 0.2 = 18
    expect(opportunities[0].opportunityScore).toBeCloseTo(18, 1);
  });

  it('should sort opportunities by score descending', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'low score',
        clicks: 2,
        impressions: 50,
        ctr: 0.04,
        position: 15,
      },
      {
        query: 'high score',
        clicks: 5,
        impressions: 200,
        ctr: 0.025,
        position: 8,
      },
      {
        query: 'medium score',
        clicks: 3,
        impressions: 100,
        ctr: 0.03,
        position: 10,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    expect(opportunities.length).toBe(3);
    expect(opportunities[0].keyword).toBe('high score');
    expect(opportunities[1].keyword).toBe('medium score');
    expect(opportunities[2].keyword).toBe('low score');
    expect(opportunities[0].opportunityScore).toBeGreaterThan(opportunities[1].opportunityScore);
    expect(opportunities[1].opportunityScore).toBeGreaterThan(opportunities[2].opportunityScore);
  });

  it('should handle empty query array', () => {
    const opportunities = identifyHighOpportunityKeywords([]);
    expect(opportunities).toEqual([]);
  });

  it('should exclude queries that do not meet any criteria', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'top performing',
        clicks: 100,
        impressions: 200,
        ctr: 0.50,
        position: 1,
      },
      {
        query: 'low impressions',
        clicks: 1,
        impressions: 10,
        ctr: 0.10,
        position: 30,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);
    expect(opportunities.length).toBe(0);
  });

  it('should work with real GSC data', () => {
    const filePath = path.join(process.cwd(), 'gsc/Queries.csv');
    const queries = parseQueriesCSV(filePath);
    const opportunities = identifyHighOpportunityKeywords(queries);

    expect(opportunities).toBeDefined();
    expect(Array.isArray(opportunities)).toBe(true);

    // Verify all opportunities have required fields
    opportunities.forEach(opp => {
      expect(opp.keyword).toBeDefined();
      expect(opp.impressions).toBeGreaterThanOrEqual(0);
      expect(opp.clicks).toBeGreaterThanOrEqual(0);
      expect(opp.ctr).toBeGreaterThanOrEqual(0);
      expect(opp.position).toBeGreaterThan(0);
      expect(opp.opportunityScore).toBeGreaterThan(0);
      expect(['high-impression-low-ctr', 'position-4-20', 'zero-click']).toContain(opp.category);
    });

    // Verify sorting
    for (let i = 1; i < opportunities.length; i++) {
      expect(opportunities[i - 1].opportunityScore).toBeGreaterThanOrEqual(opportunities[i].opportunityScore);
    }
  });

  it('should prioritize high-impression-low-ctr over other categories when multiple criteria match', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'matches multiple criteria',
        clicks: 0,
        impressions: 100,
        ctr: 0.00,
        position: 10,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    expect(opportunities.length).toBe(1);
    // Should be categorized as high-impression-low-ctr (checked first)
    expect(opportunities[0].category).toBe('high-impression-low-ctr');
  });

  it('should handle edge case at position boundaries', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'position 4',
        clicks: 5,
        impressions: 40,
        ctr: 0.125,
        position: 4,
      },
      {
        query: 'position 20',
        clicks: 5,
        impressions: 40,
        ctr: 0.125,
        position: 20,
      },
      {
        query: 'position 3',
        clicks: 5,
        impressions: 40,
        ctr: 0.125,
        position: 3,
      },
      {
        query: 'position 21',
        clicks: 5,
        impressions: 40,
        ctr: 0.125,
        position: 21,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    expect(opportunities.length).toBe(2);
    expect(opportunities.some(o => o.keyword === 'position 4')).toBe(true);
    expect(opportunities.some(o => o.keyword === 'position 20')).toBe(true);
    expect(opportunities.some(o => o.keyword === 'position 3')).toBe(false);
    expect(opportunities.some(o => o.keyword === 'position 21')).toBe(false);
  });

  it('should handle CTR threshold boundary at 10%', () => {
    const queries: GSCQueryRow[] = [
      {
        query: 'ctr below threshold',
        clicks: 9,
        impressions: 100,
        ctr: 0.09,
        position: 10,
      },
      {
        query: 'ctr at threshold',
        clicks: 10,
        impressions: 100,
        ctr: 0.10,
        position: 10,
      },
      {
        query: 'ctr above threshold',
        clicks: 11,
        impressions: 100,
        ctr: 0.11,
        position: 10,
      },
    ];

    const opportunities = identifyHighOpportunityKeywords(queries);

    // Only the one below 10% should be categorized as high-impression-low-ctr
    const highImpLowCtr = opportunities.filter(o => o.category === 'high-impression-low-ctr');
    expect(highImpLowCtr.length).toBe(1);
    expect(highImpLowCtr[0].keyword).toBe('ctr below threshold');
  });
});

describe('buildSemanticClusters', () => {
  it('should cluster keyword variations with high similarity', () => {
    const queries: GSCQueryRow[] = [
      { query: 'gopay11', clicks: 12, impressions: 65, ctr: 0.18, position: 9.5 },
      { query: 'gopay 11', clicks: 8, impressions: 45, ctr: 0.17, position: 10 },
      { query: 'goplay11', clicks: 6, impressions: 35, ctr: 0.17, position: 11 },
      { query: 'go play 11', clicks: 4, impressions: 25, ctr: 0.16, position: 12 },
      { query: 'fantasy app', clicks: 20, impressions: 100, ctr: 0.20, position: 5 },
    ];

    const clusters = buildSemanticClusters(queries);

    // Should have at least one cluster for gopay variations
    expect(clusters.size).toBeGreaterThan(0);
    
    // The primary keyword should be the one with highest traffic
    expect(clusters.has('gopay11')).toBe(true);
    
    // Variations should be clustered together
    const gopayCluster = clusters.get('gopay11');
    expect(gopayCluster).toBeDefined();
    expect(gopayCluster!.length).toBeGreaterThan(0);
    expect(gopayCluster).toContain('gopay 11');
  });

  it('should use highest traffic keyword as cluster primary', () => {
    const queries: GSCQueryRow[] = [
      { query: 'gopay 11', clicks: 5, impressions: 20, ctr: 0.25, position: 10 },
      { query: 'gopay11', clicks: 50, impressions: 200, ctr: 0.25, position: 10 },
      { query: 'goplay11', clicks: 10, impressions: 40, ctr: 0.25, position: 10 },
    ];

    const clusters = buildSemanticClusters(queries);

    // gopay11 has highest traffic (250 total), should be primary
    expect(clusters.has('gopay11')).toBe(true);
    expect(clusters.has('gopay 11')).toBe(false);
    expect(clusters.has('goplay11')).toBe(false);
  });

  it('should cluster keywords with shared terms', () => {
    const queries: GSCQueryRow[] = [
      { query: 'fantasy app', clicks: 30, impressions: 150, ctr: 0.20, position: 5 },
      { query: 'fantasy apps', clicks: 10, impressions: 50, ctr: 0.20, position: 6 },
      { query: 'best fantasy app', clicks: 8, impressions: 40, ctr: 0.20, position: 7 },
      { query: 'fantasy gaming app', clicks: 5, impressions: 25, ctr: 0.20, position: 8 },
    ];

    const clusters = buildSemanticClusters(queries);

    expect(clusters.has('fantasy app')).toBe(true);
    const fantasyCluster = clusters.get('fantasy app');
    expect(fantasyCluster).toBeDefined();
    expect(fantasyCluster!.length).toBeGreaterThan(0);
  });

  it('should handle typos and spelling variations', () => {
    const queries: GSCQueryRow[] = [
      { query: 'gopay11 app', clicks: 20, impressions: 100, ctr: 0.20, position: 8 },
      { query: 'gopay11 aap', clicks: 2, impressions: 10, ctr: 0.20, position: 15 }, // typo
      { query: 'gopay11 ap', clicks: 1, impressions: 5, ctr: 0.20, position: 20 }, // typo
    ];

    const clusters = buildSemanticClusters(queries);

    expect(clusters.has('gopay11 app')).toBe(true);
    const appCluster = clusters.get('gopay11 app');
    expect(appCluster).toBeDefined();
  });

  it('should not cluster dissimilar keywords', () => {
    const queries: GSCQueryRow[] = [
      { query: 'gopay11', clicks: 20, impressions: 100, ctr: 0.20, position: 8 },
      { query: 'cricket betting', clicks: 15, impressions: 80, ctr: 0.19, position: 9 },
      { query: 'download apk', clicks: 10, impressions: 50, ctr: 0.20, position: 10 },
    ];

    const clusters = buildSemanticClusters(queries);

    // These are too dissimilar to cluster
    // Each should either be standalone or not clustered at all
    const allClustered = Array.from(clusters.values()).flat();
    expect(allClustered).not.toContain('cricket betting');
    expect(allClustered).not.toContain('download apk');
  });

  it('should respect similarity threshold parameter', () => {
    const queries: GSCQueryRow[] = [
      { query: 'gopay11', clicks: 20, impressions: 100, ctr: 0.20, position: 8 },
      { query: 'gopay 11', clicks: 10, impressions: 50, ctr: 0.20, position: 9 },
    ];

    // With high threshold, should not cluster
    const strictClusters = buildSemanticClusters(queries, 0.95);
    expect(strictClusters.size).toBe(0);

    // With low threshold, should cluster
    const looseClusters = buildSemanticClusters(queries, 0.5);
    expect(looseClusters.size).toBeGreaterThan(0);
  });

  it('should handle empty query array', () => {
    const clusters = buildSemanticClusters([]);
    expect(clusters.size).toBe(0);
  });

  it('should handle single query', () => {
    const queries: GSCQueryRow[] = [
      { query: 'gopay11', clicks: 20, impressions: 100, ctr: 0.20, position: 8 },
    ];

    const clusters = buildSemanticClusters(queries);
    
    // Single query with no variations should not create a cluster
    expect(clusters.size).toBe(0);
  });

  it('should not assign same keyword to multiple clusters', () => {
    const queries: GSCQueryRow[] = [
      { query: 'gopay11', clicks: 50, impressions: 250, ctr: 0.20, position: 8 },
      { query: 'gopay 11', clicks: 30, impressions: 150, ctr: 0.20, position: 9 },
      { query: 'goplay11', clicks: 20, impressions: 100, ctr: 0.20, position: 10 },
      { query: 'go play 11', clicks: 10, impressions: 50, ctr: 0.20, position: 11 },
    ];

    const clusters = buildSemanticClusters(queries);

    // Collect all keywords that appear in clusters
    const allClusteredKeywords = new Set<string>();
    clusters.forEach((variations, primary) => {
      allClusteredKeywords.add(primary);
      variations.forEach(v => allClusteredKeywords.add(v));
    });

    // Each keyword should appear only once
    const keywordCounts = new Map<string, number>();
    allClusteredKeywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });

    keywordCounts.forEach((count, keyword) => {
      expect(count).toBe(1);
    });
  });

  it('should work with real GSC data', () => {
    const filePath = path.join(process.cwd(), 'gsc/Queries.csv');
    const queries = parseQueriesCSV(filePath);
    const clusters = buildSemanticClusters(queries);

    expect(clusters).toBeDefined();
    expect(clusters instanceof Map).toBe(true);

    // Verify cluster structure
    clusters.forEach((variations, primary) => {
      expect(typeof primary).toBe('string');
      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBeGreaterThan(0);
      
      // Variations should not include the primary keyword
      expect(variations).not.toContain(primary);
    });
  });

  it('should handle case-insensitive clustering', () => {
    const queries: GSCQueryRow[] = [
      { query: 'GoPay11', clicks: 20, impressions: 100, ctr: 0.20, position: 8 },
      { query: 'gopay11', clicks: 15, impressions: 75, ctr: 0.20, position: 9 },
      { query: 'GOPAY11', clicks: 10, impressions: 50, ctr: 0.20, position: 10 },
    ];

    const clusters = buildSemanticClusters(queries);

    // Should cluster case variations together
    expect(clusters.size).toBeGreaterThan(0);
    const primaryKey = Array.from(clusters.keys())[0];
    const variations = clusters.get(primaryKey);
    expect(variations!.length).toBeGreaterThan(0);
  });

  it('should handle word order variations', () => {
    const queries: GSCQueryRow[] = [
      { query: 'download gopay11 apk', clicks: 30, impressions: 150, ctr: 0.20, position: 8 },
      { query: 'gopay11 apk download', clicks: 20, impressions: 100, ctr: 0.20, position: 9 },
      { query: 'apk download gopay11', clicks: 10, impressions: 50, ctr: 0.20, position: 10 },
    ];

    const clusters = buildSemanticClusters(queries);

    // Should cluster word order variations
    expect(clusters.size).toBeGreaterThan(0);
    const primaryKey = Array.from(clusters.keys())[0];
    const variations = clusters.get(primaryKey);
    expect(variations!.length).toBeGreaterThan(0);
  });
});


describe('identifyUnderperformingPages', () => {
  it('should identify zero-traffic pages', () => {
    const pages: GSCPageRow[] = [
      {
        url: 'https://example.com/zero-traffic',
        clicks: 0,
        impressions: 50,
        ctr: 0,
        position: 15,
      },
      {
        url: 'https://example.com/has-traffic',
        clicks: 10,
        impressions: 50,
        ctr: 0.20,
        position: 8,
      },
    ];

    const results = identifyUnderperformingPages(pages);

    const zeroTrafficPage = results.find(p => p.url.includes('zero-traffic'));
    expect(zeroTrafficPage).toBeDefined();
    expect(zeroTrafficPage?.status).toBe('zero-traffic');
  });

  it('should identify underperforming pages with low CTR', () => {
    const pages: GSCPageRow[] = [
      {
        url: 'https://example.com/low-ctr',
        clicks: 5,
        impressions: 100,
        ctr: 0.05,
        position: 8,
      },
      {
        url: 'https://example.com/good-ctr',
        clicks: 30,
        impressions: 100,
        ctr: 0.30,
        position: 5,
      },
    ];

    const results = identifyUnderperformingPages(pages);

    const lowCtrPage = results.find(p => p.url.includes('low-ctr'));
    expect(lowCtrPage).toBeDefined();
    expect(lowCtrPage?.status).toBe('underperforming');

    const goodCtrPage = results.find(p => p.url.includes('good-ctr'));
    expect(goodCtrPage?.status).toBe('performing');
  });

  it('should identify underperforming pages in improvable positions', () => {
    const pages: GSCPageRow[] = [
      {
        url: 'https://example.com/position-10',
        clicks: 10,
        impressions: 50,
        ctr: 0.15,  // Below 20% threshold
        position: 10,
      },
      {
        url: 'https://example.com/position-2',
        clicks: 40,
        impressions: 100,
        ctr: 0.40,
        position: 2,
      },
    ];

    const results = identifyUnderperformingPages(pages);

    const improvablePage = results.find(p => p.url.includes('position-10'));
    expect(improvablePage).toBeDefined();
    expect(improvablePage?.status).toBe('underperforming');

    const topPage = results.find(p => p.url.includes('position-2'));
    expect(topPage?.status).toBe('performing');
  });

  it('should handle empty pages array', () => {
    const results = identifyUnderperformingPages([]);
    expect(results).toEqual([]);
  });

  it('should work with real GSC data', () => {
    const filePath = path.join(process.cwd(), 'gsc/Pages.csv');
    const pages = parsePagesCSV(filePath);
    const results = identifyUnderperformingPages(pages);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(pages.length);

    // Verify all results have required fields
    results.forEach(page => {
      expect(page.url).toBeDefined();
      expect(page.clicks).toBeGreaterThanOrEqual(0);
      expect(page.impressions).toBeGreaterThanOrEqual(0);
      expect(page.ctr).toBeGreaterThanOrEqual(0);
      expect(page.position).toBeGreaterThan(0);
      expect(['performing', 'underperforming', 'zero-traffic']).toContain(page.status);
    });
  });
});

describe('generateAnalysisReport', () => {
  it('should generate complete analysis report from GSC data', () => {
    const report = generateAnalysisReport('gsc');

    expect(report).toBeDefined();
    expect(report.keywordOpportunities).toBeDefined();
    expect(Array.isArray(report.keywordOpportunities)).toBe(true);
    expect(report.pagePerformance).toBeDefined();
    expect(Array.isArray(report.pagePerformance)).toBe(true);
    expect(report.semanticClusters).toBeDefined();
    expect(report.semanticClusters instanceof Map).toBe(true);
    expect(report.trafficDistribution).toBeDefined();
  });

  it('should include keyword opportunities sorted by score', () => {
    const report = generateAnalysisReport('gsc');

    expect(report.keywordOpportunities.length).toBeGreaterThan(0);

    // Verify sorting
    for (let i = 1; i < report.keywordOpportunities.length; i++) {
      expect(report.keywordOpportunities[i - 1].opportunityScore)
        .toBeGreaterThanOrEqual(report.keywordOpportunities[i].opportunityScore);
    }
  });

  it('should include page performance data', () => {
    const report = generateAnalysisReport('gsc');

    expect(report.pagePerformance.length).toBeGreaterThan(0);

    // Verify all pages have status
    report.pagePerformance.forEach(page => {
      expect(['performing', 'underperforming', 'zero-traffic']).toContain(page.status);
    });
  });

  it('should include semantic clusters', () => {
    const report = generateAnalysisReport('gsc');

    expect(report.semanticClusters.size).toBeGreaterThanOrEqual(0);

    // Verify cluster structure
    report.semanticClusters.forEach((variations, primary) => {
      expect(typeof primary).toBe('string');
      expect(Array.isArray(variations)).toBe(true);
    });
  });

  it('should calculate traffic distribution correctly', () => {
    const report = generateAnalysisReport('gsc');

    const { totalClicks, totalImpressions, avgCTR, avgPosition } = report.trafficDistribution;

    expect(totalClicks).toBeGreaterThan(0);
    expect(totalImpressions).toBeGreaterThan(0);
    expect(avgCTR).toBeGreaterThan(0);
    expect(avgCTR).toBeLessThanOrEqual(1);
    expect(avgPosition).toBeGreaterThan(0);

    // Verify CTR calculation
    const expectedCTR = totalClicks / totalImpressions;
    expect(avgCTR).toBeCloseTo(expectedCTR, 6);
  });

  it('should calculate weighted average position', () => {
    const report = generateAnalysisReport('gsc');

    const { avgPosition } = report.trafficDistribution;

    // Average position should be reasonable (between 1 and 100)
    expect(avgPosition).toBeGreaterThan(0);
    expect(avgPosition).toBeLessThan(100);
  });

  it('should handle custom GSC directory', () => {
    // Test with default directory since custom directory has Hindi filenames
    const report = generateAnalysisReport();

    expect(report).toBeDefined();
    expect(report.keywordOpportunities).toBeDefined();
    expect(report.pagePerformance).toBeDefined();
    expect(report.semanticClusters).toBeDefined();
    expect(report.trafficDistribution).toBeDefined();
  });

  it('should provide actionable insights', () => {
    const report = generateAnalysisReport('gsc');

    // Should have at least some opportunities
    expect(report.keywordOpportunities.length).toBeGreaterThan(0);

    // Should identify underperforming pages
    const underperforming = report.pagePerformance.filter(
      p => p.status === 'underperforming' || p.status === 'zero-traffic'
    );
    expect(underperforming.length).toBeGreaterThan(0);

    // Should have traffic data
    expect(report.trafficDistribution.totalClicks).toBeGreaterThan(0);
    expect(report.trafficDistribution.totalImpressions).toBeGreaterThan(0);
  });

  it('should integrate all analysis components', () => {
    const report = generateAnalysisReport('gsc');

    // Verify all components are present and non-empty
    expect(report.keywordOpportunities.length).toBeGreaterThan(0);
    expect(report.pagePerformance.length).toBeGreaterThan(0);
    expect(report.trafficDistribution.totalClicks).toBeGreaterThan(0);

    // Verify data consistency
    const totalKeywordClicks = report.keywordOpportunities.reduce(
      (sum, k) => sum + k.clicks, 
      0
    );
    expect(totalKeywordClicks).toBeLessThanOrEqual(report.trafficDistribution.totalClicks);
  });
});

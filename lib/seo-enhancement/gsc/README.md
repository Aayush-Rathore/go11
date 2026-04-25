# GSC CSV Parser and Analyzer

This module provides functions to parse Google Search Console (GSC) CSV export files and analyze them for SEO optimization opportunities.

## Features

- ✅ UTF-8 encoding support for international characters (Hindi, etc.)
- ✅ Automatic CTR percentage to decimal conversion
- ✅ Error handling for missing files, malformed CSV, and empty data
- ✅ Type-safe parsing with TypeScript interfaces
- ✅ Graceful handling of malformed rows with console warnings
- ✅ Keyword opportunity identification
- ✅ Semantic keyword clustering
- ✅ Page performance analysis
- ✅ Comprehensive analysis report generation

## Usage

### Basic CSV Parsing

```typescript
import { parseQueriesCSV, parsePagesCSV, parseChartCSV } from '@/lib/seo-enhancement/gsc/analyzer';
import path from 'path';

// Parse Queries.csv
const queries = parseQueriesCSV(path.join(process.cwd(), 'gsc/Queries.csv'));
console.log(queries[0]);
// {
//   query: 'gopay11',
//   clicks: 12,
//   impressions: 65,
//   ctr: 0.1846,
//   position: 9.48
// }

// Parse Pages.csv
const pages = parsePagesCSV(path.join(process.cwd(), 'gsc/Pages.csv'));
console.log(pages[0]);
// {
//   url: 'https://goplay11-apk.com/',
//   clicks: 34,
//   impressions: 152,
//   ctr: 0.2237,
//   position: 11.68
// }

// Parse Chart.csv
const chart = parseChartCSV(path.join(process.cwd(), 'gsc/Chart.csv'));
console.log(chart[0]);
// {
//   date: '2026-04-10T23:30:00',
//   clicks: 0,
//   impressions: 2,
//   ctr: 0,
//   position: 83
// }
```

### Keyword Opportunity Analysis

```typescript
import { identifyHighOpportunityKeywords } from '@/lib/seo-enhancement/gsc/analyzer';

const queries = parseQueriesCSV('gsc/Queries.csv');
const opportunities = identifyHighOpportunityKeywords(queries);

console.log(opportunities[0]);
// {
//   keyword: 'gopay11 download',
//   impressions: 150,
//   clicks: 8,
//   ctr: 0.053,
//   position: 12.5,
//   opportunityScore: 11.36,
//   category: 'high-impression-low-ctr'
// }
```

### Semantic Clustering

```typescript
import { buildSemanticClusters } from '@/lib/seo-enhancement/gsc/analyzer';

const queries = parseQueriesCSV('gsc/Queries.csv');
const clusters = buildSemanticClusters(queries);

// Map of primary keyword -> variations
clusters.forEach((variations, primary) => {
  console.log(`${primary}: ${variations.join(', ')}`);
});
// gopay11: gopay 11, goplay11, go play 11
```

### Page Performance Analysis

```typescript
import { identifyUnderperformingPages } from '@/lib/seo-enhancement/gsc/analyzer';

const pages = parsePagesCSV('gsc/Pages.csv');
const performance = identifyUnderperformingPages(pages);

const underperforming = performance.filter(p => p.status === 'underperforming');
console.log(`Found ${underperforming.length} underperforming pages`);
```

### Complete Analysis Report

```typescript
import { generateAnalysisReport } from '@/lib/seo-enhancement/gsc/analyzer';

// Generate comprehensive analysis from GSC data
const report = generateAnalysisReport('gsc');

console.log('Keyword Opportunities:', report.keywordOpportunities.length);
console.log('Pages Analyzed:', report.pagePerformance.length);
console.log('Semantic Clusters:', report.semanticClusters.size);
console.log('Traffic Distribution:', report.trafficDistribution);
// {
//   totalClicks: 97,
//   totalImpressions: 414,
//   avgCTR: 0.234,
//   avgPosition: 12.45
// }

// Access prioritized keyword opportunities
report.keywordOpportunities.slice(0, 5).forEach(opp => {
  console.log(`${opp.keyword} - Score: ${opp.opportunityScore.toFixed(2)} (${opp.category})`);
});

// Find underperforming pages
const underperforming = report.pagePerformance.filter(
  p => p.status === 'underperforming' || p.status === 'zero-traffic'
);
console.log(`Underperforming pages: ${underperforming.length}`);

// Explore semantic clusters
report.semanticClusters.forEach((variations, primary) => {
  console.log(`Cluster: ${primary}`);
  console.log(`  Variations: ${variations.join(', ')}`);
});
```

## CSV Format

### Queries.csv
```csv
Top queries,Clicks,Impressions,CTR,Position
gopay11,12,65,18.46%,9.48
```

### Pages.csv
```csv
Top pages,Clicks,Impressions,CTR,Position
https://goplay11-apk.com/,34,152,22.37%,11.68
```

### Chart.csv
```csv
Time (UTC+05:30),Clicks,Impressions,CTR,Position
2026-04-10T23:30:00,0,2,0%,83
```

## Error Handling

The parser handles various error conditions:

- **Missing file**: Throws `Error: File not found: <path>`
- **Empty CSV**: Throws `Error: CSV file is empty`
- **No valid data**: Throws `Error: No valid data rows found in CSV`
- **Malformed rows**: Logs warning to console and skips the row

## Implementation Details

- Uses Node.js `fs` module with UTF-8 encoding
- Manual CSV parsing to handle quoted fields
- CTR conversion: "18.46%" → 0.1846
- Validates numeric values before adding to results
- Skips header row automatically

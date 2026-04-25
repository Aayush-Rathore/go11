/**
 * Google Search Console Data Types
 */

export interface GSCQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCPageRow {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCChartRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCCountryRow {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCDeviceRow {
  device: 'MOBILE' | 'DESKTOP' | 'TABLET';
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCDataset {
  queries: GSCQueryRow[];
  pages: GSCPageRow[];
  chart: GSCChartRow[];
  countries: GSCCountryRow[];
  devices: GSCDeviceRow[];
  loadedAt: string;
}

export interface KeywordOpportunity {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  opportunityScore: number;
  category: 'high-impression-low-ctr' | 'position-4-20' | 'zero-click';
}

export interface PagePerformance {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  status: 'performing' | 'underperforming' | 'zero-traffic';
}

export interface GSCAnalysisReport {
  keywordOpportunities: KeywordOpportunity[];
  pagePerformance: PagePerformance[];
  semanticClusters: Map<string, string[]>;
  trafficDistribution: {
    totalClicks: number;
    totalImpressions: number;
    avgCTR: number;
    avgPosition: number;
  };
}

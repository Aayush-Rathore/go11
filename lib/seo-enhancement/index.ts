/**
 * SEO Content Enhancement System
 * 
 * Main entry point for the SEO content enhancement pipeline.
 * Exports all types, components, and utilities.
 */

// GSC Types
export type {
  GSCQueryRow,
  GSCPageRow,
  GSCChartRow,
  GSCCountryRow,
  GSCDeviceRow,
  GSCDataset,
  KeywordOpportunity,
  PagePerformance,
  GSCAnalysisReport,
} from './gsc/types';

// Content Types
export type {
  ExpansionContext,
  ExpandedBlogPost,
  EnhancedBlogPost,
  ContentEnhancementPlan,
} from './content/types';

// Linking Types
export type {
  SitePage,
  LinkableContent,
  LinkOpportunity,
  LinkedBlogPost,
  LinkInventory,
  InsertionPoint,
  InternalLinkGraph,
  LinkNode,
  LinkEdge,
} from './linking/types';

// Validation Types
export type {
  EEATCriteria,
  EEATValidationResult,
  KeywordOptimizationContext,
  KeywordOptimizationResult,
  QualityStandards,
  QualityCheckResult,
  ValidationRule,
  ValidationSuite,
  ValidationResult,
  ValidationIssue,
  ValidationReport,
} from './validation/types';

// Tracking Types
export type {
  TrackingContext,
  PostUpdateRecord,
  ImplementationReport,
} from './tracking/types';

// Utility Types
export type {
  ErrorReport,
  LogLevel,
} from './utils/types';

// Configuration
export { SEO_ENHANCEMENT_CONFIG } from './seo-enhancement.config';
export type { SEOEnhancementConfig } from './seo-enhancement.config';

// GSC Analyzer Functions
export {
  parseQueriesCSV,
  parsePagesCSV,
  parseChartCSV,
  identifyHighOpportunityKeywords,
  buildSemanticClusters,
  identifyUnderperformingPages,
  generateAnalysisReport,
} from './gsc/analyzer';

// Content Analyzer Functions
export {
  calculateCurrentWordCount,
  identifyContentGaps,
} from './content/analyzer';

// Content Generator Functions
export {
  generateNewSections,
  generateFAQItems,
} from './content/generator';

// Content Expander Functions
export {
  expandBlogPost,
} from './content/expander';

// Linking Functions
export {
  buildLinkInventory,
  calculateRelevanceScore,
} from './linking/linker';

// Tracking Functions
export {
  recordUpdate,
  getUpdateRecord,
  updateStatus,
  generateProgressReport,
  generateCompletionReport,
  identifyFailedPosts,
  exportMetrics,
} from './tracking/tracker';

// Pipeline Functions
export {
  enhancePost,
  enhancePosts,
} from './pipeline';
export type {
  EnhancementResult,
  PipelineOptions,
} from './pipeline';

/**
 * Implementation Tracking Types
 */

import type { BlogPost } from '@/lib/blog';
import type { EEATValidationResult, QualityCheckResult, KeywordOptimizationResult } from '../validation/types';

export interface TrackingContext {
  allPosts: BlogPost[];
  completedPosts: string[];
  inProgressPosts: string[];
}

export interface PostUpdateRecord {
  slug: string;
  updateDate: string;
  changes: {
    wordCountBefore: number;
    wordCountAfter: number;
    linksAdded: number;
    sectionsAdded: number;
    faqItemsAdded: number;
    keywordsIntegrated: string[];
  };
  validationResults: {
    eeat: EEATValidationResult;
    quality: QualityCheckResult;
    keywords: KeywordOptimizationResult;
  };
  status: 'pending' | 'in-progress' | 'completed' | 'failed-validation';
}

export interface ImplementationReport {
  totalPosts: number;
  completedPosts: number;
  inProgressPosts: number;
  failedPosts: number;
  aggregateMetrics: {
    avgWordCountIncrease: number;
    avgLinksAdded: number;
    avgEEATScore: number;
    avgQualityScore: number;
  };
  timeline: {
    startDate: string;
    lastUpdateDate: string;
    estimatedCompletion: string;
  };
}

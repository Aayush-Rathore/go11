/**
 * Validation Types
 */

import type { BlogPost } from '@/lib/blog';

export interface EEATCriteria {
  requiresAuthor: boolean;
  requiresReviewer: boolean;
  requiresCredentials: boolean;
  requiresExperience: boolean;
  requiresDataSupport: boolean;
}

export interface EEATValidationResult {
  passed: boolean;
  score: number;
  checks: {
    hasAuthor: boolean;
    hasReviewer: boolean;
    hasCredentials: boolean;
    demonstratesExperience: boolean;
    hasDataSupport: boolean;
    addressesSafety: boolean;
    isCurrentlyDated: boolean;
  };
  issues: string[];
  recommendations: string[];
}

export interface KeywordOptimizationContext {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  semanticVariations: string[];
  targetDensity: number;
}

export interface KeywordOptimizationResult {
  keywordDensity: Map<string, number>;
  keywordPlacements: {
    inTitle: string[];
    inFirstParagraph: string[];
    inHeadings: string[];
    inFAQ: string[];
  };
  overOptimized: string[];
  underOptimized: string[];
  naturalnessScore: number;
}

export interface QualityStandards {
  minFleschScore: number;
  maxParagraphWords: number;
  minActiveVoicePercent: number;
  requiresExamples: boolean;
  requiresActionableSteps: boolean;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number;
  metrics: {
    fleschReadingEase: number;
    avgParagraphLength: number;
    activeVoicePercent: number;
    hasExamples: boolean;
    hasActionableSteps: boolean;
    logicalFlow: boolean;
    technicalTermsExplained: boolean;
    userIntentAlignment: number;
  };
  issues: string[];
  recommendations: string[];
}

export interface ValidationRule {
  id: string;
  name: string;
  category: 'eeat' | 'quality' | 'keywords' | 'structure';
  severity: 'error' | 'warning' | 'info';
  check: (post: BlogPost) => boolean;
  message: string;
}

export interface ValidationSuite {
  rules: ValidationRule[];
  run(post: BlogPost): ValidationResult;
}

export interface ValidationResult {
  passed: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

export interface ValidationIssue {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: {
    section?: number;
    paragraph?: number;
  };
}

export interface ValidationReport {
  postSlug: string;
  overallStatus: 'pass' | 'fail' | 'warning';
  scores: {
    eeat: number;
    quality: number;
    keywords: number;
    readability: number;
    structure: number;
  };
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  recommendations: string[];
  nextSteps: string[];
}

/**
 * Content Enhancement Types
 */

import type { BlogPost, BlogSection } from '@/lib/blog';
import type { KeywordOpportunity } from '../gsc/types';

export interface ExpansionContext {
  targetWordCount: number;
  keywordOpportunities: KeywordOpportunity[];
  relatedQueries: string[];
  existingWordCount: number;
}

export interface ExpandedBlogPost extends BlogPost {
  expansionMetadata: {
    originalWordCount: number;
    finalWordCount: number;
    sectionsAdded: number;
    faqItemsAdded: number;
    keywordsIntegrated: string[];
    expansionDate: string;
  };
}

export interface EnhancedBlogPost extends BlogPost {
  metadata: {
    originalWordCount: number;
    enhancedWordCount: number;
    internalLinkCount: number;
    targetKeywords: string[];
    eeAtScore: number;
    qualityScore: number;
    lastEnhanced: string;
  };
}

export interface ContentEnhancementPlan {
  slug: string;
  currentState: {
    wordCount: number;
    linkCount: number;
    sectionCount: number;
    faqCount: number;
  };
  targetState: {
    wordCount: number;
    linkCount: number;
    sectionsToAdd: string[];
    faqsToAdd: number;
  };
  keywordStrategy: {
    primary: string[];
    secondary: string[];
    variations: string[];
  };
  estimatedEffort: 'low' | 'medium' | 'high';
}

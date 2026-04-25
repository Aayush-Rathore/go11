/**
 * SEO Content Enhancement Configuration
 * 
 * This configuration defines all thresholds, targets, and validation standards
 * for the SEO content enhancement system.
 */

export const SEO_ENHANCEMENT_CONFIG = {
  /**
   * Content expansion settings
   */
  content: {
    targetWordCount: 2500,
    maxWordCount: 5000,
    minParagraphWords: 40,
    maxParagraphWords: 150,
    targetParagraphWords: 100,
  },

  /**
   * Internal linking settings
   */
  linking: {
    minLinks: 20,
    maxLinks: 25,
    maxLinksPerTarget: 3,
    blogLinkPercent: 0.45,
    pageLinkPercent: 0.35,
  },

  /**
   * Keyword optimization settings
   */
  keywords: {
    primaryDensityMin: 0.01,
    primaryDensityMax: 0.02,
    secondaryDensityMin: 0.005,
    secondaryDensityMax: 0.01,
    overOptimizationThreshold: 0.025,
  },

  /**
   * Validation thresholds
   */
  validation: {
    eeAtMinScore: 70,
    qualityMinScore: 70,
    keywordMinScore: 70,
    minFleschScore: 60,
    minActiveVoicePercent: 80,
  },

  /**
   * GSC analysis settings
   */
  gsc: {
    highOpportunityImpressions: 50,
    lowCTRThreshold: 0.10,
    improvablePositionMin: 4,
    improvablePositionMax: 20,
  },
} as const;

export type SEOEnhancementConfig = typeof SEO_ENHANCEMENT_CONFIG;

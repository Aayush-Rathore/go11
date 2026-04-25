/**
 * SEO Content Enhancement Pipeline
 * 
 * Main orchestration function that coordinates all enhancement components:
 * - GSC data analysis
 * - Content expansion
 * - Internal linking
 * - Validation (E-E-A-T, keywords, quality)
 * - Implementation tracking
 * 
 * Task 10.1: Build end-to-end enhancement pipeline
 * Requirements: 1.1-1.8, 2.1-2.8, 3.1-3.9, 4.1-4.8, 5.1-5.8, 6.1-6.8, 7.1-7.7
 */

import type { BlogPost } from '@/lib/blog';
import type { GSCAnalysisReport, KeywordOpportunity } from './gsc/types';
import type { ExpandedBlogPost, ExpansionContext } from './content/types';
import type { LinkedBlogPost, LinkableContent } from './linking/types';
import type { 
  EEATValidationResult, 
  KeywordOptimizationResult, 
  QualityCheckResult,
  KeywordOptimizationContext,
  QualityStandards
} from './validation/types';
import type { PostUpdateRecord } from './tracking/types';

import { generateAnalysisReport } from './gsc/analyzer';
import { calculateCurrentWordCount } from './content/analyzer';
import { expandBlogPost } from './content/expander';
import { 
  buildLinkInventory, 
  identifyLinkOpportunities, 
  insertLinks,
  validateLinkDistribution 
} from './linking/linker';
import { generateValidationResult } from './validation/eeat-validator';
import { 
  generateOptimizationReport,
  optimizeContent 
} from './content/keyword-optimizer';
import { generateQualityReport } from './content/quality-checker';
import { recordUpdate, updateStatus } from './tracking/tracker';
import { SEO_ENHANCEMENT_CONFIG } from './seo-enhancement.config';

// ---------------------------------------------------------------------------
// Pipeline Result Types
// ---------------------------------------------------------------------------

export interface EnhancementResult {
  success: boolean;
  post: BlogPost;
  status: 'completed' | 'failed-validation' | 'error';
  validationResults?: {
    eeat: EEATValidationResult;
    quality: QualityCheckResult;
    keywords: KeywordOptimizationResult;
    linkDistribution?: { valid: boolean; issues: string[] };
  };
  errors?: string[];
  warnings?: string[];
  metadata: {
    originalWordCount: number;
    finalWordCount: number;
    linksAdded: number;
    sectionsAdded: number;
    faqItemsAdded: number;
    keywordsIntegrated: string[];
  };
}

export interface PipelineOptions {
  gscDirectory?: string;
  targetWordCount?: number;
  targetLinkCount?: number;
  allPosts: BlogPost[];
  skipValidation?: boolean;
  rollbackOnFailure?: boolean;
}

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

class PipelineError extends Error {
  constructor(
    message: string,
    public stage: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

// ---------------------------------------------------------------------------
// Main Pipeline Function
// ---------------------------------------------------------------------------

/**
 * Enhance a single blog post through the complete SEO enhancement pipeline.
 * 
 * Pipeline stages:
 * 1. Load GSC data and identify keyword opportunities
 * 2. Expand content to target word count (2500+)
 * 3. Add internal links (20-25)
 * 4. Validate E-E-A-T compliance
 * 5. Validate keyword optimization
 * 6. Validate content quality
 * 7. Track implementation
 * 
 * @param post - The blog post to enhance
 * @param options - Pipeline configuration options
 * @returns EnhancementResult with enhanced post and validation results
 */
export async function enhancePost(
  post: BlogPost,
  options: PipelineOptions
): Promise<EnhancementResult> {
  const {
    gscDirectory = 'gsc',
    targetWordCount = SEO_ENHANCEMENT_CONFIG.content.targetWordCount,
    targetLinkCount = 22, // Middle of 20-25 range
    allPosts,
    skipValidation = false,
    rollbackOnFailure = true,
  } = options;

  // Store original post for rollback
  const originalPost = { ...post };
  const originalWordCount = calculateCurrentWordCount(post);

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 1: Load GSC Data
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 1: Loading GSC data for ${post.slug}...`);
    
    let gscReport: GSCAnalysisReport;
    try {
      gscReport = generateAnalysisReport(gscDirectory);
      console.log(`[Pipeline] ✓ Loaded ${gscReport.keywordOpportunities.length} keyword opportunities`);
    } catch (error) {
      throw new PipelineError(
        `Failed to load GSC data: ${(error as Error).message}`,
        'gsc-analysis',
        error as Error
      );
    }

    // Extract keyword opportunities relevant to this post
    const postKeywords = post.keywords.map(k => k.toLowerCase());
    const relevantOpportunities = gscReport.keywordOpportunities.filter(opp => {
      const oppKeyword = opp.keyword.toLowerCase();
      return postKeywords.some(pk => 
        oppKeyword.includes(pk) || pk.includes(oppKeyword)
      );
    });

    if (relevantOpportunities.length === 0) {
      warnings.push('No relevant keyword opportunities found in GSC data for this post');
    }

    // Build related queries from semantic clusters
    const relatedQueries: string[] = [];
    for (const [primary, variations] of gscReport.semanticClusters) {
      if (postKeywords.some(pk => primary.toLowerCase().includes(pk))) {
        relatedQueries.push(primary, ...variations);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 2: Expand Content
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 2: Expanding content from ${originalWordCount} to ${targetWordCount} words...`);
    
    let expandedPost: ExpandedBlogPost;
    try {
      const expansionContext: ExpansionContext = {
        targetWordCount,
        keywordOpportunities: relevantOpportunities,
        relatedQueries: relatedQueries.slice(0, 10), // Limit to top 10
        existingWordCount: originalWordCount,
      };

      expandedPost = expandBlogPost(post, expansionContext);
      console.log(`[Pipeline] ✓ Expanded to ${expandedPost.expansionMetadata.finalWordCount} words`);
      console.log(`[Pipeline]   - Added ${expandedPost.expansionMetadata.sectionsAdded} sections`);
      console.log(`[Pipeline]   - Added ${expandedPost.expansionMetadata.faqItemsAdded} FAQ items`);

      if (expandedPost.expansionMetadata.finalWordCount < targetWordCount) {
        warnings.push(
          `Target word count not reached: ${expandedPost.expansionMetadata.finalWordCount}/${targetWordCount}`
        );
      }
    } catch (error) {
      throw new PipelineError(
        `Failed to expand content: ${(error as Error).message}`,
        'content-expansion',
        error as Error
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 3: Add Internal Links
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 3: Adding ${targetLinkCount} internal links...`);
    
    let linkedPost: LinkedBlogPost;
    try {
      const inventory = buildLinkInventory(allPosts);
      
      const linkableContent: LinkableContent = {
        post: expandedPost,
        allPosts,
        sitePages: inventory.sitePages.map(sp => ({
          path: sp.path,
          title: sp.title,
          keywords: sp.keywords,
          description: sp.purpose,
        })),
      };

      const opportunities = identifyLinkOpportunities(linkableContent, targetLinkCount);
      linkedPost = insertLinks(expandedPost, opportunities);

      console.log(`[Pipeline] ✓ Added ${linkedPost.linkingMetadata.totalLinks} internal links`);
      console.log(`[Pipeline]   - Blog links: ${linkedPost.linkingMetadata.blogLinks}`);
      console.log(`[Pipeline]   - Page links: ${linkedPost.linkingMetadata.pageLinks}`);

      if (linkedPost.linkingMetadata.totalLinks < 20) {
        warnings.push(
          `Minimum link count not reached: ${linkedPost.linkingMetadata.totalLinks}/20`
        );
      } else if (linkedPost.linkingMetadata.totalLinks > 25) {
        warnings.push(
          `Maximum link count exceeded: ${linkedPost.linkingMetadata.totalLinks}/25`
        );
      }
    } catch (error) {
      throw new PipelineError(
        `Failed to add internal links: ${(error as Error).message}`,
        'internal-linking',
        error as Error
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 4: Validate E-E-A-T
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 4: Validating E-E-A-T compliance...`);
    
    let eeAtResult: EEATValidationResult;
    try {
      eeAtResult = generateValidationResult(linkedPost);
      console.log(`[Pipeline] ✓ E-E-A-T score: ${eeAtResult.score}/100 (${eeAtResult.passed ? 'PASS' : 'FAIL'})`);

      if (!eeAtResult.passed && !skipValidation) {
        errors.push(`E-E-A-T validation failed (score: ${eeAtResult.score}/100)`);
        errors.push(...eeAtResult.issues);
      } else if (!eeAtResult.passed) {
        warnings.push(`E-E-A-T validation failed (score: ${eeAtResult.score}/100)`);
        warnings.push(...eeAtResult.issues);
      }
    } catch (error) {
      throw new PipelineError(
        `Failed to validate E-E-A-T: ${(error as Error).message}`,
        'eeat-validation',
        error as Error
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 5: Validate Keyword Optimization
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 5: Validating keyword optimization...`);
    
    let keywordResult: KeywordOptimizationResult;
    try {
      // Extract primary and secondary keywords from opportunities
      const primaryKeywords = relevantOpportunities
        .slice(0, 3)
        .map(opp => opp.keyword);
      
      const secondaryKeywords = relevantOpportunities
        .slice(3, 8)
        .map(opp => opp.keyword);

      // Build semantic variations from clusters
      const semanticVariations: string[] = [];
      for (const [primary, variations] of gscReport.semanticClusters) {
        if (primaryKeywords.some(pk => pk.toLowerCase() === primary.toLowerCase())) {
          semanticVariations.push(...variations);
        }
      }

      const keywordContext: KeywordOptimizationContext = {
        primaryKeywords,
        secondaryKeywords,
        semanticVariations: semanticVariations.slice(0, 5),
        targetDensity: SEO_ENHANCEMENT_CONFIG.keywords.primaryDensityMin,
      };

      keywordResult = generateOptimizationReport(linkedPost, keywordContext);
      console.log(`[Pipeline] ✓ Keyword naturalness score: ${keywordResult.naturalnessScore}/100`);

      if (keywordResult.overOptimized.length > 0) {
        warnings.push(`Over-optimized keywords: ${keywordResult.overOptimized.join(', ')}`);
      }

      if (keywordResult.underOptimized.length > 0) {
        warnings.push(`Under-optimized keywords: ${keywordResult.underOptimized.join(', ')}`);
      }

      if (keywordResult.naturalnessScore < 70 && !skipValidation) {
        errors.push(`Keyword naturalness score too low: ${keywordResult.naturalnessScore}/100`);
      }
    } catch (error) {
      throw new PipelineError(
        `Failed to validate keywords: ${(error as Error).message}`,
        'keyword-validation',
        error as Error
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 6: Validate Content Quality
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 6: Validating content quality...`);
    
    let qualityResult: QualityCheckResult;
    try {
      const qualityStandards: QualityStandards = {
        minFleschScore: SEO_ENHANCEMENT_CONFIG.validation.minFleschScore,
        maxParagraphWords: SEO_ENHANCEMENT_CONFIG.content.maxParagraphWords,
        minActiveVoicePercent: SEO_ENHANCEMENT_CONFIG.validation.minActiveVoicePercent,
        requiresExamples: true,
        requiresActionableSteps: true,
      };

      const targetKeywords = [
        ...relevantOpportunities.slice(0, 5).map(opp => opp.keyword),
        ...post.keywords,
      ];

      qualityResult = generateQualityReport(linkedPost, qualityStandards, targetKeywords);
      console.log(`[Pipeline] ✓ Quality score: ${qualityResult.score}/100 (${qualityResult.passed ? 'PASS' : 'FAIL'})`);
      console.log(`[Pipeline]   - Flesch score: ${qualityResult.metrics.fleschReadingEase.toFixed(1)}`);
      console.log(`[Pipeline]   - Active voice: ${qualityResult.metrics.activeVoicePercent.toFixed(1)}%`);

      if (!qualityResult.passed && !skipValidation) {
        errors.push(`Quality validation failed (score: ${qualityResult.score}/100)`);
        errors.push(...qualityResult.issues);
      } else if (!qualityResult.passed) {
        warnings.push(`Quality validation failed (score: ${qualityResult.score}/100)`);
        warnings.push(...qualityResult.issues);
      }
    } catch (error) {
      throw new PipelineError(
        `Failed to validate quality: ${(error as Error).message}`,
        'quality-validation',
        error as Error
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 7: Validate Link Distribution
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 7: Validating link distribution...`);
    
    let linkDistributionResult: { valid: boolean; issues: string[] };
    try {
      linkDistributionResult = validateLinkDistribution(linkedPost);
      
      if (linkDistributionResult.valid) {
        console.log(`[Pipeline] ✓ Link distribution valid`);
      } else {
        console.log(`[Pipeline] ✗ Link distribution issues found`);
        if (!skipValidation) {
          errors.push('Link distribution validation failed');
          errors.push(...linkDistributionResult.issues);
        } else {
          warnings.push('Link distribution validation failed');
          warnings.push(...linkDistributionResult.issues);
        }
      }
    } catch (error) {
      throw new PipelineError(
        `Failed to validate link distribution: ${(error as Error).message}`,
        'link-distribution-validation',
        error as Error
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 8: Track Implementation
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[Pipeline] Stage 8: Recording implementation...`);
    
    const finalWordCount = calculateCurrentWordCount(linkedPost);
    const status = errors.length > 0 ? 'failed-validation' : 'completed';

    const trackingRecord: PostUpdateRecord = {
      slug: post.slug,
      updateDate: new Date().toISOString(),
      changes: {
        wordCountBefore: originalWordCount,
        wordCountAfter: finalWordCount,
        linksAdded: linkedPost.linkingMetadata.totalLinks,
        sectionsAdded: expandedPost.expansionMetadata.sectionsAdded,
        faqItemsAdded: expandedPost.expansionMetadata.faqItemsAdded,
        keywordsIntegrated: expandedPost.expansionMetadata.keywordsIntegrated,
      },
      validationResults: {
        eeat: eeAtResult,
        quality: qualityResult,
        keywords: keywordResult,
      },
      status,
    };

    try {
      recordUpdate(trackingRecord);
      console.log(`[Pipeline] ✓ Tracking record saved with status: ${status}`);
    } catch (error) {
      warnings.push(`Failed to save tracking record: ${(error as Error).message}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FINAL RESULT
    // ═══════════════════════════════════════════════════════════════════════
    
    const success = errors.length === 0;
    const finalPost = success ? linkedPost : (rollbackOnFailure ? originalPost : linkedPost);

    if (!success && rollbackOnFailure) {
      console.log(`[Pipeline] ✗ Enhancement failed, rolling back to original post`);
    }

    console.log(`[Pipeline] ${success ? '✓' : '✗'} Enhancement ${success ? 'completed' : 'failed'} for ${post.slug}`);
    console.log(`[Pipeline]   - Word count: ${originalWordCount} → ${finalWordCount}`);
    console.log(`[Pipeline]   - Links added: ${linkedPost.linkingMetadata.totalLinks}`);
    console.log(`[Pipeline]   - E-E-A-T: ${eeAtResult.score}/100`);
    console.log(`[Pipeline]   - Quality: ${qualityResult.score}/100`);
    console.log(`[Pipeline]   - Errors: ${errors.length}, Warnings: ${warnings.length}`);

    return {
      success,
      post: finalPost,
      status,
      validationResults: {
        eeat: eeAtResult,
        quality: qualityResult,
        keywords: keywordResult,
        linkDistribution: linkDistributionResult,
      },
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        originalWordCount,
        finalWordCount,
        linksAdded: linkedPost.linkingMetadata.totalLinks,
        sectionsAdded: expandedPost.expansionMetadata.sectionsAdded,
        faqItemsAdded: expandedPost.expansionMetadata.faqItemsAdded,
        keywordsIntegrated: expandedPost.expansionMetadata.keywordsIntegrated,
      },
    };

  } catch (error) {
    // Handle pipeline errors
    if (error instanceof PipelineError) {
      console.error(`[Pipeline] ✗ Error in stage "${error.stage}": ${error.message}`);
      
      return {
        success: false,
        post: rollbackOnFailure ? originalPost : post,
        status: 'error',
        errors: [
          `Pipeline failed at stage "${error.stage}": ${error.message}`,
          ...(error.originalError ? [error.originalError.message] : []),
        ],
        warnings,
        metadata: {
          originalWordCount,
          finalWordCount: originalWordCount,
          linksAdded: 0,
          sectionsAdded: 0,
          faqItemsAdded: 0,
          keywordsIntegrated: [],
        },
      };
    }

    // Handle unexpected errors
    console.error(`[Pipeline] ✗ Unexpected error: ${(error as Error).message}`);
    
    return {
      success: false,
      post: rollbackOnFailure ? originalPost : post,
      status: 'error',
      errors: [`Unexpected error: ${(error as Error).message}`],
      warnings,
      metadata: {
        originalWordCount,
        finalWordCount: originalWordCount,
        linksAdded: 0,
        sectionsAdded: 0,
        faqItemsAdded: 0,
        keywordsIntegrated: [],
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Batch Processing
// ---------------------------------------------------------------------------

/**
 * Enhance multiple blog posts in sequence.
 * 
 * @param posts - Array of blog posts to enhance
 * @param options - Pipeline configuration options
 * @returns Array of enhancement results
 */
export async function enhancePosts(
  posts: BlogPost[],
  options: Omit<PipelineOptions, 'allPosts'>
): Promise<EnhancementResult[]> {
  const results: EnhancementResult[] = [];
  
  console.log(`[Pipeline] Starting batch enhancement of ${posts.length} posts...`);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n[Pipeline] ═══════════════════════════════════════════════════════════`);
    console.log(`[Pipeline] Processing post ${i + 1}/${posts.length}: ${post.slug}`);
    console.log(`[Pipeline] ═══════════════════════════════════════════════════════════\n`);
    
    const result = await enhancePost(post, {
      ...options,
      allPosts: posts,
    });
    
    results.push(result);
    
    // Brief pause between posts to avoid overwhelming the system
    if (i < posts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n[Pipeline] ═══════════════════════════════════════════════════════════`);
  console.log(`[Pipeline] Batch enhancement complete`);
  console.log(`[Pipeline] ═══════════════════════════════════════════════════════════`);
  console.log(`[Pipeline] Total: ${posts.length} posts`);
  console.log(`[Pipeline] Successful: ${successful}`);
  console.log(`[Pipeline] Failed: ${failed}`);
  console.log(`[Pipeline] ═══════════════════════════════════════════════════════════\n`);
  
  return results;
}

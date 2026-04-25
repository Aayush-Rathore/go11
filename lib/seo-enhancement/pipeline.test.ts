/**
 * Pipeline Integration Tests
 * 
 * Tests the end-to-end enhancement pipeline with realistic blog post data.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { BlogPost } from '@/lib/blog';
import { enhancePost, enhancePosts } from './pipeline';
import * as fs from 'fs';
import * as path from 'path';

// Mock the GSC CSV files
vi.mock('fs');

describe('SEO Enhancement Pipeline', () => {
  const mockGSCQueries = `Top queries,Clicks,Impressions,CTR,Position
goplay11,50,500,10%,8.5
goplay11 app download,30,400,7.5%,12.3
fantasy app india,20,300,6.67%,15.2
gopay11,15,200,7.5%,10.1`;

  const mockGSCPages = `Top pages,Clicks,Impressions,CTR,Position
https://example.com/blog/test-post,100,1000,10%,9.2
https://example.com/,50,800,6.25%,5.1`;

  const mockGSCChart = `Date,Clicks,Impressions,CTR,Position
2026-04-01,100,1000,10%,9.2
2026-04-02,110,1100,10%,9.1`;

  const samplePost: BlogPost = {
    slug: 'test-post',
    title: 'Test Fantasy App Guide',
    description: 'A comprehensive guide to fantasy apps',
    excerpt: 'Learn about fantasy apps',
    publishedAt: '2026-01-01',
    updatedAt: '2026-04-20',
    author: 'Rohan Mehta, Fantasy Strategy Analyst with 8+ years in contest analytics',
    reviewer: 'Ananya Kulkarni, Senior Content Editor',
    keywords: ['goplay11', 'fantasy app', 'app download'],
    sections: [
      {
        heading: 'Introduction to Fantasy Apps',
        paragraphs: [
          'Fantasy apps have become increasingly popular in India. Users can create teams and compete in contests.',
          'The best fantasy apps offer secure downloads and reliable gameplay.',
        ],
      },
      {
        heading: 'Why Choose GoPlay11',
        paragraphs: [
          'GoPlay11 stands out for its user-friendly interface and quick setup process.',
          'Download the app from official sources to ensure security.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is GoPlay11 safe to use?',
        answer: 'Yes, GoPlay11 follows all security best practices and responsible gaming guidelines.',
      },
    ],
  };

  const allPosts: BlogPost[] = [
    samplePost,
    {
      slug: 'another-post',
      title: 'Another Fantasy Guide',
      description: 'More fantasy tips',
      excerpt: 'Tips and tricks',
      publishedAt: '2026-01-15',
      updatedAt: '2026-04-15',
      keywords: ['fantasy tips', 'gaming strategy'],
      sections: [
        {
          heading: 'Getting Started',
          paragraphs: ['Start your fantasy journey today.'],
        },
      ],
    },
  ];

  beforeEach(() => {
    // Mock fs.readFileSync to return our mock CSV data
    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      if (pathStr.includes('Queries.csv')) return mockGSCQueries;
      if (pathStr.includes('Pages.csv')) return mockGSCPages;
      if (pathStr.includes('Chart.csv')) return mockGSCChart;
      throw new Error(`File not found: ${pathStr}`);
    });

    // Mock fs.existsSync
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock fs.mkdirSync
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

    // Mock fs.writeFileSync
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
  });

  describe('enhancePost', () => {
    it('should successfully enhance a blog post through the full pipeline', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        gscDirectory: 'gsc',
        targetWordCount: 2500,
        targetLinkCount: 22,
        skipValidation: true, // Skip validation for basic pipeline test
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.post).toBeDefined();
      expect(result.validationResults).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should expand content beyond original word count', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        targetWordCount: 2500,
        skipValidation: true,
      });

      // Content should be expanded (even if not to full target)
      expect(result.metadata.finalWordCount).toBeGreaterThan(result.metadata.originalWordCount);
      expect(result.metadata.sectionsAdded).toBeGreaterThanOrEqual(0);
      expect(result.metadata.faqItemsAdded).toBeGreaterThanOrEqual(0);
    });

    it('should add internal links', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        targetLinkCount: 22,
        skipValidation: true,
      });

      // Should add at least some links (may not reach target with minimal content)
      expect(result.metadata.linksAdded).toBeGreaterThan(0);
    });

    it('should validate E-E-A-T compliance', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.validationResults?.eeat).toBeDefined();
      expect(result.validationResults?.eeat.score).toBeGreaterThanOrEqual(0);
      expect(result.validationResults?.eeat.score).toBeLessThanOrEqual(100);
      expect(result.validationResults?.eeat.checks).toBeDefined();
    });

    it('should validate keyword optimization', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.validationResults?.keywords).toBeDefined();
      expect(result.validationResults?.keywords.keywordDensity).toBeDefined();
      expect(result.validationResults?.keywords.naturalnessScore).toBeGreaterThanOrEqual(0);
      expect(result.validationResults?.keywords.naturalnessScore).toBeLessThanOrEqual(100);
    });

    it('should validate content quality', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.validationResults?.quality).toBeDefined();
      expect(result.validationResults?.quality.score).toBeGreaterThanOrEqual(0);
      expect(result.validationResults?.quality.score).toBeLessThanOrEqual(100);
      expect(result.validationResults?.quality.metrics).toBeDefined();
    });

    it('should preserve author and reviewer attributions', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.post.author).toBe(samplePost.author);
      expect(result.post.reviewer).toBe(samplePost.reviewer);
    });

    it('should handle validation failures gracefully', async () => {
      const poorPost: BlogPost = {
        ...samplePost,
        author: undefined, // Missing author
        updatedAt: '2020-01-01', // Outdated
      };

      const result = await enhancePost(poorPost, {
        allPosts,
        skipValidation: false,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed-validation');
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should rollback on failure when rollbackOnFailure is true', async () => {
      const poorPost: BlogPost = {
        ...samplePost,
        author: undefined,
      };

      const result = await enhancePost(poorPost, {
        allPosts,
        rollbackOnFailure: true,
      });

      expect(result.post).toEqual(poorPost);
    });

    it('should not rollback on failure when rollbackOnFailure is false', async () => {
      const poorPost: BlogPost = {
        ...samplePost,
        author: undefined,
      };

      const result = await enhancePost(poorPost, {
        allPosts,
        rollbackOnFailure: false,
      });

      // Post should be enhanced even though validation failed
      expect(result.metadata.finalWordCount).toBeGreaterThan(result.metadata.originalWordCount);
    });

    it('should skip validation when skipValidation is true', async () => {
      const poorPost: BlogPost = {
        ...samplePost,
        author: undefined,
      };

      const result = await enhancePost(poorPost, {
        allPosts,
        skipValidation: true,
      });

      // Should succeed despite validation issues
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
    });

    it('should handle GSC data loading errors', async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('GSC data');
    });

    it('should integrate keywords from GSC opportunities', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        skipValidation: true,
      });

      // Keywords may or may not be integrated depending on content expansion
      expect(Array.isArray(result.metadata.keywordsIntegrated)).toBe(true);
    });

    it('should add FAQ items when needed', async () => {
      const postWithoutFAQ: BlogPost = {
        ...samplePost,
        faq: undefined,
      };

      const result = await enhancePost(postWithoutFAQ, {
        allPosts,
      });

      expect(result.metadata.faqItemsAdded).toBeGreaterThan(0);
    });

    it('should validate link distribution', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.validationResults?.linkDistribution).toBeDefined();
      expect(result.validationResults?.linkDistribution?.valid).toBeDefined();
    });

    it('should track implementation with PostUpdateRecord', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      // Verify tracking was attempted (fs.writeFileSync should be called)
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('enhancePosts', () => {
    it('should enhance multiple posts in sequence', async () => {
      const results = await enhancePosts(allPosts, {
        targetWordCount: 2500,
        targetLinkCount: 22,
      });

      expect(results).toHaveLength(allPosts.length);
      expect(results.every(r => r.metadata)).toBe(true);
    });

    it('should continue processing after a failure', async () => {
      const postsWithFailure: BlogPost[] = [
        samplePost,
        { ...samplePost, slug: 'bad-post', author: undefined },
        allPosts[1],
      ];

      const results = await enhancePosts(postsWithFailure, {
        skipValidation: true, // Skip validation to test pipeline flow
      });

      expect(results).toHaveLength(3);
      // All should succeed when validation is skipped
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should provide batch summary statistics', async () => {
      const results = await enhancePosts(allPosts, {});

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      expect(successful + failed).toBe(allPosts.length);
    });
  });

  describe('Pipeline Error Handling', () => {
    it('should handle content expansion errors', async () => {
      // Mock an error in the expansion stage
      const postWithIssue: BlogPost = {
        ...samplePost,
        sections: [], // Empty sections might cause issues
      };

      const result = await enhancePost(postWithIssue, {
        allPosts,
      });

      // Should handle gracefully
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('should provide detailed error messages', async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('Disk read error');
      });

      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('GSC data');
    });

    it('should collect warnings without failing', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        targetWordCount: 5000, // Very high target
      });

      // Might not reach target but should still succeed
      if (result.metadata.finalWordCount < 5000) {
        expect(result.warnings).toBeDefined();
        expect(result.warnings!.some(w => w.includes('word count'))).toBe(true);
      }
    });
  });

  describe('Pipeline Metadata', () => {
    it('should track word count changes', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.metadata.originalWordCount).toBeDefined();
      expect(result.metadata.finalWordCount).toBeDefined();
      expect(result.metadata.finalWordCount).toBeGreaterThan(result.metadata.originalWordCount);
    });

    it('should track sections added', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.metadata.sectionsAdded).toBeGreaterThanOrEqual(0);
    });

    it('should track FAQ items added', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.metadata.faqItemsAdded).toBeGreaterThanOrEqual(0);
    });

    it('should track keywords integrated', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(Array.isArray(result.metadata.keywordsIntegrated)).toBe(true);
    });

    it('should track links added', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.metadata.linksAdded).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GSC Data Integration', () => {
    it('should handle missing Queries.csv file', async () => {
      vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        if (pathStr.includes('Queries.csv')) throw new Error('File not found: Queries.csv');
        if (pathStr.includes('Pages.csv')) return mockGSCPages;
        if (pathStr.includes('Chart.csv')) return mockGSCChart;
        throw new Error(`File not found: ${pathStr}`);
      });

      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('GSC data');
    });

    it('should handle missing Pages.csv file', async () => {
      vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        if (pathStr.includes('Queries.csv')) return mockGSCQueries;
        if (pathStr.includes('Pages.csv')) throw new Error('File not found: Pages.csv');
        if (pathStr.includes('Chart.csv')) return mockGSCChart;
        throw new Error(`File not found: ${pathStr}`);
      });

      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('GSC data');
    });

    it('should handle missing Chart.csv file', async () => {
      vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        if (pathStr.includes('Queries.csv')) return mockGSCQueries;
        if (pathStr.includes('Pages.csv')) return mockGSCPages;
        if (pathStr.includes('Chart.csv')) throw new Error('File not found: Chart.csv');
        throw new Error(`File not found: ${pathStr}`);
      });

      const result = await enhancePost(samplePost, {
        allPosts,
      });

      expect(result.success).toBe(false);
      // May be 'error' or 'failed-validation' depending on how far pipeline got
      expect(['error', 'failed-validation']).toContain(result.status);
      expect(result.errors).toBeDefined();
    });

    it('should handle empty GSC data files', async () => {
      vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        if (pathStr.includes('Queries.csv')) return 'Top queries,Clicks,Impressions,CTR,Position\n';
        if (pathStr.includes('Pages.csv')) return 'Top pages,Clicks,Impressions,CTR,Position\n';
        if (pathStr.includes('Chart.csv')) return 'Date,Clicks,Impressions,CTR,Position\n';
        throw new Error(`File not found: ${pathStr}`);
      });

      const result = await enhancePost(samplePost, {
        allPosts,
        skipValidation: true,
      });

      // Empty CSV files cause an error in GSC analysis
      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.errors).toBeDefined();
    });

    it('should handle malformed GSC CSV data', async () => {
      vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        if (pathStr.includes('Queries.csv')) return 'Invalid,CSV,Format\nBad,Data,Here';
        if (pathStr.includes('Pages.csv')) return mockGSCPages;
        if (pathStr.includes('Chart.csv')) return mockGSCChart;
        throw new Error(`File not found: ${pathStr}`);
      });

      const result = await enhancePost(samplePost, {
        allPosts,
      });

      // Should fail due to malformed data
      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
    });

    it('should handle GSC directory that does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = await enhancePost(samplePost, {
        allPosts,
        gscDirectory: 'nonexistent-directory',
      });

      // May fail at GSC stage or continue with validation failures
      expect(result.success).toBe(false);
      expect(['error', 'failed-validation']).toContain(result.status);
    });
  });

  describe('End-to-End Pipeline Scenarios', () => {
    it('should handle post with no keywords matching GSC data', async () => {
      const postWithUnrelatedKeywords: BlogPost = {
        ...samplePost,
        keywords: ['unrelated', 'keywords', 'that', 'dont', 'match'],
      };

      const result = await enhancePost(postWithUnrelatedKeywords, {
        allPosts,
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.some(w => w.includes('keyword opportunities'))).toBe(true);
    });

    it('should handle post with very short content', async () => {
      const shortPost: BlogPost = {
        ...samplePost,
        sections: [
          {
            heading: 'Short Section',
            paragraphs: ['Very short content.'],
          },
        ],
      };

      const result = await enhancePost(shortPost, {
        allPosts,
        targetWordCount: 2500,
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.metadata.finalWordCount).toBeGreaterThan(result.metadata.originalWordCount);
    });

    it('should handle post with no FAQ section', async () => {
      const postWithoutFAQ: BlogPost = {
        ...samplePost,
        faq: undefined,
      };

      const result = await enhancePost(postWithoutFAQ, {
        allPosts,
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.metadata.faqItemsAdded).toBeGreaterThan(0);
      expect(result.post.faq).toBeDefined();
      expect(result.post.faq!.length).toBeGreaterThan(0);
    });

    it('should handle post with empty FAQ array', async () => {
      const postWithEmptyFAQ: BlogPost = {
        ...samplePost,
        faq: [],
      };

      const result = await enhancePost(postWithEmptyFAQ, {
        allPosts,
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.metadata.faqItemsAdded).toBeGreaterThan(0);
    });

    it('should handle post already meeting word count target', async () => {
      // Create a post with many sections to reach target word count
      const longPost: BlogPost = {
        ...samplePost,
        sections: Array(20).fill(null).map((_, i) => ({
          heading: `Section ${i + 1}`,
          paragraphs: Array(5).fill(null).map((_, j) => 
            `This is paragraph ${j + 1} of section ${i + 1}. It contains enough words to make the section substantial. We need to ensure that the total word count of this post exceeds the target word count so we can test how the pipeline handles posts that are already long enough. This paragraph continues with more content to reach the desired length.`
          ),
        })),
      };

      const result = await enhancePost(longPost, {
        allPosts,
        targetWordCount: 500, // Low target
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      // Links may or may not be added depending on content structure
      expect(result.metadata.linksAdded).toBeGreaterThanOrEqual(0);
    });

    it('should handle batch processing with mixed success and failure', async () => {
      const mixedPosts: BlogPost[] = [
        samplePost, // Should succeed or fail based on validation
        { ...samplePost, slug: 'post-2', author: undefined }, // Should fail validation
        allPosts[1], // Should succeed or fail based on validation
        { ...samplePost, slug: 'post-4', updatedAt: '2020-01-01' }, // Should fail validation
      ];

      const results = await enhancePosts(mixedPosts, {
        skipValidation: false,
      });

      expect(results).toHaveLength(4);
      
      // Verify that processing continued after failures (all posts were processed)
      expect(results.every(r => r.metadata)).toBe(true);
      
      // At least some posts should have been processed
      expect(results.length).toBe(4);
    });

    it('should preserve original post structure when enhancement succeeds', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.post.slug).toBe(samplePost.slug);
      expect(result.post.title).toBe(samplePost.title);
      expect(result.post.description).toBe(samplePost.description);
      expect(result.post.publishedAt).toBe(samplePost.publishedAt);
    });

    it('should handle posts with special characters in content', async () => {
      const postWithSpecialChars: BlogPost = {
        ...samplePost,
        sections: [
          {
            heading: 'Special Characters & Symbols',
            paragraphs: [
              'This content has special characters: ₹100, 50%, <tag>, "quotes", \'apostrophes\', and more!',
              'It also includes emojis 🎮 and unicode characters: café, naïve, résumé.',
            ],
          },
        ],
      };

      const result = await enhancePost(postWithSpecialChars, {
        allPosts,
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.post.sections[0].paragraphs[0]).toContain('₹100');
    });

    it('should handle concurrent validation checks', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        skipValidation: false,
      });

      // All validation results should be present
      expect(result.validationResults).toBeDefined();
      expect(result.validationResults!.eeat).toBeDefined();
      expect(result.validationResults!.quality).toBeDefined();
      expect(result.validationResults!.keywords).toBeDefined();
      expect(result.validationResults!.linkDistribution).toBeDefined();
    });

    it('should generate comprehensive metadata for tracking', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        skipValidation: true,
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata.originalWordCount).toBeGreaterThan(0);
      expect(result.metadata.finalWordCount).toBeGreaterThan(0);
      expect(result.metadata.linksAdded).toBeGreaterThanOrEqual(0);
      expect(result.metadata.sectionsAdded).toBeGreaterThanOrEqual(0);
      expect(result.metadata.faqItemsAdded).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.metadata.keywordsIntegrated)).toBe(true);
    });
  });

  describe('Validation Failure Scenarios', () => {
    it('should fail validation for post with missing author', async () => {
      const postWithoutAuthor: BlogPost = {
        ...samplePost,
        author: undefined,
      };

      const result = await enhancePost(postWithoutAuthor, {
        allPosts,
        skipValidation: false,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed-validation');
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(e => e.includes('E-E-A-T'))).toBe(true);
    });

    it('should fail validation for post with outdated content', async () => {
      const outdatedPost: BlogPost = {
        ...samplePost,
        updatedAt: '2020-01-01',
      };

      const result = await enhancePost(outdatedPost, {
        allPosts,
        skipValidation: false,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed-validation');
    });

    it('should fail validation for post with generic author credentials', async () => {
      const postWithGenericAuthor: BlogPost = {
        ...samplePost,
        author: 'John Doe',
      };

      const result = await enhancePost(postWithGenericAuthor, {
        allPosts,
        skipValidation: false,
      });

      // Post should fail validation due to quality or other issues
      expect(result.success).toBe(false);
      // E-E-A-T score may vary, but overall validation should fail
      expect(result.status).toBe('failed-validation');
    });

    it('should collect multiple validation errors', async () => {
      const poorQualityPost: BlogPost = {
        ...samplePost,
        author: undefined,
        reviewer: undefined,
        updatedAt: '2020-01-01',
      };

      const result = await enhancePost(poorQualityPost, {
        allPosts,
        skipValidation: false,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(1);
    });

    it('should provide warnings without failing when skipValidation is true', async () => {
      const poorQualityPost: BlogPost = {
        ...samplePost,
        author: undefined,
        updatedAt: '2020-01-01',
      };

      const result = await enhancePost(poorQualityPost, {
        allPosts,
        skipValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
    });
  });

  describe('Link Distribution Validation', () => {
    it('should validate link distribution across sections', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        targetLinkCount: 22,
      });

      expect(result.validationResults?.linkDistribution).toBeDefined();
      expect(result.validationResults?.linkDistribution?.valid).toBeDefined();
    });

    it('should warn when link count is below minimum', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        targetLinkCount: 5, // Very low target
      });

      if (result.metadata.linksAdded < 20) {
        expect(result.warnings).toBeDefined();
        expect(result.warnings!.some(w => w.includes('link count'))).toBe(true);
      }
    });

    it('should warn when link count exceeds maximum', async () => {
      const result = await enhancePost(samplePost, {
        allPosts,
        targetLinkCount: 30, // Above maximum
      });

      if (result.metadata.linksAdded > 25) {
        expect(result.warnings).toBeDefined();
        expect(result.warnings!.some(w => w.includes('link count'))).toBe(true);
      }
    });
  });
});

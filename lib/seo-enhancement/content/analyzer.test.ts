/**
 * Unit tests for Content Analysis Utilities
 */

import { describe, it, expect } from 'vitest';
import { calculateCurrentWordCount, identifyContentGaps } from './analyzer';
import type { BlogPost } from '@/lib/blog';
import type { KeywordOpportunity } from '../gsc/types';

describe('calculateCurrentWordCount', () => {
  it('should count words in all paragraphs', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Section 1',
          paragraphs: ['This has five words here.']
        },
        {
          heading: 'Section 2',
          paragraphs: ['Another four words here.']
        }
      ]
    };

    const count = calculateCurrentWordCount(post);
    expect(count).toBe(9);
  });

  it('should exclude HTML tags from word count', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Section',
          paragraphs: ['Text with <a href="/link">link</a> here.']
        }
      ]
    };

    const count = calculateCurrentWordCount(post);
    expect(count).toBe(4); // "Text with link here" = 4 words
  });

  it('should handle multiple paragraphs per section', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Section',
          paragraphs: [
            'First paragraph has four words.',
            'Second paragraph also has four.',
            'Third paragraph has three words.'
          ]
        }
      ]
    };

    const count = calculateCurrentWordCount(post);
    expect(count).toBe(15);
  });

  it('should handle complex HTML with nested tags', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Section',
          paragraphs: [
            'Visit <a class="text-link" href="/download">download page</a> for more.'
          ]
        }
      ]
    };

    const count = calculateCurrentWordCount(post);
    expect(count).toBe(5); // "Visit download page for more"
  });

  it('should return 0 for post with no sections', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: []
    };

    const count = calculateCurrentWordCount(post);
    expect(count).toBe(0);
  });

  it('should handle empty paragraphs', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Section',
          paragraphs: ['', 'Five words in this paragraph.', '']
        }
      ]
    };

    const count = calculateCurrentWordCount(post);
    expect(count).toBe(5);
  });
});

describe('identifyContentGaps', () => {
  it('should identify missing topics from keyword opportunities', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Existing Topic',
          paragraphs: ['This section covers the existing topic in detail.']
        }
      ]
    };

    const keywords: KeywordOpportunity[] = [
      {
        keyword: 'existing topic',
        impressions: 100,
        clicks: 10,
        ctr: 10,
        position: 5,
        opportunityScore: 50,
        category: 'high-impression-low-ctr'
      },
      {
        keyword: 'missing topic',
        impressions: 200,
        clicks: 5,
        ctr: 2.5,
        position: 15,
        opportunityScore: 80,
        category: 'position-4-20'
      }
    ];

    const gaps = identifyContentGaps(post, keywords);
    
    expect(gaps).toContain('missing topic');
    expect(gaps).not.toContain('existing topic');
  });

  it('should sort gaps by opportunity score (highest first)', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Introduction',
          paragraphs: ['Basic introduction content.']
        }
      ]
    };

    const keywords: KeywordOpportunity[] = [
      {
        keyword: 'low priority gap',
        impressions: 50,
        clicks: 5,
        ctr: 10,
        position: 8,
        opportunityScore: 30,
        category: 'position-4-20'
      },
      {
        keyword: 'high priority gap',
        impressions: 300,
        clicks: 10,
        ctr: 3.3,
        position: 12,
        opportunityScore: 90,
        category: 'high-impression-low-ctr'
      },
      {
        keyword: 'medium priority gap',
        impressions: 150,
        clicks: 8,
        ctr: 5.3,
        position: 10,
        opportunityScore: 60,
        category: 'position-4-20'
      }
    ];

    const gaps = identifyContentGaps(post, keywords);
    
    expect(gaps).toEqual([
      'high priority gap',
      'medium priority gap',
      'low priority gap'
    ]);
  });

  it('should detect keyword coverage in section headings', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'How to Download GoPlay11 APK',
          paragraphs: ['Download instructions here.']
        }
      ]
    };

    const keywords: KeywordOpportunity[] = [
      {
        keyword: 'download goplay11 apk',
        impressions: 500,
        clicks: 50,
        ctr: 10,
        position: 3,
        opportunityScore: 70,
        category: 'high-impression-low-ctr'
      }
    ];

    const gaps = identifyContentGaps(post, keywords);
    
    expect(gaps).not.toContain('download goplay11 apk');
  });

  it('should detect keyword coverage in FAQ content', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Introduction',
          paragraphs: ['Basic content.']
        }
      ],
      faq: [
        {
          question: 'Is GoPlay11 safe to use?',
          answer: 'Yes, GoPlay11 is safe when downloaded from trusted sources.'
        }
      ]
    };

    const keywords: KeywordOpportunity[] = [
      {
        keyword: 'is goplay11 safe',
        impressions: 300,
        clicks: 30,
        ctr: 10,
        position: 5,
        opportunityScore: 60,
        category: 'high-impression-low-ctr'
      }
    ];

    const gaps = identifyContentGaps(post, keywords);
    
    expect(gaps).not.toContain('is goplay11 safe');
  });

  it('should use fuzzy matching for keyword variations', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Installation Guide',
          paragraphs: ['Learn how to install the application on your device.']
        }
      ]
    };

    const keywords: KeywordOpportunity[] = [
      {
        keyword: 'installation guide application',
        impressions: 200,
        clicks: 20,
        ctr: 10,
        position: 6,
        opportunityScore: 55,
        category: 'position-4-20'
      }
    ];

    const gaps = identifyContentGaps(post, keywords);
    
    // Should recognize that "installation", "guide", and "application" are all present
    expect(gaps).not.toContain('installation guide application');
  });

  it('should return empty array when all keywords are covered', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Complete Guide to GoPlay11',
      description: 'Everything about download, installation, and safety',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Download Instructions',
          paragraphs: ['How to download GoPlay11.']
        },
        {
          heading: 'Installation Steps',
          paragraphs: ['How to install the app.']
        },
        {
          heading: 'Safety Tips',
          paragraphs: ['How to stay safe while using GoPlay11.']
        }
      ]
    };

    const keywords: KeywordOpportunity[] = [
      {
        keyword: 'download goplay11',
        impressions: 100,
        clicks: 10,
        ctr: 10,
        position: 5,
        opportunityScore: 50,
        category: 'high-impression-low-ctr'
      },
      {
        keyword: 'installation steps',
        impressions: 80,
        clicks: 8,
        ctr: 10,
        position: 6,
        opportunityScore: 45,
        category: 'position-4-20'
      }
    ];

    const gaps = identifyContentGaps(post, keywords);
    
    expect(gaps).toEqual([]);
  });

  it('should handle empty keyword list', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Section',
          paragraphs: ['Content here.']
        }
      ]
    };

    const gaps = identifyContentGaps(post, []);
    
    expect(gaps).toEqual([]);
  });

  it('should ignore HTML tags when checking coverage', () => {
    const post: BlogPost = {
      slug: 'test-post',
      title: 'Test Post',
      description: 'Test description',
      excerpt: 'Test excerpt',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      keywords: [],
      sections: [
        {
          heading: 'Download Guide',
          paragraphs: [
            'Visit the <a class="text-link" href="/download">official download page</a> for instructions.'
          ]
        }
      ]
    };

    const keywords: KeywordOpportunity[] = [
      {
        keyword: 'official download page',
        impressions: 150,
        clicks: 15,
        ctr: 10,
        position: 7,
        opportunityScore: 55,
        category: 'position-4-20'
      }
    ];

    const gaps = identifyContentGaps(post, keywords);
    
    expect(gaps).not.toContain('official download page');
  });
});

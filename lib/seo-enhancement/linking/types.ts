/**
 * Internal Linking Types
 */

import type { BlogPost } from '@/lib/blog';

export interface SitePage {
  path: string;
  title: string;
  keywords: string[];
  description: string;
}

export interface LinkableContent {
  post: BlogPost;
  allPosts: BlogPost[];
  sitePages: SitePage[];
}

export interface LinkOpportunity {
  sourceText: string;
  targetUrl: string;
  anchorText: string;
  relevanceScore: number;
  sectionIndex: number;
  paragraphIndex: number;
}

export interface LinkedBlogPost extends BlogPost {
  linkingMetadata: {
    totalLinks: number;
    blogLinks: number;
    pageLinks: number;
    linkDistribution: Map<string, number>;
    averageLinksPerSection: number;
  };
}

export interface LinkInventory {
  blogPosts: Array<{
    slug: string;
    title: string;
    keywords: string[];
    topics: string[];
  }>;
  sitePages: Array<{
    path: string;
    title: string;
    keywords: string[];
    purpose: string;
  }>;
}

export interface InsertionPoint {
  sectionIndex: number;
  paragraphIndex: number;
  textToReplace: string;
  targetUrl: string;
  anchorText: string;
  relevanceScore: number;
}

export interface InternalLinkGraph {
  nodes: LinkNode[];
  edges: LinkEdge[];
}

export interface LinkNode {
  id: string;
  type: 'blog' | 'page';
  title: string;
  keywords: string[];
  inboundLinks: number;
  outboundLinks: number;
}

export interface LinkEdge {
  source: string;
  target: string;
  anchorText: string;
  relevanceScore: number;
  context: string;
}

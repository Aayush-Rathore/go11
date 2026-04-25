/**
 * Tests for Implementation Tracker
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// We mock the fs module so tests don't touch the real filesystem
vi.mock('fs');

const mockedFs = vi.mocked(fs);

// ---------------------------------------------------------------------------
// Helpers to set up in-memory "filesystem"
// ---------------------------------------------------------------------------

let inMemoryStore: string | null = null;

function setupFsMocks() {
  mockedFs.existsSync.mockImplementation(() => inMemoryStore !== null);
  mockedFs.mkdirSync.mockImplementation(() => undefined);
  mockedFs.readFileSync.mockImplementation(() => {
    if (inMemoryStore === null) throw new Error('File not found');
    return inMemoryStore;
  });
  mockedFs.writeFileSync.mockImplementation((_p, data) => {
    inMemoryStore = data as string;
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

import type { PostUpdateRecord } from './types';

function makeRecord(
  slug: string,
  status: PostUpdateRecord['status'] = 'pending',
): PostUpdateRecord {
  return {
    slug,
    updateDate: '2025-01-01T00:00:00.000Z',
    status,
    changes: {
      wordCountBefore: 800,
      wordCountAfter: 2600,
      linksAdded: 22,
      sectionsAdded: 3,
      faqItemsAdded: 5,
      keywordsIntegrated: ['goplay11', 'fantasy app'],
    },
    validationResults: {
      eeat: {
        passed: true,
        score: 80,
        checks: {
          hasAuthor: true,
          hasReviewer: true,
          hasCredentials: true,
          demonstratesExperience: true,
          hasDataSupport: true,
          addressesSafety: true,
          isCurrentlyDated: true,
        },
        issues: [],
        recommendations: [],
      },
      quality: {
        passed: true,
        score: 75,
        metrics: {
          fleschReadingEase: 65,
          avgParagraphLength: 100,
          activeVoicePercent: 85,
          hasExamples: true,
          hasActionableSteps: true,
          logicalFlow: true,
          technicalTermsExplained: true,
          userIntentAlignment: 80,
        },
        issues: [],
        recommendations: [],
      },
      keywords: {
        keywordDensity: new Map([['goplay11', 1.5]]),
        keywordPlacements: {
          inTitle: ['goplay11'],
          inFirstParagraph: ['goplay11'],
          inHeadings: ['goplay11'],
          inFAQ: ['goplay11'],
        },
        overOptimized: [],
        underOptimized: [],
        naturalnessScore: 85,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Implementation Tracker', () => {
  beforeEach(() => {
    inMemoryStore = null;
    setupFsMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 9.1 – data structures / storage
  describe('recordUpdate / getUpdateRecord', () => {
    it('stores a new record and retrieves it by slug', async () => {
      const { recordUpdate, getUpdateRecord } = await import('./tracker');
      const record = makeRecord('test-post');
      recordUpdate(record);
      const retrieved = getUpdateRecord('test-post');
      expect(retrieved).not.toBeNull();
      expect(retrieved!.slug).toBe('test-post');
    });

    it('returns null for an unknown slug', async () => {
      const { getUpdateRecord } = await import('./tracker');
      expect(getUpdateRecord('does-not-exist')).toBeNull();
    });

    it('overwrites an existing record when called again', async () => {
      const { recordUpdate, getUpdateRecord } = await import('./tracker');
      recordUpdate(makeRecord('post-a'));
      const updated = { ...makeRecord('post-a'), status: 'in-progress' as const };
      recordUpdate(updated);
      expect(getUpdateRecord('post-a')!.status).toBe('in-progress');
    });

    it('persists multiple records independently', async () => {
      const { recordUpdate, getUpdateRecord } = await import('./tracker');
      recordUpdate(makeRecord('post-1'));
      recordUpdate(makeRecord('post-2'));
      expect(getUpdateRecord('post-1')!.slug).toBe('post-1');
      expect(getUpdateRecord('post-2')!.slug).toBe('post-2');
    });
  });

  // 9.2 – status transitions
  describe('updateStatus', () => {
    it('transitions status from pending to in-progress', async () => {
      const { recordUpdate, updateStatus, getUpdateRecord } = await import('./tracker');
      recordUpdate(makeRecord('post-x', 'pending'));
      updateStatus('post-x', 'in-progress');
      expect(getUpdateRecord('post-x')!.status).toBe('in-progress');
    });

    it('transitions status from in-progress to completed', async () => {
      const { recordUpdate, updateStatus, getUpdateRecord } = await import('./tracker');
      recordUpdate(makeRecord('post-x', 'in-progress'));
      updateStatus('post-x', 'completed');
      expect(getUpdateRecord('post-x')!.status).toBe('completed');
    });

    it('transitions status to failed-validation', async () => {
      const { recordUpdate, updateStatus, getUpdateRecord } = await import('./tracker');
      recordUpdate(makeRecord('post-x', 'in-progress'));
      updateStatus('post-x', 'failed-validation');
      expect(getUpdateRecord('post-x')!.status).toBe('failed-validation');
    });

    it('throws when slug does not exist', async () => {
      const { updateStatus } = await import('./tracker');
      expect(() => updateStatus('ghost-post', 'completed')).toThrow();
    });
  });

  // 9.3 – reports
  describe('generateProgressReport', () => {
    it('returns zero counts when no records exist', async () => {
      const { generateProgressReport } = await import('./tracker');
      const report = generateProgressReport();
      expect(report.totalPosts).toBe(0);
      expect(report.completedPosts).toBe(0);
      expect(report.failedPosts).toBe(0);
    });

    it('counts posts by status correctly', async () => {
      const { recordUpdate, generateProgressReport } = await import('./tracker');
      recordUpdate(makeRecord('p1', 'completed'));
      recordUpdate(makeRecord('p2', 'completed'));
      recordUpdate(makeRecord('p3', 'in-progress'));
      recordUpdate(makeRecord('p4', 'failed-validation'));
      recordUpdate(makeRecord('p5', 'pending'));

      const report = generateProgressReport();
      expect(report.totalPosts).toBe(5);
      expect(report.completedPosts).toBe(2);
      expect(report.inProgressPosts).toBe(1);
      expect(report.failedPosts).toBe(1);
    });

    it('calculates aggregate metrics from completed posts', async () => {
      const { recordUpdate, generateProgressReport } = await import('./tracker');
      recordUpdate(makeRecord('p1', 'completed')); // wordCountIncrease = 1800, linksAdded = 22, eeat = 80, quality = 75
      recordUpdate(makeRecord('p2', 'completed'));

      const report = generateProgressReport();
      expect(report.aggregateMetrics.avgWordCountIncrease).toBe(1800);
      expect(report.aggregateMetrics.avgLinksAdded).toBe(22);
      expect(report.aggregateMetrics.avgEEATScore).toBe(80);
      expect(report.aggregateMetrics.avgQualityScore).toBe(75);
    });
  });

  describe('generateCompletionReport', () => {
    it('returns the same shape as generateProgressReport', async () => {
      const { recordUpdate, generateProgressReport, generateCompletionReport } =
        await import('./tracker');
      recordUpdate(makeRecord('p1', 'completed'));

      const progress = generateProgressReport();
      const completion = generateCompletionReport();
      expect(completion.totalPosts).toBe(progress.totalPosts);
      expect(completion.completedPosts).toBe(progress.completedPosts);
    });
  });

  describe('identifyFailedPosts', () => {
    it('returns only failed-validation records', async () => {
      const { recordUpdate, identifyFailedPosts } = await import('./tracker');
      recordUpdate(makeRecord('ok', 'completed'));
      recordUpdate(makeRecord('bad1', 'failed-validation'));
      recordUpdate(makeRecord('bad2', 'failed-validation'));

      const failed = identifyFailedPosts();
      expect(failed).toHaveLength(2);
      expect(failed.every((r) => r.status === 'failed-validation')).toBe(true);
    });

    it('returns empty array when no posts have failed', async () => {
      const { recordUpdate, identifyFailedPosts } = await import('./tracker');
      recordUpdate(makeRecord('ok', 'completed'));
      expect(identifyFailedPosts()).toHaveLength(0);
    });
  });

  describe('exportMetrics', () => {
    it('exports valid JSON', async () => {
      const { recordUpdate, exportMetrics } = await import('./tracker');
      recordUpdate(makeRecord('p1', 'completed'));

      const json = exportMetrics('json');
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].slug).toBe('p1');
    });

    it('exports CSV with header row', async () => {
      const { recordUpdate, exportMetrics } = await import('./tracker');
      recordUpdate(makeRecord('p1', 'completed'));

      const csv = exportMetrics('csv');
      const lines = csv.split('\n');
      expect(lines[0]).toContain('slug');
      expect(lines[0]).toContain('status');
      expect(lines[1]).toContain('p1');
    });
  });
});

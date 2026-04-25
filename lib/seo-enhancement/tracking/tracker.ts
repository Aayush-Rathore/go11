/**
 * Implementation Tracker
 *
 * Manages rollout process, tracks completion status, records metrics,
 * and generates progress/completion reports for the SEO enhancement pipeline.
 *
 * Records are persisted to a JSON file in lib/seo-enhancement/tracking/data/
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PostUpdateRecord, ImplementationReport } from './types';

const DATA_DIR = path.join(__dirname, 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'tracking-records.json');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRecords(): Map<string, PostUpdateRecord> {
  ensureDataDir();
  if (!fs.existsSync(RECORDS_FILE)) {
    return new Map();
  }
  try {
    const raw = fs.readFileSync(RECORDS_FILE, 'utf-8');
    const entries: [string, PostUpdateRecord][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

function saveRecords(records: Map<string, PostUpdateRecord>): void {
  ensureDataDir();
  const entries = Array.from(records.entries());
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Core tracking functions
// ---------------------------------------------------------------------------

/**
 * Record or overwrite a PostUpdateRecord for a given slug.
 * Requirements: 7.1, 7.2, 7.3
 */
export function recordUpdate(record: PostUpdateRecord): void {
  const records = loadRecords();
  records.set(record.slug, { ...record });
  saveRecords(records);
}

/**
 * Retrieve the update record for a slug, or null if not found.
 * Requirements: 7.3, 7.5
 */
export function getUpdateRecord(slug: string): PostUpdateRecord | null {
  const records = loadRecords();
  return records.get(slug) ?? null;
}

/**
 * Transition the status of a tracked post.
 * Valid transitions: pending → in-progress → completed | failed-validation
 * Requirements: 7.3, 7.5
 */
export function updateStatus(
  slug: string,
  status: PostUpdateRecord['status'],
): void {
  const records = loadRecords();
  const record = records.get(slug);
  if (!record) {
    throw new Error(`No tracking record found for slug: "${slug}"`);
  }
  record.status = status;
  record.updateDate = now();
  records.set(slug, record);
  saveRecords(records);
}

// ---------------------------------------------------------------------------
// Reporting helpers
// ---------------------------------------------------------------------------

function buildReport(
  records: PostUpdateRecord[],
  startDate: string,
): ImplementationReport {
  const completed = records.filter((r) => r.status === 'completed');
  const inProgress = records.filter((r) => r.status === 'in-progress');
  const failed = records.filter((r) => r.status === 'failed-validation');

  const avgWordCountIncrease =
    completed.length > 0
      ? completed.reduce(
          (sum, r) =>
            sum + (r.changes.wordCountAfter - r.changes.wordCountBefore),
          0,
        ) / completed.length
      : 0;

  const avgLinksAdded =
    completed.length > 0
      ? completed.reduce((sum, r) => sum + r.changes.linksAdded, 0) /
        completed.length
      : 0;

  const avgEEATScore =
    completed.length > 0
      ? completed.reduce((sum, r) => sum + r.validationResults.eeat.score, 0) /
        completed.length
      : 0;

  const avgQualityScore =
    completed.length > 0
      ? completed.reduce(
          (sum, r) => sum + r.validationResults.quality.score,
          0,
        ) / completed.length
      : 0;

  const lastUpdateDate =
    records.length > 0
      ? records.reduce((latest, r) =>
          r.updateDate > latest.updateDate ? r : latest,
        ).updateDate
      : now();

  // Rough estimate: if we know the rate, project completion; otherwise use a
  // fixed 7-day-per-post estimate for remaining posts.
  const remaining = records.length - completed.length;
  const estimatedCompletion =
    remaining === 0
      ? lastUpdateDate
      : new Date(
          Date.now() + remaining * 7 * 24 * 60 * 60 * 1000,
        ).toISOString();

  return {
    totalPosts: records.length,
    completedPosts: completed.length,
    inProgressPosts: inProgress.length,
    failedPosts: failed.length,
    aggregateMetrics: {
      avgWordCountIncrease,
      avgLinksAdded,
      avgEEATScore,
      avgQualityScore,
    },
    timeline: {
      startDate,
      lastUpdateDate,
      estimatedCompletion,
    },
  };
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

/**
 * Generate a progress report showing current state across all tracked posts.
 * Requirements: 7.4, 7.6
 */
export function generateProgressReport(): ImplementationReport {
  const records = Array.from(loadRecords().values());
  const startDate =
    records.length > 0
      ? records.reduce((earliest, r) =>
          r.updateDate < earliest.updateDate ? r : earliest,
        ).updateDate
      : now();
  return buildReport(records, startDate);
}

/**
 * Generate a completion report (same shape as progress report, intended for
 * final summary after all posts have been processed).
 * Requirements: 7.7
 */
export function generateCompletionReport(): ImplementationReport {
  return generateProgressReport();
}

/**
 * Return all records that have status 'failed-validation'.
 * These posts require manual review and correction.
 * Requirements: 7.4, 7.6, 7.7
 */
export function identifyFailedPosts(): PostUpdateRecord[] {
  const records = loadRecords();
  return Array.from(records.values()).filter(
    (r) => r.status === 'failed-validation',
  );
}

// ---------------------------------------------------------------------------
// Export / metrics
// ---------------------------------------------------------------------------

/**
 * Export all tracking records as JSON or CSV.
 * Requirements: 7.7
 */
export function exportMetrics(format: 'json' | 'csv'): string {
  const records = Array.from(loadRecords().values());

  if (format === 'json') {
    return JSON.stringify(records, null, 2);
  }

  // CSV export
  const headers = [
    'slug',
    'updateDate',
    'status',
    'wordCountBefore',
    'wordCountAfter',
    'linksAdded',
    'sectionsAdded',
    'faqItemsAdded',
    'keywordsIntegrated',
    'eeAtScore',
    'qualityScore',
  ];

  const rows = records.map((r) =>
    [
      r.slug,
      r.updateDate,
      r.status,
      r.changes.wordCountBefore,
      r.changes.wordCountAfter,
      r.changes.linksAdded,
      r.changes.sectionsAdded,
      r.changes.faqItemsAdded,
      `"${r.changes.keywordsIntegrated.join(';')}"`,
      r.validationResults.eeat.score,
      r.validationResults.quality.score,
    ].join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Utility Types
 */

export interface ErrorReport {
  timestamp: string;
  component: string;
  operation: string;
  errorType: string;
  message: string;
  context: Record<string, any>;
  stackTrace?: string;
  recoveryAction?: string;
}

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

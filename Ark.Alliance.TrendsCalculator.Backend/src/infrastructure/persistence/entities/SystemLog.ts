/**
 * SystemLog Entity
 * 
 * Represents a system-level log entry from the system_logs table.
 */

export type SystemLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SystemLog {
    id: number;
    userId?: number;
    level: SystemLogLevel;
    message: string;
    details?: string;
    stackTrace?: string;
    createdAt: Date;
    source?: string;  // Derived from details or context
}

export interface SystemLogRow {
    id: number;
    user_id?: number;
    level: string;
    message: string;
    details?: string;
    stack_trace?: string;
    created_at: string;
}

/**
 * Convert database row to entity
 */
export function systemLogFromRow(row: SystemLogRow): SystemLog {
    // Try to extract source from details if it's JSON
    let source = 'System';
    if (row.details) {
        try {
            const parsed = JSON.parse(row.details);
            source = parsed.source || parsed.service || parsed.module || 'System';
        } catch {
            // Not JSON, use default
        }
    }

    return {
        id: row.id,
        userId: row.user_id,
        level: row.level.toLowerCase() as SystemLogLevel,
        message: row.message,
        details: row.details,
        stackTrace: row.stack_trace,
        createdAt: new Date(row.created_at),
        source
    };
}

/**
 * Create insert params for a new log
 */
export function createSystemLogParams(
    level: SystemLogLevel,
    message: string,
    options?: {
        userId?: number;
        details?: string | object;
        stackTrace?: string;
        source?: string;
    }
): Partial<SystemLogRow> {
    let detailsStr = options?.details
        ? (typeof options.details === 'string' ? options.details : JSON.stringify(options.details))
        : undefined;

    // Include source in details if provided
    if (options?.source && detailsStr) {
        try {
            const parsed = JSON.parse(detailsStr);
            parsed.source = options.source;
            detailsStr = JSON.stringify(parsed);
        } catch {
            detailsStr = JSON.stringify({ source: options.source, data: detailsStr });
        }
    } else if (options?.source) {
        detailsStr = JSON.stringify({ source: options.source });
    }

    return {
        user_id: options?.userId,
        level,
        message,
        details: detailsStr,
        stack_trace: options?.stackTrace
    };
}

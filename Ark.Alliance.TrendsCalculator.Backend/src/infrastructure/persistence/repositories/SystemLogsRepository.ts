/**
 * SystemLogsRepository
 * 
 * Repository for reading and writing system-level logs.
 * Non-blocking: all write operations are async and won't block the main thread.
 * Thread-safe: uses queueing to prevent concurrent DB access issues.
 */

import { DatabaseService } from '../DatabaseService';
import { SystemLog, SystemLogRow, systemLogFromRow, SystemLogLevel } from '../entities/SystemLog';

export interface LogQueryOptions {
    limit?: number;
    offset?: number;
    level?: SystemLogLevel | SystemLogLevel[];
    search?: string;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
}

export class SystemLogsRepository {
    private static instance: SystemLogsRepository | null = null;
    private logQueue: Array<{
        level: SystemLogLevel;
        message: string;
        options?: { userId?: number; details?: string | object; stackTrace?: string; source?: string };
    }> = [];
    private isProcessing = false;

    private constructor() { }

    static getInstance(): SystemLogsRepository {
        if (!SystemLogsRepository.instance) {
            SystemLogsRepository.instance = new SystemLogsRepository();
        }
        return SystemLogsRepository.instance;
    }

    /**
     * Check if database is ready
     */
    private isDbReady(): boolean {
        try {
            const db = DatabaseService.getInstance();
            return db.isInitialized?.() ?? false;
        } catch {
            return false;
        }
    }

    /**
     * Get database instance safely
     */
    private getDb(): DatabaseService | null {
        if (!this.isDbReady()) {
            return null;
        }
        return DatabaseService.getInstance();
    }

    /**
     * Get logs with optional filtering
     * Returns empty array if DB not ready
     */
    getLogs(options: LogQueryOptions = {}): SystemLog[] {
        const db = this.getDb();
        if (!db) return [];

        const {
            limit = 100,
            offset = 0,
            level,
            search,
            userId,
            startDate,
            endDate
        } = options;

        let sql = 'SELECT * FROM system_logs WHERE 1=1';
        const params: any[] = [];

        if (level) {
            if (Array.isArray(level)) {
                const placeholders = level.map(() => '?').join(',');
                sql += ` AND LOWER(level) IN (${placeholders})`;
                params.push(...level.map(l => l.toLowerCase()));
            } else {
                sql += ' AND LOWER(level) = ?';
                params.push(level.toLowerCase());
            }
        }

        if (search) {
            sql += ' AND (message LIKE ? OR details LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (userId !== undefined) {
            sql += ' AND user_id = ?';
            params.push(userId);
        }

        if (startDate) {
            sql += ' AND created_at >= ?';
            params.push(startDate.toISOString());
        }
        if (endDate) {
            sql += ' AND created_at <= ?';
            params.push(endDate.toISOString());
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        try {
            const rows = db.all<SystemLogRow>(sql, params);
            return rows.map(systemLogFromRow);
        } catch (error) {
            // Silent fail - don't log DB errors to console to avoid loops
            return [];
        }
    }

    /**
     * Get log by ID
     */
    getById(id: number): SystemLog | null {
        const db = this.getDb();
        if (!db) return null;

        try {
            const row = db.get<SystemLogRow>('SELECT * FROM system_logs WHERE id = ?', [id]);
            return row ? systemLogFromRow(row) : null;
        } catch {
            return null;
        }
    }

    /**
     * Get total count of logs
     */
    getCount(options: Omit<LogQueryOptions, 'limit' | 'offset'> = {}): number {
        const db = this.getDb();
        if (!db) return 0;

        const { level, search, userId, startDate, endDate } = options;

        let sql = 'SELECT COUNT(*) as count FROM system_logs WHERE 1=1';
        const params: any[] = [];

        if (level) {
            if (Array.isArray(level)) {
                const placeholders = level.map(() => '?').join(',');
                sql += ` AND LOWER(level) IN (${placeholders})`;
                params.push(...level.map(l => l.toLowerCase()));
            } else {
                sql += ' AND LOWER(level) = ?';
                params.push(level.toLowerCase());
            }
        }
        if (search) {
            sql += ' AND (message LIKE ? OR details LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }
        if (userId !== undefined) {
            sql += ' AND user_id = ?';
            params.push(userId);
        }
        if (startDate) {
            sql += ' AND created_at >= ?';
            params.push(startDate.toISOString());
        }
        if (endDate) {
            sql += ' AND created_at <= ?';
            params.push(endDate.toISOString());
        }

        try {
            const result = db.get<{ count: number }>(sql, params);
            return result?.count || 0;
        } catch {
            return 0;
        }
    }

    /**
     * Add a log entry - NON-BLOCKING
     * Queues the log for async processing to avoid blocking main thread
     */
    addLog(level: SystemLogLevel, message: string, options?: {
        userId?: number;
        details?: string | object;
        stackTrace?: string;
        source?: string;
    }): void {
        // Queue the log entry
        this.logQueue.push({ level, message, options });

        // Process queue asynchronously
        this.processQueue();
    }

    /**
     * Safe JSON stringify helper
     */
    private safeStringify(obj: any): string {
        const cache = new Set();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return '[Circular]';
                }
                // Store value in our collection
                cache.add(value);
            }
            return value;
        });
    }

    /**
     * Process log queue without blocking main thread
     * Uses chunking and setImmediate to yield to event loop
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.logQueue.length === 0) return;

        const db = this.getDb();
        if (!db) {
            // DB not ready, will retry on next call
            return;
        }

        this.isProcessing = true;
        const CHUNK_SIZE = 50; // Process 50 logs per tick

        try {
            while (this.logQueue.length > 0) {
                // Yield to event loop if we've been running for a while
                // This ensures express can serve other requests
                await new Promise(resolve => setImmediate(resolve));

                // Take a chunk of logs
                const chunk = this.logQueue.splice(0, CHUNK_SIZE);

                // Process chunk
                for (const log of chunk) {
                    let detailsStr: string | undefined;

                    try {
                        if (log.options?.details) {
                            detailsStr = typeof log.options.details === 'string'
                                ? log.options.details
                                : this.safeStringify(log.options.details);
                        }

                        // Merge source into details if exists
                        if (log.options?.source) {
                            let parsed: any = {};
                            try {
                                parsed = detailsStr ? JSON.parse(detailsStr) : {};
                            } catch {
                                parsed = { raw: detailsStr };
                            }
                            parsed.source = log.options.source;
                            detailsStr = this.safeStringify(parsed);
                        }
                    } catch (stringifyError) {
                        detailsStr = JSON.stringify({ error: 'Failed to serialize log details' });
                    }

                    try {
                        db.run(`
                            INSERT INTO system_logs (user_id, level, message, details, stack_trace, created_at)
                            VALUES (?, ?, ?, ?, ?, datetime('now'))
                        `, [
                            log.options?.userId || null,
                            log.level,
                            log.message,
                            detailsStr || null,
                            log.options?.stackTrace || null
                        ]);
                    } catch (dbError) {
                        // Silently ignore individual log failures to keep system stable
                    }
                }
            }

            // Save once after all logs are processed (or chunk processed)
            // Note: DatabaseService.forceSave is now async/non-blocking
            db.save();
        } catch (error) {
            console.error('SystemLogsRepository queue error:', error);
        } finally {
            // Only clear flag if queue is empty, otherwise we might have yielded
            if (this.logQueue.length === 0) {
                this.isProcessing = false;
            } else {
                // If logs remain (rare race condition or error), reschedule
                this.isProcessing = false;
                // Don't recursive call directly to avoid stack overflow, use nextTick
                process.nextTick(() => this.processQueue());
            }
        }
    }

    /**
     * Delete old logs
     */
    deleteOldLogs(days: number): number {
        const db = this.getDb();
        if (!db) return 0;

        try {
            db.run(`
                DELETE FROM system_logs 
                WHERE created_at < datetime('now', '-' || ? || ' days')
            `, [days]);
            db.save();
            return 0;
        } catch {
            return 0;
        }
    }

    /**
     * Get log level statistics
     */
    getStats(): { level: string; count: number }[] {
        const db = this.getDb();
        if (!db) return [];

        try {
            return db.all<{ level: string; count: number }>(`
                SELECT LOWER(level) as level, COUNT(*) as count 
                FROM system_logs 
                GROUP BY LOWER(level)
            `, []);
        } catch {
            return [];
        }
    }
}

export default SystemLogsRepository;

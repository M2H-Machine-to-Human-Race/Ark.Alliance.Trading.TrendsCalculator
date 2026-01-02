/**
 * Schema Manager
 * 
 * @fileoverview Handles database schema initialization and migrations
 * @module infrastructure/persistence/SchemaManager
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { Database } from 'better-sqlite3';
import { systemLogger } from '../SystemLogger';

/**
 * Manages database schema initialization and migrations
 */
export class SchemaManager {
    private db: Database;
    private schemaPath: string;

    constructor(database: Database) {
        this.db = database;
        this.schemaPath = join(__dirname, 'schema');
    }

    /**
     * Initialize database schema
     * Runs all SQL migration scripts in order
     */
    async initialize(): Promise<void> {
        try {
            systemLogger.info('Starting database schema initialization', {
                source: 'SchemaManager'
            });

            // Create migrations tracking table
            this.createMigrationsTable();

            // Get all SQL files in order
            const sqlFiles = this.getSQLFiles();

            let executed = 0;
            let skipped = 0;

            for (const file of sqlFiles) {
                const migrationName = file.replace('.sql', '');

                // Check if already executed
                if (this.isMigrationExecuted(migrationName)) {
                    skipped++;
                    continue;
                }

                // Execute migration
                await this.executeMigration(file, migrationName);
                executed++;
            }

            systemLogger.info('Database schema initialization complete', {
                source: 'SchemaManager',
                details: {
                    executed,
                    skipped,
                    total: sqlFiles.length
                }
            });

        } catch (error: any) {
            systemLogger.error('Database schema initialization failed', {
                source: 'SchemaManager',
                error
            });
            throw error;
        }
    }

    /**
     * Create migrations tracking table
     * @private
     */
    private createMigrationsTable(): void {
        const sql = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migration_name TEXT NOT NULL UNIQUE,
                executed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
                success INTEGER NOT NULL DEFAULT 1,
                error_message TEXT
            );
        `;

        this.db.exec(sql);
    }

    /**
     * Get all SQL files in order
     * @private
     */
    private getSQLFiles(): string[] {
        try {
            const files = readdirSync(this.schemaPath)
                .filter(f => f.endsWith('.sql'))
                .sort(); // Alphabetical order (01_, 02_, etc.)

            systemLogger.info(`Found ${files.length} schema files`, {
                source: 'SchemaManager',
                details: { files }
            });

            return files;
        } catch (error: any) {
            systemLogger.error('Failed to read schema directory', {
                source: 'SchemaManager',
                error
            });
            throw error;
        }
    }

    /**
     * Check if migration was already executed
     * @private
     */
    private isMigrationExecuted(migrationName: string): boolean {
        const stmt = this.db.prepare(
            'SELECT COUNT(*) as count FROM schema_migrations WHERE migration_name = ?'
        );
        const result = stmt.get(migrationName) as { count: number };
        return result.count > 0;
    }

    /**
     * Execute a migration file
     * @private
     */
    private async executeMigration(filename: string, migrationName: string): Promise<void> {
        const filePath = join(this.schemaPath, filename);

        try {
            systemLogger.info(`Executing migration: ${filename}`, {
                source: 'SchemaManager'
            });

            // Read SQL file
            const sql = readFileSync(filePath, 'utf-8');

            // Execute in a transaction
            const transaction = this.db.transaction(() => {
                // Execute the SQL
                this.db.exec(sql);

                // Record migration
                const stmt = this.db.prepare(
                    'INSERT INTO schema_migrations (migration_name, success) VALUES (?, ?)'
                );
                stmt.run(migrationName, 1);
            });

            transaction();

            systemLogger.info(`Migration executed successfully: ${filename}`, {
                source: 'SchemaManager'
            });

        } catch (error: any) {
            // Record failed migration
            try {
                const stmt = this.db.prepare(
                    'INSERT INTO schema_migrations (migration_name, success, error_message) VALUES (?, ?, ?)'
                );
                stmt.run(migrationName, 0, error.message);
            } catch (recordError) {
                systemLogger.error('Failed to record migration failure', {
                    source: 'SchemaManager',
                    error: recordError as Error
                });
            }

            systemLogger.error(`Migration failed: ${filename}`, {
                source: 'SchemaManager',
                error
            });

            throw error;
        }
    }

    /**
     * Get migration history
     */
    getMigrationHistory(): Array<{
        id: number;
        migration_name: string;
        executed_at: number;
        success: number;
        error_message: string | null;
    }> {
        const stmt = this.db.prepare(
            'SELECT * FROM schema_migrations ORDER BY id ASC'
        );
        return stmt.all() as any[];
    }

    /**
     * Vacuum database (reclaim space)
     */
    vacuum(): void {
        systemLogger.info('Vacuuming database', {
            source: 'SchemaManager'
        });
        this.db.exec('VACUUM');
    }

    /**
     * Analyze database (update statistics)
     */
    analyze(): void {
        systemLogger.info('Analyzing database', {
            source: 'SchemaManager'
        });
        this.db.exec('ANALYZE');
    }
}

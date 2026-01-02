/**
 * @fileoverview Database Service - sql.js async SQLite connection manager
 * @module Data/DatabaseService
 * 
 * ARCHITECTURE NOTES:
 * - Uses sql.js (WebAssembly SQLite)
 * - Singleton pattern for single DB connection
 * - Async API for all operations
 * - Transaction support with automatic rollback on error
 * - Migration tracking to prevent re-running
 */

import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - sql.js types are in src/types/sql.js.d.ts
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

export class DatabaseService {
    private static instance: DatabaseService | null = null;
    private db: SqlJsDatabase | null = null;
    private readonly dbPath: string;
    private initialized: boolean = false;
    private SQL: any = null;

    private constructor(dbPath: string = './data/position-service.db') {
        this.dbPath = dbPath;
    }

    /**
     * Get singleton instance
     */
    static getInstance(dbPath?: string): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService(dbPath);
        }
        return DatabaseService.instance;
    }

    /**
     * Initialize database
     */
    async initialize(): Promise<void> {
        // Ensure data directory exists
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Initialize sql.js
        this.SQL = await initSqlJs();

        // Load existing database or create new one
        if (fs.existsSync(this.dbPath)) {
            const fileBuffer = fs.readFileSync(this.dbPath);
            this.db = new this.SQL.Database(fileBuffer);
        } else {
            this.db = new this.SQL.Database();
        }

        // Enable foreign keys
        this.db!.run('PRAGMA foreign_keys = ON');

        // Run migrations
        await this.runMigrations();

        this.initialized = true;
        console.log(`✅ Database initialized: ${this.dbPath}`);
    }

    /**
     * Check if database is initialized
     */
    isInitialized(): boolean {
        return this.initialized && this.db !== null;
    }

    /**
     * Run all SQL migrations in order
     */
    private async runMigrations(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Create migrations tracking table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE NOT NULL,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get all SQL files from schema/tables directory
        const tablesDir = path.join(__dirname, 'schema', 'tables');

        if (!fs.existsSync(tablesDir)) {
            console.warn(`⚠️ Migrations directory not found: ${tablesDir}`);
            return;
        }

        const sqlFiles = fs.readdirSync(tablesDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        // Check which migrations have been run
        const executedResult = this.db.exec('SELECT filename FROM migrations');
        const executedMigrations = executedResult.length > 0
            ? executedResult[0].values.map((row: any[]) => row[0])
            : [];

        // Run pending migrations
        for (const filename of sqlFiles) {
            if (executedMigrations.includes(filename)) {
                console.log(`⏭️  Skipping migration (already executed): ${filename}`);
                continue;
            }

            const filePath = path.join(tablesDir, filename);
            const sql = fs.readFileSync(filePath, 'utf-8');

            console.log(`🔄 Running migration: ${filename}`);

            try {
                this.db.run('BEGIN');
                this.db.run(sql);
                this.db.run('INSERT INTO migrations (filename) VALUES (?)', [filename]);
                this.db.run('COMMIT');
                console.log(`✅ Migration completed: ${filename}`);
            } catch (error: any) {
                this.db.run('ROLLBACK');
                throw new Error(`Migration failed (${filename}): ${error.message}`);
            }
        }

        // Save to disk
        this.save();
    }

    /**
     * Get database connection (for backward compatibility)
     */
    getConnection(): SqlJsDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Run SQL query (auto-saves to disk)
     */
    run(sql: string, params: any[] = []): void {
        if (!this.db) throw new Error('Database not initialized');
        this.db.run(sql, params);
        // Auto-save to disk for persistence
        this.save();
    }

    /**
     * Execute query and get all results
     */
    exec(sql: string): any[] {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.exec(sql);
    }

    /**
     * Prepare and run statement, returning results as objects
     */
    all<T = any>(sql: string, params: any[] = []): T[] {
        if (!this.db) throw new Error('Database not initialized');

        const stmt = this.db.prepare(sql);
        stmt.bind(params);

        const results: T[] = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row as T);
        }
        stmt.free();

        return results;
    }

    /**
     * Get single row
     */
    get<T = any>(sql: string, params: any[] = []): T | undefined {
        const results = this.all<T>(sql, params);
        return results.length > 0 ? results[0] : undefined;
    }

    /**
     * Execute with transaction support
     */
    transaction<T>(callback: () => T): T {
        if (!this.db) throw new Error('Database not initialized');

        this.db.run('BEGIN');
        try {
            const result = callback();
            this.db.run('COMMIT');
            return result;
        } catch (error) {
            this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Get last insert row ID
     */
    lastInsertRowId(): number {
        if (!this.db) throw new Error('Database not initialized');
        const result = this.db.exec('SELECT last_insert_rowid() as id');
        return result.length > 0 ? result[0].values[0][0] as number : 0;
    }

    private saveTimeout: NodeJS.Timeout | null = null;
    private readonly SAVE_DELAY = 2000; // 2 seconds debounce

    // ... existing code ...

    /**
     * Schedule a save to disk (debounced)
     */
    save(): void {
        if (!this.db) return;

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(() => {
            this.forceSave();
        }, this.SAVE_DELAY);
    }

    /**
     * Force immediate save to disk (Async)
     * NON-BLOCKING: Uses fs.promises to avoid freezing event loop
     */
    async forceSave(): Promise<void> {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }

        if (!this.db) return;

        try {
            // export() is still sync (sql.js limitation) but fast for small DBs
            // TODO: Move to better-sqlite3 for incremental WAL updates in future
            const data = this.db.export();
            const buffer = Buffer.from(data);

            // Write to temp file first then rename to ensure atomic write
            const tempPath = `${this.dbPath}.tmp`;
            await fs.promises.writeFile(tempPath, buffer);
            await fs.promises.rename(tempPath, this.dbPath);

        } catch (error) {
            console.error('Failed to save database:', error);
        }
    }

    /**
     * Close database connection
     */
    async close(): Promise<void> {
        if (this.db) {
            await this.forceSave();
            this.db.close();
            this.db = null;
            this.initialized = false;
            console.log('✅ Database connection closed');
        }
    }

    /**
     * Backup database
     */
    async backup(backupPath: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(backupPath, buffer);
        console.log(`✅ Database backed up to: ${backupPath}`);
    }

    /**
     * Compact database (VACUUM)
     */
    async vacuum(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log('🧹 Starting database vacuum...');
        this.db.run('VACUUM');
        await this.forceSave();
        console.log('✅ Database vacuum completed');
    }

    /**
     * Get database statistics
     */
    getStats(): any {
        if (!this.db) throw new Error('Database not initialized');

        const stats = fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath) : null;

        // Get journal mode
        let journalMode = 'unknown';
        try {
            const result = this.db.exec('PRAGMA journal_mode');
            if (result.length > 0 && result[0].values.length > 0) {
                journalMode = result[0].values[0][0] as string;
            }
        } catch (e) {
            console.warn('Failed to get journal mode', e);
        }

        return {
            type: 'SQLite (sql.js)',
            path: path.resolve(this.dbPath),
            sizeBytes: stats?.size || 0,
            sizeMB: stats ? parseFloat((stats.size / (1024 * 1024)).toFixed(2)) : 0,
            initialized: this.initialized,
            journalMode: journalMode
        };
    }

    /**
     * Get list of all tables with row counts
     */
    getTableList(): Array<{ name: string; rowCount: number }> {
        if (!this.db) throw new Error('Database not initialized');

        const tablesResult = this.db.exec(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);

        if (tablesResult.length === 0) return [];

        const tables: Array<{ name: string; rowCount: number }> = [];

        for (const row of tablesResult[0].values) {
            const tableName = row[0] as string;
            try {
                const countResult = this.db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
                const rowCount = countResult.length > 0 ? (countResult[0].values[0][0] as number) : 0;
                tables.push({ name: tableName, rowCount });
            } catch {
                tables.push({ name: tableName, rowCount: 0 });
            }
        }

        return tables;
    }

    /**
     * Get table schema (columns, types, constraints)
     */
    getTableSchema(tableName: string): Array<{
        cid: number;
        name: string;
        type: string;
        notNull: boolean;
        defaultValue: string | null;
        primaryKey: boolean;
    }> {
        if (!this.db) throw new Error('Database not initialized');

        // Validate table name to prevent SQL injection
        const validName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
        if (!validName) throw new Error('Invalid table name');

        const result = this.db.exec(`PRAGMA table_info("${tableName}")`);
        if (result.length === 0) return [];

        return result[0].values.map((row: any[]) => ({
            cid: row[0] as number,
            name: row[1] as string,
            type: row[2] as string,
            notNull: row[3] === 1,
            defaultValue: row[4] as string | null,
            primaryKey: row[5] === 1
        }));
    }

    /**
     * Get table indexes
     */
    getTableIndexes(tableName: string): Array<{
        name: string;
        unique: boolean;
        columns: string;
    }> {
        if (!this.db) throw new Error('Database not initialized');

        const validName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
        if (!validName) throw new Error('Invalid table name');

        const result = this.db.exec(`PRAGMA index_list("${tableName}")`);
        if (result.length === 0) return [];

        const indexes: Array<{ name: string; unique: boolean; columns: string }> = [];

        for (const row of result[0].values) {
            const indexName = row[1] as string;
            const unique = row[2] === 1;

            // Get columns in index
            const colResult = this.db.exec(`PRAGMA index_info("${indexName}")`);
            const columns = colResult.length > 0
                ? colResult[0].values.map((c: any[]) => c[2] as string).join(', ')
                : '';

            indexes.push({ name: indexName, unique, columns });
        }

        return indexes;
    }

    /**
     * Get paged table data
     */
    getTableData(tableName: string, page: number = 1, pageSize: number = 20): {
        rows: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    } {
        if (!this.db) throw new Error('Database not initialized');

        const validName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
        if (!validName) throw new Error('Invalid table name');

        // Get total count
        const countResult = this.db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
        const total = countResult.length > 0 ? (countResult[0].values[0][0] as number) : 0;

        // Get paged data
        const offset = (page - 1) * pageSize;
        const dataResult = this.db.exec(`SELECT * FROM "${tableName}" LIMIT ${pageSize} OFFSET ${offset}`);

        if (dataResult.length === 0) {
            return { rows: [], total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        }

        const columns = dataResult[0].columns;
        const rows = dataResult[0].values.map((row: any[]) => {
            const obj: any = {};
            columns.forEach((col: string, i: number) => {
                obj[col] = row[i];
            });
            return obj;
        });

        return {
            rows,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }

    /**
     * Truncate table (delete all rows)
     * Protected tables cannot be truncated
     */
    truncateTable(tableName: string): { success: boolean; message: string } {
        if (!this.db) throw new Error('Database not initialized');

        const validName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
        if (!validName) throw new Error('Invalid table name');

        // Protected tables
        const protectedTables = ['users', 'service_instances', 'migrations'];
        if (protectedTables.includes(tableName.toLowerCase())) {
            return { success: false, message: `Table '${tableName}' is protected and cannot be truncated` };
        }

        try {
            this.db.run(`DELETE FROM "${tableName}"`);
            this.save();
            return { success: true, message: `Table '${tableName}' truncated successfully` };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

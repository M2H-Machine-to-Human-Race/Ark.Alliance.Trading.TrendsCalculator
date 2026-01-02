/**
 * @fileoverview Base Repository
 * @module Data/repositories/base/BaseRepository
 * 
 * Provides generic CRUD operations using DatabaseService (sql.js)
 */

// @ts-ignore - sql.js types are in src/types/sql.js.d.ts
import { Database as SqlJsDatabase } from 'sql.js';
import { DatabaseService } from '../../DatabaseService';

/**
 * Generic DB row type
 */
export interface DbRow {
    id?: number;
}

/**
 * Base Repository
 * Provides generic CRUD operations for all repositories
 */
export abstract class BaseRepository<T extends DbRow> {
    protected dbService: DatabaseService;
    protected tableName: string;

    constructor(tableName: string) {
        this.dbService = DatabaseService.getInstance();
        this.tableName = tableName;
    }

    /**
     * Get database connection
     */
    protected get db(): SqlJsDatabase {
        return this.dbService.getConnection();
    }

    /**
     * Find one record by ID
     */
    findById(id: number): T | undefined {
        return this.dbService.get<T>(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [id]
        );
    }

    /**
     * Find one record by any field
     */
    findOne(field: string, value: any): T | undefined {
        return this.dbService.get<T>(
            `SELECT * FROM ${this.tableName} WHERE ${field} = ?`,
            [value]
        );
    }

    /**
     * Find all records
     */
    findAll(): T[] {
        return this.dbService.all<T>(`SELECT * FROM ${this.tableName}`);
    }

    /**
     * Find records with WHERE clause
     */
    findWhere(whereClause: string, params: any[] = []): T[] {
        return this.dbService.all<T>(
            `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
            params
        );
    }

    /**
     * Create a new record
     */
    create(data: Partial<T>): number {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map(() => '?').join(', ');

        this.dbService.run(
            `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
            values
        );

        return this.dbService.lastInsertRowId();
    }

    /**
     * Update a record by ID
     */
    update(id: number, data: Partial<T>): void {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');

        this.dbService.run(
            `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
    }

    /**
     * Delete a record by ID
     */
    delete(id: number): void {
        this.dbService.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    }

    /**
     * Delete records with WHERE clause
     */
    deleteWhere(whereClause: string, params: any[] = []): void {
        this.dbService.run(
            `DELETE FROM ${this.tableName} WHERE ${whereClause}`,
            params
        );
    }

    /**
     * Count records
     */
    count(whereClause?: string, params: any[] = []): number {
        const sql = whereClause
            ? `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${whereClause}`
            : `SELECT COUNT(*) as count FROM ${this.tableName}`;

        const result = this.dbService.get<{ count: number }>(sql, params);
        return result?.count || 0;
    }

    /**
     * Check if record exists
     */
    exists(field: string, value: any): boolean {
        return this.count(`${field} = ?`, [value]) > 0;
    }

    /**
     * Execute in transaction
     */
    inTransaction<R>(fn: () => R): R {
        return this.dbService.transaction(() => fn());
    }

    /**
     * Save changes to disk
     */
    save(): void {
        this.dbService.save();
    }
}

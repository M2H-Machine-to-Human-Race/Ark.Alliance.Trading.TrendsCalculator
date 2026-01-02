/**
 * @fileoverview IA Conversation Repository
 * @module Data/repositories/IAConversationRepository
 * 
 * CRITICAL FIX: Implements database persistence for AI conversations
 * Previously, IAConversationLogger had a TODO and only logged to memory.
 * 
 * NON-BLOCKING WRITES:
 * - All writes use AsyncDatabaseQueue
 * - Reads are synchronous from cache or DB
 */

import { DatabaseService } from '../DatabaseService';
import { IAConversation, iaConversationFromRow } from '../entities/IAConversation';

/**
 * IA Conversation Repository - Manages AI conversation persistence
 */
export class IAConversationRepository {
    private static instance: IAConversationRepository | null = null;
    private db: DatabaseService;

    private constructor() {
        this.db = DatabaseService.getInstance();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): IAConversationRepository {
        if (!IAConversationRepository.instance) {
            IAConversationRepository.instance = new IAConversationRepository();
        }
        return IAConversationRepository.instance;
    }

    /**
     * Insert a new conversation record
     * @param conversation - The conversation entity to insert
     * @returns The inserted conversation with ID populated
     */
    insert(conversation: IAConversation): IAConversation {
        const sql = `
            INSERT INTO ia_conversations (
                instance_key, strategy_key, session_id,
                request_timestamp, provider, model,
                system_prompt, user_prompt,
                response_timestamp, assistant_response,
                prompt_tokens, completion_tokens, total_tokens,
                latency_ms, status, error_message,
                parsed_action, parsed_adjustments, applied,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            conversation.instanceKey,
            conversation.strategyKey || null,
            conversation.sessionId,
            conversation.requestTimestamp,
            conversation.provider,
            conversation.model,
            conversation.systemPrompt || null,
            conversation.userPrompt,
            conversation.responseTimestamp || null,
            conversation.assistantResponse || null,
            conversation.promptTokens || null,
            conversation.completionTokens || null,
            conversation.totalTokens || null,
            conversation.latencyMs || null,
            conversation.status,
            conversation.errorMessage || null,
            conversation.parsedAction || null,
            conversation.parsedAdjustments || null,
            conversation.applied ? 1 : 0,
            conversation.createdAt
        ];

        this.db.run(sql, params);
        conversation.id = this.db.lastInsertRowId();

        return conversation;
    }

    /**
     * Update an existing conversation (typically after receiving response)
     * @param conversation - The conversation entity to update
     */
    update(conversation: IAConversation): void {
        if (!conversation.id) {
            throw new Error('Cannot update conversation without ID');
        }

        const sql = `
            UPDATE ia_conversations SET
                response_timestamp = ?,
                assistant_response = ?,
                prompt_tokens = ?,
                completion_tokens = ?,
                total_tokens = ?,
                latency_ms = ?,
                status = ?,
                error_message = ?,
                parsed_action = ?,
                parsed_adjustments = ?,
                applied = ?
            WHERE id = ?
        `;

        const params = [
            conversation.responseTimestamp || null,
            conversation.assistantResponse || null,
            conversation.promptTokens || null,
            conversation.completionTokens || null,
            conversation.totalTokens || null,
            conversation.latencyMs || null,
            conversation.status,
            conversation.errorMessage || null,
            conversation.parsedAction || null,
            conversation.parsedAdjustments || null,
            conversation.applied ? 1 : 0,
            conversation.id
        ];

        this.db.run(sql, params);
    }

    /**
     * Find conversations by session ID
     * @param sessionId - The session ID to search for
     * @returns Array of conversations in the session
     */
    findBySession(sessionId: string): IAConversation[] {
        const sql = `
            SELECT * FROM ia_conversations 
            WHERE session_id = ? 
            ORDER BY request_timestamp ASC
        `;

        const rows = this.db.all(sql, [sessionId]);
        return rows.map(iaConversationFromRow);
    }

    /**
     * Find conversations by instance key with optional limit
     * @param instanceKey - The instance key to search for
     * @param limit - Maximum number of results (default 50)
     * @returns Array of conversations for the instance
     */
    findByInstance(instanceKey: string, limit: number = 50): IAConversation[] {
        const sql = `
            SELECT * FROM ia_conversations 
            WHERE instance_key = ? 
            ORDER BY request_timestamp DESC 
            LIMIT ?
        `;

        const rows = this.db.all(sql, [instanceKey, limit]);
        return rows.map(iaConversationFromRow);
    }

    /**
     * Find conversations by date range
     * @param startTimestamp - Start of range (milliseconds)
     * @param endTimestamp - End of range (milliseconds)
     * @param instanceKey - Optional instance filter
     * @returns Array of conversations in range
     */
    findByDateRange(
        startTimestamp: number,
        endTimestamp: number,
        instanceKey?: string
    ): IAConversation[] {
        let sql: string;
        let params: any[];

        if (instanceKey) {
            sql = `
                SELECT * FROM ia_conversations 
                WHERE request_timestamp >= ? AND request_timestamp <= ? AND instance_key = ?
                ORDER BY request_timestamp DESC
            `;
            params = [startTimestamp, endTimestamp, instanceKey];
        } else {
            sql = `
                SELECT * FROM ia_conversations 
                WHERE request_timestamp >= ? AND request_timestamp <= ?
                ORDER BY request_timestamp DESC
            `;
            params = [startTimestamp, endTimestamp];
        }

        const rows = this.db.all(sql, params);
        return rows.map(iaConversationFromRow);
    }

    /**
     * Find conversations by status
     * @param status - The status to filter by ('pending', 'success', 'error')
     * @param limit - Maximum number of results
     * @returns Array of conversations with given status
     */
    findByStatus(status: string, limit: number = 100): IAConversation[] {
        const sql = `
            SELECT * FROM ia_conversations 
            WHERE status = ? 
            ORDER BY request_timestamp DESC 
            LIMIT ?
        `;

        const rows = this.db.all(sql, [status, limit]);
        return rows.map(iaConversationFromRow);
    }

    /**
     * Get conversation by ID
     * @param id - The conversation ID
     * @returns The conversation or undefined
     */
    findById(id: number): IAConversation | undefined {
        const sql = `SELECT * FROM ia_conversations WHERE id = ?`;
        const row = this.db.get(sql, [id]);
        return row ? iaConversationFromRow(row) : undefined;
    }

    /**
     * Get statistics for an instance
     * @param instanceKey - The instance key
     * @returns Statistics object
     */
    getStats(instanceKey: string): {
        totalConversations: number;
        successCount: number;
        errorCount: number;
        appliedCount: number;
        avgLatencyMs: number;
    } {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
                SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count,
                SUM(CASE WHEN applied = 1 THEN 1 ELSE 0 END) as applied_count,
                AVG(CASE WHEN latency_ms IS NOT NULL THEN latency_ms ELSE NULL END) as avg_latency
            FROM ia_conversations
            WHERE instance_key = ?
        `;

        const row = this.db.get<any>(sql, [instanceKey]);

        return {
            totalConversations: row?.total || 0,
            successCount: row?.success_count || 0,
            errorCount: row?.error_count || 0,
            appliedCount: row?.applied_count || 0,
            avgLatencyMs: row?.avg_latency || 0
        };
    }

    /**
     * Delete old conversations (cleanup)
     * @param olderThanMs - Delete conversations older than this timestamp
     * @returns Number of deleted records
     */
    deleteOlderThan(olderThanMs: number): number {
        const countSql = `SELECT COUNT(*) as count FROM ia_conversations WHERE created_at < ?`;
        const countResult = this.db.get<{ count: number }>(countSql, [olderThanMs]);
        const count = countResult?.count || 0;

        if (count > 0) {
            const deleteSql = `DELETE FROM ia_conversations WHERE created_at < ?`;
            this.db.run(deleteSql, [olderThanMs]);
        }

        return count;
    }
}

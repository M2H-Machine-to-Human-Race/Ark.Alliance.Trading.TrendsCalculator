/**
 * @fileoverview IA Conversation Entity
 * @module Data/Entities/IAConversation
 * 
 * Stores AI conversation exchanges for audit
 */

/**
 * Conversation status
 */
export type ConversationStatus = 'pending' | 'success' | 'error';

/**
 * IA Conversation entity
 */
export interface IAConversation {
    id?: number;

    // Identification
    instanceKey: string;
    strategyKey?: string;
    sessionId: string;

    // Request details
    requestTimestamp: number;
    provider: string;
    model: string;

    // Messages
    systemPrompt?: string;
    userPrompt: string;

    // Response details
    responseTimestamp?: number;
    assistantResponse?: string;

    // Token usage
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;

    // Latency and status
    latencyMs?: number;
    status: ConversationStatus;
    errorMessage?: string;

    // Parsed result
    parsedAction?: string;
    parsedAdjustments?: string;
    applied: boolean;

    // Timestamps
    createdAt: number;
}

/**
 * Create conversation entry
 */
export function createIAConversation(
    instanceKey: string,
    sessionId: string,
    provider: string,
    model: string,
    systemPrompt: string | undefined,
    userPrompt: string,
    strategyKey?: string
): IAConversation {
    return {
        instanceKey,
        strategyKey,
        sessionId,
        requestTimestamp: Date.now(),
        provider,
        model,
        systemPrompt,
        userPrompt,
        status: 'pending',
        applied: false,
        createdAt: Date.now()
    };
}

/**
 * Map database row to entity
 */
export function iaConversationFromRow(row: any): IAConversation {
    return {
        id: row.id,
        instanceKey: row.instance_key,
        strategyKey: row.strategy_key,
        sessionId: row.session_id,
        requestTimestamp: row.request_timestamp,
        provider: row.provider,
        model: row.model,
        systemPrompt: row.system_prompt,
        userPrompt: row.user_prompt,
        responseTimestamp: row.response_timestamp,
        assistantResponse: row.assistant_response,
        promptTokens: row.prompt_tokens,
        completionTokens: row.completion_tokens,
        totalTokens: row.total_tokens,
        latencyMs: row.latency_ms,
        status: row.status as ConversationStatus,
        errorMessage: row.error_message,
        parsedAction: row.parsed_action,
        parsedAdjustments: row.parsed_adjustments,
        applied: row.applied === 1,
        createdAt: row.created_at
    };
}

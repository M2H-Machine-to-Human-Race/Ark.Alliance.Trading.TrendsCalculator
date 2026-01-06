/**
 * @fileoverview AI Telemetry Service
 * @module application/services/AITelemetryService
 * 
 * Service for managing AI telemetry data and logs.
 * Queries IAConversation records and maps to DTOs for UI consumption.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-06
 */

import { IAConversationRepository } from '../../infrastructure/persistence/repositories/IAConversationRepository';
import { IAConversation } from '../../infrastructure/persistence/entities/IAConversation';
import {
    AITelemetryGridDto,
    AITelemetryDetailDto,
    AIExchangeStatus,
    AIProviderType
} from '@share/index';

/**
 * Pagination result for telemetry grid
 */
export interface TelemetryGridResult {
    items: AITelemetryGridDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * AI Telemetry Service
 * Manages querying and mapping of AI conversation logs for the UI
 */
export class AITelemetryService {
    private static instance: AITelemetryService | null = null;
    private repository: IAConversationRepository;

    private constructor() {
        this.repository = IAConversationRepository.getInstance();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): AITelemetryService {
        if (!AITelemetryService.instance) {
            AITelemetryService.instance = new AITelemetryService();
        }
        return AITelemetryService.instance;
    }

    /**
     * Get paginated telemetry logs for grid display
     * @param page - Page number (1-based)
     * @param pageSize - Number of items per page
     * @param instanceKey - Optional filter by instance
     * @returns Paginated grid result
     */
    getGridLogs(page: number = 1, pageSize: number = 20, instanceKey?: string): TelemetryGridResult {
        // Get all records (we'll add proper pagination to repository later)
        const all = instanceKey
            ? this.repository.findByInstance(instanceKey, 1000)
            : this.getRecentLogs(1000);

        const total = all.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const pageItems = all.slice(startIndex, endIndex);
        const items = pageItems.map(conv => this.mapToGridDto(conv));

        return {
            items,
            total,
            page,
            pageSize,
            totalPages,
        };
    }

    /**
     * Get detailed log by ID for modal view
     * @param id - Conversation ID
     * @returns Detailed DTO or null if not found
     */
    getDetailById(id: number): AITelemetryDetailDto | null {
        const conversation = this.repository.findById(id);
        if (!conversation) return null;
        return this.mapToDetailDto(conversation);
    }

    /**
     * Get recent logs across all instances
     * @param limit - Maximum number of logs
     */
    private getRecentLogs(limit: number): IAConversation[] {
        // Use date range from 30 days ago to now
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        return this.repository.findByDateRange(thirtyDaysAgo, now);
    }

    /**
     * Map IAConversation entity to grid DTO
     */
    private mapToGridDto(conv: IAConversation): AITelemetryGridDto {
        const timestampSend = new Date(conv.requestTimestamp).toISOString();
        const timestampReceive = conv.responseTimestamp
            ? new Date(conv.responseTimestamp).toISOString()
            : undefined;

        // Calculate duration
        const durationMs = conv.latencyMs ||
            (conv.responseTimestamp ? conv.responseTimestamp - conv.requestTimestamp : 0);

        // Generate summary from response (first 100 chars)
        const summary = conv.assistantResponse
            ? conv.assistantResponse.substring(0, 100) + (conv.assistantResponse.length > 100 ? '...' : '')
            : conv.status === 'error'
                ? `Error: ${conv.errorMessage?.substring(0, 80) || 'Unknown error'}`
                : 'Pending...';

        return {
            id: conv.id || 0,
            timestampSend,
            timestampReceive,
            durationMs,
            provider: this.mapProvider(conv.provider),
            model: conv.model,
            status: this.mapStatus(conv.status),
            summary,
            tokenCount: conv.totalTokens || 0,
        };
    }

    /**
     * Map IAConversation entity to detail DTO
     */
    private mapToDetailDto(conv: IAConversation): AITelemetryDetailDto {
        const gridDto = this.mapToGridDto(conv);

        return {
            ...gridDto,
            sessionId: conv.sessionId,
            systemPrompt: conv.systemPrompt,
            userPrompt: conv.userPrompt,
            fullResponse: conv.assistantResponse,
            promptTokens: conv.promptTokens || 0,
            completionTokens: conv.completionTokens || 0,
            errorMessage: conv.errorMessage,
            parsedAction: conv.parsedAction,
            instanceKey: conv.instanceKey,
        };
    }

    /**
     * Map provider string to AIProviderType enum
     */
    private mapProvider(provider: string): AIProviderType {
        const upper = provider.toUpperCase();
        if (upper === 'GEMINI' || upper === 'GOOGLE') return AIProviderType.GEMINI;
        if (upper === 'OPENAI' || upper === 'GPT') return AIProviderType.OPENAI;
        if (upper === 'ANTHROPIC' || upper === 'CLAUDE') return AIProviderType.ANTHROPIC;
        if (upper === 'DEEPSEEK') return AIProviderType.DEEPSEEK;
        if (upper === 'PERPLEXITY') return AIProviderType.PERPLEXITY;
        if (upper === 'GROK') return AIProviderType.GROK;
        return AIProviderType.NONE;
    }

    /**
     * Map conversation status to AIExchangeStatus enum
     */
    private mapStatus(status: string): AIExchangeStatus {
        switch (status.toLowerCase()) {
            case 'success': return AIExchangeStatus.SUCCESS;
            case 'error': return AIExchangeStatus.ERROR;
            case 'timeout': return AIExchangeStatus.TIMEOUT;
            case 'pending':
            default: return AIExchangeStatus.PENDING;
        }
    }

    /**
     * Get statistics for dashboard
     */
    getStats(instanceKey?: string): {
        totalExchanges: number;
        successRate: number;
        avgLatencyMs: number;
        errorCount: number;
    } {
        const key = instanceKey || 'default';
        const stats = this.repository.getStats(key);

        return {
            totalExchanges: stats.totalConversations,
            successRate: stats.totalConversations > 0
                ? (stats.successCount / stats.totalConversations) * 100
                : 0,
            avgLatencyMs: stats.avgLatencyMs,
            errorCount: stats.errorCount,
        };
    }
}

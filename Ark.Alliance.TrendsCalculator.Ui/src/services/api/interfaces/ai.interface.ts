/**
 * @fileoverview AI API Interface
 * @module services/api/interfaces/ai
 * 
 * TypeScript interface for AI API service.
 * Enables mock implementations for unit testing.
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2025-12-28
 */

import { TrendDirection } from '@share/trends';

// ═══════════════════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI Analysis Result DTO
 * 
 * @interface AIAnalysisResultDto
 * @property {TrendDirection} direction - Predicted trend direction
 * @property {number} confidence - Confidence level (0-1)
 * @property {string} [reasoning] - AI's reasoning explanation
 * @property {string[]} [keyFactors] - Key factors influencing the decision
 */
export interface AIAnalysisResultDto {
    /** Predicted trend direction (LONG, SHORT, WAIT) */
    direction: TrendDirection;
    /** AI confidence level (0-1) */
    confidence: number;
    /** Optional AI reasoning explanation */
    reasoning?: string;
    /** Optional key factors influencing decision */
    keyFactors?: string[];
}

/**
 * AI Analysis Response DTO
 */
export interface AIAnalyzeResponseDto {
    success: boolean;
    data?: AIAnalysisResultDto;
    symbol?: string;
    timestamp?: number;
    error?: {
        code: string;
        message: string;
    };
}

/**
 * AI Status Response DTO
 */
export interface AIStatusResponseDto {
    success: boolean;
    data?: {
        connected: boolean;
        provider: string;
        model: string;
        apiKeyConfigured: boolean;
    };
    error?: {
        code: string;
        message: string;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI API Interface
 * @endpoint /api/ai/*
 */
export interface IAIApi {
    /** Trigger AI analysis for a symbol */
    analyzeWithAI(symbol: string): Promise<AIAnalyzeResponseDto>;

    /** Get AI connection status */
    getAIStatus(): Promise<AIStatusResponseDto>;
}

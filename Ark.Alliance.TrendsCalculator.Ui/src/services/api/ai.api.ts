/**
 * @fileoverview AI Analysis API Service
 * @module services/api/ai
 * @description
 * REST API client for AI-powered trend analysis.
 * Communicates with AIController endpoints.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 * 
 * @remarks
 * Endpoints:
 * - POST /api/ai/analyze - Trigger AI analysis for a symbol
 * - GET /api/ai/status - Check AI connection status
 */

import { apiClient } from './client';

// ═══════════════════════════════════════════════════════════════════════════
// DTOs - Data Transfer Objects
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI Analysis Request DTO
 * @swagger
 * components:
 *   schemas:
 *     AIAnalyzeRequestDto:
 *       type: object
 *       required: [symbol]
 *       properties:
 *         symbol: { type: string, example: 'BTCUSDT' }
 */
export interface AIAnalyzeRequestDto {
    symbol: string;
}

/**
 * AI Analysis Result DTO
 * @swagger
 * components:
 *   schemas:
 *     AIAnalysisResultDto:
 *       type: object
 *       properties:
 *         direction: { type: string, enum: ['LONG', 'SHORT', 'WAIT'] }
 *         confidence: { type: number, minimum: 0, maximum: 1 }
 *         reasoning: { type: string }
 *         keyFactors: { type: array, items: { type: string } }
 */
export interface AIAnalysisResultDto {
    direction: 'LONG' | 'SHORT' | 'WAIT';
    confidence: number;
    reasoning?: string;
    keyFactors?: string[];
}

/**
 * AI Analysis Response DTO
 * @swagger
 * components:
 *   schemas:
 *     AIAnalyzeResponseDto:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         data: { $ref: '#/components/schemas/AIAnalysisResultDto' }
 *         symbol: { type: string }
 *         timestamp: { type: number }
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
 * @swagger
 * components:
 *   schemas:
 *     AIStatusResponseDto:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         data:
 *           type: object
 *           properties:
 *             connected: { type: boolean }
 *             provider: { type: string }
 *             model: { type: string }
 *             apiKeyConfigured: { type: boolean }
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
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger AI analysis for a symbol
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @returns {Promise<AIAnalyzeResponseDto>} AI analysis results
 * @endpoint POST /api/ai/analyze
 * 
 * @example
 * ```typescript
 * const result = await analyzeWithAI('BTCUSDT');
 * if (result.success) {
 *     console.log(`Direction: ${result.data.direction}`);
 *     console.log(`Confidence: ${result.data.confidence}`);
 * }
 * ```
 */
export async function analyzeWithAI(symbol: string): Promise<AIAnalyzeResponseDto> {
    const response = await apiClient.post<AIAnalyzeResponseDto>('/ai/analyze', { symbol });
    return response.data;
}

/**
 * Get AI connection status and configuration
 * @returns {Promise<AIStatusResponseDto>} AI status including provider, model, and connection state
 * @endpoint GET /api/ai/status
 */
export async function getAIStatus(): Promise<AIStatusResponseDto> {
    const response = await apiClient.get<AIStatusResponseDto>('/ai/status');
    return response.data;
}

/**
 * AI API namespace export
 */
export const aiApi = {
    analyzeWithAI,
    getAIStatus,
};

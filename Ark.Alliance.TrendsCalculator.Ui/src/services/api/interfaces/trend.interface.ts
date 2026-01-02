/**
 * @fileoverview Trend API Interface
 * @module services/api/interfaces/trend
 * 
 * TypeScript interface for Trend API service.
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
 * Trend analysis result DTO
 */
export interface TrendAnalysisDto {
    symbol: string;
    direction: TrendDirection;
    confidence: number;
    compositeScore: number;
    timestamp: number;
}

/**
 * Trend history entry DTO
 */
export interface TrendHistoryEntryDto {
    id: string;
    symbol: string;
    direction: TrendDirection;
    confidence: number;
    timestamp: number;
    isValidated?: boolean;
    isCorrect?: boolean;
}

/**
 * Trend analysis response DTO
 */
export interface TrendAnalysisResponseDto {
    success: boolean;
    data: TrendAnalysisDto;
}

/**
 * Trend history response DTO
 */
export interface TrendHistoryResponseDto {
    success: boolean;
    data: TrendHistoryEntryDto[];
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trend API Interface
 * @endpoint /api/trend/*
 */
export interface ITrendApi {
    /** Analyze trend for a symbol */
    analyzeTrend(symbol: string): Promise<TrendAnalysisResponseDto>;

    /** Get trend history for a symbol */
    getTrendHistory(symbol: string, limit?: number): Promise<TrendHistoryResponseDto>;
}

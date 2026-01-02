/**
 * @fileoverview Trend API Service
 * @module services/api/trend
 * @description
 * Trend analysis endpoints matching TrendController
 */

import type { TrendAnalysisResponseDto } from '@share/trends';
import { apiClient } from './client';

/**
 * Analyze trend for a specific symbol
 * @param {string} symbol - Symbol to analyze
 * @returns {Promise<TrendAnalysisResponseDto>} Trend analysis result
 * @endpoint GET /api/trend/:symbol/analyze
 */
export async function getTrendAnalysis(symbol: string): Promise<TrendAnalysisResponseDto> {
    const response = await apiClient.get(`/trend/${symbol}/analyze`);
    return response.data.data;
}

/**
 * Analyze trend with custom parameters
 * @param {string} symbol - Symbol to analyze
 * @param {object} [params] - Custom parameters
 * @returns {Promise<TrendAnalysisResponseDto>} Trend analysis result
 * @endpoint POST /api/trend/analyze
 */
export async function analyzeTrendWithParams(
    symbol: string,
    params?: {
        emaShortPeriod?: number;
        emaLongPeriod?: number;
        minDataPoints?: number;
    }
): Promise<TrendAnalysisResponseDto> {
    const response = await apiClient.post('/trend/analyze', {
        symbol,
        ...params,
    });
    return response.data.data;
}

/**
 * Get trend analysis history for a symbol  
 * @param {string} symbol - Symbol to get history for
 * @returns {Promise<any>} Historical trend data
 * @endpoint GET /api/trend/:symbol/history
 * @note Currently returns empty array - backend TODO
 */
export async function getTrendHistory(symbol: string): Promise<any> {
    const response = await apiClient.get(`/trend/${symbol}/history`);
    return response.data.data;
}

/**
 * Trigger AI analysis (alias for getTrendAnalysis)
 * @param {string} symbol - Symbol to analyze
 * @returns {Promise<TrendAnalysisResponseDto>} AI analysis result
 */
export async function triggerAIAnalysis(symbol: string): Promise<TrendAnalysisResponseDto> {
    return getTrendAnalysis(symbol);
}

export const trendApi = {
    getTrendAnalysis,
    analyzeTrendWithParams,
    getTrendHistory,
    triggerAIAnalysis,
};

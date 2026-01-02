/**
 * @fileoverview API Client Service - INTEGRATED WITH BACKEND
 * @module services/api
 * @description
 * REST API client using Axios for HTTP requests to backend.
 * All endpoints match actual backend implementation.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2025-12-27
 * 
 * @remarks
 * Backend API Documentation:
 * - Base URL: http://localhost:3001/api
 * - All responses follow format: { success: boolean, data: any, error?: { code: string, message: string } }
 * - Integration status: COMPLETE
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Base API URL
 * In development: Empty string - Vite proxy routes /api/* to backend
 * In production: Use VITE_API_URL environment variable
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error('[API Error]', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check API health status
 * @returns {Promise<any>} Health status object
 * @endpoint GET /api/health
 */
export async function getHealth(): Promise<any> {
    const response = await apiClient.get('/health');
    return response.data.data;
}

/**
 * Get detailed health check with service statuses
 * @returns {Promise<any>} Detailed health information
 * @endpoint GET /api/health/detailed
 */
export async function getDetailedHealth(): Promise<any> {
    const response = await apiClient.get('/health/detailed');
    return response.data.data;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYMBOL TRACKING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all tracked symbols
 * @returns {Promise<string[]>} Array of tracked symbol names
 * @endpoint GET /api/symbol
 */
export async function getSymbols(): Promise<string[]> {
    const response = await apiClient.get('/symbol');
    return response.data.data.symbols;
}

/**
 * Start tracking a symbol
 * @param {string} symbol - Symbol to track (e.g., 'BTCUSDT')
 * @param {number} [bufferSize] - Optional buffer size
 * @returns {Promise<any>} Symbol tracking status
 * @endpoint POST /api/symbol/track
 */
export async function addSymbol(symbol: string, bufferSize?: number): Promise<any> {
    const response = await apiClient.post('/symbol/track', {
        symbol,
        bufferSize,
        enableAI: true,
    });
    return response.data.data;
}

/**
 * Stop tracking a symbol
 * @param {string} symbol - Symbol to stop tracking
 * @returns {Promise<void>}
 * @endpoint DELETE /api/symbol/:symbol/track
 */
export async function removeSymbol(symbol: string): Promise<void> {
    await apiClient.delete(`/symbol/${symbol}/track`);
}

/**
 * Get tracking status for a symbol
 * @param {string} symbol - Symbol to check
 * @returns {Promise<any>} Symbol status including buffer info
 * @endpoint GET /api/symbol/:symbol/status
 */
export async function getSymbolStatus(symbol: string): Promise<any> {
    const response = await apiClient.get(`/symbol/${symbol}/status`);
    return response.data.data;
}

// ═══════════════════════════════════════════════════════════════════════════
// TREND ANALYSIS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze trend for a specific symbol
 * @param {string} symbol - Symbol to analyze
 * @returns {Promise<any>} Trend analysis result
 * @endpoint GET /api/trend/:symbol/analyze
 */
export async function getTrendAnalysis(symbol: string): Promise<any> {
    const response = await apiClient.get(`/trend/${symbol}/analyze`);
    return response.data.data;
}

/**
 * Analyze trend with custom parameters
 * @param {string} symbol - Symbol to analyze
 * @param {object} [params] - Custom parameters (emaShortPeriod, emaLongPeriod, etc.)
 * @returns {Promise<any>} Trend analysis result
 * @endpoint POST /api/trend/analyze
 */
export async function analyzeTrendWithParams(symbol: string, params?: any): Promise<any> {
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

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS ENDPOINTS (NOT YET IMPLEMENTED IN BACKEND)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get system settings
 * @returns {Promise<any>} System configuration
 * @note NOT YET IMPLEMENTED - Returns mock data
 */
export async function getSettings(): Promise<any> {
    const response = await apiClient.get('/settings');
    return response.data.data;
}

/**
 * Update system settings
 * @param {any} settings - Settings object to save (categorized)
 * @returns {Promise<any>} Update result
 * @endpoint PUT /api/settings
 */
export async function updateSettings(settings: any): Promise<any> {
    const response = await apiClient.put('/settings', settings);
    return response.data;
}

/**
 * Trigger AI analysis for a symbol
 * @param {string} symbol - Symbol to analyze
 * @returns {Promise<any>} AI analysis result
 * @note Maps to existing trend analysis endpoint
 */
export async function triggerAIAnalysis(symbol: string): Promise<any> {
    // Uses existing trend analysis endpoint (which includes AI if enabled)
    return getTrendAnalysis(symbol);
}

/**
 * API Service object with all methods
 */
export const apiService = {
    // Health
    getHealth,
    getDetailedHealth,

    // Symbols
    getSymbols,
    addSymbol,
    removeSymbol,
    getSymbolStatus,

    // Trends
    getTrendAnalysis,
    analyzeTrendWithParams,
    getTrendHistory,
    triggerAIAnalysis,

    // Settings (partial implementation)
    getSettings,
    updateSettings,
};

export default apiService;

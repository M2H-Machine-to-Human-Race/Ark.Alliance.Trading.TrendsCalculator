/**
 * @fileoverview Symbol API Service
 * @module services/api/symbol
 * @description
 * Symbol tracking endpoints matching SymbolController
 */

import type { SymbolStatusResponseDto } from '@share/trends';
import { apiClient } from './client';

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
 * @returns {Promise<SymbolStatusResponseDto>} Symbol tracking status
 * @endpoint POST /api/symbol/track
 */
export async function addSymbol(symbol: string, bufferSize?: number): Promise<SymbolStatusResponseDto> {
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
 * @returns {Promise<SymbolStatusResponseDto>} Symbol status
 * @endpoint GET /api/symbol/:symbol/status
 */
export async function getSymbolStatus(symbol: string): Promise<SymbolStatusResponseDto> {
    const response = await apiClient.get(`/symbol/${symbol}/status`);
    return response.data.data;
}

export const symbolApi = {
    getSymbols,
    addSymbol,
    removeSymbol,
    getSymbolStatus,
};

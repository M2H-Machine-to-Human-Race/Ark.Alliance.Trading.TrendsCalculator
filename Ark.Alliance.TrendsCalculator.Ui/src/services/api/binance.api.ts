/**
 * @fileoverview Binance API Service
 * @module services/api/binance
 * @description
 * Binance market data endpoints for klines and price data
 */

import { apiClient } from './client';

/**
 * Kline data point from Binance
 */
export interface KlineData {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
}

/**
 * Get historical klines (candlestick data)
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT')
 * @param {string} interval - Kline interval (e.g., '1m', '5m', '15m')
 * @param {number} [limit=100] - Number of klines to fetch (max 1500)
 * @returns {Promise<KlineData[]>} Array of kline data
 * @endpoint GET /api/binance/klines
 */
export async function getKlines(
    symbol: string,
    interval: string = '1m',
    limit: number = 100
): Promise<KlineData[]> {
    try {
        const response = await apiClient.get('/binance/klines', {
            params: { symbol, interval, limit }
        });
        return response.data.data || [];
    } catch (error: any) {
        console.error('[BinanceAPI] Failed to fetch klines:', error.message);
        return [];
    }
}

/**
 * Get current price for a symbol
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<{ symbol: string; price: number } | null>}
 * @endpoint GET /api/binance/price/:symbol
 */
export async function getPrice(symbol: string): Promise<{ symbol: string; price: number } | null> {
    try {
        const response = await apiClient.get(`/binance/price/${symbol}`);
        return response.data.data;
    } catch (error: any) {
        console.error('[BinanceAPI] Failed to fetch price:', error.message);
        return null;
    }
}

export const binanceApi = {
    getKlines,
    getPrice,
};

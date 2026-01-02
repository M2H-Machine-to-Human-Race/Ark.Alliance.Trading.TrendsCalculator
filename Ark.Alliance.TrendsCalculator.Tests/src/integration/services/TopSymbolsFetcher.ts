/**
 * Top Symbols Fetcher Service
 * 
 * @fileoverview Fetches top market cap symbols from Binance Futures
 * @module integration/services/TopSymbolsFetcher
 */

import axios from 'axios';

/**
 * Symbol with market cap info
 */
export interface SymbolMarketCap {
    symbol: string;
    marketCap: number;
    rank: number;
}

/**
 * Fetches top N symbols by market capitalization from Binance Futures USD-M
 */
export class TopSymbolsFetcher {
    private static readonly BINANCE_FUTURES_API = 'https://fapi.binance.com';

    /**
     * Get top N symbols by 24h volume (proxy for market cap)
     * 
     * @param count - Number of symbols to fetch
     * @returns Array of top symbols with rank
     */
    async getTopSymbols(count: number = 50): Promise<SymbolMarketCap[]> {
        try {
            // Fetch 24h ticker data for all USD-M futures
            const response = await axios.get(`${TopSymbolsFetcher.BINANCE_FUTURES_API}/fapi/v1/ticker/24hr`);
            const tickers = response.data;

            // Filter for USDT perpetual contracts and sort by volume
            const usdtPerpetuals = tickers
                .filter((t: any) => t.symbol.endsWith('USDT'))
                .map((t: any) => ({
                    symbol: t.symbol,
                    volume: parseFloat(t.quoteVolume), // Use quote volume as market cap proxy
                    price: parseFloat(t.lastPrice)
                }))
                .sort((a: any, b: any) => b.volume - a.volume)
                .slice(0, count);

            // Add rankings
            return usdtPerpetuals.map((s: any, index: number) => ({
                symbol: s.symbol,
                marketCap: s.volume,
                rank: index + 1
            }));

        } catch (error: any) {
            console.error('Failed to fetch top symbols:', error.message);
            throw new Error(`Failed to fetch top symbols: ${error.message}`);
        }
    }

    /**
     * Get top symbols as simple string array
     */
    async getTopSymbolNames(count: number = 50): Promise<string[]> {
        const symbols = await this.getTopSymbols(count);
        return symbols.map(s => s.symbol);
    }
}




/**
 * @fileoverview Market Data Service
 * @module core/services/MarketDataService
 * 
 * Implements IMarketDataProvider using BinanceMarketDataRest
 * Refactored to use BaseTradingService pattern.
 */

import { IMarketDataProvider } from '@infrastructure/external/ai/MarketMicroDataCalculator';
import { BinanceMarketDataRest } from 'ark-alliance-trading-providers-lib/Binance';
import { BaseTradingService, DEFAULT_TRADING_SERVICE_CONFIG } from './base';
import { BinanceServiceFactory } from '@infrastructure/providers';
import { Result } from 'ark-alliance-trading-providers-lib';

export class MarketDataService extends BaseTradingService implements IMarketDataProvider {
    private static instance: MarketDataService;
    private client: BinanceMarketDataRest;

    /**
     * Private constructor for Singleton pattern
     */
    private constructor() {
        super({
            ...DEFAULT_TRADING_SERVICE_CONFIG,
            instanceKey: 'MarketDataService'
        });

        // Initialize client using Factory
        this.client = BinanceServiceFactory.createMarketDataClient();
    }

    /**
     * Get Singleton Instance
     */
    static getInstance(): MarketDataService {
        if (!MarketDataService.instance) {
            MarketDataService.instance = new MarketDataService();
        }
        return MarketDataService.instance;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // Lifecycle Hooks
    // ═══════════════════════════════════════════════════════════════════════════════

    protected async onStart(): Promise<void> {
        this.logger.info('MarketDataService started');
        // Client is stateless/REST, so no specific connection needed
    }

    protected async onStop(): Promise<void> {
        this.logger.info('MarketDataService stopped');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // IMarketDataProvider Implementation (Backward Compatibility)
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Get latest price (Best Bid/Ask)
     */
    async getPrice(symbol: string): Promise<{ bestBidPrice: number; bestAskPrice: number } | null> {
        const result = await this.executeWithResult(async () => {
            // Use getOrderBookParsed to get numeric values
            const bookResult = await this.client.getOrderBookParsed(symbol, 5);
            if (bookResult.isFailure || !bookResult.data) {
                throw new Error(bookResult.error?.message || 'Failed to fetch order book');
            }

            const book = bookResult.data;
            if (book.bids.length === 0 || book.asks.length === 0) {
                return null;
            }

            return {
                bestBidPrice: book.bids[0].price,
                bestAskPrice: book.asks[0].price
            };
        }, `getPrice(${symbol})`);

        if (result.isFailure) return null;
        return result.data ?? null;
    }

    /**
     * Get Order Book Depth
     */
    async getOrderBookDepth(symbol: string, limit: number): Promise<{ bids: string[][]; asks: string[][] }> {
        const result = await this.executeWithResult(async () => {
            // Cast limit as any to bypass strict literal check
            const bookResult = await this.client.getOrderBook(symbol, limit as any);

            if (bookResult.isFailure || !bookResult.data) {
                throw new Error(bookResult.error?.message || 'Failed to fetch order book');
            }

            // Return string[][] as expected by interface
            return {
                bids: bookResult.data.bids,
                asks: bookResult.data.asks
            };
        }, `getOrderBookDepth(${symbol})`);

        if (result.isFailure) {
            throw new Error(result.error?.message);
        }
        return result.data!;
    }

    /**
     * Get Klines
     */
    async getKlines(symbol: string, interval: string, limit: number): Promise<any[]> {
        const result = await this.executeWithResult(async () => {
            // Use getKlinesRaw to return raw arrays for backward compatibility
            const klineResult = await this.client.getKlinesRaw(symbol, interval as any, { limit });

            if (klineResult.isFailure || !klineResult.data) {
                throw new Error(klineResult.error?.message || 'Failed to fetch klines');
            }
            return klineResult.data;
        }, `getKlines(${symbol}, ${interval})`);

        if (result.isFailure) {
            throw new Error(result.error?.message);
        }
        return result.data!;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // New Methods (Result Pattern)
    // ═══════════════════════════════════════════════════════════════════════════════


}

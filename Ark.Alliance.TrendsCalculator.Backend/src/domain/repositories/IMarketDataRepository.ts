/**
 * Market Data Repository Interface
 * 
 * @fileoverview Repository interface for MarketDataSnapshot entities (Domain Layer)
 * @module domain/repositories/IMarketDataRepository
 */

import { MarketDataSnapshot } from '../entities/MarketDataSnapshot';
import { PricePoint } from '../models/PricePoint';

/**
 * Repository interface for MarketData persistence operations
 */
export interface IMarketDataRepository {
    /**
     * Save a market data snapshot
     */
    saveSnapshot(snapshot: MarketDataSnapshot): Promise<void>;

    /**
     * Get the most recent snapshot for a symbol
     */
    getLatestSnapshot(symbol: string): Promise<MarketDataSnapshot | null>;

    /**
     * Get historical price points for a symbol
     */
    getHistoricalPrices(
        symbol: string,
        startTime: Date,
        endTime: Date
    ): Promise<PricePoint[]>;

    /**
     * Get recent price points (last N points)
     */
    getRecentPrices(symbol: string, count: number): Promise<PricePoint[]>;

    /**
     * Delete old market data (cleanup)
     */
    deleteOlderThan(cutoffDate: Date): Promise<number>;
}

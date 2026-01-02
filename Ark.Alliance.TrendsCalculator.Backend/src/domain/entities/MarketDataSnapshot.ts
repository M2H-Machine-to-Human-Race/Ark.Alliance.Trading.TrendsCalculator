/**
 * Market Data Snapshot Entity
 * 
 * @fileoverview Domain entity representing a snapshot of market data for a symbol
 * @module domain/entities/MarketDataSnapshot
 */

import { PricePoint } from '../models/PricePoint';

/**
 * Market Data Snapshot Entity (Domain Model)
 * 
 * @remarks
 * Represents a time-based snapshot of market data including price history
 */
export class MarketDataSnapshot {
    constructor(
        public readonly symbol: string,
        public readonly timestamp: Date,
        public readonly currentPrice: number,
        public readonly volume: number,
        public readonly pricePoints: ReadonlyArray<PricePoint>
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.symbol) {
            throw new Error('Symbol is required');
        }
        if (this.currentPrice <= 0) {
            throw new Error('Price must be positive');
        }
        if (this.volume < 0) {
            throw new Error('Volume cannot be negative');
        }
        if (this.pricePoints.length === 0) {
            throw new Error('Price points cannot be empty');
        }
    }

    /**
     * Get price change percentage from first to last point
     */
    getPriceChangePercent(): number {
        if (this.pricePoints.length < 2) return 0;
        const first = this.pricePoints[0].price;
        const last = this.pricePoints[this.pricePoints.length - 1].price;
        return ((last - first) / first) * 100;
    }

    /**
     * Get average volume
     */
    getAverageVolume(): number {
        return this.volume / this.pricePoints.length;
    }

    /**
     * Check if snapshot has sufficient data for analysis
     */
    hasSufficientData(minPoints: number = 50): boolean {
        return this.pricePoints.length >= minPoints;
    }
}

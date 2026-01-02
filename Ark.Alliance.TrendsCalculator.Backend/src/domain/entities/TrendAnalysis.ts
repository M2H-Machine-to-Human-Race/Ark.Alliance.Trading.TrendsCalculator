/**
 * Trend Analysis Entity
 * 
 * @fileoverview Domain entity representing a complete trend analysis for a symbol
 * @module domain/entities/TrendAnalysis
 */

import { TrendDirection } from '@share/enums/trend/TrendDirection';

/**
 * Trend Analysis Entity (Domain Model)
 * 
 * @remarks
 * This is a pure domain entity with no infrastructure dependencies.
 * Represents the core business concept of a trend analysis result.
 */
export class TrendAnalysis {
    constructor(
        public readonly symbol: string,
        public readonly timestamp: Date,
        public readonly direction: TrendDirection,
        public readonly confidence: number,
        public readonly compositeScore: number,
        public readonly slope: number,
        public readonly rSquared: number,
        public readonly hurstExponent: number,
        public readonly volatilityRegime: string,
        public readonly emaShort: number,
        public readonly emaLong: number,
        public readonly metadata?: {
            autocorrelation?: number;
            stationarity?: string;
            persistence?: number;
        }
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.symbol) {
            throw new Error('Symbol is required');
        }
        if (this.confidence < 0 || this.confidence > 1) {
            throw new Error('Confidence must be between 0 and 1');
        }
        if (this.rSquared < 0 || this.rSquared > 1) {
            throw new Error('R-squared must be between 0 and 1');
        }
    }

    /**
     * Check if trend is strong (high confidence)
     */
    isStrongTrend(): boolean {
        return this.confidence >= 0.7;
    }

    /**
     * Check if trend is reliable (good R²)
     */
    isReliable(): boolean {
        return this.rSquared >= 0.6;
    }

    /**
     * Check if trend is actionable (both strong and reliable)
     */
    isActionable(): boolean {
        return this.isStrongTrend() && this.isReliable();
    }
}

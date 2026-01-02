/**
 * Trend Score Value Object
 * 
 * @fileoverview Immutable value object representing a trend score
 * @module domain/value-objects/TrendScore
 */

/**
 * Trend Score Value Object
 * 
 * @remarks
 * Encapsulates trend strength with validation
 */
export class TrendScore {
    private constructor(
        public readonly value: number
    ) {
        this.validate();
    }

    private validate(): void {
        if (this.value < -1 || this.value > 1) {
            throw new Error('Trend score must be between -1 and 1');
        }
    }

    /**
     * Create a trend score
     */
    static create(value: number): TrendScore {
        return new TrendScore(value);
    }

    /**
     * Check if trend is bullish (positive)
     */
    isBullish(): boolean {
        return this.value > 0.1;
    }

    /**
     * Check if trend is bearish (negative)
     */
    isBearish(): boolean {
        return this.value < -0.1;
    }

    /**
     * Check if trend is neutral
     */
    isNeutral(): boolean {
        return !this.isBullish() && !this.isBearish();
    }

    /**
     * Get strength category
     */
    getStrength(): 'WEAK' | 'MODERATE' | 'STRONG' {
        const abs = Math.abs(this.value);
        if (abs < 0.3) return 'WEAK';
        if (abs < 0.7) return 'MODERATE';
        return 'STRONG';
    }
}

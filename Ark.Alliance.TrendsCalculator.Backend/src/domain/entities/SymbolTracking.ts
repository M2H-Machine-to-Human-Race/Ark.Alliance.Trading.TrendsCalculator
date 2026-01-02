/**
 * Symbol Tracking Entity
 * 
 * @fileoverview Domain entity representing a tracked symbol
 * @module domain/entities/SymbolTracking
 */

/**
 * Symbol Tracking Entity (Domain Model)
 * 
 * @remarks
 * Represents a symbol that is being actively monitored for trend analysis
 */
export class SymbolTracking {
    constructor(
        public readonly symbol: string,
        public readonly isActive: boolean,
        public readonly lastAnalysisTime: Date,
        public readonly trackingStartedTime: Date,
        public readonly analysisCount: number = 0
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.symbol) {
            throw new Error('Symbol is required');
        }
        if (this.analysisCount < 0) {
            throw new Error('Analysis count cannot be negative');
        }
    }

    /**
     * Create a new tracking entry for a symbol
     */
    static create(symbol: string): SymbolTracking {
        const now = new Date();
        return new SymbolTracking(symbol, true, now, now, 0);
    }

    /**
     * Mark symbol as inactive
     */
    deactivate(): SymbolTracking {
        return new SymbolTracking(
            this.symbol,
            false,
            this.lastAnalysisTime,
            this.trackingStartedTime,
            this.analysisCount
        );
    }

    /**
     * Update last analysis time
     */
    updateAnalysis(timestamp: Date): SymbolTracking {
        return new SymbolTracking(
            this.symbol,
            this.isActive,
            timestamp,
            this.trackingStartedTime,
            this.analysisCount + 1
        );
    }
}

/**
 * Trend Analysis Repository Interface
 * 
 * @fileoverview Repository interface for TrendAnalysis entities (Domain Layer)
 * @module domain/repositories/ITrendAnalysisRepository
 * 
 * @remarks
 * This is an INTERFACE defined in the domain layer. The implementation
 * will be in the infrastructure layer, following Dependency Inversion Principle.
 */

import { TrendAnalysis } from '../entities/TrendAnalysis';

/**
 * Repository interface for TrendAnalysis persistence operations
 * 
 * @remarks
 * Infrastructure layer must implement this interface.
 * Domain layer depends on this abstraction, not concrete implementations.
 */
export interface ITrendAnalysisRepository {
    /**
     * Save a trend analysis
     */
    save(analysis: TrendAnalysis): Promise<void>;

    /**
     * Find all trend analyses for a symbol
     */
    findBySymbol(symbol: string): Promise<TrendAnalysis[]>;

    /**
     * Find the most recent trend analysis for a symbol
     */
    findLatest(symbol: string): Promise<TrendAnalysis | null>;

    /**
     * Find trend analyses within a time range
     */
    findByTimeRange(
        symbol: string,
        startTime: Date,
        endTime: Date
    ): Promise<TrendAnalysis[]>;

    /**
     * Delete old trend analyses (cleanup)
     */
    deleteOlderThan(cutoffDate: Date): Promise<number>;
}

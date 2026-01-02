/**
 * Symbol Tracking Repository Interface
 * 
 * @fileoverview Repository interface for SymbolTracking entities (Domain Layer)
 * @module domain/repositories/ISymbolTrackingRepository
 */

import { SymbolTracking } from '../entities/SymbolTracking';

/**
 * Repository interface for SymbolTracking persistence operations
 */
export interface ISymbolTrackingRepository {
    /**
     * Add a new symbol to tracking
     */
    add(symbol: string): Promise<void>;

    /**
     * Remove a symbol from tracking
     */
    remove(symbol: string): Promise<void>;

    /**
     * Get all tracked symbols
     */
    getAll(): Promise<SymbolTracking[]>;

    /**
     * Get all active tracked symbols
     */
    getActive(): Promise<SymbolTracking[]>;

    /**
     * Find a specific symbol tracking
     */
    findBySymbol(symbol: string): Promise<SymbolTracking | null>;

    /**
     * Update last analysis timestamp
     */
    updateLastAnalysis(symbol: string, timestamp: Date): Promise<void>;

    /**
     * Deactivate a symbol
     */
    deactivate(symbol: string): Promise<void>;
}

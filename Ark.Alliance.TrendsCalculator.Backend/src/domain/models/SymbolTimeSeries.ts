/**
 * Symbol Time Series Model
 * 
 * @fileoverview Time series data storage for a trading symbol
 * @module domain/models/SymbolTimeSeries
 */

import { PricePoint } from './PricePoint';

/**
 * Time series data for a symbol
 * 
 * @remarks
 * Maintains a circular buffer of price points for continuous analysis.
 * Buffer size determines how much history is kept in memory.
 */
export interface SymbolTimeSeries {
    /** Trading symbol */
    symbol: string;
    /** Circular buffer of price points */
    prices: PricePoint[];
    /** Maximum buffer size */
    maxSize: number;
    /** Last updated timestamp */
    lastUpdate: number;
    /** Total updates received */
    updateCount: number;
}

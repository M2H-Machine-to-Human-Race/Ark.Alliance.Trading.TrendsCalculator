/**
 * Price Point Model
 * 
 * @fileoverview Single price data point for time series storage
 * @module domain/models/PricePoint
 */

/**
 * Price data point with timestamp
 * 
 * @remarks
 * Used for building historical price series for trend analysis.
 */
export interface PricePoint {
    /** Price value */
    price: number;
    /** Timestamp in milliseconds */
    timestamp: number;
}

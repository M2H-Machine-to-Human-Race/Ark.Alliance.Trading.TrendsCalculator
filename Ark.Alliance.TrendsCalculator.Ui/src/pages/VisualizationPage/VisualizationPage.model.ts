/**
 * @fileoverview Visualization Page Data Model
 * @module pages/VisualizationPage/VisualizationPage.model
 * @description
 * Defines TypeScript interfaces for visualization data and chart state.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

/**
 * Available trading symbols for visualization
 * @interface SymbolOption
 * @property {string} value - Symbol value (e.g., 'BTCUSDT')
 * @property {string} label - Display label (e.g., 'BTC/USDT')
 */
export interface SymbolOption {
    value: string;
    label: string;
}

/**
 * Time precision options for chart
 * @type {'1s' | '1m' | '15m'}
 */
export type TimePrecision = '1s' | '1m' | '15m';

/**
 * Complete Visualization Page state model
 * @interface VisualizationPageModel
 * @property {boolean} isLoading - Loading state for async data
 * @property {SymbolOption[]} availableSymbols - List of symbols to visualize
 * @property {string} selectedSymbol - Currently selected symbol
 * @property {TimePrecision} precision - Current time precision
 * @property {any[]} priceData - Data for the TrendPriceChart (e.g., historical prices)
 * @property {any[]} predictions - Prediction data for the chart
 */
export interface VisualizationPageModel {
    isLoading: boolean;
    availableSymbols: SymbolOption[];
    selectedSymbol: string;
    precision: TimePrecision;
    // Data for TrendPriceChart
    priceData: any[]; // Using any temporarily, should ideally match TrendPriceChart model
    predictions: any[];
}

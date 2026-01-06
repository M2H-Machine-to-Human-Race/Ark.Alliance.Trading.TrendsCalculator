/**
 * @fileoverview Visualization Page Data Model
 * @module pages/VisualizationPage/VisualizationPage.model
 * @description
 * Defines TypeScript interfaces for visualization data and chart state.
 * Types align with TrendPriceChart component from ark-alliance-react-ui.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2025-12-27
 */

import { TrendDirection } from '@share/trends';

/**
 * Real-time price point for TrendPriceChart
 * @interface RealTimePricePoint
 */
export interface RealTimePricePoint {
    index: number;
    price: number;
    timestamp: number;
    volume?: number;
}

/**
 * Trend prediction overlay for TrendPriceChart
 * Uses shared TrendDirection enum for consistency across frontend/backend
 * @interface TrendPrediction
 */
export interface TrendPrediction {
    id: string;
    timestamp: number;
    priceAtPrediction: number;
    direction: TrendDirection;
    compositeScore: number;
    confidence: number;
    isValidated?: boolean;
    priceAtValidation?: number;
    actualDirection?: TrendDirection;
    isCorrect?: boolean;
    showHorizon?: boolean;
    horizonMs?: number;
}

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
 * @property {RealTimePricePoint[]} priceData - Data for the TrendPriceChart
 * @property {TrendPrediction[]} predictions - Prediction data for the chart
 */
export interface VisualizationPageModel {
    isLoading: boolean;
    availableSymbols: SymbolOption[];
    selectedSymbol: string;
    precision: TimePrecision;
    /** Real-time price data points for TrendPriceChart */
    priceData: RealTimePricePoint[];
    /** Trend predictions with validation state */
    predictions: TrendPrediction[];
}

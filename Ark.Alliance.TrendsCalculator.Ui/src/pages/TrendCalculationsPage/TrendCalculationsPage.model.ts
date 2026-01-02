/**
 * @fileoverview Trend Calculations Page Data Model
 * @module pages/TrendCalculationsPage/model
 */

export interface TrendCalculation {
    id: string;
    symbol: string;
    direction: 'LONG' | 'SHORT' | 'WAIT';
    confidence: number;
    score: number;
    actualOutcome: 'LONG' | 'SHORT' | 'WAIT' | null;
    match: boolean | null;
    timestamp: number;
    formattedTime: string;
}

export interface CalculationStats {
    totalCalculations: number;
    correctPredictions: number;
    incorrectPredictions: number;
    pendingVerification: number;
    accuracy: number;
    avgConfidence: number;
}

export interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

export interface FilterConfig {
    symbol: string;
    direction: string;
    matchStatus: string;
    minConfidence: string;
}

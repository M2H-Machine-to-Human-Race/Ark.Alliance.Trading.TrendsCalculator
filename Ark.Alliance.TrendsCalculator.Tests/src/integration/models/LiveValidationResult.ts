/**
 * Live Market Validation Test Result Model
 * 
 * @fileoverview Data structure for live validation test results
 * @module integration/models/LiveValidationResult
 */

/**
 * Single symbol validation result
 */
export interface SymbolValidationResult {
    /** Symbol name */
    symbol: string;
    /** Market cap rank */
    rank: number;
    /** Predicted trend from first 15s */
    predictedTrend: {
        direction: 'LONG' | 'SHORT' | 'WAIT';
        confidence: number;
        compositeScore: number;
        slope: number;
        hurst: number;
        volatilityRegime: string;
    };
    /** Actual trend from last 15s */
    actualTrend: {
        direction: 'LONG' | 'SHORT' | 'WAIT';
        priceChangePercent: number;
    };
    /** Was prediction correct? */
    correct: boolean;
    /** Time series data (30 seconds) */
    timeSeries: Array<{
        timestamp: number;
        price: number;
        phase: 'training' | 'validation';
    }>;
}

/**
 * Complete live validation test results
 */
export interface LiveValidationTestResult {
    /** Test execution timestamp */
    timestamp: number;
    /** Test duration in milliseconds */
    durationMs: number;
    /** Total symbols tested */
    totalSymbols: number;
    /** Correct predictions */
    correctPredictions: number;
    /** Accuracy percentage */
    accuracyPercent: number;
    /** Test passed (>= 70% accuracy) */
    passed: boolean;
    /** Individual symbol results */
    symbols: SymbolValidationResult[];
    /** Configuration used */
    config: {
        trainingDurationSeconds: number;
        validationDurationSeconds: number;
        helpers: string[];
    };
}




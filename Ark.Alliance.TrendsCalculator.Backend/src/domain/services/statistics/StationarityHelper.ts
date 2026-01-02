/**
 * @fileoverview Stationarity Helper
 * @module helpers/statistics/StationarityHelper
 * 
 * Tests for stationarity in time series data and provides transformations.
 * 
 * @reference Docs/Math/Stationarity_ADF_Testing.md
 * @criticality CRITICAL
 * 
 * Key Concepts:
 * - Financial price data is non-stationary by nature
 * - Applying regression to non-stationary data produces spurious results
 * - Transform to log returns for stationarity
 * - Quick variance ratio test for practical checking
 */

export interface StationarityTestResult {
    isStationary: boolean;
    varianceRatio: number;
    meanDifference: number;
    recommendation: 'USE_PRICES' | 'USE_RETURNS' | 'USE_DIFFERENCING';
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class StationarityHelper {
    /**
     * Transform prices to log returns
     * Formula: r(t) = ln(P(t) / P(t-1))
     * 
     * Advantages:
     * - Often stationary even when prices are not
     * - Symmetric: +10% and -10% are equal magnitudes
     * - Additive: r₁ + r₂ = r(cumulative)
     * 
     * @param prices - Array of price values
     * @returns Array of log returns (length = prices.length - 1)
     */
    toLogReturns(prices: number[]): number[] {
        if (prices.length < 2) {
            return [];
        }

        return prices.slice(1).map((p, i) => {
            if (prices[i] <= 0 || p <= 0) {
                throw new Error('Log returns require positive prices');
            }
            return Math.log(p / prices[i]);
        });
    }

    /**
     * First-order differencing
     * Formula: ΔP(t) = P(t) - P(t-1)
     * 
     * Use when log returns are still non-stationary (rare).
     * 
     * @param data - Time series data
     * @param order - Order of differencing (default: 1)
     * @returns Differenced series
     */
    difference(data: number[], order: number = 1): number[] {
        if (order < 1 || order > 3) {
            throw new Error('Differencing order must be between 1 and 3');
        }

        let result = [...data];

        for (let d = 0; d < order; d++) {
            if (result.length < 2) {
                return [];
            }
            result = result.slice(1).map((v, i) => v - result[i]);
        }

        return result;
    }

    /**
     * Simplified stationarity check using variance ratio
     * 
     * Full ADF test requires statistical libraries. This quick check:
     * 1. Splits data into two halves
     * 2. Compares variance and mean of each half
     * 3. Stationary if variance ratio ∈ [0.5, 2.0] and mean difference < 10%
     * 
     * @param data - Time series data to test
     * @returns True if likely stationary
     */
    quickStationarityCheck(data: number[]): boolean {
        if (data.length < 20) {
            return false; // Need minimum data for meaningful test
        }

        const n = data.length;
        const half = Math.floor(n / 2);

        const firstHalf = data.slice(0, half);
        const secondHalf = data.slice(half);

        const var1 = this.variance(firstHalf);
        const var2 = this.variance(secondHalf);
        const mean1 = this.mean(firstHalf);
        const mean2 = this.mean(secondHalf);

        // Check if variance and mean are relatively stable
        const varRatio = var1 / var2;
        const meanDiff = Math.abs(mean1 - mean2) / Math.max(Math.abs(mean1), Math.abs(mean2), 1e-10);

        return varRatio > 0.5 && varRatio < 2.0 && meanDiff < 0.1;
    }

    /**
     * Full stationarity test with detailed results
     * 
     * @param data - Time series data to test
     * @returns Detailed test results with recommendations
     */
    testStationarity(data: number[]): StationarityTestResult {
        if (data.length < 20) {
            return {
                isStationary: false,
                varianceRatio: 0,
                meanDifference: 0,
                recommendation: 'USE_RETURNS',
                confidenceLevel: 'LOW'
            };
        }

        const n = data.length;
        const half = Math.floor(n / 2);

        const firstHalf = data.slice(0, half);
        const secondHalf = data.slice(half);

        const var1 = this.variance(firstHalf);
        const var2 = this.variance(secondHalf);
        const mean1 = this.mean(firstHalf);
        const mean2 = this.mean(secondHalf);

        const varRatio = var1 / var2;
        const meanDiff = Math.abs(mean1 - mean2) / Math.max(Math.abs(mean1), Math.abs(mean2), 1e-10);

        // Determine stationarity
        const isStationary = varRatio > 0.5 && varRatio < 2.0 && meanDiff < 0.1;

        // Determine confidence level
        let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (varRatio > 0.7 && varRatio < 1.4 && meanDiff < 0.05) {
            confidenceLevel = 'HIGH';
        } else if (varRatio > 0.6 && varRatio < 1.7 && meanDiff < 0.08) {
            confidenceLevel = 'MEDIUM';
        }

        // Determine recommendation
        let recommendation: 'USE_PRICES' | 'USE_RETURNS' | 'USE_DIFFERENCING' = 'USE_RETURNS';
        if (isStationary && confidenceLevel === 'HIGH') {
            recommendation = 'USE_PRICES';
        } else if (!isStationary || varRatio > 2.5 || varRatio < 0.4) {
            recommendation = 'USE_DIFFERENCING';
        }

        return {
            isStationary,
            varianceRatio: varRatio,
            meanDifference: meanDiff,
            recommendation,
            confidenceLevel
        };
    }

    /**
     * Calculate mean of array
     */
    private mean(data: number[]): number {
        if (data.length === 0) return 0;
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }

    /**
     * Calculate variance of array
     */
    private variance(data: number[]): number {
        if (data.length < 2) return 0;

        const m = this.mean(data);
        const squaredDiffs = data.map(val => Math.pow(val - m, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / (data.length - 1);
    }

    /**
     * Calculate standard deviation
     */
    standardDeviation(data: number[]): number {
        return Math.sqrt(this.variance(data));
    }
}

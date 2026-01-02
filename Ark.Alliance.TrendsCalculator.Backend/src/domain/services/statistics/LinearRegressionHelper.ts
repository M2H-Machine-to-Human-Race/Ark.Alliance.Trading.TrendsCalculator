/**
 * @fileoverview Linear Regression Helper
 * @module helpers/statistics/LinearRegressionHelper
 * 
 * Enhanced linear regression with autocorrelation detection and R² adjustment.
 * 
 * @reference Docs/Math/Stationarity_ADF_Testing.md
 * @reference Docs/Math/Autocorrelation_Testing.md
 */

import { AutocorrelationHelper, AutocorrelationTestResult } from './AutocorrelationHelper';

export interface RegressionResult {
    slope: number;
    intercept: number;
    rSquared: number;
    adjustedRSquared: number;
    residuals: number[];
    predictions: number[];
    autocorrelation: AutocorrelationTestResult;
}

export class LinearRegressionHelper {
    private autocorrHelper: AutocorrelationHelper;

    constructor() {
        this.autocorrHelper = new AutocorrelationHelper();
    }

    /**
     * Calculate linear regression with full validation
     * Automatically tests for autocorrelation and adjusts R² if needed
     * 
     * @param prices - Time series data
     * @returns Complete regression results with autocorrelation adjustment
     */
    calculate(prices: number[]): RegressionResult {
        if (prices.length < 3) {
            throw new Error('Insufficient data for regression (minimum 3 points required)');
        }

        // 1. Perform basic regression
        const { slope, intercept, rSquared } = this.basicRegression(prices);

        // 2. Calculate predictions and residuals
        const predictions = prices.map((_, i) => slope * i + intercept);
        const residuals = prices.map((p, i) => p - predictions[i]);

        // 3. Test for autocorrelation
        const autocorrTest = this.autocorrHelper.hasSignificantAutocorrelation(residuals);

        // 4. Adjust R² if autocorrelation detected
        let adjustedRSquared = rSquared;
        if (autocorrTest.hasAutocorrelation) {
            adjustedRSquared = this.autocorrHelper.adjustRSquaredForAutocorrelation(
                rSquared,
                autocorrTest.durbinWatson,
                prices.length
            );

            console.warn(
                `[LinearRegression] Autocorrelation detected (DW=${autocorrTest.durbinWatson.toFixed(2)}, ` +
                `severity=${autocorrTest.severity}). R² adjusted: ${rSquared.toFixed(3)} → ${adjustedRSquared.toFixed(3)}`
            );
        }

        return {
            slope,
            intercept,
            rSquared,
            adjustedRSquared,
            residuals,
            predictions,
            autocorrelation: autocorrTest
        };
    }

    /**
     * Basic linear regression calculation
     * Uses least squares method
     * 
     * @param prices - Time series data (y-values)
     * @returns Slope, intercept, and R²
     */
    private basicRegression(prices: number[]): {
        slope: number;
        intercept: number;
        rSquared: number;
    } {
        const n = prices.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        let sumY2 = 0;

        // X values are indices (0, 1, 2, ...)
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += prices[i];
            sumXY += i * prices[i];
            sumX2 += i * i;
            sumY2 += prices[i] * prices[i];
        }

        // Calculate slope and intercept
        const denominator = n * sumX2 - sumX * sumX;
        if (denominator === 0) {
            return { slope: 0, intercept: sumY / n, rSquared: 0 };
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R² (coefficient of determination)
        const yMean = sumY / n;
        let ssTotal = 0;
        let ssResidual = 0;

        for (let i = 0; i < n; i++) {
            const predicted = slope * i + intercept;
            ssTotal += Math.pow(prices[i] - yMean, 2);
            ssResidual += Math.pow(prices[i] - predicted, 2);
        }

        const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

        return {
            slope,
            intercept,
            rSquared: Math.max(0, Math.min(1, rSquared))
        };
    }

    /**
     * Get normalized slope (slope relative to average price)
     * Useful for comparing trends across different price levels
     * 
     * @param prices - Time series data
     * @returns Normalized slope value
     */
    getSlopeNormalized(prices: number[]): number {
        const { slope } = this.basicRegression(prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        if (avgPrice === 0) return 0;

        return slope / avgPrice;
    }
}

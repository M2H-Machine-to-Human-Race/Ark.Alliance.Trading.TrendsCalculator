/**
 * GARCH Volatility Helper
 * 
 * @fileoverview GARCH(1,1) volatility modeling for cryptocurrency markets.
 * Captures volatility clustering - high volatility periods followed by high volatility.
 * 
 * @module helpers/volatility/GARCHHelper
 * @see {@link ../../../../Analysis/TrendsMicroService_Analysis.md}
 * @criticality MEDIUM
 * 
 * @remarks
 * GARCH (Generalized Autoregressive Conditional Heteroscedasticity) Model:
 * σ²(t) = ω + α × ε²(t-1) + β × σ²(t-1)
 * 
 * Where:
 * - ω (omega): Long-term variance constant (> 0)
 * - α (alpha): ARCH coefficient - shock impact (0.05 - 0.15)
 * - β (beta): GARCH coefficient - persistence (0.80 - 0.95)
 * - Constraint: α + β < 1 for stationarity
 * 
 * Interpretation:
 * - α + β close to 1: Very persistent volatility (long memory)
 * - α high: Reactive to recent shocks
 * - β high: Persistent volatility trends
 */

import { VolatilityClassification } from '@share/enums';

/**
 * GARCH model parameters
 */
export interface GARCHParams {
    /** Long-term variance constant (ω) */
    omega: number;
    /** ARCH coefficient (α) - shock impact */
    alpha: number;
    /** GARCH coefficient (β) - persistence */
    beta: number;
}

/**
 * Volatility regime classification - using VolatilityClassification from Share
 */
export type VolatilityRegime = VolatilityClassification;

/**
 * GARCH forecast result
 */
export interface GARCHForecast {
    /** Forecasted volatilities */
    volatilities: number[];
    /** Forecast horizon */
    horizon: number;
    /** Parameters used */
    params: GARCHParams;
}

/**
 * GARCH(1,1) Volatility Helper
 * 
 * @remarks
 * Simplified implementation for practical trading use.
 * Production systems should use Maximum Likelihood Estimation (MLE) for parameter estimation.
 * 
 * @example
 * ```typescript
 * const garch = new GARCHHelper();
 * const returns = calculateLogReturns(prices);
 * 
 * // Estimate parameters
 * const params = garch.estimateParameters(returns);
 * console.log(`Persistence: ${(params.alpha + params.beta).toFixed(3)}`);
 * 
 * // Forecast volatility
 * const forecast = garch.forecastVolatility(params, returns, 5);
 * console.log(`5-day volatility forecast: ${forecast.volatilities}`);
 * 
 * // Classify regime
 * const regime = garch.classifyVolatilityRegime(currentVol, historicalVol);
 * ```
 */
export class GARCHHelper {
    /**
     * Estimate GARCH(1,1) parameters from return data
     * 
     * @param returns - Array of log returns
     * @returns Estimated GARCH parameters
     * 
     * @throws {Error} If returns array is too short (< 30)
     * 
     * @remarks
     * Uses simplified estimation based on typical crypto market values.
     * Production implementation should use Maximum Likelihood Estimation (MLE).
     * 
     * Typical values for crypto:
     * - ω: 5% of sample variance
     * - α: 0.10 (shocks matter but not dominate)
     * - β: 0.85 (high persistence)
     * - α + β ≈ 0.95 (very persistent volatility)
     * 
     * @example
     * ```typescript
     * const helper = new GARCHHelper();
     * const params = helper.estimateParameters(returns);
     * // Returns: { omega: 0.0001, alpha: 0.10, beta: 0.85 }
     * ```
     */
    estimateParameters(returns: number[]): GARCHParams {
        if (returns.length < 30) {
            throw new Error('Insufficient data for GARCH estimation (minimum 30 returns required)');
        }

        const variance = this.variance(returns);

        // Simplified initial estimates based on typical crypto values
        const omega = variance * 0.05; // 5% of sample variance
        const alpha = 0.10; // Moderate shock sensitivity
        const beta = 0.85; // High persistence

        // Validate constraint: α + β < 1
        if (alpha + beta >= 1) {
            throw new Error('GARCH constraint violation: α + β must be < 1 for stationarity');
        }

        return { omega, alpha, beta };
    }

    /**
     * Forecast conditional volatility for future periods
     * 
     * @param params - GARCH parameters
     * @param returns - Historical log returns
     * @param horizon - Number of periods to forecast
     * @returns Volatility forecast
     * 
     * @remarks
     * One-step ahead forecast: σ²(t+1) = ω + α × ε²(t) + β × σ²(t)
     * Multi-step forecast: Mean-reverting to long-term variance
     * Long-term variance = ω / (1 - α - β)
     * 
     * @example
     * ```typescript
     * const params = { omega: 0.0001, alpha: 0.10, beta: 0.85 };
     * const forecast = helper.forecastVolatility(params, returns, 10);
     * console.log(`10-day forecast: ${forecast.volatilities}`);
     * ```
     */
    forecastVolatility(
        params: GARCHParams,
        returns: number[],
        horizon: number
    ): GARCHForecast {
        const { omega, alpha, beta } = params;
        const forecasts: number[] = [];

        // Current conditional variance estimate
        let sigma2 = this.variance(returns);
        const lastReturn = returns[returns.length - 1];
        const lastShock2 = lastReturn * lastReturn;

        for (let h = 1; h <= horizon; h++) {
            if (h === 1) {
                // One-step ahead: Use actual last shock
                sigma2 = omega + alpha * lastShock2 + beta * sigma2;
            } else {
                // Multi-step: Mean-reverting forecast
                const longTermVar = omega / (1 - alpha - beta);
                sigma2 = longTermVar + Math.pow(alpha + beta, h - 1) * (sigma2 - longTermVar);
            }
            forecasts.push(Math.sqrt(sigma2)); // Convert variance to volatility
        }

        return {
            volatilities: forecasts,
            horizon,
            params
        };
    }

    /**
     * Calculate historical conditional volatility series
     * 
     * @param returns - Historical log returns
     * @param params - GARCH parameters
     * @returns Array of conditional volatilities
     * 
     * @remarks
     * Applies GARCH model to historical data to estimate time-varying volatility.
     * Useful for visualizing volatility clustering and regime changes.
     * 
     * @example
     * ```typescript
     * const params = helper.estimateParameters(returns);
     * const volSeries = helper.calculateConditionalVolatility(returns, params);
     * // Plot volSeries to visualize volatility clustering
     * ```
     */
    calculateConditionalVolatility(
        returns: number[],
        params: GARCHParams
    ): number[] {
        const { omega, alpha, beta } = params;
        const volatilities: number[] = [];

        // Initialize with unconditional variance
        let sigma2 = this.variance(returns);

        for (let t = 0; t < returns.length; t++) {
            volatilities.push(Math.sqrt(sigma2));

            if (t < returns.length - 1) {
                const shock2 = returns[t] * returns[t];
                sigma2 = omega + alpha * shock2 + beta * sigma2;
            }
        }

        return volatilities;
    }

    /**
     * Classify current volatility regime using z-score
     * 
     * @param currentVol - Current volatility level
     * @param historicalVol - Historical volatility series
     * @returns Volatility regime classification
     * 
     * @remarks
     * Classification based on z-score (standard deviations from mean):
     * - LOW: z < -1 (more than 1σ below average)
     * - NORMAL: -1 ≤ z ≤ 1
     * - HIGH: 1 < z ≤ 2
     * - EXTREME: z > 2 (more than 2σ above average)
     * 
     * @example
     * ```typescript
     * const regime = helper.classifyVolatilityRegime(0.03, historicalVols);
     * if (regime === 'EXTREME') {
     *     console.log('Reduce position sizes - extreme volatility!');
     * }
     * ```
     */
    classifyVolatilityRegime(
        currentVol: number,
        historicalVol: number[]
    ): VolatilityRegime {
        const mean = this.mean(historicalVol);
        const std = this.stdDev(historicalVol);

        const zScore = (currentVol - mean) / std;

        if (zScore < -1) return VolatilityClassification.LOW;
        if (zScore > 2) return VolatilityClassification.EXTREME;
        if (zScore > 1) return VolatilityClassification.HIGH;
        return VolatilityClassification.NORMAL;
    }

    /**
     * Calculate variance of returns
     * 
     * @param returns - Array of returns
     * @returns Sample variance
     * 
     * @private
     */
    private variance(returns: number[]): number {
        if (returns.length < 2) return 0;

        const mean = this.mean(returns);
        const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / (returns.length - 1);
    }

    /**
     * Calculate mean of array
     * 
     * @param values - Array of numbers
     * @returns Mean value
     * 
     * @private
     */
    private mean(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calculate standard deviation
     * 
     * @param values - Array of numbers
     * @returns Standard deviation
     * 
     * @private
     */
    private stdDev(values: number[]): number {
        return Math.sqrt(this.variance(values));
    }
}

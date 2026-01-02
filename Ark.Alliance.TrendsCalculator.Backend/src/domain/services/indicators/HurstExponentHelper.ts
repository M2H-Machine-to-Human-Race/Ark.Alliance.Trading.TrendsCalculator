/**
 * Hurst Exponent Calculator
 * 
 * @fileoverview Calculates the Hurst exponent to determine if a time series is trending,
 * mean-reverting, or behaving like a random walk. Uses Rescaled Range (R/S) analysis.
 * 
 * @module helpers/indicators/HurstExponentHelper
 * @see {@link ../../../../Analysis/TrendsMicroService_Analysis.md}
 * @criticality HIGH
 * 
 * @remarks
 * The Hurst Exponent (H) measures long-term memory in time series:
 * - H < 0.5: Mean-Reverting (Anti-Persistent) - Range trading strategies
 * - H ≈ 0.5: Random Walk - Difficult to predict
 * - H > 0.5: Trending (Persistent) - Trend-following strategies
 * 
 * Hurst is superior to R² for oscillation detection because:
 * - Provides continuous measure [0, 1] instead of binary decision
 * - Uses statistical properties instead of arbitrary thresholds
 * - Scale-invariant (not buffer-size dependent)
 * - Gives confidence level for trading decisions
 */

import { HurstBehavior, StrategyType } from '@share/enums';

/**
 * Re-export HurstBehavior from Share for backward compatibility.
 * 
 * @see {@link @share/enums/HurstBehavior}
 */
export { HurstBehavior };

/**
 * Re-export StrategyType from Share for backward compatibility.
 * 
 * @see {@link @share/enums/StrategyType}
 */
export { StrategyType };

/**
 * Hurst exponent interpretation result
 */
export interface HurstInterpretation {
    /** Classified market behavior */
    behavior: HurstBehavior;
    /** Confidence level [0, 1] - distance from 0.5 */
    confidence: number;
    /** Recommended strategy type */
    strategyType: StrategyType;
    /** Whether conditions are favorable for trading */
    shouldTrade: boolean;
    /** Human-readable description */
    description: string;
}

/**
 * Complete Hurst exponent calculation result
 */
export interface HurstResult {
    /** Calculated Hurst exponent [0, 1] */
    exponent: number;
    /** Interpretation of the exponent */
    interpretation: HurstInterpretation;
    /** R/S values for each lag period */
    rsValues: number[];
    /** Lag periods used in calculation */
    lags: number[];
}

/**
 * Hurst Exponent Calculator using Rescaled Range (R/S) Analysis
 * 
 * @remarks
 * Implementation follows the R/S methodology:
 * 1. Convert prices to log returns
 * 2. For multiple lag periods (10, 20, 30, 50, 100):
 *    - Divide returns into chunks
 *    - Calculate Range and Standard Deviation for each chunk
 *    - Compute R/S ratio
 * 3. Plot log(R/S) vs log(lag)
 * 4. Slope of regression line = Hurst Exponent
 * 
 * @example
 * ```typescript
 * const calculator = new HurstExponentCalculator();
 * const prices = [100, 101, 102, 101, 100, 99, 100, 101, 102, ...];
 * const result = calculator.calculate(prices);
 * 
 * if (result.interpretation.behavior === 'TRENDING') {
 *     console.log('Use trend-following strategy');
 * } else if (result.interpretation.behavior === 'MEAN_REVERTING') {
 *     console.log('Use range-trading strategy');
 * }
 * ```
 */
export class HurstExponentCalculator {
    /**
     * Default lag periods for R/S analysis
     * Selected to provide good coverage across time scales
     * @private
     */
    private readonly DEFAULT_LAGS = [10, 20, 30, 50, 100];

    /**
     * Calculate Hurst exponent using Rescaled Range (R/S) analysis
     * 
     * @param prices - Array of price values (must be positive)
     * @returns Complete Hurst calculation result with interpretation
     * 
     * @throws {Error} If prices array is too short (< 100 points recommended)
     * @throws {Error} If prices contain non-positive values
     * 
     * @remarks
     * Minimum data requirements:
     * - At least 100 data points recommended for reliable results
     * - At least 50 points minimum for calculation
     * - Prices must be positive (for log returns)
     * 
     * @example
     * ```typescript
     * const calculator = new HurstExponentCalculator();
     * const prices = getPriceHistory(); // Array of 200+ prices
     * const result = calculator.calculate(prices);
     * 
     * console.log(`Hurst: ${result.exponent.toFixed(3)}`);
     * console.log(`Behavior: ${result.interpretation.behavior}`);
     * console.log(`Confidence: ${(result.interpretation.confidence * 100).toFixed(1)}%`);
     * ```
     */
    calculate(prices: number[]): HurstResult {
        // Validate input
        if (prices.some(p => p <= 0)) {
            throw new Error('Hurst calculation requires positive prices');
        }

        // Convert to log returns
        const returns = this.toLogReturns(prices);
        const n = returns.length;

        // Determine usable lags (must have at least 2 chunks per lag)
        const lags = this.DEFAULT_LAGS.filter(l => l < n / 2);

        if (lags.length < 2) {
            // Not enough data, return random walk assumption
            return {
                exponent: 0.5,
                interpretation: this.interpret(0.5),
                rsValues: [],
                lags: []
            };
        }

        const rsValues: number[] = [];

        // Calculate R/S for each lag period
        for (const lag of lags) {
            const chunks = Math.floor(n / lag);
            let rsSum = 0;

            for (let i = 0; i < chunks; i++) {
                const chunk = returns.slice(i * lag, (i + 1) * lag);
                const rs = this.calculateRescaledRange(chunk);
                rsSum += rs;
            }

            rsValues.push(rsSum / chunks);
        }

        // Linear regression of log(R/S) vs log(lag)
        const logLags = lags.map(l => Math.log(l));
        const logRS = rsValues.map(rs => Math.log(Math.max(rs, 0.0001)));

        const hurst = this.linearRegressionSlope(logLags, logRS);

        // Clamp to valid range [0, 1]
        const clampedHurst = Math.max(0, Math.min(1, hurst));

        return {
            exponent: clampedHurst,
            interpretation: this.interpret(clampedHurst),
            rsValues,
            lags
        };
    }

    /**
     * Interpret Hurst exponent for trading decisions
     * 
     * @param hurst - Hurst exponent value [0, 1]
     * @returns Detailed interpretation with trading recommendations
     * 
     * @remarks
     * Interpretation thresholds:
     * - H < 0.35: Strong mean reversion
     * - 0.35 ≤ H < 0.45: Mild mean reversion
     * - 0.45 ≤ H ≤ 0.55: Random walk (neutral)
     * - 0.55 < H ≤ 0.65: Mild trending
     * - H > 0.65: Strong trending
     * 
     * @example
     * ```typescript
     * const calc = new HurstExponentCalculator();
     * const interpretation = calc.interpret(0.38);
     * // Returns: { behavior: 'MEAN_REVERTING', strategyType: 'RANGE_TRADING', ... }
     * ```
     */
    interpret(hurst: number): HurstInterpretation {
        if (hurst < 0.45) {
            // Mean-reverting behavior
            const confidence = (0.5 - hurst) * 2; // 0 at H=0.5, 1 at H=0
            const shouldTrade = hurst < 0.35; // Strong mean reversion

            return {
                behavior: HurstBehavior.MEAN_REVERTING,
                confidence,
                strategyType: StrategyType.RANGE_TRADING,
                shouldTrade,
                description: shouldTrade
                    ? `Strong mean reversion (H=${hurst.toFixed(3)}). Favorable for range trading.`
                    : `Mild mean reversion (H=${hurst.toFixed(3)}). Cautious range trading.`
            };
        } else if (hurst > 0.55) {
            // Trending behavior
            const confidence = (hurst - 0.5) * 2; // 0 at H=0.5, 1 at H=1
            const shouldTrade = hurst > 0.65; // Strong trending

            return {
                behavior: HurstBehavior.TRENDING,
                confidence,
                strategyType: StrategyType.TREND_FOLLOWING,
                shouldTrade,
                description: shouldTrade
                    ? `Strong trending (H=${hurst.toFixed(3)}). Favorable for trend-following.`
                    : `Mild trending (H=${hurst.toFixed(3)}). Conservative trend-following.`
            };
        } else {
            // Random walk
            return {
                behavior: HurstBehavior.RANDOM_WALK,
                confidence: 0, // Low confidence in any strategy
                strategyType: StrategyType.NEUTRAL,
                shouldTrade: false,
                description: `Random walk behavior (H=${hurst.toFixed(3)}). Avoid trading or use neutral strategies.`
            };
        }
    }

    /**
     * Convert prices to log returns
     * 
     * @param prices - Array of price values
     * @returns Array of log returns (length = prices.length - 1)
     * 
     * @private
     * @remarks Formula: r(t) = ln(P(t) / P(t-1))
     */
    private toLogReturns(prices: number[]): number[] {
        return prices.slice(1).map((p, i) => Math.log(p / prices[i]));
    }

    /**
     * Calculate Rescaled Range (R/S) for a data chunk
     * 
     * @param data - Data chunk (typically log returns)
     * @returns R/S ratio (Range / Standard Deviation)
     * 
     * @private
     * @remarks
     * Steps:
     * 1. Calculate mean of chunk
     * 2. Calculate cumulative deviations from mean
     * 3. Range = max(cumulative) - min(cumulative)
     * 4. Calculate standard deviation
     * 5. Return Range / StdDev
     */
    private calculateRescaledRange(data: number[]): number {
        if (data.length === 0) return 0;

        const mean = data.reduce((a, b) => a + b, 0) / data.length;

        // Cumulative deviations from mean
        const cumulative: number[] = [];
        let sum = 0;
        for (const value of data) {
            sum += value - mean;
            cumulative.push(sum);
        }

        // Calculate range
        const range = Math.max(...cumulative) - Math.min(...cumulative);

        // Calculate standard deviation
        const variance = data.reduce((s, value) =>
            s + Math.pow(value - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);

        // Return R/S ratio
        return stdDev > 0 ? range / stdDev : 0;
    }

    /**
     * Calculate slope of linear regression line
     * 
     * @param x - X values
     * @param y - Y values
     * @returns Slope of regression line
     * 
     * @private
     * @remarks Used to find Hurst exponent from log(R/S) vs log(lag) relationship
     */
    private linearRegressionSlope(x: number[], y: number[]): number {
        if (x.length !== y.length || x.length === 0) return 0;

        const n = x.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;

        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
        }

        const denominator = n * sumX2 - sumX * sumX;
        if (denominator === 0) return 0;

        return (n * sumXY - sumX * sumY) / denominator;
    }
}

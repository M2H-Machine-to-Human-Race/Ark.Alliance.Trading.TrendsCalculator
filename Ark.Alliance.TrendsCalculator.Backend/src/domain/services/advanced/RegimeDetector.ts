/**
 * Market Regime Detector
 * 
 * @fileoverview Detects market regimes (trending, ranging, high volatility) for adaptive strategy selection.
 * 
 * @module helpers/advanced/RegimeDetector
 * @see {@link ../../../../Analysis/TrendsMicroService_Analysis.md}
 * @criticality MEDIUM
 * 
 * @remarks
 * Markets operate in different regimes (trending, ranging, volatile).
 * Strategies that work in one regime often fail in another.
 * Regime detection allows adaptive strategy selection.
 * 
 * Regime Types:
 * - TRENDING_UP: H > 0.5, positive momentum → Aggressive long bias
 * - TRENDING_DOWN: H > 0.5, negative momentum → Aggressive short bias
 * - RANGING: H < 0.5, low volatility → Mean reversion, reduce size
 * - HIGH_VOLATILITY: Vol > 2σ historical → Wider stops, smaller positions
 */

import { HurstExponentCalculator } from '../indicators/HurstExponentHelper';

/**
 * Market regime types
 */
export type RegimeType = 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'HIGH_VOLATILITY';

/**
 * Market regime detection result
 */
export interface MarketRegime {
    /** Detected regime type */
    type: RegimeType;
    /** Confidence probability [0, 1] */
    probability: number;
    /** Hurst exponent value */
    hurst?: number;
    /** Momentum score */
    momentum?: number;
    /** Volatility value */
    volatility?: number;
    /** All calculated indicators */
    indicators?: RegimeIndicators;
}

/**
 * Comprehensive regime indicators
 */
export interface RegimeIndicators {
    /** Hurst exponent [0, 1] */
    hurst: number;
    /** R² from linear regression [0, 1] */
    rSquared: number;
    /** Volatility z-score */
    volatilityZScore: number;
    /** Momentum score [-1, 1] */
    momentumScore: number;
    /** Direction change ratio [0, 1] */
    directionChangeRatio: number;
}

/**
 * Simple Regime Detector using Hurst Exponent
 * 
 * @remarks
 * Quick and efficient regime detection based primarily on Hurst exponent.
 * Suitable for real-time trading decisions.
 * 
 * @example
 * ```typescript
 * const detector = new SimpleRegimeDetector();
 * const regime = detector.detect(prices);
 * 
 * if (regime.type === 'HIGH_VOLATILITY') {
 *     console.log('Reduce position sizes');
 * } else if (regime.type === 'TRENDING_UP') {
 *     console.log('Use trend-following strategy');
 * }
 * ```
 */
export class SimpleRegimeDetector {
    private hurstCalculator: HurstExponentCalculator;

    constructor() {
        this.hurstCalculator = new HurstExponentCalculator();
    }

    /**
     * Detect market regime from price data
     * 
     * @param prices - Historical price data
     * @param historicalVolatility - Optional historical volatility for comparison
     * @returns Market regime with confidence
     * 
     * @throws {Error} If prices array is too short (< 100)
     * 
     * @remarks
     * Detection priority:
     * 1. High volatility (overrides other regimes)
     * 2. Trending (H > 0.55)
     * 3. Ranging (H ≤ 0.55)
     * 
     * @example
     * ```typescript
     * const detector = new SimpleRegimeDetector();
     * const regime = detector.detect(prices, historicalVols);
     * console.log(`Regime: ${regime.type}, Confidence: ${regime.probability.toFixed(2)}`);
     * ```
     */
    detect(prices: number[], historicalVolatility?: number[]): MarketRegime {
        if (prices.length < 100) {
            throw new Error('Insufficient data for regime detection (minimum 100 prices required)');
        }

        const hurstResult = this.hurstCalculator.calculate(prices);
        const hurst = hurstResult.exponent;
        const momentum = this.calculateMomentum(prices);
        const volatility = this.calculateVolatility(prices);

        // Check for high volatility regime
        if (historicalVolatility && historicalVolatility.length > 0) {
            const historicalMean = this.mean(historicalVolatility);

            if (volatility > historicalMean * 2) {
                return {
                    type: 'HIGH_VOLATILITY',
                    probability: 0.8,
                    hurst,
                    volatility
                };
            }
        }

        // Trending regime
        if (hurst > 0.55) {
            return {
                type: momentum > 0 ? 'TRENDING_UP' : 'TRENDING_DOWN',
                probability: (hurst - 0.5) * 2, // Scale to [0, 1]
                hurst,
                momentum
            };
        }

        // Ranging regime
        return {
            type: 'RANGING',
            probability: (0.5 - hurst) * 2,
            hurst
        };
    }

    /**
     * Calculate momentum score from prices
     * 
     * @param prices - Price array
     * @returns Momentum score [-1, 1]
     * 
     * @private
     * @remarks Simple momentum: (final - initial) / initial
     */
    private calculateMomentum(prices: number[]): number {
        const window = Math.min(30, prices.length);
        const recent = prices.slice(-window);
        return (recent[recent.length - 1] - recent[0]) / recent[0];
    }

    /**
     * Calculate recent volatility
     * 
     * @param prices - Price array
     * @returns Volatility (standard deviation of returns)
     * 
     * @private
     */
    private calculateVolatility(prices: number[]): number {
        const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
        return this.stdDev(returns);
    }

    /**
     * Calculate mean
     * @private
     */
    private mean(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * Calculate standard deviation
     * @private
     */
    private stdDev(values: number[]): number {
        if (values.length < 2) return 0;
        const mean = this.mean(values);
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
        return Math.sqrt(variance);
    }
}

/**
 * Multi-Factor Regime Detector
 * 
 * @remarks
 * More sophisticated regime detection combining multiple indicators.
 * Provides higher accuracy but requires more computation.
 * Recommended for backtesting and strategy optimization.
 * 
 * @example
 * ```typescript
 * const detector = new MultiFactorRegimeDetector();
 * const regime = detector.detect(prices);
 * console.log(`Regime: ${regime.type}`);
 * console.log(`Indicators:`, regime.indicators);
 * ```
 */
export class MultiFactorRegimeDetector {
    private hurstCalculator: HurstExponentCalculator;

    constructor() {
        this.hurstCalculator = new HurstExponentCalculator();
    }

    /**
     * Detect regime using multiple indicators
     * 
     * @param prices - Historical price data
     * @returns Market regime with detailed indicators
     * 
     * @throws {Error} If prices array is too short
     * 
     * @remarks
     * Calculates multiple indicators and scores each regime type.
     * Returns the highest scoring regime.
     * 
     * Scoring factors:
     * - Hurst exponent
     * - R² from linear regression
     * - Volatility z-score
     * - Momentum
     * - Direction change frequency
     */
    detect(prices: number[]): MarketRegime {
        const indicators = this.calculateIndicators(prices);

        // Score each regime
        const scores = {
            'TRENDING_UP': this.scoreTrendingUp(indicators),
            'TRENDING_DOWN': this.scoreTrendingDown(indicators),
            'RANGING': this.scoreRanging(indicators),
            'HIGH_VOLATILITY': this.scoreHighVolatility(indicators)
        };

        // Find highest scoring regime
        const entries = Object.entries(scores) as [RegimeType, number][];
        const [regime, score] = entries.sort(([, a], [, b]) => b - a)[0];

        return {
            type: regime,
            probability: score,
            indicators
        };
    }

    /**
     * Calculate all regime indicators
     * @private
     */
    private calculateIndicators(prices: number[]): RegimeIndicators {
        const hurstResult = this.hurstCalculator.calculate(prices);
        const rSquared = this.calculateRSquared(prices);
        const volatilityZScore = this.calculateVolatilityZScore(prices);
        const momentumScore = this.calculateMomentumScore(prices);
        const directionChangeRatio = this.calculateDirectionChangeRatio(prices);

        return {
            hurst: hurstResult.exponent,
            rSquared,
            volatilityZScore,
            momentumScore,
            directionChangeRatio
        };
    }

    /**
     * Score TRENDING_UP regime
     * @private
     */
    private scoreTrendingUp(ind: RegimeIndicators): number {
        return (
            (ind.hurst > 0.55 ? 0.3 : 0) +
            (ind.rSquared > 0.5 ? 0.2 : 0) +
            (ind.momentumScore > 0.3 ? 0.3 : 0) +
            (ind.directionChangeRatio < 0.3 ? 0.2 : 0)
        );
    }

    /**
     * Score TRENDING_DOWN regime
     * @private
     */
    private scoreTrendingDown(ind: RegimeIndicators): number {
        return (
            (ind.hurst > 0.55 ? 0.3 : 0) +
            (ind.rSquared > 0.5 ? 0.2 : 0) +
            (ind.momentumScore < -0.3 ? 0.3 : 0) +
            (ind.directionChangeRatio < 0.3 ? 0.2 : 0)
        );
    }

    /**
     * Score RANGING regime
     * @private
     */
    private scoreRanging(ind: RegimeIndicators): number {
        return (
            (ind.hurst < 0.45 ? 0.3 : 0) +
            (ind.rSquared < 0.3 ? 0.3 : 0) +
            (ind.directionChangeRatio > 0.4 ? 0.2 : 0) +
            (ind.volatilityZScore < 0 ? 0.2 : 0)
        );
    }

    /**
     * Score HIGH_VOLATILITY regime
     * @private
     */
    private scoreHighVolatility(ind: RegimeIndicators): number {
        return ind.volatilityZScore > 2 ? 0.9 :
            ind.volatilityZScore > 1.5 ? 0.6 :
                ind.volatilityZScore > 1 ? 0.3 : 0;
    }

    // Helper methods (simplified implementations)
    private calculateRSquared(prices: number[]): number {
        // Simplified R² calculation
        const n = prices.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += prices[i];
            sumXY += i * prices[i];
            sumX2 += i * i;
            sumY2 += prices[i] * prices[i];
        }

        const num = n * sumXY - sumX * sumY;
        const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        const r = den === 0 ? 0 : num / den;
        return r * r;
    }

    private calculateVolatilityZScore(prices: number[]): number {
        const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
        const recentVol = this.stdDev(returns.slice(-20));
        const historicalVol = this.stdDev(returns);
        const mean = historicalVol;
        const std = historicalVol * 0.2; // Approximate
        return (recentVol - mean) / (std || 1);
    }

    private calculateMomentumScore(prices: number[]): number {
        const returns = (prices[prices.length - 1] - prices[0]) / prices[0];
        return Math.max(-1, Math.min(1, returns * 10)); // Normalize to [-1, 1]
    }

    private calculateDirectionChangeRatio(prices: number[]): number {
        let changes = 0;
        for (let i = 2; i < prices.length; i++) {
            const prev = prices[i - 1] - prices[i - 2];
            const curr = prices[i] - prices[i - 1];
            if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) {
                changes++;
            }
        }
        return changes / (prices.length - 2);
    }

    private stdDev(values: number[]): number {
        if (values.length < 2) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
        return Math.sqrt(variance);
    }
}

/**
 * Exponential Moving Average (EMA) Helper
 * 
 * @fileoverview Calculates exponential moving averages for technical analysis.
 * EMA gives more weight to recent prices, making it more responsive to new information.
 * 
 * @module helpers/indicators/EMAHelper
 * 
 * @remarks
 * EMA Formula: EMA(t) = P(t) * k + EMA(t-1) * (1 - k)
 * where k = 2 / (period + 1)
 * 
 * Commonly used periods:
 * - Fast EMA: 10-12 periods
 * - Slow EMA: 26-30 periods
 * - Long-term EMA: 50-200 periods
 */

/**
 * EMA calculation result
 */
export interface EMAResult {
    /** Final EMA value */
    value: number;
    /** All EMA values in the series */
    series: number[];
    /** Period used for calculation */
    period: number;
}

/**
 * Exponential Moving Average Helper
 * 
 * @remarks
 * The EMA gives more weight to recent prices through an exponential decay factor.
 * This makes it more responsive to price changes compared to Simple Moving Average (SMA).
 * 
 * @example
 * ```typescript
 * const emaHelper = new EMAHelper();
 * const prices = [100, 101, 102, 101, 100, 99, 100, 101, 102, 103];
 * const ema10 = emaHelper.calculate(prices, 10);
 * console.log(`EMA(10): ${ema10.value.toFixed(2)}`);
 * ```
 */
export class EMAHelper {
    /**
     * Calculate Exponential Moving Average
     * 
     * @param prices - Array of price values
     * @param period - EMA period (number of data points to consider)
     * @returns EMA calculation result
     * 
     * @throws {Error} If period is invalid (<= 0 or > prices.length)
     * 
     * @remarks
     * The smoothing factor k = 2 / (period + 1) determines the weight given to the most recent price.
     * The first EMA value uses SMA as a seed.
     * 
     * @example
     * ```typescript
     * const helper = new EMAHelper();
     * const result = helper.calculate([100, 101, 102, 103, 104], 3);
     * // Returns EMA values starting from index 2 (period - 1)
     * ```
     */
    calculate(prices: number[], period: number): EMAResult {
        if (period <= 0 || period > prices.length) {
            throw new Error(`Invalid EMA period: ${period}. Must be between 1 and ${prices.length}`);
        }

        const k = 2 / (period + 1); // Smoothing factor
        const series: number[] = [];

        // First EMA value is SMA of first 'period' prices
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
        series.push(ema);

        // Calculate remaining EMA values
        for (let i = period; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
            series.push(ema);
        }

        return {
            value: ema,
            series,
            period
        };
    }

    /**
     * Calculate EMA for the most recent value only
     * More efficient when you only need the final EMA value
     * 
     * @param prices - Array of price values
     * @param period - EMA period
     * @returns Final EMA value
     * 
     * @throws {Error} If period is invalid
     * 
     * @example
     * ```typescript
     * const helper = new EMAHelper();
     * const ema = helper.calculateLast([100, 101, 102, 103, 104], 3);
     * console.log(`Current EMA: ${ema.toFixed(2)}`);
     * ```
     */
    calculateLast(prices: number[], period: number): number {
        if (period <= 0 || period > prices.length) {
            throw new Error(`Invalid EMA period: ${period}. Must be between 1 and ${prices.length}`);
        }

        const k = 2 / (period + 1);

        // Start with SMA
        let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

        // Calculate EMA for remaining values
        for (let i = period; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
        }

        return ema;
    }

    /**
     * Calculate multiple EMAs at once (e.g., fast and slow)
     * 
     * @param prices - Array of price values
     * @param periods - Array of periods to calculate
     * @returns Map of period to EMA result
     * 
     * @example
     * ```typescript
     * const helper = new EMAHelper();
     * const emas = helper.calculateMultiple([...prices], [10, 30]);
     * const emaFast = emas.get(10)!.value;
     * const emaSlow = emas.get(30)!.value;
     * const signal = emaFast > emaSlow ? 'BULLISH' : 'BEARISH';
     * ```
     */
    calculateMultiple(prices: number[], periods: number[]): Map<number, EMAResult> {
        const results = new Map<number, EMAResult>();

        for (const period of periods) {
            try {
                results.set(period, this.calculate(prices, period));
            } catch (error) {
                console.warn(`Failed to calculate EMA for period ${period}:`, error);
            }
        }

        return results;
    }
}

/**
 * Simple Moving Average (SMA) Helper
 * 
 * @remarks
 * SMA gives equal weight to all prices in the period.
 * Less responsive than EMA but smoother and less prone to false signals.
 * 
 * @example
 * ```typescript
 * const smaHelper = new SMAHelper();
 * const sma20 = smaHelper.calculate([...prices], 20);
 * ```
 */
export class SMAHelper {
    /**
     * Calculate Simple Moving Average
     * 
     * @param prices - Array of price values
     * @param period - SMA period
     * @returns SMA value
     * 
     * @throws {Error} If period is invalid
     * 
     * @remarks
     * SMA Formula: SMA = (P1 + P2 + ... + Pn) / n
     * where n = period
     * 
     * @example
     * ```typescript
     * const helper = new SMAHelper();
     * const sma = helper.calculate([100, 101, 102, 103, 104], 3);
     * // Returns average of last 3 prices: (102 + 103 + 104) / 3 = 103
     * ```
     */
    calculate(prices: number[], period: number): number {
        if (period <= 0 || period > prices.length) {
            throw new Error(`Invalid SMA period: ${period}. Must be between 1 and ${prices.length}`);
        }

        const slice = prices.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
    }

    /**
     * Calculate SMA series for all possible windows
     * 
     * @param prices - Array of price values
     * @param period - SMA period
     * @returns Array of SMA values
     * 
     * @example
     * ```typescript
     * const helper = new SMAHelper();
     * const series = helper.calculateSeries([100, 101, 102, 103, 104], 3);
     * // Returns: [101, 102, 103] (SMA for each 3-period window)
     * ```
     */
    calculateSeries(prices: number[], period: number): number[] {
        if (period <= 0 || period > prices.length) {
            throw new Error(`Invalid SMA period: ${period}`);
        }

        const series: number[] = [];

        for (let i = period - 1; i < prices.length; i++) {
            const window = prices.slice(i - period + 1, i + 1);
            series.push(window.reduce((a, b) => a + b, 0) / period);
        }

        return series;
    }
}

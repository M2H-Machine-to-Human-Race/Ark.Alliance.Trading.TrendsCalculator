/**
 * Comprehensive Trading Metrics Calculator
 * 
 * @fileoverview Calculates risk-adjusted performance metrics for trading strategies.
 * Simple accuracy metrics are insufficient - must account for risk, drawdowns, and asymmetry.
 * 
 * @module helpers/advanced/MetricsCalculator
 * @see {@link ../../../../Analysis/TrendsMicroService_Analysis.md}
 * @criticality HIGH
 * 
 * @remarks
 * Financial metrics suite includes:
 * - Return Metrics: Total Return, CAGR, Win Rate
 * - Risk-Adjusted: Sharpe Ratio, Sortino Ratio, Calmar Ratio
 * - Risk Metrics: Max Drawdown, VaR, CVaR
 * - Profitability: Profit Factor, Expectancy
 * 
 * Key principle: 60% accuracy can still lose money if losses > gains.
 * Always evaluate on risk-adjusted returns, not accuracy alone.
 */

/**
 * Trade data structure
 */
export interface Trade {
    /** Profit/Loss for this trade */
    pnl: number;
    /** Entry timestamp (optional) */
    entryTime?: number;
    /** Exit timestamp (optional) */
    exitTime?: number;
}

/**
 * Comprehensive performance metrics
 */
export interface ComprehensiveMetrics {
    // Return Metrics
    /** Total return (final - initial) / initial */
    totalReturn: number;
    /** Compound Annual Growth Rate */
    cagr: number;
    /** Percentage of profitable trades */
    winRate: number;

    // Risk-Adjusted Metrics
    /** Sharpe Ratio (annualized) */
    sharpeRatio: number;
    /** Sortino Ratio (downside-risk adjusted) */
    sortinoRatio: number;
    /** Calmar Ratio (CAGR / Max Drawdown) */
    calmarRatio: number;

    // Risk Metrics
    /** Maximum drawdown (worst peak-to-trough decline) */
    maxDrawdown: number;
    /** Average drawdown */
    avgDrawdown: number;
    /** Value at Risk (95% confidence) */
    valueAtRisk95: number;
    /** Conditional VaR (Expected Shortfall) */
    conditionalVaR95: number;

    // Profitability
    /** Profit Factor (Gross Profit / Gross Loss) */
    profitFactor: number;
    /** Average winning trade */
    avgWin: number;
    /** Average losing trade */
    avgLoss: number;
    /** Expected profit per trade */
    expectancy: number;
}

/**
 * Metrics Calculator for Trading Strategy Evaluation
 * 
 * @remarks
 * Provides comprehensive risk-adjusted performance analysis.
 * All metrics are industry-standard and validated against academic literature.
 * 
 * Good benchmark values:
 * - Sharpe Ratio: > 1.0
 * - Sortino Ratio: > 1.5
 * - Profit Factor: > 1.5 (> 2.0 excellent)
 * - Max Drawdown: < 20%
 * 
 * @example
 * ```typescript
 * const calculator = new MetricsCalculator();
 * const equity = [10000, 10500, 10300, 11000, 10800, 11500];
 * const trades = [
 *     { pnl: 500 },
 *     { pnl: -200 },
 *     { pnl: 700 },
 *     { pnl: -200 },
 *     { pnl: 700 }
 * ];
 * 
 * const metrics = calculator.calculateAll(equity, trades);
 * console.log(`Sharpe: ${metrics.sharpeRatio.toFixed(2)}`);
 * console.log(`Max DD: ${(metrics.maxDrawdown * 100).toFixed(1)}%`);
 * ```
 */
export class MetricsCalculator {
    /**
     * Calculate Sharpe Ratio (risk-adjusted return)
     * 
     * @param returns - Array of periodic returns
     * @param riskFreeRate - Annual risk-free rate (default: 2%)
     * @returns Annualized Sharpe Ratio
     * 
     * @remarks
     * Formula: (Mean Return - Risk-Free Rate) / Std Dev × √252
     * 
     * Interpretation:
     * - < 0: Strategy loses money
     * - 0-1: Subpar risk-adjusted returns
     * - 1-2: Good
     * - 2-3: Very good
     * - > 3: Excellent (rare)
     * 
     * Limitations:
     * - Assumes normal distribution
     * - Treats upside/downside volatility equally
     * - Can be manipulated with option strategies
     * 
     * @example
     * ```typescript
     * const returns = [0.01, -0.005, 0.02, 0.015, -0.01];
     * const sharpe = calculator.calculateSharpeRatio(returns);
     * // Returns annualized Sharpe ratio
     * ```
     */
    calculateSharpeRatio(
        returns: number[],
        riskFreeRate: number = 0.02
    ): number {
        if (returns.length < 2) return 0;

        const meanReturn = this.mean(returns);
        const stdDev = this.stdDev(returns);
        const dailyRiskFree = riskFreeRate / 252;

        if (stdDev === 0) return meanReturn > 0 ? Infinity : 0;

        // Annualize: multiply by √252 (trading days per year)
        return ((meanReturn - dailyRiskFree) / stdDev) * Math.sqrt(252);
    }

    /**
     * Calculate Sortino Ratio (downside-risk adjusted return)
     * 
     * @param returns - Array of periodic returns
     * @param riskFreeRate - Annual risk-free rate (default: 2%)
     * @returns Annualized Sortino Ratio
     * 
     * @remarks
     * Like Sharpe but only penalizes downside volatility.
     * More appropriate for strategies with asymmetric returns.
     * 
     * Formula: (Mean Return - Risk-Free Rate) / Downside Deviation × √252
     * 
     * Typically higher than Sharpe for profitable strategies.
     * 
     * @example
     * ```typescript
     * const sortino = calculator.calculateSortinoRatio(returns);
     * // Sortino > Sharpe indicates strategy has positive skew
     * ```
     */
    calculateSortinoRatio(
        returns: number[],
        riskFreeRate: number = 0.02
    ): number {
        if (returns.length < 2) return 0;

        const meanReturn = this.mean(returns);
        const downsideReturns = returns.filter(r => r < 0);

        if (downsideReturns.length === 0) {
            return meanReturn > 0 ? Infinity : 0;
        }

        const downsideDev = this.stdDev(downsideReturns);
        const dailyRiskFree = riskFreeRate / 252;

        if (downsideDev === 0) return meanReturn > 0 ? Infinity : 0;

        return ((meanReturn - dailyRiskFree) / downsideDev) * Math.sqrt(252);
    }

    /**
     * Calculate Maximum Drawdown
     * 
     * @param equity - Equity curve (cumulative portfolio value)
     * @returns Maximum drawdown as decimal (0.15 = 15% drawdown)
     * 
     * @remarks
     * Measures largest peak-to-trough decline.
     * Critical risk metric - even profitable strategies can have large drawdowns.
     * 
     * Warning levels:
     * - < 10%: Low risk
     * - 10-20%: Moderate
     * - 20-30%: High
     * - > 30%: Very high (most traders cannot psychologically tolerate)
     * 
     * @example
     * ```typescript
     * const equity = [10000, 11000, 10500, 9500, 10000, 11500];
     * const maxDD = calculator.calculateMaxDrawdown(equity);
     * // Returns 0.136 (13.6% drawdown from 11000 to 9500)
     * ```
     */
    calculateMaxDrawdown(equity: number[]): number {
        if (equity.length < 2) return 0;

        let maxDrawdown = 0;
        let peak = equity[0];

        for (const value of equity) {
            if (value > peak) {
                peak = value;
            }
            const drawdown = (peak - value) / peak;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        return maxDrawdown;
    }

    /**
     * Calculate average drawdown
     * 
     * @param equity - Equity curve
     * @returns Average drawdown
     * 
     * @private
     */
    calculateAvgDrawdown(equity: number[]): number {
        if (equity.length < 2) return 0;

        const drawdowns: number[] = [];
        let peak = equity[0];

        for (const value of equity) {
            if (value > peak) {
                peak = value;
            }
            const drawdown = (peak - value) / peak;
            if (drawdown > 0) {
                drawdowns.push(drawdown);
            }
        }

        return drawdowns.length > 0 ? this.mean(drawdowns) : 0;
    }

    /**
     * Calculate Profit Factor
     * 
     * @param trades - Array of trades with PnL
     * @returns Profit Factor (Gross Profit / Gross Loss)
     * 
     * @remarks
     * Measures sustainability of profits.
     * 
     * Interpretation:
     * - < 1.0: Losing strategy
     * - 1.0-1.5: Marginal
     * - 1.5-2.0: Good
     * - > 2.0: Excellent
     * 
     * @example
     * ```typescript
     * const trades = [
     *     { pnl: 100 }, { pnl: 150 }, { pnl: -50 }, { pnl: -30 }
     * ];
     * const pf = calculator.calculateProfitFactor(trades);
     * // Returns 3.125 (250 / 80)
     * ```
     */
    calculateProfitFactor(trades: Trade[]): number {
        const grossProfit = trades
            .filter(t => t.pnl > 0)
            .reduce((sum, t) => sum + t.pnl, 0);

        const grossLoss = Math.abs(trades
            .filter(t => t.pnl < 0)
            .reduce((sum, t) => sum + t.pnl, 0));

        if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;

        return grossProfit / grossLoss;
    }

    /**
     * Calculate Expectancy (average expected profit per trade)
     * 
     * @param trades - Array of trades with PnL
     * @returns Expected profit per trade
     * 
     * @remarks
     * Formula: (Win Rate × Avg Win) - (Loss Rate × Avg Loss)
     * 
     * Positive expectancy is required for long-term profitability.
     * 
     * @example
     * ```typescript
     * const expectancy = calculator.calculateExpectancy(trades);
     * console.log(`Expected profit per trade: $${expectancy.toFixed(2)}`);
     * ```
     */
    calculateExpectancy(trades: Trade[]): number {
        if (trades.length === 0) return 0;

        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl < 0);

        const winRate = wins.length / trades.length;
        const avgWin = wins.length > 0
            ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length
            : 0;
        const avgLoss = losses.length > 0
            ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length)
            : 0;

        return (winRate * avgWin) - ((1 - winRate) * avgLoss);
    }

    /**
     * Calculate Value at Risk (VaR) at 95% confidence
     * 
     * @param returns - Array of returns
     * @param confidence - Confidence level (default: 0.95)
     * @returns VaR as positive number
     * 
     * @remarks
     * VaR answers: "What is the maximum loss expected 95% of the time?"
     * 5th percentile loss (returned as positive number).
     * 
     * @example
     * ```typescript
     * const var95 = calculator.calculateVaR(returns, 0.95);
     * console.log(`95% VaR: ${(var95 * 100).toFixed(2)}%`);
     * ```
     */
    calculateVaR(returns: number[], confidence: number = 0.95): number {
        if (returns.length === 0) return 0;

        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidence) * sorted.length);
        return -sorted[index]; // Return as positive number
    }

    /**
     * Calculate Conditional VaR (CVaR) - Expected Shortfall
     * 
     * @param returns - Array of returns
     * @param confidence - Confidence level (default: 0.95)
     * @returns CVaR as positive number
     * 
     * @remarks
     * CVaR answers: "Given that we exceed VaR, what is the expected loss?"
     * Average of all losses beyond VaR threshold.
     * More conservative than VaR.
     * 
     * @example
     * ```typescript
     * const cvar = calculator.calculateCVaR(returns, 0.95);
     * // Expected loss in worst 5% of cases
     * ```
     */
    calculateCVaR(returns: number[], confidence: number = 0.95): number {
        if (returns.length === 0) return 0;

        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidence) * sorted.length);
        const tailReturns = sorted.slice(0, index);

        if (tailReturns.length === 0) return 0;

        return -this.mean(tailReturns);
    }

    /**
     * Calculate Compound Annual Growth Rate (CAGR)
     * 
     * @param equity - Equity curve
     * @param yearsOrDays - Number of years, or if > 100, number of days
     * @returns CAGR as decimal
     * 
     * @private
     */
    private calculateCAGR(equity: number[], yearsOrDays?: number): number {
        if (equity.length < 2) return 0;

        const initial = equity[0];
        const final = equity[equity.length - 1];

        let years: number;
        if (yearsOrDays === undefined) {
            // Assume daily data
            years = equity.length / 252;
        } else if (yearsOrDays > 100) {
            // Interpret as days
            years = yearsOrDays / 252;
        } else {
            years = yearsOrDays;
        }

        if (years === 0 || initial === 0) return 0;

        return Math.pow(final / initial, 1 / years) - 1;
    }

    /**
     * Calculate all metrics at once
     * 
     * @param equity - Equity curve (cumulative portfolio value)
     * @param trades - Array of trades with PnL
     * @returns Complete metrics suite
     * 
     * @example
     * ```typescript
     * const metrics = calculator.calculateAll(equity, trades);
     * console.log(`Sharpe: ${metrics.sharpeRatio.toFixed(2)}`);
     * console.log(`Sortino: ${metrics.sortinoRatio.toFixed(2)}`);
     * console.log(`Max DD: ${(metrics.maxDrawdown * 100).toFixed(1)}%`);
     * console.log(`Profit Factor: ${metrics.profitFactor.toFixed(2)}`);
     * ```
     */
    calculateAll(equity: number[], trades: Trade[]): ComprehensiveMetrics {
        const returns = equity.slice(1).map((e, i) => (e - equity[i]) / equity[i]);

        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl < 0);

        return {
            // Return Metrics
            totalReturn: (equity[equity.length - 1] - equity[0]) / equity[0],
            cagr: this.calculateCAGR(equity),
            winRate: trades.length > 0 ? wins.length / trades.length : 0,

            // Risk-Adjusted Metrics
            sharpeRatio: this.calculateSharpeRatio(returns),
            sortinoRatio: this.calculateSortinoRatio(returns),
            calmarRatio: this.calculateCAGR(equity) / (this.calculateMaxDrawdown(equity) || 1),

            // Risk Metrics
            maxDrawdown: this.calculateMaxDrawdown(equity),
            avgDrawdown: this.calculateAvgDrawdown(equity),
            valueAtRisk95: this.calculateVaR(returns, 0.95),
            conditionalVaR95: this.calculateCVaR(returns, 0.95),

            // Profitability
            profitFactor: this.calculateProfitFactor(trades),
            avgWin: wins.length > 0 ? this.mean(wins.map(t => t.pnl)) : 0,
            avgLoss: losses.length > 0 ? this.mean(losses.map(t => Math.abs(t.pnl))) : 0,
            expectancy: this.calculateExpectancy(trades)
        };
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

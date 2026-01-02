/**
 * Metrics Time Series Generator
 * 
 * @fileoverview Generates trade sequences for testing MetricsCalculator
 * @module fixtures/MetricsTimeSeries
 * 
 * @remarks
 * Creates deterministic trade history exhibiting different performance characteristics:
 * - High/Low Sharpe Ratio
 * - Large/Small drawdowns
 * - High/Low win rates
 * - Various profit factors
 * - Risk-adjusted returns
 */

export interface Trade {
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    direction: 'LONG' | 'SHORT';
    pnl: number;
    timestamp: number;
}

/**
 * METRICS-001: High Sharpe Ratio Strategy
 * Consistent small wins, low volatility, excellent risk-adjusted returns
 */
export function generateHighSharpe(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.5);
        const direction = 'LONG';

        // Consistent ~2% wins with occasional 0.5% loss
        const isWin = i % 10 !== 9; // 90% win rate
        const exitPrice = isWin
            ? entryPrice * 1.02  // 2% gain
            : entryPrice * 0.995; // 0.5% loss

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000) // 1 minute apart
        });
    }

    return results;
}

/**
 * METRICS-002: Low Sharpe Ratio Strategy
 * Erratic returns, high volatility, poor risk-adjusted performance
 */
export function generateLowSharpe(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.3);
        const direction = 'LONG';

        // Random large swings
        const randomReturn = (Math.sin(i * 17) * 0.10); // ±10% swings
        const exitPrice = entryPrice * (1 + randomReturn);

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-003: Large Maximum Drawdown
 * Consecutive losses creating significant drawdown
 */
export function generateLargeDrawdown(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.2);
        const direction = 'LONG';

        // Catastrophic losing streak in middle
        const isInDrawdown = i >= 40 && i < 60;
        const exitPrice = isInDrawdown
            ? entryPrice * 0.95  // 5% loss each trade
            : entryPrice * 1.01; // 1% gain otherwise

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-004: Small Maximum Drawdown
 * Well-controlled risk, minimal consecutive losses
 */
export function generateSmallDrawdown(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.3);
        const direction = 'LONG';

        // Never more than 2 losses in a row, small losses
        const isWin = i % 3 !== 2; // 66% win rate
        const exitPrice = isWin
            ? entryPrice * 1.015 // 1.5% gain
            : entryPrice * 0.997; // 0.3% loss

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-005: High Win Rate (Good)
 * 85% winning trades
 */
export function generateHighWinRate(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.4);
        const direction = 'LONG';

        // 85% win rate
        const isWin = i % 7 !== 6;
        const exitPrice = isWin
            ? entryPrice * 1.01  // 1% gain
            : entryPrice * 0.97; // 3% loss

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-006: Low Win Rate (Poor)
 * 35% winning trades
 */
export function generateLowWinRate(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.2);
        const direction = 'LONG';

        // 35% win rate
        const isWin = i % 3 === 0;
        const exitPrice = isWin
            ? entryPrice * 1.08  // 8% gain (big wins)
            : entryPrice * 0.98; // 2% loss (frequent small losses)

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-007: High Profit Factor
 * Gross profit significantly exceeds gross loss
 */
export function generateHighProfitFactor(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.5);
        const direction = 'LONG';

        // Big wins, tiny losses
        const isWin = i % 2 === 0; // 50% win rate
        const exitPrice = isWin
            ? entryPrice * 1.05  // 5% gain
            : entryPrice * 0.995; // 0.5% loss

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-008: Low Profit Factor
 * Gross loss nearly equals or exceeds gross profit
 */
export function generateLowProfitFactor(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.3);
        const direction = 'LONG';

        // Small wins, big losses
        const isWin = i % 2 === 0; // 50% win rate
        const exitPrice = isWin
            ? entryPrice * 1.01  // 1% gain
            : entryPrice * 0.96; // 4% loss

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-009: Volatile Returns
 * High variance in trade outcomes
 */
export function generateVolatileReturns(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.4);
        const direction = 'LONG';

        // Alternating extreme outcomes
        const returnPct = Math.sin(i * 11) * 0.12; // ±12% swings
        const exitPrice = entryPrice * (1 + returnPct);

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * METRICS-010: Consistent Returns
 * Low variance, predictable outcomes
 */
export function generateConsistentReturns(trades: number = 100): Trade[] {
    const results: Trade[] = [];
    let timestamp = Date.now();
    const basePrice = 100;

    for (let i = 0; i < trades; i++) {
        const entryPrice = basePrice + (i * 0.6);
        const direction = 'LONG';

        // Very consistent 1.5% returns with tiny variance
        const noise = (Math.sin(i * 13) * 0.001); // ±0.1% noise
        const exitPrice = entryPrice * (1.015 + noise);

        const quantity = 1;
        const pnl = (exitPrice - entryPrice) * quantity;

        results.push({
            entryPrice,
            exitPrice,
            quantity,
            direction,
            pnl,
            timestamp: timestamp + (i * 60000)
        });
    }

    return results;
}

/**
 * Metrics scenario configurations
 */
export const METRICS_SCENARIOS = {
    'METRICS-001': {
        name: 'High Sharpe Ratio',
        generator: generateHighSharpe,
        expectedSharpe: { min: 2.0, max: 5.0 },
        description: 'Excellent risk-adjusted returns'
    },
    'METRICS-002': {
        name: 'Low Sharpe Ratio',
        generator: generateLowSharpe,
        expectedSharpe: { min: -0.5, max: 0.5 },
        description: 'Poor risk-adjusted returns'
    },
    'METRICS-003': {
        name: 'Large Drawdown',
        generator: generateLargeDrawdown,
        expectedDrawdown: { min: 60, max: 100 },
        description: 'Severe consecutive losses'
    },
    'METRICS-004': {
        name: 'Small Drawdown',
        generator: generateSmallDrawdown,
        expectedDrawdown: { min: 0, max: 5 },
        description: 'Controlled risk'
    },
    'METRICS-005': {
        name: 'High Win Rate',
        generator: generateHighWinRate,
        expectedWinRate: { min: 0.80, max: 0.90 },
        description: 'Consistent winning'
    },
    'METRICS-006': {
        name: 'Low Win Rate',
        generator: generateLowWinRate,
        expectedWinRate: { min: 0.30, max: 0.40 },
        description: 'Frequent losses'
    },
    'METRICS-007': {
        name: 'High Profit Factor',
        generator: generateHighProfitFactor,
        expectedProfitFactor: { min: 5.0, max: 15.0 },
        description: 'Large wins vs small losses'
    },
    'METRICS-008': {
        name: 'Low Profit Factor',
        generator: generateLowProfitFactor,
        expectedProfitFactor: { min: 0.1, max: 0.5 },
        description: 'Small wins vs large losses'
    },
    'METRICS-009': {
        name: 'Volatile Returns',
        generator: generateVolatileReturns,
        expectedVariance: { min: 5.0, max: 20.0 },
        description: 'Unpredictable outcomes'
    },
    'METRICS-010': {
        name: 'Consistent Returns',
        generator: generateConsistentReturns,
        expectedVariance: { min: 0.0, max: 0.5 },
        description: 'Predictable performance'
    }
};




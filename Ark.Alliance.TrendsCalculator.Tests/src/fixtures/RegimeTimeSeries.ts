/**
 * Regime Time Series Generator
 * 
 * @fileoverview Generates synthetic time series data for testing RegimeDetector
 * @module fixtures/RegimeTimeSeries
 * 
 * @remarks
 * Creates deterministic price series exhibiting different market regimes:
 * - Trending (high momentum, directional movement)
 * - Mean-reverting (oscillating around mean)
 * - High volatility (large price swings)
 * - Low volatility (stable, tight range)
 * - Transitioning regimes (regime shifts)
 */

/**
 * Box-Muller transform for generating Gaussian random numbers
 * @param mean - Mean of the distribution
 * @param stdDev - Standard deviation
 * @param seed - Seed for deterministic generation
 */
function gaussianRandom(mean: number, stdDev: number, seed: number): number {
    const u1 = Math.abs(Math.sin(seed * 9301 + 49297) % 233280 / 233280);
    const u2 = Math.abs(Math.sin((seed + 1) * 9301 + 49297) % 233280 / 233280);
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + stdDev * z0;
}

/**
 * REGIME-001: Strong Trending Market (Bullish)
 * High momentum, persistent directional movement, low mean reversion
 */
export function generateStrongTrendingBullish(points: number = 200): number[] {
    const prices: number[] = [];
    let price = 100;

    for (let i = 0; i < points; i++) {
        // Strong upward trend with low noise
        const trend = 0.05; // 5% average gain per period
        const noise = gaussianRandom(0, 0.3, i * 17); // Low volatility

        price = price * (1 + trend / 100) + noise;
        prices.push(price);
    }

    return prices;
}

/**
 * REGIME-002: Mean-Reverting Market (Range-Bound)
 * Oscillates around mean, high cyclicality, low trend
 */
export function generateMeanReverting(points: number = 200): number[] {
    const prices: number[] = [];
    const mean = 100;
    const amplitude = 5; // Price oscillates ±5 around mean

    for (let i = 0; i < points; i++) {
        // Sine wave with noise for mean reversion
        const cycle = Math.sin(i * 0.1) * amplitude;
        const noise = gaussianRandom(0, 0.8, i * 23);

        prices.push(mean + cycle + noise);
    }

    return prices;
}

/**
 * REGIME-003: High Volatility Regime
 * Large price swings, unpredictable movements, high uncertainty
 */
export function generateHighVolatility(points: number = 200): number[] {
    const prices: number[] = [];
    let price = 100;

    for (let i = 0; i < points; i++) {
        // High volatility with random walks
        const drift = gaussianRandom(0, 0.1, i * 31);
        const shock = gaussianRandom(0, 3.0, i * 37); // High volatility

        price = price + drift + shock;
        prices.push(Math.max(price, 50)); // Floor at 50
    }

    return prices;
}

/**
 * REGIME-004: Low Volatility Regime (Consolidation)
 * Tight range, minimal price movement, low risk
 */
export function generateLowVolatility(points: number = 200): number[] {
    const prices: number[] = [];
    let price = 100;

    for (let i = 0; i < points; i++) {
        // Very low volatility, minimal movement
        const drift = gaussianRandom(0, 0.05, i * 41);
        const noise = gaussianRandom(0, 0.2, i * 43); // Very low noise

        price = price + drift + noise;
        prices.push(price);
    }

    return prices;
}

/**
 * REGIME-005: Transitioning Regime (Trend to Mean-Reversion)
 * Starts trending, transitions to mean-reverting
 */
export function generateTransitioningRegime(points: number = 200): number[] {
    const prices: number[] = [];
    let price = 100;
    const transitionPoint = Math.floor(points / 2);

    for (let i = 0; i < points; i++) {
        if (i < transitionPoint) {
            // Phase 1: Trending
            const trend = 0.04;
            const noise = gaussianRandom(0, 0.5, i * 47);
            price = price * (1 + trend / 100) + noise;
        } else {
            // Phase 2: Mean-reverting
            const mean = price; // New mean after trend
            const reversion = (mean - price) * 0.1;
            const noise = gaussianRandom(0, 0.8, i * 53);
            price = price + reversion + noise;
        }

        prices.push(price);
    }

    return prices;
}

/**
 * REGIME-006: Volatile Trending Market
 * Strong trend but with high volatility (risky trending)
 */
export function generateVolatileTrending(points: number = 200): number[] {
    const prices: number[] = [];
    let price = 100;

    for (let i = 0; i < points; i++) {
        // Strong trend with high volatility
        const trend = 0.06;
        const volatility = gaussianRandom(0, 2.0, i * 59); // High vol

        price = price * (1 + trend / 100) + volatility;
        prices.push(Math.max(price, 50));
    }

    return prices;
}

/**
 * REGIME-007: Choppy Market (Mixed Regime)
 * Alternating between small trends and reversals
 */
export function generateChoppyMarket(points: number = 200): number[] {
    const prices: number[] = [];
    let price = 100;

    for (let i = 0; i < points; i++) {
        // Alternating micro-trends
        const cycle = Math.floor(i / 20) % 2; // Switch every 20 periods
        const direction = cycle === 0 ? 1 : -1;

        const microTrend = direction * 0.02;
        const noise = gaussianRandom(0, 1.0, i * 61);

        price = price * (1 + microTrend / 100) + noise;
        prices.push(price);
    }

    return prices;
}

/**
 * REGIME-008: Extreme Volatility Spike
 * Low volatility followed by sudden volatility spike
 */
export function generateVolatilitySpike(points: number = 200): number[] {
    const prices: number[] = [];
    let price = 100;
    const spikeStart = Math.floor(points * 0.6);
    const spikeEnd = Math.floor(points * 0.8);

    for (let i = 0; i < points; i++) {
        if (i >= spikeStart && i < spikeEnd) {
            // Volatility spike period
            const shock = gaussianRandom(0, 5.0, i * 67); // Extreme volatility
            price = price + shock;
        } else {
            // Normal low volatility
            const noise = gaussianRandom(0, 0.3, i * 71);
            price = price + noise;
        }

        prices.push(Math.max(price, 50));
    }

    return prices;
}

/**
 * Regime scenario configurations
 */
export const REGIME_SCENARIOS = {
    'REGIME-001': {
        name: 'Strong Trending (Bullish)',
        generator: generateStrongTrendingBullish,
        expectedRegime: 'TRENDING',
        expectedVolatility: 'LOW',
        description: 'Persistent upward movement with low volatility'
    },
    'REGIME-002': {
        name: 'Mean-Reverting (Range-Bound)',
        generator: generateMeanReverting,
        expectedRegime: 'MEAN_REVERTING',
        expectedVolatility: 'LOW',
        description: 'Oscillates around mean with cyclical behavior'
    },
    'REGIME-003': {
        name: 'High Volatility',
        generator: generateHighVolatility,
        expectedRegime: 'HIGH_VOLATILITY',
        expectedVolatility: 'HIGH',
        description: 'Large unpredictable price swings'
    },
    'REGIME-004': {
        name: 'Low Volatility (Consolidation)',
        generator: generateLowVolatility,
        expectedRegime: 'LOW_VOLATILITY',
        expectedVolatility: 'LOW',
        description: 'Tight range with minimal movement'
    },
    'REGIME-005': {
        name: 'Transitioning Regime',
        generator: generateTransitioningRegime,
        expectedRegime: 'TRANSITIONING',
        expectedVolatility: 'MODERATE',
        description: 'Shifts from trending to mean-reverting'
    },
    'REGIME-006': {
        name: 'Volatile Trending',
        generator: generateVolatileTrending,
        expectedRegime: 'TRENDING',
        expectedVolatility: 'HIGH',
        description: 'Strong trend with high volatility'
    },
    'REGIME-007': {
        name: 'Choppy Market',
        generator: generateChoppyMarket,
        expectedRegime: 'CHOPPY',
        expectedVolatility: 'MODERATE',
        description: 'Alternating micro-trends and reversals'
    },
    'REGIME-008': {
        name: 'Volatility Spike',
        generator: generateVolatilitySpike,
        expectedRegime: 'VOLATILITY_SPIKE',
        expectedVolatility: 'EXTREME',
        description: 'Sudden volatility explosion after calm period'
    }
};




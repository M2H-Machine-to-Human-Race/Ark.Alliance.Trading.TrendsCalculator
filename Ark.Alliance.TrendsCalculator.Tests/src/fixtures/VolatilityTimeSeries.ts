/**
 * Volatility TimeSeries Generators for GARCH Testing
 * 
 * @fileoverview Generates realistic return series with known volatility characteristics
 * for testing GARCH volatility modeling and forecasting.
 * 
 * @module fixtures/VolatilityTimeSeries
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/GARCH_Volatility.md}
 * 
 * @remarks
 * Based on proven patterns from Ark.Alliance.Trading.Bot.PositionService.Tests
 * Uses Box-Muller transform for normal distribution sampling
 * Implements GARCH-style volatility clustering
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const VOLATILITY_CONFIG = {
    /** Base price for price-to-return conversion */
    basePrice: 50000,
    /** Default number of observations */
    defaultPoints: 200,
    /** Low volatility (annualized) */
    lowVolatility: 0.005,  // 0.5% daily ≈ 8% annual
    /** Normal volatility */
    normalVolatility: 0.015,  // 1.5% daily ≈ 24% annual
    /** High volatility */
    highVolatility: 0.03,  // 3% daily ≈ 48% annual
    /** GARCH parameters */
    garchParams: {
        omega: 0.00001,
        alpha: 0.10,
        beta: 0.85
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Box-Muller transform for generating standard normal random variables
 * 
 * @returns Tuple of two independent standard normal random variables
 * 
 * @remarks
 * Converts uniform random variables to normal distribution
 * More accurate than approximation methods
 */
function boxMullerTransform(): [number, number] {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    return [z0, z1];
}

/**
 * Generate standard normal random variable
 */
function randomNormal(): number {
    return boxMullerTransform()[0];
}

/**
 * Calculate sample statistics for returns
 */
function calculateStatistics(returns: number[]): {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
} {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...returns);
    const max = Math.max(...returns);

    return { mean, stdDev, min, max };
}

// ═══════════════════════════════════════════════════════════════════════════
// GARCH SCENARIO GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GARCH-001: Low Volatility Regime
 * Stable market with minimal price movement
 * 
 * Expected Results:
 * - volatilityRegime = 'LOW'
 * - σ ≈ 0.005 (0.5% daily)
 * - α + β ≈ 0.85-0.90
 * - Forecast stays near current level
 */
export function generateGARCH_LowVolatility(points: number = 200): number[] {
    const returns: number[] = [];
    const targetVol = VOLATILITY_CONFIG.lowVolatility;

    for (let i = 0; i < points; i++) {
        const z = randomNormal();
        const ret = z * targetVol;
        returns.push(ret);
    }

    return returns;
}

/**
 * GARCH-002: High Volatility Regime
 * Volatile market with large swings
 * 
 * Expected Results:
 * - volatilityRegime = 'HIGH' or 'EXTREME'
 * - σ ≈ 0.03 (3% daily)
 * - z-score > 1 (relative to normal vol)
 */
export function generateGARCH_HighVolatility(points: number = 200): number[] {
    const returns: number[] = [];
    const targetVol = VOLATILITY_CONFIG.highVolatility;

    for (let i = 0; i < points; i++) {
        const z = randomNormal();
        const ret = z * targetVol;
        returns.push(ret);
    }

    return returns;
}

/**
 * GARCH-003: Volatility Clustering
 * Realistic market with GARCH effects - periods of calm and volatility
 * 
 * Pattern: Calm (50 pts) → Volatility burst (50 pts) → Calm (100 pts)
 * 
 * Expected Results:
 * - High β (persistence)
 * - Accurate volatility forecasting
 * - Clear clustering observable
 */
export function generateGARCH_Clustering(points: number = 200): number[] {
    const returns: number[] = [];
    const { omega, alpha, beta } = VOLATILITY_CONFIG.garchParams;

    // Start with normal volatility
    let currentVariance = VOLATILITY_CONFIG.normalVolatility ** 2;

    for (let i = 0; i < points; i++) {
        // Generate current return
        const currentVol = Math.sqrt(currentVariance);
        const z = randomNormal();
        const ret = z * currentVol;
        returns.push(ret);

        // Apply GARCH(1,1) update for next period
        const shock2 = ret * ret;
        currentVariance = omega + alpha * shock2 + beta * currentVariance;

        // Inject volatility shock at midpoint
        if (i === 50) {
            currentVariance *= 4;  // 2x volatility
        }
        // Return to normal after 50 points of high vol
        if (i === 100) {
            currentVariance = VOLATILITY_CONFIG.normalVolatility ** 2;
        }
    }

    return returns;
}

/**
 * GARCH-004: Volatility Shock
 * Sudden spike in volatility (flash crash scenario)
 * 
 * Pattern: Stable (100 pts) → SHOCK (20 pts) → Gradual return (80 pts)
 * 
 * Expected Results:
 * - High α (reactive to shocks)
 * - Spike clearly detected
 * - Forecast adapts quickly
 */
export function generateGARCH_Shock(points: number = 200): number[] {
    const returns: number[] = [];
    const baseVol = VOLATILITY_CONFIG.normalVolatility;
    const shockVol = VOLATILITY_CONFIG.highVolatility * 1.5;  // 4.5% extreme

    for (let i = 0; i < points; i++) {
        let vol = baseVol;

        // Shock period (100-120)
        if (i >= 100 && i < 120) {
            vol = shockVol;
        }
        // Gradual decay back to normal (120-200)
        else if (i >= 120) {
            const decay = (i - 120) / 80;  // 0 to 1
            vol = shockVol + (baseVol - shockVol) * decay;
        }

        const z = randomNormal();
        const ret = z * vol;
        returns.push(ret);
    }

    return returns;
}

/**
 * GARCH-005: Mean-Reverting Volatility
 * Volatility spikes quickly revert to long-term mean
 * 
 * Expected Results:
 * - α + β ≈ 0.70 (quick mean reversion)
 * - Forecasts converge rapidly to long-term variance
 * - Multiple volatility cycles
 */
export function generateGARCH_MeanReverting(points: number = 200): number[] {
    const returns: number[] = [];

    // Lower persistence parameters
    const omega = 0.00008;  // Higher base
    const alpha = 0.20;     // More reactive
    const beta = 0.50;      // Less persistent (α + β = 0.70)

    let currentVariance = VOLATILITY_CONFIG.normalVolatility ** 2;

    for (let i = 0; i < points; i++) {
        const currentVol = Math.sqrt(currentVariance);
        const z = randomNormal();
        const ret = z * currentVol;
        returns.push(ret);

        // GARCH update with mean-reverting parameters
        const shock2 = ret * ret;
        currentVariance = omega + alpha * shock2 + beta * currentVariance;

        // Periodic volatility spikes (every 40 points)
        if (i % 40 === 0 && i > 0) {
            currentVariance *= 2;
        }
    }

    return returns;
}

/**
 * GARCH-006: Persistent Volatility
 * Volatility stays elevated for extended periods
 * 
 * Expected Results:
 * - α + β ≈ 0.98 (very persistent, near unit root)
 * - Long memory
 * - Slow forecast convergence
 * - Volatility clustering very pronounced
 */
export function generateGARCH_Persistent(points: number = 200): number[] {
    const returns: number[] = [];

    // High persistence parameters
    const omega = 0.000001;  // Very small base
    const alpha = 0.08;
    const beta = 0.90;       // High persistence (α + β = 0.98)

    let currentVariance = VOLATILITY_CONFIG.normalVolatility ** 2;

    for (let i = 0; i < points; i++) {
        const currentVol = Math.sqrt(currentVariance);
        const z = randomNormal();
        const ret = z * currentVol;
        returns.push(ret);

        // GARCH update with high persistence
        const shock2 = ret * ret;
        currentVariance = omega + alpha * shock2 + beta * currentVariance;

        // Single volatility shock that persists
        if (i === 60) {
            currentVariance *= 6;  // Large shock
        }
    }

    return returns;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO CATALOG
// ═══════════════════════════════════════════════════════════════════════════

export interface VolatilityScenarioMetadata {
    id: string;
    name: string;
    description: string;
    expectedRegime: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
    expectedPersistence: [number, number];  // α + β range
    generator: (points?: number) => number[];
}

export const VOLATILITY_SCENARIO_CATALOG: VolatilityScenarioMetadata[] = [
    {
        id: 'GARCH-001',
        name: 'Low Volatility Regime',
        description: 'Stable market with minimal volatility clustering',
        expectedRegime: 'LOW',
        expectedPersistence: [0.80, 0.95],
        generator: generateGARCH_LowVolatility
    },
    {
        id: 'GARCH-002',
        name: 'High Volatility Regime',
        description: 'Volatile market with large swings',
        expectedRegime: 'HIGH',
        expectedPersistence: [0.80, 0.95],
        generator: generateGARCH_HighVolatility
    },
    {
        id: 'GARCH-003',
        name: 'Volatility Clustering',
        description: 'Realistic GARCH effects with calm and volatile periods',
        expectedRegime: 'NORMAL',
        expectedPersistence: [0.85, 0.98],
        generator: generateGARCH_Clustering
    },
    {
        id: 'GARCH-004',
        name: 'Volatility Shock',
        description: 'Sudden spike in volatility (flash crash)',
        expectedRegime: 'EXTREME',
        expectedPersistence: [0.80, 0.95],
        generator: generateGARCH_Shock
    },
    {
        id: 'GARCH-005',
        name: 'Mean-Reverting Volatility',
        description: 'Volatility spikes revert quickly to mean',
        expectedRegime: 'NORMAL',
        expectedPersistence: [0.60, 0.80],
        generator: generateGARCH_MeanReverting
    },
    {
        id: 'GARCH-006',
        name: 'Persistent Volatility',
        description: 'Volatility stays elevated for long periods',
        expectedRegime: 'HIGH',
        expectedPersistence: [0.95, 0.99],
        generator: generateGARCH_Persistent
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate scenario and calculate statistics
 */
export function generateScenarioWithStats(scenarioId: string) {
    const scenario = VOLATILITY_SCENARIO_CATALOG.find(s => s.id === scenarioId);
    if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found`);
    }

    const returns = scenario.generator();
    const stats = calculateStatistics(returns);

    return {
        scenario,
        returns,
        stats
    };
}




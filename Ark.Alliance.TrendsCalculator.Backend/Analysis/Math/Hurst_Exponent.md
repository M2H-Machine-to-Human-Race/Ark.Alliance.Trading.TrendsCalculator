# Hurst Exponent - Trend vs Mean Reversion Detection

> **Related**: [TrendsMicroService_MathematicalTheory.md](../TrendsMicroService_MathematicalTheory.md)  
> **Status**: VALIDATED  
> **Criticality**: HIGH

---

## Overview

The **Hurst Exponent (H)** is a measure of the long-term memory of a time series. It quantifies whether a series is trending, mean-reverting, or behaving like a random walk.

---

## Interpretation

| H Value | Behavior | Strategy Type |
|---------|----------|---------------|
| **H < 0.5** | Mean-Reverting (Anti-Persistent) | Range trading, oscillation |
| **H ≈ 0.5** | Random Walk | Difficult to predict |
| **H > 0.5** | Trending (Persistent) | Trend-following, momentum |

### Detailed Interpretation

| H Range | Interpretation | Trading Implication |
|---------|----------------|---------------------|
| 0.0 - 0.35 | Strong mean reversion | Buy dips, sell rallies |
| 0.35 - 0.45 | Mild mean reversion | Cautious range trading |
| 0.45 - 0.55 | Near random walk | Avoid or use neutral strategies |
| 0.55 - 0.65 | Mild trending | Conservative trend-following |
| 0.65 - 1.0 | Strong trending | Aggressive trend-following |

---

## Why Use Hurst for Oscillation Detection?

The current system uses R² and direction change count for oscillation detection. **Hurst Exponent is superior** because:

| Current Approach | Hurst Advantage |
|------------------|-----------------|
| R² < 0.3 = oscillating | Hurst provides continuous measure 0-1 |
| Direction changes threshold | Hurst uses statistical properties |
| Buffer-size dependent | Hurst is scale-invariant |
| Binary decision | Hurst gives confidence level |

---

## Calculation Method (Rescaled Range)

The Hurst exponent is calculated using **R/S (Rescaled Range) Analysis**:

### Algorithm

1. Convert prices to log returns
2. For multiple lag periods (10, 20, 30, 50, 100...):
   - Divide returns into chunks
   - For each chunk:
     - Calculate mean
     - Calculate cumulative deviations from mean
     - Calculate Range (max - min of cumulative deviations)
     - Calculate Standard Deviation
     - Compute R/S = Range / StdDev
3. Plot log(R/S) vs log(lag)
4. **Slope of regression line = Hurst Exponent**

---

## Implementation

```typescript
class HurstExponentCalculator {
    /**
     * Calculate Hurst exponent using Rescaled Range (R/S) analysis
     */
    calculate(prices: number[]): number {
        // Convert to log returns
        const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
        const n = returns.length;
        
        // Use multiple lag periods
        const lags = [10, 20, 30, 50, 100].filter(l => l < n / 2);
        if (lags.length < 2) {
            return 0.5; // Not enough data, assume random walk
        }
        
        const rsValues: number[] = [];
        
        for (const lag of lags) {
            const chunks = Math.floor(n / lag);
            let rsSum = 0;
            
            for (let i = 0; i < chunks; i++) {
                const chunk = returns.slice(i * lag, (i + 1) * lag);
                const mean = chunk.reduce((a, b) => a + b, 0) / chunk.length;
                
                // Cumulative deviations from mean
                const cumulative: number[] = [];
                let sum = 0;
                for (const r of chunk) {
                    sum += r - mean;
                    cumulative.push(sum);
                }
                
                // Range
                const range = Math.max(...cumulative) - Math.min(...cumulative);
                
                // Standard deviation
                const variance = chunk.reduce((s, r) => 
                    s + Math.pow(r - mean, 2), 0) / chunk.length;
                const stdDev = Math.sqrt(variance);
                
                if (stdDev > 0) {
                    rsSum += range / stdDev;
                }
            }
            
            rsValues.push(rsSum / chunks);
        }
        
        // Linear regression of log(R/S) vs log(lag)
        const logLags = lags.map(l => Math.log(l));
        const logRS = rsValues.map(rs => Math.log(Math.max(rs, 0.0001)));
        
        const { slope } = this.linearRegression(logLags, logRS);
        
        // Clamp to valid range
        return Math.max(0, Math.min(1, slope));
    }
    
    /**
     * Interpret Hurst exponent for trading decisions
     */
    interpret(hurst: number): {
        behavior: 'MEAN_REVERTING' | 'RANDOM_WALK' | 'TRENDING';
        confidence: number;
        strategyType: 'RANGE_TRADING' | 'TREND_FOLLOWING' | 'NEUTRAL';
        shouldTrade: boolean;
    } {
        if (hurst < 0.45) {
            return {
                behavior: 'MEAN_REVERTING',
                confidence: (0.5 - hurst) * 2,
                strategyType: 'RANGE_TRADING',
                shouldTrade: hurst < 0.35 // Strong mean reversion
            };
        } else if (hurst > 0.55) {
            return {
                behavior: 'TRENDING',
                confidence: (hurst - 0.5) * 2,
                strategyType: 'TREND_FOLLOWING',
                shouldTrade: true
            };
        } else {
            return {
                behavior: 'RANDOM_WALK',
                confidence: 1 - Math.abs(hurst - 0.5) * 2,
                strategyType: 'NEUTRAL',
                shouldTrade: false // Hard to predict
            };
        }
    }
    
    private linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }
}
```

---

## Integration with Oscillation Detection

Combine Hurst with existing indicators for robust detection:

```typescript
class EnhancedOscillationDetector {
    detectOscillation(prices: number[]): {
        isOscillating: boolean;
        confidence: number;
        recommendation: string;
    } {
        const hurst = new HurstExponentCalculator().calculate(prices);
        const { rSquared } = this.calculateRegression(prices);
        const directionChangeRatio = this.calculateDirectionChangeRatio(prices);
        
        // Multi-factor assessment
        const isMeanReverting = hurst < 0.45;
        const hasLowTrendQuality = rSquared < 0.3;
        const isChoppy = directionChangeRatio > 0.40;
        
        // Majority vote
        const votes = [isMeanReverting, hasLowTrendQuality, isChoppy]
            .filter(Boolean).length;
        
        return {
            isOscillating: votes >= 2,
            confidence: votes / 3,
            recommendation: votes >= 2 
                ? 'AVOID_TREND_FOLLOWING' 
                : 'OK_FOR_TRENDS'
        };
    }
}
```

---

## Validation Sources

- Morpher Academy: Hurst Exponent in Trading
- MacroSynergy: Expected Returns and Hurst Exponent
- QuantifiedStrategies: Hurst Exponent Trading Strategy
- MQL5: Hurst Exponent Implementation
- QuantInsti: Hurst Exponent Calculation

---

## Key Takeaway

> **Use Hurst Exponent (H < 0.5 = oscillating) to improve oscillation detection beyond just R² and direction changes.**

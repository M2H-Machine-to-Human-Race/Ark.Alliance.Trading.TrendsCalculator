# GARCH Volatility Modeling

> **Related**: [TrendsMicroService_MathematicalTheory.md](../TrendsMicroService_MathematicalTheory.md)  
> **Status**: VALIDATED (OPTIONAL)  
> **Criticality**: MEDIUM

---

## Overview

**GARCH** (Generalized Autoregressive Conditional Heteroscedasticity) models capture **volatility clustering** - the phenomenon where high volatility periods are followed by high volatility, and low by low.

---

## Why It Matters for Crypto Trading

Cryptocurrency markets exhibit strong volatility clustering:

| Characteristic | Impact |
|----------------|--------|
| Volatility clusters | Constant-volatility assumptions fail |
| Fat tails | More extreme moves than normal distribution |
| Leverage effect | Negative returns increase volatility more than positive |

---

## GARCH(1,1) Model

The most common GARCH specification:

```
σ²(t) = ω + α × ε²(t-1) + β × σ²(t-1)
```

| Parameter | Meaning | Typical Range |
|-----------|---------|---------------|
| **ω** (omega) | Long-term variance constant | > 0 |
| **α** (alpha) | ARCH coefficient (shock impact) | 0.05 - 0.15 |
| **β** (beta) | GARCH coefficient (persistence) | 0.80 - 0.95 |

> **Constraint**: α + β < 1 for stationarity

---

## Interpretation

| α + β Value | Meaning |
|-------------|---------|
| Close to 1 | Very persistent volatility (long memory) |
| Close to 0 | Quickly mean-reverting volatility |
| α high | Reactive to recent shocks |
| β high | Persistent volatility trends |

---

## Implementation

```typescript
interface GARCHParams {
    omega: number;    // Long-term variance constant
    alpha: number;    // ARCH coefficient (0 < α < 1)
    beta: number;     // GARCH coefficient (0 < β < 1)
}

class GARCHHelper {
    /**
     * Estimate GARCH(1,1) parameters from return data
     * Simplified estimation (production would use MLE)
     */
    estimateParameters(returns: number[]): GARCHParams {
        const variance = this.variance(returns);
        
        // Simplified initial estimates based on typical values
        const omega = variance * 0.05;
        const alpha = 0.10;
        const beta = 0.85;
        
        // Ensure constraint: α + β < 1
        return { omega, alpha, beta };
    }
    
    /**
     * Forecast conditional volatility
     */
    forecastVolatility(
        params: GARCHParams,
        returns: number[],
        horizon: number
    ): number[] {
        const { omega, alpha, beta } = params;
        const forecasts: number[] = [];
        
        // Current conditional variance estimate
        let sigma2 = this.variance(returns);
        const lastReturn = returns[returns.length - 1];
        const lastShock2 = lastReturn * lastReturn;
        
        for (let h = 1; h <= horizon; h++) {
            if (h === 1) {
                // One-step ahead
                sigma2 = omega + alpha * lastShock2 + beta * sigma2;
            } else {
                // Multi-step: mean-reverting forecast
                const longTermVar = omega / (1 - alpha - beta);
                sigma2 = longTermVar + Math.pow(alpha + beta, h - 1) * (sigma2 - longTermVar);
            }
            forecasts.push(Math.sqrt(sigma2));
        }
        
        return forecasts;
    }
    
    /**
     * Calculate historical conditional volatility series
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
     * Classify current volatility regime
     */
    classifyVolatilityRegime(
        currentVol: number,
        historicalVol: number[]
    ): 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME' {
        const mean = this.mean(historicalVol);
        const std = this.stdDev(historicalVol);
        
        const zScore = (currentVol - mean) / std;
        
        if (zScore < -1) return 'LOW';
        if (zScore < 1) return 'NORMAL';
        if (zScore < 2) return 'HIGH';
        return 'EXTREME';
    }
    
    private variance(data: number[]): number {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        return data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
    }
}
```

---

## Trading Applications

### 1. Dynamic Stop-Loss

```typescript
/**
 * Adjust stop-loss based on current volatility
 */
function dynamicStopLoss(
    baseStopPercent: number,
    currentVolatility: number,
    historicalVolatility: number
): number {
    const volRatio = currentVolatility / historicalVolatility;
    
    // Widen stops in high volatility, tighten in low volatility
    return baseStopPercent * volRatio;
}
```

### 2. Position Sizing

```typescript
/**
 * Reduce position size when volatility is high
 */
function volatilityAdjustedPosition(
    basePosition: number,
    currentVolatility: number,
    targetVolatility: number
): number {
    return basePosition * (targetVolatility / currentVolatility);
}
```

### 3. Signal Threshold Adjustment

```typescript
/**
 * Require stronger signals in high volatility
 */
function adjustedThreshold(
    baseThreshold: number,
    volatilityRegime: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME'
): number {
    const multipliers = {
        'LOW': 0.8,
        'NORMAL': 1.0,
        'HIGH': 1.3,
        'EXTREME': 1.5
    };
    
    return baseThreshold * multipliers[volatilityRegime];
}
```

---

## EGARCH for Crypto

For cryptocurrency with asymmetric volatility (negative returns increase vol more):

```
ln(σ²(t)) = ω + α × g(z(t-1)) + β × ln(σ²(t-1))

where g(z) = θ × z + γ × (|z| - E[|z|])
```

EGARCH naturally handles:
- Leverage effect (asymmetry)
- Non-negativity of variance
- Better fit for crypto markets

---

## Validation Sources

- MDPI: GARCH Models for Cryptocurrency
- Medium: GARCH for High-Frequency Trading
- GitHub: GARCH Implementation Examples
- ResearchGate: EGARCH for Bitcoin

---

## Implementation Notes

> **Warning**: Full GARCH estimation requires Maximum Likelihood Estimation (MLE), which is computationally intensive. Consider:
> 1. Using pre-estimated parameters
> 2. Simplified variance targeting
> 3. External Python service with `arch` library

---

## Key Takeaway

> **GARCH is optional but valuable for crypto. Use it for dynamic stop-losses and position sizing based on volatility regime.**

# Autocorrelation Testing

> **Related**: [TrendsMicroService_MathematicalTheory.md](../TrendsMicroService_MathematicalTheory.md)  
> **Status**: VALIDATED  
> **Criticality**: CRITICAL

---

## Overview

**Autocorrelation** occurs when values in a time series are correlated with their own past values. Financial data, especially high-frequency data, exhibits strong autocorrelation which violates the independence assumption of linear regression.

---

## Why It Matters

| Assumption Violated | Impact |
|---------------------|--------|
| Independent residuals | R² is artificially inflated |
| Constant variance | Confidence intervals are invalid |
| Unbiased estimates | Predictions are unreliable |

> **If autocorrelation is present, your R² is lying to you.**

---

## Durbin-Watson Test

The Durbin-Watson statistic tests for **first-order autocorrelation** in regression residuals.

### Formula

```
DW = Σ(e(t) - e(t-1))² / Σe(t)²
```

### Interpretation

| DW Value | Interpretation |
|----------|----------------|
| **DW ≈ 0** | Strong positive autocorrelation |
| **DW ≈ 2** | No autocorrelation (ideal) |
| **DW ≈ 4** | Strong negative autocorrelation |

### Decision Rules

| Condition | Conclusion | Action |
|-----------|------------|--------|
| DW < 1.5 | Positive autocorrelation | Adjust R² downward |
| 1.5 ≤ DW ≤ 2.5 | No significant autocorrelation | Results are valid |
| DW > 2.5 | Negative autocorrelation | Investigate further |

---

## Implementation

```typescript
class AutocorrelationHelper {
    /**
     * Calculate Durbin-Watson statistic
     * Tests for first-order autocorrelation in residuals
     */
    calculateDurbinWatson(residuals: number[]): number {
        let sumSquaredDiff = 0;
        let sumSquared = 0;
        
        for (let i = 1; i < residuals.length; i++) {
            sumSquaredDiff += Math.pow(residuals[i] - residuals[i - 1], 2);
        }
        
        for (const residual of residuals) {
            sumSquared += Math.pow(residual, 2);
        }
        
        if (sumSquared === 0) return 2.0; // No variation
        
        return sumSquaredDiff / sumSquared;
    }
    
    /**
     * Calculate first-order autocorrelation coefficient
     * ρ = Σ(x(t) * x(t-1)) / Σx(t)²
     */
    calculateFirstOrderAutocorrelation(data: number[]): number {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const centered = data.map(d => d - mean);
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 1; i < centered.length; i++) {
            numerator += centered[i] * centered[i - 1];
        }
        
        for (const c of centered) {
            denominator += c * c;
        }
        
        if (denominator === 0) return 0;
        
        return numerator / denominator;
    }
    
    /**
     * Check if autocorrelation is significant
     */
    hasSignificantAutocorrelation(residuals: number[]): {
        hasAutocorrelation: boolean;
        durbinWatson: number;
        firstOrderCorr: number;
        severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
    } {
        const dw = this.calculateDurbinWatson(residuals);
        const foCorr = this.calculateFirstOrderAutocorrelation(residuals);
        
        let severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE' = 'NONE';
        let hasAutocorrelation = false;
        
        if (dw < 1.0 || dw > 3.0) {
            severity = 'SEVERE';
            hasAutocorrelation = true;
        } else if (dw < 1.5 || dw > 2.5) {
            severity = 'MODERATE';
            hasAutocorrelation = true;
        } else if (dw < 1.7 || dw > 2.3) {
            severity = 'MILD';
            hasAutocorrelation = true;
        }
        
        return { hasAutocorrelation, durbinWatson: dw, firstOrderCorr: foCorr, severity };
    }
    
    /**
     * Adjust R² for autocorrelation
     * Uses a simplified correction factor
     */
    adjustRSquaredForAutocorrelation(
        rSquared: number,
        durbinWatson: number,
        n: number
    ): number {
        // Estimate first-order autocorrelation from DW
        const rho = 1 - (durbinWatson / 2);
        
        // Simplified adjustment
        // True effective sample size is reduced by autocorrelation
        const effectiveN = n * (1 - rho) / (1 + rho);
        const adjustmentFactor = effectiveN / n;
        
        // Apply adjustment
        return rSquared * adjustmentFactor;
    }
}
```

---

## Ljung-Box Test

For testing autocorrelation at **multiple lags** (not just first-order):

```typescript
/**
 * Ljung-Box Q statistic
 * Tests H₀: no autocorrelation up to lag k
 */
calculateLjungBox(residuals: number[], maxLag: number = 10): {
    statistic: number;
    pValue: number;
    hasAutocorrelation: boolean;
} {
    const n = residuals.length;
    let qStatistic = 0;
    
    for (let k = 1; k <= maxLag; k++) {
        const rk = this.calculateAutocorrelationAtLag(residuals, k);
        qStatistic += (rk * rk) / (n - k);
    }
    
    qStatistic *= n * (n + 2);
    
    // Critical value for chi-squared, df=maxLag, α=0.05
    // For df=10: critical value ≈ 18.31
    const criticalValue = 18.31;
    
    return {
        statistic: qStatistic,
        pValue: qStatistic > criticalValue ? 0.01 : 0.10,
        hasAutocorrelation: qStatistic > criticalValue
    };
}

private calculateAutocorrelationAtLag(data: number[], lag: number): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const centered = data.map(d => d - mean);
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = lag; i < centered.length; i++) {
        numerator += centered[i] * centered[i - lag];
    }
    
    for (const c of centered) {
        denominator += c * c;
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
}
```

---

## Integration with Regression

```typescript
class ValidatedLinearRegression {
    calculate(prices: number[]): RegressionResult {
        // 1. Perform regression
        const { slope, intercept, rSquared } = this.basicRegression(prices);
        
        // 2. Calculate residuals
        const residuals = prices.map((p, i) => p - (slope * i + intercept));
        
        // 3. Test for autocorrelation
        const autocorrHelper = new AutocorrelationHelper();
        const autocorrTest = autocorrHelper.hasSignificantAutocorrelation(residuals);
        
        // 4. Adjust R² if needed
        let adjustedRSquared = rSquared;
        if (autocorrTest.hasAutocorrelation) {
            adjustedRSquared = autocorrHelper.adjustRSquaredForAutocorrelation(
                rSquared,
                autocorrTest.durbinWatson,
                prices.length
            );
            
            console.warn(
                `[Regression] Autocorrelation detected (DW=${autocorrTest.durbinWatson.toFixed(2)}, ` +
                `severity=${autocorrTest.severity}). R² adjusted: ${rSquared.toFixed(3)} → ${adjustedRSquared.toFixed(3)}`
            );
        }
        
        return {
            slope,
            intercept,
            rSquared,
            adjustedRSquared,
            autocorrelation: autocorrTest
        };
    }
}
```

---

## Validation Sources

- Investopedia: Durbin-Watson Statistic
- EstiMa: Time Series Autocorrelation
- StackExchange: Interpreting Durbin-Watson
- TowardsDataScience: Autocorrelation in Time Series

---

## Key Takeaway

> **Always test for autocorrelation after regression. If DW < 1.5 or DW > 2.5, your R² is inflated.**

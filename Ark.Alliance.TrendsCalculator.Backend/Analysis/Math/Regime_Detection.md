# Market Regime Detection

> **Related**: [TrendsMicroService_MathematicalTheory.md](../TrendsMicroService_MathematicalTheory.md)  
> **Status**: VALIDATED (OPTIONAL)  
> **Criticality**: MEDIUM

---

## Overview

Markets operate in different **regimes** (trending, ranging, volatile). Strategies that work in one regime often fail in another. **Regime detection** allows adaptive strategy selection.

---

## Why Regime Detection Matters

| Problem | Solution |
|---------|----------|
| Trend-following loses in ranging markets | Detect ranging → switch to mean reversion |
| Mean reversion fails in trends | Detect trending → switch to momentum |
| Static parameters underperform | Adjust parameters per regime |

---

## Regime Types

| Regime | Characteristics | Strategy Adjustment |
|--------|-----------------|---------------------|
| **TRENDING_UP** | H > 0.5, positive momentum | Aggressive long bias |
| **TRENDING_DOWN** | H > 0.5, negative momentum | Aggressive short bias |
| **RANGING** | H < 0.5, low volatility | Mean reversion, reduce size |
| **HIGH_VOLATILITY** | Vol > 2σ historical | Wider stops, smaller positions |

---

## Detection Methods

### Method 1: Hurst-Based (Simple)

Use Hurst Exponent for quick classification:

```typescript
class SimpleRegimeDetector {
    detect(prices: number[]): MarketRegime {
        const hurst = new HurstExponentCalculator().calculate(prices);
        const momentum = this.calculateMomentum(prices);
        const volatility = this.calculateVolatility(prices);
        const historicalVol = this.getHistoricalVolatility();
        
        // High volatility overrides other regimes
        if (volatility > historicalVol * 2) {
            return {
                type: 'HIGH_VOLATILITY',
                probability: 0.8,
                hurst,
                volatility
            };
        }
        
        // Trending
        if (hurst > 0.55) {
            return {
                type: momentum > 0 ? 'TRENDING_UP' : 'TRENDING_DOWN',
                probability: (hurst - 0.5) * 2,
                hurst,
                momentum
            };
        }
        
        // Ranging
        return {
            type: 'RANGING',
            probability: (0.5 - hurst) * 2,
            hurst
        };
    }
}
```

### Method 2: Multi-Factor (Recommended)

Combine multiple indicators for robust detection:

```typescript
interface RegimeIndicators {
    hurst: number;
    rSquared: number;
    volatilityZScore: number;
    momentumScore: number;
    directionChangeRatio: number;
}

class MultiFactorRegimeDetector {
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
        const [regime, score] = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)[0];
        
        return {
            type: regime as RegimeType,
            probability: score,
            indicators
        };
    }
    
    private scoreTrendingUp(ind: RegimeIndicators): number {
        return (
            (ind.hurst > 0.55 ? 0.3 : 0) +
            (ind.rSquared > 0.5 ? 0.2 : 0) +
            (ind.momentumScore > 0.3 ? 0.3 : 0) +
            (ind.directionChangeRatio < 0.3 ? 0.2 : 0)
        );
    }
    
    private scoreRanging(ind: RegimeIndicators): number {
        return (
            (ind.hurst < 0.45 ? 0.3 : 0) +
            (ind.rSquared < 0.3 ? 0.3 : 0) +
            (ind.directionChangeRatio > 0.4 ? 0.2 : 0) +
            (ind.volatilityZScore < 0 ? 0.2 : 0)
        );
    }
    
    private scoreHighVolatility(ind: RegimeIndicators): number {
        return ind.volatilityZScore > 2 ? 0.9 : 
               ind.volatilityZScore > 1.5 ? 0.6 : 
               ind.volatilityZScore > 1 ? 0.3 : 0;
    }
}
```

### Method 3: Hidden Markov Model (Advanced)

For production systems requiring sophisticated regime detection:

```typescript
/**
 * Hidden Markov Model for Regime Detection
 * 
 * NOTE: Full HMM implementation requires specialized library.
 * In TypeScript, consider:
 * - Python microservice with hmmlearn
 * - Pre-trained model with simple inference
 */
interface HMMRegimeDetector {
    // Train on historical data
    train(historicalPrices: number[][]): Promise<void>;
    
    // Detect current regime
    predict(recentPrices: number[]): MarketRegime;
    
    // Get transition probabilities
    getTransitionMatrix(): number[][];
}
```

---

## Strategy Adaptation

```typescript
interface StrategyAdjustment {
    compositeScoreThreshold: number;
    stopLossMultiplier: number;
    takeProfitMultiplier: number;
    positionSizeMultiplier: number;
}

function adaptToRegime(
    baseParams: StrategyParams,
    regime: MarketRegime
): StrategyParams {
    const adjustments: Record<RegimeType, StrategyAdjustment> = {
        'TRENDING_UP': {
            compositeScoreThreshold: 0.8,   // More aggressive entry
            stopLossMultiplier: 1.0,
            takeProfitMultiplier: 1.3,      // Let winners run
            positionSizeMultiplier: 1.2
        },
        'TRENDING_DOWN': {
            compositeScoreThreshold: 0.8,
            stopLossMultiplier: 1.0,
            takeProfitMultiplier: 1.3,
            positionSizeMultiplier: 1.2
        },
        'RANGING': {
            compositeScoreThreshold: 1.5,   // More conservative
            stopLossMultiplier: 0.8,
            takeProfitMultiplier: 0.7,      // Take profits quickly
            positionSizeMultiplier: 0.7
        },
        'HIGH_VOLATILITY': {
            compositeScoreThreshold: 1.3,
            stopLossMultiplier: 1.5,        // Wider stops
            takeProfitMultiplier: 1.0,
            positionSizeMultiplier: 0.5     // Smaller positions
        }
    };
    
    const adj = adjustments[regime.type];
    
    return {
        ...baseParams,
        compositeScoreThreshold: baseParams.compositeScoreThreshold * adj.compositeScoreThreshold,
        sigma: baseParams.sigma * adj.stopLossMultiplier,
        takeProfitPercent: baseParams.takeProfitPercent * adj.takeProfitMultiplier,
        investment: baseParams.investment * adj.positionSizeMultiplier
    };
}
```

---

## Regime Transitions

Track regime changes to anticipate transitions:

```typescript
class RegimeTransitionTracker {
    private history: MarketRegime[] = [];
    
    update(newRegime: MarketRegime): void {
        this.history.push(newRegime);
        if (this.history.length > 100) {
            this.history.shift();
        }
    }
    
    getTransitionProbabilities(): Record<string, Record<string, number>> {
        const counts: Record<string, Record<string, number>> = {};
        
        for (let i = 1; i < this.history.length; i++) {
            const from = this.history[i - 1].type;
            const to = this.history[i].type;
            
            if (!counts[from]) counts[from] = {};
            if (!counts[from][to]) counts[from][to] = 0;
            counts[from][to]++;
        }
        
        // Normalize to probabilities
        const probs: Record<string, Record<string, number>> = {};
        for (const from of Object.keys(counts)) {
            probs[from] = {};
            const total = Object.values(counts[from]).reduce((a, b) => a + b, 0);
            for (const to of Object.keys(counts[from])) {
                probs[from][to] = counts[from][to] / total;
            }
        }
        
        return probs;
    }
    
    mostLikelyNextRegime(currentRegime: RegimeType): RegimeType {
        const probs = this.getTransitionProbabilities()[currentRegime];
        if (!probs) return currentRegime;
        
        return Object.entries(probs)
            .sort(([, a], [, b]) => b - a)[0][0] as RegimeType;
    }
}
```

---

## Validation Sources

- QuantStart: Hidden Markov Models for Regime Detection
- QuestDB: Market Regime Detection
- Medium: HMM for Trading Strategies
- QuantInsti: Market Regime Detection with HMM

---

## Implementation Notes

> **Recommendation**: Start with the Multi-Factor method (Method 2). It provides good accuracy without the complexity of HMM. Graduate to HMM if higher accuracy is needed.

---

## Key Takeaway

> **Detect market regime and adapt strategy parameters accordingly. A trending strategy will fail in a ranging market.**

# Comprehensive Trading Metrics

> **Related**: [TrendsMicroService_MathematicalTheory.md](../TrendsMicroService_MathematicalTheory.md)  
> **Status**: VALIDATED  
> **Criticality**: HIGH

---

## Overview

Simple accuracy metrics (% correct predictions) are **insufficient** for evaluating trading strategies. Financial metrics must account for risk, drawdowns, and the asymmetry between wins and losses.

---

## Current vs Recommended Metrics

| Current Metrics | Problem |
|-----------------|---------|
| Direction Accuracy | 60% accuracy can still lose money if losses > gains |
| MAPE | Doesn't account for trading costs or risk |
| RMSE | Statistical, not financial |

| Recommended Metrics | Purpose |
|---------------------|---------|
| **Sharpe Ratio** | Risk-adjusted return |
| **Sortino Ratio** | Downside-risk adjusted return |
| **Max Drawdown** | Worst-case loss |
| **Profit Factor** | Sustainability of profits |

---

## Complete Metrics Suite

### Return Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| **Total Return** | (Final - Initial) / Initial | Overall profit/loss |
| **CAGR** | (Final/Initial)^(1/years) - 1 | Annualized growth rate |
| **Win Rate** | Winning trades / Total trades | % profitable |

### Risk-Adjusted Metrics

| Metric | Formula | Good Value |
|--------|---------|------------|
| **Sharpe Ratio** | (R - Rf) / σ × √252 | > 1.0 |
| **Sortino Ratio** | (R - Rf) / σ_down × √252 | > 1.5 |
| **Calmar Ratio** | CAGR / Max Drawdown | > 1.0 |

### Risk Metrics

| Metric | Description | Warning Level |
|--------|-------------|---------------|
| **Max Drawdown** | Largest peak-to-trough decline | > 20% |
| **Avg Drawdown** | Average decline size | > 10% |
| **VaR 95%** | 95th percentile daily loss | Context-dependent |
| **CVaR 95%** | Expected loss beyond VaR | Context-dependent |

---

## Implementation

```typescript
interface ComprehensiveMetrics {
    // Return Metrics
    totalReturn: number;
    cagr: number;
    winRate: number;
    
    // Risk-Adjusted Metrics
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    
    // Risk Metrics
    maxDrawdown: number;
    avgDrawdown: number;
    valueAtRisk95: number;
    conditionalVaR95: number;
    
    // Profitability
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    expectancy: number;
}

class MetricsCalculator {
    /**
     * Sharpe Ratio: Risk-adjusted return
     * (Mean Return - Risk-Free Rate) / Std Dev × √252
     */
    calculateSharpeRatio(
        returns: number[], 
        riskFreeRate: number = 0.02
    ): number {
        const meanReturn = this.mean(returns);
        const stdDev = this.stdDev(returns);
        const dailyRiskFree = riskFreeRate / 252;
        
        if (stdDev === 0) return 0;
        
        return ((meanReturn - dailyRiskFree) / stdDev) * Math.sqrt(252);
    }
    
    /**
     * Sortino Ratio: Like Sharpe but only penalizes downside volatility
     */
    calculateSortinoRatio(
        returns: number[], 
        riskFreeRate: number = 0.02
    ): number {
        const meanReturn = this.mean(returns);
        const downsideReturns = returns.filter(r => r < 0);
        const downsideDev = this.stdDev(downsideReturns);
        const dailyRiskFree = riskFreeRate / 252;
        
        if (downsideDev === 0) return meanReturn > 0 ? Infinity : 0;
        
        return ((meanReturn - dailyRiskFree) / downsideDev) * Math.sqrt(252);
    }
    
    /**
     * Maximum Drawdown: Largest peak-to-trough decline
     */
    calculateMaxDrawdown(equity: number[]): number {
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
     * Profit Factor: Gross Profit / Gross Loss
     * > 1.0 = profitable, > 1.5 = good, > 2.0 = excellent
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
     * Expectancy: Average expected profit per trade
     */
    calculateExpectancy(trades: Trade[]): number {
        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl < 0);
        
        if (trades.length === 0) return 0;
        
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
     * Value at Risk (VaR): 95th percentile loss
     */
    calculateVaR(returns: number[], confidence: number = 0.95): number {
        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidence) * sorted.length);
        return -sorted[index]; // Return as positive number
    }
    
    /**
     * Conditional VaR (CVaR): Expected loss beyond VaR
     * Also known as Expected Shortfall
     */
    calculateCVaR(returns: number[], confidence: number = 0.95): number {
        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidence) * sorted.length);
        const tailReturns = sorted.slice(0, index);
        
        if (tailReturns.length === 0) return 0;
        
        return -this.mean(tailReturns);
    }
    
    /**
     * Calculate all metrics at once
     */
    calculateAll(equity: number[], trades: Trade[]): ComprehensiveMetrics {
        const returns = equity.slice(1).map((e, i) => (e - equity[i]) / equity[i]);
        
        return {
            totalReturn: (equity[equity.length - 1] - equity[0]) / equity[0],
            cagr: this.calculateCAGR(equity),
            winRate: trades.filter(t => t.pnl > 0).length / trades.length,
            
            sharpeRatio: this.calculateSharpeRatio(returns),
            sortinoRatio: this.calculateSortinoRatio(returns),
            calmarRatio: this.calculateCAGR(equity) / this.calculateMaxDrawdown(equity),
            
            maxDrawdown: this.calculateMaxDrawdown(equity),
            avgDrawdown: this.calculateAvgDrawdown(equity),
            valueAtRisk95: this.calculateVaR(returns, 0.95),
            conditionalVaR95: this.calculateCVaR(returns, 0.95),
            
            profitFactor: this.calculateProfitFactor(trades),
            avgWin: this.mean(trades.filter(t => t.pnl > 0).map(t => t.pnl)),
            avgLoss: this.mean(trades.filter(t => t.pnl < 0).map(t => Math.abs(t.pnl))),
            expectancy: this.calculateExpectancy(trades)
        };
    }
}
```

---

## Sharpe Ratio Limitations

The Sharpe Ratio has known limitations:

| Limitation | Solution |
|------------|----------|
| Assumes normal distribution | Use Sortino for asymmetric returns |
| Treats all volatility as bad | Sortino only penalizes downside |
| Can be manipulated | Use Deflated Sharpe Ratio |
| Ignores fat tails | Include VaR and CVaR |

### Deflated Sharpe Ratio

When testing multiple strategies, use the **Deflated Sharpe Ratio** (López de Prado, 2014) to account for selection bias:

```typescript
/**
 * Deflated Sharpe Ratio: Accounts for multiple testing
 */
calculateDeflatedSharpe(
    observedSharpe: number,
    numberOfTrials: number,
    skewness: number,
    kurtosis: number
): number {
    // Simplified implementation
    const expectedMaxSharpe = Math.sqrt(2 * Math.log(numberOfTrials));
    return observedSharpe - expectedMaxSharpe;
}
```

---

## Validation Sources

- Stratzy: Strategy Performance Metrics
- QuantStart: Sharpe Ratio and its Limitations
- López de Prado: "The Deflated Sharpe Ratio" (2014)
- Investopedia: Sortino Ratio
- Schwab: Understanding Risk-Adjusted Returns

---

## Key Takeaway

> **Never evaluate a strategy on accuracy alone. Use Sharpe, Sortino, Max Drawdown, and Profit Factor together.**

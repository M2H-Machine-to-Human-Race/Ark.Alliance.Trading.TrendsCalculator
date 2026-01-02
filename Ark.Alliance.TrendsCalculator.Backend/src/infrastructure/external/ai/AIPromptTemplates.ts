/**
 * @fileoverview AI Prompt Templates
 * @module infrastructure/external/ai/AIPromptTemplates
 * 
 * Centralized prompt templates for Gemini AI trend analysis.
 * Segregated from calculator logic for maintainability.
 * 
 * Based on StrategyEngineLogic.md and TrendsCalculationAndIaDynamicStrategyParametres.md
 */

import { MarketMicroData } from './types';
import { StrategyContextParams } from './GeminiStrategyParamsCalculator';
import { TrendDirection } from '@share/enums';

/**
 * System prompt defining AI role and constraints
 * 
 * @description
 * Establishes the AI as a Quantitative Trading Engine specialized in
 * cryptocurrency futures micro-structure analysis for the Click Strategy.
 */
export const GEMINI_SYSTEM_PROMPT = `You are an expert Quantitative Trading Engine specialized in cryptocurrency futures micro-structure analysis.

## Your Core Function
Analyze 1-minute Price Action combined with Order Flow data to determine:
1. Trend Direction (tendance)
2. Dynamic Inversion Threshold (sigma)
3. Dynamic Profit Step (takeProfitPnlClick)

## Trading Strategy Context (Click Strategy)

You are part of a "Click Strategy" that works as follows:

### Sigma (Inversion Threshold)
- When position PnL drops below (currentPnL - sigma), position INVERTS (flips direction)
- Sigma = loss tolerance before reversal
- Should be calculated from: ATR(10) × multiplier adjusted for order book density
- Typical range: 0.002 to 0.01 (as percentage of price)
- Higher volatility → Higher sigma (more breathing room)
- Dense order book → Lower sigma (support/resistance tighter)

### TakeProfitPnlClick (Profit Step)
- Each "click" captures this profit increment
- After each click, the trailing stop RAISES (locks profit)
- Should be based on: Average Candle Body Size × 0.5-0.8
- Range: 0.001 to 0.005 (as percentage)
- Smaller bodies → Smaller takeProfitPnlClick (tighter targets)

### Decision Thresholds
| Condition | Decision |
|-----------|----------|
| Strong trend + aligned indicators | LONG or SHORT with high confidence |
| Oscillating/range-bound market | WAIT (triggers retry in 2 seconds) |
| Conflicting signals | WAIT with explanation |
| Insufficient data quality | WAIT with "insufficient_data" reason |

## Critical Constraints
- If unable to determine direction with confidence ≥ 0.5: MUST return "WAIT"
- NEVER guess - if uncertain, return "WAIT"
- Sigma and takeProfitPnlClick MUST be proportional to volatility
- Reasoning MUST cite specific data points (e.g., "imbalance 0.23 indicates...")
- Return valid JSON ONLY`;

/**
 * Expected AI response JSON schema
 */
export interface AIResponseSchema {
    /** Symbol being analyzed */
    symbol: string;
    /** Trading direction: LONG, SHORT, or WAIT */
    tendance: TrendDirection;
    /** Inversion threshold (ATR-based) */
    sigma: number;
    /** Profit step per click (body-based) */
    takeProfitPnlClick: number;
    /** Confidence score 0.0-1.0 */
    confidence: number;
    /** Technical reasoning citing data */
    reasoning: string;
}

/**
 * AI Prompt Templates class
 * 
 * @description
 * Provides segregated prompt generation for Gemini AI analysis.
 * Separate from calculation logic for maintainability and testing.
 */
export class AIPromptTemplates {

    /**
     * Get the system prompt for AI role definition
     */
    static getSystemPrompt(): string {
        return GEMINI_SYSTEM_PROMPT;
    }

    /**
     * Build user prompt from market data
     * 
     * @param data - Market micro-data
     * @param strategyParams - Optional current strategy context
     * @returns Formatted user prompt string
     */
    static buildUserPrompt(
        data: MarketMicroData,
        strategyParams?: StrategyContextParams,
        atr?: number,
        avgBody?: number
    ): string {
        // Format klines with body and range for volatility analysis
        const klinesSummary = data.klines.slice(-10).map((k, i) => {
            const body = Math.abs(k.close - k.open);
            const range = k.high - k.low;
            return `${i + 1}. O:${k.open.toFixed(4)} H:${k.high.toFixed(4)} L:${k.low.toFixed(4)} C:${k.close.toFixed(4)} | Body:${body.toFixed(4)} Range:${range.toFixed(4)}`;
        }).join('\n');

        // Calculate metrics if not provided
        const calculatedAtr = atr ?? AIPromptTemplates.calculateATR(data.klines);
        const calculatedAvgBody = avgBody ?? AIPromptTemplates.calculateAvgBody(data.klines);

        // Last 5 closes for trend detection
        const last5Closes = data.klines.slice(-5).map(k => k.close.toFixed(4)).join(', ');

        return `## MARKET ANALYSIS REQUEST
Symbol: ${data.symbol}
Timestamp: ${new Date().toISOString()}

### REAL-TIME DATA

**Price Action (Last 10 Candles, 1-minute)**
\`\`\`
${klinesSummary}
\`\`\`

**Order Flow Metrics**
| Metric | Value | Interpretation |
|--------|-------|----------------|
| Last Price | ${data.lastPrice.toFixed(4)} | Current market price |
| Order Book Imbalance | ${data.imbalance.toFixed(4)} | -1=heavy sells, +1=heavy buys |
| Volatility Score | ${data.volatilityScore.toFixed(4)} | Sum of (range/open×1000) |
| ATR(10) | ${calculatedAtr.toFixed(4)} | Average True Range |
| Avg Candle Body | ${calculatedAvgBody.toFixed(4)} | Average |open-close| |
| Last 5 Closes | [${last5Closes}] | Recent price direction |

${strategyParams ? `
**Current Strategy Parameters**
| Parameter | Value | Description |
|-----------|-------|-------------|
| Investment | ${strategyParams.investment} USDT | Position capital |
| Current Sigma | ${strategyParams.sigma} | Active inversion threshold |
| Current TakeProfitPnlClick | ${strategyParams.takeProfitPnlClick} | Active profit step |
| Risk Tolerance | ${strategyParams.riskTolerance || 'MEDIUM'} | LOW/MEDIUM/HIGH |
` : ''}

### REQUIRED RESPONSE FORMAT
Return ONLY valid JSON:

\`\`\`json
{
  "symbol": "${data.symbol}",
  "tendance": "LONG" | "SHORT" | "WAIT",
  "sigma": <number: inversion threshold based on ATR>,
  "takeProfitPnlClick": <number: profit step based on avg body>,
  "confidence": <number: 0.0 to 1.0>,
  "reasoning": "<string: 2-3 sentences citing specific metrics>"
}
\`\`\`

### CALCULATION GUIDELINES

**SIGMA (inversion threshold):**
- Base = ATR(10) × 1.5
- If neutral imbalance (|imb| < 0.15): × 1.2 (wider)
- If high volatility (score > 15): × 1.3
- Output range: 0.002 to 0.010

**TAKE_PROFIT_PNL_CLICK (profit step):**
- Base = Avg Candle Body × 0.6
- If strong trend (|imb| > 0.3): × 1.2
- Output range: 0.001 to 0.005

### DECISION RULES
- imbalance > 0.20 AND closes ascending → LONG
- imbalance < -0.20 AND closes descending → SHORT
- |imbalance| < 0.10 OR conflicting signals → WAIT
- confidence < 0.50 → MUST return "WAIT"
- WAIT = "retry in 2 seconds until clear signal"`;
    }

    /**
     * Calculate ATR (Average True Range)
     */
    static calculateATR(klines: Array<{ open: number; high: number; low: number; close: number }>): number {
        if (klines.length < 2) return 0;

        let sum = 0;
        for (let i = 1; i < klines.length; i++) {
            const high = klines[i].high;
            const low = klines[i].low;
            const prevClose = klines[i - 1].close;

            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            sum += tr;
        }

        return sum / (klines.length - 1);
    }

    /**
     * Calculate average candle body size
     */
    static calculateAvgBody(klines: Array<{ open: number; close: number }>): number {
        if (klines.length === 0) return 0;

        const bodies = klines.map(k => Math.abs(k.close - k.open));
        return bodies.reduce((a, b) => a + b, 0) / bodies.length;
    }

    /**
     * Validate AI response structure
     */
    static validateResponse(analysis: any): analysis is AIResponseSchema {
        if (!analysis || typeof analysis !== 'object') return false;

        // Tendance: LONG, SHORT, or WAIT
        if (!Object.values(TrendDirection).includes(analysis.tendance)) return false;

        // Confidence: 0.0 to 1.0
        if (typeof analysis.confidence !== 'number' ||
            analysis.confidence < 0 ||
            analysis.confidence > 1) return false;

        // If confidence < 0.5, tendance MUST be WAIT
        if (analysis.confidence < 0.5 && analysis.tendance !== 'WAIT') {
            return false;
        }

        // Sigma: ATR-based range (0.001 to 0.05)
        if (typeof analysis.sigma !== 'number' ||
            analysis.sigma < 0.001 ||
            analysis.sigma > 0.05) return false;

        // TakeProfitPnlClick: body-based range (0.0005 to 0.02)
        if (typeof analysis.takeProfitPnlClick !== 'number' ||
            analysis.takeProfitPnlClick < 0.0005 ||
            analysis.takeProfitPnlClick > 0.02) return false;

        // Reasoning must be meaningful (30+ chars)
        if (typeof analysis.reasoning !== 'string' ||
            analysis.reasoning.length < 30) return false;

        return true;
    }
}

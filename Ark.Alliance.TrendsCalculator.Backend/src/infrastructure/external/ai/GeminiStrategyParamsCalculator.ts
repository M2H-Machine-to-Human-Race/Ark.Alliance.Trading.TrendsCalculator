/**
 * @fileoverview Gemini Strategy Parameters Calculator
 * @module core/services/ai/GeminiStrategyParamsCalculator
 * 
 * Communicates with Gemini AI to calculate strategy parameters.
 * Uses configurable prompts from system_settings.
 * 
 * @refactored Copied from PositionService
 */

import { TrendDirection } from '@share/index';
import { GeminiAnalysisResult, MarketMicroData } from './types';
import { systemLogger } from '@infrastructure/SystemLogger';

/**
 * Strategy context for AI analysis
 */
export interface StrategyContextParams {
    investment: number;
    sigma: number;
    takeProfitPnlClick: number;
    riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * AI Provider configuration
 * 
 * @remarks
 * Supports Gemini 3 Flash features including thinking levels
 */
export interface AIProviderConfig {
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    /** Gemini 3 thinking level - controls reasoning depth */
    thinkingLevel?: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * GeminiStrategyParamsCalculator
 * 
 * Communicates with Gemini AI to calculate strategy parameters.
 */
export class GeminiStrategyParamsCalculator {
    private genAI: any = null;
    private model: any = null;
    private config: AIProviderConfig | null = null;

    constructor(config?: AIProviderConfig) {
        this.config = config || null;
    }

    /**
     * Set AI provider configuration
     */
    setConfig(config: AIProviderConfig): void {
        this.config = config;
        this.genAI = null;
        this.model = null;
    }

    /**
     * Initialize the Gemini AI client
     */
    private async initializeAI(): Promise<boolean> {
        if (!this.config?.apiKey) {
            return false;
        }

        try {
            // Dynamic import to avoid hard dependency
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            this.genAI = new GoogleGenerativeAI(this.config.apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: this.config.model || 'gemini-3-flash-preview',
            });
            return true;
        } catch (error: any) {
            systemLogger.error(`Failed to initialize Gemini AI: ${error.message}`, {
                source: 'GeminiStrategyParamsCalculator',
                error,
            });
            return false;
        }
    }

    /**
     * Analyze market data and get AI-calculated strategy parameters
     */
    async analyze(
        data: MarketMicroData,
        strategyParams?: StrategyContextParams
    ): Promise<GeminiAnalysisResult | null> {
        if (!this.model) {
            const initialized = await this.initializeAI();
            if (!initialized || !this.model) {
                systemLogger.warn('[Gemini] AI not initialized (missing API key)', {
                    source: 'GeminiStrategyParamsCalculator',
                });
                return null;
            }
        }

        try {
            const prompt = this.buildPrompt(data, strategyParams);

            systemLogger.debug('AI Prompt generated', {
                source: 'GeminiStrategyParamsCalculator.analyze',
                details: { symbol: data.symbol, promptLength: prompt.length },
            });

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonStr = this.extractJson(text);
            const analysis = JSON.parse(jsonStr);

            if (!this.validateResponse(analysis)) {
                systemLogger.warn('AI response validation failed', {
                    source: 'GeminiStrategyParamsCalculator.analyze',
                    details: { response: text.substring(0, 500) },
                });
                return null;
            }

            return {
                symbol: data.symbol,
                tendance: analysis.tendance as TrendDirection,
                sigma: analysis.sigma,
                takeProfitPnlClick: analysis.takeProfitPnlClick,
                reasoning: analysis.reasoning,
                confidence: analysis.confidence,
                timestamp: Date.now(),
            };
        } catch (error: any) {
            systemLogger.error(`Gemini analysis failed: ${error.message}`, {
                source: 'GeminiStrategyParamsCalculator',
                error,
            });
            return null;
        }
    }

    /**
     * Build prompt for AI analysis with structured format
     * 
     * @remarks
     * Uses comprehensive prompt engineering for Gemini 3 Flash based on
     * StrategyEngineLogic.md and TrendsCalculationAndIaDynamicStrategyParametres.md:
     * - WAIT = retry in 2s (not "I don't know")
     * - sigma = ATR-based inversion threshold
     * - takeProfitPnlClick = candle body-based profit step
     */
    private buildPrompt(data: MarketMicroData, strategyParams?: StrategyContextParams): string {
        // Format klines with body and range for volatility analysis
        const klinesSummary = data.klines.slice(-10).map((k, i) => {
            const body = Math.abs(k.close - k.open);
            const range = k.high - k.low;
            return `${i + 1}. O:${k.open.toFixed(4)} H:${k.high.toFixed(4)} L:${k.low.toFixed(4)} C:${k.close.toFixed(4)} | Body:${body.toFixed(4)} Range:${range.toFixed(4)}`;
        }).join('\n');

        // Calculate key metrics for AI context
        const bodies = data.klines.map(k => Math.abs(k.close - k.open));
        const avgBody = bodies.reduce((a, b) => a + b, 0) / bodies.length;

        // Calculate ATR (Average True Range)
        const atr = this.calculateATR(data.klines);

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
| ATR(10) | ${atr.toFixed(4)} | Average True Range |
| Avg Candle Body | ${avgBody.toFixed(4)} | Average |open-close| |
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
     * Calculate ATR (Average True Range) for sigma calculation
     */
    private calculateATR(klines: Array<{ open: number; high: number; low: number; close: number }>): number {
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
     * Extract JSON from AI response
     */
    private extractJson(text: string): string {
        let jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        return jsonStr;
    }

    /**
     * Validate AI response with strategy-aligned rules
     * 
     * @remarks
     * - WAIT (not UNKNOWN) = retry behavior
     * - confidence < 0.5 MUST return WAIT
     * - sigma range: 0.001 to 0.05 (ATR-based)
     * - takeProfitPnlClick range: 0.0005 to 0.02 (body-based)
     */
    private validateResponse(analysis: any): boolean {
        if (!analysis || typeof analysis !== 'object') return false;

        // Tendance: LONG, SHORT, or WAIT (WAIT = retry in 2s)
        if (!['LONG', 'SHORT', 'WAIT'].includes(analysis.tendance)) return false;

        // Confidence: 0.0 to 1.0
        if (typeof analysis.confidence !== 'number' ||
            analysis.confidence < 0 ||
            analysis.confidence > 1) return false;

        // If confidence < 0.5, tendance MUST be WAIT
        if (analysis.confidence < 0.5 && analysis.tendance !== 'WAIT') {
            systemLogger.warn('[AI Validation] Low confidence requires WAIT', {
                source: 'GeminiStrategyParamsCalculator',
                details: { confidence: analysis.confidence, tendance: analysis.tendance }
            });
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

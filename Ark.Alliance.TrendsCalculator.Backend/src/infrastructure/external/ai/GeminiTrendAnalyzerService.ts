/**
 * @fileoverview Gemini Trend Analyzer Service
 * @module core/services/ai/GeminiTrendAnalyzerService
 * 
 * AI-Powered Trend Analyzer Service
 * Orchestrates micro-data collection and Gemini AI analysis
 * to determine trend direction and dynamic strategy parameters.
 * 
 * @refactored Copied from PositionService
 */

import { TrendDirection } from '@share/index';
import { GeminiAnalysisResult, MarketMicroData, ServiceIndicators } from './types';
import { MarketMicroDataCalculator, IMarketDataProvider } from './MarketMicroDataCalculator';
import { GeminiStrategyParamsCalculator, AIProviderConfig } from './GeminiStrategyParamsCalculator';
import { systemLogger } from '@infrastructure/SystemLogger';

/**
 * Configuration for GeminiTrendAnalyzerService
 */
export interface GeminiTrendAnalyzerConfig {
    retryDelayMs: number;
    maxRetries: number;
    aiConfig?: AIProviderConfig;
}

const DEFAULT_CONFIG: GeminiTrendAnalyzerConfig = {
    retryDelayMs: 2000,
    maxRetries: 5,
};

/**
 * AI-Powered Trend Analyzer Service
 */
export class GeminiTrendAnalyzerService implements ServiceIndicators {
    private static instance: GeminiTrendAnalyzerService | null = null;

    private microCalculator: MarketMicroDataCalculator;
    private paramsCalculator: GeminiStrategyParamsCalculator;
    private config: GeminiTrendAnalyzerConfig;

    // Cache last analysis result per symbol
    private analysisCache: Map<string, GeminiAnalysisResult> = new Map();

    constructor(config?: Partial<GeminiTrendAnalyzerConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.microCalculator = new MarketMicroDataCalculator();
        this.paramsCalculator = new GeminiStrategyParamsCalculator(config?.aiConfig);
    }

    static getInstance(): GeminiTrendAnalyzerService {
        if (!GeminiTrendAnalyzerService.instance) {
            GeminiTrendAnalyzerService.instance = new GeminiTrendAnalyzerService();
        }
        return GeminiTrendAnalyzerService.instance;
    }

    /**
     * Set market data provider
     */
    setMarketDataProvider(provider: IMarketDataProvider): void {
        this.microCalculator.setMarketDataProvider(provider);
    }

    /**
     * Set AI configuration
     */
    setAIConfig(config: AIProviderConfig): void {
        this.paramsCalculator.setConfig(config);
    }

    /**
     * Run analysis loop until a definitive signal (LONG/SHORT) is found
     * or max retries reached.
     */
    async runUntilSignal(symbol: string, maxRetries?: number): Promise<GeminiAnalysisResult> {
        const retryLimit = maxRetries ?? this.config.maxRetries;
        let attempts = 0;

        while (attempts < retryLimit) {
            attempts++;

            // 1. Fetch Data
            const microData = await this.microCalculator.fetchMicroData(symbol);
            if (!microData) {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
            }

            // 2. Analyze with AI
            const analysis = await this.paramsCalculator.analyze(microData);

            if (analysis) {
                this.analysisCache.set(symbol, analysis);

                systemLogger.info(`[Gemini] Analysis for ${symbol}: ${analysis.tendance} (Conf: ${analysis.confidence})`, {
                    source: 'GeminiTrendAnalyzer',
                    details: analysis as any,
                });

                // 3. Check for specific signal
                if (analysis.tendance === TrendDirection.LONG || analysis.tendance === TrendDirection.SHORT) {
                    return analysis;
                }

                console.log(`[Gemini] AI returned WAIT. Retrying in ${this.config.retryDelayMs}ms... (Attempt ${attempts}/${retryLimit})`);
            }

            await new Promise((r) => setTimeout(r, this.config.retryDelayMs));
        }

        // 4. Default fallback if loop exhausts
        return {
            symbol,
            tendance: TrendDirection.WAIT,
            sigma: 2.0,
            takeProfitPnlClick: 10,
            reasoning: 'Max retries exceeded or no signal found',
            confidence: 0,
            timestamp: Date.now(),
        };
    }

    /**
     * Single analysis (no retry loop)
     */
    async analyze(symbol: string): Promise<GeminiAnalysisResult | null> {
        const microData = await this.microCalculator.fetchMicroData(symbol);
        if (!microData) {
            return null;
        }

        const analysis = await this.paramsCalculator.analyze(microData);
        if (analysis) {
            this.analysisCache.set(symbol, analysis);
        }

        return analysis;
    }

    /**
     * Get latest cached analysis
     */
    getLatestAnalysis(symbol: string): GeminiAnalysisResult | undefined {
        return this.analysisCache.get(symbol);
    }

    /**
     * Clear analysis cache
     */
    clearCache(symbol?: string): void {
        if (symbol) {
            this.analysisCache.delete(symbol);
        } else {
            this.analysisCache.clear();
        }
    }

    getIndicators(): Record<string, unknown> {
        return {
            cachedSymbols: Array.from(this.analysisCache.keys()),
            cacheSize: this.analysisCache.size,
        };
    }
}


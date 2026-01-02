/**
 * @fileoverview AI Controller
 * @module api/controllers/AIController
 * 
 * REST API endpoints for AI-powered trend analysis.
 * Integrates with GeminiStrategyParamsCalculator for market analysis.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 * 
 * @remarks
 * Follows existing controller patterns:
 * - Class-based architecture
 * - Singleton service injection
 * - Microsoft-compliant documentation
 * - Consistent error response format
 */

import { Request, Response } from 'express';
import { GeminiStrategyParamsCalculator, AIProviderConfig } from '@infrastructure/external/ai/GeminiStrategyParamsCalculator';
import { TrendCalculatorService } from '@application/services/TrendCalculatorService';
import { SystemSettingsRepository } from '@infrastructure/persistence/repositories/SystemSettingsRepository';
import { systemLogger } from '@infrastructure/SystemLogger';
import { socketService } from '@infrastructure/socketio/SocketService';

/**
 * Controller for AI analysis operations
 * 
 * @remarks
 * Provides REST endpoints for:
 * - Triggering AI analysis for a symbol
 * - Checking AI connection status
 * - Getting AI analysis results
 */
export class AIController {
    private geminiCalculator: GeminiStrategyParamsCalculator;
    private trendCalculator: TrendCalculatorService;
    private settingsRepo: SystemSettingsRepository;

    /**
     * Creates a new AIController instance
     */
    constructor() {
        this.geminiCalculator = new GeminiStrategyParamsCalculator();
        this.trendCalculator = TrendCalculatorService.getInstance();
        this.settingsRepo = SystemSettingsRepository.getInstance();

        // Initialize with settings from repository
        this.initializeAI();
    }

    /**
     * Initialize AI with settings from repository
     */
    private initializeAI(): void {
        const config: AIProviderConfig = {
            apiKey: this.settingsRepo.getString('ai_api_key', ''),
            model: this.settingsRepo.getString('ai_model', 'gemini-2.0-flash'),
            temperature: this.settingsRepo.getNumber('ai_temperature', 0.7),
            maxTokens: this.settingsRepo.getNumber('ai_max_tokens', 4096),
        };

        if (config.apiKey) {
            this.geminiCalculator.setConfig(config);
            systemLogger.info('AI Controller initialized with Gemini config', {
                source: 'AIController',
                details: { model: config.model }
            });
        }
    }

    /**
     * POST /api/ai/analyze
     * Trigger AI analysis for a symbol
     * 
     * @param req - Express request object with symbol in body
     * @param res - Express response object
     * @returns Promise resolving when response is sent
     */
    async analyze(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.body;

            if (!symbol) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_SYMBOL',
                        message: 'Symbol is required'
                    }
                });
                return;
            }

            // Check if AI is enabled
            const aiEnabled = this.settingsRepo.getBoolean('ai_enabled', false);
            if (!aiEnabled) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'AI_DISABLED',
                        message: 'AI analysis is disabled in settings'
                    }
                });
                return;
            }

            // Get price history for the symbol
            const priceHistory = this.trendCalculator.getPriceHistory(symbol);

            if (priceHistory.length < 10) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_DATA',
                        message: `Insufficient data for ${symbol}. Need at least 10 points, have ${priceHistory.length}`
                    }
                });
                return;
            }

            // Build market data from price history
            const lastPrice = priceHistory[priceHistory.length - 1];
            const klines = priceHistory.slice(-5).map((price, idx) => ({
                open: price,
                high: price * 1.001,
                low: price * 0.999,
                close: price,
                volume: 0,
            }));

            const marketData = {
                symbol: symbol.toUpperCase(),
                lastPrice,
                imbalance: 0, // Would need order book data
                volatilityScore: this.calculateVolatility(priceHistory),
                klines,
            };

            systemLogger.info(`AI analysis requested for ${symbol}`, {
                source: 'AIController',
                details: { priceHistoryLength: priceHistory.length }
            });

            // Call Gemini AI
            const result = await this.geminiCalculator.analyze(marketData);

            if (!result) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'AI_ANALYSIS_FAILED',
                        message: 'AI analysis returned no result. Check API key configuration.'
                    }
                });
                return;
            }

            // Emit AI analysis event via WebSocket
            socketService.emitAIAnalysis({
                symbol: result.symbol,
                provider: 'gemini',
                success: true,
                latency: Date.now() - result.timestamp,
                decision: result.tendance,
                confidence: result.confidence,
                timestamp: Date.now(),
            });

            res.json({
                success: true,
                data: result
            });

        } catch (error: any) {
            systemLogger.error(`AI analysis failed: ${error.message}`, {
                source: 'AIController',
                error
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'AI_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * GET /api/ai/status
     * Check AI connection status
     * 
     * @param req - Express request object
     * @param res - Express response object
     * @returns Promise resolving when response is sent
     */
    async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const aiEnabled = this.settingsRepo.getBoolean('ai_enabled', false);
            const apiKey = this.settingsRepo.getString('ai_api_key', '');
            const model = this.settingsRepo.getString('ai_model', 'gemini-2.0-flash');

            res.json({
                success: true,
                data: {
                    enabled: aiEnabled,
                    configured: !!apiKey,
                    model,
                    provider: 'gemini',
                }
            });
        } catch (error: any) {
            systemLogger.error(`Failed to get AI status: ${error.message}`, {
                source: 'AIController',
                error
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'STATUS_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * Calculate simple volatility score from price history
     */
    private calculateVolatility(prices: number[]): number {
        if (prices.length < 2) return 0;

        const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / returns.length;

        return Math.sqrt(variance) * 100; // As percentage
    }
}

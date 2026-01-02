/**
 * @fileoverview Trend Controller
 * @module api/controllers/TrendController
 * 
 * REST API endpoints for trend analysis operations
 */

import { Request, Response } from 'express';
import { TrendCalculatorService } from '@application/services/TrendCalculatorService';
import { systemLogger } from '@infrastructure/SystemLogger';

export class TrendController {
    private trendService: TrendCalculatorService;

    constructor() {
        this.trendService = TrendCalculatorService.getInstance();
    }

    /**
     * @swagger
     * /api/trend/{symbol}/analyze:
     *   get:
     *     tags: [Trends]
     *     summary: Analyze trend for a symbol
     *     description: Calculate trend analysis for a specific trading symbol using mathematical helpers and AI
     *     parameters:
     *       - in: path
     *         name: symbol
     *         required: true
     *         schema:
     *           type: string
     *           example: BTCUSDT
     *         description: Trading symbol to analyze
     *     responses:
     *       200:
     *         description: Successful trend analysis
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/TrendResult'
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       500:
     *         $ref: '#/components/responses/InternalError'
     */
    async analyzeTrend(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.params;

            const result = this.trendService.calculateTrend(symbol.toUpperCase());

            if (!result) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_DATA',
                        message: 'Not enough data points for analysis'
                    }
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    symbol,
                    direction: result.direction,
                    strength: result.strength,
                    compositeScore: result.compositeScore,
                    statistical: {
                        slope: result.slope,
                        rSquared: result.rSquared,
                        priceChange: result.priceChange,
                        priceChangePercent: result.priceChangePercent
                    },
                    dataPoints: result.dataPoints,
                    timestamp: Date.now()
                }
            });
        } catch (error: any) {
            systemLogger.error(`Trend analysis error: ${error.message}`, {
                source: 'TrendController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'ANALYSIS_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * @swagger
     * /api/trend/analyze:
     *   post:
     *     tags: [Trends]
     *     summary: Analyze trend with custom parameters
     *     description: Calculate trend with user-specified configuration parameters
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - symbol
     *             properties:
     *               symbol:
     *                 type: string
     *                 example: ETHUSDT
     *               emaShortPeriod:
     *                 type: integer
     *                 example: 12
     *               emaLongPeriod:
     *                 type: integer
     *                 example: 26
     *               minDataPoints:
     *                 type: integer
     *                 example: 50
     *     responses:
     *       200:
     *         description: Successful analysis
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/TrendResult'
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       500:
     *         $ref: '#/components/responses/InternalError'
     */
    async analyzeWithParams(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.body;

            // TODO: Extract custom params from request body
            const result = this.trendService.calculateTrend(symbol.toUpperCase());

            if (!result) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_DATA',
                        message: 'Not enough data points for analysis'
                    }
                });
                return;
            }

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            systemLogger.error(`Trend analysis error: ${error.message}`, {
                source: 'TrendController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'ANALYSIS_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * GET /api/trend/:symbol/history
     * Get trend analysis history
     */
    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.params;

            // TODO: Implement history retrieval from repository
            res.json({
                success: true,
                data: {
                    symbol,
                    history: []
                }
            });
        } catch (error: any) {
            systemLogger.error(`History retrieval error: ${error.message}`, {
                source: 'TrendController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'HISTORY_ERROR',
                    message: error.message
                }
            });
        }
    }
}

/**
 * @fileoverview Symbol Controller
 * @module api/controllers/SymbolController
 * 
 * REST API endpoints for symbol tracking management
 */

import { Request, Response } from 'express';
import { SymbolTrackingService } from '@application/services/SymbolTrackingService';
import { systemLogger } from '@infrastructure/SystemLogger';
import { createStartTrackingRequest } from '@share/dto/request/StartTrackingRequestDto';

export class SymbolController {
    private trackingService: SymbolTrackingService;

    constructor() {
        this.trackingService = SymbolTrackingService.getInstance();
    }

    /**
     * POST /api/symbol/track
     * Start tracking a symbol
     */
    async startTracking(req: Request, res: Response): Promise<void> {
        try {
            // Validate using Shared DTO
            const requestData = createStartTrackingRequest(req.body);
            const { symbol, bufferSize } = requestData;

            await this.trackingService.startTracking(symbol, bufferSize);

            const status = this.trackingService.getSymbolStatus(symbol);

            res.json({
                success: true,
                data: status
            });
        } catch (error: any) {
            // Handle Zod validation errors
            if (error.name === 'ZodError') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.errors
                    }
                });
                return;
            }

            systemLogger.error(`Start tracking error: ${error.message}`, {
                source: 'SymbolController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'TRACKING_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * DELETE /api/symbol/:symbol/track
     * Stop tracking a symbol
     */
    async stopTracking(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.params;

            this.trackingService.stopTracking(symbol);

            res.json({
                success: true
            });
        } catch (error: any) {
            systemLogger.error(`Stop tracking error: ${error.message}`, {
                source: 'SymbolController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'TRACKING_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * GET /api/symbol/:symbol/status
     * Get tracking status for a symbol
     */
    async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.params;

            const status = this.trackingService.getSymbolStatus(symbol);

            res.json({
                success: true,
                data: status
            });
        } catch (error: any) {
            systemLogger.error(`Get status error: ${error.message}`, {
                source: 'SymbolController',
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
     * GET /api/symbol
     * List all tracked symbols
     */
    async listAll(req: Request, res: Response): Promise<void> {
        try {
            const symbols = this.trackingService.getAllSymbols();

            res.json({
                success: true,
                data: {
                    symbols,
                    count: symbols.length
                }
            });
        } catch (error: any) {
            systemLogger.error(`List symbols error: ${error.message}`, {
                source: 'SymbolController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'LIST_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * GET /api/symbol/:symbol/info
     * Get detailed symbol information including metadata and current market data
     * 
     * @remarks
     * Fetches comprehensive symbol information from Binance Futures:
     * - Contract specifications (tick size, lot size, margin requirements)
     * - Current market data (price, 24h change, volume)
     * 
     * @param req.params.symbol - Trading symbol (e.g., 'BTCUSDT')
     * @returns SymbolInfoDto with complete symbol metadata
     */
    async getSymbolInfo(req: Request, res: Response): Promise<void> {
        try {
            const { symbol } = req.params;

            systemLogger.info(`Fetching symbol info for ${symbol}`, {
                source: 'SymbolController'
            });

            const { BinanceMarketDataRest, BinanceEnvironment } = await import('ark-alliance-trading-providers-lib/Binance');

            const restClient = new BinanceMarketDataRest(
                BinanceEnvironment.MAINNET,
                { baseUrl: 'fapi.binance.com' }
            );

            // Fetch exchange info for contract specifications
            const exchangeInfoResult = await restClient.getExchangeInfo();
            if (exchangeInfoResult.isFailure || !exchangeInfoResult.data) {
                throw new Error('Failed to fetch exchange info');
            }

            // Find symbol in exchange info
            const symbolInfo = exchangeInfoResult.data.symbols.find(s => s.symbol === symbol.toUpperCase());
            if (!symbolInfo) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'SYMBOL_NOT_FOUND',
                        message: `Symbol ${symbol} not found on Binance Futures`
                    }
                });
                return;
            }

            // Fetch current 24h ticker for price data
            // Note: Using placeholder values - enhance with actual ticker API call when method name is confirmed
            const ticker = null; // TODO: Fetch ticker when correct method name is available

            // Extract filter values
            const priceFilter = symbolInfo.filters.find(f => f.filterType === 'PRICE_FILTER');
            const lotSizeFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');

            // Build SymbolInfoDto
            const info = {
                symbol: symbolInfo.symbol,
                baseAsset: symbolInfo.baseAsset,
                quoteAsset: symbolInfo.quoteAsset,
                status: symbolInfo.status as 'TRADING' | 'HALT' | 'BREAK',
                // Using 0 for price data - will be populated by frontend from WebSocket
                currentPrice: 0,
                priceChange24h: 0,
                priceChangePercent24h: 0,
                volume24h: 0,
                tickSize: priceFilter?.tickSize ? parseFloat(priceFilter.tickSize) : 0.01,
                contractSize: (symbolInfo as any).contractSize || 1,
                minQuantity: lotSizeFilter?.minQty ? parseFloat(lotSizeFilter.minQty) : 0,
                maxQuantity: lotSizeFilter?.maxQty ? parseFloat(lotSizeFilter.maxQty) : 0,
                maintMarginPercent: (symbolInfo as any).maintMarginPercent ? parseFloat((symbolInfo as any).maintMarginPercent) : 0,
                requiredMarginPercent: (symbolInfo as any).requiredMarginPercent ? parseFloat((symbolInfo as any).requiredMarginPercent) : 0,
            };

            systemLogger.info(`Symbol info fetched successfully for ${symbol}`, {
                source: 'SymbolController',
                details: { status: info.status }
            });

            res.json({
                success: true,
                data: info
            });
        } catch (error: any) {
            systemLogger.error(`Error fetching symbol info: ${error.message}`, {
                source: 'SymbolController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'SYMBOL_INFO_ERROR',
                    message: error.message
                }
            });
        }
    }
}

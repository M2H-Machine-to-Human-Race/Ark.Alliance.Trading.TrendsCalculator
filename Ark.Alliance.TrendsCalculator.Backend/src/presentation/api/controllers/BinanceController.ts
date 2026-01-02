/**
 * @fileoverview Binance Controller
 * @module api/controllers/BinanceController
 * 
 * REST API endpoints for Binance WebSocket connection management.
 * Provides connection testing, connect/disconnect controls, and status monitoring.
 */

import { Request, Response } from 'express';
import { BinanceStreamService } from '@application/services/BinanceStreamService';
import { SymbolTrackingService } from '@application/services/SymbolTrackingService';
import { systemLogger } from '@infrastructure/SystemLogger';

/**
 * Controller for Binance WebSocket connection operations
 */
export class BinanceController {
    private binanceService: BinanceStreamService;
    private trackingService: SymbolTrackingService;

    constructor() {
        this.binanceService = BinanceStreamService.getInstance();
        this.trackingService = SymbolTrackingService.getInstance();
    }

    /**
     * POST /api/binance/test-connection
     * Test Binance API connectivity
     */
    async testConnection(req: Request, res: Response): Promise<void> {
        try {
            systemLogger.info('Testing Binance connection', {
                source: 'BinanceController'
            });

            const isReachable = await this.binanceService.testConnection();

            res.json({
                success: true,
                data: {
                    reachable: isReachable,
                    timestamp: Date.now()
                }
            });
        } catch (error: any) {
            systemLogger.error(`Binance connection test failed: ${error.message}`, {
                source: 'BinanceController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'CONNECTION_TEST_FAILED',
                    message: error.message
                }
            });
        }
    }

    /**
     * GET /api/binance/symbols
     * List all available Binance Futures symbols for discovery/search UI
     * 
     * @remarks
     * Fetches all USDT perpetual contracts from Binance Futures exchange info.
     * Results are filtered to active trading symbols only.
     * 
     * @returns AvailableSymbolDto array with symbol metadata
     */
    async getAvailableSymbols(req: Request, res: Response): Promise<void> {
        try {
            systemLogger.info('Fetching available Binance symbols', {
                source: 'BinanceController'
            });

            const { BinanceMarketDataRest, BinanceEnvironment } = await import('ark-alliance-trading-providers-lib/Binance');

            const restClient = new BinanceMarketDataRest(
                BinanceEnvironment.MAINNET,
                { baseUrl: 'fapi.binance.com' }
            );

            // Fetch exchange info
            const result = await restClient.getExchangeInfo();

            if (result.isFailure || !result.data) {
                throw new Error(result.error?.message || 'Failed to fetch exchange info');
            }

            // Filter to USDT perpetual contracts that are actively trading
            const symbols = result.data.symbols
                .filter(s =>
                    s.quoteAsset === 'USDT' &&
                    s.contractType === 'PERPETUAL' &&
                    s.status === 'TRADING'
                )
                .map(s => ({
                    symbol: s.symbol,
                    baseAsset: s.baseAsset,
                    quoteAsset: s.quoteAsset,
                    isActive: s.status === 'TRADING'
                }))
                .sort((a, b) => a.symbol.localeCompare(b.symbol)); // Sort alphabetically

            systemLogger.info(`Fetched ${symbols.length} available symbols`, {
                source: 'BinanceController'
            });

            res.json({
                success: true,
                data: {
                    symbols,
                    count: symbols.length
                }
            });
        } catch (error: any) {
            systemLogger.error(`Error fetching symbols: ${error.message}`, {
                source: 'BinanceController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'SYMBOLS_FETCH_ERROR',
                    message: error.message
                }
            });
        }
    }

    /**
     * POST /api/binance/connect
     * Establish Binance WebSocket connection for tracked symbols
     */
    async connect(req: Request, res: Response): Promise<void> {
        try {
            // Get all tracked symbols
            const symbols = this.trackingService.getAllSymbols();

            if (symbols.length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'NO_SYMBOLS',
                        message: 'No symbols are currently being tracked'
                    }
                });
                return;
            }

            systemLogger.info(`Connecting to Binance for ${symbols.length} symbols`, {
                source: 'BinanceController',
                details: { symbols }
            });

            await this.binanceService.connect(symbols);
            const status = this.binanceService.getStatus();

            res.json({
                success: true,
                data: status
            });
        } catch (error: any) {
            systemLogger.error(`Binance connection error: ${error.message}`, {
                source: 'BinanceController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'CONNECTION_FAILED',
                    message: error.message
                }
            });
        }
    }

    /**
     * POST /api/binance/disconnect
     * Close Binance WebSocket connection
     */
    async disconnect(req: Request, res: Response): Promise<void> {
        try {
            systemLogger.info('Disconnecting from Binance', {
                source: 'BinanceController'
            });

            await this.binanceService.disconnect();
            const status = this.binanceService.getStatus();

            res.json({
                success: true,
                data: status
            });
        } catch (error: any) {
            systemLogger.error(`Binance disconnection error: ${error.message}`, {
                source: 'BinanceController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'DISCONNECTION_FAILED',
                    message: error.message
                }
            });
        }
    }

    /**
     * GET /api/binance/status
     * Get current Binance connection status
     */
    async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const status = this.binanceService.getStatus();

            res.json({
                success: true,
                data: status
            });
        } catch (error: any) {
            systemLogger.error(`Error getting Binance status: ${error.message}`, {
                source: 'BinanceController',
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
     * GET /api/binance/klines
     * Get historical klines (candlestick data)
     * @query symbol - Trading pair (e.g., 'BTCUSDT')
     * @query interval - Kline interval (default: '1m')
     * @query limit - Number of klines (default: 100, max: 1500)
     */
    async getKlines(req: Request, res: Response): Promise<void> {
        try {
            const { symbol, interval = '1m', limit = '100' } = req.query;

            if (!symbol || typeof symbol !== 'string') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_SYMBOL',
                        message: 'Symbol parameter is required'
                    }
                });
                return;
            }

            // Use Provider Lib Client
            const { BinanceMarketDataRest, BinanceEnvironment } = await import('ark-alliance-trading-providers-lib/Binance');

            const restClient = new BinanceMarketDataRest(
                BinanceEnvironment.MAINNET,
                { baseUrl: 'fapi.binance.com' }
            );

            const result = await restClient.getKlinesRaw(
                symbol,
                interval as any, // Cast to KlineInterval 
                { limit: parseInt(limit as string) }
            );

            if (result.isFailure) {
                throw new Error(result.error?.message || 'Failed to fetch klines');
            }

            const klines = result.data;

            systemLogger.info(`Fetched ${klines?.length ?? 0} klines for ${symbol}`, {
                source: 'BinanceController'
            });

            res.json({
                success: true,
                data: klines
            });
        } catch (error: any) {
            systemLogger.error(`Error fetching klines: ${error.message}`, {
                source: 'BinanceController',
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'KLINES_ERROR',
                    message: error.message
                }
            });
        }
    }
}

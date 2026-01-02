/**
 * @fileoverview Symbol Tracking Service
 * @module services/SymbolTrackingService
 * 
 * Manages symbol tracking state and buffer management
 */

import { TrendCalculatorService } from './TrendCalculatorService';
import { MarketDataService } from './MarketDataService';
import { BinanceStreamService } from './BinanceStreamService';
import { systemLogger } from '@infrastructure/SystemLogger';
import { BaseTradingService, DEFAULT_TRADING_SERVICE_CONFIG } from './base';
import { Result } from 'ark-alliance-trading-providers-lib';

export class SymbolTrackingService extends BaseTradingService {
    private static instance: SymbolTrackingService;
    private trendCalculator: TrendCalculatorService;
    private marketDataService: MarketDataService;
    private trackedSymbols: Set<string> = new Set();

    private constructor() {
        super({
            ...DEFAULT_TRADING_SERVICE_CONFIG,
            instanceKey: 'SymbolTrackingService'
        });

        this.trendCalculator = TrendCalculatorService.getInstance();
        this.marketDataService = MarketDataService.getInstance();
    }

    static getInstance(): SymbolTrackingService {
        if (!SymbolTrackingService.instance) {
            SymbolTrackingService.instance = new SymbolTrackingService();
        }
        return SymbolTrackingService.instance;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Lifecycle Hooks
    // ═══════════════════════════════════════════════════════════════════════════

    protected async onStart(): Promise<void> {
        this.logger.info('SymbolTrackingService started');
        // Note: Default symbols can be added after all services are initialized
        // via API call or separate initialization step
    }

    protected async onStop(): Promise<void> {
        this.logger.info('SymbolTrackingService stopped');
        // Optional: stop tracking all symbols or disconnect stream
    }

    async startTracking(symbol: string, bufferSize?: number): Promise<Result<void>> {
        return this.executeWithResult(async () => {
            const upperSymbol = symbol.toUpperCase();

            if (this.trackedSymbols.has(upperSymbol)) return;

            // 1. Load historical klines to pre-fill buffer (before starting real-time)
            try {
                // Use MarketDataService which now abstracts the client creation
                // MarketDataService returns raw array or throws
                const historicalKlines = await this.marketDataService.getKlines(upperSymbol, '1m', 100);

                if (historicalKlines && historicalKlines.length > 0) {
                    // Map raw klines if necessary or pass directly if format matches
                    // MarketDataService.getKlines returns any[], preloadHistoricalData expects { close: string|number }[]
                    // Binance raw klines are [open time, open, high, low, close, ...]
                    // Wait, getKlines returns what?
                    // MarketDataService.getKlines returns "result.data" which is whatever client returns.
                    // client.getKlinesRaw returns RawKline[] ([number, string, string...])
                    // We need to verify what preloadHistoricalData expects.
                    // It expects { close: string | number }[]

                    // RawKline is an array. Index 4 is Close.
                    // We need to map it.

                    const mappedKlines = historicalKlines.map((k: any) => ({ close: k[4] }));
                    this.trendCalculator.preloadHistoricalData(upperSymbol, mappedKlines);

                    systemLogger.info(`Loaded ${historicalKlines.length} historical klines for ${upperSymbol}`, {
                        source: 'SymbolTrackingService'
                    });
                }
            } catch (error: any) {
                systemLogger.warn(`Failed to load historical klines for ${upperSymbol}: ${error.message}`, {
                    source: 'SymbolTrackingService'
                });
                // Continue with tracking even if historical load fails
            }

            // 2. Start trend calculator tracking
            this.trendCalculator.startTracking(upperSymbol);
            this.trackedSymbols.add(upperSymbol);

            // 3. Get Binance service and ensure connection
            const binanceService = BinanceStreamService.getInstance();
            const statusResult = binanceService.getStatus();

            // Connect to Binance if not already connected
            if (statusResult.status !== 'connected') {
                // Not connected yet - establish connection with all tracked symbols
                const connectResult = await binanceService.connect(Array.from(this.trackedSymbols));
                if (connectResult.isFailure) {
                    const errorMsg = `Failed to connect to Binance for ${upperSymbol}: ${connectResult.error?.message}`;
                    this.logger.error(errorMsg);
                    throw new Error(errorMsg); // Fail the symbol addition if Binance connection fails
                }
            } else {
                // Already connected - update subscription to include new symbol
                const connectResult = await binanceService.connect(Array.from(this.trackedSymbols));
                if (connectResult.isFailure) {
                    this.logger.error(`Failed to update Binance subscription for ${upperSymbol}: ${connectResult.error?.message}`);
                }
            }

            this.logger.info(`Started tracking ${upperSymbol}`);
        }, `startTracking(${symbol})`);
    }

    async stopTracking(symbol: string): Promise<Result<void>> {
        return this.executeWithResult(async () => {
            const upperSymbol = symbol.toUpperCase();

            if (!this.trackedSymbols.has(upperSymbol)) return;

            this.trendCalculator.stopTracking(upperSymbol);
            this.trackedSymbols.delete(upperSymbol);

            // Update Binance subscription if connected
            const binanceService = BinanceStreamService.getInstance();
            const statusResult = binanceService.getStatus();

            if (statusResult.status === 'connected') {
                if (this.trackedSymbols.size > 0) {
                    await binanceService.connect(Array.from(this.trackedSymbols));
                } else {
                    await binanceService.disconnect();
                }
            }

            this.logger.info(`Stopped tracking ${upperSymbol}`);
        }, `stopTracking(${symbol})`);
    }

    /**
     * Get symbol status
     */
    getSymbolStatus(symbol: string): any {
        const upperSymbol = symbol.toUpperCase();
        const isTracking = this.trackedSymbols.has(upperSymbol);
        const bufferStatus = this.trendCalculator.getBufferStatus(upperSymbol);

        return {
            symbol: upperSymbol,
            isTracking,
            isActive: isTracking,
            buffer: bufferStatus,
            lastAnalysis: null // TODO: Implement
        };
    }

    /**
     * Get service status
     * @returns ServiceStatusType
     */
    getStatus(): any {
        return {
            status: 'connected', // dynamic status logic if needed
            timestamp: Date.now(),
            message: `Tracking ${this.trackedSymbols.size} symbols`,
            data: {
                activeSymbols: Array.from(this.trackedSymbols)
            }
        };
    }

    getAllSymbols(): string[] {
        return Array.from(this.trackedSymbols);
    }
}

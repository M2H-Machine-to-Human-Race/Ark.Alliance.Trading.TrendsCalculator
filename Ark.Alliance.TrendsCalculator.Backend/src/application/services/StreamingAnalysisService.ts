/**
 * Streaming Analysis Service
 * 
 * @fileoverview Manages real-time price streaming, time series storage, and continuous trend analysis.
 * 
 * @module services/StreamingAnalysisService
 * @see {@link ../../../Analysis/TrendsMicroService_Analysis.md}
 * 
 * @remarks
 * Core service for continuous market analysis:
 * - Manages WebSocket connection to Binance
 * - Maintains circular buffers for each symbol
 * - Triggers trend calculations on price updates
 * - Stores analysis results
 * - Provides real-time trend data via API
 * 
 * Design Pattern: Singleton (single instance per application)
 */

import { BinanceMarketDataWs, BookTicker, MarketDataWsConfig } from 'ark-alliance-trading-providers-lib/Binance';
import { SymbolTimeSeries } from '@domain/models/SymbolTimeSeries';
import { PricePoint } from '@domain/models/PricePoint';
import { systemLogger } from '@infrastructure/SystemLogger';
import { TrendCalculatorService, TrendResult } from './TrendCalculatorService';
import { BaseTradingService, DEFAULT_TRADING_SERVICE_CONFIG } from './base';
import { Result } from 'ark-alliance-trading-providers-lib';

/**
 * Streaming analysis configuration
 */
export interface StreamingConfig {
    /** Buffer size for price history (default: 500) */
    bufferSize?: number;
    /** Minimum data points before analysis (default: 100) */
    minDataPoints?: number;
    /** Analysis update interval in milliseconds (default: 1000) */
    analysisIntervalMs?: number;
    /** WebSocket environment */
    environment?: 'TESTNET' | 'MAINNET';
}

/**
 * Streaming Analysis Service
 * 
 * @remarks
 * Singleton service that orchestrates:
 * 1. Real-time price streaming via WebSocket
 * 2. Time series buffer management (circular buffers)
 * 3. Continuous trend analysis
 * 4. Result caching and distribution
 */
export class StreamingAnalysisService extends BaseTradingService {
    private static instance: StreamingAnalysisService;

    private wsClient: BinanceMarketDataWs;
    private timeSeries: Map<string, SymbolTimeSeries> = new Map();
    private latestTrends: Map<string, TrendResult> = new Map();
    private analysisTimers: Map<string, NodeJS.Timeout> = new Map();
    private trendCalculator: TrendCalculatorService;

    private readonly bufferSize: number;
    private readonly minDataPoints: number;
    private readonly analysisIntervalMs: number;

    private _active: boolean = false;

    // ...

    /**
     * Check if service is running
     */
    isRunning(): boolean {
        return this._active;
    }

    /**
     * Private constructor (Singleton pattern)
     * 
     * @param config - Streaming configuration
     */
    private constructor(config: StreamingConfig = {}) {
        super({
            ...DEFAULT_TRADING_SERVICE_CONFIG,
            instanceKey: 'StreamingAnalysisService'
        });

        this.bufferSize = config.bufferSize ?? 500;
        this.minDataPoints = config.minDataPoints ?? 100;
        this.analysisIntervalMs = config.analysisIntervalMs ?? 1000;

        this.trendCalculator = TrendCalculatorService.getInstance();

        const wsConfig: MarketDataWsConfig = {
            wsStreamUrl: config.environment === 'TESTNET'
                ? 'wss://stream.binancefuture.com/stream'
                : 'wss://fstream.binance.com/stream',
            maxReconnectAttempts: 10,
            reconnectDelayMs: 1000
        };

        this.wsClient = new BinanceMarketDataWs(wsConfig);

        this.setupWebSocketListeners();

        systemLogger.info('StreamingAnalysisService initialized', {
            source: 'StreamingAnalysisService',
            details: {
                bufferSize: this.bufferSize,
                minDataPoints: this.minDataPoints,
                analysisIntervalMs: this.analysisIntervalMs
            }
        });
    }

    /**
     * Get singleton instance
     * 
     * @param config - Optional configuration (only used on first call)
     * @returns Singleton instance
     */
    static getInstance(config?: StreamingConfig): StreamingAnalysisService {
        if (!StreamingAnalysisService.instance) {
            StreamingAnalysisService.instance = new StreamingAnalysisService(config);
        }
        return StreamingAnalysisService.instance;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Lifecycle Hooks
    // ═══════════════════════════════════════════════════════════════════════════

    protected async onStart(): Promise<void> {
        this.logger.info('StreamingAnalysisService started');
        // Auto-start logic if needed, or rely on explicit start() call
    }

    protected async onStop(): Promise<void> {
        this.logger.info('StreamingAnalysisService stopping');
        this.stop();
    }

    /**
     * Start streaming analysis service
     * 
     * @returns Result
     */
    async start(): Promise<Result<void>> {
        return this.executeWithResult(async () => {
            if (this._active) {
                systemLogger.warn('StreamingAnalysisService already running', {
                    source: 'StreamingAnalysisService'
                });
                return;
            }

            await this.wsClient.connect();
            this._active = true;

            systemLogger.info('StreamingAnalysisService started', {
                source: 'StreamingAnalysisService'
            });
        }, 'start');
    }

    /**
     * Stop streaming analysis service
     * @returns Result
     */
    async stop(): Promise<Result<void>> {
        return this.executeWithResult(async () => {
            if (!this._active) return;

            // Stop all analysis timers
            for (const timer of this.analysisTimers.values()) {
                clearInterval(timer);
            }
            this.analysisTimers.clear();

            // Disconnect WebSocket
            this.wsClient.disconnect();
            this._active = false;

            systemLogger.info('StreamingAnalysisService stopped', {
                source: 'StreamingAnalysisService'
            });
        }, 'stop');
    }

    // ...

    /**
     * Get service status
     * 
     * @returns Service status information
     */
    getStatus(): any {
        // Note: BaseTradingService.getStatus return type depends on implementation. 
        // If it enforces ServiceStatusType, we should match it or return Result<any> if that's what's expected.
        // Looking at previous errors: "Type ... is not assignable to type '() => ServiceStatusType'".
        // ServiceStatusType usually has { status, message, timestamp }.
        // We'll return compatible object.

        return {
            status: this._active ? 'connected' : 'disconnected',
            timestamp: Date.now(),
            message: this._active ? 'Running' : 'Stopped',
            data: {
                trackedSymbols: this.timeSeries.size,
                wsConnected: this.wsClient.getStats().connected,
                wsStats: this.wsClient.getStats()
            }
        };
    }

    /**
     * Setup WebSocket event listeners
     * 
     * @private
     */
    private setupWebSocketListeners(): void {
        // Listen for price updates
        this.wsClient.on('priceUpdate', (data: BookTicker) => {
            this.handlePriceUpdate(data);
        });

        // Listen for connection events
        this.wsClient.on('connected', () => {
            systemLogger.info('WebSocket connected', {
                source: 'StreamingAnalysisService'
            });
        });

        this.wsClient.on('disconnected', () => {
            systemLogger.warn('WebSocket disconnected', {
                source: 'StreamingAnalysisService'
            });
        });

        this.wsClient.on('error', (error: Error) => {
            systemLogger.error(`WebSocket error: ${error.message}`, {
                source: 'StreamingAnalysisService',
                error
            });
        });
    }

    /**
     * Handle price update from WebSocket
     * 
     * @param data - Book ticker data
     * @private
     */
    private handlePriceUpdate(data: BookTicker): void {
        const series = this.timeSeries.get(data.symbol);
        if (!series) return;

        // Calculate mid price
        const midPrice = (data.bidPrice + data.askPrice) / 2;

        // Create price point
        const pricePoint: PricePoint = {
            price: midPrice,
            timestamp: data.timestamp
        };

        // Add to circular buffer
        series.prices.push(pricePoint);
        if (series.prices.length > series.maxSize) {
            series.prices.shift(); // Remove oldest
        }

        series.lastUpdate = data.timestamp;
        series.updateCount++;
    }

    /**
     * Start periodic analysis timer for symbol
     * 
     * @param symbol - Trading symbol
     * @private
     */
    private startAnalysisTimer(symbol: string): void {
        // Clear existing timer if any
        const existingTimer = this.analysisTimers.get(symbol);
        if (existingTimer) {
            clearInterval(existingTimer);
        }

        // Create new timer
        const timer = setInterval(() => {
            this.analyzeSymbol(symbol);
        }, this.analysisIntervalMs);

        this.analysisTimers.set(symbol, timer);
    }

    /**
     * Analyze symbol using current time series data
     * 
     * @param symbol - Trading symbol
     * @private
     */
    private analyzeSymbol(symbol: string): void {
        const series = this.timeSeries.get(symbol);
        if (!series || series.prices.length < this.minDataPoints) {
            return;
        }

        try {
            // Extract price values
            const prices = series.prices.map(p => p.price);

            // Use TrendCalculatorService used for common logic
            const result = this.trendCalculator.calculateFromPrices(prices);

            if (result) {
                // Store result
                this.latestTrends.set(symbol, result);
            }

        } catch (error: any) {
            systemLogger.error(`Analysis failed for ${symbol}: ${error.message}`, {
                source: 'StreamingAnalysisService',
                error
            });
        }
    }
}

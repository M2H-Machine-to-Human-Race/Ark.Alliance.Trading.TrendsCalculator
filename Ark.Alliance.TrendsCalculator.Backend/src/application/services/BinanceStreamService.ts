/**
 * @fileoverview Binance Stream Service
 * @module application/services/BinanceStreamService
 * 
 * Manages Binance WebSocket connections for real-time cryptocurrency price data.
 * Handles connection lifecycle, symbol subscriptions, and price update broadcasting.
 */

import { systemLogger } from '@infrastructure/SystemLogger';
import { socketService, SocketService } from '@infrastructure/socketio/SocketService';
import { BinanceConnectionStatusDto, BinanceTickerDto } from '@share/index';
import { TrendCalculatorService } from './TrendCalculatorService';
import { BaseWebSocketClient, WebSocketClientConfig, WebSocketStats } from 'ark-alliance-trading-providers-lib/Binance';
import { Result } from 'ark-alliance-trading-providers-lib';
import WebSocket from 'ws';
import { BaseTradingService, DEFAULT_TRADING_SERVICE_CONFIG } from './base';

/**
 * Internal Client for Binance Ticker Streams
 * Extends Provider Lib's BaseWebSocketClient for robust connection management
 */
class BinanceTickerClient extends BaseWebSocketClient {
    // Event emitter for parsed updates
    // Events: 'ticker' -> BinanceTickerDto

    constructor(config?: WebSocketClientConfig) {
        super(config);
    }

    protected getUrl(): string {
        // Use standard raw stream endpoint
        return 'wss://stream.binance.com:9443/ws';
    }

    protected getSubscribePayload(topics: string[]): any {
        return {
            method: 'SUBSCRIBE',
            params: topics.map(t => `${t.toLowerCase()}@ticker`),
            id: Date.now()
        };
    }

    protected getUnsubscribePayload(topics: string[]): any {
        return {
            method: 'UNSUBSCRIBE',
            params: topics.map(t => `${t.toLowerCase()}@ticker`),
            id: Date.now()
        };
    }

    protected handleMessage(data: WebSocket.RawData): void {
        const msgStr = data.toString();
        const msg = JSON.parse(msgStr);

        // Handle ticker event
        // Raw Ticker Payload: { e: '24hrTicker', s: 'BTCUSDT', c: '...', ... }
        if (msg.e === '24hrTicker') {
            this.emit('ticker', msg);
        }
    }
}

/**
 * Singleton service for Binance WebSocket stream management
 */
export class BinanceStreamService extends BaseTradingService {
    private static instance: BinanceStreamService;
    private client: BinanceTickerClient;
    private socketService: SocketService;
    private trendCalculatorService: TrendCalculatorService;
    protected lastError: string | null = null; // Fix type to match BaseTradingService

    private constructor() {
        super({
            ...DEFAULT_TRADING_SERVICE_CONFIG,
            instanceKey: 'BinanceStreamService'
        });

        this.socketService = socketService;
        this.trendCalculatorService = TrendCalculatorService.getInstance();

        // Initialize client
        this.client = new BinanceTickerClient({
            maxReconnectAttempts: 5,
            initialReconnectIntervalMs: 1000
        });

        this.setupClientListeners();
    }

    /**
     * Get singleton instance
     * @returns BinanceStreamService instance
     */
    static getInstance(): BinanceStreamService {
        if (!BinanceStreamService.instance) {
            BinanceStreamService.instance = new BinanceStreamService();
        }
        return BinanceStreamService.instance;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Lifecycle Hooks
    // ═══════════════════════════════════════════════════════════════════════════

    protected async onStart(): Promise<void> {
        this.logger.info('BinanceStreamService started');
        // No auto-connect here, handled via connect()
    }

    protected async onStop(): Promise<void> {
        this.logger.info('BinanceStreamService stopped');
        this.client.disconnect();
    }

    /**
     * Test Binance API connectivity
     * @returns Promise resolving to true if connection test succeeds
     */
    async testConnection(): Promise<Result<boolean>> {
        return this.executeWithResult(async () => {
            return new Promise<boolean>((resolve, reject) => {
                const testWs = new WebSocket('wss://stream.binance.com:9443/ws');
                const timeout = setTimeout(() => {
                    testWs.terminate();
                    reject(new Error('Connection test timeout'));
                }, 5000);

                testWs.on('open', () => {
                    clearTimeout(timeout);
                    testWs.close();
                    resolve(true);
                });

                testWs.on('error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });
        }, 'testConnection');
    }

    /**
     * Connect to Binance WebSocket and subscribe to symbol streams
     * @param symbols - Array of symbols to subscribe (e.g., ['BTCUSDT', 'ETHUSDT'])
     * @returns Result indicating success or failure
     */
    async connect(symbols: string[]): Promise<Result<void>> {
        return this.executeWithResult(async () => {
            if (symbols.length === 0) {
                throw new Error('At least one symbol must be provided');
            }

            // Connect if not already connected
            await this.client.connect();

            // Subscribe to symbols
            this.client.subscribe(symbols);

            systemLogger.info(`Connected and subscribed to ${symbols.length} symbols`, {
                source: 'BinanceStreamService',
                details: { symbols }
            });
        }, `connect(${symbols.length} symbols)`);
    }

    /**
     * Disconnect from Binance WebSocket
     * @returns Result
     */
    async disconnect(): Promise<Result<void>> {
        return this.executeWithResult(async () => {
            this.client.disconnect();
        }, 'disconnect');
    }

    /**
     * Get current connection status
     * @returns Service status
     */
    getStatus(): any {
        const stats: WebSocketStats = this.client.getStats();

        let status: 'disconnected' | 'connected' | 'error' = 'disconnected';
        if (stats.connected) status = 'connected';
        if (this.lastError && !stats.connected) status = 'error';

        return {
            status: status,
            message: this.lastError || undefined,
            timestamp: Date.now(),
            activeSymbols: stats.subscriptions
        };
    }

    /**
     * Setup Client Listeners
     * @private
     */
    private setupClientListeners(): void {
        this.client.on('connected', () => {
            this.lastError = null;
            systemLogger.info('Connected to Binance WebSocket', { source: 'BinanceStreamService' });

            this.socketService.emitBinanceStatus({
                status: 'connected',
                timestamp: Date.now()
            });
        });

        this.client.on('disconnected', (data: any) => {
            systemLogger.info('Binance WebSocket disconnected', { source: 'BinanceStreamService', details: data });

            this.socketService.emitBinanceStatus({
                status: 'disconnected',
                timestamp: Date.now()
            });
        });

        this.client.on('error', (error: Error) => {
            this.lastError = error.message;
            systemLogger.error(`Binance WebSocket error: ${error.message}`, { source: 'BinanceStreamService', error });

            this.socketService.emitBinanceStatus({
                status: 'error',
                message: error.message,
                timestamp: Date.now()
            });
        });

        this.client.on('ticker', (data: any) => {
            this.handlePriceUpdate(data);
        });
    }

    /**
     * Handle incoming price update from Binance
     * @param data - Binance ticker data
     * @private
     */
    private handlePriceUpdate(data: any): void {
        try {
            // Binance ticker stream format
            const symbol = data.s; // Symbol (e.g., 'BTCUSDT')
            const price = parseFloat(data.c); // Current price
            const volume = parseFloat(data.v); // 24h volume

            if (!symbol || isNaN(price) || isNaN(volume)) {
                return;
            }

            const tickerDto: BinanceTickerDto = {
                symbol: symbol.toUpperCase(),
                price,
                volume,
                timestamp: Date.now()
            };

            // Emit price update via Socket.IO
            this.socketService.emitBinancePrice({
                symbol: tickerDto.symbol,
                price: tickerDto.price,
                volume: tickerDto.volume,
                timestamp: tickerDto.timestamp
            });

            this.trendCalculatorService.addPrice(tickerDto.symbol, tickerDto.price);

        } catch (error: any) {
            systemLogger.error(`Error handling price update: ${error.message}`, {
                source: 'BinanceStreamService',
                error
            });
        }
    }
}

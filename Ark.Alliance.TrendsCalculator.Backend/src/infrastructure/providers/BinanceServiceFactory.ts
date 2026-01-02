/**
 * @fileoverview Binance Service Factory
 * @module infrastructure/providers/BinanceServiceFactory
 *
 * Centralized factory for creating properly configured Binance service instances.
 * Handles environment configuration, API keys, and service dependency injection.
 *
 * @example
 * ```typescript
 * import { BinanceServiceFactory } from '@infrastructure/providers';
 *
 * // Configure once at startup
 * BinanceServiceFactory.configure({
 *     useTestnet: process.env.USE_TESTNET === 'true',
 *     apiKey: process.env.BINANCE_API_KEY,
 *     apiSecret: process.env.BINANCE_API_SECRET
 * });
 *
 * // Create clients anywhere
 * const marketDataClient = BinanceServiceFactory.createMarketDataClient();
 * const restClient = BinanceServiceFactory.createAuthenticatedClient();
 * ```
 */

import {
    BinanceRestClient,
    BinanceMarketDataRest,
    BinanceMarketDataWs,
    BinanceEnvironment,
    SignedRestClientConfig,
    MarketDataWsConfig
} from 'ark-alliance-trading-providers-lib/Binance';
import { Server as SocketIOServer } from 'socket.io';

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Binance factory configuration.
 */
export interface BinanceFactoryConfig {
    /** API key for authenticated endpoints */
    apiKey?: string;

    /** API secret for request signing */
    apiSecret?: string;

    /** Use testnet instead of mainnet */
    useTestnet?: boolean;

    /** Socket.IO server for streaming services */
    io?: SocketIOServer;
}

/**
 * Environment URLs for Binance Futures.
 */
export const BINANCE_URLS = {
    MAINNET: {
        REST: 'fapi.binance.com',
        WS: 'wss://fstream.binance.com/ws',
        WS_STREAM: 'wss://fstream.binance.com/stream'
    },
    TESTNET: {
        REST: 'testnet.binancefuture.com',
        WS: 'wss://stream.binancefuture.com/ws',
        WS_STREAM: 'wss://stream.binancefuture.com/stream'
    }
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Factory
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Binance Service Factory.
 *
 * @remarks
 * Centralized factory for creating Binance client instances.
 * Call `configure()` once at application startup, then use the
 * `create*` methods to get properly configured client instances.
 *
 * The factory provides three types of clients:
 * 1. **MarketDataClient** - Public REST endpoints (no auth required)
 * 2. **MarketDataWsClient** - Public WebSocket streams (no auth required)
 * 3. **AuthenticatedClient** - Private REST endpoints (requires API key/secret)
 *
 * @example
 * ```typescript
 * // At application startup
 * BinanceServiceFactory.configure({
 *     useTestnet: false,
 *     apiKey: 'your-api-key',
 *     apiSecret: 'your-api-secret'
 * });
 *
 * // In services
 * const client = BinanceServiceFactory.createMarketDataClient();
 * const result = await client.getTicker('BTCUSDT');
 * ```
 */
export class BinanceServiceFactory {
    private static config: BinanceFactoryConfig = {};

    /**
     * Configure the factory with API credentials and environment settings.
     *
     * @remarks
     * Should be called once at application startup before creating any clients.
     * Can be called multiple times to update configuration.
     *
     * @param config - Factory configuration
     */
    static configure(config: BinanceFactoryConfig): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current factory configuration.
     *
     * @returns Read-only copy of current configuration
     */
    static getConfig(): Readonly<BinanceFactoryConfig> {
        return { ...this.config };
    }

    /**
     * Get current environment.
     *
     * @returns BinanceEnvironment enum value
     */
    static getEnvironment(): BinanceEnvironment {
        return this.config.useTestnet
            ? BinanceEnvironment.TESTNET
            : BinanceEnvironment.MAINNET;
    }

    /**
     * Get URLs for current environment.
     *
     * @returns URL configuration for REST and WebSocket
     */
    static getUrls(): { REST: string; WS: string; WS_STREAM: string } {
        return this.config.useTestnet
            ? BINANCE_URLS.TESTNET
            : BINANCE_URLS.MAINNET;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Client Factories
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Create a market data REST client (public endpoints - no auth required).
     *
     * @remarks
     * Use this client for:
     * - Order book data (`getOrderBook()`)
     * - Ticker prices (`getTicker()`)
     * - Kline/candlestick data (`getKlines()`)
     * - Exchange information (`getExchangeInfo()`)
     *
     * @returns Configured BinanceMarketDataRest client
     */
    static createMarketDataClient(): BinanceMarketDataRest {
        const urls = this.getUrls();

        return new BinanceMarketDataRest(this.getEnvironment(), {
            baseUrl: urls.REST
        });
    }

    /**
     * Create a market data WebSocket client (public streams - no auth required).
     *
     * @remarks
     * Use this client for:
     * - Real-time price updates
     * - Order book depth updates
     * - Trade streams
     *
     * @param config - Optional WebSocket configuration overrides
     * @returns Configured BinanceMarketDataWs client
     */
    static createMarketDataWsClient(config?: Partial<MarketDataWsConfig>): BinanceMarketDataWs {
        const urls = this.getUrls();

        return new BinanceMarketDataWs({
            wsStreamUrl: urls.WS_STREAM,
            maxReconnectAttempts: 10,
            reconnectDelayMs: 1000,
            ...config
        });
    }

    /**
     * Create an authenticated REST client (private endpoints - requires API key/secret).
     *
     * @remarks
     * Use this client for:
     * - Placing orders (`placeOrder()`)
     * - Getting account info (`getAccount()`)
     * - Managing positions (`getPositionRisk()`)
     * - Setting leverage (`setLeverage()`)
     *
     * @throws Error if API credentials are not configured
     * @returns Configured BinanceRestClient with signing
     */
    static createAuthenticatedClient(): BinanceRestClient {
        if (!this.config.apiKey || !this.config.apiSecret) {
            throw new Error(
                'BinanceServiceFactory: API key and secret are required for authenticated client. ' +
                'Call configure({ apiKey, apiSecret }) first.'
            );
        }

        const urls = this.getUrls();
        const clientConfig: SignedRestClientConfig = {
            baseUrl: urls.REST
        };

        return new BinanceRestClient(
            this.config.apiKey,
            this.config.apiSecret,
            clientConfig
        );
    }

    /**
     * Check if authenticated client can be created.
     *
     * @returns true if API credentials are configured
     */
    static hasCredentials(): boolean {
        return !!(this.config.apiKey && this.config.apiSecret);
    }

    /**
     * Reset factory configuration.
     *
     * @remarks
     * Primarily for testing purposes.
     */
    static reset(): void {
        this.config = {};
    }
}

export default BinanceServiceFactory;

/**
 * @fileoverview Base Trading Service for TrendsCalculator
 * @module application/services/base/BaseTradingService
 *
 * Abstract base class for all trading-related services in TrendsCalculator.
 * Extends ark-alliance-trading-providers-lib BaseService for:
 * - Lifecycle management (start/stop/restart)
 * - CancellationToken support for graceful shutdown
 * - Result pattern for type-safe error handling
 * - Socket.IO streaming capabilities
 * - Context-aware logging
 *
 * @example
 * ```typescript
 * import { BaseTradingService, TradingServiceConfig } from './base';
 *
 * export class MyService extends BaseTradingService {
 *     protected async onStart(): Promise<void> {
 *         // Initialize resources
 *     }
 *
 *     protected async onStop(): Promise<void> {
 *         // Cleanup resources
 *     }
 *
 *     async doSomething(): Promise<Result<MyData>> {
 *         return this.executeWithResult(async () => {
 *             // Your logic here
 *             return myData;
 *         }, 'doSomething');
 *     }
 * }
 * ```
 */

import {
    BaseService,
    ServiceConfig,
    Result,
    CancellationToken
} from 'ark-alliance-trading-providers-lib';
import { Server as SocketIOServer } from 'socket.io';
import { socketService } from '@infrastructure/socketio/SocketService';

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extended configuration for TrendsCalculator trading services.
 */
export interface TradingServiceConfig extends ServiceConfig {
    /** Socket.IO server for real-time streaming */
    io?: SocketIOServer;

    /** Whether to use testnet endpoints */
    useTestnet?: boolean;

    /** Enable verbose debug logging */
    debug?: boolean;
}

/**
 * Default configuration values for trading services.
 */
export const DEFAULT_TRADING_SERVICE_CONFIG: Partial<TradingServiceConfig> = {
    enableStreaming: true,
    streamingNamespace: '/trading',
    useTestnet: false,
    debug: process.env.NODE_ENV === 'development',
    autoRecover: true,
    maxRecoveryAttempts: 3,
    recoveryDelayMs: 5000
};

// ═══════════════════════════════════════════════════════════════════════════════
// Abstract Base Class
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Abstract base class for TrendsCalculator trading services.
 *
 * @remarks
 * This class bridges the ark-alliance-trading-providers-lib BaseService with
 * the TrendsCalculator infrastructure, providing:
 *
 * 1. **Lifecycle Management**: Automatic start/stop handling with hooks
 * 2. **Result Pattern**: Type-safe error handling via `executeWithResult()`
 * 3. **Socket.IO Integration**: Automatic connection to the global SocketService
 * 4. **Cancellation Support**: Graceful shutdown via CancellationToken
 * 5. **Environment Switching**: Testnet/Mainnet configuration
 *
 * All services should extend this class and implement:
 * - `onStart()`: Initialize resources (called by start())
 * - `onStop()`: Cleanup resources (called by stop())
 *
 * @example
 * ```typescript
 * export class MarketDataService extends BaseTradingService {
 *     private client: BinanceMarketDataRest;
 *
 *     protected async onStart(): Promise<void> {
 *         this.client = new BinanceMarketDataRest(
 *             this.useTestnet ? BinanceEnvironment.TESTNET : BinanceEnvironment.MAINNET
 *         );
 *         this.logger.info('MarketDataService started');
 *     }
 *
 *     protected async onStop(): Promise<void> {
 *         this.logger.info('MarketDataService stopped');
 *     }
 *
 *     async getPrice(symbol: string): Promise<Result<number>> {
 *         return this.executeWithResult(async () => {
 *             const result = await this.client.getTicker(symbol);
 *             return result.getOrThrow().lastPrice;
 *         }, `getPrice(${symbol})`);
 *     }
 * }
 * ```
 */
export abstract class BaseTradingService extends BaseService {
    /** Whether to use testnet endpoints */
    protected readonly useTestnet: boolean;

    /** Debug mode flag */
    protected readonly debug: boolean;

    /**
     * Create a new BaseTradingService instance.
     *
     * @param config - Service configuration
     */
    constructor(config: TradingServiceConfig) {
        // Merge with defaults
        const mergedConfig: TradingServiceConfig = {
            ...DEFAULT_TRADING_SERVICE_CONFIG,
            ...config
        };

        super(mergedConfig);

        this.useTestnet = mergedConfig.useTestnet ?? false;
        this.debug = mergedConfig.debug ?? false;

        // Auto-attach Socket.IO server if available
        const io = mergedConfig.io ?? socketService.getIO();
        if (io) {
            this.setSocketServer(io);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Result Pattern Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Execute an async operation wrapped in Result pattern.
     *
     * @remarks
     * This helper:
     * - Wraps the operation in a Result for type-safe error handling
     * - Logs operation start/completion at debug level
     * - Automatically catches and wraps exceptions in Result.fail()
     * - Respects the cancellation token for graceful shutdown
     *
     * @param operation - Async function to execute
     * @param context - Description for logging (e.g., 'getPrice(BTCUSDT)')
     * @returns Result containing the operation output or error
     *
     * @example
     * ```typescript
     * async fetchData(): Promise<Result<MyData>> {
     *     return this.executeWithResult(async () => {
     *         const response = await this.client.getData();
     *         return response;
     *     }, 'fetchData');
     * }
     * ```
     */
    protected async executeWithResult<T>(
        operation: () => Promise<T>,
        context: string
    ): Promise<Result<T>> {
        return this.wrapAsync(async () => {
            if (this.debug) {
                this.logger.debug(`Executing: ${context}`);
            }

            const result = await operation();

            if (this.debug) {
                this.logger.debug(`Completed: ${context}`);
            }

            return result;
        });
    }

    /**
     * Execute a synchronous operation wrapped in Result pattern.
     *
     * @param operation - Sync function to execute
     * @param context - Description for logging
     * @returns Result containing the operation output or error
     */
    protected executeSync<T>(
        operation: () => T,
        context: string
    ): Result<T> {
        try {
            if (this.debug) {
                this.logger.debug(`Executing sync: ${context}`);
            }

            const result = operation();

            if (this.debug) {
                this.logger.debug(`Completed sync: ${context}`);
            }

            return Result.ok(result);
        } catch (error: any) {
            this.logger.error(`Failed: ${context}`, { error });
            return Result.fromError(error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Socket.IO Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Emit an event to all connected Socket.IO clients.
     *
     * @remarks
     * Delegates to BaseService.emitToClients() for Socket.IO broadcasting.
     *
     * @param event - Event name
     * @param data - Event payload
     */
    public broadcastEvent<T>(event: string, data: T): void {
        this.emitToClients(event, data);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Lifecycle Hooks (Optional Overrides)
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Called during graceful shutdown before onStop().
     *
     * @remarks
     * Override this to perform cleanup that requires the cancellation token,
     * such as waiting for in-flight requests to complete.
     *
     * @param token - Cancellation token for shutdown signaling
     */
    protected async onShutdown(token: CancellationToken): Promise<void> {
        // Default: no-op, subclasses can override
    }
}

export default BaseTradingService;

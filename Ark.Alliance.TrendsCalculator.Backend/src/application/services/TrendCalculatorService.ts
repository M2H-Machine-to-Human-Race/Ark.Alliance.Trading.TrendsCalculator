/**
 * @fileoverview Trend Calculator Service
 * @module core/services/TrendCalculatorService
 * 
 * Dedicated service for calculating market trend direction from time series data.
 * Maintains a rolling buffer of the last N price points per symbol.
 * Returns LONG, SHORT, or WAIT (oscillation detected).
 * 
 * @refactored Copied from PositionService and aligned with Share DTOs
 * @see {@link ../../../Analysis/TrendsMicroService_Analysis.md}
 */

import {
    TrendDirection,
    TrendPrecision,
    MABias,
} from '@share/index';

import { systemLogger } from '@infrastructure/SystemLogger';
import socketService from '@infrastructure/socketio';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES (Local - extends Share DTOs for internal use)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Internal trend calculation result
 * Extends the external DTO with additional internal fields
 */
export interface TrendResult {
    /** Recommended direction: LONG, SHORT, or WAIT (oscillation) */
    direction: TrendDirection;

    /** Trend strength as percentage (0 to 100) */
    strength: number;

    /** Price change from first to last data point */
    priceChange: number;

    /** Percentage change */
    priceChangePercent: number;

    /** Number of data points used */
    dataPoints: number;

    /** Start price of analysis period */
    startPrice: number;

    /** End price of analysis period */
    endPrice: number;

    /** Linear regression slope (positive = uptrend) */
    slope: number;

    /** R² coefficient (0-1, measures fit quality, low = oscillation) */
    rSquared: number;

    /** R² adjusted for autocorrelation (optional) */
    rSquaredAdjusted?: number;

    /** Number of direction changes detected */
    directionChanges: number;

    /** Whether oscillation was detected */
    isOscillating: boolean;

    /** Fast EMA value (period: 10) */
    emaFast: number | null;

    /** Slow EMA value (period: 30) */
    emaSlow: number | null;

    /** Moving average bias: LONG, SHORT, or NEUTRAL */
    maBias: MABias;

    /** Composite score (-1 to +1): combines slope, EMA crossover, and R² */
    compositeScore: number;
}

/**
 * Strategy parameters for profitability analysis
 */
export interface StrategyParams {
    /** Take profit amount per click (e.g. 0.03 = 3%) */
    takeProfitPercent: number;

    /** Sigma/inversion threshold (e.g. 0.02 = 2%) */
    sigma: number;

    /** Estimated fees in USDT for the position */
    estimatedFees: number;

    /** Position quantity */
    quantity: number;

    /** Current price */
    currentPrice: number;
}

/**
 * Extended result with profitability analysis
 */
export interface TrendWithStrategyResult extends TrendResult {
    /** Whether trend is profitable considering fees and take profit */
    isProfitable: boolean;

    /** Expected profit based on trend movement */
    expectedProfit: number;

    /** Net profit after fees */
    netProfit: number;

    /** Profit covers fees? */
    coversFees: boolean;

    /** Strategy parameters used */
    strategyParams: StrategyParams;
}

/**
 * Configuration for TrendCalculatorService
 */
export interface TrendCalculatorConfig {
    /** Number of data points to keep in buffer (default: 100 = ~100 seconds at 1s tick) */
    bufferSize: number;

    /** Minimum data points required for analysis (default: 50) */
    minDataPoints: number;

    /** R² threshold below which oscillation is detected (default: 0.3) */
    oscillationRSquaredThreshold: number;

    /** Minimum direction changes ratio to detect oscillation (default: 0.40) */
    oscillationDirectionChangeRatio: number;

    /** Minimum strength (%) to avoid WAIT (default: 2.0) */
    minStrengthThreshold: number;

    /** Fast EMA period (default: 10) */
    emaFastPeriod: number;

    /** Slow EMA period (default: 30) */
    emaSlowPeriod: number;

    /** Composite score threshold for direction decision (default: 0.3) */
    compositeScoreThreshold: number;
}

/**
 * State for tracking timeframe escalation per symbol
 */
export interface TimeframeEscalationState {
    /** Current timeframe being used */
    currentTimeframe: TrendPrecision;

    /** Current timeframe index in escalation chain */
    timeframeIndex: number;

    /** Number of WAIT iterations at current timeframe */
    waitIterations: number;

    /** Maximum iterations before escalating (from system settings) */
    maxIterations: number;

    /** Timestamp when escalation started */
    escalationStartTime: number;

    /** Whether escalation is complete (reached 15m) */
    isMaxEscalation: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Timeframe escalation chain: 1s → 1m → 15m
 */
export const TIMEFRAME_ESCALATION_CHAIN: TrendPrecision[] = [
    TrendPrecision.ONE_SECOND,
    TrendPrecision.ONE_MINUTE,
    TrendPrecision.FIFTEEN_MINUTES,
];

const DEFAULT_CONFIG: TrendCalculatorConfig = {
    bufferSize: 100,
    minDataPoints: 50,
    oscillationRSquaredThreshold: 0.3,
    oscillationDirectionChangeRatio: 0.40,
    minStrengthThreshold: 2.0,
    emaFastPeriod: 10,
    emaSlowPeriod: 30,
    compositeScoreThreshold: 0.3,
};

import { BaseTradingService, DEFAULT_TRADING_SERVICE_CONFIG } from './base';

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trend Calculator Service
 * 
 * Maintains a rolling buffer of the last N price points per symbol.
 * Detects oscillation and returns LONG, SHORT, or WAIT.
 */
export class TrendCalculatorService extends BaseTradingService {
    private static instance: TrendCalculatorService;
    private trendConfig: TrendCalculatorConfig;

    /** Price history buffer per symbol */
    private priceHistory: Map<string, number[]> = new Map();

    /** Track subscriptions */
    private subscriptions: Set<string> = new Set();

    /** Timeframe escalation state per symbol */
    private escalationState: Map<string, TimeframeEscalationState> = new Map();

    private constructor(config: Partial<TrendCalculatorConfig> = {}) {
        super({
            ...DEFAULT_TRADING_SERVICE_CONFIG,
            instanceKey: 'TrendCalculatorService'
        });

        this.trendConfig = { ...DEFAULT_CONFIG, ...config };

        // Ensure defaults are set for critical values
        if (this.trendConfig.minDataPoints < 10) this.trendConfig.minDataPoints = 10;

        this.logger.info(`Initialized with minDataPoints=${this.trendConfig.minDataPoints}, bufferSize=${this.trendConfig.bufferSize}`);
    }

    /**
     * Get Singleton Instance
     */
    static getInstance(config?: Partial<TrendCalculatorConfig>): TrendCalculatorService {
        if (!TrendCalculatorService.instance) {
            TrendCalculatorService.instance = new TrendCalculatorService(config);
        }
        return TrendCalculatorService.instance;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Lifecycle Hooks
    // ═══════════════════════════════════════════════════════════════════════════

    protected async onStart(): Promise<void> {
        this.logger.info('TrendCalculatorService started');
    }

    protected async onStop(): Promise<void> {
        this.logger.info('TrendCalculatorService stopped');
        this.priceHistory.clear();
        this.subscriptions.clear();
        this.escalationState.clear();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TRACKING
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Start tracking price history for a symbol
     */
    startTracking(symbol: string): void {
        const upperSymbol = symbol.toUpperCase();

        if (this.subscriptions.has(upperSymbol)) {
            return;
        }

        this.priceHistory.set(upperSymbol, []);
        this.subscriptions.add(upperSymbol);
        console.log(`[TrendCalculator] Started tracking ${upperSymbol} (buffer: ${this.trendConfig.bufferSize})`);

        // Emit symbol tracking event
        socketService.emitSymbolTracking({
            symbol: upperSymbol,
            action: 'added',
            isActive: true,
            timestamp: Date.now()
        });
    }

    /**
     * Add price to circular buffer and trigger trend calculation
     * 
     * @param symbol - Trading symbol
     * @param price - Latest price
     * 
     * @remarks
     * Automatically calculates trends every 10 price updates
     * after buffer has minimum required data points.
     */
    addPrice(symbol: string, price: number): void {
        const upperSymbol = symbol.toUpperCase();
        const buffer = this.priceHistory.get(upperSymbol) || [];
        if (!this.priceHistory.has(upperSymbol)) {
            this.priceHistory.set(upperSymbol, buffer);
        }

        buffer.push(price);

        if (buffer.length > this.trendConfig.bufferSize) {
            buffer.shift();
        }

        // Emit buffer progress event
        socketService.emitBufferProgress({
            symbol: upperSymbol,
            current: buffer.length,
            required: this.trendConfig.bufferSize,
            percentage: (buffer.length / this.trendConfig.bufferSize) * 100,
            timestamp: Date.now()
        });

        // Auto-calculate trends every 10 price updates (once buffer is ready)
        // This enables real-time trend streaming to frontend
        if (buffer.length >= this.trendConfig.minDataPoints && buffer.length % 10 === 0) {
            this.calculateTrend(upperSymbol);
        }
    }

    /**
     * Get price history buffer
     */
    getPriceHistory(symbol: string): number[] {
        return this.priceHistory.get(symbol.toUpperCase()) || [];
    }

    /**
     * Clear buffer to collect fresh points
     */
    clearBuffer(symbol: string): void {
        const buffer = this.priceHistory.get(symbol.toUpperCase());
        if (buffer) {
            buffer.length = 0;
        }
        console.log(`[TrendCalculator] Cleared buffer for ${symbol}`);
    }

    /**
     * Half-reset buffer: keep newest n/2 points, discard oldest half
     */
    halfResetBuffer(symbol: string): void {
        const buffer = this.priceHistory.get(symbol.toUpperCase());
        if (buffer && buffer.length > 0) {
            const halfLength = Math.floor(buffer.length / 2);
            buffer.splice(0, halfLength);
            console.log(`[TrendCalculator] Half-reset buffer for ${symbol}: kept ${buffer.length} newest points`);
        }
    }

    /**
     * Stop tracking
     */
    stopTracking(symbol: string): void {
        const upperSymbol = symbol.toUpperCase();
        this.priceHistory.delete(upperSymbol);
        this.subscriptions.delete(upperSymbol);
        this.escalationState.delete(upperSymbol);
        console.log(`[TrendCalculator] Stopped tracking ${upperSymbol}`);

        // Emit symbol tracking event
        socketService.emitSymbolTracking({
            symbol: upperSymbol,
            action: 'removed',
            isActive: false,
            timestamp: Date.now()
        });
    }

    /**
     * Get buffer fill status
     */
    getBufferStatus(symbol: string): { current: number; max: number; percent: number } {
        const buffer = this.priceHistory.get(symbol.toUpperCase()) || [];
        return {
            current: buffer.length,
            max: this.trendConfig.bufferSize,
            percent: (buffer.length / this.trendConfig.bufferSize) * 100,
        };
    }

    /**
     * Check if buffer is full
     */
    isBufferFull(symbol: string): boolean {
        const buffer = this.priceHistory.get(symbol.toUpperCase()) || [];
        return buffer.length >= this.trendConfig.bufferSize;
    }

    /**
     * Preload historical kline data into the price buffer
     * Called when starting to track a symbol to pre-fill with historical data
     * 
     * @param symbol - Trading pair symbol
     * @param klines - Array of kline objects with { close } property
     */
    preloadHistoricalData(symbol: string, klines: { close: string | number }[]): void {
        const upperSymbol = symbol.toUpperCase();

        if (!this.priceHistory.has(upperSymbol)) {
            this.priceHistory.set(upperSymbol, []);
        }

        const buffer = this.priceHistory.get(upperSymbol)!;

        // Add each kline's close price to the buffer
        klines.forEach(kline => {
            const price = typeof kline.close === 'string'
                ? parseFloat(kline.close)
                : kline.close;

            if (!isNaN(price)) {
                buffer.push(price);
            }
        });

        // Trim to buffer size if exceeded
        while (buffer.length > this.trendConfig.bufferSize) {
            buffer.shift();
        }

        systemLogger.info(`Preloaded ${klines.length} historical klines for ${upperSymbol} (buffer: ${buffer.length})`, {
            source: 'TrendCalculatorService'
        });

        // Emit buffer progress event
        socketService.emitBufferProgress({
            symbol: upperSymbol,
            current: buffer.length,
            required: this.trendConfig.bufferSize,
            percentage: (buffer.length / this.trendConfig.bufferSize) * 100,
            timestamp: Date.now()
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TREND CALCULATION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculate trend from stored price history
     * Returns LONG, SHORT, or WAIT (oscillation)
     */
    calculateTrend(symbol: string): TrendResult | null {
        const prices = this.getPriceHistory(symbol);

        if (prices.length < this.trendConfig.minDataPoints) {
            console.warn(`[TrendCalculator] Insufficient data: ${prices.length}/${this.trendConfig.minDataPoints}`);
            return null;
        }

        const result = this.calculateFromPrices(prices);

        // Emit trend update event
        if (result) {
            socketService.emitTrendUpdate({
                symbol: symbol.toUpperCase(),
                direction: result.direction,
                compositeScore: result.compositeScore,
                confidence: result.strength / 100,
                slope: result.slope,
                timestamp: Date.now()
            });
        }

        return result;
    }

    /**
     * Calculate trend from price array using composite score system
     * Combines: linear regression slope + EMA crossover + R² for robust classification
     */
    calculateFromPrices(prices: number[]): TrendResult | null {
        if (prices.length < this.trendConfig.minDataPoints) {
            return null;
        }

        const startPrice = prices[0];
        const endPrice = prices[prices.length - 1];
        const priceChange = endPrice - startPrice;
        const priceChangePercent = (priceChange / startPrice) * 100;

        // GUARD: Flat price means no trend
        if (priceChange === 0) {
            return this.createWaitResult(prices, startPrice, endPrice);
        }

        // Calculate linear regression
        const { slope, rSquared } = this.calculateLinearRegression(prices);

        // Count direction changes (oscillation indicator)
        const directionChanges = this.countDirectionChanges(prices);

        // Calculate strength
        const strength = Math.min(100, Math.abs(priceChangePercent) * rSquared * 10);

        // Normalized slope for composite score
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const normalizedSlope = slope / avgPrice;

        // Calculate EMA fast and slow
        const emaFast = this.calculateEMA(prices, this.trendConfig.emaFastPeriod);
        const emaSlow = this.calculateEMA(prices, this.trendConfig.emaSlowPeriod);

        // Determine MA bias from EMA crossover
        let maBias: MABias = MABias.NEUTRAL;
        if (emaFast !== null && emaSlow !== null) {
            if (emaFast > emaSlow) maBias = MABias.LONG;
            else if (emaFast < emaSlow) maBias = MABias.SHORT;
        }

        // Detect oscillation using ratio-based direction change threshold
        const directionChangeRatio = directionChanges / prices.length;
        const isOscillating = this.detectOscillation(rSquared, directionChangeRatio, strength);

        // Calculate composite score using tanh-scaled slope magnitude
        const slopeFactor = Math.tanh(normalizedSlope * 1000);
        const emaSign = (emaFast !== null && emaSlow !== null)
            ? Math.sign(emaFast - emaSlow)
            : 0;
        const rSquaredFactor = rSquared - 0.5;

        const compositeScore =
            slopeFactor * 0.4 +
            emaSign * 0.4 +
            rSquaredFactor * 0.2;

        // Determine direction using composite score
        let direction: TrendDirection;
        if (isOscillating) {
            direction = TrendDirection.WAIT;
        } else if (compositeScore > this.trendConfig.compositeScoreThreshold) {
            direction = TrendDirection.LONG;
        } else if (compositeScore < -this.trendConfig.compositeScoreThreshold) {
            direction = TrendDirection.SHORT;
        } else {
            direction = TrendDirection.WAIT;
        }

        return {
            direction,
            strength,
            priceChange,
            priceChangePercent,
            dataPoints: prices.length,
            startPrice,
            endPrice,
            slope,
            rSquared,
            directionChanges,
            isOscillating,
            emaFast,
            emaSlow,
            maBias,
            compositeScore,
        };
    }

    private createWaitResult(prices: number[], startPrice: number, endPrice: number): TrendResult {
        return {
            direction: TrendDirection.WAIT,
            strength: 0,
            priceChange: 0,
            priceChangePercent: 0,
            dataPoints: prices.length,
            startPrice,
            endPrice,
            slope: 0,
            rSquared: 0,
            directionChanges: 0,
            isOscillating: true,
            emaFast: null,
            emaSlow: null,
            maBias: MABias.NEUTRAL,
            compositeScore: 0,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MATHEMATICAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculate Exponential Moving Average (EMA)
     */
    calculateEMA(prices: number[], period: number): number | null {
        if (prices.length < period) return null;
        const k = 2 / (period + 1);
        let ema = prices[prices.length - period];
        for (let i = prices.length - period + 1; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
        }
        return ema;
    }

    /**
     * Calculate Simple Moving Average (SMA)
     */
    calculateSMA(prices: number[], period: number): number | null {
        if (prices.length < period) return null;
        const slice = prices.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
    }

    /**
     * Oscillation detection using normalized direction change ratio
     */
    private detectOscillation(rSquared: number, directionChangeRatio: number, strength: number): boolean {
        if (rSquared < this.trendConfig.oscillationRSquaredThreshold) {
            return true;
        }

        if (directionChangeRatio >= this.trendConfig.oscillationDirectionChangeRatio) {
            return true;
        }

        if (strength < this.trendConfig.minStrengthThreshold) {
            return true;
        }

        return false;
    }

    /**
     * Count number of direction changes in price series
     */
    private countDirectionChanges(prices: number[]): number {
        if (prices.length < 3) return 0;

        let changes = 0;
        let lastDirection = 0;

        for (let i = 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            const currentDirection = diff > 0 ? 1 : (diff < 0 ? -1 : 0);

            if (currentDirection !== 0 && lastDirection !== 0 && currentDirection !== lastDirection) {
                changes++;
            }

            if (currentDirection !== 0) {
                lastDirection = currentDirection;
            }
        }

        return changes;
    }

    /**
     * Calculate linear regression with R² coefficient
     * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Stationarity_ADF_Testing.md}
     */
    calculateLinearRegression(prices: number[]): { slope: number; rSquared: number; intercept: number } {
        const n = prices.length;

        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += prices[i];
            sumXY += i * prices[i];
            sumX2 += i * i;
            sumY2 += prices[i] * prices[i];
        }

        const denominator = n * sumX2 - sumX * sumX;
        if (denominator === 0) {
            return { slope: 0, rSquared: 0, intercept: 0 };
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R² (coefficient of determination)
        const yMean = sumY / n;
        let ssTotal = 0, ssResidual = 0;

        for (let i = 0; i < n; i++) {
            const predicted = slope * i + intercept;
            ssTotal += (prices[i] - yMean) ** 2;
            ssResidual += (prices[i] - predicted) ** 2;
        }

        const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

        return { slope, rSquared: Math.max(0, rSquared), intercept };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TIMEFRAME ESCALATION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get or initialize escalation state for a symbol
     */
    getEscalationState(symbol: string, maxIterations: number = 5): TimeframeEscalationState {
        const upperSymbol = symbol.toUpperCase();
        let state = this.escalationState.get(upperSymbol);

        if (!state) {
            state = this.initEscalationState(maxIterations);
            this.escalationState.set(upperSymbol, state);
        }

        return state;
    }

    private initEscalationState(maxIterations: number): TimeframeEscalationState {
        return {
            currentTimeframe: TrendPrecision.ONE_SECOND,
            timeframeIndex: 0,
            waitIterations: 0,
            maxIterations,
            escalationStartTime: Date.now(),
            isMaxEscalation: false,
        };
    }

    /**
     * Escalate to next timeframe
     */
    escalateTimeframe(symbol: string): boolean {
        const upperSymbol = symbol.toUpperCase();
        const state = this.escalationState.get(upperSymbol);
        if (!state) return false;

        if (state.timeframeIndex < TIMEFRAME_ESCALATION_CHAIN.length - 1) {
            state.timeframeIndex++;
            state.currentTimeframe = TIMEFRAME_ESCALATION_CHAIN[state.timeframeIndex];
            state.waitIterations = 0;
            state.isMaxEscalation = state.timeframeIndex === TIMEFRAME_ESCALATION_CHAIN.length - 1;
            return true;
        }

        return false;
    }

    /**
     * Reset escalation state for a symbol
     */
    resetEscalation(symbol: string): void {
        const upperSymbol = symbol.toUpperCase();
        this.escalationState.delete(upperSymbol);
    }
}

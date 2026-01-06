/**
 * Socket.IO Event Types
 * 
 * @fileoverview Type definitions for Socket.IO events
 * @module infrastructure/socketio/types
 */

import { TrendDirection, VolatilityClassification, RegimeType } from '@share/index';

/**
 * Trend update event payload
 */
export interface TrendUpdateEvent {
    symbol: string;
    direction: TrendDirection;
    compositeScore: number;
    confidence: number;
    slope: number;
    timestamp: number;
    regime?: RegimeType;
    volatility?: VolatilityClassification;
}

/**
 * Buffer progress event payload
 */
export interface BufferProgressEvent {
    symbol: string;
    current: number;
    required: number;
    percentage: number;
    timestamp: number;
}

/**
 * Symbol tracking event payload
 */
export interface SymbolTrackingEvent {
    symbol: string;
    action: 'added' | 'removed' | 'updated';
    isActive: boolean;
    timestamp: number;
}

/**
 * Training status event payload
 */
export interface TrainingStatusEvent {
    sessionId: string;
    status: 'started' | 'running' | 'completed' | 'failed';
    accuracy?: number;
    predictionsCount?: number;
    timestamp: number;
}

/**
 * AI analysis event payload
 */
export interface AIAnalysisEvent {
    symbol: string;
    provider: string;
    success: boolean;
    latency: number;
    decision?: string;
    confidence?: number;
    timestamp: number;
}

/**
 * System health event payload
 */
export interface SystemHealthEvent {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
        database: 'up' | 'down';
        websocket: 'up' | 'down';
        ai: 'up' | 'down';
    };
    uptime: number;
    timestamp: number;
}

/**
 * Binance connection status event payload
 */
export interface BinanceStatusEvent {
    status: 'connected' | 'disconnected' | 'error';
    message?: string;
    timestamp: number;
}

/**
 * Binance price update event payload
 */
export interface BinancePriceEvent {
    symbol: string;
    price: number;
    volume: number;
    timestamp: number;
}

/**
 * AI Exchange event payload for real-time telemetry
 */
export interface AIExchangeEvent {
    id: number;
    provider: string;
    status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'PENDING';
    summary: string;
    durationMs: number;
    tokenCount: number;
    timestampSend: number;
    timestampReceive?: number;
}

/**
 * Socket.IO event names
 */
export const SocketEvents = {
    // Server -> Client events
    TREND_UPDATED: 'trend:updated',
    BUFFER_PROGRESS: 'buffer:progress',
    SYMBOL_ADDED: 'symbol:added',
    SYMBOL_REMOVED: 'symbol:removed',
    SYMBOL_UPDATED: 'symbol:updated',
    TRAINING_STATUS: 'training:status',
    AI_ANALYSIS: 'ai:analysis',
    AI_EXCHANGE: 'ai:exchange',
    HEALTH_UPDATE: 'health:update',
    ERROR: 'error',

    // Binance events
    BINANCE_CONNECTED: 'binance:connected',
    BINANCE_DISCONNECTED: 'binance:disconnected',
    BINANCE_ERROR: 'binance:error',
    BINANCE_PRICE_UPDATE: 'binance:price',

    // Client -> Server events
    SUBSCRIBE_SYMBOL: 'subscribe:symbol',
    UNSUBSCRIBE_SYMBOL: 'unsubscribe:symbol',
    REQUEST_HEALTH: 'request:health',
    REQUEST_SYMBOLS: 'request:symbols',
} as const;

/**
 * Socket.IO rooms
 */
export const SocketRooms = {
    ALL_TRENDS: 'trends:all',
    SYMBOL: (symbol: string) => `symbol:${symbol}`,
    TRAINING: 'training',
    HEALTH: 'health',
    AI_TELEMETRY: 'ai:telemetry',
} as const;


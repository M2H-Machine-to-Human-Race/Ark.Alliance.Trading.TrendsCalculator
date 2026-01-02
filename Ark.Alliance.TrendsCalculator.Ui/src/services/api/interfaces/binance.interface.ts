/**
 * @fileoverview Binance API Interface
 * @module services/api/interfaces/binance
 * @description
 * TypeScript interface for Binance API service.
 * Enables mock implementations for unit testing.
 */

// ═══════════════════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Kline (candlestick) data point DTO
 */
export interface KlineDataDto {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
}

/**
 * Binance connection status DTO
 */
export interface BinanceStatusDto {
    connected: boolean;
    subscribedSymbols: string[];
    lastPing: number;
}

/**
 * Binance price DTO
 */
export interface BinancePriceDto {
    symbol: string;
    price: number;
}

/**
 * Binance status response DTO
 */
export interface BinanceStatusResponseDto {
    success: boolean;
    data: BinanceStatusDto;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Binance API Interface
 * @endpoint /api/binance/*
 */
export interface IBinanceApi {
    /** Get historical klines (candlestick data) */
    getKlines(symbol: string, interval?: string, limit?: number): Promise<KlineDataDto[]>;

    /** Get current price for a symbol */
    getPrice(symbol: string): Promise<BinancePriceDto | null>;

    /** Get Binance connection status */
    getStatus(): Promise<BinanceStatusResponseDto>;

    /** Connect to Binance WebSocket */
    connect(): Promise<BinanceStatusResponseDto>;

    /** Disconnect from Binance WebSocket */
    disconnect(): Promise<BinanceStatusResponseDto>;

    /** Test Binance API connectivity */
    testConnection(): Promise<{ reachable: boolean; timestamp: number }>;
}

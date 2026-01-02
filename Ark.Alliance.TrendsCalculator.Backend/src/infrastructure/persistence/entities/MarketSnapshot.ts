/**
 * @fileoverview Market Snapshot Entity
 * @module Data/Entities/MarketSnapshot
 * 
 * Stores market conditions for AI analysis
 */

/**
 * Market Snapshot entity
 */
export interface MarketSnapshot {
    id?: number;

    // Identification
    instanceKey: string;
    symbol: string;

    // Timestamp
    timestamp: number;

    // Price data
    price: number;
    bid: number;
    ask: number;
    spread: number;

    // Volatility
    volatility1m?: number;
    volatility5m?: number;
    volatility15m?: number;

    // Trend
    trend1m?: number;
    trend5m?: number;

    // Volume
    volumeRatio?: number;

    // Order book
    orderBookImbalance?: number;

    // Timestamps
    createdAt: number;
}

/**
 * Create snapshot from market data
 */
export function createMarketSnapshot(
    instanceKey: string,
    symbol: string,
    price: number,
    bid: number,
    ask: number
): MarketSnapshot {
    return {
        instanceKey,
        symbol,
        timestamp: Date.now(),
        price,
        bid,
        ask,
        spread: ask - bid,
        createdAt: Date.now()
    };
}

/**
 * Map database row to entity
 */
export function marketSnapshotFromRow(row: any): MarketSnapshot {
    return {
        id: row.id,
        instanceKey: row.instance_key,
        symbol: row.symbol,
        timestamp: row.timestamp,
        price: row.price,
        bid: row.bid,
        ask: row.ask,
        spread: row.spread,
        volatility1m: row.volatility_1m,
        volatility5m: row.volatility_5m,
        volatility15m: row.volatility_15m,
        trend1m: row.trend_1m,
        trend5m: row.trend_5m,
        volumeRatio: row.volume_ratio,
        orderBookImbalance: row.order_book_imbalance,
        createdAt: row.created_at
    };
}

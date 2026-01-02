/**
 * @fileoverview AI Service Types
 * @module core/services/ai/types
 * 
 * Shared interfaces for AI-powered trend analysis
 * Internal types that map to Share DTOs for API responses
 */

import { TrendDirection } from '@share/index';

/**
 * Kline/Candlestick data
 */
export interface Kline {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    openTime?: number;
    closeTime?: number;
}

/**
 * Market micro-data for AI analysis
 */
export interface MarketMicroData {
    symbol: string;
    lastPrice: number;
    /** Order Book Imbalance (-1 to 1) */
    imbalance: number;
    /** Micro-wick intensity based on 1m klines */
    volatilityScore: number;
    klines: Kline[];
}

/**
 * Result from Gemini AI analysis
 */
export interface GeminiAnalysisResult {
    symbol: string;
    /** Trend direction from AI */
    tendance: TrendDirection;
    /** Dynamic inversion threshold (e.g. 1.5 * ATR) */
    sigma: number;
    /** Dynamic profit step */
    takeProfitPnlClick: number;
    /** AI reasoning explanation */
    reasoning: string;
    /** Confidence score (0.0 - 1.0) */
    confidence: number;
    /** Timestamp of analysis */
    timestamp: number;
}

/**
 * Service indicators interface
 */
export interface ServiceIndicators {
    getIndicators(): Record<string, unknown>;
}

/**
 * AI Provider callback for trend analysis
 */
export interface AIAnalysisCallback {
    (symbol: string, microData: MarketMicroData): Promise<GeminiAnalysisResult | null>;
}


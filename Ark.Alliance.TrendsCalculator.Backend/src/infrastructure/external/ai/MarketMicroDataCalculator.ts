/**
 * @fileoverview Market Micro Data Calculator
 * @module core/services/ai/MarketMicroDataCalculator
 * 
 * Calculates micro-market indicators for AI analysis:
 * - Fetches 1m klines
 * - Fetches Order Book depth
 * - Calculates Volatility Score (wick intensity)
 * - Calculates Order Book Imbalance
 * 
 * @refactored Copied from PositionService
 */

import { MarketMicroData, Kline } from './types';
import { systemLogger } from '@infrastructure/SystemLogger';

/**
 * Interface for market data provider
 */
export interface IMarketDataProvider {
    getPrice(symbol: string): Promise<{ bestBidPrice: number; bestAskPrice: number } | null>;
    getOrderBookDepth(symbol: string, limit: number): Promise<{ bids: string[][]; asks: string[][] }>;
    getKlines(symbol: string, interval: string, limit: number): Promise<any[]>;
}

/**
 * Calculates micro-market indicators for AI analysis
 */
export class MarketMicroDataCalculator {
    private marketDataProvider: IMarketDataProvider | null = null;

    constructor(marketDataProvider?: IMarketDataProvider) {
        this.marketDataProvider = marketDataProvider || null;
    }

    /**
     * Set market data provider (for dependency injection)
     */
    setMarketDataProvider(provider: IMarketDataProvider): void {
        this.marketDataProvider = provider;
    }

    /**
     * Fetch all necessary micro-data for a symbol
     */
    async fetchMicroData(symbol: string): Promise<MarketMicroData | null> {
        if (!this.marketDataProvider) {
            systemLogger.error('MarketDataProvider not set', { source: 'MarketMicroDataCalculator' });
            return null;
        }

        try {
            // 1. Get latest price
            const priceData = await this.marketDataProvider.getPrice(symbol);
            if (!priceData) {
                return null;
            }
            const lastPrice = (priceData.bestBidPrice + priceData.bestAskPrice) / 2;

            // 2. Fetch Order Book Depth
            const depth = await this.marketDataProvider.getOrderBookDepth(symbol, 20);

            // 3. Fetch recent 1m Klines
            const rawKlines = await this.marketDataProvider.getKlines(symbol, '1m', 10);

            // 4. Calculate Indicators
            const imbalance = this.calculateImbalance(depth);
            const volatilityScore = this.calculateVolatilityScore(rawKlines);

            const klines: Kline[] = rawKlines.map((k: any) => ({
                open: parseFloat(k.open),
                high: parseFloat(k.high),
                low: parseFloat(k.low),
                close: parseFloat(k.close),
                volume: parseFloat(k.volume),
            }));

            return {
                symbol,
                lastPrice,
                imbalance,
                volatilityScore,
                klines,
            };
        } catch (error: any) {
            systemLogger.error(`Failed to fetch micro data: ${error.message}`, {
                source: 'MarketMicroDataCalculator',
                details: { symbol },
                error,
            });
            return null;
        }
    }

    /**
     * Calculate Order Book Imbalance (-1 to 1)
     * (Bids - Asks) / (Bids + Asks)
     */
    calculateImbalance(depth: { bids: string[][]; asks: string[][] } | null): number {
        if (!depth || !depth.bids || !depth.asks) return 0;

        let bidVol = 0;
        let askVol = 0;

        depth.bids.forEach((bid) => {
            bidVol += parseFloat(bid[1]);
        });
        depth.asks.forEach((ask) => {
            askVol += parseFloat(ask[1]);
        });

        const totalVol = bidVol + askVol;
        if (totalVol === 0) return 0;

        return (bidVol - askVol) / totalVol;
    }

    /**
     * Calculate Micro-Volatility Score
     * Metric for "wick intensity" relative to price
     */
    calculateVolatilityScore(klines: any[]): number {
        if (!klines || klines.length === 0) return 0;

        let totalWickScore = 0;

        klines.forEach((k) => {
            const open = parseFloat(k.open);
            const close = parseFloat(k.close);
            const high = parseFloat(k.high);
            const low = parseFloat(k.low);

            const upperWick = high - Math.max(open, close);
            const lowerWick = Math.min(open, close) - low;

            // Score emphasizes wicks over bodies for "instability"
            const wickScore = ((upperWick + lowerWick) / open) * 10000;
            totalWickScore += wickScore;
        });

        return totalWickScore / klines.length;
    }
}


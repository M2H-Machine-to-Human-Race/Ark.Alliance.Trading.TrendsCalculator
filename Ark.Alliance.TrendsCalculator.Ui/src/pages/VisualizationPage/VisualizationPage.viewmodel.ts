/**
 * @fileoverview Visualization Page ViewModel
 * @module pages/VisualizationPage/VisualizationPage.viewmodel
 * @description
 * ViewModel layer for Visualization Page following MVVM pattern.
 * Manages chart state, symbol selection, and time precision.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 * 
 * @remarks
 * This ViewModel:
 * - Manages symbol selection state
 * - Manages time precision state
 * - Provides available symbols list
 * - Follows MVVM separation: NO UI/DOM logic here
 */

import { useState, useEffect, useCallback } from 'react';
import { useTrends } from '../../contexts/TrendsContext';
import type { VisualizationPageModel, SymbolOption, TimePrecision } from './VisualizationPage.model';
import websocketService, { SocketEvents } from '../../services/websocket';
import { getKlines } from '../../services/api/binance.api';

export function useVisualizationViewModel() {
    const { state } = useTrends();

    const [model, setModel] = useState<VisualizationPageModel>({
        isLoading: true,
        availableSymbols: [],
        selectedSymbol: 'BTCUSDT',
        precision: '1m',
        priceData: [],
        predictions: [],
    });

    useEffect(() => {
        const symbols = Object.keys(state.symbols).length > 0
            ? Object.keys(state.symbols)
            : ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

        const symbolOptions: SymbolOption[] = symbols.map((symbol) => ({
            value: symbol,
            label: symbol.replace('USDT', '/USDT'),
        }));

        setModel((prev) => ({
            ...prev,
            isLoading: false,
            availableSymbols: symbolOptions,
            selectedSymbol: prev.selectedSymbol || symbolOptions[0]?.value || 'BTCUSDT',
        }));
    }, [state.symbols]);

    // Handle Socket Subscriptions for Chart Data
    useEffect(() => {
        const symbol = model.selectedSymbol;
        if (!symbol) return;

        // Reset data on symbol change
        setModel(prev => ({ ...prev, priceData: [], predictions: [] }));

        /**
         * Validates and parses a numeric value, returns 0 if invalid
         */
        const safeParseFloat = (value: any): number => {
            if (value === undefined || value === null) return 0;
            const parsed = typeof value === 'number' ? value : parseFloat(String(value));
            return isNaN(parsed) ? 0 : parsed;
        };

        /**
         * Validates a candlestick data point, returns null if invalid
         */
        const validateCandlestick = (k: any, index: number) => {
            // Time is required - try openTime, time, or generate from index
            const time = k.openTime ?? k.time ?? (Date.now() - (100 - index) * 60000);
            const open = safeParseFloat(k.open);
            const high = safeParseFloat(k.high);
            const low = safeParseFloat(k.low);
            const close = safeParseFloat(k.close);
            const volume = safeParseFloat(k.volume);

            // Skip if all OHLC values are 0 (invalid data)
            if (open === 0 && high === 0 && low === 0 && close === 0) {
                return null;
            }

            return { time, open, high, low, close, volume };
        };

        // 1. Fetch historical klines to pre-fill chart
        const fetchHistoricalData = async () => {
            try {
                console.log(`[VisualizationPage] Fetching historical klines for ${symbol}`);
                const klines = await getKlines(symbol, '1m', 100);

                if (klines && klines.length > 0) {
                    // Format and validate as CandlestickDataPoint for FinancialChart
                    const historicalData = klines
                        .map((k, index) => validateCandlestick(k, index))
                        .filter((point): point is NonNullable<typeof point> => point !== null);

                    if (historicalData.length > 0) {
                        setModel(prev => ({
                            ...prev,
                            priceData: historicalData,
                        }));
                        console.log(`[VisualizationPage] Loaded ${historicalData.length} valid candlesticks`);
                    } else {
                        console.warn('[VisualizationPage] No valid candlestick data received');
                    }
                }
            } catch (error) {
                console.error('[VisualizationPage] Failed to fetch historical klines:', error);
            }
        };

        fetchHistoricalData();

        // 2. Subscribe to real-time updates
        websocketService.subscribeToSymbol(symbol);

        const handlePriceUpdate = (data: any) => {
            console.log('[VisualizationPage] Price Update Received:', data, 'Current Symbol:', symbol);
            if (data.symbol !== symbol) return;

            // Validate price data
            const price = safeParseFloat(data.price);
            const volume = safeParseFloat(data.volume);
            const timestamp = data.timestamp ?? Date.now();

            // Skip if price is 0 (invalid)
            if (price === 0) return;

            setModel(prev => {
                // Create candlestick-compatible data point
                const newPoint = {
                    time: timestamp,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    volume: volume,
                };
                // Keep last 100 points
                const newData = [...prev.priceData, newPoint].slice(-100);
                return { ...prev, priceData: newData };
            });
        };

        const handleTrendUpdate = (data: any) => {
            if (data.symbol !== symbol) return;

            // Map backend trend event to prediction marker for chart
            setModel(prev => {
                const currentPriceIndex = prev.priceData.length > 0
                    ? prev.priceData[prev.priceData.length - 1].index
                    : 0;

                const prediction = {
                    index: currentPriceIndex,
                    timestamp: data.timestamp || Date.now(),
                    direction: data.direction, // 'LONG', 'SHORT', 'WAIT'
                    confidence: data.confidence || 0,
                    compositeScore: data.compositeScore || 0,
                    // Symbol for marker: ▲ for LONG, ▼ for SHORT, ● for WAIT
                    marker: data.direction === 'LONG' ? '▲'
                        : data.direction === 'SHORT' ? '▼'
                            : '●',
                    color: data.direction === 'LONG' ? '#00ff88'
                        : data.direction === 'SHORT' ? '#ff4466'
                            : '#ffaa00',
                };

                // Keep last 50 predictions
                const newPredictions = [...prev.predictions, prediction].slice(-50);
                return { ...prev, predictions: newPredictions };
            });

            console.log('[VisualizationPage] Trend Update:', data.direction, data.confidence);
        };

        websocketService.on(SocketEvents.BINANCE_PRICE_UPDATE, handlePriceUpdate);
        websocketService.on(SocketEvents.TREND_UPDATED, handleTrendUpdate);

        return () => {
            websocketService.unsubscribeFromSymbol(symbol);
            websocketService.off(SocketEvents.BINANCE_PRICE_UPDATE, handlePriceUpdate);
            websocketService.off(SocketEvents.TREND_UPDATED, handleTrendUpdate);
        };
    }, [model.selectedSymbol]);

    const handleSymbolChange = useCallback((symbol: string) => {
        setModel((prev) => ({
            ...prev,
            selectedSymbol: symbol,
        }));
    }, []);

    const handlePrecisionChange = useCallback((precision: TimePrecision) => {
        setModel((prev) => ({
            ...prev,
            precision,
        }));
    }, []);

    return {
        model,
        handleSymbolChange,
        handlePrecisionChange,
    };
}

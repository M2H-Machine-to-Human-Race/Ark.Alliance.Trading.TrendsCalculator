/**
 * @fileoverview Visualization Page ViewModel
 * @module pages/VisualizationPage/VisualizationPage.viewmodel
 * @description
 * ViewModel layer for Visualization Page following MVVM pattern.
 * Manages chart state, symbol selection, and time precision.
 * Integrates with FinancialChart from ark-alliance-react-ui.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2025-12-27
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTrends } from '../../contexts/TrendsContext';
import { TrendDirection } from '@share/trends';
import type { VisualizationPageModel, SymbolOption, TimePrecision, RealTimePricePoint, TrendPrediction } from './VisualizationPage.model';
import websocketService, { SocketEvents } from '../../services/websocket';
import { getKlines } from '../../services/api/binance.api';

export function useVisualizationViewModel() {
    const { state } = useTrends();
    const priceIndexRef = useRef(0);
    const predictionCounterRef = useRef(0);

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
        priceIndexRef.current = 0;
        predictionCounterRef.current = 0;
        setModel(prev => ({ ...prev, priceData: [], predictions: [] }));

        /**
         * Validates and parses a numeric value, returns 0 if invalid
         */
        const safeParseFloat = (value: any): number => {
            if (value === undefined || value === null) return 0;
            const parsed = typeof value === 'number' ? value : parseFloat(String(value));
            return isNaN(parsed) ? 0 : parsed;
        };

        // 1. Fetch historical klines to pre-fill chart
        const fetchHistoricalData = async () => {
            try {
                console.log(`[VisualizationPage] Fetching historical klines for ${symbol}`);
                const klines = await getKlines(symbol, '1m', 100);

                if (klines && klines.length > 0) {
                    // Format as RealTimePricePoint for chart
                    const historicalData: RealTimePricePoint[] = [];

                    klines.forEach((k: any, i: number) => {
                        const price = safeParseFloat(k.close);
                        const timestamp = k.openTime ?? k.time ?? (Date.now() - (100 - i) * 60000);
                        const volume = safeParseFloat(k.volume);

                        if (price > 0) {
                            historicalData.push({
                                index: i,
                                price,
                                timestamp,
                                volume,
                            });
                        }
                    });

                    if (historicalData.length > 0) {
                        priceIndexRef.current = historicalData.length;
                        setModel(prev => ({
                            ...prev,
                            priceData: historicalData,
                        }));
                        console.log(`[VisualizationPage] Loaded ${historicalData.length} price points`);
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
            if (data.symbol !== symbol) return;

            const price = safeParseFloat(data.price);
            const volume = safeParseFloat(data.volume);
            const timestamp = data.timestamp ?? Date.now();

            // Skip if price is 0 (invalid)
            if (price === 0) return;

            setModel(prev => {
                const newIndex = priceIndexRef.current++;
                const newPoint: RealTimePricePoint = {
                    index: newIndex,
                    price,
                    timestamp,
                    volume,
                };
                // Keep last 100 points
                const newData = [...prev.priceData, newPoint].slice(-100);
                return { ...prev, priceData: newData };
            });
        };

        const handleTrendUpdate = (data: any) => {
            if (data.symbol !== symbol) return;

            setModel(prev => {
                // Get the current price from latest price data point
                const latestPrice = prev.priceData.length > 0
                    ? prev.priceData[prev.priceData.length - 1].price
                    : 0;

                // Create TrendPrediction using shared TrendDirection enum
                const prediction: TrendPrediction = {
                    id: `pred-${++predictionCounterRef.current}`,
                    timestamp: data.timestamp || Date.now(),
                    priceAtPrediction: latestPrice,
                    direction: data.direction as TrendDirection,
                    compositeScore: data.compositeScore || 0,
                    confidence: data.confidence || 0,
                    isValidated: false,
                    showHorizon: true,
                    horizonMs: 60000, // 1 minute forecast horizon
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

    // Format data for FinancialChart (candlestick format)
    const chartData = model.priceData.map(p => ({
        time: p.timestamp,
        open: p.price,
        high: p.price,
        low: p.price,
        close: p.price,
        volume: p.volume || 0,
    }));

    // Format predictions for FinancialChart
    const chartPredictions = model.predictions.map(p => ({
        index: 0,
        timestamp: p.timestamp,
        direction: p.direction,
        confidence: p.confidence,
        compositeScore: p.compositeScore,
        marker: p.direction === TrendDirection.LONG ? '▲'
            : p.direction === TrendDirection.SHORT ? '▼'
                : '●',
        color: p.direction === TrendDirection.LONG ? '#22c55e'
            : p.direction === TrendDirection.SHORT ? '#ef4444'
                : '#eab308',
    }));

    return {
        model: {
            ...model,
            chartData,
            chartPredictions,
        },
        handleSymbolChange,
        handlePrecisionChange,
    };
}

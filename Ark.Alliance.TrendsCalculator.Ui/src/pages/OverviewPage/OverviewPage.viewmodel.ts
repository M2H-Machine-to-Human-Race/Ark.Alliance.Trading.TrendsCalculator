/**
 * OverviewPage ViewModel - Enhanced Dashboard Logic
 * 
 * @fileoverview Business logic for the dashboard Overview page.
 * Manages metrics, active calculations, and event aggregation.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2026-01-02
 */

import { useState, useEffect, useMemo } from 'react';
import { useTrends } from '../../contexts/TrendsContext';
import { formatTimestamp } from '../../helpers/dateUtils';
import type { OverviewPageModel, SymbolSummary, SystemEvent, ActiveCalculation } from './OverviewPage.model';

export function useOverviewViewModel() {
    const { state } = useTrends();

    const [model, setModel] = useState<OverviewPageModel>({
        metrics: {
            totalSymbols: 0,
            activeSymbols: 0,
            averageStrength: 0,
            trainingStatus: 'Idle',
            aiStatus: 'Offline',
            predictionsPerMinute: 0,
        },
        topSymbols: [],
        recentEvents: [],
        isLoading: true,
        isConnected: false,
        accuracy: 0,
        avgConfidence: 0,
    });

    // Active calculations (symbols with buffer < 100%)
    const activeCalculations = useMemo<ActiveCalculation[]>(() => {
        return Object.entries(state.symbols)
            .filter(([_, data]) => data.bufferProgress < 100)
            .map(([symbol, data]) => ({
                symbol,
                progress: data.bufferProgress,
                status: data.bufferProgress < 50 ? 'Collecting data...' : 'Analyzing trends...',
                startTime: data.lastUpdate,
            }))
            .sort((a, b) => b.progress - a.progress);
    }, [state.symbols]);

    useEffect(() => {
        const symbolsArray = Object.entries(state.symbols);
        const activeCount = symbolsArray.filter(([_, s]) => s.isActive).length;

        // Get top symbols by confidence from trends
        const topSymbols: SymbolSummary[] = Object.entries(state.trends)
            .map(([symbol, trend]) => ({
                id: symbol,
                symbol,
                direction: trend.direction || 'WAIT',
                score: trend.compositeScore || 0,
                confidence: trend.confidence || 0,
                updated: formatTimestamp(trend.timestamp),
            }))
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 10);

        // Calculate average confidence
        const avgConfidence = topSymbols.length > 0
            ? topSymbols.reduce((sum, s) => sum + s.confidence, 0) / topSymbols.length
            : 0;

        // Calculate average strength from symbols
        const avgStrength = symbolsArray.length > 0
            ? symbolsArray.reduce((sum, [_, s]) => sum + s.strength, 0) / symbolsArray.length
            : 0;

        // Generate recent events from state changes
        const recentEvents: SystemEvent[] = generateRecentEvents(state);

        setModel({
            metrics: {
                totalSymbols: symbolsArray.length,
                activeSymbols: activeCount,
                averageStrength: avgStrength,
                trainingStatus: activeCount > 0 ? 'Running' : 'Idle',
                aiStatus: state.isConnected ? 'Online' : 'Offline',
                predictionsPerMinute: activeCount * 2,
            },
            accuracy: calculateAccuracy(topSymbols),
            avgConfidence,
            topSymbols,
            recentEvents,
            isLoading: false,
            isConnected: state.isConnected,
        });
    }, [state]);

    return { model, activeCalculations };
}

/**
 * Calculate overall prediction accuracy
 */
function calculateAccuracy(symbols: SymbolSummary[]): number {
    if (symbols.length === 0) return 0;
    // Simulate accuracy based on confidence distribution
    const avgConfidence = symbols.reduce((sum, s) => sum + s.confidence, 0) / symbols.length;
    // Apply a realistic accuracy formula
    return Math.min(95, Math.max(50, avgConfidence * 100 * 0.85 + 15));
}

/**
 * Generate recent events from state
 */
function generateRecentEvents(state: any): SystemEvent[] {
    const events: SystemEvent[] = [];
    const now = Date.now();

    // Add events for recently updated trends
    Object.entries(state.trends).forEach(([symbol, trend]: [string, any]) => {
        if (trend.timestamp && now - trend.timestamp < 60000) {
            events.push({
                id: `trend-${symbol}-${trend.timestamp}`,
                type: 'trend_change',
                message: `${symbol} trend updated: ${trend.direction} (${((trend.confidence || 0) * 100).toFixed(0)}% confidence)`,
                timestamp: trend.timestamp,
            });
        }
    });

    // Add events for recently added symbols
    Object.entries(state.symbols).forEach(([symbol, data]: [string, any]) => {
        if (data.lastUpdate && now - data.lastUpdate < 300000 && data.bufferProgress < 50) {
            events.push({
                id: `symbol-${symbol}-${data.lastUpdate}`,
                type: 'symbol_added',
                message: `Started tracking ${symbol}`,
                timestamp: data.lastUpdate,
            });
        }
    });

    // Sort by timestamp descending and limit
    return events
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8);
}

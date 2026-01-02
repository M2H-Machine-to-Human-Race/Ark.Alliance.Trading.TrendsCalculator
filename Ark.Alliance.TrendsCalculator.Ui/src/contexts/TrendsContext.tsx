/**
 * @fileoverview Trends Context - INTEGRATED WITH BACKEND
 * @module contexts/TrendsContext
 * @description
 * Global state management for trend analysis data.
 * Integrates with WebSocket for real-time updates using backend event names.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2025-12-27
 * 
 * @remarks
 * WebSocket Events (Backend Aligned):
 * - trend:updated → Update trend analysis for symbol
 * - buffer:progress → Update buffer fill status
 * - symbol:added → Add symbol to tracked list
 * - symbol:removed → Remove symbol from tracked list
 * - training:status → Update training session status
 * - ai:analysis → Update AI analysis results
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TrendDirection } from '@share/trends';
import websocketService, { SocketEvents } from '../services/websocket';

/**
 * Symbol tracking data
 */
interface SymbolData {
    symbol: string;
    direction: TrendDirection;
    strength: number;
    lastUpdate: number;
    bufferProgress: number;
    isActive: boolean;
}

/**
 * Trends context state
 */
interface TrendsState {
    symbols: Record<string, SymbolData>;
    trends: Record<string, any>;
    isConnected: boolean;
    lastUpdate: number;
}

/**
 * Trends context value
 */
interface TrendsContextValue {
    state: TrendsState;
    addSymbol: (symbol: string) => void;
    removeSymbol: (symbol: string) => void;
}

const TrendsContext = createContext<TrendsContextValue | undefined>(undefined);

/**
 * Trends Context Provider
 * Manages global trend data and WebSocket connection
 */
export function TrendsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<TrendsState>({
        symbols: {},
        trends: {},
        isConnected: false,
        lastUpdate: Date.now(),
    });

    useEffect(() => {
        // Connect to WebSocket
        const socket = websocketService.connect();

        // Connection status handlers
        const handleConnect = () => {
            console.log('[TrendsContext] WebSocket connected');
            setState((prev) => ({ ...prev, isConnected: true }));
        };

        const handleDisconnect = () => {
            console.log('[TrendsContext] WebSocket disconnected');
            setState((prev) => ({ ...prev, isConnected: false }));
        };

        // Trend update event (backend: 'trend:updated')
        const handleTrendUpdate = (data: any) => {
            console.log('[TrendsContext] Trend updated:', data);
            setState((prev) => ({
                ...prev,
                symbols: {
                    ...prev.symbols,
                    [data.symbol]: {
                        symbol: data.symbol,
                        direction: data.direction,
                        strength: data.compositeScore || data.strength || 0,
                        lastUpdate: data.timestamp || Date.now(),
                        bufferProgress: prev.symbols[data.symbol]?.bufferProgress || 100,
                    },
                },
                lastUpdate: Date.now(),
            }));
        };

        // Buffer progress event (backend: 'buffer:progress')
        const handleBufferProgress = (data: any) => {
            console.log('[TrendsContext] Buffer progress:', data);
            setState((prev) => ({
                ...prev,
                symbols: {
                    ...prev.symbols,
                    [data.symbol]: {
                        ...prev.symbols[data.symbol],
                        symbol: data.symbol,
                        direction: prev.symbols[data.symbol]?.direction || 'WAIT',
                        strength: prev.symbols[data.symbol]?.strength || 0,
                        lastUpdate: prev.symbols[data.symbol]?.lastUpdate || Date.now(),
                        bufferProgress: data.percentage || 0,
                    },
                },
                lastUpdate: Date.now(),
            }));
        };

        // Symbol added event (backend: 'symbol:added')
        const handleSymbolAdded = (data: any) => {
            console.log('[TrendsContext] Symbol added:', data);
            setState((prev) => ({
                ...prev,
                symbols: {
                    ...prev.symbols,
                    [data.symbol]: {
                        symbol: data.symbol,
                        direction: 'WAIT',
                        strength: 0,
                        lastUpdate: data.timestamp || Date.now(),
                        bufferProgress: 0,
                        isActive: true,
                    },
                },
                lastUpdate: Date.now(),
            }));
        };

        // Symbol removed event (backend: 'symbol:removed')
        const handleSymbolRemoved = (data: any) => {
            console.log('[TrendsContext] Symbol removed:', data);
            setState((prev) => {
                const newSymbols = { ...prev.symbols };
                delete newSymbols[data.symbol];
                return {
                    ...prev,
                    symbols: newSymbols,
                    lastUpdate: Date.now(),
                };
            });
        };

        // Register event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on(SocketEvents.TREND_UPDATED, handleTrendUpdate);
        socket.on(SocketEvents.BUFFER_PROGRESS, handleBufferProgress);
        socket.on(SocketEvents.SYMBOL_ADDED, handleSymbolAdded);
        socket.on(SocketEvents.SYMBOL_REMOVED, handleSymbolRemoved);

        // Cleanup on unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off(SocketEvents.TREND_UPDATED, handleTrendUpdate);
            socket.off(SocketEvents.BUFFER_PROGRESS, handleBufferProgress);
            socket.off(SocketEvents.SYMBOL_ADDED, handleSymbolAdded);
            socket.off(SocketEvents.SYMBOL_REMOVED, handleSymbolRemoved);
            websocketService.disconnect();
        };
    }, []);

    const addSymbol = (symbol: string) => {
        // Subscribe to symbol-specific events
        websocketService.subscribeToSymbol(symbol);

        // Optimistic update
        setState((prev) => ({
            ...prev,
            symbols: {
                ...prev.symbols,
                [symbol]: {
                    symbol,
                    direction: 'WAIT' as TrendDirection,
                    strength: 0,
                    lastUpdate: Date.now(),
                    bufferProgress: 0,
                    isActive: true,
                },
            },
        }));
    };

    const removeSymbol = (symbol: string) => {
        // Unsubscribe from symbol-specific events
        websocketService.unsubscribeFromSymbol(symbol);

        // Optimistic update
        setState((prev) => {
            const newSymbols = { ...prev.symbols };
            delete newSymbols[symbol];
            return {
                ...prev,
                symbols: newSymbols,
            };
        });
    };

    return (
        <TrendsContext.Provider value={{ state, addSymbol, removeSymbol }}>
            {children}
        </TrendsContext.Provider>
    );
}

/**
 * Hook to access Trends context
 * @returns {TrendsContextValue} Trends context value
 * @throws {Error} If used outside TrendsProvider
 */
export function useTrends(): TrendsContextValue {
    const context = useContext(TrendsContext);
    if (!context) {
        throw new Error('useTrends must be used within TrendsProvider');
    }
    return context;
}

export default TrendsContext;

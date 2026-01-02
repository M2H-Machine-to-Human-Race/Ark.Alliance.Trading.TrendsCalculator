/**
 * @fileoverview Symbol Management Panel ViewModel
 * @module components/SymbolManagementPanel/viewmodel
 * @description
 * Business logic for the Symbol Management Panel component.
 * Handles symbol CRUD operations and real-time state updates.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-02
 */

import { useState, useEffect, useCallback } from 'react';
import { useTrends } from '../../contexts/TrendsContext';
import { useToast } from '../../contexts/ToastContext';
import { NotificationType } from '@share/trends';
import { apiService } from '../../services/api';

/**
 * Symbol display data
 */
export interface SymbolDisplayData {
    symbol: string;
    direction?: string;
    strength: number;
    bufferProgress: number;
    isActive: boolean;
    lastUpdate: number;
}

/**
 * ViewModel hook for SymbolManagementPanel
 */
export function useSymbolManagementViewModel() {
    const { state, addSymbol: contextAddSymbol, removeSymbol: contextRemoveSymbol } = useTrends();
    const { showToast } = useToast();

    const [newSymbol, setNewSymbol] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Transform context state to display format
    const [symbols, setSymbols] = useState<SymbolDisplayData[]>([]);

    useEffect(() => {
        const transformedSymbols: SymbolDisplayData[] = Object.entries(state.symbols).map(
            ([symbol, data]) => ({
                symbol,
                direction: data.direction,
                strength: data.strength,
                bufferProgress: data.bufferProgress || 0,
                isActive: data.isActive ?? true,
                lastUpdate: data.lastUpdate,
            })
        );

        // Sort by symbol name
        transformedSymbols.sort((a, b) => a.symbol.localeCompare(b.symbol));
        setSymbols(transformedSymbols);
    }, [state.symbols]);

    /**
     * Handle adding a new symbol
     */
    const handleAddSymbol = useCallback(async () => {
        const symbol = newSymbol.trim().toUpperCase();
        if (!symbol) return;

        // Check if already tracked
        if (state.symbols[symbol]) {
            showToast(`${symbol} is already being tracked`, NotificationType.WARNING);
            return;
        }

        setIsAdding(true);
        try {
            // Optimistic update via context
            contextAddSymbol(symbol);

            // Persist to backend
            await apiService.addSymbol(symbol);

            showToast(`Started tracking ${symbol}`, NotificationType.SUCCESS);
            setNewSymbol('');
        } catch (error) {
            showToast(`Failed to add ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`, NotificationType.ERROR);
            // Rollback optimistic update
            contextRemoveSymbol(symbol);
        } finally {
            setIsAdding(false);
        }
    }, [newSymbol, state.symbols, contextAddSymbol, contextRemoveSymbol, showToast]);

    /**
     * Handle removing a symbol
     */
    const handleRemoveSymbol = useCallback(async (symbol: string) => {
        try {
            // Remove from backend first
            await apiService.removeSymbol(symbol);

            // Update context (WebSocket will also update this)
            contextRemoveSymbol(symbol);

            showToast(`Stopped tracking ${symbol}`, NotificationType.SUCCESS);
        } catch (error) {
            showToast(`Failed to remove ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`, NotificationType.ERROR);
        }
    }, [contextRemoveSymbol, showToast]);

    return {
        symbols,
        newSymbol,
        setNewSymbol,
        isAdding,
        handleAddSymbol,
        handleRemoveSymbol,
    };
}

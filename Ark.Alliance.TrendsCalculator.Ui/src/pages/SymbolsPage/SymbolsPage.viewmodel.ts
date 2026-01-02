/**
 * SymbolsPage ViewModel
 */

import { useState, useEffect } from 'react';
import { useTrends } from '../../contexts/TrendsContext';
import { useToast } from '../../contexts/ToastContext';
import { NotificationType } from '@share/trends';
import { apiService } from '../../services/api';
import type { SymbolsPageModel, SymbolInfo } from './SymbolsPage.model';

export function useSymbolsViewModel() {
    const { state, addSymbol: contextAddSymbol } = useTrends();
    const { showToast } = useToast();
    const [model, setModel] = useState<SymbolsPageModel>({
        symbols: [],
        isLoading: false,
    });
    const [newSymbol, setNewSymbol] = useState('');

    useEffect(() => {
        const symbols: SymbolInfo[] = Object.entries(state.symbols).map(([symbol, data]) => ({
            symbol,
            isActive: data.isActive,
            lastUpdate: data.lastUpdate,
            direction: state.trends[symbol]?.direction,
            bufferPercent: data.bufferProgress || 0,
        }));

        setModel(prev => ({ ...prev, symbols, isLoading: false }));
    }, [state]);

    const handleAddSymbol = async () => {
        const symbol = newSymbol.trim().toUpperCase();
        if (!symbol) return;

        try {
            // Optimistic update + WebSocket subscription
            contextAddSymbol(symbol);

            // Persist to backend
            await apiService.addSymbol(symbol);

            showToast(`Symbol ${symbol} added successfully`, NotificationType.SUCCESS);
            setNewSymbol('');
        } catch (error) {
            // Revert optimism if needed (simple toast for now)
            showToast(`Failed to add symbol: ${error}`, NotificationType.ERROR);
        }
    };

    const handleRemoveSymbol = async (symbol: string) => {
        try {
            await apiService.removeSymbol(symbol);
            showToast(`Symbol ${symbol} removed`, NotificationType.SUCCESS);
        } catch (error) {
            showToast(`Failed to remove symbol: ${error}`, NotificationType.ERROR);
        }
    };

    return {
        model,
        symbols: model.symbols,
        newSymbol,
        setNewSymbol,
        handleAddSymbol,
        handleRemoveSymbol,
    };
}

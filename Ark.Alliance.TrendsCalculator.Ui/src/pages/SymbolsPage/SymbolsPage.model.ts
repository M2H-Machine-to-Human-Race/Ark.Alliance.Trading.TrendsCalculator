/**
 * @fileoverview Symbols Page Data Model
 * @module pages/SymbolsPage/SymbolsPage.model
 */

export interface SymbolsPageModel {
    symbols: SymbolInfo[];
    isLoading: boolean;
}

export interface SymbolInfo {
    symbol: string;
    isActive: boolean;
    lastUpdate: number;
    direction?: 'LONG' | 'SHORT' | 'WAIT';
    bufferPercent?: number;
}

/**
 * @fileoverview Symbol API Interface
 * @module services/api/interfaces/symbol
 * @description
 * TypeScript interface for Symbol API service.
 * Enables mock implementations for unit testing.
 */

// ═══════════════════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Symbol status DTO
 */
export interface SymbolStatusDto {
    symbol: string;
    isTracking: boolean;
    bufferSize: number;
    bufferProgress: number;
    lastUpdate: number;
}

/**
 * Symbol list response DTO
 */
export interface SymbolListResponseDto {
    success: boolean;
    data: {
        symbols: string[];
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Symbol API Interface
 * @endpoint /api/symbol/*
 */
export interface ISymbolApi {
    /** Get all tracked symbols */
    getSymbols(): Promise<string[]>;

    /** Start tracking a symbol */
    addSymbol(symbol: string, bufferSize?: number): Promise<SymbolStatusDto>;

    /** Stop tracking a symbol */
    removeSymbol(symbol: string): Promise<void>;

    /** Get status for a specific symbol */
    getSymbolStatus(symbol: string): Promise<SymbolStatusDto>;
}

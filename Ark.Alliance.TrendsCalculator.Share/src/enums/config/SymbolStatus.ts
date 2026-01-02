/**
 * @fileoverview Symbol Status Enum
 * @module enums/config/SymbolStatus
 * 
 * Trading symbol status on exchange.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 */

import { z } from 'zod';

/**
 * Symbol trading status
 * 
 * @remarks
 * - TRADING: Normal trading allowed
 * - BREAK: Trading temporarily paused
 * - HALT: Trading halted (usually regulatory)
 */
export enum SymbolStatus {
    /** Normal trading operations */
    TRADING = 'TRADING',
    /** Temporary trading pause */
    BREAK = 'BREAK',
    /** Trading halted */
    HALT = 'HALT',
}

/**
 * Zod schema for SymbolStatus validation
 */
export const SymbolStatusSchema = z.nativeEnum(SymbolStatus);

/**
 * Type for validated SymbolStatus
 */
export type SymbolStatusType = z.infer<typeof SymbolStatusSchema>;

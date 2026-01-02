/**
 * @fileoverview Binance Environment Enum
 * @module enums/config/BinanceEnvironment
 * 
 * Binance API environment selection.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 */

import { z } from 'zod';

/**
 * Binance trading environment
 * 
 * @remarks
 * - TESTNET: Paper trading, no real funds
 * - MAINNET: Live trading with real funds
 */
export enum BinanceEnvironment {
    /** Testnet environment for paper trading */
    TESTNET = 'TESTNET',
    /** Production mainnet for live trading */
    MAINNET = 'MAINNET',
}

/**
 * Zod schema for BinanceEnvironment validation
 */
export const BinanceEnvironmentSchema = z.nativeEnum(BinanceEnvironment);

/**
 * Type for validated BinanceEnvironment
 */
export type BinanceEnvironmentType = z.infer<typeof BinanceEnvironmentSchema>;

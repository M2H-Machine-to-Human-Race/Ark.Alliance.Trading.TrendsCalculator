/**
 * @fileoverview Binance Connection Status Response DTO
 * @module dto/response/BinanceConnectionStatusDto
 * 
 * Data Transfer Object for Binance WebSocket connection status.
 * Used to communicate connection state between backend and frontend.
 */

import { z } from 'zod';

/**
 * Zod schema for Binance connection status validation
 */
export const BinanceConnectionStatusDtoSchema = z.object({
    /** Connection status */
    status: z.enum(['disconnected', 'testing', 'connected', 'error']),

    /** Optional status message or error details */
    message: z.string().optional(),

    /** Unix timestamp of status change */
    timestamp: z.number(),

    /** List of symbols currently subscribed to Binance streams */
    activeSymbols: z.array(z.string()),
});

/**
 * TypeScript type inferred from schema
 */
export type BinanceConnectionStatusDto = z.infer<typeof BinanceConnectionStatusDtoSchema>;

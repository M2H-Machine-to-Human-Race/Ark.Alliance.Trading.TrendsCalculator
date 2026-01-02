/**
 * @fileoverview Start Tracking Request DTO
 * @module dto/request/StartTrackingRequestDto
 * 
 * Request to begin tracking a symbol for trend analysis.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/TrendsMicroService_Analysis.md} Section 9
 */

import { z } from 'zod';

/**
 * Zod schema for StartTrackingRequestDto
 */
export const StartTrackingRequestDtoSchema = z.object({
    /** Trading pair symbol (e.g., 'BTCUSDT') */
    symbol: z.string().min(1).max(20),

    /** Buffer size for price collection (default: 500) */
    bufferSize: z.number().int().min(50).max(2000).optional().default(500),

    /** Enable AI analysis for this symbol */
    enableAI: z.boolean().optional().default(true),

    /** Time precision for data collection */
    precision: z.enum(['1s', '1m', '15m']).optional().default('1s'),
});

/**
 * Type for StartTrackingRequestDto
 */
export type StartTrackingRequestDto = z.infer<typeof StartTrackingRequestDtoSchema>;

/**
 * Factory function to create validated DTO
 */
export function createStartTrackingRequest(data: unknown): StartTrackingRequestDto {
    return StartTrackingRequestDtoSchema.parse(data);
}

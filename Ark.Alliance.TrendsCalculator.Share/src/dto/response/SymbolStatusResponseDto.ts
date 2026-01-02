/**
 * @fileoverview Symbol Status Response DTO
 * @module dto/response/SymbolStatusResponseDto
 */

import { z } from 'zod';

export const SymbolStatusResponseDtoSchema = z.object({
    symbol: z.string(),
    isTracking: z.boolean(),
    bufferSize: z.number().int(),
    bufferPercent: z.number().min(0).max(100),
    dataPointsCollected: z.number().int(),
    aiEnabled: z.boolean(),
    precision: z.enum(['1s', '1m', '15m']),
    lastUpdateTimestamp: z.string().datetime().optional(),
    lastAnalysisTimestamp: z.string().datetime().optional(),
});

export type SymbolStatusResponseDto = z.infer<typeof SymbolStatusResponseDtoSchema>;

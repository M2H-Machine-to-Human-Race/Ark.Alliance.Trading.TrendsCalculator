/**
 * @fileoverview Health Response DTO
 * @module dto/response/HealthResponseDto
 */

import { z } from 'zod';

export const HealthResponseDtoSchema = z.object({
    status: z.enum(['ok', 'degraded', 'unhealthy']),
    service: z.string(),
    timestamp: z.string().datetime(),
    uptime: z.number(),
    version: z.string().optional(),
    checks: z.record(z.object({
        status: z.enum(['ok', 'error']),
        message: z.string().optional(),
    })).optional(),
});

export type HealthResponseDto = z.infer<typeof HealthResponseDtoSchema>;

/**
 * @fileoverview Stop Tracking Request DTO
 * @module dto/request/StopTrackingRequestDto
 */

import { z } from 'zod';

export const StopTrackingRequestDtoSchema = z.object({
    symbol: z.string().min(1).max(20),
    clearBuffer: z.boolean().optional().default(true),
});

export type StopTrackingRequestDto = z.infer<typeof StopTrackingRequestDtoSchema>;

export function createStopTrackingRequest(data: unknown): StopTrackingRequestDto {
    return StopTrackingRequestDtoSchema.parse(data);
}

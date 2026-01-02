/**
 * @fileoverview Start Training Request DTO
 * @module dto/request/StartTrainingRequestDto
 */

import { z } from 'zod';

export const StartTrainingRequestDtoSchema = z.object({
    symbols: z.array(z.string().min(1).max(20)).min(1).max(50),
    durationMinutes: z.number().int().min(1).max(1440),
    forecastHorizonMs: z.number().int().min(1000).max(300000).optional().default(60000),
    evaluationIntervalMs: z.number().int().positive().optional(),
});

export type StartTrainingRequestDto = z.infer<typeof StartTrainingRequestDtoSchema>;

export function createStartTrainingRequest(data: unknown): StartTrainingRequestDto {
    return StartTrainingRequestDtoSchema.parse(data);
}

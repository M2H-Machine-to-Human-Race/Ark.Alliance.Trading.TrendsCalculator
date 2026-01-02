/**
 * @fileoverview Training Session Status DTO
 * @module dto/response/TrainingSessionStatusDto
 */

import { z } from 'zod';
import { TrainingSessionStatusSchema } from '../../enums/training/TrainingSessionStatus';

export const TrainingSessionStatusDtoSchema = z.object({
    sessionId: z.string(),
    status: TrainingSessionStatusSchema,
    symbols: z.array(z.string()),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    durationMinutes: z.number(),
    elapsedMinutes: z.number(),
    totalPredictions: z.number().int(),
    correctPredictions: z.number().int(),
    currentAccuracy: z.number().min(0).max(1),
});

export type TrainingSessionStatusDto = z.infer<typeof TrainingSessionStatusDtoSchema>;

/**
 * @fileoverview AI Config Response DTO
 * @module dto/response/AIConfigResponseDto
 */

import { z } from 'zod';
import { AIProviderTypeSchema } from '../../enums/ai/AIProviderType';

export const AIConfigResponseDtoSchema = z.object({
    enabled: z.boolean(),
    provider: AIProviderTypeSchema,
    model: z.string(),
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().int(),
    apiKeyConfigured: z.boolean(),
    lastSuccessfulCall: z.string().datetime().optional(),
    errorRate: z.number().min(0).max(1).optional(),
});

export type AIConfigResponseDto = z.infer<typeof AIConfigResponseDtoSchema>;

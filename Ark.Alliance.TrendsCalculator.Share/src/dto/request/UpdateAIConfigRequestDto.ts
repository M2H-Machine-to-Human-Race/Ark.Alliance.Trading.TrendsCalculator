/**
 * @fileoverview Update AI Config Request DTO
 * @module dto/request/UpdateAIConfigRequestDto
 */

import { z } from 'zod';
import { AIProviderTypeSchema } from '../../enums/ai/AIProviderType';

export const UpdateAIConfigRequestDtoSchema = z.object({
    provider: AIProviderTypeSchema.optional(),
    apiKey: z.string().min(10).optional(),
    model: z.string().min(1).optional(),
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().int().positive().optional(),
    enabled: z.boolean().optional(),
});

export type UpdateAIConfigRequestDto = z.infer<typeof UpdateAIConfigRequestDtoSchema>;

export function createUpdateAIConfigRequest(data: unknown): UpdateAIConfigRequestDto {
    return UpdateAIConfigRequestDtoSchema.parse(data);
}

/**
 * @fileoverview Walk Forward Result DTO
 * @module dto/math/WalkForwardResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/WalkForward_Backtesting.md}
 */

import { z } from 'zod';
import { RiskLevelSchema } from '../../enums/common/RiskLevel';

export const PeriodResultSchema = z.object({
    period: z.number().int(),
    insampleReturn: z.number(),
    outsampleReturn: z.number(),
    sharpeRatio: z.number(),
});

export const WalkForwardResultDtoSchema = z.object({
    periodResults: z.array(PeriodResultSchema),
    aggregatedReturn: z.number(),
    robustnessScore: z.number().min(0).max(1),
    overfitRisk: RiskLevelSchema,
    insampleVsOutsampleGap: z.number(),
    periods: z.number().int(),
    insampleRatio: z.number(),
});

export type WalkForwardResultDto = z.infer<typeof WalkForwardResultDtoSchema>;
export type PeriodResult = z.infer<typeof PeriodResultSchema>;

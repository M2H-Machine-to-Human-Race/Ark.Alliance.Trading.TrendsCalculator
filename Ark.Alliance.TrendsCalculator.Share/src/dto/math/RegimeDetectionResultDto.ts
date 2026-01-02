/**
 * @fileoverview Regime Detection Result DTO
 * @module dto/math/RegimeDetectionResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Regime_Detection.md}
 */

import { z } from 'zod';
import { RegimeTypeSchema } from '../../enums/config/RegimeType';
import { RegimeDetectionMethodSchema } from '../../enums/config/RegimeDetectionMethod';

export const RegimeDetectionResultDtoSchema = z.object({
    regime: RegimeTypeSchema,
    probability: z.number().min(0).max(1),
    method: RegimeDetectionMethodSchema,
    indicators: z.object({
        hurst: z.number().optional(),
        rSquared: z.number().optional(),
        volatilityZScore: z.number().optional(),
        momentumScore: z.number().optional(),
        directionChangeRatio: z.number().optional(),
    }),
    strategyAdjustment: z.object({
        positionSizeMultiplier: z.number(),
        stopLossMultiplier: z.number(),
        takeProfitMultiplier: z.number(),
    }).optional(),
});

export type RegimeDetectionResultDto = z.infer<typeof RegimeDetectionResultDtoSchema>;

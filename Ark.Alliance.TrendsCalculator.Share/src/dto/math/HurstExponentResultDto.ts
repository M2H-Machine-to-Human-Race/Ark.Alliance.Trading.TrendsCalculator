/**
 * @fileoverview Hurst Exponent Result DTO
 * @module dto/math/HurstExponentResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Hurst_Exponent.md}
 */

import { z } from 'zod';
import { HurstBehaviorSchema } from '../../enums/config/HurstBehavior';
import { StrategyTypeSchema } from '../../enums/trend/StrategyType';

export const HurstExponentResultDtoSchema = z.object({
    hurstExponent: z.number().min(0).max(1),
    behavior: HurstBehaviorSchema,
    confidence: z.number().min(0).max(1),
    strategyType: StrategyTypeSchema,
    shouldTrade: z.boolean(),
    lagsUsed: z.array(z.number().int()),
});

export type HurstExponentResultDto = z.infer<typeof HurstExponentResultDtoSchema>;

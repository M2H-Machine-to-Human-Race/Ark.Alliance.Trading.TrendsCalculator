/**
 * @fileoverview Comprehensive Metrics Result DTO
 * @module dto/math/ComprehensiveMetricsResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Comprehensive_Metrics.md}
 */

import { z } from 'zod';

export const ComprehensiveMetricsResultDtoSchema = z.object({
    // Return metrics
    totalReturn: z.number(),
    cagr: z.number(),
    winRate: z.number().min(0).max(1),

    // Risk-adjusted metrics
    sharpeRatio: z.number(),
    sortinoRatio: z.number(),
    calmarRatio: z.number(),

    // Risk metrics
    maxDrawdown: z.number(),
    avgDrawdown: z.number(),
    valueAtRisk95: z.number(),
    conditionalVaR95: z.number(),

    // Profitability
    profitFactor: z.number(),
    avgWin: z.number(),
    avgLoss: z.number(),
    expectancy: z.number(),
});

export type ComprehensiveMetricsResultDto = z.infer<typeof ComprehensiveMetricsResultDtoSchema>;

/**
 * @fileoverview Time Series DTO
 * @module dto/response/TimeSeriesDto
 */

import { z } from 'zod';

export const TimeSeriesPointSchema = z.object({
    timestamp: z.string().datetime(),
    price: z.number(),
    volume: z.number().optional(),
});

export const TimeSeriesDtoSchema = z.object({
    symbol: z.string(),
    precision: z.enum(['1s', '1m', '15m']),
    dataPoints: z.array(TimeSeriesPointSchema),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    count: z.number().int(),
});

export type TimeSeriesDto = z.infer<typeof TimeSeriesDtoSchema>;
export type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;

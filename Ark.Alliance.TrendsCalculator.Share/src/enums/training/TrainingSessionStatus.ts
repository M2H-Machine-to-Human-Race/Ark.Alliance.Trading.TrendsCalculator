/**
 * @fileoverview Training Session Status Enum
 * @module enums/training/TrainingSessionStatus
 * 
 * Status of a training session for forecast evaluation.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/TrendsMicroService_Analysis.md} Section 11
 */

import { z } from 'zod';

/**
 * Training session status values
 */
export enum TrainingSessionStatus {
    /** Session is actively running */
    RUNNING = 'RUNNING',
    /** Session is paused */
    PAUSED = 'PAUSED',
    /** Session completed successfully */
    COMPLETED = 'COMPLETED',
    /** Session was cancelled */
    CANCELLED = 'CANCELLED',
}

/**
 * Zod schema for TrainingSessionStatus validation
 */
export const TrainingSessionStatusSchema = z.nativeEnum(TrainingSessionStatus);

/**
 * Type for validated TrainingSessionStatus
 */
export type TrainingSessionStatusType = z.infer<typeof TrainingSessionStatusSchema>;

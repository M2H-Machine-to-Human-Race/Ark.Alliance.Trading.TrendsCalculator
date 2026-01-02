/**
 * @fileoverview Validation Status Enum
 * @module enums/trend/ValidationStatus
 * 
 * Status of forecast validation in training mode.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/TrendsMicroService_Analysis.md} Section 11
 */

import { z } from 'zod';

/**
 * Validation status values
 */
export enum ValidationStatus {
    /** Awaiting validation (forecast horizon not elapsed) */
    PENDING = 'PENDING',
    /** Validation completed */
    VALIDATED = 'VALIDATED',
    /** Validation window expired */
    EXPIRED = 'EXPIRED',
}

/**
 * Zod schema for ValidationStatus validation
 */
export const ValidationStatusSchema = z.nativeEnum(ValidationStatus);

/**
 * Type for validated ValidationStatus
 */
export type ValidationStatusType = z.infer<typeof ValidationStatusSchema>;

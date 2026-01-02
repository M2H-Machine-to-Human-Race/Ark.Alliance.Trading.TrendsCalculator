/**
 * @fileoverview Risk Tolerance Enum
 * @module enums/ai/RiskTolerance
 * 
 * AI strategy risk appetite levels.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 */

import { z } from 'zod';

/**
 * Risk tolerance levels for AI strategy
 * 
 * @remarks
 * - LOW: Conservative trading, smaller positions
 * - MEDIUM: Balanced risk-reward
 * - HIGH: Aggressive trading, larger positions
 */
export enum RiskTolerance {
    /** Conservative risk management */
    LOW = 'LOW',
    /** Balanced risk-reward ratio */
    MEDIUM = 'MEDIUM',
    /** Aggressive risk appetite */
    HIGH = 'HIGH',
}

/**
 * Zod schema for RiskTolerance validation
 */
export const RiskToleranceSchema = z.nativeEnum(RiskTolerance);

/**
 * Type for validated RiskTolerance
 */
export type RiskToleranceType = z.infer<typeof RiskToleranceSchema>;

/**
 * @fileoverview Risk Level Enum
 * @module enums/common/RiskLevel
 * 
 * Standard risk level classification.
 * Common enum used for various risk assessments (overfit risk, etc.)
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * Risk level values
 * 
 * @remarks
 * Standard three-tier risk classification:
 * - LOW: Minimal risk
 * - MEDIUM: Moderate risk
 * - HIGH: Significant risk
 */
export enum RiskLevel {
    /** Minimal risk */
    LOW = 'LOW',
    /** Moderate risk */
    MEDIUM = 'MEDIUM',
    /** Significant risk */
    HIGH = 'HIGH'
}

/**
 * Zod schema for RiskLevel validation
 */
export const RiskLevelSchema = z.nativeEnum(RiskLevel);

/**
 * Type for validated RiskLevel
 */
export type RiskLevelType = z.infer<typeof RiskLevelSchema>;

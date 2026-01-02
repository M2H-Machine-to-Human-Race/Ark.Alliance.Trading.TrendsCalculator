/**
 * @fileoverview Badge Status Enum
 * @module enums/ui/BadgeStatus
 * 
 * Status values for UI badge/indicator components.
 * Used for StatusBadge, GlowCard status, and similar visual indicators.
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * Badge status values for UI components
 * 
 * @remarks
 * Standard status types for visual indicators:
 * - SUCCESS: Positive state (green)
 * - DANGER: Negative/error state (red)
 * - WARNING: Caution state (yellow/orange)
 * - INFO: Informational/neutral state (blue)
 */
export enum BadgeStatus {
    /** Positive/success state */
    SUCCESS = 'success',
    /** Negative/error state */
    DANGER = 'danger',
    /** Warning/caution state */
    WARNING = 'warning',
    /** Informational/neutral state */
    INFO = 'info'
}

/**
 * Zod schema for BadgeStatus validation
 */
export const BadgeStatusSchema = z.nativeEnum(BadgeStatus);

/**
 * Type for validated BadgeStatus
 */
export type BadgeStatusType = z.infer<typeof BadgeStatusSchema>;

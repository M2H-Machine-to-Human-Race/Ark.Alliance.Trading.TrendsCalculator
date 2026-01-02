/**
 * @fileoverview Notification Type Enum
 * @module enums/common/NotificationType
 * 
 * Standard notification/toast type for UI feedback.
 * Common enum used for toast notifications, alerts, and status messages.
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * Notification type values
 * 
 * @remarks
 * Standard notification types for user feedback:
 * - SUCCESS: Positive outcome, operation succeeded
 * - ERROR: Negative outcome, operation failed
 * - WARNING: Caution, potential issue
 * - INFO: Informational message
 */
export enum NotificationType {
    /** Operation succeeded */
    SUCCESS = 'success',
    /** Operation failed */
    ERROR = 'error',
    /** Warning or caution */
    WARNING = 'warning',
    /** Informational message */
    INFO = 'info'
}

/**
 * Zod schema for NotificationType validation
 */
export const NotificationTypeSchema = z.nativeEnum(NotificationType);

/**
 * Type for validated NotificationType
 */
export type NotificationTypeType = z.infer<typeof NotificationTypeSchema>;

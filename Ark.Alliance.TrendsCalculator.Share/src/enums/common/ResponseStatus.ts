/**
 * @fileoverview Response Status Enum
 * @module enums/common/ResponseStatus
 * 
 * Standard API response status indicators.
 * Used for operation result communication between backend and frontend.
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * API response status values
 * 
 * @remarks
 * Standard response status for API operations:
 * - SUCCESS: Operation completed successfully
 * - ERROR: Operation failed with an error
 * - PENDING: Operation is in progress
 */
export enum ResponseStatus {
    /** Operation completed successfully */
    SUCCESS = 'SUCCESS',
    /** Operation failed with an error */
    ERROR = 'ERROR',
    /** Operation is still in progress */
    PENDING = 'PENDING'
}

/**
 * Zod schema for ResponseStatus validation
 */
export const ResponseStatusSchema = z.nativeEnum(ResponseStatus);

/**
 * Type for validated ResponseStatus
 */
export type ResponseStatusType = z.infer<typeof ResponseStatusSchema>;

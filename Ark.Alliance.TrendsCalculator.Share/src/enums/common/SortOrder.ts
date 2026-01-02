/**
 * @fileoverview Sort Order Enum
 * @module enums/common/SortOrder
 * 
 * Standard sort order for lists and queries.
 * Common enum used across frontend and backend.
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * Sort order values
 * 
 * @remarks
 * Standard ascending/descending sort direction for database queries,
 * API responses, and UI table sorting.
 */
export enum SortOrder {
    /** Ascending order (A-Z, 0-9, oldest first) */
    ASC = 'ASC',
    /** Descending order (Z-A, 9-0, newest first) */
    DESC = 'DESC'
}

/**
 * Zod schema for SortOrder validation
 */
export const SortOrderSchema = z.nativeEnum(SortOrder);

/**
 * Type for validated SortOrder
 */
export type SortOrderType = z.infer<typeof SortOrderSchema>;

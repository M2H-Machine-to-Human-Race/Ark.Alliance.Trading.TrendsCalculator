/**
 * @fileoverview Common Helpers Barrel Export
 * @module helpers
 * @description
 * Centralized export for all utility helper functions.
 * Provides convenient single import point for common utilities.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 * 
 * @example
 * ```typescript
 * import { formatTimestamp, capitalize, clamp } from '@/helpers';
 * 
 * const time = formatTimestamp(Date.now());
 * const name = capitalize('bitcoin');
 * const value = clamp(150, 0, 100); // 100
 * ```
 */

// Date/Time utilities
export * from './dateUtils';

// String utilities
export * from './stringUtils';

// Number utilities (with explicit renames to avoid conflicts with stringUtils)
export {
    clamp,
    roundTo,
    formatPrice,
    percentageChange,
    randomInRange,
    formatCurrency,
    // Rename duplicates to avoid conflict with stringUtils
    formatNumber as formatNumberLocale,
    formatPercentage as formatPercentageDecimal
} from './numberUtils';


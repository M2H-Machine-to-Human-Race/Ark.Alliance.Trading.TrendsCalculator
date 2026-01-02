/**
 * @fileoverview Number Formatting Utilities
 * @module helpers/numberUtils
 * @description
 * Common number manipulation and formatting functions.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

/**
 * Clamp a number between min and max values
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Round to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export function roundTo(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

/**
 * Format price with proper decimal places
 * @param {number} price - Price value
 * @param {number} [decimals=2] - Decimal places
 * @returns {string} Formatted price string
 */
export function formatPrice(price: number, decimals: number = 2): string {
    return price.toFixed(decimals);
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Generate random number in range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number
 */
export function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Format number with thousand separators
 * @param {number} value - Number to format
 * @param {number} [decimals=0] - Decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value: number, decimals: number = 0): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format number as percentage
 * @param {number} value - Decimal value (0.75 = 75%)
 * @param {number} [decimals=2] - Decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format number as currency
 * @param {number} value - Value to format
 * @param {string} [symbol='$'] - Currency symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value: number, symbol: string = '$'): string {
    return symbol + value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


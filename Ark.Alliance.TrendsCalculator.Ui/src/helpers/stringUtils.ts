/**
 * @fileoverview String Formatting Utilities
 * @module helpers/stringUtils
 * @description
 * Common string manipulation and formatting functions.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

/**
 * Capitalize first letter of a string (first word only)
 * @param {string} str - Input string
 * @returns {string} Capitalized string (all words)
 */
export function capitalize(str: string): string {
    if (!str) return '';
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Uppercase only first letter of string
 * @param {string} str - Input string
 * @returns {string} String with first letter uppercased
 */
export function toUpperCaseFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string with ellipsis
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

/**
 * Format symbol name (e.g., "BTCUSDT" → "BTC/USDT")
 * @param {string} symbol - Raw symbol string
 * @returns {string} Formatted symbol
 */
export function formatSymbol(symbol: string): string {
    // Common patterns: BTCUSDT, ETHUSDT, etc.
    if (symbol.endsWith('USDT')) {
        const base = symbol.slice(0, -4);
        return `${base}/USDT`;
    }
    if (symbol.endsWith('USD')) {
        const base = symbol.slice(0, -3);
        return `${base}/USD`;
    }
    return symbol;
}

/**
 * Format large numbers with K/M/B suffixes
 * @param {number} num - Number to format
 * @param {number} [decimals=1] - Decimal places to show
 * @returns {string} Formatted number string
 * 
 * @example
 * formatNumber(1500);      // "1.5K"
 * formatNumber(2500000);   // "2.5M"
 * formatNumber(1200000000); // "1.2B"
 */
export function formatNumber(num: number, decimals: number = 1): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(decimals) + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(decimals) + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(decimals) + 'K';
    }
    return num.toString();
}

/**
 * Format percentage value
 * @param {number} value - Value (0-1 or 0-100)
 * @param {boolean} [isDecimal=true] - Whether input is decimal (0-1) or percentage (0-100)
 * @param {number} [decimals=1] - Decimal places to show
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value: number, isDecimal: boolean = true, decimals: number = 1): string {
    const percentage = isDecimal ? value * 100 : value;
    return `${percentage.toFixed(decimals)}%`;
}

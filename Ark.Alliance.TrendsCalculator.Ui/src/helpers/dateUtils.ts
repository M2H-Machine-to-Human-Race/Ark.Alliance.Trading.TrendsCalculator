/**
 * @fileoverview Date/Time Utility Functions
 * @module helpers/dateUtils
 * @description
 * Common date and time formatting utilities used across the application.
 * Centralized to avoid code duplication and ensure consistency.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 * 
 * @example
 * ```typescript
 * import { formatTimestamp, formatRelativeTime } from '@/helpers/dateUtils';
 * 
 * const time = formatTimestamp(Date.now());
 * // "0s ago"
 * 
 * const relTime = formatRelativeTime(Date.now() - 3600000);
 * // "1h ago"
 * ```
 */

/**
 * Format timestamp as relative time (e.g., "2m ago", "1h ago")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Human-readable relative time string
 * 
 * @example
 * ```typescript
 * formatTimestamp(Date.now() - 30000);  // "30s ago"
 * formatTimestamp(Date.now() - 120000); // "2m ago"
 * formatTimestamp(Date.now() - 7200000); // "2h ago"
 * ```
 */
export function formatTimestamp(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) {
        return `${seconds}s ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

/**
 * Format timestamp to time string (HH:MM:SS)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format timestamp to date string (YYYY-MM-DD)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format timestamp as full date/time string (YYYY-MM-DD HH:MM:SS)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date/time string
 */
export function formatFullDateTime(timestamp: number): string {
    return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

/**
 * Format timestamp as relative time (alias for backwards compatibility)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Human-readable relative time string
 */
export function formatRelativeTime(timestamp: number): string {
    return formatTimestamp(timestamp);
}

/**
 * Format Date object as relative time
 * @param {Date} date - JavaScript Date object
 * @returns {string} Human-readable relative time string
 * 
 * @example
 * ```typescript
 * formatDateRelative(new Date('2025-12-27T03:00:00'));
 * // "1h ago"
 * ```
 */
export function formatDateRelative(date: Date): string {
    return formatTimestamp(date.getTime());
}

/**
 * Format timestamp as absolute date/time string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @param {boolean} [includeTime=true] - Whether to include time component
 * @returns {string} Formatted date string
 * 
 * @example
 * ```typescript
 * formatAbsoluteDate(1703638800000);
 * // "2025-12-27 03:00"
 * 
 * formatAbsoluteDate(1703638800000, false);
 * // "2025-12-27"
 * ```
 */
export function formatAbsoluteDate(timestamp: number, includeTime: boolean = true): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (!includeTime) {
        return `${year}-${month}-${day}`;
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Get current Unix timestamp in milliseconds
 * @returns {number} Current timestamp
 */
export function now(): number {
    return Date.now();
}

/**
 * Calculate duration between two timestamps
 * @param {number} start - Start timestamp in milliseconds
 * @param {number} end - End timestamp in milliseconds
 * @returns {string} Human-readable duration string
 * 
 * @example
 * ```typescript
 * const start = Date.now() - 5400000; // 1.5 hours ago
 * const end = Date.now();
 * formatDuration(start, end);
 * // "1h 30m"
 * ```
 */
export function formatDuration(start: number, end: number): string {
    const diffMs = Math.abs(end - start);
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }

    if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }

    return `${seconds}s`;
}

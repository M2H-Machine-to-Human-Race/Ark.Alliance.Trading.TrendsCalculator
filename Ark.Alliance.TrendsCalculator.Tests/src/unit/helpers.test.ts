/**
 * @fileoverview Helper Functions Unit Tests
 * @module tests/unit/helpers
 * @description
 * Unit tests for frontend helper functions (dateUtils, stringUtils, numberUtils)
 */

import { describe, test, expect } from 'vitest';
import { formatFullDateTime, formatTime, formatDate, formatTimestamp } from '../../../Ark.Alliance.TrendsCalculator.Ui/src/helpers/dateUtils';
import { truncate, capitalize, toUpperCaseFirst } from '../../../Ark.Alliance.TrendsCalculator.Ui/src/helpers/stringUtils';
import { formatNumber, formatPercentage, formatCurrency } from '../../../Ark.Alliance.TrendsCalculator.Ui/src/helpers/numberUtils';

// ═══════════════════════════════════════════════════════════════════════════
// DATE UTILITIES TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('dateUtils', () => {
    describe('formatFullDateTime', () => {
        test('should format Unix timestamp to readable date/time', () => {
            const timestamp = 1703692800000; // 2023-12-27 12:00:00 UTC
            const result = formatFullDateTime(timestamp);
            expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
        });

        test('should handle current timestamp', () => {
            const result = formatFullDateTime(Date.now());
            expect(result).toBeTruthy();
            expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
        });
    });

    describe('formatTime', () => {
        test('should format timestamp to HH:MM:SS', () => {
            const timestamp = 1703692800000;
            const result = formatTime(timestamp);
            expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
        });
    });

    describe('formatDate', () => {
        test('should format timestamp to YYYY-MM-DD', () => {
            const timestamp = 1703692800000;
            const result = formatDate(timestamp);
            expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// STRING UTILITIES TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('stringUtils', () => {
    describe('truncate', () => {
        test('should truncate long strings', () => {
            const longText = 'This is a very long string that needs to be truncated';
            const result = truncate(longText, 20);
            expect(result).toBe('This is a very lo...');
            expect(result.length).toBe(20);
        });

        test('should not truncate short strings', () => {
            const shortText = 'Short text';
            const result = truncate(shortText, 20);
            expect(result).toBe(shortText);
        });

        test('should handle empty strings', () => {
            const result = truncate('', 10);
            expect(result).toBe('');
        });
    });

    describe('capitalize', () => {
        test('should capitalize first letter of each word', () => {
            expect(capitalize('hello world')).toBe('Hello World');
            expect(capitalize('BITCOIN usdt')).toBe('Bitcoin Usdt');
        });

        test('should handle single words', () => {
            expect(capitalize('bitcoin')).toBe('Bitcoin');
        });

        test('should handle empty strings', () => {
            expect(capitalize('')).toBe('');
        });
    });

    describe('toUpperCaseFirst', () => {
        test('should uppercase only first letter', () => {
            expect(toUpperCaseFirst('hello')).toBe('Hello');
            expect(toUpperCaseFirst('world')).toBe('World');
        });

        test('should handle already capitalized', () => {
            expect(toUpperCaseFirst('Hello')).toBe('Hello');
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// NUMBER UTILITIES TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('numberUtils', () => {
    describe('formatNumber', () => {
        test('should format numbers with thousand separators', () => {
            expect(formatNumber(1000)).toBe('1,000');
            expect(formatNumber(1000000)).toBe('1,000,000');
        });

        test('should handle decimals', () => {
            expect(formatNumber(1234.56, 2)).toBe('1,234.56');
            expect(formatNumber(9999.999, 2)).toBe('10,000.00');
        });

        test('should handle zero', () => {
            expect(formatNumber(0)).toBe('0');
        });
    });

    describe('formatPercentage', () => {
        test('should format percentages correctly', () => {
            expect(formatPercentage(0.75)).toBe('75.00%');
            expect(formatPercentage(1.5)).toBe('150.00%');
            expect(formatPercentage(0.123456, 4)).toBe('12.3456%');
        });

        test('should handle negative percentages', () => {
            expect(formatPercentage(-0.25)).toBe('-25.00%');
        });

        test('should handle zero', () => {
            expect(formatPercentage(0)).toBe('0.00%');
        });
    });

    describe('formatCurrency', () => {
        test('should format currency with symbol', () => {
            expect(formatCurrency(1234.56)).toBe('$1,234.56');
            expect(formatCurrency(1000000)).toBe('$1,000,000.00');
        });

        test('should handle custom symbols', () => {
            expect(formatCurrency(100, '€')).toBe('€100.00');
            expect(formatCurrency(50, '£')).toBe('£50.00');
        });

        test('should handle zero', () => {
            expect(formatCurrency(0)).toBe('$0.00');
        });

        test('should handle negative values', () => {
            expect(formatCurrency(-100)).toBe('$-100.00');
        });
    });
});

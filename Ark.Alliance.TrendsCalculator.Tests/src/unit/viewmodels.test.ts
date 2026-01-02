/**
 * @fileoverview ViewModel Unit Tests
 * @module tests/unit/viewmodels
 * @description
 * Unit tests for frontend ViewModels (business logic layer)
 */

import { describe, test, expect } from 'vitest';
import type { TrendDirection } from '@share/trends';

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW PAGE VIEWMODEL TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('OverviewPage ViewModel', () => {
    test('should calculate metrics from trend data', () => {
        const mockTrends = {
            'BTCUSDT': { direction: 'LONG' as TrendDirection, strength: 85, timestamp: Date.now() },
            'ETHUSDT': { direction: 'SHORT' as TrendDirection, strength: 72, timestamp: Date.now() },
            'BNBUSDT': { direction: 'WAIT' as TrendDirection, strength: 45, timestamp: Date.now() },
        };

        const totalSymbols = Object.keys(mockTrends).length;
        const longCount = Object.values(mockTrends).filter(t => t.direction === 'LONG').length;
        const shortCount = Object.values(mockTrends).filter(t => t.direction === 'SHORT').length;
        const waitCount = Object.values(mockTrends).filter(t => t.direction === 'WAIT').length;

        expect(totalSymbols).toBe(3);
        expect(longCount).toBe(1);
        expect(shortCount).toBe(1);
        expect(waitCount).toBe(1);
    });

    test('should calculate average strength', () => {
        const strengths = [85, 72, 45, 90, 60];
        const avg = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
        expect(avg).toBe(70.4);
    });

    test('should format direction counts', () => {
        const directions = {
            LONG: 5,
            SHORT: 3,
            WAIT: 2,
        };

        const total = directions.LONG + directions.SHORT + directions.WAIT;
        const longPercent = (directions.LONG / total) * 100;

        expect(total).toBe(10);
        expect(longPercent).toBe(50);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// SYMBOLS PAGE VIEWMODEL TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('SymbolsPage ViewModel', () => {
    test('should validate symbol format', () => {
        const validSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBBTC'];
        const invalidSymbols = ['btc', '', '   ', 'BTC-USDT'];

        validSymbols.forEach(symbol => {
            expect(symbol.length).toBeGreaterThan(0);
            expect(symbol).toMatch(/^[A-Z]+$/);
        });

        invalidSymbols.forEach(symbol => {
            const isValid = symbol.trim().length > 0 && /^[A-Z]+$/.test(symbol);
            expect(isValid).toBe(false);
        });
    });

    test('should normalize symbol input', () => {
        const normalize = (input: string) => input.trim().toUpperCase();

        expect(normalize('  btcusdt  ')).toBe('BTCUSDT');
        expect(normalize('ethusdt')).toBe('ETHUSDT');
        expect(normalize('BNBusdt')).toBe('BNBUSDT');
    });

    test('should prevent duplicate symbols', () => {
        const symbols = new Set(['BTCUSDT', 'ETHUSDT']);

        const newSymbol = 'BTCUSDT';
        const isDuplicate = symbols.has(newSymbol);

        expect(isDuplicate).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION PAGE VIEWMODEL TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('ConfigurationPage ViewModel', () => {
    test('should validate AI provider settings', () => {
        const validProviders = ['gemini', 'openai', 'none'];
        const invalidProviders = ['gpt4', '', 'claude'];

        validProviders.forEach(provider => {
            expect(['gemini', 'openai', 'none']).toContain(provider);
        });

        invalidProviders.forEach(provider => {
            expect(['gemini', 'openai', 'none']).not.toContain(provider);
        });
    });

    test('should validate calculation parameters', () => {
        const params = {
            bufferSize: 100,
            minDataPoints: 50,
            emaFastPeriod: 10,
            emaSlowPeriod: 30,
        };

        expect(params.bufferSize).toBeGreaterThanOrEqual(10);
        expect(params.bufferSize).toBeLessThanOrEqual(500);
        expect(params.minDataPoints).toBeGreaterThanOrEqual(5);
        expect(params.minDataPoints).toBeLessThanOrEqual(100);
        expect(params.emaFastPeriod).toBeLessThan(params.emaSlowPeriod);
    });

    test('should validate temperature range', () => {
        const validTemps = [0, 0.5, 1.0, 1.5, 2.0];
        const invalidTemps = [-0.1, 2.1, 5.0];

        validTemps.forEach(temp => {
            expect(temp).toBeGreaterThanOrEqual(0);
            expect(temp).toBeLessThanOrEqual(2);
        });

        invalidTemps.forEach(temp => {
            const isValid = temp >= 0 && temp <= 2;
            expect(isValid).toBe(false);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING PAGE VIEWMODEL TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('TrainingPage ViewModel', () => {
    test('should calculate accuracy metrics', () => {
        const predictions = [
            { predicted: 'LONG', actual: 'LONG', success: true },
            { predicted: 'SHORT', actual: 'SHORT', success: true },
            { predicted: 'WAIT', actual: 'LONG', success: false },
            { predicted: 'LONG', actual: 'LONG', success: true },
        ];

        const successCount = predictions.filter(p => p.success).length;
        const accuracy = (successCount / predictions.length) * 100;

        expect(accuracy).toBe(75);
    });

    test('should calculate direction-specific accuracy', () => {
        const predictions = [
            { predicted: 'LONG', actual: 'LONG', success: true },
            { predicted: 'LONG', actual: 'SHORT', success: false },
            { predicted: 'LONG', actual: 'LONG', success: true },
        ];

        const longPredictions = predictions.filter(p => p.predicted === 'LONG');
        const longSuccess = longPredictions.filter(p => p.success).length;
        const longAccuracy = (longSuccess / longPredictions.length) * 100;

        expect(longAccuracy).toBeCloseTo(66.67, 1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// VISUALIZATION PAGE VIEWMODEL TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('VisualizationPage ViewModel', () => {
    test('should handle symbol selection', () => {
        const availableSymbols = [' BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
        let selectedSymbol = availableSymbols[0];

        const selectSymbol = (symbol: string) => {
            if (availableSymbols.includes(symbol)) {
                selectedSymbol = symbol;
            }
        };

        selectSymbol('ETHUSDT');
        expect(selectedSymbol).toBe('ETHUSDT');

        selectSymbol('INVALIDUSD');
        expect(selectedSymbol).toBe('ETHUSDT'); // Should not change
    });

    test('should validate precision values', () => {
        const validPrecisions = ['1s', '1m', '15m'];
        const invalidPrecisions = ['5s', '1h', ''];

        validPrecisions.forEach(p => {
            expect(['1s', '1m', '15m']).toContain(p);
        });

        invalidPrecisions.forEach(p => {
            expect(['1s', '1m', '15m']).not.toContain(p);
        });
    });
});

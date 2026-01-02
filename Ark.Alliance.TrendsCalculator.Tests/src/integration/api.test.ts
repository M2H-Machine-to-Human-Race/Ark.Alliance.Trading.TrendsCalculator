/**
 * @fileoverview API Integration Tests
 * @module tests/integration/api
 * @description
 * Integration tests for frontend API services with live backend
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
    createAPIClient,
    cleanupTestResources,
    generateMockSymbols,
} from './utils';
import {
    shouldSkipBackendTests,
    startBackend,
    stopBackend,
    isBackendReachable,
    validateCertificates,
    checkProtocolAlignment
} from '../helpers/backend';

// Conditional describe: skip entire suite on GitHub Actions
const describeFn = shouldSkipBackendTests() ? describe.skip : describe;

describeFn('API Integration Tests', () => {
    let apiClient: ReturnType<typeof createAPIClient>;
    const testSymbols: string[] = [];
    let backendStartedByTest = false;

    beforeAll(async () => {
        // Validate certificates
        const certCheck = validateCertificates();
        if (!certCheck.valid) {
            console.warn(`⚠️  Certificate issue: ${certCheck.error}`);
        }

        // Check protocol alignment
        const alignment = checkProtocolAlignment();
        if (!alignment.aligned) {
            console.warn('⚠️  Protocol alignment issues:', alignment.issues);
        }

        // Check if backend is already running
        const reachable = await isBackendReachable();
        if (!reachable) {
            // Start backend for tests
            await startBackend();
            backendStartedByTest = true;
        }

        apiClient = createAPIClient();
    }, 30000); // 30s timeout for backend startup

    afterAll(async () => {
        await cleanupTestResources(undefined, testSymbols);

        // Only stop backend if we started it
        if (backendStartedByTest) {
            await stopBackend();
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // HEALTH ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    test('GET /api/health should return healthy status', async () => {
        const response = await apiClient.get('/health');

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('status');
        expect(response.data.data.status).toBe('healthy');
        expect(response.data.data).toHaveProperty('uptime');
        expect(response.data.data).toHaveProperty('timestamp');
    });

    test('GET /api/health/detailed should return detailed health info', async () => {
        const response = await apiClient.get('/health/detailed');

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('services');
        expect(response.data.data).toHaveProperty('memory');
        expect(response.data.data.services).toHaveProperty('database');
        expect(response.data.data.services).toHaveProperty('websocket');
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SYMBOL ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    test('POST /api/symbol/track should add new symbol', async () => {
        const testSymbol = 'BTCUSDT';
        testSymbols.push(testSymbol);

        const response = await apiClient.post('/symbol/track', {
            symbol: testSymbol,
            bufferSize: 100,
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('symbol');
        expect(response.data.data.symbol).toBe(testSymbol);
        expect(response.data.data).toHaveProperty('isTracking');
    });

    test('GET /api/symbol should list tracked symbols', async () => {
        const response = await apiClient.get('/symbol');

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('symbols');
        expect(Array.isArray(response.data.data.symbols)).toBe(true);
        expect(response.data.data).toHaveProperty('count');
    });

    test('GET /api/symbol/:symbol/status should return symbol status', async () => {
        const testSymbol = testSymbols[0] || 'BTCUSDT';
        const response = await apiClient.get(`/symbol/${testSymbol}/status`);

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('symbol');
        expect(response.data.data).toHaveProperty('isTracking');
        expect(response.data.data).toHaveProperty('buffer');
    });

    test('DELETE /api/symbol/:symbol/track should stop tracking', async () => {
        const testSymbol = testSymbols[0] || 'BTCUSDT';
        const response = await apiClient.delete(`/symbol/${testSymbol}/track`);

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // TREND ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    test('GET /api/trend/:symbol/analyze should analyze trend', async () => {
        // First add a symbol
        const testSymbol = 'ETHUSDT';
        testSymbols.push(testSymbol);
        await apiClient.post('/symbol/track', { symbol: testSymbol });

        // Wait a bit for buffer to fill (or it might return insufficient data)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await apiClient.get(`/trend/${testSymbol}/analyze`);

        // May return 400 if insufficient data, which is OK
        if (response.status === 200) {
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('symbol');
            expect(response.data.data).toHaveProperty('direction');
            expect(['LONG', 'SHORT', 'WAIT']).toContain(response.data.data.direction);
        } else {
            expect(response.status).toBe(400);
            expect(response.data.error.code).toBe('INSUFFICIENT_DATA');
        }
    });

    test('GET /api/trend/:symbol/history should return history', async () => {
        const testSymbol = 'BTCUSDT';
        const response = await apiClient.get(`/trend/${testSymbol}/history`);

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.data).toHaveProperty('symbol');
        expect(response.data.data).toHaveProperty('history');
        expect(Array.isArray(response.data.data.history)).toBe(true);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ═══════════════════════════════════════════════════════════════════════

    test('should handle invalid symbol gracefully', async () => {
        try {
            await apiClient.post('/symbol/track', { symbol: '' });
            // Should not reach here
            expect(true).toBe(false);
        } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.success).toBe(false);
            expect(error.response.data.error).toHaveProperty('code');
        }
    });

    test('should handle non-existent endpoints', async () => {
        try {
            await apiClient.get('/nonexistent');
            expect(true).toBe(false);
        } catch (error: any) {
            expect(error.response.status).toBe(404);
        }
    });
});

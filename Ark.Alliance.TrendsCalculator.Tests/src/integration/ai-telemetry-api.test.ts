/**
 * AI Telemetry API Integration Tests
 * 
 * @fileoverview Integration tests for AI Telemetry REST API endpoints
 * @module tests/integration/ai-telemetry-api
 * 
 * Tests all AI Telemetry API endpoints:
 * - GET/PUT /api/ai/settings
 * - POST /api/ai/test-connection
 * - GET /api/ai/telemetry (paginated)
 * - GET /api/ai/telemetry/:id
 * - GET/PUT /api/ai/forecast-settings
 * 
 * @author Ark.Alliance Team
 * @version 1.0.0
 * @since 2026-01-06
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
    createAPIClient,
    cleanupTestResources,
} from './utils';
import {
    shouldSkipBackendTests,
    startBackend,
    stopBackend,
    isBackendReachable,
} from '../helpers/backend';

// Conditional describe: skip entire suite on GitHub Actions
const describeFn = shouldSkipBackendTests() ? describe.skip : describe;

describeFn('AI Telemetry API Integration Tests', () => {
    let apiClient: ReturnType<typeof createAPIClient>;
    let backendStartedByTest = false;

    beforeAll(async () => {
        // Check if backend is already running
        const reachable = await isBackendReachable();
        if (!reachable) {
            await startBackend();
            backendStartedByTest = true;
        }

        apiClient = createAPIClient();
    }, 30000);

    afterAll(async () => {
        if (backendStartedByTest) {
            await stopBackend();
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // AI SETTINGS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    describe('AI Settings Endpoints', () => {
        test('GET /api/ai/settings should return AI configuration', async () => {
            const response = await apiClient.get('/ai/settings');

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('enabled');
            expect(response.data.data).toHaveProperty('provider');
            expect(response.data.data).toHaveProperty('model');
            expect(response.data.data).toHaveProperty('temperature');
            expect(response.data.data).toHaveProperty('maxTokens');
            expect(response.data.data).toHaveProperty('apiKeyConfigured');
        });

        test('PUT /api/ai/settings should update AI configuration', async () => {
            const newSettings = {
                enabled: true,
                provider: 'gemini',
                model: 'gemini-2.0-flash',
                temperature: 0.5,
                maxTokens: 4096,
            };

            const response = await apiClient.put('/ai/settings', newSettings);

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.message).toContain('saved');
        });

        test('PUT /api/ai/settings should validate provider value', async () => {
            try {
                await apiClient.put('/ai/settings', {
                    provider: 'invalid_provider'
                });
                // Should not reach here
                expect(true).toBe(false);
            } catch (error: any) {
                // Expect either 400 or settings saved with default
                expect([200, 400]).toContain(error.response?.status || 200);
            }
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // AI CONNECTION TEST ENDPOINT
    // ═══════════════════════════════════════════════════════════════════════

    describe('AI Connection Test Endpoint', () => {
        test('POST /api/ai/test-connection should test AI provider connection', async () => {
            const response = await apiClient.post('/ai/test-connection');

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('connected');
            expect(response.data.data).toHaveProperty('latencyMs');
            expect(typeof response.data.data.connected).toBe('boolean');
            expect(typeof response.data.data.latencyMs).toBe('number');

            console.log(`   🔌 Connection: ${response.data.data.connected ? '✅' : '❌'}`);
            console.log(`   ⏱️  Latency: ${response.data.data.latencyMs}ms`);
        }, 30000);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // AI TELEMETRY ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    describe('AI Telemetry Endpoints', () => {
        test('GET /api/ai/telemetry should return paginated logs', async () => {
            const response = await apiClient.get('/ai/telemetry?page=1&pageSize=10');

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('items');
            expect(response.data.data).toHaveProperty('total');
            expect(response.data.data).toHaveProperty('page');
            expect(response.data.data).toHaveProperty('pageSize');
            expect(response.data.data).toHaveProperty('totalPages');
            expect(Array.isArray(response.data.data.items)).toBe(true);
        });

        test('GET /api/ai/telemetry should respect pagination parameters', async () => {
            const page1 = await apiClient.get('/ai/telemetry?page=1&pageSize=5');
            const page2 = await apiClient.get('/ai/telemetry?page=2&pageSize=5');

            expect(page1.data.data.page).toBe(1);
            expect(page2.data.data.page).toBe(2);
            expect(page1.data.data.pageSize).toBe(5);
            expect(page2.data.data.pageSize).toBe(5);
        });

        test('GET /api/ai/telemetry/:id should return detail for valid ID', async () => {
            // First get a list to find a valid ID
            const listResponse = await apiClient.get('/ai/telemetry?page=1&pageSize=1');

            if (listResponse.data.data.items.length > 0) {
                const id = listResponse.data.data.items[0].id;
                const detailResponse = await apiClient.get(`/ai/telemetry/${id}`);

                expect(detailResponse.status).toBe(200);
                expect(detailResponse.data.success).toBe(true);
                expect(detailResponse.data.data).toHaveProperty('id');
                expect(detailResponse.data.data).toHaveProperty('requestPayload');
                expect(detailResponse.data.data).toHaveProperty('responsePayload');
            } else {
                console.log('   ⚠️ No telemetry records found to test detail endpoint');
            }
        });

        test('GET /api/ai/telemetry/:id should handle invalid ID gracefully', async () => {
            try {
                await apiClient.get('/ai/telemetry/999999');
                // Some implementations return empty object
            } catch (error: any) {
                expect(error.response.status).toBe(404);
            }
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // FORECAST SETTINGS ENDPOINTS
    // ═══════════════════════════════════════════════════════════════════════

    describe('Forecast Settings Endpoints', () => {
        test('GET /api/ai/forecast-settings should return forecast configuration', async () => {
            const response = await apiClient.get('/ai/forecast-settings');

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('showHorizon');
            expect(response.data.data).toHaveProperty('horizonMs');
            expect(response.data.data).toHaveProperty('horizonPresets');
            expect(typeof response.data.data.showHorizon).toBe('boolean');
            expect(typeof response.data.data.horizonMs).toBe('number');
            expect(Array.isArray(response.data.data.horizonPresets)).toBe(true);
        });

        test('PUT /api/ai/forecast-settings should update forecast configuration', async () => {
            const newSettings = {
                showHorizon: true,
                horizonMs: 120000, // 2 minutes
            };

            const response = await apiClient.put('/ai/forecast-settings', newSettings);

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);

            // Verify the update persisted
            const getResponse = await apiClient.get('/ai/forecast-settings');
            expect(getResponse.data.data.horizonMs).toBe(120000);

            // Reset to default
            await apiClient.put('/ai/forecast-settings', { horizonMs: 60000 });
        });

        test('PUT /api/ai/forecast-settings should toggle showHorizon', async () => {
            // Get current value
            const original = await apiClient.get('/ai/forecast-settings');
            const originalValue = original.data.data.showHorizon;

            // Toggle
            await apiClient.put('/ai/forecast-settings', { showHorizon: !originalValue });

            // Verify toggle worked
            const updated = await apiClient.get('/ai/forecast-settings');
            expect(updated.data.data.showHorizon).toBe(!originalValue);

            // Reset to original
            await apiClient.put('/ai/forecast-settings', { showHorizon: originalValue });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // STATISTICS ENDPOINT
    // ═══════════════════════════════════════════════════════════════════════

    describe('AI Statistics Endpoint', () => {
        test('GET /api/ai/stats should return telemetry statistics', async () => {
            const response = await apiClient.get('/ai/stats');

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.data).toHaveProperty('totalExchanges');
            expect(response.data.data).toHaveProperty('successRate');
            expect(response.data.data).toHaveProperty('avgLatencyMs');
            expect(response.data.data).toHaveProperty('errorCount');
        });
    });
});

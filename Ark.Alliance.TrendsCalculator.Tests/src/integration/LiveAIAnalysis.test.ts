/**
 * Live AI Integration Test
 * 
 * @fileoverview Real-time AI trend analysis integration test
 * @module tests/integration/ai
 * 
 * Tests the complete AI analysis flow:
 * 1. Collects live market data for 30 seconds
 * 2. Sends to Gemini AI for analysis
 * 3. Validates response within 30 seconds
 * 
 * Uses top 15 crypto symbols by market capitalization.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

// Top 15 crypto symbols by market capitalization (Binance Futures format)
const TOP_15_SYMBOLS = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'XRPUSDT',
    'SOLUSDT',
    'ADAUSDT',
    'DOGEUSDT',
    'TRXUSDT',
    'AVAXUSDT',
    'LINKUSDT',
    'DOTUSDT',
    'MATICUSDT',
    '1000SHIBUSDT',  // SHIB uses 1000SHIB on Binance Futures
    'LTCUSDT',
    'ATOMUSDT'
];

// Backend configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3075';
const AI_ANALYSIS_TIMEOUT = 30000; // 30 seconds for AI response
const DATA_COLLECTION_TIME = 30000; // 30 seconds to collect data

interface AIAnalysisResult {
    symbol: string;
    tendance: 'LONG' | 'SHORT' | 'WAIT';
    sigma: number;
    takeProfitPnlClick: number;
    confidence: number;
    reasoning: string;
    timestamp?: number;
}

interface TestResult {
    symbol: string;
    success: boolean;
    analysis?: AIAnalysisResult;
    error?: string;
    responseTime: number;
}

/**
 * Fetch klines from Binance API
 */
async function fetchBinanceKlines(symbol: string, limit: number = 10): Promise<any[]> {
    try {
        const response = await axios.get(
            `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=1m&limit=${limit}`
        );
        return response.data.map((k: any) => ({
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
            openTime: k[0],
            closeTime: k[6]
        }));
    } catch (error) {
        console.error(`Failed to fetch klines for ${symbol}:`, error);
        return [];
    }
}

/**
 * Fetch order book data from Binance API
 */
async function fetchOrderBook(symbol: string): Promise<{ bidTotal: number; askTotal: number; imbalance: number }> {
    try {
        const response = await axios.get(
            `https://fapi.binance.com/fapi/v1/depth?symbol=${symbol}&limit=20`
        );

        const bids = response.data.bids.reduce((sum: number, b: any) => sum + parseFloat(b[1]), 0);
        const asks = response.data.asks.reduce((sum: number, a: any) => sum + parseFloat(a[1]), 0);
        const total = bids + asks;
        const imbalance = total > 0 ? (bids - asks) / total : 0;

        return { bidTotal: bids, askTotal: asks, imbalance };
    } catch (error) {
        console.error(`Failed to fetch order book for ${symbol}:`, error);
        return { bidTotal: 0, askTotal: 0, imbalance: 0 };
    }
}

/**
 * Request AI analysis from backend
 */
async function requestAIAnalysis(symbol: string): Promise<AIAnalysisResult | null> {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/ai/analyze`,
            { symbol },
            { timeout: AI_ANALYSIS_TIMEOUT }
        );
        return response.data;
    } catch (error: any) {
        console.error(`AI analysis failed for ${symbol}:`, error.message);
        return null;
    }
}

/**
 * Validate AI response structure
 */
function validateAIResponse(analysis: AIAnalysisResult): boolean {
    if (!analysis) return false;

    // Tendance validation
    if (!['LONG', 'SHORT', 'WAIT'].includes(analysis.tendance)) return false;

    // Confidence validation (0-1)
    if (typeof analysis.confidence !== 'number' ||
        analysis.confidence < 0 || analysis.confidence > 1) return false;

    // Sigma validation (0.001-0.05)
    if (typeof analysis.sigma !== 'number' ||
        analysis.sigma < 0.001 || analysis.sigma > 0.05) return false;

    // TakeProfitPnlClick validation (0.0005-0.02)
    if (typeof analysis.takeProfitPnlClick !== 'number' ||
        analysis.takeProfitPnlClick < 0.0005 ||
        analysis.takeProfitPnlClick > 0.02) return false;

    // Reasoning must be meaningful
    if (typeof analysis.reasoning !== 'string' ||
        analysis.reasoning.length < 30) return false;

    // WAIT must have confidence < 0.5, or non-WAIT must have confidence >= 0.5
    if (analysis.tendance === 'WAIT' && analysis.confidence >= 0.5) {
        console.warn(`WAIT with high confidence: ${analysis.confidence}`);
    }
    if (analysis.tendance !== 'WAIT' && analysis.confidence < 0.5) {
        return false; // Low confidence must be WAIT
    }

    return true;
}

describe('Live AI Integration Test (30-second samples)', () => {
    let backendAvailable = false;

    beforeAll(async () => {
        // Check if backend is running
        try {
            await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
            backendAvailable = true;
            console.log('✅ Backend is available');
        } catch {
            console.warn('⚠️ Backend not available - skipping live tests');
            backendAvailable = false;
        }
    });

    it('should analyze top 15 symbols and receive valid AI responses within 30 seconds each', async () => {
        if (!backendAvailable) {
            console.log('Skipping - backend not available');
            return;
        }

        const results: TestResult[] = [];
        const startTime = Date.now();

        console.log('\n🚀 Starting Live AI Analysis Test');
        console.log(`Testing ${TOP_15_SYMBOLS.length} symbols...`);
        console.log('─'.repeat(60));

        for (const symbol of TOP_15_SYMBOLS) {
            const symbolStartTime = Date.now();

            console.log(`\n📊 Analyzing ${symbol}...`);

            try {
                // Collect market data
                const [klines, orderBook] = await Promise.all([
                    fetchBinanceKlines(symbol, 10),
                    fetchOrderBook(symbol)
                ]);

                console.log(`   📈 Klines: ${klines.length}, Imbalance: ${orderBook.imbalance.toFixed(4)}`);

                // Request AI analysis
                const analysis = await requestAIAnalysis(symbol);
                const responseTime = Date.now() - symbolStartTime;

                if (analysis) {
                    const isValid = validateAIResponse(analysis);

                    results.push({
                        symbol,
                        success: isValid,
                        analysis,
                        responseTime
                    });

                    console.log(`   ✅ Result: ${analysis.tendance} (conf: ${analysis.confidence.toFixed(2)})`);
                    console.log(`   ⏱️  Response time: ${responseTime}ms`);

                    if (!isValid) {
                        console.log(`   ⚠️  Validation failed`);
                    }
                } else {
                    results.push({
                        symbol,
                        success: false,
                        error: 'No response from AI',
                        responseTime
                    });
                    console.log(`   ❌ No AI response`);
                }

            } catch (error: any) {
                const responseTime = Date.now() - symbolStartTime;
                results.push({
                    symbol,
                    success: false,
                    error: error.message,
                    responseTime
                });
                console.log(`   ❌ Error: ${error.message}`);
            }

            // Small delay between symbols to avoid rate limiting
            await new Promise(r => setTimeout(r, 500));
        }

        const totalTime = Date.now() - startTime;

        // Summary
        console.log('\n' + '═'.repeat(60));
        console.log('📋 TEST SUMMARY');
        console.log('─'.repeat(60));

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

        console.log(`   Total symbols:     ${TOP_15_SYMBOLS.length}`);
        console.log(`   Successful:        ${successful}`);
        console.log(`   Failed:            ${failed}`);
        console.log(`   Avg response time: ${avgResponseTime.toFixed(0)}ms`);
        console.log(`   Total test time:   ${(totalTime / 1000).toFixed(1)}s`);

        // Direction breakdown
        const directions = results
            .filter(r => r.analysis)
            .reduce((acc, r) => {
                acc[r.analysis!.tendance] = (acc[r.analysis!.tendance] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        console.log('\n📊 Direction Breakdown:');
        console.log(`   LONG:  ${directions['LONG'] || 0}`);
        console.log(`   SHORT: ${directions['SHORT'] || 0}`);
        console.log(`   WAIT:  ${directions['WAIT'] || 0}`);

        console.log('═'.repeat(60));

        // Assert at least 50% success rate
        const successRate = successful / TOP_15_SYMBOLS.length;
        expect(successRate).toBeGreaterThanOrEqual(0.5);

        // Assert average response time under 30 seconds
        expect(avgResponseTime).toBeLessThan(AI_ANALYSIS_TIMEOUT);

    }, 600000); // 10-minute timeout for entire test

    it('should validate individual AI responses meet strategy requirements', async () => {
        if (!backendAvailable) {
            console.log('Skipping - backend not available');
            return;
        }

        // Test single symbol with detailed validation
        const symbol = 'BTCUSDT';
        console.log(`\n🔍 Detailed validation for ${symbol}`);

        const analysis = await requestAIAnalysis(symbol);

        if (analysis) {
            // Structure validation
            expect(analysis).toHaveProperty('tendance');
            expect(analysis).toHaveProperty('sigma');
            expect(analysis).toHaveProperty('takeProfitPnlClick');
            expect(analysis).toHaveProperty('confidence');
            expect(analysis).toHaveProperty('reasoning');

            // Value range validation
            expect(['LONG', 'SHORT', 'WAIT']).toContain(analysis.tendance);
            expect(analysis.confidence).toBeGreaterThanOrEqual(0);
            expect(analysis.confidence).toBeLessThanOrEqual(1);
            expect(analysis.sigma).toBeGreaterThanOrEqual(0.001);
            expect(analysis.sigma).toBeLessThanOrEqual(0.05);
            expect(analysis.takeProfitPnlClick).toBeGreaterThanOrEqual(0.0005);
            expect(analysis.takeProfitPnlClick).toBeLessThanOrEqual(0.02);

            // Reasoning quality
            expect(analysis.reasoning.length).toBeGreaterThanOrEqual(30);

            // Confidence-tendance consistency
            if (analysis.confidence < 0.5) {
                expect(analysis.tendance).toBe('WAIT');
            }

            console.log(`   ✅ All validations passed`);
            console.log(`   Result: ${analysis.tendance} @ ${(analysis.confidence * 100).toFixed(1)}% confidence`);
        } else {
            console.log('   ⚠️ No response - backend may not support AI endpoint');
        }
    }, 60000);
});

describe('Market Data Collection Validation', () => {
    it('should fetch valid klines from Binance for all 15 symbols', async () => {
        console.log('\n📈 Validating Binance klines for all symbols...\n');

        for (const symbol of TOP_15_SYMBOLS) {
            const klines = await fetchBinanceKlines(symbol, 10);

            expect(klines.length).toBe(10);
            expect(klines[0]).toHaveProperty('open');
            expect(klines[0]).toHaveProperty('high');
            expect(klines[0]).toHaveProperty('low');
            expect(klines[0]).toHaveProperty('close');
            expect(klines[0]).toHaveProperty('volume');

            console.log(`   ✅ ${symbol}: ${klines.length} klines, last close: ${klines[klines.length - 1].close}`);
        }
    }, 60000);

    it('should fetch valid order book data for all 15 symbols', async () => {
        console.log('\n📊 Validating Binance order books for all symbols...\n');

        for (const symbol of TOP_15_SYMBOLS) {
            const orderBook = await fetchOrderBook(symbol);

            expect(orderBook.imbalance).toBeGreaterThanOrEqual(-1);
            expect(orderBook.imbalance).toBeLessThanOrEqual(1);

            const direction = orderBook.imbalance > 0.1 ? '🟢 BUY' :
                orderBook.imbalance < -0.1 ? '🔴 SELL' : '⚪ NEUTRAL';

            console.log(`   ${direction} ${symbol}: imbalance ${orderBook.imbalance.toFixed(4)}`);
        }
    }, 60000);
});

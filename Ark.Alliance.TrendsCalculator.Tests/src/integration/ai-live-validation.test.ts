/**
 * Live AI Prediction Validation Test
 * 
 * @fileoverview Tests AI prediction accuracy using real Binance WebSocket market data
 * @module tests/integration/ai-live-validation
 * 
 * This test:
 * 1. Connects to real Binance WebSocket (mainnet) for SOLUSDT
 * 2. Collects live market data for 30 seconds
 * 3. Gets AI prediction from Gemini
 * 4. Waits for price evolution (60 seconds)
 * 5. Validates if AI prediction matches actual market movement
 * 
 * @author Ark.Alliance Team
 * @version 1.0.0
 * @since 2026-01-06
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import WebSocket from 'ws';
import { AIPromptTemplates } from '@backend/infrastructure/external/ai/AIPromptTemplates';
import { MarketMicroData } from '@backend/infrastructure/external/ai/types';
import { TrendDirection } from '@share/enums/trend/TrendDirection';

// Configuration
const SYMBOL = 'SOLUSDT';
const BINANCE_WS_URL = `wss://fstream.binance.com/ws/${SYMBOL.toLowerCase()}@kline_1m`;
const BINANCE_REST_URL = 'https://fapi.binance.com';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCo1OChYy90EIKgTkmvVVkdCx4mGZfSgDE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const DATA_COLLECTION_TIME = 30000;  // 30 seconds to collect data
const PREDICTION_VALIDATION_TIME = 60000;  // 60 seconds to validate prediction

interface KlineData {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    openTime: number;
    closeTime: number;
}

interface AIResponse {
    tendance: TrendDirection;
    sigma: number;
    takeProfitPnlClick: number;
    confidence: number;
    reasoning: string;
}

interface ValidationResult {
    symbol: string;
    aiPrediction: AIResponse | null;
    predictionPrice: number;
    validationPrice: number;
    priceChange: number;
    priceChangePercent: number;
    predictionAccurate: boolean;
    validationTimeMs: number;
}

/**
 * Fetch historical klines from Binance REST API
 */
async function fetchHistoricalKlines(symbol: string, limit: number = 10): Promise<KlineData[]> {
    try {
        const response = await axios.get(
            `${BINANCE_REST_URL}/fapi/v1/klines?symbol=${symbol}&interval=1m&limit=${limit}`
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
 * Fetch order book from Binance
 */
async function fetchOrderBook(symbol: string): Promise<{ imbalance: number }> {
    try {
        const response = await axios.get(
            `${BINANCE_REST_URL}/fapi/v1/depth?symbol=${symbol}&limit=20`
        );
        const bids = response.data.bids.reduce((sum: number, b: any) => sum + parseFloat(b[1]), 0);
        const asks = response.data.asks.reduce((sum: number, a: any) => sum + parseFloat(a[1]), 0);
        const total = bids + asks;
        return { imbalance: total > 0 ? (bids - asks) / total : 0 };
    } catch (error) {
        console.error(`Failed to fetch order book for ${symbol}:`, error);
        return { imbalance: 0 };
    }
}

/**
 * Get current price from Binance
 */
async function getCurrentPrice(symbol: string): Promise<number> {
    try {
        const response = await axios.get(
            `${BINANCE_REST_URL}/fapi/v1/ticker/price?symbol=${symbol}`
        );
        return parseFloat(response.data.price);
    } catch (error) {
        console.error(`Failed to get price for ${symbol}:`, error);
        return 0;
    }
}

/**
 * Collect real-time price updates via WebSocket
 */
function collectRealTimeData(durationMs: number): Promise<{ prices: number[], finalKline: KlineData | null }> {
    return new Promise((resolve) => {
        const prices: number[] = [];
        let finalKline: KlineData | null = null;

        const ws = new WebSocket(BINANCE_WS_URL);

        ws.on('open', () => {
            console.log(`   📡 WebSocket connected to Binance for ${SYMBOL}`);
        });

        ws.on('message', (data: WebSocket.Data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.k) {
                    const price = parseFloat(msg.k.c);
                    prices.push(price);
                    finalKline = {
                        open: parseFloat(msg.k.o),
                        high: parseFloat(msg.k.h),
                        low: parseFloat(msg.k.l),
                        close: parseFloat(msg.k.c),
                        volume: parseFloat(msg.k.v),
                        openTime: msg.k.t,
                        closeTime: msg.k.T
                    };
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });

        ws.on('error', (error) => {
            console.error('   ❌ WebSocket error:', error.message);
        });

        setTimeout(() => {
            ws.close();
            resolve({ prices, finalKline });
        }, durationMs);
    });
}

/**
 * Send prompt to Gemini AI
 */
async function callGeminiAPI(systemPrompt: string, userPrompt: string): Promise<AIResponse | null> {
    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                    responseMimeType: 'application/json'
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        const text = response.data.candidates[0]?.content?.parts[0]?.text;
        if (text) {
            return JSON.parse(text) as AIResponse;
        }
        return null;
    } catch (error: any) {
        console.error('Gemini API error:', error.message);
        return null;
    }
}

/**
 * Validate if prediction was accurate based on price movement
 */
function validatePrediction(
    prediction: TrendDirection,
    priceChangePercent: number,
    threshold: number = 0.1 // 0.1% threshold
): boolean {
    if (prediction === TrendDirection.WAIT) {
        // WAIT is accurate if price stayed within threshold
        return Math.abs(priceChangePercent) < threshold * 2;
    } else if (prediction === TrendDirection.LONG) {
        // LONG is accurate if price went up
        return priceChangePercent > 0;
    } else if (prediction === TrendDirection.SHORT) {
        // SHORT is accurate if price went down
        return priceChangePercent < 0;
    }
    return false;
}

describe('Live AI Prediction Validation (SOLUSDT)', () => {
    let geminiAvailable = false;
    let binanceAvailable = false;

    beforeAll(async () => {
        // Test Gemini API availability
        try {
            const response = await axios.post(
                `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
                {
                    contents: [{ role: 'user', parts: [{ text: 'Hello, respond with JSON: {"status": "ok"}' }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                },
                { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
            );
            geminiAvailable = response.status === 200;
            console.log('✅ Gemini API is available');
        } catch {
            console.warn('⚠️ Gemini API not available');
            geminiAvailable = false;
        }

        // Test Binance API availability
        try {
            const price = await getCurrentPrice(SYMBOL);
            binanceAvailable = price > 0;
            console.log(`✅ Binance API is available (${SYMBOL}: $${price})`);
        } catch {
            console.warn('⚠️ Binance API not available');
            binanceAvailable = false;
        }
    });

    it('should predict SOLUSDT direction and validate against real price evolution', async () => {
        if (!geminiAvailable || !binanceAvailable) {
            console.log('Skipping - Gemini or Binance not available');
            return;
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('🔮 LIVE AI PREDICTION VALIDATION TEST');
        console.log('───────────────────────────────────────────────────────────────');
        console.log(`   Symbol: ${SYMBOL}`);
        console.log(`   Data collection: ${DATA_COLLECTION_TIME / 1000}s`);
        console.log(`   Validation period: ${PREDICTION_VALIDATION_TIME / 1000}s`);
        console.log('───────────────────────────────────────────────────────────────\n');

        // Step 1: Collect historical and real-time data
        console.log('📊 Step 1: Collecting market data...');

        const [klines, orderBook, wsData] = await Promise.all([
            fetchHistoricalKlines(SYMBOL, 10),
            fetchOrderBook(SYMBOL),
            collectRealTimeData(DATA_COLLECTION_TIME)
        ]);

        const predictionPrice = wsData.prices.length > 0
            ? wsData.prices[wsData.prices.length - 1]
            : klines[klines.length - 1]?.close || 0;

        console.log(`   📈 Collected ${klines.length} klines`);
        console.log(`   📡 Received ${wsData.prices.length} real-time price updates`);
        console.log(`   💰 Current price: $${predictionPrice.toFixed(4)}`);
        console.log(`   ⚖️  Order book imbalance: ${orderBook.imbalance.toFixed(4)}`);

        // Step 2: Get AI prediction
        console.log('\n🤖 Step 2: Getting AI prediction...');

        const microData: MarketMicroData = {
            symbol: SYMBOL,
            lastPrice: predictionPrice,
            imbalance: orderBook.imbalance,
            volatilityScore: 15,
            klines: klines
        };

        const strategyParams = {
            investment: 100,
            sigma: 0.003,
            takeProfitPnlClick: 0.0015,
            riskTolerance: 'MEDIUM' as const
        };

        const systemPrompt = AIPromptTemplates.getSystemPrompt();
        const userPrompt = AIPromptTemplates.buildUserPrompt(microData, strategyParams);

        const startTime = Date.now();
        const aiPrediction = await callGeminiAPI(systemPrompt, userPrompt);
        const responseTime = Date.now() - startTime;

        if (!aiPrediction) {
            console.log('   ❌ Failed to get AI prediction');
            return;
        }

        console.log(`   ✅ AI Prediction: ${aiPrediction.tendance}`);
        console.log(`   🎯 Confidence: ${(aiPrediction.confidence * 100).toFixed(1)}%`);
        console.log(`   ⏱️  Response time: ${responseTime}ms`);
        console.log(`   📝 Reasoning: ${aiPrediction.reasoning.substring(0, 100)}...`);

        // Step 3: Wait and validate
        console.log(`\n⏳ Step 3: Waiting ${PREDICTION_VALIDATION_TIME / 1000}s to validate prediction...`);

        const validationData = await collectRealTimeData(PREDICTION_VALIDATION_TIME);
        const validationPrice = validationData.prices.length > 0
            ? validationData.prices[validationData.prices.length - 1]
            : predictionPrice;

        const priceChange = validationPrice - predictionPrice;
        const priceChangePercent = (priceChange / predictionPrice) * 100;

        // Step 4: Validate prediction
        console.log('\n📋 Step 4: Validation Results');
        console.log('───────────────────────────────────────────────────────────────');
        console.log(`   💰 Prediction price: $${predictionPrice.toFixed(4)}`);
        console.log(`   💰 Validation price: $${validationPrice.toFixed(4)}`);
        console.log(`   📈 Price change: ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(4)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(3)}%)`);

        const isAccurate = validatePrediction(aiPrediction.tendance, priceChangePercent);
        const actualDirection = priceChangePercent > 0.1 ? 'UP' : priceChangePercent < -0.1 ? 'DOWN' : 'FLAT';

        console.log(`   🤖 AI Predicted: ${aiPrediction.tendance}`);
        console.log(`   📊 Actual movement: ${actualDirection}`);
        console.log(`   ${isAccurate ? '✅' : '❌'} Prediction accuracy: ${isAccurate ? 'CORRECT' : 'INCORRECT'}`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Store result for logging
        const result: ValidationResult = {
            symbol: SYMBOL,
            aiPrediction,
            predictionPrice,
            validationPrice,
            priceChange,
            priceChangePercent,
            predictionAccurate: isAccurate,
            validationTimeMs: PREDICTION_VALIDATION_TIME
        };

        console.log('📦 Validation Result Object:', JSON.stringify(result, null, 2));

        // Assertions (soft - we log the result but don't fail on prediction accuracy)
        expect(aiPrediction).not.toBeNull();
        expect([TrendDirection.LONG, TrendDirection.SHORT, TrendDirection.WAIT]).toContain(aiPrediction.tendance);
        expect(aiPrediction.confidence).toBeGreaterThanOrEqual(0);
        expect(aiPrediction.confidence).toBeLessThanOrEqual(1);
        expect(predictionPrice).toBeGreaterThan(0);
        expect(validationPrice).toBeGreaterThan(0);

    }, 180000); // 3-minute timeout

    it('should collect valid real-time data from Binance WebSocket', async () => {
        if (!binanceAvailable) {
            console.log('Skipping - Binance not available');
            return;
        }

        console.log('\n📡 Testing Binance WebSocket connection...');

        const { prices, finalKline } = await collectRealTimeData(5000); // 5 seconds

        console.log(`   Received ${prices.length} price updates`);
        expect(prices.length).toBeGreaterThan(0);

        if (finalKline) {
            expect(finalKline.open).toBeGreaterThan(0);
            expect(finalKline.high).toBeGreaterThan(0);
            expect(finalKline.low).toBeGreaterThan(0);
            expect(finalKline.close).toBeGreaterThan(0);
            console.log(`   Last kline: O:${finalKline.open} H:${finalKline.high} L:${finalKline.low} C:${finalKline.close}`);
        }
    }, 15000);

    it('should fetch valid historical klines from Binance REST API', async () => {
        if (!binanceAvailable) {
            console.log('Skipping - Binance not available');
            return;
        }

        const klines = await fetchHistoricalKlines(SYMBOL, 10);

        expect(klines.length).toBe(10);
        expect(klines[0]).toHaveProperty('open');
        expect(klines[0]).toHaveProperty('high');
        expect(klines[0]).toHaveProperty('low');
        expect(klines[0]).toHaveProperty('close');
        expect(klines[0]).toHaveProperty('volume');

        console.log(`   ✅ Fetched ${klines.length} klines for ${SYMBOL}`);
        console.log(`   Last close: $${klines[klines.length - 1].close}`);
    }, 15000);
});

describe('AI Prompt Quality for Real Market Data', () => {
    it('should generate valid prompt from real SOLUSDT data', async () => {
        const klines = await fetchHistoricalKlines(SYMBOL, 10);
        const orderBook = await fetchOrderBook(SYMBOL);
        const currentPrice = await getCurrentPrice(SYMBOL);

        if (klines.length === 0 || currentPrice === 0) {
            console.log('Skipping - Unable to fetch real data');
            return;
        }

        const microData: MarketMicroData = {
            symbol: SYMBOL,
            lastPrice: currentPrice,
            imbalance: orderBook.imbalance,
            volatilityScore: 15,
            klines: klines
        };

        const prompt = AIPromptTemplates.buildUserPrompt(microData);

        // Validate prompt structure
        expect(prompt).toContain('MARKET ANALYSIS REQUEST');
        expect(prompt).toContain(SYMBOL);
        expect(prompt).toContain(currentPrice.toString().substring(0, 4)); // At least first 4 chars of price
        expect(prompt).toContain('Price Action');
        expect(prompt).toContain('REQUIRED RESPONSE FORMAT');

        console.log('   ✅ Prompt generated successfully from real data');
        console.log(`   Prompt length: ${prompt.length} characters`);
    }, 15000);
});

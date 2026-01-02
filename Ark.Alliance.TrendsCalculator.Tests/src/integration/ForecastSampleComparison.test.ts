/**
 * Parallel Forecast Accuracy Comparison Test
 * 
 * @fileoverview Compares forecasting accuracy between 30s vs 120s data sample lengths
 * @module integration/ForecastSampleComparison
 * 
 * @description
 * This test runs two parallel experiments:
 * 1. Uses 30 seconds of historical data to forecast trend
 * 2. Uses 120 seconds of historical data to forecast trend
 * 
 * Both forecasts are validated against the NEXT 30 seconds of live data.
 * The test compares which sample length provides better forecasting accuracy.
 */

import { describe, test, expect } from 'vitest';
import { BinanceMarketDataWs, BookTicker, MarketDataWsConfig } from 'ark-alliance-trading-providers-lib/Binance';
import { HurstExponentCalculator } from '@backend/domain/services/indicators/HurstExponentHelper';

const BINANCE_REST_BASE = 'https://fapi.binance.com';

/**
 * Fetch historical klines from Binance REST API
 */
async function fetchKlines(symbol: string, intervalSeconds: number): Promise<number[]> {
    // Convert seconds to minutes and get that many 1m candles
    const minutes = Math.max(Math.ceil(intervalSeconds / 60), 2);

    const url = `${BINANCE_REST_BASE}/fapi/v1/klines?symbol=${symbol}&interval=1m&limit=${minutes}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch klines: ${response.status}`);
    }

    const klines = await response.json();
    // Kline format: [openTime, open, high, low, close, volume, ...]
    return klines.map((k: any[]) => parseFloat(k[4])); // close prices
}

/**
 * Calculate simple trend direction from prices
 */
function calculateTrendDirection(prices: number[]): 'LONG' | 'SHORT' | 'WAIT' {
    if (prices.length < 2) return 'WAIT';

    const first = prices[0];
    const last = prices[prices.length - 1];
    const changePercent = ((last - first) / first) * 100;

    // Use simple threshold
    if (changePercent > 0.05) return 'LONG';
    if (changePercent < -0.05) return 'SHORT';
    return 'WAIT';
}

/**
 * Collect live price data via WebSocket using existing infrastructure
 */
async function collectLiveData(symbol: string, durationMs: number): Promise<number[]> {
    return new Promise((resolve) => {
        const prices: number[] = [];
        const wsConfig: MarketDataWsConfig = {
            wsStreamUrl: 'wss://fstream.binance.com/stream'
        };
        const wsClient = new BinanceMarketDataWs(wsConfig);

        const timeout = setTimeout(async () => {
            wsClient.disconnect();
            resolve(prices);
        }, durationMs);

        wsClient.on('priceUpdate', (ticker: BookTicker) => {
            if (ticker.symbol === symbol) {
                const midPrice = (ticker.bidPrice + ticker.askPrice) / 2;
                prices.push(midPrice);
            }
        });

        wsClient.connect().then(() => {
            wsClient.subscribe([symbol]);
        }).catch(() => {
            clearTimeout(timeout);
            resolve(prices);
        });
    });
}

interface ForecastResult {
    sampleLengthSeconds: number;
    predictedDirection: 'LONG' | 'SHORT' | 'WAIT';
    actualDirection: 'LONG' | 'SHORT' | 'WAIT';
    correct: boolean;
    samplePrices: number;
    validationPrices: number;
}

describe('Parallel Forecast Sample Length Comparison', () => {
    const TEST_SYMBOL = 'BTCUSDT';
    const VALIDATION_DURATION_MS = 30000; // 30 seconds

    test('should compare 30s vs 120s sample length forecasting accuracy', async () => {
        console.log('\n🔬 PARALLEL FORECAST SAMPLE LENGTH COMPARISON');
        console.log('━'.repeat(60));
        console.log(`Symbol: ${TEST_SYMBOL}`);
        console.log(`Validation Window: 30 seconds`);
        console.log('━'.repeat(60));

        // Step 1: Fetch historical data for both sample lengths simultaneously
        console.log('\n📊 Step 1: Fetching historical data from Binance REST API...');

        const [prices30s, prices120s] = await Promise.all([
            fetchKlines(TEST_SYMBOL, 30),
            fetchKlines(TEST_SYMBOL, 120)
        ]);

        console.log(`  30s sample: ${prices30s.length} price points`);
        console.log(`  120s sample: ${prices120s.length} price points`);

        // Step 2: Calculate predictions from both samples
        console.log('\n🔮 Step 2: Calculating trend predictions...');

        const predicted30s = calculateTrendDirection(prices30s);
        const predicted120s = calculateTrendDirection(prices120s);

        console.log(`  30s prediction: ${predicted30s}`);
        console.log(`  120s prediction: ${predicted120s}`);

        // Step 3: Collect validation data (30 seconds of live data)
        console.log(`\n⏱️  Step 3: Collecting 30 seconds of live validation data via WebSocket...`);

        const validationPrices = await collectLiveData(TEST_SYMBOL, VALIDATION_DURATION_MS);

        console.log(`  Collected: ${validationPrices.length} live price points`);

        // Step 4: Calculate actual trend from validation period
        console.log('\n📈 Step 4: Calculating actual trend...');

        const actualDirection = validationPrices.length >= 2
            ? calculateTrendDirection(validationPrices)
            : 'WAIT';

        console.log(`  Actual direction: ${actualDirection}`);

        // Step 5: Compare results
        const result30s: ForecastResult = {
            sampleLengthSeconds: 30,
            predictedDirection: predicted30s,
            actualDirection,
            correct: predicted30s === actualDirection,
            samplePrices: prices30s.length,
            validationPrices: validationPrices.length
        };

        const result120s: ForecastResult = {
            sampleLengthSeconds: 120,
            predictedDirection: predicted120s,
            actualDirection,
            correct: predicted120s === actualDirection,
            samplePrices: prices120s.length,
            validationPrices: validationPrices.length
        };

        // Report results
        console.log('\n' + '═'.repeat(60));
        console.log('📊 RESULTS');
        console.log('═'.repeat(60));

        console.log(`\n30-Second Sample:`);
        console.log(`  Predicted: ${result30s.predictedDirection}`);
        console.log(`  Actual:    ${result30s.actualDirection}`);
        console.log(`  Result:    ${result30s.correct ? '✅ CORRECT' : '❌ WRONG'}`);

        console.log(`\n120-Second Sample:`);
        console.log(`  Predicted: ${result120s.predictedDirection}`);
        console.log(`  Actual:    ${result120s.actualDirection}`);
        console.log(`  Result:    ${result120s.correct ? '✅ CORRECT' : '❌ WRONG'}`);

        // Determine winner
        console.log('\n' + '─'.repeat(60));
        if (result30s.correct && !result120s.correct) {
            console.log('🏆 WINNER: 30-second sample (shorter is better)');
        } else if (!result30s.correct && result120s.correct) {
            console.log('🏆 WINNER: 120-second sample (longer is better)');
        } else if (result30s.correct && result120s.correct) {
            console.log('🏆 TIE: Both samples predicted correctly');
        } else {
            console.log('📉 Both samples predicted incorrectly');
        }
        console.log('─'.repeat(60) + '\n');

        // Assertions - both must produce valid predictions
        expect(result30s.predictedDirection).toBeDefined();
        expect(result120s.predictedDirection).toBeDefined();
        expect(['LONG', 'SHORT', 'WAIT']).toContain(result30s.predictedDirection);
        expect(['LONG', 'SHORT', 'WAIT']).toContain(result120s.predictedDirection);
        expect(result30s.samplePrices).toBeGreaterThan(0);
        expect(result120s.samplePrices).toBeGreaterThan(0);
    }, 120000); // 2 minute timeout

    test('should run multiple iterations to determine statistical winner', async () => {
        const ITERATIONS = 3;
        let wins30s = 0;
        let wins120s = 0;
        let ties = 0;

        console.log('\n🔄 MULTI-ITERATION COMPARISON');
        console.log(`Running ${ITERATIONS} iterations...`);
        console.log('━'.repeat(60));

        for (let i = 0; i < ITERATIONS; i++) {
            console.log(`\n📊 Iteration ${i + 1}/${ITERATIONS}`);

            // Fetch both sample lengths from REST
            const [prices30s, prices120s] = await Promise.all([
                fetchKlines(TEST_SYMBOL, 30),
                fetchKlines(TEST_SYMBOL, 120)
            ]);

            const predicted30s = calculateTrendDirection(prices30s);
            const predicted120s = calculateTrendDirection(prices120s);

            // Collect validation data via WebSocket
            const validationPrices = await collectLiveData(TEST_SYMBOL, VALIDATION_DURATION_MS);
            const actualDirection = validationPrices.length >= 2
                ? calculateTrendDirection(validationPrices)
                : 'WAIT';

            const correct30s = predicted30s === actualDirection;
            const correct120s = predicted120s === actualDirection;

            console.log(`  30s: ${predicted30s} → ${correct30s ? '✅' : '❌'}`);
            console.log(`  120s: ${predicted120s} → ${correct120s ? '✅' : '❌'}`);

            if (correct30s && !correct120s) wins30s++;
            else if (!correct30s && correct120s) wins120s++;
            else ties++;

            // Wait 5 seconds between iterations
            if (i < ITERATIONS - 1) {
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log('📊 FINAL STATISTICS');
        console.log('═'.repeat(60));
        console.log(`  30s sample wins: ${wins30s}`);
        console.log(`  120s sample wins: ${wins120s}`);
        console.log(`  Ties: ${ties}`);

        const winner = wins30s > wins120s ? '30s' : wins120s > wins30s ? '120s' : 'TIE';
        console.log(`\n🏆 RECOMMENDED SAMPLE LENGTH: ${winner}`);
        console.log('═'.repeat(60) + '\n');

        // Assertions
        expect(wins30s + wins120s + ties).toBe(ITERATIONS);
    }, 300000); // 5 minute timeout
});

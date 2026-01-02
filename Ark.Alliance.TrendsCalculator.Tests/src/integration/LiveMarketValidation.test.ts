/**
 * Live Market Validation Integration Test
 * 
 * @fileoverview Integration test that validates trend calculations against real market data
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Ark.Alliance.TrendsCalculator.Tests/docs/LiveMarketValidation_Requirements.md}
 * 
 * @remarks
 * This test:
 * 1. Fetches Top 50 market cap symbols
 * 2. Collects 30 seconds of real-time price data
 * 3. Calculates trends from first 15 seconds
 * 4. Validates predictions against last 15 seconds
 * 5. Saves results to JSON for dashboard visualization
 * 
 * SUCCESS CRITERIA: ≥70% prediction accuracy
 */

import { describe, it, expect } from 'vitest';
import { TopSymbolsFetcher } from './services/TopSymbolsFetcher';
import { LiveMarketValidationService } from './services/LiveMarketValidationService';

describe('Live Market Validation Test', () => {
    // Set long timeout for real market data collection
    const TIMEOUT = 60000; // 60 seconds

    it('should achieve ≥70% accuracy predicting trends using real market data', async () => {
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║                                                          ║');
        console.log('║         LIVE MARKET VALIDATION TEST                      ║');
        console.log('║         Ultimate Proof of Mathematical Framework         ║');
        console.log('║                                                          ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('\n');

        // Step 1: Fetch Top 50 symbols
        console.log('📡 Step 1: Fetching Top 50 market cap symbols...');
        const fetcher = new TopSymbolsFetcher();
        const symbols = await fetcher.getTopSymbolNames(50);
        console.log(`✅ Fetched ${symbols.length} symbols`);
        console.log(`   Top 5: ${symbols.slice(0, 5).join(', ')}\n`);

        // Step 2: Run validation test
        console.log('🔬 Step 2: Running live validation test (30 seconds)...');
        const validationService = new LiveMarketValidationService();
        const results = await validationService.runValidationTest(
            symbols,
            15, // Training: first 15 seconds
            15  // Validation: last 15 seconds
        );

        // Step 3: Verify results
        console.log('\n📊 Step 3: Verifying results...');
        expect(results).toBeDefined();
        expect(results.totalSymbols).toBeGreaterThan(0);
        expect(results.accuracyPercent).toBeGreaterThanOrEqual(0);
        expect(results.accuracyPercent).toBeLessThanOrEqual(100);

        // Step 4: Assert success criteria
        console.log(`\n🎯 Final Result: ${results.accuracyPercent.toFixed(1)}% accuracy`);
        expect(results.accuracyPercent).toBeGreaterThanOrEqual(70);
        expect(results.passed).toBe(true);

        console.log('\n✅ TEST PASSED: Mathematical framework validated!\n');

    }, TIMEOUT);

    it('should achieve ≥70% accuracy with 1-minute timeframe (30s/30s)', async () => {
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║                                                          ║');
        console.log('║      LIVE MARKET VALIDATION TEST - 1 MINUTE              ║');
        console.log('║      30s Training + 30s Validation                       ║');
        console.log('║                                                          ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('\n');

        // Step 1: Fetch Top 50 symbols
        console.log('📡 Step 1: Fetching Top 50 market cap symbols...');
        const fetcher = new TopSymbolsFetcher();
        const symbols = await fetcher.getTopSymbolNames(50);
        console.log(`✅ Fetched ${symbols.length} symbols`);
        console.log(`   Top 5: ${symbols.slice(0, 5).join(', ')}\n`);

        // Step 2: Run validation test with 30s/30s split
        console.log('🔬 Step 2: Running 1-minute validation test (60 seconds total)...');
        const validationService = new LiveMarketValidationService();
        const results = await validationService.runValidationTest(
            symbols,
            30, // Training: first 30 seconds
            30  // Validation: last 30 seconds
        );

        // Step 3: Verify results
        console.log('\n📊 Step 3: Verifying results...');
        expect(results).toBeDefined();
        expect(results.totalSymbols).toBeGreaterThan(0);
        expect(results.accuracyPercent).toBeGreaterThanOrEqual(0);
        expect(results.accuracyPercent).toBeLessThanOrEqual(100);

        // Step 4: Assert success criteria
        console.log(`\n🎯 Final Result: ${results.accuracyPercent.toFixed(1)}% accuracy`);
        expect(results.accuracyPercent).toBeGreaterThanOrEqual(70);
        expect(results.passed).toBe(true);

        console.log('\n✅ TEST PASSED: 1-minute timeframe validated!\n');

    }, TIMEOUT * 2); // Double timeout for 60-second data collection

    it.skip('should compare Simple vs Multi-Factor Regime Detection', async () => {
        // Future enhancement: Compare different detection strategies
    }, TIMEOUT);
});




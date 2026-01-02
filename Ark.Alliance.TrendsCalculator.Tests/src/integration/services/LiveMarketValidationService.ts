/**
 * Live Market Validation Service
 * 
 * @fileoverview Collects 30s of real market data, calculates trends, and validates predictions
 * @module integration/services/LiveMarketValidationService
 */

import { BinanceMarketDataWs, BookTicker, MarketDataWsConfig, BinanceEnvironment } from 'ark-alliance-trading-providers-lib/Binance';
import { TrendCalculatorService } from '@backend/application/services/TrendCalculatorService';
import { HurstExponentCalculator } from '@backend/domain/services/indicators/HurstExponentHelper';
import { GARCHHelper } from '@backend/domain/services/volatility/GARCHHelper';
import { SimpleRegimeDetector } from '@backend/domain/services/advanced/RegimeDetector';
import {
    LiveValidationTestResult,
    SymbolValidationResult
} from '../models/LiveValidationResult';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Service for live market validation testing
 */
export class LiveMarketValidationService {
    private wsClient: BinanceMarketDataWs;
    private trendCalculator: TrendCalculatorService;
    private hurstHelper: HurstExponentCalculator;
    private garchHelper: GARCHHelper;
    private regimeDetector: SimpleRegimeDetector;

    constructor() {
        const wsConfig: MarketDataWsConfig = {
            wsStreamUrl: 'wss://fstream.binance.com/stream'
        };
        this.wsClient = new BinanceMarketDataWs(wsConfig);
        this.trendCalculator = TrendCalculatorService.getInstance();
        this.hurstHelper = new HurstExponentCalculator();
        this.garchHelper = new GARCHHelper();
        this.regimeDetector = new SimpleRegimeDetector();
    }

    /**
     * Run live validation test
     * 
     * @param symbols - Symbols to test
     * @param trainingSeconds - Training period duration
     * @param validationSeconds - Validation period duration
     * @returns Test results
     */
    async runValidationTest(
        symbols: string[],
        trainingSeconds: number = 15,
        validationSeconds: number = 15
    ): Promise<LiveValidationTestResult> {
        const startTime = Date.now();

        console.log(`\n🔬 Starting Live Market Validation Test`);
        console.log(`📊 Symbols: ${symbols.length}`);
        console.log(`⏱️  Training: ${trainingSeconds}s | Validation: ${validationSeconds}s\n`);

        // Connect WebSocket
        await this.wsClient.connect();

        //Subscribe to all symbols
        this.wsClient.subscribe(symbols);

        // Collect data for total duration
        const totalDuration = (trainingSeconds + validationSeconds) * 1000;
        const symbolData = await this.collectData(symbols, totalDuration);

        // Disconnect
        this.wsClient.disconnect();

        // Analyze each symbol
        const results: SymbolValidationResult[] = [];

        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const data = symbolData.get(symbol);

            if (!data || data.length < 20) {
                console.log(`⚠️  ${symbol}: Insufficient data (${data?.length || 0} points)`);
                continue;
            }

            const result = this.analyzeSymbol(symbol, i + 1, data, trainingSeconds * 1000);
            results.push(result);

            const status = result.correct ? '✓' : '✗';
            const regime = result.predictedTrend.marketRegime || 'N/A';
            const volRegime = result.predictedTrend.volatilityRegime || 'N/A';
            console.log(`${status} ${symbol.padEnd(12)} | Predicted: ${result.predictedTrend.direction.padEnd(5)} | Actual: ${result.actualTrend.direction.padEnd(5)} | Regime: ${regime.padEnd(15)} | Vol: ${volRegime.padEnd(10)} | ${result.correct ? 'CORRECT' : 'WRONG'}`);
        }

        // Calculate statistics
        const correctPredictions = results.filter(r => r.correct).length;
        const accuracyPercent = (correctPredictions / results.length) * 100;
        const passed = accuracyPercent >= 70;

        const testResult: LiveValidationTestResult = {
            timestamp: startTime,
            durationMs: Date.now() - startTime,
            totalSymbols: results.length,
            correctPredictions,
            accuracyPercent,
            passed,
            symbols: results,
            config: {
                trainingDurationSeconds: trainingSeconds,
                validationDurationSeconds: validationSeconds,
                helpers: ['LinearRegression', 'EMA/SMA', 'Hurst', 'GARCH', 'RegimeDetection', 'MetricsCalculator']
            }
        };

        // Print summary
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📈 RESULTS: ${correctPredictions}/${results.length} = ${accuracyPercent.toFixed(1)}%`);
        console.log(`${passed ? '✅ TEST PASSED' : '❌ TEST FAILED'} (threshold: 70%)`);
        console.log(`${'='.repeat(60)}\n`);

        // Save to JSON
        this.saveResults(testResult);

        return testResult;
    }

    /**
     * Collect price data for specified duration
     * @private
     */
    private async collectData(
        symbols: string[],
        durationMs: number
    ): Promise<Map<string, Array<{ timestamp: number; price: number }>>> {
        const data = new Map<string, Array<{ timestamp: number; price: number }>>();

        // Initialize storage
        symbols.forEach(s => data.set(s, []));

        // Listen for updates
        this.wsClient.on('priceUpdate', (ticker: BookTicker) => {
            const symbolData = data.get(ticker.symbol);
            if (symbolData) {
                const midPrice = (ticker.bidPrice + ticker.askPrice) / 2;
                symbolData.push({
                    timestamp: ticker.updateId, // Use updateId as timestamp proxy
                    price: midPrice
                });
            }
        });

        // Wait for duration
        await new Promise(resolve => setTimeout(resolve, durationMs));

        return data;
    }

    /**
     * Analyze single symbol
     * @private
     */
    private analyzeSymbol(
        symbol: string,
        rank: number,
        data: Array<{ timestamp: number; price: number }>,
        trainingSplitMs: number
    ): SymbolValidationResult {
        // Split data
        const trainingData = data.filter(d => d.timestamp - data[0].timestamp < trainingSplitMs);
        const validationData = data.filter(d => d.timestamp - data[0].timestamp >= trainingSplitMs);

        // Calculate predicted trend from training data
        const trainingPrices = trainingData.map(d => d.price);
        const predicted = this.calculateTrend(trainingPrices);

        // Calculate actual trend from validation data
        const actual = this.calculateActualTrend(validationData);

        // Determine if correct
        const correct = predicted.direction === actual.direction;

        // Build time series with phase labels
        const timeSeries = data.map(d => ({
            timestamp: d.timestamp,
            price: d.price,
            phase: (d.timestamp - data[0].timestamp < trainingSplitMs ? 'training' : 'validation') as 'training' | 'validation'
        }));

        return {
            symbol,
            rank,
            predictedTrend: predicted,
            actualTrend: actual,
            correct,
            timeSeries
        };
    }

    /**
     * Calculate trend using all math helpers
     * @private
     */
    private calculateTrend(prices: number[]): {
        direction: 'LONG' | 'SHORT' | 'WAIT';
        confidence: number;
        compositeScore: number;
        slope: number;
        hurst: number;
        volatilityRegime: string;
        marketRegime: string;
        regimeConfidence: number;
    } {
        try {
            // Use TrendCalculatorService
            const trend = this.trendCalculator.calculateFromPrices(prices);

            // Calculate Hurst exponent
            const hurst = this.hurstHelper.calculate(prices);

            // GARCH volatility regime
            const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
            const historicalVols = returns.map(r => Math.abs(r));
            const currentVol = Math.abs(returns[returns.length - 1]);
            const volatilityRegime = this.garchHelper.classifyVolatilityRegime(currentVol, historicalVols);

            // Regime Detection - API is detect(), returns .type and .probability
            const regimeResult = this.regimeDetector.detect(prices);
            const marketRegime = regimeResult.type || 'UNKNOWN';
            const regimeConfidence = regimeResult.probability || 0;

            return {
                direction: trend.direction as any,
                confidence: trend.confidence,
                compositeScore: trend.compositeScore,
                slope: trend.slope,
                hurst: hurst.exponent,
                volatilityRegime,
                marketRegime,
                regimeConfidence
            };
        } catch (error) {
            console.error(`Trend calculation error:`, error);
            return {
                direction: 'WAIT',
                confidence: 0,
                compositeScore: 0,
                slope: 0,
                hurst: 0.5,
                volatilityRegime: 'UNKNOWN',
                marketRegime: 'UNKNOWN',
                regimeConfidence: 0
            };
        }
    }

    /**
     * Calculate actual trend from validation period
     * @private
     */
    private calculateActualTrend(data: Array<{ timestamp: number; price: number }>): {
        direction: 'LONG' | 'SHORT' | 'WAIT';
        priceChangePercent: number;
    } {
        if (data.length < 2) {
            return { direction: 'WAIT', priceChangePercent: 0 };
        }

        const startPrice = data[0].price;
        const endPrice = data[data.length - 1].price;
        const priceChangePercent = ((endPrice - startPrice) / startPrice) * 100;

        // Determine direction based on price change
        let direction: 'LONG' | 'SHORT' | 'WAIT';
        if (priceChangePercent > 0.1) {
            direction = 'LONG';
        } else if (priceChangePercent < -0.1) {
            direction = 'SHORT';
        } else {
            direction = 'WAIT';
        }

        return { direction, priceChangePercent };
    }

    /**
     * Save results to JSON file
     * @private
     */
    private saveResults(result: LiveValidationTestResult): void {
        const outputDir = join(__dirname, '../../../test-results');
        const outputFile = join(outputDir, `live-validation-${Date.now()}.json`);

        try {
            // Create directory if it doesn't exist
            const fs = require('fs');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            writeFileSync(outputFile, JSON.stringify(result, null, 2));
            console.log(`💾 Results saved to: ${outputFile}`);
        } catch (error: any) {
            console.error(`Failed to save results: ${error.message}`);
        }
    }
}




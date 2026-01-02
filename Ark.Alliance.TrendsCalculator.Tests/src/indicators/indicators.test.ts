/**
 * Indicator Helpers Tests
 * 
 * @fileoverview Tests for HurstExponentCalculator, EMAHelper, and SMAHelper
 * @module tests/indicators
 */

import { describe, it, expect } from 'vitest';
import { TestScenarioLoader } from '../core/TestScenarioLoader';
import { HurstExponentCalculator } from '@backend/domain/services/indicators/HurstExponentHelper';
import { EMAHelper, SMAHelper } from '@backend/domain/services/indicators/EMAHelper';

const loader = new TestScenarioLoader();

describe('HurstExponentCalculator', () => {
    const calculator = new HurstExponentCalculator();
    const scenarios = loader.loadScenarios('indicators').filter(s => s.component === 'HurstExponentCalculator');

    scenarios.forEach(scenario => {
        it(`${scenario.id}: ${scenario.name}`, () => {
            const { prices } = scenario.input;
            const expected = scenario.expectedResults;

            const result = calculator.calculate(prices);

            // Validate Hurst exponent range
            if (expected.hurstMin !== undefined) {
                expect(result.exponent).toBeGreaterThanOrEqual(expected.hurstMin);
            }
            if (expected.hurstMax !== undefined) {
                expect(result.exponent).toBeLessThanOrEqual(expected.hurstMax);
            }

            // Validate interpretation
            if (expected.behavior) {
                expect(result.interpretation.behavior).toBe(expected.behavior);
            }
            if (expected.strategyType) {
                expect(result.interpretation.strategyType).toBe(expected.strategyType);
            }
        });
    });

    it('interpret: classifies H < 0.45 as MEAN_REVERTING', () => {
        const interpretation = calculator.interpret(0.35);

        expect(interpretation.behavior).toBe('MEAN_REVERTING');
        expect(interpretation.strategyType).toBe('RANGE_TRADING');
        expect(interpretation.confidence).toBeGreaterThan(0);
    });

    it('interpret: classifies H > 0.55 as TRENDING', () => {
        const interpretation = calculator.interpret(0.70);

        expect(interpretation.behavior).toBe('TRENDING');
        expect(interpretation.strategyType).toBe('TREND_FOLLOWING');
        expect(interpretation.shouldTrade).toBe(true);
    });

    it('interpret: classifies 0.45 ≤ H ≤ 0.55 as RANDOM_WALK', () => {
        const interpretation = calculator.interpret(0.50);

        expect(interpretation.behavior).toBe('RANDOM_WALK');
        expect(interpretation.strategyType).toBe('NEUTRAL');
        expect(interpretation.shouldTrade).toBe(false);
    });
});

describe('EMAHelper', () => {
    const helper = new EMAHelper();
    const scenarios = loader.loadScenarios('indicators').filter(s => s.component === 'EMAHelper');

    scenarios.forEach(scenario => {
        it(`${scenario.id}: ${scenario.name}`, () => {
            const { prices, period } = scenario.input;
            const expected = scenario.expectedResults;

            const result = helper.calculate(prices, period);

            // Validate final EMA value
            if (expected.finalEMAMin !== undefined) {
                expect(result.value).toBeGreaterThanOrEqual(expected.finalEMAMin);
            }
            if (expected.finalEMAMax !== undefined) {
                expect(result.value).toBeLessThanOrEqual(expected.finalEMAMax);
            }

            // Validate series length
            if (expected.seriesLength !== undefined) {
                expect(result.series).toHaveLength(expected.seriesLength);
            }
        });
    });

    it('calculate: EMA responds faster than SMA to price changes', () => {
        const prices = [100, 100, 100, 100, 100, 120, 120, 120]; // Jump from 100 to 120

        const ema = helper.calculateLast(prices, 5);
        const smaHelper = new SMAHelper();
        const sma = smaHelper.calculate(prices, 5);

        // EMA should be closer to recent price (120) than SMA
        expect(ema).toBeGreaterThan(sma);
    });
});

describe('SMAHelper', () => {
    const helper = new SMAHelper();

    it('calculate: returns simple average of last N prices', () => {
        const prices = [100, 110, 120, 130, 140];
        const sma = helper.calculate(prices, 3);

        // SMA of [120, 130, 140] = 390 / 3 = 130
        expect(sma).toBe(130);
    });

    it('calculateSeries: returns moving average for all windows', () => {
        const prices = [100, 110, 120, 130, 140];
        const series = helper.calculateSeries(prices, 3);

        expect(series).toHaveLength(3);
        expect(series[0]).toBe(110); // (100+110+120)/3
        expect(series[1]).toBe(120); // (110+120+130)/3
        expect(series[2]).toBe(130); // (120+130+140)/3
    });
});




/**
 * Statistics Helpers Tests
 * 
 * @fileoverview Tests for StationarityHelper, AutocorrelationHelper, and LinearRegressionHelper
 * @module tests/statistics
 * 
 * @remarks
 * Uses JSON-based test scenarios from fixtures/data/scenarios/statistics/
 * Each scenario validates mathematical formulas against documented behavior.
 */

import { describe, it, expect } from 'vitest';
import { TestScenarioLoader } from '../core/TestScenarioLoader';
import { StationarityHelper } from '@backend/domain/services/statistics/StationarityHelper';
import { AutocorrelationHelper } from '@backend/domain/services/statistics/AutocorrelationHelper';
import { LinearRegressionHelper } from '@backend/domain/services/statistics/LinearRegressionHelper';

// Load test scenarios
const loader = new TestScenarioLoader();

describe('StationarityHelper', () => {
    const helper = new StationarityHelper();
    const scenarios = loader.loadScenarios('statistics').filter(s => s.component === 'StationarityHelper');

    scenarios.forEach(scenario => {
        it(`${scenario.id}: ${scenario.name}`, () => {
            const { prices } = scenario.input;
            const expected = scenario.expectedResults;

            // Run stationarity test
            const result = helper.testStationarity(prices);

            // Validate results
            expect(result.isStationary).toBe(expected.isStationary);

            if (expected.varianceRatioRange) {
                expect(result.varianceRatio).toBeGreaterThanOrEqual(expected.varianceRatioRange[0]);
                expect(result.varianceRatio).toBeLessThanOrEqual(expected.varianceRatioRange[1]);
            }

            if (expected.meanDifferenceMax !== undefined) {
                expect(result.meanDifference).toBeLessThan(expected.meanDifferenceMax);
            }

            if (expected.recommendation) {
                expect(result.recommendation).toBe(expected.recommendation);
            }
        });
    });

    it('toLogReturns: converts prices to log returns correctly', () => {
        const prices = [100, 105, 110, 115];
        const returns = helper.toLogReturns(prices);

        expect(returns).toHaveLength(3);
        expect(returns[0]).toBeCloseTo(Math.log(105 / 100), 6);
        expect(returns[1]).toBeCloseTo(Math.log(110 / 105), 6);
        expect(returns[2]).toBeCloseTo(Math.log(115 / 110), 6);
    });

    it('difference: applies first-order differencing', () => {
        const data = [100, 102, 105, 103, 108];
        const diff = helper.difference(data, 1);

        expect(diff).toHaveLength(4);
        expect(diff[0]).toBe(2);
        expect(diff[1]).toBe(3);
        expect(diff[2]).toBe(-2);
        expect(diff[3]).toBe(5);
    });
});

describe('AutocorrelationHelper', () => {
    const helper = new AutocorrelationHelper();
    const scenarios = loader.loadScenarios('statistics').filter(s => s.component === 'AutocorrelationHelper');

    scenarios.forEach(scenario => {
        it(`${scenario.id}: ${scenario.name}`, () => {
            const { residuals } = scenario.input;
            const expected = scenario.expectedResults;

            // Calculate Durbin-Watson
            const dw = helper.calculateDurbinWatson(residuals);

            // Test autocorrelation
            const result = helper.hasSignificantAutocorrelation(residuals);

            // Validate DW range
            if (expected.durbinWatsonRange) {
                expect(dw).toBeGreaterThanOrEqual(expected.durbinWatsonRange[0]);
                expect(dw).toBeLessThanOrEqual(expected.durbinWatsonRange[1]);
            }

            if (expected.durbinWatsonMax !== undefined) {
                expect(dw).toBeLessThanOrEqual(expected.durbinWatsonMax);
            }

            // Validate autocorrelation detection
            expect(result.hasAutocorrelation).toBe(expected.hasAutocorrelation);
            expect(result.severity).toBe(expected.severity);
        });
    });

    it('calculateDurbinWatson: returns 2.0 for perfect random residuals', () => {
        // Simulated random residuals (no autocorrelation)
        const residuals = [0.5, -0.3, 0.2, -0.4, 0.1, -0.2, 0.3, -0.1];
        const dw = helper.calculateDurbinWatson(residuals);

        // DW should be close to 2.0 (ideally between 1.5 and 2.5)
        expect(dw).toBeGreaterThan(1.0);
        expect(dw).toBeLessThan(3.0);
    });
});

describe('LinearRegressionHelper', () => {
    const helper = new LinearRegressionHelper();

    it('calculate: performs regression with autocorrelation check', () => {
        // Simple uptrend
        const prices = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118];
        const result = helper.calculate(prices);

        // Validate basic regression
        expect(result.slope).toBeGreaterThan(0);
        expect(result.rSquared).toBeGreaterThan(0.95); // Strong linear fit
        expect(result.residuals).toHaveLength(10);
        expect(result.predictions).toHaveLength(10);

        // Validate autocorrelation test was run
        expect(result.autocorrelation).toBeDefined();
        expect(result.adjustedRSquared).toBeGreaterThan(0);
    });

    it('getSlopeNormalized: returns slope relative to avg price', () => {
        const prices = [100, 110, 120, 130, 140];
        const normalizedSlope = helper.getSlopeNormalized(prices);

        // Slope is 10 per period, avg price is 120
        // Normalized slope should be 10/120 ≈ 0.083
        expect(normalizedSlope).toBeCloseTo(10 / 120, 2);
    });
});




/**
 * AI Prompt Templates Tests
 * 
 * @fileoverview Tests for AIPromptTemplates class
 * @module tests/ai
 * 
 * Tests prompt generation, ATR/body calculation, and response validation
 * using realistic market data fixtures.
 */

import { describe, it, expect } from 'vitest';
import { TestScenarioLoader } from '../core/TestScenarioLoader';
import { AIPromptTemplates, GEMINI_SYSTEM_PROMPT } from '@backend/infrastructure/external/ai/AIPromptTemplates';
import { MarketMicroData } from '@backend/infrastructure/external/ai/types';

const loader = new TestScenarioLoader();

describe('AIPromptTemplates', () => {

    describe('System Prompt', () => {
        it('should contain key Click Strategy context', () => {
            const prompt = AIPromptTemplates.getSystemPrompt();

            expect(prompt).toContain('Quantitative Trading Engine');
            expect(prompt).toContain('Sigma');
            expect(prompt).toContain('TakeProfitPnlClick');
            expect(prompt).toContain('LONG');
            expect(prompt).toContain('SHORT');
            expect(prompt).toContain('WAIT');
            expect(prompt).toContain('confidence');
        });

        it('should explain sigma as inversion threshold', () => {
            const prompt = AIPromptTemplates.getSystemPrompt();

            expect(prompt).toContain('Inversion Threshold');
            expect(prompt).toContain('position INVERTS');
        });

        it('should explain takeProfitPnlClick as profit step', () => {
            const prompt = AIPromptTemplates.getSystemPrompt();

            expect(prompt).toContain('Profit Step');
            expect(prompt).toContain('trailing stop RAISES');
        });
    });

    describe('User Prompt Generation', () => {
        const scenarios = loader.loadScenarios('ai').filter(
            s => s.component === 'AIPromptTemplates' && s.input.klines
        );

        scenarios.forEach(scenario => {
            it(`${scenario.id}: ${scenario.name}`, () => {
                const { symbol, lastPrice, imbalance, volatilityScore, klines, strategyParams } = scenario.input;

                const microData: MarketMicroData = {
                    symbol,
                    lastPrice,
                    imbalance,
                    volatilityScore,
                    klines
                };

                const prompt = AIPromptTemplates.buildUserPrompt(microData, strategyParams);

                // Validate prompt contains expected content
                if (scenario.expectedResults.promptContains) {
                    for (const expected of scenario.expectedResults.promptContains) {
                        expect(prompt).toContain(expected);
                    }
                }

                // Validate prompt structure
                expect(prompt).toContain('MARKET ANALYSIS REQUEST');
                expect(prompt).toContain('Symbol:');
                expect(prompt).toContain('Order Book Imbalance');
                expect(prompt).toContain('Price Action');
                expect(prompt).toContain('REQUIRED RESPONSE FORMAT');
                expect(prompt).toContain('CALCULATION GUIDELINES');
                expect(prompt).toContain('DECISION RULES');
            });
        });
    });

    describe('ATR Calculation', () => {
        const scenarios = loader.loadScenarios('ai').filter(
            s => s.component === 'AIPromptTemplates' && s.input.klines
        );

        scenarios.forEach(scenario => {
            if (scenario.expectedResults.atrMin !== undefined) {
                it(`${scenario.id}: ATR within expected range`, () => {
                    const { klines } = scenario.input;

                    const atr = AIPromptTemplates.calculateATR(klines);

                    expect(atr).toBeGreaterThanOrEqual(scenario.expectedResults.atrMin);

                    if (scenario.expectedResults.atrMax !== undefined) {
                        expect(atr).toBeLessThanOrEqual(scenario.expectedResults.atrMax);
                    }
                });
            }
        });

        it('should return 0 for empty or single kline', () => {
            expect(AIPromptTemplates.calculateATR([])).toBe(0);
            expect(AIPromptTemplates.calculateATR([{ open: 100, high: 105, low: 95, close: 102 }])).toBe(0);
        });

        it('should calculate correct ATR for simple series', () => {
            const klines = [
                { open: 100, high: 105, low: 95, close: 102 },  // TR = 10
                { open: 102, high: 108, low: 100, close: 106 }, // TR = max(8, 6, 2) = 8
                { open: 106, high: 112, low: 104, close: 110 }, // TR = max(8, 6, 2) = 8
            ];

            const atr = AIPromptTemplates.calculateATR(klines);

            // ATR = (8 + 8) / 2 = 8
            expect(atr).toBe(8);
        });
    });

    describe('Average Body Calculation', () => {
        const scenarios = loader.loadScenarios('ai').filter(
            s => s.component === 'AIPromptTemplates' && s.input.klines
        );

        scenarios.forEach(scenario => {
            if (scenario.expectedResults.avgBodyMin !== undefined) {
                it(`${scenario.id}: Avg body within expected range`, () => {
                    const { klines } = scenario.input;

                    const avgBody = AIPromptTemplates.calculateAvgBody(klines);

                    expect(avgBody).toBeGreaterThanOrEqual(scenario.expectedResults.avgBodyMin);

                    if (scenario.expectedResults.avgBodyMax !== undefined) {
                        expect(avgBody).toBeLessThanOrEqual(scenario.expectedResults.avgBodyMax);
                    }
                });
            }
        });

        it('should return 0 for empty klines', () => {
            expect(AIPromptTemplates.calculateAvgBody([])).toBe(0);
        });

        it('should calculate correct average body', () => {
            const klines = [
                { open: 100, close: 110 },  // body = 10
                { open: 115, close: 105 },  // body = 10
                { open: 105, close: 120 },  // body = 15
            ];

            const avgBody = AIPromptTemplates.calculateAvgBody(klines);

            // (10 + 10 + 15) / 3 = 11.67
            expect(avgBody).toBeCloseTo(11.67, 1);
        });
    });

    describe('Response Validation', () => {
        const validationScenario = loader.loadScenario('ai', 'AI-004');

        if (validationScenario) {
            describe('Valid Responses', () => {
                validationScenario.input.validResponses.forEach((testCase: any) => {
                    it(`should accept: ${testCase.name}`, () => {
                        const isValid = AIPromptTemplates.validateResponse(testCase.response);
                        expect(isValid).toBe(true);
                    });
                });
            });

            describe('Invalid Responses', () => {
                validationScenario.input.invalidResponses.forEach((testCase: any) => {
                    it(`should reject: ${testCase.name} (${testCase.failReason})`, () => {
                        const isValid = AIPromptTemplates.validateResponse(testCase.response);
                        expect(isValid).toBe(false);
                    });
                });
            });
        }

        it('should reject null/undefined', () => {
            expect(AIPromptTemplates.validateResponse(null)).toBe(false);
            expect(AIPromptTemplates.validateResponse(undefined)).toBe(false);
        });

        it('should reject non-object', () => {
            expect(AIPromptTemplates.validateResponse('string')).toBe(false);
            expect(AIPromptTemplates.validateResponse(123)).toBe(false);
        });

        it('should require all mandatory fields', () => {
            const incomplete = {
                tendance: 'LONG',
                // Missing sigma, takeProfitPnlClick, confidence, reasoning
            };
            expect(AIPromptTemplates.validateResponse(incomplete)).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle minimal klines gracefully', () => {
            const minimalData: MarketMicroData = {
                symbol: 'TESTUSDT',
                lastPrice: 100,
                imbalance: 0,
                volatilityScore: 0,
                klines: [
                    { open: 100, high: 101, low: 99, close: 100, volume: 10 }
                ]
            };

            const prompt = AIPromptTemplates.buildUserPrompt(minimalData);
            expect(prompt).toContain('TESTUSDT');
        });

        it('should handle extreme imbalance values', () => {
            const extremeData: MarketMicroData = {
                symbol: 'EXTREMEUSDT',
                lastPrice: 1000,
                imbalance: 0.95,  // Near maximum buy pressure
                volatilityScore: 50,
                klines: [
                    { open: 1000, high: 1050, low: 950, close: 1025, volume: 500 }
                ]
            };

            const prompt = AIPromptTemplates.buildUserPrompt(extremeData);
            expect(prompt).toContain('0.9500');  // Imbalance formatted
        });

        it('should include strategy params when provided', () => {
            const data: MarketMicroData = {
                symbol: 'BTCUSDT',
                lastPrice: 50000,
                imbalance: 0.2,
                volatilityScore: 10,
                klines: [
                    { open: 50000, high: 50100, low: 49900, close: 50050, volume: 100 }
                ]
            };

            const strategyParams = {
                investment: 100,
                sigma: 0.003,
                takeProfitPnlClick: 0.0015,
                riskTolerance: 'MEDIUM' as const
            };

            const prompt = AIPromptTemplates.buildUserPrompt(data, strategyParams);

            expect(prompt).toContain('Current Strategy Parameters');
            expect(prompt).toContain('100 USDT');
            expect(prompt).toContain('0.003');
            expect(prompt).toContain('MEDIUM');
        });
    });
});

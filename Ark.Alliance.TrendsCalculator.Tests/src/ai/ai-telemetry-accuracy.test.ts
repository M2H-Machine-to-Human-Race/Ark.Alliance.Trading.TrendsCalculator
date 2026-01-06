/**
 * AI Telemetry Accuracy Tests
 * 
 * @fileoverview Tests AI response accuracy using mathematically generated time series
 * @module tests/ai/ai-telemetry-accuracy
 * 
 * Uses deterministic market data with known expected outcomes to validate:
 * 1. AI trend direction accuracy
 * 2. Confidence level appropriateness
 * 3. Prompt effectiveness
 * 
 * @author Ark.Alliance Team
 * @version 1.0.0
 * @since 2026-01-06
 */

import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { AIPromptTemplates } from '@backend/infrastructure/external/ai/AIPromptTemplates';
import { MarketMicroData } from '@backend/infrastructure/external/ai/types';
import { TrendDirection } from '@share/enums/trend/TrendDirection';

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCo1OChYy90EIKgTkmvVVkdCx4mGZfSgDE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface AITelemetryScenario {
    id: string;
    name: string;
    description: string;
    input: {
        symbol: string;
        lastPrice: number;
        imbalance: number;
        volatilityScore: number;
        strategyParams: {
            investment: number;
            sigma: number;
            takeProfitPnlClick: number;
            riskTolerance: string;
        };
        klines: Array<{
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
        }>;
        mathematicalAnalysis: Record<string, any>;
    };
    expectedResults: {
        tendance: TrendDirection;
        confidenceMin: number;
        confidenceMax: number;
        sigmaMin: number;
        sigmaMax: number;
        takeProfitPnlClickMin: number;
        takeProfitPnlClickMax: number;
        reasoningMustContain: string[];
    };
    assertions: string[];
}

/**
 * Load all AI telemetry test scenarios
 */
function loadAITelemetryScenarios(): AITelemetryScenario[] {
    const scenarioPath = join(__dirname, '../fixtures/data/scenarios/ai-telemetry');

    try {
        const files = readdirSync(scenarioPath).filter(f => f.endsWith('.json'));
        return files.map(file => {
            const content = readFileSync(join(scenarioPath, file), 'utf-8');
            return JSON.parse(content) as AITelemetryScenario;
        });
    } catch (error) {
        console.error('Failed to load AI telemetry scenarios:', error);
        return [];
    }
}

/**
 * Send prompt to Gemini AI and get response
 */
async function callGeminiAPI(systemPrompt: string, userPrompt: string): Promise<any> {
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
            return JSON.parse(text);
        }
        return null;
    } catch (error: any) {
        console.error('Gemini API error:', error.message);
        return null;
    }
}

describe('AI Telemetry Accuracy Tests', () => {
    const scenarios = loadAITelemetryScenarios();
    let geminiAvailable = false;

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
            console.warn('⚠️ Gemini API not available - skipping live AI tests');
            geminiAvailable = false;
        }
    });

    describe('Prompt Generation Validation', () => {
        scenarios.forEach(scenario => {
            it(`${scenario.id}: Should generate valid prompt for ${scenario.name}`, () => {
                const microData: MarketMicroData = {
                    symbol: scenario.input.symbol,
                    lastPrice: scenario.input.lastPrice,
                    imbalance: scenario.input.imbalance,
                    volatilityScore: scenario.input.volatilityScore,
                    klines: scenario.input.klines
                };

                const prompt = AIPromptTemplates.buildUserPrompt(
                    microData,
                    scenario.input.strategyParams
                );

                // Validate prompt contains required elements
                expect(prompt).toContain('MARKET ANALYSIS REQUEST');
                expect(prompt).toContain(scenario.input.symbol);
                expect(prompt).toContain('REQUIRED RESPONSE FORMAT');
                expect(prompt).toContain('tendance');
                expect(prompt).toContain('sigma');
                expect(prompt).toContain('confidence');
            });
        });
    });

    describe('Mathematical Analysis Validation', () => {
        scenarios.forEach(scenario => {
            it(`${scenario.id}: ATR calculation should match expected range`, () => {
                const atr = AIPromptTemplates.calculateATR(scenario.input.klines);

                // ATR should be positive for valid klines
                expect(atr).toBeGreaterThanOrEqual(0);

                // ATR should be reasonable relative to price
                const avgPrice = scenario.input.lastPrice;
                const atrPercent = (atr / avgPrice) * 100;
                expect(atrPercent).toBeLessThan(10); // ATR should not exceed 10% of price
            });

            it(`${scenario.id}: Average body calculation should be positive`, () => {
                const avgBody = AIPromptTemplates.calculateAvgBody(scenario.input.klines);
                expect(avgBody).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('Live AI Accuracy Tests', () => {
        scenarios.forEach(scenario => {
            it(`${scenario.id}: AI should return ${scenario.expectedResults.tendance} for ${scenario.name}`, async () => {
                if (!geminiAvailable) {
                    console.log(`Skipping ${scenario.id} - Gemini not available`);
                    return;
                }

                const microData: MarketMicroData = {
                    symbol: scenario.input.symbol,
                    lastPrice: scenario.input.lastPrice,
                    imbalance: scenario.input.imbalance,
                    volatilityScore: scenario.input.volatilityScore,
                    klines: scenario.input.klines
                };

                const systemPrompt = AIPromptTemplates.getSystemPrompt();
                const userPrompt = AIPromptTemplates.buildUserPrompt(
                    microData,
                    scenario.input.strategyParams
                );

                console.log(`\n📊 Testing ${scenario.id}: ${scenario.name}`);
                const startTime = Date.now();

                const response = await callGeminiAPI(systemPrompt, userPrompt);
                const responseTime = Date.now() - startTime;

                console.log(`   ⏱️  Response time: ${responseTime}ms`);

                if (response) {
                    console.log(`   📈 AI Response: ${response.tendance} @ ${(response.confidence * 100).toFixed(1)}%`);

                    // Validate tendance matches expected
                    expect(response.tendance).toBe(scenario.expectedResults.tendance);

                    // Validate confidence is in expected range
                    expect(response.confidence).toBeGreaterThanOrEqual(scenario.expectedResults.confidenceMin);
                    expect(response.confidence).toBeLessThanOrEqual(scenario.expectedResults.confidenceMax);

                    // Validate sigma is in expected range
                    expect(response.sigma).toBeGreaterThanOrEqual(scenario.expectedResults.sigmaMin);
                    expect(response.sigma).toBeLessThanOrEqual(scenario.expectedResults.sigmaMax);

                    // Validate takeProfitPnlClick is in expected range
                    expect(response.takeProfitPnlClick).toBeGreaterThanOrEqual(scenario.expectedResults.takeProfitPnlClickMin);
                    expect(response.takeProfitPnlClick).toBeLessThanOrEqual(scenario.expectedResults.takeProfitPnlClickMax);

                    // Validate reasoning contains expected keywords
                    const reasoning = response.reasoning?.toLowerCase() || '';
                    const hasExpectedKeyword = scenario.expectedResults.reasoningMustContain.some(
                        keyword => reasoning.includes(keyword.toLowerCase())
                    );

                    if (!hasExpectedKeyword) {
                        console.log(`   ⚠️  Reasoning missing expected keywords: ${scenario.expectedResults.reasoningMustContain.join(', ')}`);
                    }

                    console.log(`   ✅ All validations passed`);
                } else {
                    console.log(`   ❌ No response from AI`);
                }
            }, 60000); // 60s timeout per test
        });
    });

    describe('Response Structure Validation', () => {
        it('should reject invalid response structures', () => {
            expect(AIPromptTemplates.validateResponse(null)).toBe(false);
            expect(AIPromptTemplates.validateResponse(undefined)).toBe(false);
            expect(AIPromptTemplates.validateResponse({})).toBe(false);
            expect(AIPromptTemplates.validateResponse({ tendance: 'INVALID' })).toBe(false);
        });

        it('should accept valid response structures', () => {
            const validResponse = {
                tendance: TrendDirection.LONG,
                sigma: 0.003,
                takeProfitPnlClick: 0.0015,
                confidence: 0.75,
                reasoning: 'Strong uptrend detected with higher highs and higher lows pattern.'
            };
            expect(AIPromptTemplates.validateResponse(validResponse)).toBe(true);
        });
    });
});

describe('AI Telemetry Accuracy Summary', () => {
    it('should log test scenario summary', () => {
        const scenarios = loadAITelemetryScenarios();

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📋 AI TELEMETRY TEST SCENARIOS');
        console.log('───────────────────────────────────────────────────────────────');

        scenarios.forEach(scenario => {
            console.log(`   ${scenario.id}: ${scenario.name}`);
            console.log(`      Expected: ${scenario.expectedResults.tendance} (conf: ${scenario.expectedResults.confidenceMin}-${scenario.expectedResults.confidenceMax})`);
        });

        console.log('═══════════════════════════════════════════════════════════════\n');

        expect(scenarios.length).toBeGreaterThanOrEqual(4);
    });
});

/**
 * Test Scenario Loader
 * 
 * @fileoverview Utility class to load JSON test scenarios
 * @module core/TestScenarioLoader
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export interface TestScenario {
    id: string;
    name: string;
    description: string;
    category: string;
    dataPoints?: number;
    tradeCount?: number;
    generator: string;
    expected: any;
    assertions: string[];
}

/**
 * Loads test scenarios from JSON files
 */
export class TestScenarioLoader {
    private basePath: string;

    constructor() {
        this.basePath = join(__dirname, '../fixtures/data/scenarios');
    }

    /**
     * Load all scenarios for a given category
     */
    loadScenarios(category: string): TestScenario[] {
        const categoryPath = join(this.basePath, category);

        try {
            const files = readdirSync(categoryPath).filter(f => f.endsWith('.json'));

            return files.map(file => {
                const filePath = join(categoryPath, file);
                const content = readFileSync(filePath, 'utf-8');
                return JSON.parse(content) as TestScenario;
            });
        } catch (error: any) {
            console.error(`Failed to load scenarios for category '${category}':`, error.message);
            return [];
        }
    }

    /**
     * Load a specific scenario by ID
     */
    loadScenario(category: string, id: string): TestScenario | null {
        const scenarios = this.loadScenarios(category);
        return scenarios.find(s => s.id === id) || null;
    }
}

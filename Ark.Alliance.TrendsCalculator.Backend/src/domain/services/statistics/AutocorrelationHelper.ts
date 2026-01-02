/**
 * @fileoverview Autocorrelation Helper
 * @module helpers/statistics/AutocorrelationHelper
 * 
 * Tests for autocorrelation in time series residuals and adjusts R² accordingly.
 * 
 * @reference Docs/Math/Autocorrelation_Testing.md
 * @criticality CRITICAL
 * 
 * Key Concepts:
 * - Autocorrelation violates independence assumption of regression
 * - Durbin-Watson test detects first-order autocorrelation
 * - DW ≈ 2 is ideal (no autocorrelation)
 * - If DW < 1.5 or DW > 2.5, R² is inflated and must be adjusted
 */

export type AutocorrelationSeverity = 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';

export interface AutocorrelationTestResult {
    hasAutocorrelation: boolean;
    durbinWatson: number;
    firstOrderCorr: number;
    severity: AutocorrelationSeverity;
}

export interface LjungBoxTestResult {
    statistic: number;
    pValue: number;
    hasAutocorrelation: boolean;
}

export class AutocorrelationHelper {
    /**
     * Calculate Durbin-Watson statistic
     * Tests for first-order autocorrelation in residuals
     * 
     * Formula: DW = Σ(e(t) - e(t-1))² / Σe(t)²
     * 
     * Interpretation:
     * - DW ≈ 0: Strong positive autocorrelation
     * - DW ≈ 2: No autocorrelation (ideal)
     * - DW ≈ 4: Strong negative autocorrelation
     * 
     * @param residuals - Regression residuals
     * @returns Durbin-Watson statistic [0, 4]
     */
    calculateDurbinWatson(residuals: number[]): number {
        if (residuals.length < 2) {
            return 2.0; // No autocorrelation by default
        }

        let sumSquaredDiff = 0;
        let sumSquared = 0;

        // Calculate sum of squared differences
        for (let i = 1; i < residuals.length; i++) {
            sumSquaredDiff += Math.pow(residuals[i] - residuals[i - 1], 2);
        }

        // Calculate sum of squared residuals
        for (const residual of residuals) {
            sumSquared += Math.pow(residual, 2);
        }

        if (sumSquared === 0) {
            return 2.0; // No variation in residuals
        }

        return sumSquaredDiff / sumSquared;
    }

    /**
     * Calculate first-order autocorrelation coefficient
     * 
     * Formula: ρ = Σ(x(t) * x(t-1)) / Σx(t)²
     * 
     * @param data - Time series data or residuals
     * @returns Autocorrelation coefficient [-1, 1]
     */
    calculateFirstOrderAutocorrelation(data: number[]): number {
        if (data.length < 2) {
            return 0;
        }

        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const centered = data.map(d => d - mean);

        let numerator = 0;
        let denominator = 0;

        // Calculate correlation between t and t-1
        for (let i = 1; i < centered.length; i++) {
            numerator += centered[i] * centered[i - 1];
        }

        // Calculate sum of squares
        for (const c of centered) {
            denominator += c * c;
        }

        if (denominator === 0) {
            return 0;
        }

        return numerator / denominator;
    }

    /**
     * Calculate autocorrelation at specific lag
     * 
     * @param data - Time series data
     * @param lag - Lag period
     * @returns Autocorrelation coefficient at lag k
     */
    private calculateAutocorrelationAtLag(data: number[], lag: number): number {
        if (lag >= data.length || lag < 1) {
            return 0;
        }

        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const centered = data.map(d => d - mean);

        let numerator = 0;
        let denominator = 0;

        for (let i = lag; i < centered.length; i++) {
            numerator += centered[i] * centered[i - lag];
        }

        for (const c of centered) {
            denominator += c * c;
        }

        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * Ljung-Box Q statistic
     * Tests H₀: no autocorrelation up to lag k
     * 
     * More comprehensive than Durbin-Watson as it tests multiple lags
     * 
     * @param residuals - Regression residuals
     * @param maxLag - Maximum lag to test (default: 10)
     * @returns Test results with statistic and p-value
     */
    calculateLjungBox(residuals: number[], maxLag: number = 10): LjungBoxTestResult {
        if (residuals.length < maxLag + 1) {
            return {
                statistic: 0,
                pValue: 1.0,
                hasAutocorrelation: false
            };
        }

        const n = residuals.length;
        let qStatistic = 0;

        for (let k = 1; k <= maxLag; k++) {
            const rk = this.calculateAutocorrelationAtLag(residuals, k);
            qStatistic += (rk * rk) / (n - k);
        }

        qStatistic *= n * (n + 2);

        // Critical value for chi-squared, df=maxLag, α=0.05
        // For df=10: critical value ≈ 18.31
        const criticalValue = 18.31;

        return {
            statistic: qStatistic,
            pValue: qStatistic > criticalValue ? 0.01 : 0.10,
            hasAutocorrelation: qStatistic > criticalValue
        };
    }

    /**
     * Check if autocorrelation is significant
     * 
     * Decision Rules:
     * - DW < 1.0 or DW > 3.0: SEVERE
     * - DW < 1.5 or DW > 2.5: MODERATE
     * - DW < 1.7 or DW > 2.3: MILD
     * - 1.7 ≤ DW ≤ 2.3: NONE
     * 
     * @param residuals - Regression residuals
     * @returns Detailed autocorrelation test results
     */
    hasSignificantAutocorrelation(residuals: number[]): AutocorrelationTestResult {
        const dw = this.calculateDurbinWatson(residuals);
        const foCorr = this.calculateFirstOrderAutocorrelation(residuals);

        let severity: AutocorrelationSeverity = 'NONE';
        let hasAutocorrelation = false;

        if (dw < 1.0 || dw > 3.0) {
            severity = 'SEVERE';
            hasAutocorrelation = true;
        } else if (dw < 1.5 || dw > 2.5) {
            severity = 'MODERATE';
            hasAutocorrelation = true;
        } else if (dw < 1.7 || dw > 2.3) {
            severity = 'MILD';
            hasAutocorrelation = true;
        }

        return {
            hasAutocorrelation,
            durbinWatson: dw,
            firstOrderCorr: foCorr,
            severity
        };
    }

    /**
     * Adjust R² for autocorrelation
     * Uses a simplified correction factor based on effective sample size
     * 
     * The true effective sample size is reduced by autocorrelation:
     * effectiveN = n * (1 - ρ) / (1 + ρ)
     * 
     * @param rSquared - Original R² value
     * @param durbinWatson - Durbin-Watson statistic
     * @param n - Sample size
     * @returns Adjusted R² value
     */
    adjustRSquaredForAutocorrelation(
        rSquared: number,
        durbinWatson: number,
        n: number
    ): number {
        // Estimate first-order autocorrelation from DW
        // Relationship: DW ≈ 2(1 - ρ)
        const rho = 1 - (durbinWatson / 2);

        // Simplified adjustment
        // True effective sample size is reduced by autocorrelation
        const effectiveN = n * (1 - rho) / (1 + rho);
        const adjustmentFactor = effectiveN / n;

        // Apply adjustment (bounded)
        return Math.max(0, rSquared * adjustmentFactor);
    }

    /**
     * Get recommended action based on autocorrelation test
     * 
     * @param testResult - Autocorrelation test results
     * @returns Recommendation string
     */
    getRecommendation(testResult: AutocorrelationTestResult): string {
        if (testResult.severity === 'NONE') {
            return 'No significant autocorrelation detected. Results are reliable.';
        } else if (testResult.severity === 'MILD') {
            return `Mild autocorrelation (DW=${testResult.durbinWatson.toFixed(2)}). Consider adjusting R².`;
        } else if (testResult.severity === 'MODERATE') {
            return `Moderate autocorrelation (DW=${testResult.durbinWatson.toFixed(2)}). R² adjustment recommended.`;
        } else {
            return `Severe autocorrelation (DW=${testResult.durbinWatson.toFixed(2)}). Results may be unreliable. Consider data transformation.`;
        }
    }
}

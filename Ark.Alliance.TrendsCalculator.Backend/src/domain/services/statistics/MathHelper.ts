/**
 * @fileoverview Math Helper Utilities
 * @module helpers/math/MathHelper
 * 
 * Linear Algebra and Numerical Methods utilities.
 * 
 * @refactored Copied from TimeSeries.Service
 */

/**
 * Math Utilities for Linear Algebra and Numerical Methods
 */
export class MathHelper {
    /**
     * Solves a Symmetric Positive Definite (SPD) system Ax = b using Cholesky decomposition.
     * Uses a tiny jitter on the diagonal for stability if needed.
     * @param A The SPD matrix (n x n).
     * @param b The right-hand side vector (n).
     * @returns The solution vector x.
     */
    static solveSPD(A: number[][], b: number[]): number[] {
        const n = b.length;
        const M = A.map((row) => [...row]);
        const L = Array(n)
            .fill(0)
            .map(() => Array(n).fill(0));

        // Jitter to help SPD if marginally ill-conditioned
        for (let i = 0; i < n; i++) {
            M[i][i] += 1e-12;
        }

        // Cholesky decomposition: M = L * L^T
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
                let sum = M[i][j];
                for (let k = 0; k < j; k++) {
                    sum -= L[i][k] * L[j][k];
                }

                if (i === j) {
                    if (sum <= 0) sum = 1e-12;
                    L[i][j] = Math.sqrt(sum);
                } else {
                    L[i][j] = sum / L[j][j];
                }
            }
        }

        // Solve L * y = b (Forward substitution)
        const y = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            let sum = b[i];
            for (let k = 0; k < i; k++) {
                sum -= L[i][k] * y[k];
            }
            y[i] = sum / L[i][i];
        }

        // Solve L^T * x = y (Backward substitution)
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = y[i];
            for (let k = i + 1; k < n; k++) {
                sum -= L[k][i] * x[k];
            }
            x[i] = sum / L[i][i];
        }

        return x;
    }

    /**
     * Builds an Identity matrix of size p.
     */
    static buildIdentity(p: number): number[][] {
        const I = Array(p)
            .fill(0)
            .map(() => Array(p).fill(0));
        for (let i = 0; i < p; i++) I[i][i] = 1.0;
        return I;
    }

    /**
     * Builds the second-difference penalty matrix R = D^T D.
     * Used for P-Splines style regularization (smoothness of coefficients).
     */
    static buildSecondDifferencePenalty(p: number): number[][] {
        if (p <= 2) return this.buildIdentity(p);

        const R = Array(p)
            .fill(0)
            .map(() => Array(p).fill(0));

        for (let i = 0; i < p - 2; i++) {
            R[i][i] += 1.0;
            R[i][i + 1] += -2.0;
            R[i][i + 2] += 1.0;

            R[i + 1][i] += -2.0;
            R[i + 1][i + 1] += 4.0;
            R[i + 1][i + 2] += -2.0;

            R[i + 2][i] += 1.0;
            R[i + 2][i + 1] += -2.0;
            R[i + 2][i + 2] += 1.0;
        }
        return R;
    }

    /**
     * Calculate mean of an array
     */
    static mean(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Calculate standard deviation
     */
    static standardDeviation(values: number[]): number {
        if (values.length < 2) return 0;
        const avg = this.mean(values);
        const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }

    /**
     * Calculate variance
     */
    static variance(values: number[]): number {
        if (values.length < 2) return 0;
        const avg = this.mean(values);
        const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
        return this.mean(squareDiffs);
    }

    /**
     * Calculate covariance between two arrays
     */
    static covariance(x: number[], y: number[]): number {
        if (x.length !== y.length || x.length < 2) return 0;
        const xMean = this.mean(x);
        const yMean = this.mean(y);
        let cov = 0;
        for (let i = 0; i < x.length; i++) {
            cov += (x[i] - xMean) * (y[i] - yMean);
        }
        return cov / (x.length - 1);
    }
}

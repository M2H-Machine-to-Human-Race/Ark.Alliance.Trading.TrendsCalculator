/**
 * Backend Test Helper
 * 
 * @fileoverview Utilities for managing backend server during integration tests
 * @module helpers/backend
 * 
 * @remarks
 * Provides:
 * - Backend server startup/shutdown for tests
 * - CI environment detection (GitHub Actions)
 * - Protocol/port alignment verification
 * - Certificate validation
 */

import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import https from 'https';

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const BACKEND_DIR = path.resolve(__dirname, '../../../Ark.Alliance.TrendsCalculator.Backend');
const CERTS_DIR = path.join(BACKEND_DIR, 'certs');
const BACKEND_PORT = 3075;
const STARTUP_TIMEOUT_MS = 15000;
const HEALTH_CHECK_INTERVAL_MS = 500;

// ═══════════════════════════════════════════════════════════════════════════
// CI Environment Detection
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if running in GitHub Actions CI environment
 * @returns true if running on GitHub Actions
 */
export function isGitHubActions(): boolean {
    return process.env.GITHUB_ACTIONS === 'true';
}

/**
 * Check if running in any CI environment
 * @returns true if running in CI
 */
export function isCI(): boolean {
    return !!(
        process.env.CI ||
        process.env.GITHUB_ACTIONS ||
        process.env.TRAVIS ||
        process.env.CIRCLECI ||
        process.env.JENKINS_URL
    );
}

/**
 * Check if integration tests requiring backend should be skipped
 * @returns true if tests should be skipped
 */
export function shouldSkipBackendTests(): boolean {
    // Skip on GitHub Actions - backend can't run there without Docker
    if (isGitHubActions()) {
        console.log('⚠️  Skipping backend tests: Running on GitHub Actions');
        return true;
    }

    // Allow override via environment variable
    if (process.env.SKIP_BACKEND_TESTS === 'true') {
        console.log('⚠️  Skipping backend tests: SKIP_BACKEND_TESTS=true');
        return true;
    }

    return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// Certificate Validation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if SSL certificates exist and are valid
 * @returns Validation result with details
 */
export function validateCertificates(): {
    valid: boolean;
    keyExists: boolean;
    certExists: boolean;
    error?: string;
} {
    const keyPath = path.join(CERTS_DIR, 'server.key');
    const certPath = path.join(CERTS_DIR, 'server.crt');

    const keyExists = fs.existsSync(keyPath);
    const certExists = fs.existsSync(certPath);

    if (!keyExists || !certExists) {
        return {
            valid: false,
            keyExists,
            certExists,
            error: `Missing certificate files: ${!keyExists ? 'server.key ' : ''}${!certExists ? 'server.crt' : ''}`.trim()
        };
    }

    try {
        const keyContent = fs.readFileSync(keyPath, 'utf-8');
        const certContent = fs.readFileSync(certPath, 'utf-8');

        const keyValid = keyContent.includes('-----BEGIN') && keyContent.includes('KEY-----');
        const certValid = certContent.includes('-----BEGIN CERTIFICATE-----');

        if (!keyValid || !certValid) {
            return {
                valid: false,
                keyExists,
                certExists,
                error: 'Certificate files exist but contain invalid content'
            };
        }

        return { valid: true, keyExists, certExists };
    } catch (error: any) {
        return {
            valid: false,
            keyExists,
            certExists,
            error: `Error reading certificates: ${error.message}`
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Backend Server Management
// ═══════════════════════════════════════════════════════════════════════════

let backendProcess: ChildProcess | null = null;

/**
 * Check if backend server is reachable
 * @returns Promise resolving to true if reachable
 */
export async function isBackendReachable(): Promise<boolean> {
    return new Promise((resolve) => {
        const req = https.request(
            {
                hostname: 'localhost',
                port: BACKEND_PORT,
                path: '/api/health',
                method: 'GET',
                rejectUnauthorized: false, // Allow self-signed cert
                timeout: 2000
            },
            (res) => {
                resolve(res.statusCode === 200);
            }
        );

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

/**
 * Wait for backend to become healthy
 * @param timeoutMs - Maximum wait time
 * @returns Promise resolving when healthy or rejecting on timeout
 */
async function waitForBackendHealth(timeoutMs: number = STARTUP_TIMEOUT_MS): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (await isBackendReachable()) {
            return;
        }
        await new Promise(r => setTimeout(r, HEALTH_CHECK_INTERVAL_MS));
    }

    throw new Error(`Backend did not become healthy within ${timeoutMs}ms`);
}

/**
 * Start the backend server
 * @returns Promise resolving when server is ready
 */
export async function startBackend(): Promise<void> {
    // Check if already running
    if (await isBackendReachable()) {
        console.log('✅ Backend already running');
        return;
    }

    // Validate certificates first
    const certValidation = validateCertificates();
    if (!certValidation.valid) {
        console.warn(`⚠️  Certificate issue: ${certValidation.error}`);
        console.log('   Backend will fall back to HTTP mode');
    }

    console.log('🚀 Starting backend server...');

    // Check for node_modules
    const nodeModulesPath = path.join(BACKEND_DIR, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('📦 Installing backend dependencies...');
        execSync('npm install', { cwd: BACKEND_DIR, stdio: 'inherit' });
    }

    // Start the backend
    backendProcess = spawn('npx', ['ts-node-dev', '-r', 'tsconfig-paths/register', 'src/index.ts'], {
        cwd: BACKEND_DIR,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: {
            ...process.env,
            PORT: String(BACKEND_PORT),
            HTTPS_PORT: String(BACKEND_PORT),
            NODE_ENV: 'test'
        }
    });

    // Log output
    backendProcess.stdout?.on('data', (data) => {
        const line = data.toString().trim();
        if (line) console.log(`[Backend] ${line}`);
    });

    backendProcess.stderr?.on('data', (data) => {
        const line = data.toString().trim();
        if (line && !line.includes('ExperimentalWarning')) {
            console.error(`[Backend Error] ${line}`);
        }
    });

    backendProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
            console.error(`[Backend] Process exited with code ${code}`);
        }
        backendProcess = null;
    });

    // Wait for health check
    try {
        await waitForBackendHealth();
        console.log('✅ Backend started and healthy');
    } catch (error) {
        await stopBackend();
        throw error;
    }
}

/**
 * Stop the backend server
 */
export async function stopBackend(): Promise<void> {
    if (backendProcess) {
        console.log('🛑 Stopping backend server...');

        // Send SIGTERM for graceful shutdown
        backendProcess.kill('SIGTERM');

        // Wait for process to exit
        await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
                if (backendProcess) {
                    backendProcess.kill('SIGKILL');
                }
                resolve();
            }, 5000);

            if (backendProcess) {
                backendProcess.on('exit', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            } else {
                clearTimeout(timeout);
                resolve();
            }
        });

        backendProcess = null;
        console.log('✅ Backend stopped');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Protocol/Port Alignment Check
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration alignment check result
 */
export interface AlignmentCheckResult {
    aligned: boolean;
    backend: {
        protocol: 'http' | 'https';
        port: number;
        hasCerts: boolean;
    };
    expected: {
        apiUrl: string;
        wsUrl: string;
    };
    issues: string[];
}

/**
 * Check frontend/backend protocol and port alignment
 * @returns Alignment check result
 */
export function checkProtocolAlignment(): AlignmentCheckResult {
    const certValidation = validateCertificates();
    const issues: string[] = [];

    const backend = {
        protocol: certValidation.valid ? 'https' as const : 'http' as const,
        port: BACKEND_PORT,
        hasCerts: certValidation.valid
    };

    const expected = {
        apiUrl: `https://localhost:${BACKEND_PORT}`,
        wsUrl: `wss://localhost:${BACKEND_PORT}`
    };

    // Check alignment
    if (!backend.hasCerts) {
        issues.push('Backend running in HTTP mode - frontend expects HTTPS');
    }

    return {
        aligned: issues.length === 0,
        backend,
        expected,
        issues
    };
}

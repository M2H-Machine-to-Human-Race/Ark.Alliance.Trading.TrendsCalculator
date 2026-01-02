/**
 * @fileoverview Main Application Entry Point
 * @module index
 * 
 * Trends Calculator Backend Server with HTTP/HTTPS support
 * - Auto-generated self-signed certificates using node-forge
 * - Interactive protocol selection in development
 * - CORS enabled for frontend communication
 * - WebSocket support for real-time updates
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2025-12-28
 */

import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import readline from 'readline';
import apiRoutes from './presentation/api/routes';
import { systemLogger } from '@infrastructure/SystemLogger';
import { DatabaseService } from '@infrastructure/persistence/DatabaseService';
import { setupSwagger } from '@infrastructure/swagger';
import { ServiceInitializer } from '@application/services/ServiceInitializer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Protocol settings - HTTP by default, HTTPS optional
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Middleware - CORS enabled for frontend communication
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger Documentation
setupSwagger(app);

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        protocol: req.secure ? 'https' : 'http',
        uptime: process.uptime(),
        servicesReady: ServiceInitializer.isReady(),
    });
});

/**
 * Delay helper for startup retry.
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Certificate configuration
 */
const CERT_CONFIG = {
    folder: 'Certificate',
    keyFile: 'server.key',
    certFile: 'server.crt',
    validityDays: 365,
    renewBeforeDays: 30 // Renew if less than 30 days remaining
};

/**
 * Check if certificate is expired or about to expire
 */
function isCertificateExpired(certPath: string): boolean {
    try {
        const certContent = fs.readFileSync(certPath, 'utf8');
        const crypto = require('crypto');
        const x509 = new crypto.X509Certificate(certContent);

        const notAfter = new Date(x509.validTo);
        const now = new Date();
        const daysRemaining = Math.floor((notAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        systemLogger.info(`Certificate expires: ${notAfter.toISOString()}`, { source: 'Certificate' });
        systemLogger.info(`Days remaining: ${daysRemaining}`, { source: 'Certificate' });

        if (daysRemaining <= 0) {
            systemLogger.warn('Certificate has expired!', { source: 'Certificate' });
            return true;
        }

        if (daysRemaining <= CERT_CONFIG.renewBeforeDays) {
            systemLogger.warn(`Certificate expires in ${daysRemaining} days - renewal recommended`, { source: 'Certificate' });
            return true;
        }

        return false;
    } catch (error) {
        systemLogger.error('Could not check certificate expiration', { source: 'Certificate', error: error as Error });
        return true; // Assume expired if we can't check
    }
}

/**
 * Get or generate self-signed certificate for HTTPS
 * Uses Certificate folder and checks for expiration
 */
function getOrCreateCertificate(): { key: string | Buffer; cert: string | Buffer } {
    const certDir = path.join(process.cwd(), CERT_CONFIG.folder);
    const keyPath = path.join(certDir, CERT_CONFIG.keyFile);
    const certPath = path.join(certDir, CERT_CONFIG.certFile);

    // Create Certificate directory if it doesn't exist
    if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
        systemLogger.info(`Created Certificate folder: ${certDir}`, { source: 'Certificate' });
    }

    // Check if certs already exist and are valid
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        if (!isCertificateExpired(certPath)) {
            systemLogger.info('Using existing valid certificate from Certificate folder', { source: 'Certificate' });
            return {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };
        }
        systemLogger.info('Certificate expired or about to expire - generating new certificate', { source: 'Certificate' });
    }

    // Generate new certificate using node-forge (synchronous)
    systemLogger.info('Generating new self-signed certificate using node-forge...', { source: 'Certificate' });
    const forge = require('node-forge');
    const pki = forge.pki;

    // Generate RSA key pair
    systemLogger.info('Generating RSA 2048-bit key pair...', { source: 'Certificate' });
    const keys = pki.rsa.generateKeyPair(2048);

    // Create certificate
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + CERT_CONFIG.validityDays);

    const attrs = [
        { name: 'commonName', value: 'localhost' },
        { name: 'organizationName', value: 'Ark.Alliance Trends Calculator Development' },
        { name: 'countryName', value: 'CA' }
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Add extensions
    cert.setExtensions([
        { name: 'basicConstraints', cA: false },
        { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
        { name: 'extKeyUsage', serverAuth: true },
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' }
            ]
        }
    ]);

    // Self-sign the certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // Convert to PEM format
    const privateKeyPem = pki.privateKeyToPem(keys.privateKey);
    const certPem = pki.certificateToPem(cert);

    // Save certificates
    fs.writeFileSync(keyPath, privateKeyPem);
    fs.writeFileSync(certPath, certPem);

    systemLogger.info(`Certificate generated and saved to ${CERT_CONFIG.folder}/`, { source: 'Certificate' });
    systemLogger.info(`Valid until: ${cert.validity.notAfter.toISOString()}`, { source: 'Certificate' });

    return {
        key: privateKeyPem,
        cert: certPem
    };
}

/**
 * Prompt user for protocol selection in interactive dev mode
 */
async function promptProtocolSelection(): Promise<boolean> {
    // Skip prompt if not interactive terminal or CI environment
    if (!process.stdin.isTTY || process.env.CI === 'true') {
        return USE_HTTPS;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║      Ark.Alliance Trends Calculator - Dev Server          ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log('║  Select protocol:                                          ║');
        console.log('║    [1] HTTP  (default, simpler for development)            ║');
        console.log('║    [2] HTTPS (auto-signed certificate)                     ║');
        console.log('╚════════════════════════════════════════════════════════════╝');

        rl.question('\nEnter choice [1/2] (default: 1): ', (answer) => {
            rl.close();
            const useHttps = answer.trim() === '2';
            console.log(`\n→ Selected: ${useHttps ? 'HTTPS' : 'HTTP'}\n`);
            resolve(useHttps);
        });

        // Auto-select HTTP after 5 seconds if no input
        setTimeout(() => {
            console.log('\n→ No input received, defaulting to HTTP\n');
            rl.close();
            resolve(false);
        }, 5000);
    });
}

/**
 * Starts the HTTP server
 */
async function startHttpServer(port: number): Promise<void> {
    const httpServer = http.createServer(app);

    // Initialize Socket.IO with HTTP server
    const { default: socketService } = await import('@infrastructure/socketio');
    socketService.initialize(httpServer);

    httpServer.listen(port, () => {
        console.log('════════════════════════════════════════════════════════════');
        console.log(`  🚀 HTTP Server running on port ${port}`);
        console.log(`  📍 Access at: http://localhost:${port}`);
        console.log(`  📚 API Docs:  http://localhost:${port}/api-docs`);
        console.log(`  🔌 WebSocket: ws://localhost:${port}`);
        console.log('════════════════════════════════════════════════════════════');

        systemLogger.info(`Trends Calculator Backend running on HTTP port ${port}`, {
            source: 'Main'
        });
    });
}

/**
 * Starts the HTTPS server
 */
async function startHttpsServer(port: number): Promise<void> {
    const sslOptions = getOrCreateCertificate();
    const httpsServer = https.createServer(sslOptions, app);

    // Initialize Socket.IO with HTTPS server
    const { default: socketService } = await import('@infrastructure/socketio');
    socketService.initialize(httpsServer);

    httpsServer.listen(port, () => {
        console.log('════════════════════════════════════════════════════════════');
        console.log(`  🔒 HTTPS Server running on port ${port}`);
        console.log(`  📍 Access at: https://localhost:${port}`);
        console.log(`  📚 API Docs:  https://localhost:${port}/api-docs`);
        console.log(`  🔌 WebSocket: wss://localhost:${port}`);
        console.log('  ⚠️  Self-signed certificate - browsers will show warnings');
        console.log('════════════════════════════════════════════════════════════');

        systemLogger.info(`Trends Calculator Backend running on HTTPS port ${port}`, {
            source: 'Main'
        });
    });
}

/**
 * Initialize database
 */
async function initializeDatabase() {
    try {
        const db = DatabaseService.getInstance();
        await db.initialize();

        systemLogger.info('Database initialized successfully', {
            source: 'Main'
        });
    } catch (error: any) {
        systemLogger.error(`Database initialization failed: ${error.message}`, {
            source: 'Main',
            error
        });
    }
}

/**
 * Start server
 */
const startServer = async () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       Ark.Alliance Trading Trends Calculator Backend       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Interactive protocol selection for dev mode
    const useHttps = process.env.NODE_ENV === 'production'
        ? USE_HTTPS  // Use env var in production
        : await promptProtocolSelection();  // Interactive in dev

    // Initialize database
    await initializeDatabase();

    // Initialize all backend services
    try {
        await ServiceInitializer.initializeAll();
    } catch (error: any) {
        systemLogger.error('Failed to initialize services - server startup aborted', {
            source: 'Main',
            error
        });
        console.error('\n❌ FATAL: Service initialization failed. Server cannot start.\n');
        process.exit(1);
    }

    // Start server based on protocol selection
    try {
        if (useHttps) {
            await startHttpsServer(PORT);
        } else {
            await startHttpServer(PORT);
        }
    } catch (error) {
        systemLogger.error(`Failed to start server on port ${PORT}`, { source: 'Main', error: error as Error });
        console.error(`Failed to start server on port ${PORT}:`, error);
    }
};

// Process-level error handlers to prevent crashes
process.on('uncaughtException', (error: Error) => {
    console.error(`[${new Date().toISOString()}] UNCAUGHT EXCEPTION:`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
    systemLogger.error('Uncaught Exception', { source: 'Process', error });
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error(`[${new Date().toISOString()}] UNHANDLED REJECTION:`);
    console.error(`  Reason:`, reason);
    systemLogger.error('Unhandled Rejection', { source: 'Process', details: { reason } });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n📢 SIGTERM received, shutting down gracefully...');
    await ServiceInitializer.shutdownAll();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n📢 SIGINT received, shutting down gracefully...');
    await ServiceInitializer.shutdownAll();
    process.exit(0);
});

startServer();

// Export app for testing
export default app;

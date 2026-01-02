/**
 * @fileoverview Integration Test Utilities
 * @module tests/integration/utils
 * @description
 * Shared utilities for integration testing with live backend
 */

import { io, Socket } from 'socket.io-client';
import axios, { AxiosInstance } from 'axios';
import type { TrendDirection } from '@share/trends';

/**
 * Backend configuration
 */
export const BACKEND_CONFIG = {
    API_URL: process.env.BACKEND_API_URL || 'http://localhost:3075',
    WS_URL: process.env.BACKEND_WS_URL || 'ws://localhost:3075',
    TIMEOUT: 10000,
};

/**
 * Create API client for testing
 */
export function createAPIClient(): AxiosInstance {
    return axios.create({
        baseURL: `${BACKEND_CONFIG.API_URL}/api`,
        timeout: BACKEND_CONFIG.TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Create WebSocket client for testing
 */
export function createWSClient(): Promise<Socket> {
    return new Promise((resolve, reject) => {
        const socket = io(BACKEND_CONFIG.WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: false,
        });

        const timeout = setTimeout(() => {
            socket.close();
            reject(new Error('WebSocket connection timeout'));
        }, BACKEND_CONFIG.TIMEOUT);

        socket.on('connect', () => {
            clearTimeout(timeout);
            resolve(socket);
        });

        socket.on('connect_error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

/**
 * Wait for specific WebSocket event
 */
export function waitForEvent<T = any>(
    socket: Socket,
    eventName: string,
    timeout: number = 5000
): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off(eventName, handler);
            reject(new Error(`Timeout waiting for event: ${eventName}`));
        }, timeout);

        const handler = (data: T) => {
            clearTimeout(timer);
            socket.off(eventName, handler);
            resolve(data);
        };

        socket.on(eventName, handler);
    });
}

/**
 * Test if backend is reachable
 */
export async function isBackendReachable(): Promise<boolean> {
    try {
        const client = createAPIClient();
        const response = await client.get('/health');
        return response.status === 200;
    } catch {
        return false;
    }
}

/**
 * Mock trend data generator
 */
export function generateMockTrendData(symbol: string): {
    symbol: string;
    direction: TrendDirection;
    strength: number;
    timestamp: number;
} {
    const directions: TrendDirection[] = ['LONG', 'SHORT', 'WAIT'];
    return {
        symbol,
        direction: directions[Math.floor(Math.random() * directions.length)],
        strength: Math.random() * 100,
        timestamp: Date.now(),
    };
}

/**
 * Mock symbol list generator
 */
export function generateMockSymbols(count: number = 5): string[] {
    const bases = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOGE', 'XRP', 'DOT'];
    const quotes = ['USDT', 'BUSD', 'BTC', 'ETH'];

    const symbols: string[] = [];
    for (let i = 0; i < count; i++) {
        const base = bases[i % bases.length];
        const quote = quotes[i % quotes.length];
        if (base !== quote) {
            symbols.push(`${base}${quote}`);
        }
    }
    return symbols;
}

/**
 * Clean up test resources
 */
export async function cleanupTestResources(socket?: Socket, symbols: string[] = []): Promise<void> {
    // Disconnect WebSocket
    if (socket?.connected) {
        socket.disconnect();
    }

    // Remove test symbols from backend
    if (symbols.length > 0) {
        const client = createAPIClient();
        for (const symbol of symbols) {
            try {
                await client.delete(`/symbol/${symbol}/track`);
            } catch {
                // Ignore errors during cleanup
            }
        }
    }
}

/**
 * Wait for condition to be true
 */
export async function waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Condition not met within timeout');
}

/**
 * Retry async operation
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Max retries exceeded');
}

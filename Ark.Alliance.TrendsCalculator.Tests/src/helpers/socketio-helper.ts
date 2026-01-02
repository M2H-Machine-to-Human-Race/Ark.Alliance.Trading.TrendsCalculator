/**
 * Socket.IO Test Helper
 * 
 * @fileoverview Helper functions for testing Socket.IO events
 * @module tests/helpers/socketio-helper
 */

import { io, Socket as ClientSocket } from 'socket.io-client';
import { TrendCalculatorService } from '@backend/application/services/TrendCalculatorService';

export class SocketIOTestHelper {
    private client: ClientSocket | null = null;
    private serverUrl: string;

    constructor(serverUrl: string = 'http://localhost:3075') {
        this.serverUrl = serverUrl;
    }

    /**
     * Connect to Socket.IO server
     */
    async connect(): Promise<ClientSocket> {
        this.client = io(this.serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            timeout: 5000
        });

        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Failed to create client'));
                return;
            }

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);

            this.client.on('connect', () => {
                clearTimeout(timeout);
                resolve(this.client!);
            });

            this.client.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    /**
     * Disconnect from server
     */
    disconnect(): void {
        if (this.client) {
            this.client.disconnect();
            this.client = null;
        }
    }

    /**
     * Wait for specific event
     */
    waitForEvent<T = any>(eventName: string, timeout: number = 5000): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                reject(new Error('Client not connected'));
                return;
            }

            const timer = setTimeout(() => {
                reject(new Error(`Event '${eventName}' timeout`));
            }, timeout);

            this.client.once(eventName, (data: T) => {
                clearTimeout(timer);
                resolve(data);
            });
        });
    }

    /**
     * Emit event and wait for response
     */
    async emitAndWait<T = any>(
        emitEvent: string,
        emitData: any,
        waitEvent: string,
        timeout: number = 5000
    ): Promise<T> {
        if (!this.client) {
            throw new Error('Client not connected');
        }

        const promise = this.waitForEvent<T>(waitEvent, timeout);
        this.client.emit(emitEvent, emitData);
        return promise;
    }

    /**
     * Subscribe to symbol
     */
    subscribeToSymbol(symbol: string): void {
        if (!this.client) {
            throw new Error('Client not connected');
        }
        this.client.emit('subscribe:symbol', symbol);
    }

    /**
     * Get client instance
     */
    getClient(): ClientSocket | null {
        return this.client;
    }

    /**
     * Trigger trend calculation to generate events
     */
    async triggerTrendCalculation(symbol: string): Promise<void> {
        // This would typically call the backend API to trigger a calculation
        // For testing purposes, we can simulate this
        const service = new TrendCalculatorService();
        service.startTracking(symbol);

        // Add some prices
        const basePrice = 45000;
        for (let i = 0; i < 50; i++) {
            service.addPrice(symbol, basePrice + (i * 10));
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Calculate trend
        service.calculateTrend(symbol);
    }
}

/**
 * Create multiple test clients
 */
export async function createMultipleClients(
    count: number,
    serverUrl: string = 'http://localhost:3075'
): Promise<ClientSocket[]> {
    const clients: ClientSocket[] = [];

    for (let i = 0; i < count; i++) {
        const client = io(serverUrl, {
            transports: ['websocket'],
            reconnection: true
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
            client.on('connect', () => {
                clearTimeout(timeout);
                resolve(client);
            });
            client.on('connect_error', reject);
        });

        clients.push(client);
    }

    return clients;
}

/**
 * Cleanup all clients
 */
export function cleanupClients(clients: ClientSocket[]): void {
    clients.forEach(client => client.disconnect());
}

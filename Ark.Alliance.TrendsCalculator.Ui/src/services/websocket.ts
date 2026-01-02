/**
 * @fileoverview WebSocket Service - INTEGRATED WITH BACKEND
 * @module services/websocket
 * @description
 * Socket.IO client for real-time communication with backend.
 * All event names match actual backend Socket.IO implementation.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2025-12-27
 * 
 * @remarks
 * Backend WebSocket Events:
 * Server → Client: trend:updated, buffer:progress, symbol:added, symbol:removed, 
 *                  training:status, ai:analysis, health:update, error
 * Client → Server: subscribe:symbol, unsubscribe:symbol, request:health, request:symbols
 * 
 * Integration status: COMPLETE
 */

import { io, Socket } from 'socket.io-client';

/**
 * WebSocket URL - Uses Vite proxy in development, VITE_API_URL in production
 * 
 * In development: Empty URL means Socket.IO connects to same origin,
 * and Vite proxy routes /socket.io/* to the backend.
 * 
 * In production: Use VITE_API_URL to connect directly to backend.
 */
const getWebSocketUrl = (): string => {
    // If explicit WS URL provided, use it
    const envWsUrl = import.meta.env.VITE_WS_URL;
    if (envWsUrl) return envWsUrl;

    // In development mode, use empty URL - Vite proxy handles routing
    // Socket.IO will connect to same origin (https://localhost:5173)
    // and Vite proxy forwards /socket.io/* to backend
    if (import.meta.env.DEV) {
        return ''; // Vite proxy handles WebSocket routing
    }

    // In production, use backend URL from env or default
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) return apiUrl;

    // Fallback for production without env var
    return 'http://localhost:3001';
};

const WS_URL = getWebSocketUrl();

/**
 * Socket.IO Event Names (matches backend exactly)
 */
export const SocketEvents = {
    // Server → Client
    TREND_UPDATED: 'trend:updated',
    BUFFER_PROGRESS: 'buffer:progress',
    SYMBOL_ADDED: 'symbol:added',
    SYMBOL_REMOVED: 'symbol:removed',
    SYMBOL_UPDATED: 'symbol:updated',
    TRAINING_STATUS: 'training:status',
    AI_ANALYSIS: 'ai:analysis',
    HEALTH_UPDATE: 'health:update',
    ERROR: 'error',
    BINANCE_PRICE_UPDATE: 'binance:price',

    // Client → Server
    SUBSCRIBE_SYMBOL: 'subscribe:symbol',
    UNSUBSCRIBE_SYMBOL: 'unsubscribe:symbol',
    REQUEST_HEALTH: 'request:health',
    REQUEST_SYMBOLS: 'request:symbols',
} as const;

/**
 * WebSocket Service Class
 * Manages Socket.IO connection and event handling
 */
class WebSocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    /**
     * Initialize and connect to WebSocket server
     * @returns {Socket} Socket.IO client instance
     */
    connect(): Socket {
        if (this.socket?.connected) {
            console.log('[WebSocket] Already connected');
            return this.socket;
        }

        console.log(`[WebSocket] Connecting to ${WS_URL}...`);

        this.socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            console.log('[WebSocket] Connected:', this.socket?.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[WebSocket] Disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('[WebSocket] Connection error:', error.message);
            this.reconnectAttempts++;
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
        });

        this.socket.on('reconnect_failed', () => {
            console.error('[WebSocket] Reconnection failed after', this.maxReconnectAttempts, 'attempts');
        });

        // Generic error handler
        this.socket.on(SocketEvents.ERROR, (error: any) => {
            console.error('[WebSocket] Server error:', error);
        });

        return this.socket;
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.socket) {
            console.log('[WebSocket] Disconnecting...');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Register event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    on(event: string, handler: (...args: any[]) => void): void {
        if (!this.socket) {
            console.warn('[WebSocket] Not connected. Call connect() first.');
            return;
        }
        this.socket.on(event, handler);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    off(event: string, handler: (...args: any[]) => void): void {
        if (!this.socket) return;
        this.socket.off(event, handler);
    }

    /**
     * Emit event to server
     * @param {string} event - Event name
     * @param {any} data - Event payload
     */
    emit(event: string, data?: any): void {
        if (!this.socket?.connected) {
            console.warn('[WebSocket] Not connected. Cannot emit:', event);
            return;
        }
        this.socket.emit(event, data);
    }

    /**
     * Subscribe to symbol-specific events
     * @param {string} symbol - Symbol to subscribe to
     */
    subscribeToSymbol(symbol: string): void {
        console.log(`[WebSocket] Subscribing to ${symbol}`);
        this.emit(SocketEvents.SUBSCRIBE_SYMBOL, symbol);
    }

    /**
     * Unsubscribe from symbol-specific events
     * @param {string} symbol - Symbol to unsubscribe from
     */
    unsubscribeFromSymbol(symbol: string): void {
        console.log(`[WebSocket] Unsubscribing from ${symbol}`);
        this.emit(SocketEvents.UNSUBSCRIBE_SYMBOL, symbol);
    }

    /**
     * Request current health status
     */
    requestHealth(): void {
        this.emit(SocketEvents.REQUEST_HEALTH);
    }

    /**
     * Request list of tracked symbols
     */
    requestSymbols(): void {
        this.emit(SocketEvents.REQUEST_SYMBOLS);
    }

    /**
     * Check if connected
     * @returns {boolean} Connection status
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Get Socket.IO client instance
     * @returns {Socket | null} Socket instance
     */
    getSocket(): Socket | null {
        return this.socket;
    }
}

/**
 * Singleton instance
 */
const websocketService = new WebSocketService();

export default websocketService;
export { websocketService };

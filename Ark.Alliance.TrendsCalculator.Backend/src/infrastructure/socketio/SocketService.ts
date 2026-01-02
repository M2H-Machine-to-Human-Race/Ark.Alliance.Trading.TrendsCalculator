/**
 * Socket.IO Service
 * 
 * @fileoverview Real-time event broadcasting via Socket.IO
 * @module infrastructure/socketio
 */

import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { systemLogger } from '../SystemLogger';
import {
    SocketEvents,
    SocketRooms,
    TrendUpdateEvent,
    BufferProgressEvent,
    SymbolTrackingEvent,
    TrainingStatusEvent,
    AIAnalysisEvent,
    SystemHealthEvent,
    BinanceStatusEvent,
    BinancePriceEvent
} from './types';

/**
 * Socket.IO Service for real-time communication
 */
export class SocketService {
    private io: SocketIOServer | null = null;
    private connectedClients: Set<string> = new Set();

    /**
     * Initialize Socket.IO server
     */
    initialize(server: HTTPServer | HTTPSServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: '*', // Configure appropriately for production
                methods: ['GET', 'POST']
            },
            transports: ['websocket', 'polling']
        });

        this.setupEventHandlers();

        systemLogger.info('Socket.IO server initialized', {
            source: 'SocketService'
        });

        console.log('⚡ Socket.IO ready for real-time connections');
    }

    /**
     * Setup Socket.IO event handlers
     * @private
     */
    private setupEventHandlers(): void {
        if (!this.io) return;

        this.io.on('connection', (socket: Socket) => {
            const clientId = socket.id;
            this.connectedClients.add(clientId);

            systemLogger.info(`Client connected: ${clientId}`, {
                source: 'SocketService',
                details: { totalClients: this.connectedClients.size }
            });

            console.log(`🔌 Client connected: ${clientId} (Total: ${this.connectedClients.size})`);

            // Join default rooms
            socket.join(SocketRooms.ALL_TRENDS);
            socket.join(SocketRooms.HEALTH);

            // Handle client subscriptions
            socket.on(SocketEvents.SUBSCRIBE_SYMBOL, (symbol: string) => {
                socket.join(SocketRooms.SYMBOL(symbol));
                systemLogger.info(`Client ${clientId} subscribed to ${symbol}`, {
                    source: 'SocketService'
                });
            });

            socket.on(SocketEvents.UNSUBSCRIBE_SYMBOL, (symbol: string) => {
                socket.leave(SocketRooms.SYMBOL(symbol));
                systemLogger.info(`Client ${clientId} unsubscribed from ${symbol}`, {
                    source: 'SocketService'
                });
            });

            // Handle health request
            socket.on(SocketEvents.REQUEST_HEALTH, () => {
                this.emitHealthUpdate({
                    status: 'healthy',
                    services: {
                        database: 'up',
                        websocket: 'up',
                        ai: 'up'
                    },
                    uptime: process.uptime(),
                    timestamp: Date.now()
                });
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.connectedClients.delete(clientId);
                systemLogger.info(`Client disconnected: ${clientId}`, {
                    source: 'SocketService',
                    details: { totalClients: this.connectedClients.size }
                });
                console.log(`🔌 Client disconnected: ${clientId} (Total: ${this.connectedClients.size})`);
            });
        });
    }

    /**
     * Emit trend update event
     */
    emitTrendUpdate(data: TrendUpdateEvent): void {
        if (!this.io) return;

        // Broadcast to all clients
        this.io.to(SocketRooms.ALL_TRENDS).emit(SocketEvents.TREND_UPDATED, data);

        // Also broadcast to symbol-specific room
        this.io.to(SocketRooms.SYMBOL(data.symbol)).emit(SocketEvents.TREND_UPDATED, data);

        systemLogger.debug(`Trend update emitted: ${data.symbol}`, {
            source: 'SocketService',
            details: { direction: data.direction, confidence: data.confidence }
        });
    }

    /**
     * Emit buffer progress event
     * Broadcasts to all clients in ALL_TRENDS room since clients
     * need to see progress for all their tracked symbols
     */
    emitBufferProgress(data: BufferProgressEvent): void {
        if (!this.io) return;

        // Emit to all clients in ALL_TRENDS room (not just symbol-specific room)
        this.io.to(SocketRooms.ALL_TRENDS).emit(SocketEvents.BUFFER_PROGRESS, data);

        systemLogger.debug(`Buffer progress emitted: ${data.symbol} (${data.percentage}%)`, {
            source: 'SocketService'
        });
    }

    /**
     * Emit symbol tracking event
     */
    emitSymbolTracking(data: SymbolTrackingEvent): void {
        if (!this.io) return;

        const event = data.action === 'added'
            ? SocketEvents.SYMBOL_ADDED
            : data.action === 'removed'
                ? SocketEvents.SYMBOL_REMOVED
                : SocketEvents.SYMBOL_UPDATED;

        this.io.to(SocketRooms.ALL_TRENDS).emit(event, data);

        systemLogger.info(`Symbol ${data.action}: ${data.symbol}`, {
            source: 'SocketService'
        });
    }

    /**
     * Emit training status event
     */
    emitTrainingStatus(data: TrainingStatusEvent): void {
        if (!this.io) return;

        this.io.to(SocketRooms.TRAINING).emit(SocketEvents.TRAINING_STATUS, data);

        systemLogger.info(`Training status: ${data.status}`, {
            source: 'SocketService',
            details: { sessionId: data.sessionId }
        });
    }

    /**
     * Emit AI analysis event
     */
    emitAIAnalysis(data: AIAnalysisEvent): void {
        if (!this.io) return;

        this.io.to(SocketRooms.SYMBOL(data.symbol)).emit(SocketEvents.AI_ANALYSIS, data);

        systemLogger.debug(`AI analysis emitted: ${data.symbol}`, {
            source: 'SocketService',
            details: { provider: data.provider, success: data.success }
        });
    }

    /**
     * Emit system health update
     */
    emitHealthUpdate(data: SystemHealthEvent): void {
        if (!this.io) return;

        this.io.to(SocketRooms.HEALTH).emit(SocketEvents.HEALTH_UPDATE, data);

        systemLogger.debug('Health update emitted', {
            source: 'SocketService',
            details: { status: data.status }
        });
    }

    /**
     * Emit Binance connection status change
     */
    emitBinanceStatus(data: BinanceStatusEvent): void {
        if (!this.io) return;

        const eventName = data.status === 'connected'
            ? SocketEvents.BINANCE_CONNECTED
            : data.status === 'disconnected'
                ? SocketEvents.BINANCE_DISCONNECTED
                : SocketEvents.BINANCE_ERROR;

        this.io.to(SocketRooms.ALL_TRENDS).emit(eventName, data);

        systemLogger.debug(`Binance ${data.status} event emitted`, {
            source: 'SocketService',
            details: { status: data.status, message: data.message }
        });
    }

    /**
     * Emit Binance price update
     */
    emitBinancePrice(data: BinancePriceEvent): void {
        if (!this.io) return;

        this.io.to(SocketRooms.SYMBOL(data.symbol)).emit(SocketEvents.BINANCE_PRICE_UPDATE, data);
        this.io.to(SocketRooms.ALL_TRENDS).emit(SocketEvents.BINANCE_PRICE_UPDATE, data);

        systemLogger.debug(`Binance price update: ${data.symbol} = ${data.price}`, {
            source: 'SocketService',
            details: { symbol: data.symbol, price: data.price }
        });
    }

    /**
     * Emit error event
     */
    emitError(clientId: string, error: { message: string; code?: string }): void {
        if (!this.io) return;

        this.io.to(clientId).emit(SocketEvents.ERROR, error);

        systemLogger.warn(`Error emitted to client ${clientId}: ${error.message}`, {
            source: 'SocketService',
            details: { code: error.code }
        });
    }

    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number {
        return this.connectedClients.size;
    }

    /**
     * Get Socket.IO server instance
     */
    getIO(): SocketIOServer | null {
        return this.io;
    }

    /**
     * Shutdown Socket.IO server
     */
    async shutdown(): Promise<void> {
        if (this.io) {
            await this.io.close();
            this.io = null;
            this.connectedClients.clear();

            systemLogger.info('Socket.IO server shutdown', {
                source: 'SocketService'
            });
        }
    }
}

// Singleton instance
export const socketService = new SocketService();

export default socketService;

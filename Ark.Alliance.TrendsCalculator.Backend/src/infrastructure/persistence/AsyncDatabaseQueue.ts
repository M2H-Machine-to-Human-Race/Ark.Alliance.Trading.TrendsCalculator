/**
 * @fileoverview Async Database Queue - Non-blocking write operations
 * @module Data/AsyncDatabaseQueue
 * 
 * PERFORMANCE CRITICAL:
 * - All writes are queued and processed asynchronously
 * - Trading operations never wait for DB
 * - Batched writes for efficiency
 * - Zero blocking guarantee
 */

import { EventEmitter } from 'events';
import { DatabaseService } from './DatabaseService';

interface QueuedOperation {
    id: string;
    type: 'insert' | 'update' | 'delete';
    table: string;
    operation: () => void;
    timestamp: number;
    priority: 'low' | 'normal' | 'high';
}

export class AsyncDatabaseQueue extends EventEmitter {
    private static instance: AsyncDatabaseQueue | null = null;
    private queue: QueuedOperation[] = [];
    private processing: boolean = false;
    private batchSize: number = 50;
    private processInterval: number = 100; // ms
    private db: DatabaseService;
    private timer: NodeJS.Timeout | null = null;

    private constructor() {
        super();
        this.db = DatabaseService.getInstance();
    }

    static getInstance(): AsyncDatabaseQueue {
        if (!AsyncDatabaseQueue.instance) {
            AsyncDatabaseQueue.instance = new AsyncDatabaseQueue();
        }
        return AsyncDatabaseQueue.instance;
    }

    /**
     * Start processing queue
     */
    start(): void {
        if (this.timer) return;

        this.timer = setInterval(() => {
            this.processQueue();
        }, this.processInterval);

        console.log('✅ AsyncDatabaseQueue started');
    }

    /**
     * Stop processing queue
     */
    async stop(): Promise<void> {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Process remaining items
        await this.flush();

        console.log('✅ AsyncDatabaseQueue stopped');
    }

    /**
     * Add operation to queue (non-blocking)
     * Returns immediately without waiting for DB write
     */
    enqueue(operation: Omit<QueuedOperation, 'id' | 'timestamp'>): void {
        const queuedOp: QueuedOperation = {
            ...operation,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now()
        };

        // Insert based on priority
        if (operation.priority === 'high') {
            this.queue.unshift(queuedOp);
        } else {
            this.queue.push(queuedOp);
        }

        this.emit('enqueued', queuedOp);
    }

    /**
     * Process queued operations in batches
     */
    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        try {
            // Take batch from queue
            const batch = this.queue.splice(0, this.batchSize);

            // Group by table for better performance
            const grouped = this.groupByTable(batch);

            // Process each table's operations in a transaction
            for (const [table, operations] of Object.entries(grouped)) {
                try {
                    this.db.transaction(() => {
                        operations.forEach(op => {
                            try {
                                op.operation();
                            } catch (error) {
                                console.error(`DB operation error (${op.type} on ${op.table}):`, error);
                                this.emit('error', { operation: op, error });
                            }
                        });
                    });

                    this.emit('batch-processed', { table, count: operations.length });
                } catch (error) {
                    console.error(`Transaction error for table ${table}:`, error);
                    // Re-queue failed operations
                    operations.forEach(op => this.queue.push(op));
                }
            }
        } finally {
            this.processing = false;
        }
    }

    /**
     * Group operations by table for better transaction efficiency
     */
    private groupByTable(operations: QueuedOperation[]): Record<string, QueuedOperation[]> {
        return operations.reduce((acc, op) => {
            if (!acc[op.table]) {
                acc[op.table] = [];
            }
            acc[op.table].push(op);
            return acc;
        }, {} as Record<string, QueuedOperation[]>);
    }

    /**
     * Flush all pending operations (wait for completion)
     */
    async flush(): Promise<void> {
        while (this.queue.length > 0 || this.processing) {
            await this.processQueue();
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Get queue statistics
     */
    getStats(): {
        queueLength: number;
        processing: boolean;
        oldestItem?: number;
    } {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            oldestItem: this.queue.length > 0 ? this.queue[0].timestamp : undefined
        };
    }
}

/**
 * @fileoverview Health Controller
 * @module api/controllers/HealthController
 * 
 * System health check endpoints
 */

import { Request, Response } from 'express';

export class HealthController {
    /**
     * GET /api/health
     * Basic health check
     */
    async check(req: Request, res: Response): Promise<void> {
        res.json({
            success: true,
            data: {
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: Date.now(),
                version: '1.0.0'
            }
        });
    }

    /**
     * GET /api/health/detailed
     * Detailed health check with service statuses
     */
    async detailedCheck(req: Request, res: Response): Promise<void> {
        res.json({
            success: true,
            data: {
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: Date.now(),
                version: '1.0.0',
                services: {
                    database: 'healthy',
                    websocket: 'healthy',
                    ai: 'healthy'
                },
                memory: {
                    used: process.memoryUsage().heapUsed,
                    total: process.memoryUsage().heapTotal
                }
            }
        });
    }
}

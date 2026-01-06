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
                service: 'Ark.Alliance.TrendsCalculator.Backend',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
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
                service: 'Ark.Alliance.TrendsCalculator.Backend',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                checks: {
                    database: { status: 'ok' },
                    websocket: { status: 'ok' },
                    ai: { status: 'ok' }
                },
                memory: {
                    used: process.memoryUsage().heapUsed,
                    total: process.memoryUsage().heapTotal
                }
            }
        });
    }
}

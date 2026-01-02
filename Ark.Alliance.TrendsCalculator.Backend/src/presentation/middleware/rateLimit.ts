/**
 * @fileoverview Rate Limiting Middleware
 * @module middleware/rateLimit
 * 
 * Configures rate limiting per endpoint type to prevent abuse.
 * Different limits apply to different endpoint categories.
 * 
 * NOTE: Using IPv4-only mode for local development.
 * For production behind a proxy, configure trust proxy properly.
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Standard response for rate limit exceeded
 */
const rateLimitResponse = (req: Request, res: Response) => {
    res.status(429).json({
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later'
        }
    });
};

/**
 * Common key generator - IPv4 focused for local development
 * Falls back to a static key if IP detection fails
 */
const keyGenerator = (req: Request): string => {
    // For local development, use simple IP extraction
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    // Use socket remote address for direct connections
    return req.socket?.remoteAddress || req.ip || 'localhost';
};

/**
 * General API rate limiter
 * Effective disabled for local dev (100k/min)
 */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100000,
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    handler: rateLimitResponse,
    keyGenerator,
    validate: false // Disable all validation for local dev
});

/**
 * Strict limiter for order placement endpoints
 * Effective disabled for local dev (100k/min)
 */
export const orderLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    keyGenerator,
    validate: false
});

/**
 * Strict limiter for strategy start/stop
 * Effective disabled for local dev (100k/min)
 */
export const strategyLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    keyGenerator,
    validate: false
});

/**
 * Very strict limiter for auth/credential endpoints
 * Effective disabled for local dev (100k/min)
 */
export const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    keyGenerator,
    validate: false
});

/**
 * Lenient limiter for read-only status endpoints
 * Effective disabled for local dev (100k/min)
 */
export const statusLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    keyGenerator,
    validate: false
});

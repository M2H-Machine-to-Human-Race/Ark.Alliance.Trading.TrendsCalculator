/**
 * @fileoverview Global Error Handler
 * @module middleware/globalErrorHandler
 * 
 * Express middleware to handle all uncaught errors
 * Ensures consistent JSON error responses
 */

import { Request, Response, NextFunction } from 'express';
import { systemLogger } from '@infrastructure/SystemLogger';

/**
 * Standard error codes
 */
export const ErrorCodes = {
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    BAD_REQUEST: 'BAD_REQUEST',
} as const;

/**
 * Create standardized error response
 */
export function createErrorResponse(
    code: string,
    message: string,
    details?: Record<string, unknown>
) {
    return {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };
}

/**
 * Global error handling middleware
 */
export function globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const statusCode = err.status || 500;
    const errorCode = err.code || ErrorCodes.INTERNAL_ERROR;
    const message = err.message || 'An unexpected error occurred';

    systemLogger.error(`Unhandled error: ${message}`, {
        source: 'GlobalErrorHandler',
        error: err,
        details: {
            method: req.method,
            path: req.path,
            statusCode,
        },
    });

    if (res.headersSent) {
        return next(err);
    }

    res.status(statusCode).json(createErrorResponse(
        errorCode,
        message,
        process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
    ));
}

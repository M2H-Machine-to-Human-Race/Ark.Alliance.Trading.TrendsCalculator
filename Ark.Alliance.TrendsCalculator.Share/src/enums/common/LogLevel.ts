/**
 * @fileoverview System Log Level Enum
 * @module enums/common/LogLevel
 * 
 * Log levels for system logging.
 * 
 * @author Ark.Alliance Team
 * @version 1.0.0
 * @since 2026-01-06
 */

import { z } from 'zod';

/**
 * Log level values
 */
export enum LogLevel {
    /** Debug-level logging (verbose) */
    DEBUG = 'debug',
    /** Info-level logging (standard) */
    INFO = 'info',
    /** Warning-level logging */
    WARN = 'warn',
    /** Error-level logging */
    ERROR = 'error',
}

/**
 * Zod schema for LogLevel validation
 */
export const LogLevelSchema = z.nativeEnum(LogLevel);

/**
 * Type for validated LogLevel
 */
export type LogLevelValue = z.infer<typeof LogLevelSchema>;

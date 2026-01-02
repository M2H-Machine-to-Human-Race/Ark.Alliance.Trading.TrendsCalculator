/**
 * @fileoverview Common Constants
 * @module constants
 * 
 * Application-wide constants shared between backend and frontend.
 * Non-enum constant values that don't change.
 * 
 * @author Ark.Alliance
 * @since 2026-01-02
 */

/**
 * API Configuration Constants
 */
export const API_CONSTANTS = {
    /** Default API timeout in milliseconds */
    DEFAULT_TIMEOUT: 30000,
    /** Maximum retry attempts for failed requests */
    MAX_RETRIES: 3,
    /** Retry delay in milliseconds */
    RETRY_DELAY: 1000,
} as const;

/**
 * WebSocket Configuration Constants
 */
export const WEBSOCKET_CONSTANTS = {
    /** Default WebSocket reconnection delay in milliseconds */
    RECONNECT_DELAY: 3000,
    /** Maximum reconnection attempts */
    MAX_RECONNECT_ATTEMPTS: 10,
    /** Heartbeat interval in milliseconds */
    HEARTBEAT_INTERVAL: 30000,
} as const;

/**
 * Buffer Size Constants
 */
export const BUFFER_CONSTANTS = {
    /** Minimum buffer size for trend analysis */
    MIN_BUFFER_SIZE: 10,
    /** Default buffer size */
    DEFAULT_BUFFER_SIZE: 200,
    /** Maximum buffer size */
    MAX_BUFFER_SIZE: 500,
    /** Buffer full threshold percentage */
    FULL_THRESHOLD_PERCENT: 100,
} as const;

/**
 * Confidence Threshold Constants
 */
export const CONFIDENCE_CONSTANTS = {
    /** Low confidence threshold (0-0.4) */
    LOW_THRESHOLD: 0.4,
    /** Medium confidence threshold (0.4-0.7) */
    MEDIUM_THRESHOLD: 0.7,
    /** High confidence threshold (>0.7) */
    HIGH_THRESHOLD: 0.7,
    /** Minimum confidence for reliable signal */
    MIN_RELIABLE: 0.6,
} as const;

/**
 * Hurst Exponent Constants
 */
export const HURST_CONSTANTS = {
    /** Mean-reverting threshold (H < 0.5) */
    MEAN_REVERTING_THRESHOLD: 0.5,
    /** Random walk (H ≈ 0.5) */
    RANDOM_WALK_THRESHOLD: 0.5,
    /** Trending threshold (H > 0.5) */
    TRENDING_THRESHOLD: 0.5,
} as const;

/**
 * Pagination Constants
 */
export const PAGINATION_CONSTANTS = {
    /** Default page size */
    DEFAULT_PAGE_SIZE: 20,
    /** Maximum page size  */
    MAX_PAGE_SIZE: 100,
    /** First page number (0-indexed) */
    FIRST_PAGE: 0,
} as const;

/**
 * Date/Time Format Constants
 */
export const DATETIME_CONSTANTS = {
    /** ISO 8601 datetime format */
    ISO_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    /** Display date format */
    DISPLAY_DATE_FORMAT: 'YYYY-MM-DD',
    /** Display time format */
    DISPLAY_TIME_FORMAT: 'HH:mm:ss',
    /** Display datetime format */
    DISPLAY_DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
} as const;

/**
 * Regex Patterns Constants
 */
export const REGEX_PATTERNS = {
    /** Symbol pattern: uppercase letters + USDT */
    SYMBOL: /^[A-Z]+USDT$/,
    /** Email pattern */
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    /** Decimal number pattern */
    DECIMAL: /^\d+(\.\d+)?$/,
} as const;

/**
 * Error Code Constants
 */
export const ERROR_CODES = {
    /** Validation error */
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    /** Not found error */
    NOT_FOUND: 'NOT_FOUND',
    /** Server error */
    SERVER_ERROR: 'SERVER_ERROR',
    /** Unauthorized error */
    UNAUTHORIZED: 'UNAUTHORIZED',
    /** Forbidden error */
    FORBIDDEN: 'FORBIDDEN',
    /** Timeout error */
    TIMEOUT: 'TIMEOUT',
    /** Network error */
    NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

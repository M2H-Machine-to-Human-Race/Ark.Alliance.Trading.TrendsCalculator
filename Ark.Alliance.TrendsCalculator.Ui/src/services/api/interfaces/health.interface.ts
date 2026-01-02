/**
 * @fileoverview Health API Interface
 * @module services/api/interfaces/health
 * @description
 * TypeScript interface for Health API service.
 * Enables mock implementations for unit testing.
 */

// ═══════════════════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Health check response DTO
 */
export interface HealthCheckResponseDto {
    status: string;
    timestamp: number;
    uptime: number;
    version?: string;
}

/**
 * Detailed health response DTO
 */
export interface DetailedHealthResponseDto {
    status: string;
    services: {
        database: string;
        binance: string;
        ai: string;
    };
    memory: {
        used: number;
        total: number;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Health API Interface
 * @endpoint GET /api/health
 */
export interface IHealthApi {
    /** Basic health check */
    getHealth(): Promise<HealthCheckResponseDto>;

    /** Detailed health with service statuses */
    getDetailedHealth(): Promise<DetailedHealthResponseDto>;
}

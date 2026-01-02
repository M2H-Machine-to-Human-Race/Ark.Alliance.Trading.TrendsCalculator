/**
 * @fileoverview Health API Service
 * @module services/api/health
 * @description
 * Health check endpoints matching HealthController
 */

import type { HealthResponseDto } from '@share/trends';
import { apiClient } from './client';

/**
 * Check API health status
 * @returns {Promise<HealthResponseDto>} Health status
 * @endpoint GET /api/health
 */
export async function getHealth(): Promise<HealthResponseDto> {
    const response = await apiClient.get('/health');
    return response.data.data;
}

/**
 * Get detailed health check with service statuses
 * @returns {Promise<HealthResponseDto>} Detailed health information
 * @endpoint GET /api/health/detailed
 */
export async function getDetailedHealth(): Promise<HealthResponseDto> {
    const response = await apiClient.get('/health/detailed');
    return response.data.data;
}

export const healthApi = {
    getHealth,
    getDetailedHealth,
};

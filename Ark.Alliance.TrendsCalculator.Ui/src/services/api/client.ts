/**
 * @fileoverview API Client Configuration
 * @module services/api/client
 * @description
 * Shared Axios client instance for all API services
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Base API URL from environment variables
 * When empty, uses relative path which Vite proxy handles in dev mode
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error('[API Error]', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

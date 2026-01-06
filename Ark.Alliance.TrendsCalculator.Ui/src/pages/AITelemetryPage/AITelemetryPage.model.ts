/**
 * @fileoverview AI Telemetry Page Data Model
 * @module pages/AITelemetryPage/AITelemetryPage.model
 * @description
 * Defines TypeScript interfaces for AI telemetry page state.
 * Follows MVVM pattern - client-side data definitions only.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-06
 */

import type {
    AISettingsDto,
    AITelemetryGridDto,
    AITelemetryDetailDto,
    AIConnectionTestResponse,
} from '@share/trends';

/**
 * Connection test state
 */
export interface ConnectionTestState {
    isLoading: boolean;
    result: AIConnectionTestResponse | null;
    error: string | null;
}

/**
 * AI Telemetry Page state model
 */
export interface AITelemetryPageModel {
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;

    /** AI settings from backend */
    settings: AISettingsDto | null;

    /** Telemetry grid data */
    gridData: AITelemetryGridDto[];
    /** Total logs count */
    totalLogs: number;
    /** Current page */
    currentPage: number;
    /** Page size */
    pageSize: number;

    /** Selected log for detail modal */
    selectedLog: AITelemetryDetailDto | null;
    /** Whether detail modal is open */
    isDetailModalOpen: boolean;

    /** Connection test state */
    connectionTest: ConnectionTestState;

    /** Statistics */
    stats: {
        totalExchanges: number;
        successRate: number;
        avgLatencyMs: number;
        errorCount: number;
    } | null;
}

/**
 * Default model state
 */
export const defaultAITelemetryPageModel: AITelemetryPageModel = {
    isLoading: true,
    error: null,
    settings: null,
    gridData: [],
    totalLogs: 0,
    currentPage: 1,
    pageSize: 20,
    selectedLog: null,
    isDetailModalOpen: false,
    connectionTest: {
        isLoading: false,
        result: null,
        error: null,
    },
    stats: null,
};

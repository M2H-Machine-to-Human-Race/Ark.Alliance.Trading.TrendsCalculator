/**
 * @fileoverview AI Telemetry Page ViewModel
 * @module pages/AITelemetryPage/AITelemetryPage.viewmodel
 * @description
 * ViewModel for AI Telemetry Page following MVVM pattern.
 * Handles state management, API calls, and business logic.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-06
 */

import { useState, useEffect, useCallback } from 'react';
import * as aiApi from '../../services/api/aiTelemetry.api';
import type { AITelemetryPageModel } from './AITelemetryPage.model';
import { defaultAITelemetryPageModel } from './AITelemetryPage.model';
import type { AISettingsDto } from '@share/trends';

/**
 * AI Telemetry Page ViewModel Hook
 * Manages all state and business logic for the AI Telemetry page
 */
export function useAITelemetryViewModel() {
    const [model, setModel] = useState<AITelemetryPageModel>(defaultAITelemetryPageModel);

    /**
     * Load initial data
     */
    const loadData = useCallback(async () => {
        setModel(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const [settings, logsResult, stats] = await Promise.all([
                aiApi.getAISettings(),
                aiApi.getTelemetryLogs(1, 20),
                aiApi.getTelemetryStats(),
            ]);

            setModel(prev => ({
                ...prev,
                isLoading: false,
                settings,
                gridData: logsResult.items,
                totalLogs: logsResult.total,
                currentPage: logsResult.page,
                stats,
            }));
        } catch (error) {
            console.error('[AITelemetryPage] Failed to load data:', error);
            setModel(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to load AI telemetry data',
            }));
        }
    }, []);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    /**
     * Toggle AI enabled/disabled
     */
    const toggleAIEnabled = useCallback(async (enabled: boolean) => {
        try {
            const updated = await aiApi.updateAISettings({ enabled });
            setModel(prev => ({ ...prev, settings: updated }));
        } catch (error) {
            console.error('[AITelemetryPage] Failed to toggle AI:', error);
        }
    }, []);

    /**
     * Update AI settings
     */
    const updateSettings = useCallback(async (updates: Partial<AISettingsDto>) => {
        try {
            const updated = await aiApi.updateAISettings(updates);
            setModel(prev => ({ ...prev, settings: updated }));
        } catch (error) {
            console.error('[AITelemetryPage] Failed to update settings:', error);
        }
    }, []);

    /**
     * Test AI connection
     */
    const testConnection = useCallback(async () => {
        setModel(prev => ({
            ...prev,
            connectionTest: { isLoading: true, result: null, error: null },
        }));

        try {
            const result = await aiApi.testAIConnection();
            setModel(prev => ({
                ...prev,
                connectionTest: { isLoading: false, result, error: null },
            }));
        } catch (error) {
            console.error('[AITelemetryPage] Connection test failed:', error);
            setModel(prev => ({
                ...prev,
                connectionTest: {
                    isLoading: false,
                    result: null,
                    error: 'Connection test failed',
                },
            }));
        }
    }, []);

    /**
     * Load telemetry logs page
     */
    const loadPage = useCallback(async (page: number) => {
        try {
            const result = await aiApi.getTelemetryLogs(page, model.pageSize);
            setModel(prev => ({
                ...prev,
                gridData: result.items,
                totalLogs: result.total,
                currentPage: result.page,
            }));
        } catch (error) {
            console.error('[AITelemetryPage] Failed to load page:', error);
        }
    }, [model.pageSize]);

    /**
     * Open detail modal for a log
     */
    const openDetail = useCallback(async (id: number) => {
        try {
            const detail = await aiApi.getTelemetryDetail(id);
            setModel(prev => ({
                ...prev,
                selectedLog: detail,
                isDetailModalOpen: true,
            }));
        } catch (error) {
            console.error('[AITelemetryPage] Failed to load detail:', error);
        }
    }, []);

    /**
     * Close detail modal
     */
    const closeDetail = useCallback(() => {
        setModel(prev => ({
            ...prev,
            selectedLog: null,
            isDetailModalOpen: false,
        }));
    }, []);

    /**
     * Refresh data
     */
    const refresh = useCallback(() => {
        loadData();
    }, [loadData]);

    return {
        model,
        toggleAIEnabled,
        updateSettings,
        testConnection,
        loadPage,
        openDetail,
        closeDetail,
        refresh,
    };
}

/**
 * @fileoverview Configuration Page ViewModel
 * @module pages/ConfigurationPage/ConfigurationPage.viewmodel
 * @description
 * ViewModel layer for Configuration Page following MVVM pattern.
 * Manages system settings state and save/reset operations.
 * 
 * @author Ark.Alliance Team
 * @version 2.0.0
 * @since 2025-12-28
 * 
 * @remarks
 * This ViewModel:
 * - Loads settings from backend API on mount
 * - Manages settings state (AI, calculation, WebSocket, forecast)
 * - Saves settings to backend via API
 * - Follows MVVM separation: NO UI/DOM logic here
 */

import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../../services/api';
import { AIProviderType } from '@share/trends';
import type { ConfigurationPageModel, SystemSettings } from './ConfigurationPage.model';

/**
 * Default system settings (fallback if API fails)
 */
const DEFAULT_SETTINGS: SystemSettings = {
    ai: {
        provider: AIProviderType.GEMINI,
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 2048,
    },
    calculation: {
        bufferSize: 100,
        minDataPoints: 50,
        emaFastPeriod: 10,
        emaSlowPeriod: 30,
    },
    websocket: {
        reconnectionDelay: 1000,
        maxReconnectionAttempts: 5,
        heartbeatInterval: 30000,
    },
    forecast: {
        showHorizon: true,
        horizonMs: 60000,
        horizonPresets: [30000, 60000, 300000, 900000],
    },
};

/**
 * Configuration Page ViewModel Hook
 * @returns {Object} ViewModel state and actions
 */
export function useConfigurationViewModel() {
    const [model, setModel] = useState<ConfigurationPageModel>({
        isLoading: true,
        isSaving: false,
        settings: DEFAULT_SETTINGS,
    });

    // Load settings from backend on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await apiService.getSettings();
                const data = response.data; // Backend returns { success: true, data: {...} }

                // Map backend settings to frontend model
                setModel(prev => ({
                    ...prev,
                    isLoading: false,
                    settings: {
                        ai: {
                            provider: data?.ai?.ai_provider || DEFAULT_SETTINGS.ai.provider,
                            model: data?.ai?.ai_model || DEFAULT_SETTINGS.ai.model,
                            temperature: data?.ai?.ai_temperature || DEFAULT_SETTINGS.ai.temperature,
                            maxTokens: data?.ai?.ai_max_tokens || DEFAULT_SETTINGS.ai.maxTokens,
                        },
                        calculation: {
                            bufferSize: data?.strategy?.trend_analysis_points || DEFAULT_SETTINGS.calculation.bufferSize,
                            minDataPoints: data?.strategy?.trend_min_data_points || DEFAULT_SETTINGS.calculation.minDataPoints,
                            emaFastPeriod: DEFAULT_SETTINGS.calculation.emaFastPeriod,
                            emaSlowPeriod: DEFAULT_SETTINGS.calculation.emaSlowPeriod,
                        },
                        websocket: {
                            reconnectionDelay: data?.binance?.market_data_ws_reconnect_interval_ms || DEFAULT_SETTINGS.websocket.reconnectionDelay,
                            maxReconnectionAttempts: DEFAULT_SETTINGS.websocket.maxReconnectionAttempts,
                            heartbeatInterval: DEFAULT_SETTINGS.websocket.heartbeatInterval,
                        },
                        forecast: {
                            showHorizon: data?.general?.['forecast.show_horizon'] === 'true' || DEFAULT_SETTINGS.forecast.showHorizon,
                            horizonMs: parseInt(data?.general?.['forecast.horizon_ms']) || DEFAULT_SETTINGS.forecast.horizonMs,
                            horizonPresets: (() => {
                                const presets = data?.general?.['forecast.horizon_presets'];
                                if (!presets) return DEFAULT_SETTINGS.forecast.horizonPresets;
                                if (Array.isArray(presets)) return presets;
                                try {
                                    return JSON.parse(presets);
                                } catch {
                                    return DEFAULT_SETTINGS.forecast.horizonPresets;
                                }
                            })(),
                        },
                    },
                }));
            } catch (error) {
                console.error('[Configuration] Failed to load settings:', error);
                setModel(prev => ({ ...prev, isLoading: false }));
            }
        };

        loadSettings();
    }, []);

    const updateAISetting = useCallback((key: keyof typeof DEFAULT_SETTINGS.ai, value: any) => {
        setModel((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                ai: {
                    ...prev.settings.ai,
                    [key]: value,
                },
            },
        }));
    }, []);

    const updateCalculationSetting = useCallback((key: keyof typeof DEFAULT_SETTINGS.calculation, value: number) => {
        setModel((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                calculation: {
                    ...prev.settings.calculation,
                    [key]: value,
                },
            },
        }));
    }, []);

    const updateWebSocketSetting = useCallback((key: keyof typeof DEFAULT_SETTINGS.websocket, value: number) => {
        setModel((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                websocket: {
                    ...prev.settings.websocket,
                    [key]: value,
                },
            },
        }));
    }, []);

    const updateForecastSetting = useCallback(<K extends keyof typeof DEFAULT_SETTINGS.forecast>(
        key: K,
        value: typeof DEFAULT_SETTINGS.forecast[K]
    ) => {
        setModel((prev) => ({
            ...prev,
            settings: {
                ...prev.settings,
                forecast: {
                    ...prev.settings.forecast,
                    [key]: value,
                },
            },
        }));
    }, []);

    const handleSave = useCallback(async () => {
        setModel((prev) => ({ ...prev, isSaving: true }));

        try {
            // Map frontend model to backend format
            const backendSettings = {
                ai: {
                    ai_provider: model.settings.ai.provider,
                    ai_model: model.settings.ai.model,
                    ai_temperature: model.settings.ai.temperature,
                    ai_max_tokens: model.settings.ai.maxTokens,
                },
                strategy: {
                    trend_analysis_points: model.settings.calculation.bufferSize,
                    trend_min_data_points: model.settings.calculation.minDataPoints,
                },
                binance: {
                    market_data_ws_reconnect_interval_ms: model.settings.websocket.reconnectionDelay,
                },
                general: {
                    'forecast.show_horizon': String(model.settings.forecast.showHorizon),
                    'forecast.horizon_ms': String(model.settings.forecast.horizonMs),
                    'forecast.horizon_presets': JSON.stringify(model.settings.forecast.horizonPresets),
                },
            };

            const result = await apiService.updateSettings(backendSettings);

            if (result.success) {
                alert('Settings saved successfully!');
            } else {
                alert('Some settings failed to save. Check console for details.');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert(`Failed to save settings: ${error}`);
        } finally {
            setModel((prev) => ({ ...prev, isSaving: false }));
        }
    }, [model.settings]);

    const handleReset = useCallback(() => {
        if (confirm('Reset all settings to defaults?')) {
            setModel((prev) => ({
                ...prev,
                settings: DEFAULT_SETTINGS,
            }));
        }
    }, []);

    return {
        model,
        updateAISetting,
        updateCalculationSetting,
        updateWebSocketSetting,
        updateForecastSetting,
        handleSave,
        handleReset,
    };
}


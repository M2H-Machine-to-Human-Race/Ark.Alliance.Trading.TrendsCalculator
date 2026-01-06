/**
 * @fileoverview Configuration Page Component - MVVM COMPLIANT
 * @module pages/ConfigurationPage
 * @description
 * System configuration and settings management.
 * Includes AI provider, calculation parameters, forecast, and WebSocket settings.
 * 
 * VIEW ONLY - All logic in ConfigurationPage.viewmodel.ts
 * 
 * @author Ark.Alliance Team
 * @version 2.0.0
 * @since 2025-12-27
 */

import { Panel } from 'ark-alliance-react-ui';
import { AIProviderType } from '@share/trends';
import { useConfigurationViewModel } from './ConfigurationPage.viewmodel';
import styles from './ConfigurationPage.module.css';

export function ConfigurationPage() {
    const {
        model,
        updateAISetting,
        updateCalculationSetting,
        updateWebSocketSetting,
        updateForecastSetting,
        handleSave,
        handleReset,
    } = useConfigurationViewModel();

    /**
     * Format milliseconds to human-readable duration
     */
    const formatDuration = (ms: number): string => {
        if (ms < 60000) return `${ms / 1000}s`;
        return `${ms / 60000}m`;
    };

    return (
        <div className={styles.container} role="main">
            <div className={styles.header}>
                <h1 className={styles.title}>Configuration</h1>
                <p className={styles.subtitle}>System settings and AI configuration</p>
            </div>

            {/* AI Provider Settings */}
            <Panel title="AI Provider Configuration" collapsible={true}>
                <div className={styles.settingsGrid}>
                    <div className={styles.field}>
                        <label>Provider</label>
                        <select
                            value={model.settings.ai.provider}
                            onChange={(e) => updateAISetting('provider', e.target.value as AIProviderType)}
                            className={styles.input}
                        >
                            <option value={AIProviderType.GEMINI}>Google Gemini</option>
                            <option value={AIProviderType.OPENAI}>OpenAI</option>
                            <option value={AIProviderType.ANTHROPIC}>Anthropic Claude</option>
                            <option value={AIProviderType.DEEPSEEK}>DeepSeek</option>
                            <option value={AIProviderType.PERPLEXITY}>Perplexity</option>
                            <option value={AIProviderType.GROK}>xAI Grok</option>
                            <option value={AIProviderType.NONE}>None (Math Only)</option>
                        </select>
                    </div>


                    <div className={styles.field}>
                        <label>Model</label>
                        <input
                            type="text"
                            value={model.settings.ai.model}
                            onChange={(e) => updateAISetting('model', e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Temperature ({model.settings.ai.temperature})</label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={model.settings.ai.temperature}
                            onChange={(e) => updateAISetting('temperature', parseFloat(e.target.value))}
                            className={styles.slider}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Max Tokens</label>
                        <input
                            type="number"
                            value={model.settings.ai.maxTokens}
                            onChange={(e) => updateAISetting('maxTokens', parseInt(e.target.value))}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>API Key</label>
                        <input
                            type="password"
                            value={model.settings.ai.apiKey || ''}
                            onChange={(e) => updateAISetting('apiKey', e.target.value)}
                            className={styles.input}
                            placeholder="Enter your Gemini API Key"
                            minLength={10}
                        />
                        <small className={styles.help}>
                            Get your API key from{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                Google AI Studio
                            </a>
                        </small>
                    </div>
                </div>
            </Panel>

            {/* Calculation Parameters */}
            <Panel title="Calculation Parameters" collapsible={true}>
                <div className={styles.settingsGrid}>
                    <div className={styles.field}>
                        <label>Buffer Size ({model.settings.calculation.bufferSize})</label>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            value={model.settings.calculation.bufferSize}
                            onChange={(e) => updateCalculationSetting('bufferSize', parseInt(e.target.value))}
                            className={styles.slider}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Min Data Points ({model.settings.calculation.minDataPoints})</label>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            value={model.settings.calculation.minDataPoints}
                            onChange={(e) => updateCalculationSetting('minDataPoints', parseInt(e.target.value))}
                            className={styles.slider}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>EMA Fast Period ({model.settings.calculation.emaFastPeriod})</label>
                        <input
                            type="range"
                            min="2"
                            max="50"
                            value={model.settings.calculation.emaFastPeriod}
                            onChange={(e) => updateCalculationSetting('emaFastPeriod', parseInt(e.target.value))}
                            className={styles.slider}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>EMA Slow Period ({model.settings.calculation.emaSlowPeriod})</label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={model.settings.calculation.emaSlowPeriod}
                            onChange={(e) => updateCalculationSetting('emaSlowPeriod', parseInt(e.target.value))}
                            className={styles.slider}
                        />
                    </div>
                </div>
            </Panel>

            {/* Forecast Horizon Settings */}
            <Panel title="Forecast Horizon Settings" collapsible={true}>
                <div className={styles.settingsGrid}>
                    <div className={styles.field}>
                        <label>Show Forecast Horizon</label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={model.settings.forecast.showHorizon}
                                onChange={(e) => updateForecastSetting('showHorizon', e.target.checked)}
                            />
                            <span>Display forecast horizon overlay on charts</span>
                        </label>
                    </div>

                    <div className={styles.field}>
                        <label>Horizon Duration</label>
                        <select
                            value={model.settings.forecast.horizonMs}
                            onChange={(e) => updateForecastSetting('horizonMs', parseInt(e.target.value))}
                            className={styles.input}
                            disabled={!model.settings.forecast.showHorizon}
                        >
                            {model.settings.forecast.horizonPresets.map((preset) => (
                                <option key={preset} value={preset}>
                                    {formatDuration(preset)}
                                </option>
                            ))}
                        </select>
                        <small className={styles.help}>
                            Duration of the forecast prediction window
                        </small>
                    </div>
                </div>
            </Panel>

            {/* WebSocket Settings */}
            <Panel title="WebSocket Settings" collapsible={true}>
                <div className={styles.settingsGrid}>
                    <div className={styles.field}>
                        <label>Reconnection Delay (ms)</label>
                        <input
                            type="number"
                            value={model.settings.websocket.reconnectionDelay}
                            onChange={(e) => updateWebSocketSetting('reconnectionDelay', parseInt(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Max Reconnection Attempts</label>
                        <input
                            type="number"
                            value={model.settings.websocket.maxReconnectionAttempts}
                            onChange={(e) => updateWebSocketSetting('maxReconnectionAttempts', parseInt(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Heartbeat Interval (ms)</label>
                        <input
                            type="number"
                            value={model.settings.websocket.heartbeatInterval}
                            onChange={(e) => updateWebSocketSetting('heartbeatInterval', parseInt(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                </div>
            </Panel>

            {/* Save Actions */}
            <div className={styles.actions}>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={model.isSaving}
                >
                    {model.isSaving ? 'Saving...' : 'Save All Settings'}
                </button>
                <button
                    className={styles.resetButton}
                    onClick={handleReset}
                    disabled={model.isSaving}
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
}

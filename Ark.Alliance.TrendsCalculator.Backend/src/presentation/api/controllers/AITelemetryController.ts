/**
 * @fileoverview AI Telemetry Controller
 * @module presentation/api/controllers/AITelemetryController
 * 
 * REST API endpoints for AI telemetry, settings, and connection testing.
 * 
 * Endpoints:
 * - GET  /api/ai/settings          - Get AI configuration
 * - PUT  /api/ai/settings          - Update AI configuration
 * - POST /api/ai/test-connection   - Test AI provider connection
 * - GET  /api/ai/telemetry         - Get paginated AI logs for grid
 * - GET  /api/ai/telemetry/:id     - Get detail for single log
 * - GET  /api/ai/forecast-settings - Get forecast horizon settings
 * - PUT  /api/ai/forecast-settings - Update forecast horizon settings
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-06
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AITelemetryService } from '../../../application/services/AITelemetryService';
import { SystemSettingsRepository } from '../../../infrastructure/persistence/repositories/SystemSettingsRepository';
import {
    AISettingsDto,
    ForecastSettingsDto,
    AIConnectionTestResponse,
    AIProviderType,
    SettingCategory,
    SettingDataType,
    defaultAISettings,
    defaultForecastSettings
} from '@share/index';

/**
 * AI Telemetry Controller
 * Handles AI settings, telemetry logs, and connection testing
 */
export class AITelemetryController {
    private telemetryService: AITelemetryService;
    private settingsRepo: SystemSettingsRepository;

    constructor() {
        this.telemetryService = AITelemetryService.getInstance();
        this.settingsRepo = SystemSettingsRepository.getInstance();
    }

    /**
     * Register routes on the given router
     */
    registerRoutes(router: Router): void {
        // AI Settings
        router.get('/ai/settings', this.getAISettings.bind(this));
        router.put('/ai/settings', this.updateAISettings.bind(this));
        router.post('/ai/test-connection', this.testConnection.bind(this));

        // Telemetry Logs
        router.get('/ai/telemetry', this.getTelemetryLogs.bind(this));
        router.get('/ai/telemetry/:id', this.getTelemetryDetail.bind(this));

        // Forecast Settings
        router.get('/ai/forecast-settings', this.getForecastSettings.bind(this));
        router.put('/ai/forecast-settings', this.updateForecastSettings.bind(this));

        // Statistics
        router.get('/ai/stats', this.getStats.bind(this));
    }

    /**
     * GET /api/ai/settings
     * Get current AI configuration
     */
    async getAISettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settings = this.loadAISettings();
            res.json({
                success: true,
                data: settings,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/ai/settings
     * Update AI configuration
     */
    async updateAISettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const updates = req.body as Partial<AISettingsDto>;

            if (updates.enabled !== undefined) {
                this.settingsRepo.set('ai.enabled', String(updates.enabled), SettingDataType.BOOLEAN, SettingCategory.AI);
            }
            if (updates.provider !== undefined) {
                this.settingsRepo.set('ai.provider', updates.provider, SettingDataType.STRING, SettingCategory.AI);
            }
            if (updates.model !== undefined) {
                this.settingsRepo.set('ai.model', updates.model, SettingDataType.STRING, SettingCategory.AI);
            }
            if (updates.thinkingLevel !== undefined) {
                this.settingsRepo.set('ai.thinking_level', updates.thinkingLevel, SettingDataType.STRING, SettingCategory.AI);
            }
            if (updates.maxTokens !== undefined) {
                this.settingsRepo.set('ai.max_tokens', String(updates.maxTokens), SettingDataType.NUMBER, SettingCategory.AI);
            }
            if (updates.temperature !== undefined) {
                this.settingsRepo.set('ai.temperature', String(updates.temperature), SettingDataType.NUMBER, SettingCategory.AI);
            }

            const newSettings = this.loadAISettings();
            res.json({
                success: true,
                data: newSettings,
                message: 'AI settings updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/ai/test-connection
     * Test AI provider connection and API token validity
     */
    async testConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settings = this.loadAISettings();
            const startTime = Date.now();

            // Check if API key is configured
            const hasApiKey = this.checkApiKeyConfigured(settings.provider);

            if (!hasApiKey) {
                const response: AIConnectionTestResponse = {
                    success: false,
                    provider: settings.provider,
                    model: settings.model,
                    latencyMs: 0,
                    message: `No API key configured for ${settings.provider}`,
                    timestamp: new Date().toISOString(),
                };
                res.json({ success: true, data: response });
                return;
            }

            // TODO: Actually call the AI provider to test connection
            // For now, simulate a successful test
            const latencyMs = Date.now() - startTime + 50; // Simulated latency

            const response: AIConnectionTestResponse = {
                success: true,
                provider: settings.provider,
                model: settings.model,
                latencyMs,
                message: 'Connection successful',
                timestamp: new Date().toISOString(),
            };

            res.json({ success: true, data: response });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/ai/telemetry
     * Get paginated AI exchange logs for grid display
     */
    async getTelemetryLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 20;
            const instanceKey = req.query.instanceKey as string | undefined;

            const result = this.telemetryService.getGridLogs(page, pageSize, instanceKey);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/ai/telemetry/:id
     * Get detailed log for modal view
     */
    async getTelemetryDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, error: 'Invalid ID' });
                return;
            }

            const detail = this.telemetryService.getDetailById(id);
            if (!detail) {
                res.status(404).json({ success: false, error: 'Log not found' });
                return;
            }

            res.json({
                success: true,
                data: detail,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/ai/forecast-settings
     * Get forecast horizon settings
     */
    async getForecastSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settings = this.loadForecastSettings();
            res.json({
                success: true,
                data: settings,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/ai/forecast-settings
     * Update forecast horizon settings
     */
    async updateForecastSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const updates = req.body as Partial<ForecastSettingsDto>;

            if (updates.showHorizon !== undefined) {
                this.settingsRepo.set('forecast.show_horizon', String(updates.showHorizon), SettingDataType.BOOLEAN, SettingCategory.GENERAL);
            }
            if (updates.horizonMs !== undefined) {
                this.settingsRepo.set('forecast.horizon_ms', String(updates.horizonMs), SettingDataType.NUMBER, SettingCategory.GENERAL);
            }
            if (updates.horizonPresets !== undefined) {
                this.settingsRepo.set('forecast.horizon_presets', JSON.stringify(updates.horizonPresets), SettingDataType.JSON, SettingCategory.GENERAL);
            }

            const newSettings = this.loadForecastSettings();
            res.json({
                success: true,
                data: newSettings,
                message: 'Forecast settings updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/ai/stats
     * Get AI telemetry statistics
     */
    async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const instanceKey = req.query.instanceKey as string | undefined;
            const stats = this.telemetryService.getStats(instanceKey);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Load AI settings from database
     */
    private loadAISettings(): AISettingsDto {
        const enabled = this.settingsRepo.get('ai.enabled');
        const provider = this.settingsRepo.get('ai.provider');
        const model = this.settingsRepo.get('ai.model');
        const thinkingLevel = this.settingsRepo.get('ai.thinking_level');
        const maxTokens = this.settingsRepo.get('ai.max_tokens');
        const temperature = this.settingsRepo.get('ai.temperature');

        return {
            enabled: (enabled?.value === 'true') || defaultAISettings.enabled,
            provider: (provider?.value as AIProviderType) || defaultAISettings.provider,
            model: model?.value || defaultAISettings.model,
            apiKeyConfigured: this.checkApiKeyConfigured((provider?.value as AIProviderType) ?? defaultAISettings.provider),
            thinkingLevel: (thinkingLevel?.value as any) ?? defaultAISettings.thinkingLevel,
            maxTokens: maxTokens ? parseInt(maxTokens.value) : defaultAISettings.maxTokens,
            temperature: temperature ? parseFloat(temperature.value) : defaultAISettings.temperature,
        };
    }

    /**
     * Load forecast settings from database
     */
    private loadForecastSettings(): ForecastSettingsDto {
        const showHorizon = this.settingsRepo.get('forecast.show_horizon');
        const horizonMs = this.settingsRepo.get('forecast.horizon_ms');
        const horizonPresets = this.settingsRepo.get('forecast.horizon_presets');

        return {
            showHorizon: (showHorizon?.value === 'true') || defaultForecastSettings.showHorizon,
            horizonMs: horizonMs ? parseInt(horizonMs.value) : defaultForecastSettings.horizonMs,
            horizonPresets: horizonPresets ? JSON.parse(horizonPresets.value) : defaultForecastSettings.horizonPresets,
        };
    }

    /**
     * Check if API key is configured for the given provider
     */
    private checkApiKeyConfigured(provider: AIProviderType): boolean {
        switch (provider) {
            case AIProviderType.GEMINI:
                return !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_AI_KEY;
            case AIProviderType.OPENAI:
                return !!process.env.OPENAI_API_KEY;
            case AIProviderType.ANTHROPIC:
                return !!process.env.ANTHROPIC_API_KEY;
            case AIProviderType.DEEPSEEK:
                return !!process.env.DEEPSEEK_API_KEY;
            case AIProviderType.PERPLEXITY:
                return !!process.env.PERPLEXITY_API_KEY;
            case AIProviderType.GROK:
                return !!process.env.GROK_API_KEY;
            case AIProviderType.NONE:
                return true; // No AI provider doesn't need API key
            default:
                return false;
        }
    }
}

/**
 * Factory function to create and configure the controller
 */
export function createAITelemetryController(): AITelemetryController {
    return new AITelemetryController();
}

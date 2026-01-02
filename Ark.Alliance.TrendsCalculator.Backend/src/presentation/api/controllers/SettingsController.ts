/**
 * @fileoverview Settings Controller
 * @module api/controllers/SettingsController
 * 
 * REST API endpoints for system settings management.
 * Provides GET/PUT operations for configuration persistence.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 * 
 * @remarks
 * Follows existing controller patterns:
 * - Class-based architecture
 * - Singleton service injection
 * - Microsoft-compliant documentation
 * - Consistent error response format
 */

import { Request, Response } from 'express';
import { SystemSettingsRepository } from '@infrastructure/persistence/repositories/SystemSettingsRepository';
import { systemLogger } from '@infrastructure/SystemLogger';

/**
 * Controller for system settings management operations
 * 
 * @remarks
 * Provides REST endpoints for:
 * - Retrieving all settings (grouped by category)
 * - Updating multiple settings
 * - Retrieving category-specific settings
 */
export class SettingsController {
    private settingsRepo: SystemSettingsRepository;

    /**
     * Creates a new SettingsController instance
     */
    constructor() {
        this.settingsRepo = SystemSettingsRepository.getInstance();
    }

    /**
     * GET /api/settings
     * Retrieves all system settings grouped by category
     * 
     * @param req - Express request object
     * @param res - Express response object
     * @returns Promise resolving when response is sent
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const allSettings = this.settingsRepo.getAll();

            // Group by category for frontend consumption
            const grouped: Record<string, Record<string, any>> = {};

            for (const setting of allSettings) {
                if (!grouped[setting.category]) {
                    grouped[setting.category] = {};
                }

                // Convert to typed value
                let value: any = setting.value;
                if (setting.dataType === 'number') {
                    value = parseFloat(setting.value);
                } else if (setting.dataType === 'boolean') {
                    value = setting.value === 'true';
                } else if (setting.dataType === 'json') {
                    try {
                        value = JSON.parse(setting.value);
                    } catch {
                        value = setting.value;
                    }
                }

                grouped[setting.category][setting.key] = value;
            }

            res.json({
                success: true,
                data: grouped
            });
        } catch (error: any) {
            systemLogger.error(`Failed to get settings: ${error.message}`, {
                source: 'SettingsController',
                error
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'SETTINGS_FETCH_FAILED',
                    message: 'Failed to retrieve settings'
                }
            });
        }
    }

    /**
     * PUT /api/settings
     * Updates multiple system settings at once
     * 
     * @param req - Express request object with settings in body
     * @param res - Express response object
     * @returns Promise resolving when response is sent
     * 
     * @remarks
     * Request body should be structured as: { category: { key: value } }
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const updates = req.body;
            const results: { key: string; success: boolean }[] = [];

            // Flatten and update each setting
            for (const [category, settings] of Object.entries(updates)) {
                if (typeof settings !== 'object' || settings === null) continue;

                for (const [key, value] of Object.entries(settings as Record<string, any>)) {
                    // Convert value to string for storage
                    let stringValue: string;
                    if (typeof value === 'object') {
                        stringValue = JSON.stringify(value);
                    } else {
                        stringValue = String(value);
                    }

                    const success = this.settingsRepo.update(key, stringValue);
                    results.push({ key, success });

                    if (success) {
                        systemLogger.info(`Setting updated: ${key}`, {
                            source: 'SettingsController'
                        });
                    }
                }
            }

            const allSuccess = results.every(r => r.success);

            res.json({
                success: allSuccess,
                message: allSuccess ? 'All settings updated' : 'Some settings failed to update',
                results
            });
        } catch (error: any) {
            systemLogger.error(`Failed to update settings: ${error.message}`, {
                source: 'SettingsController',
                error
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'SETTINGS_UPDATE_FAILED',
                    message: 'Failed to update settings'
                }
            });
        }
    }

    /**
     * GET /api/settings/:category
     * Retrieves settings for a specific category
     * 
     * @param req - Express request object with category param
     * @param res - Express response object
     * @returns Promise resolving when response is sent
     */
    async getByCategory(req: Request, res: Response): Promise<void> {
        try {
            const { category } = req.params;
            const categorySettings = this.settingsRepo.getByCategory(category as any);

            const result: Record<string, any> = {};
            for (const setting of categorySettings) {
                let value: any = setting.value;
                if (setting.dataType === 'number') {
                    value = parseFloat(setting.value);
                } else if (setting.dataType === 'boolean') {
                    value = setting.value === 'true';
                }
                result[setting.key] = value;
            }

            res.json({
                success: true,
                category,
                data: result
            });
        } catch (error: any) {
            systemLogger.error(`Failed to get category settings: ${error.message}`, {
                source: 'SettingsController',
                error
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'CATEGORY_FETCH_FAILED',
                    message: 'Failed to retrieve category settings'
                }
            });
        }
    }
}

/**
 * @fileoverview System Settings Entity
 * @module Data/Entities/SystemSettings
 */

import { SettingDataType, SettingCategory, LogLevel } from '@share/enums';

// Re-export for backward compatibility
export { SettingDataType, SettingCategory, LogLevel };

// Type that accepts both enum values and their underlying string representations
export type SettingDataTypeValue = SettingDataType | 'string' | 'number' | 'boolean' | 'json';
export type SettingCategoryValue = SettingCategory | 'general' | 'account' | 'cache' | 'ratelimit' | 'logging' | 'strategy' | 'binance' | 'binance_endpoints' | 'ai' | 'ai_prompts' | 'ai_configuration' | 'system' | 'inversion';

export interface SystemSetting {
    key: string;
    value: string;
    dataType: SettingDataTypeValue;
    description?: string;
    category: SettingCategoryValue;
    createdAt: number;
    updatedAt: number;
}

/**
 * Typed setting value getter
 */
export function getTypedValue(setting: SystemSetting): string | number | boolean | object {
    switch (setting.dataType) {
        case 'number':
            return parseFloat(setting.value);
        case 'boolean':
            return setting.value === 'true';
        case 'json':
            return JSON.parse(setting.value);
        default:
            return setting.value;
    }
}

/**
 * Row mapper
 */
export function systemSettingFromRow(row: any): SystemSetting {
    return {
        key: row.key,
        value: row.value,
        dataType: row.data_type as SettingDataType,
        description: row.description,
        category: row.category as SettingCategory,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

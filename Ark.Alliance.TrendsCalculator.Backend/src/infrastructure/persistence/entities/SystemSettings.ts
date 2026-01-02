/**
 * @fileoverview System Settings Entity
 * @module Data/Entities/SystemSettings
 */

export type SettingDataType = 'string' | 'number' | 'boolean' | 'json';
export type SettingCategory = 'general' | 'account' | 'cache' | 'ratelimit' | 'logging' | 'strategy' | 'binance' | 'binance_endpoints' | 'ai' | 'ai_prompts' | 'ai_configuration' | 'system' | 'inversion';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SystemSetting {
    key: string;
    value: string;
    dataType: SettingDataType;
    description?: string;
    category: SettingCategory;
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

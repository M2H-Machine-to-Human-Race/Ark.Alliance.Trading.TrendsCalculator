/**
 * @fileoverview Setting Data Type Enum
 * @module enums/config/SettingDataType
 * 
 * Data types for system settings storage.
 * 
 * @author Ark.Alliance Team
 * @version 1.0.0
 * @since 2026-01-06
 */

import { z } from 'zod';

/**
 * Setting data type values
 */
export enum SettingDataType {
    /** String value */
    STRING = 'string',
    /** Numeric value */
    NUMBER = 'number',
    /** Boolean value */
    BOOLEAN = 'boolean',
    /** JSON object value */
    JSON = 'json',
}

/**
 * Zod schema for SettingDataType validation
 */
export const SettingDataTypeSchema = z.nativeEnum(SettingDataType);

/**
 * Type for validated SettingDataType
 */
export type SettingDataTypeValue = z.infer<typeof SettingDataTypeSchema>;

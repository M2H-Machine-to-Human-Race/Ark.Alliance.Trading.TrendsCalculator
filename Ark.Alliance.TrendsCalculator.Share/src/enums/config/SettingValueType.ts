/**
 * @fileoverview Setting Value Type Enum
 * @module enums/config/SettingValueType
 * 
 * Data type of configuration setting values.
 */

import { z } from 'zod';

export enum SettingValueType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    JSON = 'JSON',
}

export const SettingValueTypeSchema = z.nativeEnum(SettingValueType);
export type SettingValueTypeType = z.infer<typeof SettingValueTypeSchema>;

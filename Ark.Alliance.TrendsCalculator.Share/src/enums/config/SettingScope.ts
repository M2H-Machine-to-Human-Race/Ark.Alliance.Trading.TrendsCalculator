/**
 * @fileoverview Setting Scope Enum
 * @module enums/config/SettingScope
 * 
 * Scope of configuration settings.
 */

import { z } from 'zod';

/**
 * Setting scope values
 */
export enum SettingScope {
    /** Global setting for all symbols */
    GLOBAL = 'GLOBAL',
    /** Symbol-specific override */
    SYMBOL = 'SYMBOL',
    /** Contract-specific override */
    CONTRACT = 'CONTRACT',
}

/**
 * Zod schema for SettingScope validation
 */
export const SettingScopeSchema = z.nativeEnum(SettingScope);

export type SettingScopeType = z.infer<typeof SettingScopeSchema>;

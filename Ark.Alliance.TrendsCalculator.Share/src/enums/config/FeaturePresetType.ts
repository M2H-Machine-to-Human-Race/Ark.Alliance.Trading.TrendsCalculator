/**
 * @fileoverview Feature Preset Type Enum
 * @module enums/config/FeaturePresetType
 * 
 * Pre-built configuration presets for mathematical features.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/TrendsMicroService_Analysis.md} Section 16.4
 */

import { z } from 'zod';

/**
 * Feature preset type values
 */
export enum FeaturePresetType {
    /** Minimal: Essential features only, fastest performance */
    MINIMAL = 'MINIMAL',
    /** Standard: Recommended for production trading */
    STANDARD = 'STANDARD',
    /** Advanced: All features enabled for research */
    ADVANCED = 'ADVANCED',
    /** Institutional: Full audit trail, compliance-focused */
    INSTITUTIONAL = 'INSTITUTIONAL',
}

/**
 * Zod schema for FeaturePresetType validation
 */
export const FeaturePresetTypeSchema = z.nativeEnum(FeaturePresetType);

/**
 * Type for validated FeaturePresetType
 */
export type FeaturePresetTypeType = z.infer<typeof FeaturePresetTypeSchema>;

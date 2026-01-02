/**
 * @fileoverview Trend UI Helpers
 * @module helpers/trendHelpers
 * 
 * Utility functions and constants for displaying trend data in the UI.
 * Maps trend analysis data to UI component props (StatusBadge, colors, etc.)
 * 
 * @author Armand Richelet-Kleinberg
 * @created 2026-01-02
 */

import {
    TrendDirection,
    HurstBehavior,
    RegimeType,
    BadgeStatus,
    CONFIDENCE_CONSTANTS,
    BUFFER_CONSTANTS,
    type TrendAnalysisResponseDto
} from '@share/trends';

/**
 * Re-export BadgeStatus for convenience
 */
export { BadgeStatus };

/**
 * Confidence level categories
 */
export enum ConfidenceLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High'
}

/**
 * Maps trend direction to StatusBadge status
 * Uses existing TrendDirection enum from Share
 */
const DIRECTION_STATUS_MAP: Record<TrendDirection, BadgeStatus> = {
    [TrendDirection.LONG]: BadgeStatus.SUCCESS,
    [TrendDirection.SHORT]: BadgeStatus.DANGER,
    [TrendDirection.WAIT]: BadgeStatus.WARNING
};

/**
 * Display labels with icons for trend directions
 */
const DIRECTION_LABELS: Record<TrendDirection, string> = {
    [TrendDirection.LONG]: 'LONG ↑',
    [TrendDirection.SHORT]: 'SHORT ↓',
    [TrendDirection.WAIT]: 'WAIT ⏸'
} as const;

/**
 * Simple labels without icons
 */
const DIRECTION_LABELS_SIMPLE: Record<TrendDirection, string> = {
    [TrendDirection.LONG]: 'LONG',
    [TrendDirection.SHORT]: 'SHORT',
    [TrendDirection.WAIT]: 'WAIT'
} as const;

/**
 * Hurst behavior display labels
 * Uses existing HurstBehavior enum from Share
 */
const HURST_BEHAVIOR_LABELS: Record<HurstBehavior, string> = {
    [HurstBehavior.MEAN_REVERTING]: 'Mean Reverting',
    [HurstBehavior.RANDOM_WALK]: 'Random Walk',
    [HurstBehavior.TRENDING]: 'Trending'
} as const;

/**
 * Regime type display labels
 * Uses existing RegimeType enum from Share
 */
const REGIME_LABELS: Record<RegimeType, string> = {
    [RegimeType.TRENDING_UP]: 'Trending Up',
    [RegimeType.TRENDING_DOWN]: 'Trending Down',
    [RegimeType.RANGING]: 'Ranging',
    [RegimeType.HIGH_VOLATILITY]: 'High Volatility'
} as const;

/**
 * Color palette for confidence levels
 */
const CONFIDENCE_COLORS = {
    LOW: '#ef4444',    // red
    MEDIUM: '#f59e0b', // yellow
    HIGH: '#10b981'    // green
} as const;

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Get StatusBadge status for trend direction
 * 
 * @param direction - Trend direction from analysis
 * @returns StatusBadge status prop
 * 
 * @example
 * ```tsx
 * <StatusBadge status={getTrendStatus(TrendDirection.LONG)}>LONG</StatusBadge>
 * ```
 */
export function getTrendStatus(direction: TrendDirection): BadgeStatus {
    return DIRECTION_STATUS_MAP[direction];
}

/**
 * Get display label for trend direction
 * 
 * @param direction - Trend direction
 * @param withIcon - Include icon (default: true)
 * @returns Display label
 */
export function getTrendLabel(direction: TrendDirection, withIcon: boolean = true): string {
    return withIcon ? DIRECTION_LABELS[direction] : DIRECTION_LABELS_SIMPLE[direction];
}

/**
 * Get display label for Hurst behavior
 * 
 * @param behavior - Hurst behavior from analysis
 * @returns Human-readable label
 */
export function getHurstBehaviorLabel(behavior: HurstBehavior): string {
    return HURST_BEHAVIOR_LABELS[behavior];
}

/**
 * Get display label for regime type
 * 
 * @param regime - Regime type from analysis
 * @returns Human-readable label
 */
export function getRegimeLabel(regime: RegimeType): string {
    return REGIME_LABELS[regime];
}

/**
 * Get confidence level category
 * 
 * @param confidence - Confidence value (0-1)
 * @returns Confidence level enum
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence < CONFIDENCE_CONSTANTS.LOW_THRESHOLD) return ConfidenceLevel.LOW;
    if (confidence < CONFIDENCE_CONSTANTS.MEDIUM_THRESHOLD) return ConfidenceLevel.MEDIUM;
    return ConfidenceLevel.HIGH;
}

/**
 * Get confidence color based on value
 * 
 * @param confidence - Confidence value (0-1)
 * @returns Hex color code
 */
export function getConfidenceColor(confidence: number): string {
    const level = getConfidenceLevel(confidence);
    // Map ConfidenceLevel enum values to CONFIDENCE_COLORS keys
    const colorKey = level === ConfidenceLevel.LOW ? 'LOW' :
        level === ConfidenceLevel.MEDIUM ? 'MEDIUM' : 'HIGH';
    return CONFIDENCE_COLORS[colorKey];
}

/**
 * Format confidence as percentage
 * 
 * @param confidence - Confidence value (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatConfidence(confidence: number, decimals: number = 1): string {
    return `${(confidence * 100).toFixed(decimals)}%`;
}

/**
 * Get EMA crossover status for badge
 * 
 * @param crossover - EMA crossover state from analysis
 * @returns StatusBadge status
 */
export function getEmaCrossoverStatus(crossover?: string): BadgeStatus {
    if (!crossover) return BadgeStatus.INFO;
    const lower = crossover.toLowerCase();
    if (lower === 'bullish') return BadgeStatus.SUCCESS;
    if (lower === 'bearish') return BadgeStatus.DANGER;
    return BadgeStatus.WARNING;
}

/**
 * Format composite score for display
 * 
 * @param score - Composite score from analysis
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted score string
 */
export function formatCompositeScore(score: number, decimals: number = 2): string {
    return score.toFixed(decimals);
}

/**
 * Get buffer progress status
 * 
 * @param bufferPercent - Buffer fill percentage (0-100)
 * @returns StatusBadge status
 */
export function getBufferStatus(bufferPercent: number): BadgeStatus {
    if (bufferPercent < BUFFER_CONSTANTS.MIN_BUFFER_SIZE * 50 / BUFFER_CONSTANTS.DEFAULT_BUFFER_SIZE) return BadgeStatus.DANGER;
    if (bufferPercent < BUFFER_CONSTANTS.FULL_THRESHOLD_PERCENT) return BadgeStatus.WARNING;
    return BadgeStatus.SUCCESS;
}

/**
 * Check if trend analysis has sufficient data
 * 
 * @param analysis - Trend analysis response
 * @returns True if buffer is full enough for reliable analysis
 */
export function hasSufficientData(analysis: TrendAnalysisResponseDto | null): boolean {
    return analysis !== null && (analysis.bufferPercent ?? 0) >= BUFFER_CONSTANTS.FULL_THRESHOLD_PERCENT;
}

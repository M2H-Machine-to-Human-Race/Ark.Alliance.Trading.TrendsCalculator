/**
 * @fileoverview Training Page Data Model
 * @module pages/TrainingPage/TrainingPage.model
 * @description
 * Defines TypeScript interfaces for training metrics and session data.
 * All models are immutable and follow strict typing.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

/**
 * Training accuracy metrics by direction
 * @interface AccuracyMetrics
 * @property {number} overall - Overall accuracy percentage (0-100)
 * @property {number} long - LONG direction accuracy percentage
 * @property {number} short - SHORT direction accuracy percentage
 * @property {number} wait - WAIT direction accuracy percentage
 */
export interface AccuracyMetrics {
    overall: number;
    long: number;
    short: number;
    wait: number;
}

/**
 * Training session record
 * @interface TrainingSession
 * @property {string} id - Unique session identifier
 * @property {string} started - Human-readable start time
 * @property {string} duration - Session duration (e.g., "2h 15m")
 * @property {number} symbols - Number of symbols trained
 * @property {number} predictions - Total predictions made
 * @property {number} accuracy - Session accuracy percentage
 * @property {'completed' | 'running' | 'failed'} status - Session status
 */
export interface TrainingSession {
    id: string;
    started: string;
    duration: string;
    symbols: number;
    predictions: number;
    accuracy: number;
    status: 'completed' | 'running' | 'failed';
}

/**
 * Recent prediction validation result
 * @interface PredictionValidation
 * @property {string} id - Unique validation identifier
 * @property {string} symbol - Trading pair symbol
 * @property {'LONG' | 'SHORT' | 'WAIT'} predicted - Predicted direction
 * @property {'LONG' | 'SHORT' | 'WAIT'} actual - Actual direction
 * @property {boolean} success - Whether prediction was correct
 * @property {string} time - Human-readable time
 */
export interface PredictionValidation {
    id: string;
    symbol: string;
    predicted: 'LONG' | 'SHORT' | 'WAIT';
    actual: 'LONG' | 'SHORT' | 'WAIT';
    success: boolean;
    time: string;
}

/**
 * Complete Training Page state model
 * @interface TrainingPageModel
 * @property {boolean} isLoading - Loading state for async data
 * @property {AccuracyMetrics} accuracy - Accuracy metrics by direction
 * @property {TrainingSession[]} sessions - Training session history
 * @property {PredictionValidation[]} recentPredictions - Recent validation results
 */
export interface TrainingPageModel {
    isLoading: boolean;
    accuracy: AccuracyMetrics;
    sessions: TrainingSession[];
    recentPredictions: PredictionValidation[];
}

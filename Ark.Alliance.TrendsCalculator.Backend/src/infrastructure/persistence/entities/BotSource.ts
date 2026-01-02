/**
 * @fileoverview Bot Source Entity
 * @module Data/Entities/BotSource
 * 
 * Entity model for bot processing sources stored in database.
 */

/**
 * Bot Source status enumeration
 */
export type BotSourceStatus = 'IDLE' | 'RUNNING' | 'ERROR' | 'STARTING' | 'STOPPING';

/**
 * Bot Source entity as stored in database
 */
export interface BotSource {
    /** Unique identifier for the source */
    id: string;

    /** Human-readable name */
    name: string;

    /** Optional description */
    description?: string;

    /** Whether source is active and can be started */
    is_active: boolean;

    /** Whether to auto-start when service starts */
    start_when_service_starts: boolean;

    /** Current runtime status */
    status: BotSourceStatus;

    /** Full JSON configuration (listener + actions) */
    config_json: string;

    /** Optional: linked service instance key */
    instance_key?: string;

    /** Last error message if status = ERROR */
    last_error?: string;

    /** Timestamp of last execution */
    last_run_at?: string;

    /** Creation timestamp */
    created_at?: string;

    /** Last update timestamp */
    updated_at?: string;
}

/**
 * Bot Source creation payload (without auto-generated fields)
 */
export interface CreateBotSourceInput {
    id?: string;  // Optional - will be generated if not provided
    name: string;
    description?: string;
    is_active?: boolean;
    start_when_service_starts?: boolean;
    config_json: string;
    instance_key?: string;
}

/**
 * Bot Source update payload
 */
export interface UpdateBotSourceInput {
    name?: string;
    description?: string;
    is_active?: boolean;
    start_when_service_starts?: boolean;
    config_json?: string;
    instance_key?: string;
    status?: BotSourceStatus;
    last_error?: string;
    last_run_at?: string;
}

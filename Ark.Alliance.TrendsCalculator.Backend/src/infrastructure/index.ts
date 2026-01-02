/**
 * Infrastructure Layer Index
 * 
 * @fileoverview Main export file for the infrastructure layer
 * @module infrastructure
 * 
 * @remarks
 * The infrastructure layer contains implementations of interfaces defined in the domain layer,
 * plus external service integrations (databases, APIs, logging, etc.).
 */

// Persistence (database entities and repository implementations)
export * from './persistence';

// External Services (clients, AI services)
export * from './external';

// Infrastructure Models
export * from './models';

// Logging
export { systemLogger } from './SystemLogger';

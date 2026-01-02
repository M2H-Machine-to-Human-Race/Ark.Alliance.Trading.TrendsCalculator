/**
 * Domain Layer Index
 * 
 * @fileoverview Main export file for the domain layer
 * @module domain
 * 
 * @remarks
 * The domain layer contains pure business logic with ZERO dependencies
 * on external frameworks, databases, or infrastructure concerns.
 * 
 * Following Clean Architecture / Onion Architecture principles:
 * - Entities: Core business  objects
 * - Value Objects: Immutable domain concepts
 * - Repository Interfaces: Contracts for persistence (implemented in infrastructure)
 * - Domain Services: Pure business logic helpers
 * - Models: Domain-specific data structures
 */

// Entities
export * from './entities';

// Value Objects
export * from './value-objects';

// Repository Interfaces (implementations in infrastructure layer)
export * from './repositories';

// Domain Services (pure business logic)
export * from './services';

// Domain Models
export * from './models';

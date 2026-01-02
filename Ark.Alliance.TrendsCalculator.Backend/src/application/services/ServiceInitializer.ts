/**
 * @fileoverview Service Initializer
 * @module application/services/ServiceInitializer
 * 
 * Centralized initialization and lifecycle management for all backend services.
 * Ensures proper startup sequence and graceful shutdown.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-02
 */

import { BaseTradingService } from './base';
import { TrendCalculatorService } from './TrendCalculatorService';
import { SymbolTrackingService } from './SymbolTrackingService';
import { BinanceStreamService } from './BinanceStreamService';
import { systemLogger } from '@infrastructure/SystemLogger';

/**
 * Service Initializer - Manages lifecycle of all backend services
 */
export class ServiceInitializer {
    private static services: BaseTradingService[] = [];
    private static isInitialized = false;

    /**
     * Initialize all backend services in correct order
     * 
     * Order matters:
     * 1. TrendCalculatorService (core calculation engine)
     * 2. SymbolTrackingService (manages tracking state)
     * 3. BinanceStreamService (external data source)
     */
    static async initializeAll(): Promise<void> {
        if (this.isInitialized) {
            systemLogger.warn('Services already initialized, skipping', { source: 'ServiceInitializer' });
            return;
        }

        try {
            console.log('\n🔧 Initializing backend services...\n');

            // Get all service singletons
            const trendCalculator = TrendCalculatorService.getInstance();
            const symbolTracking = SymbolTrackingService.getInstance();
            const binanceStream = BinanceStreamService.getInstance();

            this.services = [trendCalculator, symbolTracking, binanceStream];

            // Start each service in sequence
            for (const service of this.services) {
                const serviceName = service.constructor.name;

                try {
                    console.log(`  ⏳ Starting ${serviceName}...`);
                    await service.start();
                    console.log(`  ✅ ${serviceName} started successfully`);

                    systemLogger.info(`${serviceName} started`, {
                        source: 'ServiceInitializer'
                    });
                } catch (error: any) {
                    console.error(`  ❌ Failed to start ${serviceName}: ${error.message}`);
                    systemLogger.error(`Failed to start ${serviceName}`, {
                        source: 'ServiceInitializer',
                        error
                    });
                    throw error; // Fail fast if critical service fails
                }
            }

            this.isInitialized = true;

            console.log('✨ All backend services initialized successfully');

            // Post-initialization: Add default symbol for development
            console.log('\n⏳ Adding default symbol (BTCUSDT)...');
            try {
                await symbolTracking.startTracking('BTCUSDT');
                console.log('✅ Default symbol BTCUSDT added successfully\n');
            } catch (error: any) {
                console.warn(`⚠️  Could not add default symbol: ${error.message}\n`);
                systemLogger.warn('Failed to add default symbol', {
                    source: 'ServiceInitializer',
                    details: { message: error.message }
                });
            }

            systemLogger.info('All services initialized and running', {
                source: 'ServiceInitializer',
                details: {
                    serviceCount: this.services.length,
                    services: this.services.map(s => s.constructor.name)
                }
            });
        } catch (error: any) {
            console.error('\n❌ Service initialization failed:', error.message);
            systemLogger.error('Service initialization failed', {
                source: 'ServiceInitializer',
                error
            });
            throw error;
        }
    }

    /**
     * Gracefully shutdown all services
     * Called during server shutdown to clean up resources
     */
    static async shutdownAll(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        console.log('\n🛑 Shutting down backend services...\n');

        // Stop services in reverse order
        for (const service of this.services.reverse()) {
            const serviceName = service.constructor.name;

            try {
                console.log(`  ⏳ Stopping ${serviceName}...`);
                await service.stop();
                console.log(`  ✅ ${serviceName} stopped`);

                systemLogger.info(`${serviceName} stopped`, {
                    source: 'ServiceInitializer'
                });
            } catch (error: any) {
                console.error(`  ⚠️ Error stopping ${serviceName}: ${error.message}`);
                systemLogger.error(`Error stopping ${serviceName}`, {
                    source: 'ServiceInitializer',
                    error
                });
                // Continue shutdown even if one service fails
            }
        }

        this.isInitialized = false;
        this.services = [];

        console.log('\n✨ All services shutdown complete\n');
        systemLogger.info('All services shutdown', { source: 'ServiceInitializer' });
    }

    /**
     * Get initialization status
     */
    static isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Get list of initialized services
     */
    static getServices(): BaseTradingService[] {
        return [...this.services];
    }
}

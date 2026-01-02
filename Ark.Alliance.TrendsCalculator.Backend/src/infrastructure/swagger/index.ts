/**
 * Swagger Middleware
 * 
 * @fileoverview Setup Swagger UI for API documentation
 * @module infrastructure/swagger
 */

import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';
import { systemLogger } from '../SystemLogger';

/**
 * Setup Swagger UI middleware
 */
export function setupSwagger(app: Express): void {
    try {
        // Serve Swagger JSON spec
        app.get('/api-docs/swagger.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

        // Serve Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'Trend Analysis API',
            customfavIcon: '/favicon.ico',
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                tryItOutEnabled: true
            }
        }));

        systemLogger.info('Swagger UI initialized at /api-docs', {
            source: 'SwaggerMiddleware'
        });

        // Use http in dev (SSL fallback), https in production
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const port = process.env.PORT || 3075;
        console.log(`📚 Swagger UI available at: ${protocol}://localhost:${port}/api-docs`);

    } catch (error: any) {
        systemLogger.error('Failed to initialize Swagger UI', {
            source: 'SwaggerMiddleware',
            error
        });
        console.error('❌ Swagger UI initialization failed:', error.message);
    }
}

export default setupSwagger;

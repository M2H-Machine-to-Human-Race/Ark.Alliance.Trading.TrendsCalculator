/**
 * Swagger/OpenAPI Configuration
 * 
 * @fileoverview Setup for API documentation
 * @module infrastructure/swagger
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Trend Analysis Microservice API',
            version: '1.0.0',
            description: `
# Trend Analysis Microservice

Professional-grade trend analysis service with AI-powered predictions, market regime detection, and real-time streaming.

## Features

- 📈 **Real-Time Trend Analysis**: Calculate trends from live market data
- 🤖 **AI Integration**: Gemini/OpenAI powered trend confirmation
- 📊 **Market Regime Detection**: Identify trending vs mean-reverting markets
- 🔄 **WebSocket Streaming**: Real-time updates via Socket.IO
- ⚙️ **Dynamic Configuration**: Feature toggles and parameter tuning
- 📝 **SQLite Persistence**: All data stored locally

## Architecture

Clean Architecture with Domain-Driven Design:
- **Domain Layer**: Pure business logic and mathematical helpers
- **Application Layer**: Use cases and services
- **Infrastructure Layer**: Database, APIs, WebSocket
- **Presentation Layer**: REST API controllers

## Authentication

Currently no authentication required. Future versions will support:
- API Key authentication
- JWT tokens
- OAuth 2.0

## Rate Limiting

No rate limiting currently applied. Use responsibly.

## Support

For issues or questions, contact the development team.
            `,
            contact: {
                name: 'Ark Alliance Trading Team',
                email: 'support@arkalliance.trading'
            },
            license: {
                name: 'Proprietary',
                url: 'https://arkalliance.trading/license'
            }
        },
        servers: [
            {
                url: `https://localhost:${process.env.PORT || 3001}`,
                description: 'Development server (HTTPS)'
            },
            {
                url: `https://localhost:${process.env.PORT || 3001}/api`,
                description: 'API base path (HTTPS)'
            },
            {
                url: `http://localhost:${process.env.PORT || 3001}`,
                description: 'Development server (HTTP fallback)'
            }
        ],
        tags: [
            {
                name: 'Trends',
                description: 'Trend analysis operations'
            },
            {
                name: 'Symbols',
                description: 'Symbol tracking management'
            },
            {
                name: 'Settings',
                description: 'System configuration'
            },
            {
                name: 'Health',
                description: 'System health and monitoring'
            },
            {
                name: 'Training',
                description: 'Training mode and evaluation'
            }
        ],
        components: {
            schemas: {
                TrendDirection: {
                    type: 'string',
                    enum: ['LONG', 'SHORT', 'WAIT'],
                    description: 'Predicted trend direction'
                },
                VolatilityClassification: {
                    type: 'string',
                    enum: ['LOW', 'MODERATE', 'HIGH', 'EXTREME'],
                    description: 'Market volatility level'
                },
                RegimeType: {
                    type: 'string',
                    enum: ['TRENDING', 'MEAN_REVERTING', 'HIGH_VOLATILITY', 'LOW_VOLATILITY', 'TRANSITIONING', 'CHOPPY', 'UNKNOWN'],
                    description: 'Market regime classification'
                },
                TrendResult: {
                    type: 'object',
                    properties: {
                        symbol: {
                            type: 'string',
                            example: 'BTCUSDT'
                        },
                        direction: {
                            $ref: '#/components/schemas/TrendDirection'
                        },
                        compositeScore: {
                            type: 'number',
                            format: 'float',
                            description: 'Composite trend score',
                            example: 0.65
                        },
                        confidence: {
                            type: 'number',
                            format: 'float',
                            minimum: 0,
                            maximum: 1,
                            description: 'Confidence level (0-1)',
                            example: 0.82
                        },
                        slope: {
                            type: 'number',
                            format: 'float',
                            description: 'Linear regression slope'
                        },
                        timestamp: {
                            type: 'integer',
                            format: 'int64',
                            description: 'Unix timestamp',
                            example: 1703721600
                        },
                        regime: {
                            $ref: '#/components/schemas/RegimeType'
                        },
                        volatility: {
                            $ref: '#/components/schemas/VolatilityClassification'
                        }
                    },
                    required: ['symbol', 'direction', 'compositeScore', 'confidence', 'timestamp']
                },
                SymbolTracking: {
                    type: 'object',
                    properties: {
                        symbol: {
                            type: 'string',
                            example: 'ETHUSDT'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        },
                        bufferSize: {
                            type: 'integer',
                            example: 200
                        },
                        currentBufferCount: {
                            type: 'integer',
                            example: 150
                        },
                        lastPrice: {
                            type: 'number',
                            format: 'float',
                            example: 2245.67
                        },
                        aiAnalysisEnabled: {
                            type: 'boolean',
                            example: true
                        }
                    },
                    required: ['symbol', 'isActive', 'bufferSize']
                },
                SystemSetting: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string',
                            example: 'buffer_size'
                        },
                        value: {
                            type: 'string',
                            example: '200'
                        },
                        valueType: {
                            type: 'string',
                            enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ENUM']
                        },
                        category: {
                            type: 'string',
                            example: 'CALCULATION'
                        },
                        description: {
                            type: 'string',
                            example: 'Price buffer size for trend calculation'
                        }
                    },
                    required: ['key', 'value', 'valueType']
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Symbol not found'
                        },
                        message: {
                            type: 'string',
                            example: 'The requested symbol INVALID does not exist'
                        },
                        statusCode: {
                            type: 'integer',
                            example: 404
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                HealthStatus: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['healthy', 'degraded', 'unhealthy'],
                            example: 'healthy'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        services: {
                            type: 'object',
                            properties: {
                                database: {
                                    type: 'string',
                                    enum: ['up', 'down'],
                                    example: 'up'
                                },
                                websocket: {
                                    type: 'string',
                                    enum: ['up', 'down'],
                                    example: 'up'
                                },
                                ai: {
                                    type: 'string',
                                    enum: ['up', 'down'],
                                    example: 'up'
                                }
                            }
                        },
                        uptime: {
                            type: 'number',
                            description: 'Uptime in seconds',
                            example: 3600
                        }
                    }
                }
            },
            responses: {
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                BadRequest: {
                    description: 'Invalid request parameters',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                InternalError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [
        './src/presentation/api/controllers/*.ts',
        './src/presentation/api/routes/*.ts'
    ]
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;

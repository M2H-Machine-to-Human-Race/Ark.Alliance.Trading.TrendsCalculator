/**
 * @fileoverview API Routes
 * @module api/routes
 * 
 * Main router configuration for all API endpoints
 */

import { Router } from 'express';
import { TrendController } from '../controllers/TrendController';
import { SymbolController } from '../controllers/SymbolController';
import { HealthController } from '../controllers/HealthController';
import { BinanceController } from '../controllers/BinanceController';
import { SettingsController } from '../controllers/SettingsController';
import { AIController } from '../controllers/AIController';

const router = Router();

// Initialize controllers
const trendController = new TrendController();
const symbolController = new SymbolController();
const healthController = new HealthController();
const binanceController = new BinanceController();
const settingsController = new SettingsController();
const aiController = new AIController();

// Health endpoints
router.get('/health', (req, res) => healthController.check(req, res));
router.get('/health/detailed', (req, res) => healthController.detailedCheck(req, res));

// Trend analysis endpoints
router.get('/trend/:symbol/analyze', (req, res) => trendController.analyzeTrend(req, res));
router.post('/trend/analyze', (req, res) => trendController.analyzeWithParams(req, res));
router.get('/trend/:symbol/history', (req, res) => trendController.getHistory(req, res));

// Symbol tracking endpoints
router.post('/symbol/track', (req, res) => symbolController.startTracking(req, res));
router.delete('/symbol/:symbol/track', (req, res) => symbolController.stopTracking(req, res));
router.get('/symbol/:symbol/status', (req, res) => symbolController.getStatus(req, res));
router.get('/symbol/:symbol/info', (req, res) => symbolController.getSymbolInfo(req, res));
router.get('/symbol', (req, res) => symbolController.listAll(req, res));

// Binance connection endpoints
router.post('/binance/test-connection', (req, res) => binanceController.testConnection(req, res));
router.post('/binance/connect', (req, res) => binanceController.connect(req, res));
router.post('/binance/disconnect', (req, res) => binanceController.disconnect(req, res));
router.get('/binance/status', (req, res) => binanceController.getStatus(req, res));
router.get('/binance/klines', (req, res) => binanceController.getKlines(req, res));
router.get('/binance/symbols', (req, res) => binanceController.getAvailableSymbols(req, res));

// Settings endpoints
router.get('/settings', (req, res) => settingsController.getAll(req, res));
router.put('/settings', (req, res) => settingsController.update(req, res));
router.get('/settings/:category', (req, res) => settingsController.getByCategory(req, res));

// AI Analysis endpoints
router.post('/ai/analyze', (req, res) => aiController.analyze(req, res));
router.get('/ai/status', (req, res) => aiController.getStatus(req, res));

export default router;


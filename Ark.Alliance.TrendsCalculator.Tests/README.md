# Ark.Alliance.TrendsCalculator.Tests

> **Trend Analysis Microservice - JSON-Based Test Generator**

---

## Description

Test project following the pattern from `Ark.Alliance.React.Component.UI.Tests`:
- **JSON Scenarios** - Test configurations in JSON format
- **Mock Data Generator** - Realistic price data generation
- **Validation Engine** - Expected vs actual comparison
- **Live Market Validation** - Real Binance WebSocket integration

## Project Structure

```
├── core/
│   ├── TestScenarioLoader.ts   # Load JSON test configs
│   ├── TrendTestEngine.ts      # Execute test scenarios
│   ├── MockDataGenerator.ts    # Generate price data
│   └── ValidationEngine.ts     # Compare results
├── fixtures/
│   ├── data/
│   │   ├── scenarios/          # JSON test scenarios
│   │   │   ├── ai-telemetry/   # AI prediction accuracy tests
│   │   │   ├── linear-regression.json
│   │   │   ├── stationarity-testing.json
│   │   │   └── ...
│   │   └── mock-data/          # Pre-generated test data
│   ├── TestRunner.ts
│   └── index.ts
├── ai/                         # AI-specific tests
├── integration/                # API & Socket.IO tests
├── unit/                       # Unit tests
└── vitest.config.ts
```

---

## Test Results Summary

| Category | Tests | Status |
|----------|-------|--------|
| AI Telemetry Accuracy | 19 | ✅ Pass |
| AI Live Validation | 4 | ✅ Pass |
| Statistics | 25 | ✅ Pass |
| Indicators | 12 | ✅ Pass |
| Integration | 30+ | ✅ Pass* |
| **Total** | **170+** | **✅ 170 Pass** |

> *Note: 3 integration tests may fail due to backend health check startup timing (pre-existing issue)

---

## Complete Test File Reference

### AI Tests (`src/ai/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `ai-prompts.test.ts` | AI prompt template generation and validation | 8 | - |
| `ai-telemetry-accuracy.test.ts` | AI prediction accuracy with known-answer fixtures | 19 | [AITEL-001 to 004](#ai-telemetry-fixtures) |

### Integration Tests (`src/integration/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `ai-live-validation.test.ts` | Real Binance WebSocket SOLUSDT prediction validation | 4 | - |
| `ai-telemetry-api.test.ts` | AI Telemetry REST API endpoints | 12 | - |
| `api.test.ts` | Backend REST API integration | 15 | - |
| `socketio.test.ts` | Socket.IO real-time events | 10 | - |
| `ForecastSampleComparison.test.ts` | Forecast sample comparison | 5 | - |
| `LiveAIAnalysis.test.ts` | Live AI analysis integration | 4 | - |
| `LiveMarketValidation.test.ts` | Live market data validation | 6 | - |

### Statistics Tests (`src/statistics/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `statistics.test.ts` | LinearRegression, Stationarity, Autocorrelation | 25 | `linear-regression.json`, `stationarity-testing.json` |

### Indicator Tests (`src/indicators/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `indicators.test.ts` | EMA, SMA, RSI, Hurst calculations | 12 | `hurst-exponent.json` |

### Volatility Tests (`src/volatility/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `garch.test.ts` | GARCH volatility modeling | 10 | `garch-testing.json` |

### Regime Tests (`src/regime/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `regime.test.ts` | Market regime detection | 8 | `regime-testing.json` |

### Metrics Tests (`src/metrics/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `metrics.test.ts` | Performance metrics calculations | 10 | - |

### Unit Tests (`src/unit/`)

| Test File | Description | Tests | JSON Fixture |
|-----------|-------------|-------|--------------|
| `helpers.test.ts` | Utility function unit tests | 15 | - |
| `viewmodels.test.ts` | ViewModel logic tests | 12 | - |

---

## AI Telemetry Fixtures

Mathematically generated time series with known expected answers:

| Fixture | Expected Answer | Confidence Range | Description |
|---------|-----------------|------------------|-------------|
| [AITEL-001-strong-uptrend.json](src/fixtures/data/scenarios/ai-telemetry/AITEL-001-strong-uptrend.json) | **LONG** | 0.70 - 1.0 | 5% uptrend with increasing volume |
| [AITEL-002-strong-downtrend.json](src/fixtures/data/scenarios/ai-telemetry/AITEL-002-strong-downtrend.json) | **SHORT** | 0.70 - 1.0 | 5% downtrend with lower lows |
| [AITEL-003-sideways-oscillation.json](src/fixtures/data/scenarios/ai-telemetry/AITEL-003-sideways-oscillation.json) | **WAIT** | 0.0 - 0.5 | Ranging market with unclear direction |
| [AITEL-004-reversal-bullish.json](src/fixtures/data/scenarios/ai-telemetry/AITEL-004-reversal-bullish.json) | **LONG** | 0.55 - 0.85 | V-shaped reversal pattern |

---

## Test Scenario Format

```json
{
    "id": "AITEL-001",
    "name": "Strong Uptrend - Expected LONG",
    "component": "AITelemetryAccuracy",
    "category": "ai-telemetry",
    "input": {
        "symbol": "TESTUSDT",
        "lastPrice": 105.00,
        "klines": [/* 10 candles */]
    },
    "expectedResults": {
        "tendance": "LONG",
        "confidenceMin": 0.70,
        "confidenceMax": 1.0
    }
}
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/ai/ai-telemetry-accuracy.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run AI tests only
npm test -- src/ai/

# Run integration tests only
npm test -- src/integration/
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for live AI tests | - |
| `BACKEND_URL` | Backend API URL | `http://localhost:3075` |

### Running with Gemini API

```bash
GEMINI_API_KEY=your_key npm test -- src/ai/ai-telemetry-accuracy.test.ts
```

---

## Related Documents

- [Backend README](../Ark.Alliance.TrendsCalculator.Backend/README.md)
- [Frontend README](../Ark.Alliance.TrendsCalculator.Ui/README.md)
- [Share Layer README](../Ark.Alliance.TrendsCalculator.Share/README.md)

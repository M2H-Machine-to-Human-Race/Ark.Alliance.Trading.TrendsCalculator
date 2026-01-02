# Ark.Alliance.TrendsCalculator.Tests

> **Trend Analysis Microservice - JSON-Based Test Generator**

---

## Description

Test project following the pattern from `Ark.Alliance.React.Component.UI.Tests`:
- **JSON Scenarios** - Test configurations in JSON format
- **Mock Data Generator** - Realistic price data generation
- **Validation Engine** - Expected vs actual comparison

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
│   │   │   ├── linear-regression.json
│   │   │   ├── stationarity-testing.json
│   │   │   ├── autocorrelation-testing.json
│   │   │   ├── hurst-exponent.json
│   │   │   └── ...
│   │   └── mock-data/          # Pre-generated test data
│   ├── TestRunner.ts
│   └── index.ts
├── config/
│   ├── test-config.json
│   └── test-presets.json
├── vitest.config.ts
└── setup.ts
```

## Test Scenario Format

```json
{
    "id": "stat-001",
    "name": "Stationarity Quick Check",
    "component": "StationarityHelper",
    "category": "statistics",
    "description": "Verify quickStationarityCheck returns true",
    "input": {
        "prices": [100, 101, 99, 100.5, 99.5]
    },
    "expectedResults": {
        "isStationary": true
    },
    "tags": ["critical", "stationarity"],
    "mathDocReference": "Docs/Math/Stationarity_ADF_Testing.md"
}
```

## Test Categories

| Category | Scenarios | Coverage |
|----------|-----------|----------|
| **statistics** | 4 files | LinearRegression, Stationarity, Autocorrelation |
| **indicators** | 2 files | EMA/SMA, Hurst |
| **volatility** | 2 files | ATR, GARCH |
| **advanced** | 3 files | WalkForward, Regime |
| **integration** | 3 files | Full flow tests |

## Mock Data Generator

```typescript
const mock = new MockDataGenerator();

// Generate trending up prices
const trendingUp = mock.generateTrendingPrices(100, 'up');

// Generate oscillating prices
const oscillating = mock.generateOscillatingPrices(100, 0.02);

// Generate with target Hurst exponent
const hurstData = mock.generateFromHurst(100, 0.35);
```

## Scripts

```bash
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report
npm run test:ui         # Vitest UI
```

## Related Documents

- [Ark.Alliance.React.Component.UI.Tests](../Ark.Alliance.React.Component.UI.Tests/)
- [Math Documents](../Docs/Math/)

# Live Market Validation Test - Implementation Notes

## Requirement (User Request)

Create a **live integration test** that validates trend calculation accuracy using real Binance market data.

### Test Specifications

**Data Collection**:
- Fetch last 30 seconds of tick data for **Top 50 market cap symbols** from Binance Futures USD-M
- Source: WebSocket real-time data

**Analysis Approach**:
1. **Training Period** (First 15 seconds):
   - Calculate trends using ALL math helper combinations:
     - Linear Regression
     - EMA/SMA crossovers
     - Hurst Exponent
     - GARCH volatility
     - Regime Detection (Simple + Multi-Factor)
     - Comprehensive trend score
   
2. **Validation Period** (Last 15 seconds):
   - Use as "ground truth" to validate predictions
   - Compare predicted trend direction vs actual price movement

**Success Criteria**:
- Calculate accuracy: (Correct Predictions / Total Symbols) × 100
- **Test PASSES if accuracy ≥ 70%**
- **Test FAILS if accuracy < 70%**

**Report Output** (Console):
```
Symbol         | Predicted Trend | Actual Trend | Correct?
BTCUSDT       | LONG (+0.72)    | LONG         | ✓
ETHUSDT       | SHORT (-0.65)   | SHORT        | ✓
BNBUSDT       | WAIT (0.12)     | RANGING      | ✓
...
----------------------------------------
Accuracy: 38/50 = 76% ✓ PASS
```

### Implementation Location

**File**: `Ark.Alliance.TrendsCalculator.Tests/src/integration/LiveMarketValidation.test.ts`

**Key Components Needed**:
1. Binance market cap fetcher (Top 50 symbols)
2. WebSocket 30-second data collector
3. Trend calculator using all helpers
4. Validation logic (compare prediction vs reality)
5. Accuracy calculator and reporter

### Dependencies

- BinanceWSClient (already created ✓)
- StreamingAnalysisService (already created ✓)
- All math helpers (GARCH, Regime, etc.)
- TrendCalculatorService integration

### Priority

**HIGH** - This is the ultimate validation of the entire mathematical framework in real market conditions.

Will implement after completing current GARCH unit tests.

# Ark.Alliance.TrendsCalculator.Share

> **Shared DTOs and Enums for Trend Analysis Microservice**

---

## Description

TypeScript library containing all shared types for communication between:
- Backend service
- Dashboard UI
- Test project

All DTOs include **Zod validation schemas** for runtime type checking.

## Project Structure

```
src/
├── enums/
│   ├── trend/              # TrendDirection, CalculationMethod, etc.
│   ├── training/           # TrainingSessionStatus, etc.
│   ├── ai/                 # AIProviderType, MABias
│   ├── config/             # FeaturePresetType, RegimeType, etc.
│   └── index.ts
├── dto/
│   ├── request/            # API request DTOs
│   ├── response/           # API response DTOs
│   ├── entity/             # Database entity DTOs
│   ├── config/             # Feature configuration DTOs
│   ├── math/               # Mathematical result DTOs
│   └── index.ts
└── index.ts                # Main exports
```

## Enum Catalog

| Category | Enums |
|----------|-------|
| **trend/** | `TrendDirection`, `CalculationMethod`, `ValidationStatus`, `TrendPrecision` |
| **training/** | `TrainingSessionStatus`, `ForecastEvaluationResult` |
| **ai/** | `AIProviderType`, `MABias` |
| **config/** | `FeaturePresetType`, `RegimeType`, `HurstBehavior`, +9 more |

## DTO Categories

| Category | DTOs | Purpose |
|----------|------|---------|
| **request/** | 6 DTOs | API inputs (StartTracking, AnalyzeTrend, etc.) |
| **response/** | 9 DTOs | API outputs (TrendAnalysis, SymbolStatus, etc.) |
| **entity/** | 8 DTOs | Database entities |
| **config/** | 9 DTOs | Feature toggle configurations |
| **math/** | 8 DTOs | Mathematical calculation results |

## Usage

```typescript
import { 
    TrendDirection,
    TrendAnalysisResponseDto,
    StationarityConfigDto 
} from 'ark.alliance.trendscalculator.share';
```

## Validation

All DTOs include Zod schemas:

```typescript
import { TrendAnalysisResponseDtoSchema } from './dto/response/TrendAnalysisResponseDto';

const validated = TrendAnalysisResponseDtoSchema.parse(data);
```

## Scripts

```bash
npm run build    # Compile TypeScript
npm run test     # Run validation tests
```

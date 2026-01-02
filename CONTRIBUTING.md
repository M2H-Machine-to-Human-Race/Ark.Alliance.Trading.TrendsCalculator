# Contributing to Ark Alliance Trends Calculator

Thank you for your interest in contributing! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## 📜 Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be professional** in all interactions
- **Focus on what is best** for the community
- **Show empathy** towards other community members

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** for version control
- **TypeScript** knowledge recommended
- **React** knowledge for frontend work

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Ark.Alliance.Trading.TrendsCalculator.git
cd Ark.Alliance.Trading.TrendsCalculator

# Add upstream remote
git remote add upstream https://github.com/M2H-Machine-to-Human-Race/Ark.Alliance.Trading.TrendsCalculator.git
```

---

## 💻 Development Setup

### 1. Install Dependencies

```bash
# Install Share dependencies (DTOs and Enums)
cd Ark.Alliance.TrendsCalculator.Share
npm install
npm run build

# Install Backend dependencies
cd ../Ark.Alliance.TrendsCalculator.Backend
npm install

# Install Frontend dependencies
cd ../Ark.Alliance.TrendsCalculator.Ui
npm install
```

### 2. Configure Environment

Create a `.env` file in the backend project:

```bash
cd Ark.Alliance.TrendsCalculator.Backend
cp .env.example .env
```

Edit `.env` with your configuration:
- Binance API credentials (or use testnet)
- Google Gemini API key (for AI features)
- Port configurations

### 3. Build and Run

```bash
# Build Share project first
cd Ark.Alliance.TrendsCalculator.Share
npm run build

# Start Backend (from Backend directory)
cd ../Ark.Alliance.TrendsCalculator.Backend
npm run dev

# Start Frontend (from UI directory, in a new terminal)
cd ../Ark.Alliance.TrendsCalculator.Ui
npm run dev
```

---

## 📁 Project Structure

```
Ark.Alliance.Trading.TrendsCalculator/
├── Ark.Alliance.TrendsCalculator.Backend/    # Node.js REST API + WebSocket
│   ├── src/
│   │   ├── application/services/             # Business logic
│   │   ├── domain/                           # Mathematical algorithms
│   │   ├── infrastructure/                   # External integrations
│   │   └── presentation/api/                 # Controllers & routes
│   └── README.md
│
├── Ark.Alliance.TrendsCalculator.Share/      # Shared DTOs & Enums
│   ├── src/
│   │   ├── dto/                              # Data Transfer Objects
│   │   ├── enums/                            # Enumerations
│   │   └── Constants.ts                      # Shared constants
│   └── README.md
│
├── Ark.Alliance.TrendsCalculator.Ui/         # React Frontend
│   ├── src/
│   │   ├── components/                       # UI Components (MVVM)
│   │   ├── contexts/                         # React Contexts
│   │   ├── helpers/                          # Utility functions
│   │   ├── pages/                            # Page components (MVVM)
│   │   └── services/                         # API clients
│   └── README.md
│
└── Ark.Alliance.TrendsCalculator.Tests/      # Test suite
```

---

## 🤝 How to Contribute

### Types of Contributions

- 🐛 **Bug Reports**: Found a bug? Open an issue
- ✨ **Feature Requests**: Have an idea? Propose it
- 🔧 **Bug Fixes**: Submit a pull request
- 📚 **Documentation**: Improve docs
- 🧪 **Tests**: Add test coverage
- 🎨 **UI/UX**: Enhance user interface
- 📊 **Algorithms**: Improve mathematical indicators

### Reporting Bugs

When reporting bugs, include:
- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (Node version, OS, browser)
- **Code samples** or error messages
- **Screenshots/videos** if applicable
- **Possible solution** (if you have one)

Use the bug report template when creating an issue.

### Suggesting Features

When suggesting features:
- **Explain the use case** and problem it solves
- **Describe the proposed solution**
- **Consider alternatives** you've evaluated
- **Show examples** or mockups if applicable
- **Discuss impact** on existing functionality

---

## 🎨 Coding Standards

### TypeScript Style

```typescript
// ✅ Good: Clear interfaces and types from Share
import { TrendDirection, TrendAnalysisResponseDto } from '@share/trends';

interface TrendRequest {
  symbol: string;
  method?: CalculationMethod;
  forceRecalculation?: boolean;
}

// ✅ Good: Async/await with proper error handling
async function analyzeTrend(symbol: string): Promise<TrendAnalysisResponseDto> {
  try {
    const result = await trendService.calculate(symbol);
    return result;
  } catch (error) {
    logger.error('Trend analysis failed', { symbol, error });
    throw error;
  }
}

// ❌ Bad: Using `any` type
function processData(data: any): any {
  // Avoid this
}
```

### Naming Conventions

| Type | Convention | Example |
|:-----|:-----------|:--------|
| **Classes** | PascalCase | `TrendCalculatorService` |
| **Interfaces** | PascalCase | `ITrendAnalyzer` |
| **Functions** | camelCase | `calculateHurstExponent()` |
| **Constants** | UPPER_SNAKE_CASE | `DEFAULT_BUFFER_SIZE` |
| **Enums** | PascalCase | `TrendDirection` |
| **Files** | PascalCase | `TrendCalculator.ts` |

### Frontend: MVVM Pattern

All UI components **must** follow the MVVM pattern:

```typescript
// ✅ Correct structure
ComponentName/
├── ComponentName.model.ts      // Types, interfaces, validation
├── ComponentName.viewmodel.ts  // Business logic, hooks
├── ComponentName.tsx           // View/UI only
├── ComponentName.module.css    // Scoped styles
└── index.ts                    // Barrel export
```

### Code Organization

- **One class/component per file** (except related types)
- **Group related functionality** in folders
- **Use barrel exports** (`index.ts`)
- **Keep functions pure** when possible
- **Use enums from Share** - never hardcode string literals
- **Import from Share** for all shared types

### Documentation

```typescript
/**
 * Calculates the Hurst Exponent for a given price series.
 * 
 * @param prices - Array of price values
 * @param lags - Array of lag values to test
 * @returns Hurst exponent result with behavior classification
 * 
 * @remarks
 * The Hurst exponent determines market persistence:
 * - H < 0.5: Mean-reverting (anti-persistent)
 * - H ≈ 0.5: Random walk
 * - H > 0.5: Trending (persistent)
 * 
 * @example
 * ```typescript
 * const result = calculateHurstExponent(prices, [10, 20, 50]);
 * console.log(`Hurst: ${result.hurstExponent}, Behavior: ${result.behavior}`);
 * ```
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2025-12-28
 */
function calculateHurstExponent(
  prices: number[],
  lags?: number[]
): HurstExponentResult
```

---

## 🧪 Testing Requirements

### Test Coverage

- All new features **must include tests**
- Bug fixes **must include regression tests**
- Aim for **>80% code coverage**
- Test both success and error cases

### Running Tests

```bash
# Backend tests
cd Ark.Alliance.TrendsCalculator.Backend
npm test

# Frontend tests
cd Ark.Alliance.TrendsCalculator.Ui
npm test

# Run linting
npm run lint
```

---

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Follow coding standards
- Write tests
- Update documentation
- Commit with clear messages

### 3. Commit Guidelines

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(backend): add GARCH volatility forecasting"
git commit -m "fix(ui): correct WebSocket reconnection logic"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(trend): add Hurst exponent edge cases"
git commit -m "refactor(share): consolidate enum definitions"
```

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

### 5. PR Checklist

- [ ] Code follows style guidelines
- [ ] MVVM pattern followed (for UI components)
- [ ] All enums/types imported from Share
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated (README, JSDoc)
- [ ] No merge conflicts
- [ ] Commit messages are clear
- [ ] No credentials or API keys in code
- [ ] Linting passes (`npm run lint`)

### 6. Review Process

- **All PRs require approval** from the project owner (@Criprtoswiss)
- The repository uses a **CODEOWNERS** file that automatically requests reviews
- PRs must target the `develop` branch (not `main` directly)
- Address feedback promptly
- Keep PR focused and small (<500 lines if possible)
- Be patient and respectful

### 7. Branch Protection Rules

| Branch | Protection |
|:-------|:-----------|
| `main` | Protected - No direct pushes, PRs from `develop` only, owner approval required |
| `develop` | Protected - PRs require owner approval, status checks must pass |
| `feature/*` | Development branches - Create from `develop`, merge back to `develop` |
| `fix/*` | Bug fix branches - Create from `develop`, merge back to `develop` |

---

## 🌐 Adding New Features

### Adding New Trend Indicators

1. **Create algorithm** in `Backend/src/domain/services/indicators/`
2. **Add DTO** in `Share/src/dto/math/`
3. **Add enum** if needed in `Share/src/enums/`
4. **Integrate in** `TrendCalculatorService`
5. **Add UI display** with helper functions
6. **Write tests**
7. **Update documentation**

### Adding New UI Components

1. **Check ark-alliance-react-ui** library first
2. **Create MVVM structure** (.model.ts, .viewmodel.ts, .tsx, .module.css)
3. **Use helpers** from `helpers/trendHelpers.ts`
4. **Import types from Share**
5. **Write component tests**
6. **Document props and usage**

---

## 💬 Community

- **Repository**: https://github.com/M2H-Machine-to-Human-Race/Ark.Alliance.Trading.TrendsCalculator
- **Issues**: https://github.com/M2H-Machine-to-Human-Race/Ark.Alliance.Trading.TrendsCalculator/issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: armand@m2h.io for direct contact

### Governance

- **Project Owner**: @Criprtoswiss (Armand Richelet-Kleinberg)
- **All contributions** require owner approval via CODEOWNERS
- **New members** must be approved by the project owner
- **Branch protection** enforced on `main` and `develop` branches

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Ark Alliance Trends Calculator!** 🚀

*Last Updated: 2026-01-02*  
*Author: Armand Richelet-Kleinberg*  
*Developed with the assistance of [Claude Sonnet](https://www.anthropic.com/claude) (Anthropic AI)*

# Ark.Alliance.TrendsCalculator.Ui

**Enterprise-Grade React Dashboard for Real-Time Trend Analysis**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Professional dashboard for visualizing and managing cryptocurrency trend predictions powered by mathematical analysis and AI insights.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Integration](#integration)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The **Ark.Alliance.TrendsCalculator.Ui** is a production-ready React dashboard that provides real-time trend analysis visualization for cryptocurrency markets. Built with enterprise-grade architecture following strict MVVM patterns, the application delivers:

- **Real-time Updates**: WebSocket integration for live trend data
- **Professional UI/UX**: Polished interface with Ark.Alliance design system
- **Type Safety**: 100% TypeScript with Share project integration
- **Scalability**: Clean architecture supporting future enhancements
- **Testing**: Comprehensive unit and integration test coverage

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| Socket.IO Client | 4.7 | WebSocket communication |
| Axios | 1.6 | HTTP client |
| React Router | 6.20 | Client-side routing |
| Font Awesome | 7.1 | Icon library |
| Zod | 3.22 | Runtime validation |

---

## Features

### ✅ Core Functionality

#### 1. Overview Dashboard
- **Real-time Metrics**: Active symbols, trend directions, average strength
- **Circular Gauges**: Visual indicators for key metrics
- **Trend Table**: Live table of all tracked symbols with directions
- **Recent Events**: Timeline of system events and updates
- **Connection Status**: WebSocket connection indicator

#### 2. Symbol Management
- **Add Symbols**: Track new cryptocurrency pairs (e.g., BTCUSDT)
- **Remove Symbols**: Stop tracking symbols
- **Symbol Validation**: Uppercase, non-empty validation
- **Active List**: View all currently tracked symbols
- **Buffer Progress**: Real-time buffer fill status

#### 3. Trend Visualizations
- **Price Charts**: Real-time SVG-based price visualization
- **Symbol Selector**: Dropdown to switch between symbols
- **Time Precision**: 1s, 1m, 15m precision options
- **Trend Overlays**: Direction indicators on charts
- **Responsive Design**: Charts adapt to screen size

#### 4. Configuration
- **AI Providers**: Gemini, OpenAI, or Math-only modes
- **Model Settings**: Temperature, max tokens configuration
- **Calculation Parameters**: Buffer size, EMA periods, min data points
- **WebSocket Settings**: Reconnection, heartbeat intervals
- **Save/Reset**: Persist settings (localStorage + backend integration ready)

#### 5. Training & Validation
- **Accuracy Metrics**: Overall, LONG, SHORT, WAIT accuracy gauges
- **Session History**: Training session records with statistics
- **Prediction Validation**: Recent prediction vs actual results
- **Performance Tracking**: Success rates per direction

#### 6. AI Telemetry Dashboard
- **Real-time Logs**: Paginated grid of AI exchange logs
- **Detail Modal**: Full prompt/response view for each log
- **Statistics Panel**: Success rate, average latency, error count
- **Provider Toggle**: Enable/disable AI analysis
- **Connection Test**: Verify AI provider connectivity
- **WebSocket Events**: Real-time `ai:exchange` event updates

#### 7. Forecast Settings (Configuration Page)
- **Horizon Toggle**: Show/hide forecast horizon overlay
- **Duration Presets**: 30s, 1m, 5m, 15m configurable presets
- **AI Provider Selection**: Gemini, OpenAI, Anthropic, DeepSeek, Perplexity, Grok

### 🏗️ Architecture Features

- **MVVM Pattern**: Strict separation (Model, ViewModel, View)
- **Component Isolation**: Each component in dedicated subfolder
- **CSS Modules**: Scoped styling, no global conflicts
- **Error Boundaries**: Global error catching with recovery
- **Code Splitting**: Optimized bundle loading
- **Hot Module Replacement**: Fast development feedback

### 🔌 Integration Features

- **Backend API**: Aligned with HealthController, SymbolController, TrendController
- **WebSocket Events**: Real-time `trend:updated`, `buffer:progress`, `symbol:added`, etc.
- **Share Types**: Common DTOs/enums from @share/trends package
- **Type Safety**: Compile-time validation frontend ↔ backend

---

## Architecture

### MVVM Pattern (Strict Compliance)

Every page follows this structure:

```
PageName/
├── PageName.model.ts        # TypeScript interfaces (data types)
├── PageName.viewmodel.ts    # React hooks (business logic)
├── PageName.tsx             # React component (UI only)
├── PageName.module.css      # Scoped styles
└── index.ts                 # Barrel export
```

**Separation of Concerns**:
- **Model**: Pure TypeScript types, zero logic
- **ViewModel**: State management, API calls, calculations
- **View**: JSX rendering, event handling delegation
- **Styles**: Component-scoped CSS Modules

### Folder Structure

```
src/
├── components/
│   ├── Charts/
│   │   └── TrendPriceChart/          # Custom SVG chart component
│   ├── ErrorBoundary/                # Global error handler
│   └── layout/
│       ├── AppLayout/                # Main layout wrapper
│       ├── Header/                   # Top navigation bar
│       └── Sidebar/                  # Left side navigation
├── contexts/
│   ├── ThemeContext.tsx              # Dark/light theme
│   ├── WebSocketContext.tsx          # WS connection state
│   ├── TrendsContext.tsx             # Global trend data
│   └── ToastContext.tsx              # Notifications
├── helpers/
│   ├── dateUtils.ts                  # Date formatting utilities
│   ├── stringUtils.ts                # String manipulation
│   ├── numberUtils.ts                # Number formatting
│   └── index.ts                      # Barrel export
├── pages/
│   ├── OverviewPage/                 # Dashboard home
│   ├── SymbolsPage/                  # Symbol management
│   ├── VisualizationPage/            # Chart display
│   ├── ConfigurationPage/            # Settings (AI, forecast, WebSocket)
│   ├── TrainingPage/                 # Training metrics
│   └── AITelemetryPage/              # AI exchange logs & statistics
├── services/
│   ├── api/
│   │   ├── client.ts                 # Axios instance
│   │   ├── health.api.ts             # Health endpoints
│   │   ├── symbol.api.ts             # Symbol endpoints
│   │   ├── trend.api.ts              # Trend endpoints
│   │   └── index.ts                  # Unified export
│   └── websocket.ts                  # Socket.IO client
├── App.tsx                           # App component
├── App.viewmodel.ts                  # App logic
├── main.tsx                          # Entry point
└── index.css                         # Global styles
```

### State Management

```
Contexts (Global State)
├── ThemeContext      → theme, toggleTheme()
├── WebSocketContext  → socket, isConnected, connect(), disconnect()
├── TrendsContext     → symbols{}, addSymbol(), removeSymbol()
└── ToastContext      → showToast(), hideToast()

ViewModels (Component State)
├── useOverviewViewModel()
├── useSymbolsViewModel()
├── useVisualizationViewModel()
├── useConfigurationViewModel()
└── useTrainingViewModel()
```

---

## Installation

### Prerequisites

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **Backend**: Running on port 3001

### Steps

1. **Clone Repository**:
```bash
git clone <repository-url>
cd Ark.Alliance.Trading.TrendsCalculator/Ark.Alliance.TrendsCalculator.Ui
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Configure Environment** (Optional):
```bash
# Create .env file (optional - defaults work for local development)
cp .env.example .env

# Edit .env to customize
VITE_API_URL=http://localhost:3001  # Backend URL (optional)
VITE_APP_TITLE=Ark.Alliance.TrendsCalculator
```

> **Note**: The frontend uses Vite proxy configuration, so you typically don't need to set `VITE_API_URL`. The proxy automatically routes `/api` and `/socket.io` requests to the backend.

4. **Install Share Types**:
```bash
# Already configured in package.json
# "@share/trends": "file:../Ark.Alliance.TrendsCalculator.Share"
npm install
```

---

## Development

### Development Server

```bash
# Start dev server
npm run dev

# Server starts on https://localhost:5173 (HTTPS enabled)
# HMR enabled, opens browser automatically
```

**HTTPS Note**: Vite auto-generates a self-signed certificate. Your browser will show a security warning:
- Click "Advanced" → "Proceed to localhost" (safe for development)
- Certificate is stored in `node_modules/.vite/cache/`

### Backend Connection

The frontend connects to the backend via **Vite proxy** (configured in `vite.config.ts`):

```typescript
proxy: {
  '/api': {
    target: process.env.VITE_API_URL || 'http://localhost:3001',
    changeOrigin: true,
    secure: false,  // Accept self-signed certificates
    ws: true,       // Enable WebSocket proxying
  },
  '/socket.io': {
    target: process.env.VITE_API_URL || 'http://localhost:3001',
    changeOrigin: true,
    secure: false,
    ws: true,
  },
}
```

**How it works:**
- Frontend runs on `https://localhost:5173` (HTTPS)
- Backend runs on `http://localhost:3001` or `https://localhost:3001` (user choice)
- Proxy handles protocol differences and CORS
- WebSocket connections are automatically proxied

### Build for Production

```bash
# TypeScript check + Vite build
npm run build

# Output: dist/ folder (~250KB gzipped)
```

### Preview Production Build

```bash
npm run preview
# Serves dist/ on http://localhost:4173
```

### Additional Scripts

```bash
# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Kill port 3078 (if stuck)
npm run kill-port
```

---

## Project Structure

### Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Application entry point |
| `src/App.tsx` | Root component with routing |
| `src/App.viewmodel.ts` | App-level logic (navigation) |
| `src/index.css` | Global CSS variables & reset |
| `vite.config.ts` | Vite configuration (port, proxy, aliases) |
| `tsconfig.json` | TypeScript configuration (strict mode) |
| `.env` | Environment variables |
| `package.json` | Dependencies & scripts |

### Component Files (per component)

```
ComponentName/
├── ComponentName.model.ts      # interface ComponentModel { ... }
├── ComponentName.viewmodel.ts  # export function useComponentViewModel()
├── ComponentName.tsx           # export function ComponentName()
├── ComponentName.module.css    # .container { ... }
└── index.ts                    # export { ComponentName } from './ComponentName';
```

---

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3075        # Backend API base URL
VITE_WS_URL=ws://localhost:3075           # WebSocket URL
VITE_APP_TITLE=Ark.Alliance.TrendsCalculator  # App title

# Feature Flags (optional)
VITE_ENABLE_AI=true
VITE_ENABLE_TRAINING=true
```

### TypeScript Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@pages/*": ["./src/pages/*"],
      "@services/*": ["./src/services/*"],
      "@helpers/*": ["./src/helpers/*"]
    }
  }
}
```

Usage:
```typescript
import { formatTimestamp } from '@/helpers/dateUtils';
import { Panel } from '@components/layout/Panel';
```

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3078,
    proxy: {
      '/api': 'http://localhost:3075'  // Proxy API requests to backend
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

---

## Testing

### Test Structure

```
Tests/
├── src/
│   ├── unit/
│   │   ├── helpers.test.ts       # Helper function tests (37 tests)
│   │   └── viewmodels.test.ts    # ViewModel logic tests (15+ tests)
│   └── integration/
│       ├── api.test.ts           # API integration tests (11 tests)
│       ├── socketio.test.ts      # WebSocket tests
│       └── utils.ts              # Test utilities
```

### Running Tests

```bash
# Run all tests
cd ../Ark.Alliance.TrendsCalculator.Tests
npm test

# Run unit tests only
npm test -- --run unit/

# Run integration tests (requires backend)
npm test -- --run integration/

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Unit Tests

**Helpers** (37 tests):
- ✅ `dateUtils`: formatTimestamp, formatTime, formatDate
- ✅ `stringUtils`: truncate, capitalize, toUpperCaseFirst
- ✅ `numberUtils`: formatNumber, formatPercentage, formatCurrency

**ViewModels** (15+ tests):
- ✅ Validation logic (symbol format, parameter ranges)
- ✅ Calculations (averages, percentages)
- ✅ State management logic

### Integration Tests

**API Tests** (11 tests):
- ✅ Health endpoints (GET /api/health, /api/health/detailed)
- ✅ Symbol endpoints (POST, GET, DELETE, status)
- ✅ Trend endpoints (analyze, history)
- ✅ Error handling (400, 404 responses)

**WebSocket Tests**:
- ✅ Connection/disconnection
- ✅ Event subscription
- ✅ Room isolation
- ✅ Multiple clients

### Test Utilities

```typescript
import {
  createAPIClient,       // Axios instance for tests
  createWSClient,        // Socket.IO client
  waitForEvent,          // Wait for WebSocket event
  isBackendReachable,    // Check if backend is up
  generateMockTrendData, // Create mock data
  cleanupTestResources   // Cleanup test data
} from './integration/utils';
```

---

## Deployment

### Production Build

```bash
# 1. Build frontend
npm run build

# 2. Output location
# dist/
# ├── assets/
# │   ├<br/>── index-[hash].js
# │   └── index-[hash].css
# └── index.html
```

### Deployment Options

#### Option 1: Static Hosting (Vercel, Netlify)

```bash
# Build
npm run build

# Deploy dist/ folder
# Configure: Base directory = Ark.Alliance.TrendsCalculator.Ui
#            Build command = npm run build
#            Output directory = dist
```

#### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Option 3: Node.js Server

```bash
# Preview production locally
npm run preview

# Or use serve
npx serve dist -p 3078
```

### Environment for Production

```env
# Production .env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_APP_TITLE=Ark.Alliance.TrendsCalculator
```

---

## Integration

### Backend Integration

#### API Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/health` | GET | Health check | ✅ |
| `/api/health/detailed` | GET | Detailed health | ✅ |
| `/api/symbol` | GET | List symbols | ✅ |
| `/api/symbol/track` | POST | Add symbol | ✅ |
| `/api/symbol/:symbol/track` | DELETE | Remove symbol | ✅ |
| `/api/symbol/:symbol/status` | GET | Symbol status | ✅ |
| `/api/trend/:symbol/analyze` | GET | Get trend | ✅ |
| `/api/trend/analyze` | POST | Analyze with params | ✅ |
| `/api/trend/:symbol/history` | GET | Trend history | ✅ |
| `/api/settings` | GET | Get settings | ⚠️ Mock |
| `/api/settings` | PUT | Save settings | ⚠️ Mock |

#### WebSocket Events

**Server → Client**:
- `trend:updated` - Trend analysis complete
- `buffer:progress` - Buffer filling status
- `symbol:added` - Symbol tracking started
- `symbol:removed` - Symbol tracking stopped
- `training:status` - Training session update
- `ai:analysis` - AI analysis result
- `health:update` - System health change

**Client → Server**:
- `subscribe:symbol` - Subscribe to symbol updates
- `unsubscribe:symbol` - Unsubscribe from symbol
- `request:health` - Request health status
- `request:symbols` - Request symbols list

### Share Types Integration

```typescript
// Import from Share project
import type {
  TrendDirection,
  TrendAnalysisResponseDto,
  SymbolStatusResponseDto,
  HealthResponseDto
} from '@share/trends';

// Use in frontend
const direction: TrendDirection = 'LONG';
const response: TrendAnalysisResponseDto = await getTrendAnalysis('BTCUSDT');
```

---

## Accessibility

### Current Implementation

✅ **Basic ARIA Labels**:
- Form inputs have `aria-label` attributes
- Loading states use `aria-busy`
- Main regions use `role="main"`

✅ **Semantic HTML**:
- Proper heading hierarchy (h1, h2, h3)
- `<main>`, `<nav>`, `<header>` elements
- Button vs anchor tags correctly used

✅ **Keyboard Navigation** (Partial):
- Tab navigation works on forms
- Enter key submits forms
- Buttons are focusable

### Roadmap (Future)

⏸️ **Full Keyboard Navigation**:
- Arrow key navigation in tables
- Escape key to close modals
- Keyboard shortcuts for actions

⏸️ **Screen Reader Testing**:
- NVDA testing (Windows)
- JAWS testing
- VoiceOver testing (macOS)

⏸️ **WCAG 2.1 AA Compliance**:
- Color contrast > 4.5:1
- Focus indicators visible
- Alternative text for images
- Form error announcements

### Testing Accessibility

```bash
# Install axe-core (dev dependency)
npm install --save-dev @axe-core/react

# Run accessibility audit
# Use Lighthouse in Chrome DevTools
# Use axe DevTools extension
```

---

## Troubleshooting

### Common Issues

#### Port 3078 Already in Use

```bash
# Solution 1: Use npm script (automatic)
npm run dev  # Runs kill-port.ps1 first

# Solution 2: Manual kill
npm run kill-port

# Solution 3: PowerShell direct
Get-Process -Id (Get-NetTCPConnection -LocalPort 3078).OwningProcess | Stop-Process
```

#### WebSocket Connection Failed

```bash
# Check backend is running
curl http://localhost:3075/api/health

# Check WebSocket URL
# In .env: VITE_WS_URL=ws://localhost:3075 (not wss://)

# Check CORS settings
# Backend should allow frontend origin
```

#### TypeScript Errors After npm install

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### Share Types Not Found

```bash
# Ensure Share project is built
cd ../Ark.Alliance.TrendsCalculator.Share
npm install
npm run build

# Reinstall in UI
cd ../Ark.Alliance.TrendsCalculator.Ui
npm install
```

---

## Performance

### Bundle Size

- **Main bundle**: ~180KB gzipped
- **Vendor bundle**: ~70KB gzipped
- **Total**: ~250KB gzipped
- **Load time**: < 2s (on fast 3G)

### Optimization Techniques

✅ **Code Splitting**: React.lazy() for routes
✅ **Tree Shaking**: Unused code removed
✅ **CSS Modules**: Scoped styles, eliminated duplicates
✅ **Asset Optimization**: SVG icons, optimized images
✅ **Lazy Loading**: Components load on demand

### Performance Metrics (Lighthouse)

Target scores (to be measured):
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Contributing

### Development Workflow

1. **Create Feature Branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Follow MVVM Pattern**:
- Create Model, ViewModel, View files
- Use dedicated component subfolder
- Add Microsoft-compliant JSDoc

3. **Write Tests**:
- Unit tests for ViewModels
- Integration tests for API calls
- Minimum 80% coverage

4. **Submit PR**:
- Clear description
- Screenshots for UI changes
- Test evidence

### Code Standards

- **TypeScript**: Strict mode, no `any` types
- **ESLint**: No errors allowed
- **Formatting**: Prettier (2 spaces, single quotes)
- **Documentation**: JSDoc for all exports
- **File Names**: PascalCase for components, camelCase for utils

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Support

**Issues**: [GitHub Issues](https://github.com/your-repo/issues)  
**Docs**: [Wiki](https://github.com/your-repo/wiki)  
**Contact**: dev@ark-alliance.com

---

## Acknowledgments

- **Ark.Alliance Team** - Architecture & design
- **React Community** - Framework & ecosystem
- **TypeScript Team** - Type safety
- **Vite Team** - Build tool excellence

---

**Built with ❤️ by Ark.Alliance**

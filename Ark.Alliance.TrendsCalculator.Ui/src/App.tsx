/**
 * App Component
 * 
 * @fileoverview Main application with routing and context providers
 * 
 * VIEW ONLY - No logic, uses App.viewmodel.ts for state
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { TrendsProvider } from './contexts/TrendsContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout/AppLayout';
import { useAppViewModel } from './App.viewmodel';

// Pages
import { OverviewPage } from './pages/OverviewPage/OverviewPage';
import { SymbolsPage } from './pages/SymbolsPage/SymbolsPage';
import { TrendCalculationsPage } from './pages/TrendCalculationsPage/TrendCalculationsPage';
import { VisualizationPage } from './pages/VisualizationPage/VisualizationPage';
import { ConfigurationPage } from './pages/ConfigurationPage/ConfigurationPage';
import { TrainingPage } from './pages/TrainingPage/TrainingPage';
import { AITelemetryPage } from './pages/AITelemetryPage/AITelemetryPage';

function AppContent() {
    const vm = useAppViewModel();

    return (
        <AppLayout
            currentPath={vm.currentPath}
            onNavigate={vm.handleNavigate}
            pageTitle={vm.pageInfo.title}
            pageSubtitle={vm.pageInfo.subtitle}
        >
            <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/symbols" element={<SymbolsPage />} />
                <Route path="/trends" element={<TrendCalculationsPage />} />
                <Route path="/visualization" element={<VisualizationPage />} />
                <Route path="/configuration" element={<ConfigurationPage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/ai-telemetry" element={<AITelemetryPage />} />
                <Route path="*" element={<OverviewPage />} />
            </Routes>
        </AppLayout>
    );
}

function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <WebSocketProvider>
                    <TrendsProvider>
                        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                            <AppContent />
                        </BrowserRouter>
                    </TrendsProvider>
                </WebSocketProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;

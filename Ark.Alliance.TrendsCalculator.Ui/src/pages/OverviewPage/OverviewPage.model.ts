/**
 * @fileoverview Overview Page Data Model - Enhanced for Dashboard
 * @module pages/OverviewPage/OverviewPage.model
 */

export interface OverviewPageModel {
    metrics: Metrics;
    topSymbols: SymbolSummary[];
    recentEvents: SystemEvent[];
    isLoading: boolean;
    isConnected: boolean;
    accuracy: number;
    avgConfidence: number;
}

export interface Metrics {
    totalSymbols: number;
    activeSymbols: number;
    averageStrength: number;
    trainingStatus: string;
    aiStatus: string;
    predictionsPerMinute: number;
}

export interface SymbolSummary {
    id: string;
    symbol: string;
    direction: string;
    score: number;
    confidence: number;
    updated: string;
}

export interface SystemEvent {
    id: string;
    type: 'trend_change' | 'ai_analysis' | 'symbol_added' | 'symbol_removed' | 'warning' | 'error';
    message: string;
    timestamp: number;
}

export interface ActiveCalculation {
    symbol: string;
    progress: number;
    status: string;
    startTime: number;
}

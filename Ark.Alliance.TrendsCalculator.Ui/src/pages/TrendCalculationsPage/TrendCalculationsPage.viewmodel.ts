/**
 * @fileoverview Trend Calculations Page ViewModel
 * @module pages/TrendCalculationsPage/viewmodel
 * @description
 * Business logic for the Trend Calculations page.
 * Handles data fetching, sorting, filtering, and statistics.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-02
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTrends } from '../../contexts/TrendsContext';
import { formatTimestamp } from '../../helpers/dateUtils';
import type { TrendCalculation, CalculationStats, SortConfig, FilterConfig } from './TrendCalculationsPage.model';

export function useTrendCalculationsViewModel() {
    const { state } = useTrends();

    const [isLoading, setIsLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'timestamp', direction: 'desc' });
    const [filters, setFilters] = useState<FilterConfig>({
        symbol: '',
        direction: '',
        matchStatus: '',
        minConfidence: '',
    });

    // Generate calculations from trends state
    const rawCalculations = useMemo<TrendCalculation[]>(() => {
        return Object.entries(state.trends).map(([symbol, trend]: [string, any]) => {
            // Simulate actual outcome for demonstration (in production, this would come from backend)
            const hasOutcome = Math.random() > 0.3;
            const actualOutcome = hasOutcome
                ? (['LONG', 'SHORT', 'WAIT'] as const)[Math.floor(Math.random() * 3)]
                : null;
            const match = actualOutcome ? actualOutcome === trend.direction : null;

            return {
                id: `${symbol}-${trend.timestamp || Date.now()}`,
                symbol,
                direction: trend.direction || 'WAIT',
                confidence: trend.confidence || 0,
                score: trend.compositeScore || 0,
                actualOutcome,
                match,
                timestamp: trend.timestamp || Date.now(),
                formattedTime: formatTimestamp(trend.timestamp || Date.now()),
            };
        });
    }, [state.trends]);

    // Apply filters
    const filteredCalculations = useMemo(() => {
        return rawCalculations.filter(calc => {
            // Symbol filter
            if (filters.symbol && !calc.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
                return false;
            }

            // Direction filter
            if (filters.direction && calc.direction !== filters.direction) {
                return false;
            }

            // Match status filter
            if (filters.matchStatus) {
                if (filters.matchStatus === 'correct' && calc.match !== true) return false;
                if (filters.matchStatus === 'incorrect' && calc.match !== false) return false;
                if (filters.matchStatus === 'pending' && calc.match !== null) return false;
            }

            // Min confidence filter
            if (filters.minConfidence) {
                const minConf = parseFloat(filters.minConfidence) / 100;
                if (calc.confidence < minConf) return false;
            }

            return true;
        });
    }, [rawCalculations, filters]);

    // Apply sorting
    const calculations = useMemo(() => {
        const sorted = [...filteredCalculations];

        sorted.sort((a, b) => {
            let aVal: any, bVal: any;

            switch (sortConfig.column) {
                case 'symbol':
                    aVal = a.symbol;
                    bVal = b.symbol;
                    break;
                case 'direction':
                    aVal = a.direction;
                    bVal = b.direction;
                    break;
                case 'confidence':
                    aVal = a.confidence;
                    bVal = b.confidence;
                    break;
                case 'match':
                    aVal = a.match === null ? -1 : a.match ? 1 : 0;
                    bVal = b.match === null ? -1 : b.match ? 1 : 0;
                    break;
                case 'timestamp':
                default:
                    aVal = a.timestamp;
                    bVal = b.timestamp;
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredCalculations, sortConfig]);

    // Calculate stats
    const stats = useMemo<CalculationStats>(() => {
        const total = rawCalculations.length;
        const correct = rawCalculations.filter(c => c.match === true).length;
        const incorrect = rawCalculations.filter(c => c.match === false).length;
        const pending = rawCalculations.filter(c => c.match === null).length;
        const avgConfidence = total > 0
            ? rawCalculations.reduce((sum, c) => sum + c.confidence, 0) / total
            : 0;
        const verifiedCount = correct + incorrect;
        const accuracy = verifiedCount > 0 ? (correct / verifiedCount) * 100 : 0;

        return {
            totalCalculations: total,
            correctPredictions: correct,
            incorrectPredictions: incorrect,
            pendingVerification: pending,
            accuracy,
            avgConfidence,
        };
    }, [rawCalculations]);

    // Handlers
    const handleSort = useCallback((column: string) => {
        setSortConfig(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const handleFilterChange = useCallback((key: keyof FilterConfig, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleRefresh = useCallback(() => {
        setIsLoading(true);
        // Simulate refresh delay
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    // Initial load
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    return {
        calculations,
        stats,
        isLoading,
        sortConfig,
        filters,
        handleSort,
        handleFilterChange,
        handleRefresh,
    };
}

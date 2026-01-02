/**
 * Live Validation Results Dashboard
 * 
 * @fileoverview React page displaying live market validation test results
 * @module dashboard/LiveValidationDashboard
 * 
 * @remarks
 * Static React page that reads JSON test results and visualizes:
 * - Overall accuracy metrics
 * - Symbol-by-symbol prediction results
 * - Time series charts with training/validation phases
 * - Trend comparison tables
 * 
 * Uses @Ark.Alliance.React.Component.UI components
 */

import React, { useState, useEffect } from 'react';
import { LiveValidationTestResult } from '../integration/models/LiveValidationResult';

// TODO: Import from @Ark.Alliance.React.Component.UI once types are configured
// For now using placeholder styles

interface DashboardProps {
    resultFile?: string;
}

export const LiveValidationDashboard: React.FC<DashboardProps> = ({ resultFile }) => {
    const [testResult, setTestResult] = useState<LiveValidationTestResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTestResults();
    }, [resultFile]);

    const loadTestResults = async () => {
        try {
            // Load latest test result
            const response = await fetch(resultFile || '/test-results/latest.json');
            const data = await response.json();
            setTestResult(data);
            setLoading(false);
        } catch (err: any) {
            setError(`Failed to load test results: ${err.message}`);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading test results...</div>
            </div>
        );
    }

    if (error || !testResult) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>{error || 'No test results found'}</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>🔬 Live Market Validation Test Results</h1>
                <p style={styles.subtitle}>
                    Mathematical Framework Validation Against Real Market Data
                </p>
            </header>

            {/* Summary Card */}
            <div style={{
                ...styles.card,
                backgroundColor: testResult.passed ? '#10b981' : '#ef4444',
                color: 'white'
            }}>
                <h2 style={styles.cardTitle}>
                    {testResult.passed ? '✅ TEST PASSED' : '❌ TEST FAILED'}
                </h2>
                <div style={styles.summaryGrid}>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>Accuracy</div>
                        <div style={styles.summaryValue}>
                            {testResult.accuracyPercent.toFixed(1)}%
                        </div>
                    </div>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>Correct Predictions</div>
                        <div style={styles.summaryValue}>
                            {testResult.correctPredictions}/{testResult.totalSymbols}
                        </div>
                    </div>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>Test Duration</div>
                        <div style={styles.summaryValue}>
                            {(testResult.durationMs / 1000).toFixed(1)}s
                        </div>
                    </div>
                    <div style={styles.summaryItem}>
                        <div style={styles.summaryLabel}>Timestamp</div>
                        <div style={styles.summaryValue}>
                            {new Date(testResult.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>📋 Test Configuration</h3>
                <div style={styles.configGrid}>
                    <div>
                        <strong>Training Period:</strong> {testResult.config.trainingDurationSeconds}s
                    </div>
                    <div>
                        <strong>Validation Period:</strong> {testResult.config.validationDurationSeconds}s
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <strong>Math Helpers Used:</strong> {testResult.config.helpers.join(', ')}
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>📊 Symbol-by-Symbol Results</h3>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Rank</th>
                                <th style={styles.th}>Symbol</th>
                                <th style={styles.th}>Predicted Trend</th>
                                <th style={styles.th}>Confidence</th>
                                <th style={styles.th}>Actual Trend</th>
                                <th style={styles.th}>Price Change</th>
                                <th style={styles.th}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testResult.symbols.map((symbol, index) => (
                                <tr
                                    key={symbol.symbol}
                                    style={{
                                        backgroundColor: symbol.correct
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'rgba(239, 68, 68, 0.1)'
                                    }}
                                >
                                    <td style={styles.td}>{symbol.rank}</td>
                                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{symbol.symbol}</td>
                                    <td style={{
                                        ...styles.td,
                                        color: getTrendColor(symbol.predictedTrend.direction)
                                    }}>
                                        {symbol.predictedTrend.direction}
                                    </td>
                                    <td style={styles.td}>
                                        {symbol.predictedTrend.confidence.toFixed(2)}
                                    </td>
                                    <td style={{
                                        ...styles.td,
                                        color: getTrendColor(symbol.actualTrend.direction)
                                    }}>
                                        {symbol.actualTrend.direction}
                                    </td>
                                    <td style={styles.td}>
                                        {symbol.actualTrend.priceChangePercent > 0 ? '+' : ''}
                                        {symbol.actualTrend.priceChangePercent.toFixed(2)}%
                                    </td>
                                    <td style={styles.td}>
                                        {symbol.correct ? '✓' : '✗'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Statistics */}
            <div style={styles.statsGrid}>
                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Avg Hurst Exponent</h4>
                    <div style={styles.statValue}>
                        {(testResult.symbols.reduce((sum, s) => sum + s.predictedTrend.hurst, 0) /
                            testResult.symbols.length).toFixed(3)}
                    </div>
                </div>
                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Avg Composite Score</h4>
                    <div style={styles.statValue}>
                        {(testResult.symbols.reduce((sum, s) => sum + Math.abs(s.predictedTrend.compositeScore), 0) /
                            testResult.symbols.length).toFixed(3)}
                    </div>
                </div>
                <div style={styles.card}>
                    <h4 style={styles.cardTitle}>Avg Confidence</h4>
                    <div style={styles.statValue}>
                        {(testResult.symbols.reduce((sum, s) => sum + s.predictedTrend.confidence, 0) /
                            testResult.symbols.length).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <p>Generated by Ark.Alliance.TrendsCalculator Test Suite</p>
                <p>Framework validated using real Binance Futures USD-M market data</p>
            </footer>
        </div>
    );
};

function getTrendColor(direction: string): string {
    switch (direction) {
        case 'LONG': return '#10b981';
        case 'SHORT': return '#ef4444';
        case 'WAIT': return '#f59e0b';
        default: return '#6b7280';
    }
}

// Styles
const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        minHeight: '100vh'
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
        padding: '32px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '12px',
        border: '1px solid #334155'
    },
    title: {
        fontSize: '36px',
        fontWeight: 'bold',
        margin: '0 0 12px 0',
        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        fontSize: '16px',
        color: '#94a3b8',
        margin: 0
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '16px'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px'
    },
    summaryItem: {
        textAlign: 'center'
    },
    summaryLabel: {
        fontSize: '14px',
        opacity: 0.9,
        marginBottom: '8px'
    },
    summaryValue: {
        fontSize: '32px',
        fontWeight: 'bold'
    },
    configGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        color: '#cbd5e1'
    },
    tableContainer: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        borderBottom: '2px solid #334155',
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: '14px'
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #334155'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    statValue: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#06b6d4'
    },
    footer: {
        textAlign: 'center',
        padding: '24px',
        color: '#64748b',
        borderTop: '1px solid #334155'
    },
    loading: {
        textAlign: 'center',
        padding: '48px',
        fontSize: '18px',
        color: '#94a3b8'
    },
    error: {
        textAlign: 'center',
        padding: '48px',
        fontSize: '18px',
        color: '#ef4444'
    }
};

export default LiveValidationDashboard;

/**
 * @fileoverview Visualization Page Component - MVVM COMPLIANT
 * @module pages/VisualizationPage
 * @description
 * Real-time price chart visualization with trend predictions.
 * Includes symbol selection and time precision controls.
 * 
 * VIEW ONLY - All logic in VisualizationPage.viewmodel.ts
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

import { Panel, FinancialChart, NeonButton } from 'ark-alliance-react-ui';
import { useVisualizationViewModel } from './VisualizationPage.viewmodel';
import styles from './VisualizationPage.module.css';

export function VisualizationPage() {
    const { model, handleSymbolChange, handlePrecisionChange } = useVisualizationViewModel();

    if (model.isLoading) {
        return (
            <div className={styles.container} role="main" aria-busy="true">
                <div className={styles.loading}>Loading visualization...</div>
            </div>
        );
    }

    return (
        <div className={styles.container} role="main">
            <div className={styles.header}>
                <h1 className={styles.title}>Trend Visualization</h1>
                <p className={styles.subtitle}>Real-time price charts with AI predictions</p>
            </div>

            {/* Chart Controls */}
            <Panel title="Chart Configuration" collapsible={true}>
                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <label htmlFor="symbol-select">Symbol</label>
                        <select
                            id="symbol-select"
                            value={model.selectedSymbol}
                            onChange={(e) => handleSymbolChange(e.target.value)}
                            className={styles.select}
                        >
                            {model.availableSymbols.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.controlGroup}>
                        <label>Time Precision</label>
                        <div className={styles.buttonGroup}>
                            <NeonButton
                                variant={model.precision === '1s' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => handlePrecisionChange('1s')}
                            >
                                1 Second
                            </NeonButton>
                            <NeonButton
                                variant={model.precision === '1m' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => handlePrecisionChange('1m')}
                            >
                                1 Minute
                            </NeonButton>
                            <NeonButton
                                variant={model.precision === '15m' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => handlePrecisionChange('15m')}
                            >
                                15 Minutes
                            </NeonButton>
                        </div>
                    </div>
                </div>
            </Panel >

            {/* Price Chart */}
            <Panel title={`${model.selectedSymbol} - Real-Time Chart`} collapsible={false}>
                <FinancialChart
                    symbol={model.selectedSymbol}
                    candlestickData={model.priceData}
                    predictions={model.predictions}
                    isConnected={true}
                    isStreaming={!model.isLoading}
                    chartType="line"
                    interval={model.precision}
                    showGrid={true}
                />

                {/* Trend Legend */}
                {model.predictions.length > 0 && (
                    <div className={styles.trendLegend}>
                        <span style={{ color: '#00ff88' }}>▲ LONG</span>
                        <span style={{ color: '#ff4466' }}>▼ SHORT</span>
                        <span style={{ color: '#ffaa00' }}>● WAIT</span>
                        <span className={styles.latestTrend}>
                            Latest: {model.predictions[model.predictions.length - 1]?.direction || '-'}
                            {' '}({((model.predictions[model.predictions.length - 1]?.confidence || 0) * 100).toFixed(0)}%)
                        </span>
                    </div>
                )}
            </Panel>

            {/* Live Parameters Panel (Placeholder) */}
            <Panel title="Live Parameters" collapsible={true}>
                <div className={styles.placeholder}>
                    <p>Parameter adjustment controls will be available here.</p>
                    <p>Adjust calculation parameters and AI settings in real-time.</p>
                </div>
            </Panel>
        </div >
    );
}

/**
 * @fileoverview Trend Calculations Page Component
 * @module pages/TrendCalculationsPage
 * @description
 * Comprehensive view of all trend calculation results with sortable table,
 * confidence visualization, and performance metrics.
 * 
 * VIEW ONLY - All logic in TrendCalculationsPage.viewmodel.ts
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-02
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartBar,
    faArrowUp,
    faArrowDown,
    faMinus,
    faFilter,
    faSync,
    faCheck,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { Panel, GlowCard, NeonButton } from 'ark-alliance-react-ui';
import { useTrendCalculationsViewModel } from './TrendCalculationsPage.viewmodel';
import styles from './TrendCalculationsPage.module.css';

export function TrendCalculationsPage() {
    const {
        calculations,
        stats,
        isLoading,
        sortConfig,
        filters,
        handleSort,
        handleFilterChange,
        handleRefresh,
    } = useTrendCalculationsViewModel();

    const getSortIcon = (column: string) => {
        if (sortConfig.column !== column) return null;
        return sortConfig.direction === 'asc' ? faArrowUp : faArrowDown;
    };

    const getConfidenceClass = (confidence: number): string => {
        if (confidence >= 0.85) return styles.confidenceExcellent;
        if (confidence >= 0.70) return styles.confidenceHigh;
        if (confidence >= 0.50) return styles.confidenceMedium;
        if (confidence >= 0.25) return styles.confidenceLow;
        return styles.confidenceCritical;
    };

    const getDirectionIcon = (direction: string) => {
        switch (direction) {
            case 'LONG': return faArrowUp;
            case 'SHORT': return faArrowDown;
            default: return faMinus;
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span>Loading calculations...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* ─────────────────────────────────────────────────────────────────
                HEADER
               ───────────────────────────────────────────────────────────────── */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <FontAwesomeIcon icon={faChartBar} className={styles.titleIcon} />
                        Trend Calculations
                    </h1>
                    <p className={styles.subtitle}>
                        Analysis of prediction accuracy and confidence metrics
                    </p>
                </div>
                <NeonButton variant="ghost" size="sm" onClick={handleRefresh}>
                    <FontAwesomeIcon icon={faSync} />
                    Refresh
                </NeonButton>
            </header>

            {/* ─────────────────────────────────────────────────────────────────
                STATS CARDS
               ───────────────────────────────────────────────────────────────── */}
            <section className={styles.statsGrid}>
                <GlowCard title="Total Calculations" status="info" compact>
                    <div className={styles.statValue}>{stats.totalCalculations}</div>
                </GlowCard>
                <GlowCard title="Accuracy Rate" status={stats.accuracy >= 70 ? 'success' : 'warning'} compact>
                    <div className={styles.statValue}>{stats.accuracy.toFixed(1)}%</div>
                </GlowCard>
                <GlowCard title="Avg Confidence" status="info" compact>
                    <div className={styles.statValue}>{(stats.avgConfidence * 100).toFixed(1)}%</div>
                </GlowCard>
                <GlowCard title="Correct Predictions" status="success" compact>
                    <div className={styles.statValue}>{stats.correctPredictions}</div>
                </GlowCard>
            </section>

            {/* ─────────────────────────────────────────────────────────────────
                FILTERS
               ───────────────────────────────────────────────────────────────── */}
            <Panel title="Filters" collapsible defaultCollapsed>
                <div className={styles.filtersRow}>
                    <div className={styles.filterGroup}>
                        <label>Symbol</label>
                        <input
                            type="text"
                            className={styles.filterInput}
                            placeholder="Filter by symbol..."
                            value={filters.symbol}
                            onChange={(e) => handleFilterChange('symbol', e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Direction</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.direction}
                            onChange={(e) => handleFilterChange('direction', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="LONG">LONG</option>
                            <option value="SHORT">SHORT</option>
                            <option value="WAIT">WAIT</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Match Status</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.matchStatus}
                            onChange={(e) => handleFilterChange('matchStatus', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="correct">Correct</option>
                            <option value="incorrect">Incorrect</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Min Confidence</label>
                        <input
                            type="number"
                            className={styles.filterInput}
                            placeholder="0-100"
                            min="0"
                            max="100"
                            value={filters.minConfidence}
                            onChange={(e) => handleFilterChange('minConfidence', e.target.value)}
                        />
                    </div>
                </div>
            </Panel>

            {/* ─────────────────────────────────────────────────────────────────
                CALCULATIONS TABLE
               ───────────────────────────────────────────────────────────────── */}
            <Panel title={`Calculation Results (${calculations.length})`} collapsible={false}>
                {calculations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FontAwesomeIcon icon={faFilter} className={styles.emptyIcon} />
                        <p>No calculations match your filters</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th
                                        className={styles.sortable}
                                        onClick={() => handleSort('symbol')}
                                    >
                                        Symbol
                                        {getSortIcon('symbol') && (
                                            <FontAwesomeIcon icon={getSortIcon('symbol')!} className={styles.sortIcon} />
                                        )}
                                    </th>
                                    <th
                                        className={styles.sortable}
                                        onClick={() => handleSort('direction')}
                                    >
                                        Prediction
                                        {getSortIcon('direction') && (
                                            <FontAwesomeIcon icon={getSortIcon('direction')!} className={styles.sortIcon} />
                                        )}
                                    </th>
                                    <th
                                        className={styles.sortable}
                                        onClick={() => handleSort('confidence')}
                                    >
                                        Confidence
                                        {getSortIcon('confidence') && (
                                            <FontAwesomeIcon icon={getSortIcon('confidence')!} className={styles.sortIcon} />
                                        )}
                                    </th>
                                    <th>Actual Outcome</th>
                                    <th
                                        className={styles.sortable}
                                        onClick={() => handleSort('match')}
                                    >
                                        Match
                                        {getSortIcon('match') && (
                                            <FontAwesomeIcon icon={getSortIcon('match')!} className={styles.sortIcon} />
                                        )}
                                    </th>
                                    <th
                                        className={styles.sortable}
                                        onClick={() => handleSort('timestamp')}
                                    >
                                        Timestamp
                                        {getSortIcon('timestamp') && (
                                            <FontAwesomeIcon icon={getSortIcon('timestamp')!} className={styles.sortIcon} />
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculations.map((calc) => (
                                    <tr key={calc.id}>
                                        <td className={styles.symbolCell}>{calc.symbol}</td>
                                        <td>
                                            <span className={`${styles.direction} ${styles[`direction${calc.direction}`]}`}>
                                                <FontAwesomeIcon icon={getDirectionIcon(calc.direction)} />
                                                {calc.direction}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.confidenceCell}>
                                                <div className={styles.confidenceBar}>
                                                    <div
                                                        className={`${styles.confidenceFill} ${getConfidenceClass(calc.confidence)}`}
                                                        style={{ width: `${calc.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span className={styles.confidenceValue}>
                                                    {(calc.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {calc.actualOutcome ? (
                                                <span className={`${styles.direction} ${styles[`direction${calc.actualOutcome}`]}`}>
                                                    <FontAwesomeIcon icon={getDirectionIcon(calc.actualOutcome)} />
                                                    {calc.actualOutcome}
                                                </span>
                                            ) : (
                                                <span className={styles.pending}>Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            {calc.match === null ? (
                                                <span className={styles.matchPending}>—</span>
                                            ) : calc.match ? (
                                                <span className={styles.matchCorrect}>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </span>
                                            ) : (
                                                <span className={styles.matchIncorrect}>
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </span>
                                            )}
                                        </td>
                                        <td className={styles.timestampCell}>{calc.formattedTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>

            {/* ─────────────────────────────────────────────────────────────────
                CONFIDENCE INDEX LEGEND
               ───────────────────────────────────────────────────────────────── */}
            <div className={styles.legend}>
                <span className={styles.legendTitle}>Confidence Index:</span>
                <div className={styles.legendItems}>
                    <span className={`${styles.legendItem} ${styles.confidenceExcellent}`}>85-100% Excellent</span>
                    <span className={`${styles.legendItem} ${styles.confidenceHigh}`}>70-85% High</span>
                    <span className={`${styles.legendItem} ${styles.confidenceMedium}`}>50-70% Medium</span>
                    <span className={`${styles.legendItem} ${styles.confidenceLow}`}>25-50% Low</span>
                    <span className={`${styles.legendItem} ${styles.confidenceCritical}`}>0-25% Critical</span>
                </div>
            </div>
        </div>
    );
}

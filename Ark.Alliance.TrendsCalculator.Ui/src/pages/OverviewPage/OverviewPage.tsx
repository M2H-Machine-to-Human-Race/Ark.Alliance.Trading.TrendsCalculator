/**
 * OverviewPage Component - DASHBOARD 2026 REDESIGN
 * 
 * @fileoverview Command-center dashboard with metrics strip, symbol management,
 * active calculations, top performers, and activity feed.
 * 
 * VIEW ONLY - Uses SymbolManagementPanel, GlowCard, CircularGauge, Panel
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2026-01-02
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faRobot,
    faBolt,
    faBullseye,
    faGraduationCap,
    faCircle,
    faArrowTrendUp,
    faArrowTrendDown,
} from '@fortawesome/free-solid-svg-icons';
import { GlowCard, CircularGauge, Panel } from 'ark-alliance-react-ui';
import { SymbolManagementPanel } from '../../components/SymbolManagementPanel';
import { formatTimestamp } from '../../helpers/dateUtils';
import { useOverviewViewModel } from './OverviewPage.viewmodel';
import styles from './OverviewPage.module.css';

export function OverviewPage() {
    const { model, activeCalculations } = useOverviewViewModel();

    if (model.isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner} />
                    <span>Initializing dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* ─────────────────────────────────────────────────────────────────
                PAGE HEADER
               ───────────────────────────────────────────────────────────────── */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <span className={styles.titleGradient}>Trends</span> Dashboard
                    </h1>
                    <p className={styles.subtitle}>Real-time market trend analysis and predictions</p>
                </div>
                <div className={styles.connectionStatus}>
                    <FontAwesomeIcon
                        icon={faCircle}
                        className={model.isConnected ? styles.statusOnline : styles.statusOffline}
                    />
                    <span>{model.isConnected ? 'Live' : 'Offline'}</span>
                </div>
            </header>

            {/* ─────────────────────────────────────────────────────────────────
                METRICS STRIP
               ───────────────────────────────────────────────────────────────── */}
            <section className={styles.metricsStrip}>
                <GlowCard
                    title="Active Symbols"
                    status="info"
                    compact={true}
                    icon={<FontAwesomeIcon icon={faBullseye} />}
                >
                    <div className={styles.metricValue}>{model.metrics.activeSymbols}</div>
                    <span className={styles.metricSub}>of {model.metrics.totalSymbols} total</span>
                </GlowCard>

                <GlowCard
                    title="AI Status"
                    status={model.metrics.aiStatus === 'Online' ? 'success' : 'error'}
                    compact={true}
                    icon={<FontAwesomeIcon icon={faRobot} />}
                >
                    <div className={styles.metricValue}>{model.metrics.aiStatus}</div>
                    <span className={styles.metricSub}>Neural engine</span>
                </GlowCard>

                <GlowCard
                    title="Predictions/min"
                    status="warning"
                    compact={true}
                    icon={<FontAwesomeIcon icon={faBolt} />}
                >
                    <div className={styles.metricValue}>{model.metrics.predictionsPerMinute}</div>
                    <span className={styles.metricSub}>Processing rate</span>
                </GlowCard>

                <GlowCard
                    title="Training"
                    status={model.metrics.trainingStatus === 'Running' ? 'success' : 'idle'}
                    compact={true}
                    icon={<FontAwesomeIcon icon={faGraduationCap} />}
                >
                    <div className={styles.metricValue}>{model.metrics.trainingStatus}</div>
                    <span className={styles.metricSub}>Model status</span>
                </GlowCard>
            </section>

            {/* ─────────────────────────────────────────────────────────────────
                MAIN DASHBOARD GRID
               ───────────────────────────────────────────────────────────────── */}
            <div className={styles.dashboardGrid}>
                {/* Left Column - Symbol Management + Activity */}
                <div className={styles.leftColumn}>
                    {/* Symbol Management Panel */}
                    <SymbolManagementPanel compact={false} />

                    {/* Recent Activity Feed */}
                    <Panel title="Recent Activity" collapsible={true}>
                        <div className={styles.activityFeed}>
                            {model.recentEvents.length === 0 ? (
                                <div className={styles.emptyState}>No recent activity</div>
                            ) : (
                                model.recentEvents.map(event => (
                                    <div key={event.id} className={styles.activityItem}>
                                        <div className={`${styles.activityDot} ${styles[`activity${event.type}`]}`} />
                                        <div className={styles.activityContent}>
                                            <p className={styles.activityMessage}>{event.message}</p>
                                            <span className={styles.activityTime}>
                                                {formatTimestamp(event.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Panel>
                </div>

                {/* Right Column - Gauges + Top Performers */}
                <div className={styles.rightColumn}>
                    {/* Performance Gauges */}
                    <div className={styles.gaugesSection}>
                        <div className={styles.gaugeCard}>
                            <CircularGauge
                                value={model.accuracy}
                                min={0}
                                max={100}
                                label="Overall Accuracy"
                                unit="%"
                                size="lg"
                                autoColor={true}
                            />
                            <span className={styles.gaugeCaption}>Last 24 hours</span>
                        </div>
                        <div className={styles.gaugeCard}>
                            <CircularGauge
                                value={model.avgConfidence * 100}
                                min={0}
                                max={100}
                                label="Avg Confidence"
                                unit="%"
                                size="lg"
                                autoColor={true}
                            />
                            <span className={styles.gaugeCaption}>Active predictions</span>
                        </div>
                    </div>

                    {/* Active Calculations */}
                    {activeCalculations.length > 0 && (
                        <Panel title="Active Calculations" collapsible={false}>
                            <div className={styles.calculationsGrid}>
                                {activeCalculations.map(calc => (
                                    <div key={calc.symbol} className={styles.calcCard}>
                                        <div className={styles.calcHeader}>
                                            <span className={styles.calcSymbol}>{calc.symbol}</span>
                                            <span className={styles.calcProgress}>{calc.progress}%</span>
                                        </div>
                                        <div className={styles.calcProgressBar}>
                                            <div
                                                className={styles.calcProgressFill}
                                                style={{ width: `${calc.progress}%` }}
                                            />
                                        </div>
                                        <span className={styles.calcStatus}>{calc.status}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    )}

                    {/* Top Performers Table */}
                    <Panel title="Top Performers by Confidence" collapsible={false}>
                        {model.topSymbols.length === 0 ? (
                            <div className={styles.emptyState}>
                                No trend data available yet
                            </div>
                        ) : (
                            <div className={styles.performersTable}>
                                <div className={styles.tableHeader}>
                                    <span>Symbol</span>
                                    <span>Direction</span>
                                    <span>Score</span>
                                    <span>Confidence</span>
                                </div>
                                {model.topSymbols.slice(0, 6).map(symbol => (
                                    <div key={symbol.id} className={styles.tableRow}>
                                        <span className={styles.symbolCell}>
                                            <FontAwesomeIcon
                                                icon={faChartLine}
                                                className={styles.symbolIcon}
                                            />
                                            {symbol.symbol}
                                        </span>
                                        <span className={`${styles.directionCell} ${styles[`direction${symbol.direction}`]}`}>
                                            <FontAwesomeIcon
                                                icon={symbol.direction === 'LONG' ? faArrowTrendUp :
                                                    symbol.direction === 'SHORT' ? faArrowTrendDown : faCircle}
                                            />
                                            {symbol.direction}
                                        </span>
                                        <span className={styles.scoreCell}>
                                            {symbol.score > 0 ? '+' : ''}{symbol.score.toFixed(2)}
                                        </span>
                                        <span className={styles.confidenceCell}>
                                            <div className={styles.confidenceBar}>
                                                <div
                                                    className={styles.confidenceFill}
                                                    style={{ width: `${symbol.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span>{(symbol.confidence * 100).toFixed(0)}%</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Panel>
                </div>
            </div>
        </div>
    );
}

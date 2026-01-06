/**
 * @fileoverview AI Telemetry Page Component - MVVM COMPLIANT
 * @module pages/AITelemetryPage
 * @description
 * AI Integration & Telemetry dashboard with control panel, log grid, and detail modal.
 * 
 * Features:
 * - AI On/Off toggle with Test Connection button
 * - Data grid showing all AI exchanges
 * - Detail modal with full request/response JSON
 * 
 * VIEW ONLY - All logic in AITelemetryPage.viewmodel.ts
 * 
 * @Ark.Alliance Team
 * @version 1.0.0
 * @since 2026-01-06
 */

import { Panel, NeonButton } from 'ark-alliance-react-ui';
import { useAITelemetryViewModel } from './AITelemetryPage.viewmodel';
import styles from './AITelemetryPage.module.css';

export function AITelemetryPage() {
    const {
        model,
        toggleAIEnabled,
        testConnection,
        loadPage,
        openDetail,
        closeDetail,
        refresh,
    } = useAITelemetryViewModel();

    if (model.isLoading) {
        return (
            <div className={styles.container} role="main" aria-busy="true">
                <div className={styles.loading}>Loading AI Telemetry...</div>
            </div>
        );
    }

    if (model.error) {
        return (
            <div className={styles.container} role="main">
                <div className={styles.error}>{model.error}</div>
                <NeonButton onClick={refresh}>Retry</NeonButton>
            </div>
        );
    }

    const totalPages = Math.ceil(model.totalLogs / model.pageSize);

    return (
        <div className={styles.container} role="main">
            <div className={styles.header}>
                <h1 className={styles.title}>AI Integration & Telemetry</h1>
                <p className={styles.subtitle}>Monitor AI exchanges and manage settings</p>
            </div>

            {/* Control Panel */}
            <Panel title="AI Control Panel" collapsible={false}>
                <div className={styles.controlPanel}>
                    <div className={styles.controlRow}>
                        <div className={styles.toggleContainer}>
                            <span className={styles.toggleLabel}>AI Features</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={model.settings?.enabled ?? false}
                                    onChange={(e) => toggleAIEnabled(e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                            <span className={styles.toggleStatus}>
                                {model.settings?.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>

                        <div className={styles.connectionTest}>
                            <NeonButton
                                variant="secondary"
                                onClick={testConnection}
                                disabled={model.connectionTest.isLoading}
                            >
                                {model.connectionTest.isLoading ? 'Testing...' : 'Test Connection'}
                            </NeonButton>

                            {model.connectionTest.result && (
                                <span
                                    className={`${styles.testResult} ${model.connectionTest.result.success
                                        ? styles.testSuccess
                                        : styles.testError
                                        }`}
                                >
                                    {model.connectionTest.result.success ? '✓' : '✗'}{' '}
                                    {model.connectionTest.result.message}
                                    {model.connectionTest.result.success && (
                                        <span className={styles.latency}>
                                            ({model.connectionTest.result.latencyMs}ms)
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.settingsInfo}>
                        <span>Provider: <strong>{model.settings?.provider}</strong></span>
                        <span>Model: <strong>{model.settings?.model}</strong></span>
                        <span>
                            API Key: {' '}
                            <strong className={model.settings?.apiKeyConfigured ? styles.configured : styles.notConfigured}>
                                {model.settings?.apiKeyConfigured ? 'Configured' : 'Not Configured'}
                            </strong>
                        </span>
                    </div>
                </div>
            </Panel>

            {/* Statistics */}
            {model.stats && (
                <Panel title="Statistics" collapsible={true}>
                    <div className={styles.stats}>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{model.stats.totalExchanges}</span>
                            <span className={styles.statLabel}>Total Exchanges</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{model.stats.successRate.toFixed(1)}%</span>
                            <span className={styles.statLabel}>Success Rate</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{model.stats.avgLatencyMs.toFixed(0)}ms</span>
                            <span className={styles.statLabel}>Avg Latency</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={`${styles.statValue} ${styles.errorCount}`}>
                                {model.stats.errorCount}
                            </span>
                            <span className={styles.statLabel}>Errors</span>
                        </div>
                    </div>
                </Panel>
            )}

            {/* Telemetry Log Grid */}
            <Panel title="AI Exchange Logs" collapsible={false}>
                <div className={styles.gridContainer}>
                    <table className={styles.grid}>
                        <thead>
                            <tr>
                                <th>Timestamp Send</th>
                                <th>Timestamp Receive</th>
                                <th>Duration</th>
                                <th>Provider</th>
                                <th>Status</th>
                                <th>Summary</th>
                                <th>Tokens</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {model.gridData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className={styles.emptyRow}>
                                        No AI exchanges recorded yet
                                    </td>
                                </tr>
                            ) : (
                                model.gridData.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.timestampSend).toLocaleString()}</td>
                                        <td>
                                            {log.timestampReceive
                                                ? new Date(log.timestampReceive).toLocaleString()
                                                : '-'}
                                        </td>
                                        <td>{log.durationMs}ms</td>
                                        <td>{log.provider}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[`status${log.status}`]}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className={styles.summaryCell}>{log.summary}</td>
                                        <td>{log.tokenCount}</td>
                                        <td>
                                            <NeonButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDetail(log.id)}
                                            >
                                                Details
                                            </NeonButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <NeonButton
                                variant="ghost"
                                size="sm"
                                onClick={() => loadPage(model.currentPage - 1)}
                                disabled={model.currentPage <= 1}
                            >
                                Previous
                            </NeonButton>
                            <span className={styles.pageInfo}>
                                Page {model.currentPage} of {totalPages}
                            </span>
                            <NeonButton
                                variant="ghost"
                                size="sm"
                                onClick={() => loadPage(model.currentPage + 1)}
                                disabled={model.currentPage >= totalPages}
                            >
                                Next
                            </NeonButton>
                        </div>
                    )}
                </div>
            </Panel>

            {/* Detail Modal - Native implementation */}
            {model.isDetailModalOpen && model.selectedLog && (
                <div className={styles.modalOverlay} onClick={closeDetail}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>AI Exchange Details - {model.selectedLog.id}</h3>
                            <button className={styles.closeButton} onClick={closeDetail}>×</button>
                        </div>
                        <div className={styles.detailModal}>
                            <div className={styles.detailHeader}>
                                <span>Session: {model.selectedLog.sessionId}</span>
                                <span>Provider: {model.selectedLog.provider}</span>
                                <span>Model: {model.selectedLog.model}</span>
                                <span>Status: {model.selectedLog.status}</span>
                                <span>Duration: {model.selectedLog.durationMs}ms</span>
                            </div>

                            <div className={styles.detailSection}>
                                <h4>System Prompt</h4>
                                <pre className={styles.jsonPre}>
                                    {model.selectedLog.systemPrompt || '(None)'}
                                </pre>
                            </div>

                            <div className={styles.detailSection}>
                                <h4>User Prompt (Request)</h4>
                                <pre className={styles.jsonPre}>
                                    {model.selectedLog.userPrompt}
                                </pre>
                            </div>

                            <div className={styles.detailSection}>
                                <h4>AI Response</h4>
                                <pre className={styles.jsonPre}>
                                    {model.selectedLog.fullResponse || model.selectedLog.errorMessage || '(No response)'}
                                </pre>
                            </div>

                            <div className={styles.tokenInfo}>
                                <span>Prompt Tokens: {model.selectedLog.promptTokens}</span>
                                <span>Completion Tokens: {model.selectedLog.completionTokens}</span>
                                <span>Total: {model.selectedLog.tokenCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * SymbolsPage Component - UPGRADED WITH UI LIBRARY
 * 
 * @fileoverview Manage tracked symbols with professional UI components
 * 
 * VIEW ONLY - Uses Panel, ProgressBar from UI library
 */

import { Panel, NeonButton } from 'ark-alliance-react-ui';
import { formatTimestamp } from '../../helpers/dateUtils';
import { useSymbolsViewModel } from './SymbolsPage.viewmodel';
import type { SymbolInfo } from './SymbolsPage.model';
import styles from './SymbolsPage.module.css';

export function SymbolsPage() {
    const { symbols, newSymbol, setNewSymbol, handleAddSymbol, handleRemoveSymbol } = useSymbolsViewModel();

    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Symbol Management</h1>
                <p className={styles.subtitle}>Track and manage market symbols for trend analysis</p>
            </div>

            {/* Add Symbol Panel */}
            <Panel title="Add New Symbol" collapsible={true}>
                <form
                    className={styles.form}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleAddSymbol();
                    }}
                >
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Enter symbol (e.g., BTCUSDT)"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSymbol();
                            }
                        }}
                    />
                    <NeonButton type="submit" variant="primary" size="md">
                        Add Symbol
                    </NeonButton>
                </form>
            </Panel>

            {/* Tracked Symbols Panel */}
            <Panel title="Tracked Symbols" collapsible={false}>
                {symbols.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No symbols tracked yet. Add a symbol above to get started.</p>
                    </div>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <div className={styles.tableCell}>Symbol</div>
                            <div className={styles.tableCell}>Status</div>
                            <div className={styles.tableCell}>Direction</div>
                            <div className={styles.tableCell}>Buffer Progress</div>
                            <div className={styles.tableCell}>Last Update</div>
                            <div className={styles.tableCell}>Actions</div>
                        </div>
                        {symbols.map((symbol: SymbolInfo) => (
                            <div key={symbol.symbol} className={styles.tableRow}>
                                <div className={styles.tableCell}>
                                    <strong>{symbol.symbol}</strong>
                                </div>
                                <div className={styles.tableCell}>
                                    <span
                                        className={`${styles.badge} ${symbol.isActive ? styles.badgeActive : styles.badgeInactive}`}
                                    >
                                        {symbol.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className={styles.tableCell}>
                                    {symbol.direction ? (
                                        <span className={`${styles.badge} ${styles[`badge${symbol.direction}`]}`}>
                                            {symbol.direction}
                                        </span>
                                    ) : (
                                        <span className={styles.badgeNone}>—</span>
                                    )}
                                </div>
                                <div className={styles.tableCell}>
                                    <div className={styles.progressContainer}>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${symbol.bufferPercent}%` }}
                                            />
                                        </div>
                                        <span className={styles.progressText}>{symbol.bufferPercent}%</span>
                                    </div>
                                </div>
                                <div className={styles.tableCell}>
                                    {symbol.lastUpdate ? formatTimestamp(symbol.lastUpdate) : '—'}
                                </div>
                                <div className={styles.tableCell}>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveSymbol(symbol.symbol)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </div>
    );
}

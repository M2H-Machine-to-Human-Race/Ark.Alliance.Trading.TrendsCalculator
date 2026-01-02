/**
 * @fileoverview Symbol Management Panel Component
 * @module components/SymbolManagementPanel
 * @description
 * Expandable panel for managing tracked symbols with real-time status updates.
 * Features: add/remove symbols, progress indicators, direction badges.
 * 
 * VIEW ONLY - All logic in SymbolManagementPanel.viewmodel.ts
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-02
 */

import { Panel, NeonButton } from 'ark-alliance-react-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faTrash,
    faChartLine,
    faSpinner,
    faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useSymbolManagementViewModel } from './SymbolManagementPanel.viewmodel';
import styles from './SymbolManagementPanel.module.css';

interface SymbolManagementPanelProps {
    /** Show in compact mode (for embedding in dashboard) */
    compact?: boolean;
    /** Maximum symbols to display in compact mode */
    maxVisible?: number;
    /** Callback when symbol is selected */
    onSymbolSelect?: (symbol: string) => void;
}

export function SymbolManagementPanel({
    compact = false,
    maxVisible = 6,
    onSymbolSelect,
}: SymbolManagementPanelProps) {
    const {
        symbols,
        newSymbol,
        setNewSymbol,
        isAdding,
        handleAddSymbol,
        handleRemoveSymbol,
    } = useSymbolManagementViewModel();

    const displaySymbols = compact ? symbols.slice(0, maxVisible) : symbols;
    const hasMore = compact && symbols.length > maxVisible;

    const getDirectionClass = (direction?: string): string => {
        switch (direction) {
            case 'LONG': return styles.directionLong;
            case 'SHORT': return styles.directionShort;
            case 'WAIT': return styles.directionWait;
            default: return styles.directionNone;
        }
    };

    const getProgressClass = (progress: number): string => {
        if (progress >= 85) return styles.progressExcellent;
        if (progress >= 70) return styles.progressHigh;
        if (progress >= 50) return styles.progressMedium;
        if (progress >= 25) return styles.progressLow;
        return styles.progressCritical;
    };

    return (
        <Panel
            title="Symbol Management"
            collapsible={!compact}
            defaultCollapsed={false}
        >
            <div className={styles.container}>
                {/* Add Symbol Form */}
                <form
                    className={styles.addForm}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleAddSymbol();
                    }}
                >
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Enter symbol (e.g., BTCUSDT)"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                            disabled={isAdding}
                        />
                        <NeonButton
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={!newSymbol.trim() || isAdding}
                        >
                            {isAdding ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                <FontAwesomeIcon icon={faPlus} />
                            )}
                            <span className={styles.buttonText}>Add</span>
                        </NeonButton>
                    </div>
                </form>

                {/* Symbols Grid */}
                {symbols.length === 0 ? (
                    <div className={styles.empty}>
                        <FontAwesomeIcon icon={faChartLine} className={styles.emptyIcon} />
                        <p>No symbols tracked</p>
                        <span>Add a symbol above to start trend analysis</span>
                    </div>
                ) : (
                    <div className={`${styles.grid} ${compact ? styles.gridCompact : ''}`}>
                        {displaySymbols.map((symbol) => (
                            <div
                                key={symbol.symbol}
                                className={styles.symbolCard}
                                onClick={() => onSymbolSelect?.(symbol.symbol)}
                                role={onSymbolSelect ? 'button' : undefined}
                                tabIndex={onSymbolSelect ? 0 : undefined}
                            >
                                {/* Symbol Header */}
                                <div className={styles.symbolHeader}>
                                    <span className={styles.symbolName}>{symbol.symbol}</span>
                                    <span className={`${styles.direction} ${getDirectionClass(symbol.direction)}`}>
                                        <FontAwesomeIcon icon={faCircle} className={styles.directionDot} />
                                        {symbol.direction || 'WAIT'}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className={styles.progressWrapper}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${getProgressClass(symbol.bufferProgress)}`}
                                            style={{ width: `${symbol.bufferProgress}%` }}
                                        />
                                    </div>
                                    <span className={styles.progressText}>
                                        {symbol.bufferProgress}%
                                    </span>
                                </div>

                                {/* Status & Actions */}
                                <div className={styles.symbolFooter}>
                                    <span className={`${styles.status} ${symbol.isActive ? styles.statusActive : styles.statusInactive}`}>
                                        {symbol.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                        className={styles.removeButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveSymbol(symbol.symbol);
                                        }}
                                        title="Remove symbol"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Show more indicator */}
                {hasMore && (
                    <div className={styles.moreIndicator}>
                        +{symbols.length - maxVisible} more symbols
                    </div>
                )}

                {/* Summary Stats */}
                {symbols.length > 0 && !compact && (
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{symbols.length}</span>
                            <span className={styles.statLabel}>Total</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={`${styles.statValue} ${styles.statLong}`}>
                                {symbols.filter(s => s.direction === 'LONG').length}
                            </span>
                            <span className={styles.statLabel}>Long</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={`${styles.statValue} ${styles.statShort}`}>
                                {symbols.filter(s => s.direction === 'SHORT').length}
                            </span>
                            <span className={styles.statLabel}>Short</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={`${styles.statValue} ${styles.statWait}`}>
                                {symbols.filter(s => s.direction === 'WAIT' || !s.direction).length}
                            </span>
                            <span className={styles.statLabel}>Wait</span>
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
}

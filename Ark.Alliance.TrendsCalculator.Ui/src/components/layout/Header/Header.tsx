/**
 * Header Component
 * 
 * @fileoverview Application header with title, Binance toggle, and theme control
 * 
 * VIEW ONLY
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { NeonToggle } from 'ark-alliance-react-ui';
import { useHeaderViewModel } from './Header.viewmodel';
import styles from './Header.module.css';

interface HeaderProps {
    pageTitle?: string;
    pageSubtitle?: string;
}

export function Header({ pageTitle, pageSubtitle }: HeaderProps) {
    const vm = useHeaderViewModel();

    return (
        <header className={styles.header}>
            <div className={styles.logoSection}>
                {/* Ark.Alliance Logo/Icon */}
                <div className={styles.icon}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 2L4 10v12l12 8 12-8V10L16 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M16 10l-6 4v6l6 4 6-4v-6l-6-4z" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>

                {/* App Title */}
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Ark.Alliance.TrendsCalculator</h1>
                    {(pageTitle || pageSubtitle) && (
                        <div className={styles.pageInfo}>
                            {pageTitle && <span className={styles.pageTitle}>{pageTitle}</span>}
                            {pageSubtitle && <span className={styles.pageSubtitle}>{pageSubtitle}</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.actions}>
                {/* Binance Connection Toggle */}
                <div className={styles.binanceToggle}>
                    <span className={styles.toggleLabel}>Binance:</span>
                    <NeonToggle
                        checked={vm.isBinanceConnected}
                        onChange={vm.handleBinanceToggle}
                        disabled={vm.isToggleDisabled}
                        size="sm"
                    />
                    <div className={styles.status}>
                        <div
                            className={styles.statusDot}
                            style={{ backgroundColor: vm.binanceStatusColor }}
                        />
                        <span>{vm.binanceStatusText}</span>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button
                    className={styles.iconButton}
                    onClick={vm.toggleTheme}
                    title={vm.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <FontAwesomeIcon icon={vm.isDark ? faSun : faMoon} />
                </button>
            </div>
        </header>
    );
}

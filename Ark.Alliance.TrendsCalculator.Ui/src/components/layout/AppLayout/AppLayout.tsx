/**
 * AppLayout Component
 * 
 * @fileoverview Main application layout container
 * 
 * VIEW ONLY - No logic
 */

import { ReactNode } from 'react';
import { useAppLayoutViewModel } from './AppLayout.viewmodel';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
    children: ReactNode;
    currentPath: string;
    onNavigate: (path: string) => void;
    pageTitle?: string;
    pageSubtitle?: string;
}

export function AppLayout({
    children,
    currentPath,
    onNavigate,
    pageTitle,
    pageSubtitle,
}: AppLayoutProps) {
    const vm = useAppLayoutViewModel();
    const { isDark } = useTheme();

    return (
        <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>
            {/* Animated background */}
            <div className={styles.background} />

            {/* Header */}
            <div className={styles.headerWrapper}>
                <Header
                    pageTitle={pageTitle}
                    pageSubtitle={pageSubtitle}
                />
            </div>

            {/* Main content area */}
            <div className={styles.mainWrapper}>
                {/* Sidebar */}
                <Sidebar
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                    collapsed={vm.sidebarCollapsed}
                    onToggle={vm.toggleSidebar}
                />

                {/* Page content */}
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}

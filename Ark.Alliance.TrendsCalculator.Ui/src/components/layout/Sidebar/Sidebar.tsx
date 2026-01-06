/**
 * Sidebar Component
 * 
 * @fileoverview Navigation sidebar
 * 
 * VIEW ONLY
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faBullseye,
    faChartBar,
    faChartArea,
    faCog,
    faGraduationCap,
    faRobot
} from '@fortawesome/free-solid-svg-icons';
import styles from './Sidebar.module.css';

interface SidebarProps {
    currentPath: string;
    onNavigate: (path: string) => void;
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ currentPath, onNavigate, collapsed, onToggle }: SidebarProps) {
    const menuItems = [
        { path: '/', label: 'Overview', icon: faChartLine },
        { path: '/symbols', label: 'Symbols', icon: faBullseye },
        { path: '/trends', label: 'Trends', icon: faChartBar },
        { path: '/visualization', label: 'Visualization', icon: faChartArea },
        { path: '/configuration', label: 'Configuration', icon: faCog },
        { path: '/training', label: 'Training', icon: faGraduationCap },
        { path: '/ai-telemetry', label: 'AI Telemetry', icon: faRobot },
    ];

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            {/* Toggle button */}
            <button className={styles.toggleButton} onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
                {collapsed ? '→' : '←'}
            </button>

            {/* Navigation menu */}
            <nav className={styles.nav}>
                {menuItems.map(item => (
                    <button
                        key={item.path}
                        className={`${styles.navItem} ${currentPath === item.path ? styles.active : ''}`}
                        onClick={() => onNavigate(item.path)}
                        title={item.label}
                    >
                        <span className={styles.icon}>
                            <FontAwesomeIcon icon={item.icon} />
                        </span>
                        {!collapsed && <span className={styles.label}>{item.label}</span>}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

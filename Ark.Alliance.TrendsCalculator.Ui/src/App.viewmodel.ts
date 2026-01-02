/**
 * App ViewModel
 * 
 * @fileoverview Logic for main App component
 * 
 * CODE ONLY - All state and handlers, no JSX
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useTrends } from './contexts/TrendsContext';

export function useAppViewModel() {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = useTrends();

    const currentPath = location.pathname;

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    // Page info based on current route
    const getPageInfo = () => {
        const symbolCount = Object.keys(state.symbols).length;
        const activeCount = Object.values(state.symbols).filter(s => s.isActive).length;

        switch (currentPath) {
            case '/':
                return {
                    title: 'Trends Overview',
                    subtitle: `${symbolCount} symbols tracked • ${activeCount} active`,
                };
            case '/symbols':
                return {
                    title: 'Symbol Management',
                    subtitle: `Managing ${symbolCount} symbols`,
                };
            case '/visualization':
                return {
                    title: 'Trend Visualization',
                    subtitle: 'Real-time price charts and predictions',
                };
            case '/configuration':
                return {
                    title: 'Configuration',
                    subtitle: 'System settings and AI configuration',
                };
            case '/training':
                return {
                    title: 'Training Mode',
                    subtitle: 'Forecast accuracy monitoring',
                };
            default:
                return { title: undefined, subtitle: undefined };
        }
    };

    const pageInfo = getPageInfo();

    return {
        currentPath,
        pageInfo,
        handleNavigate,
    };
}

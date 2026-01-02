/**
 * @fileoverview Theme Context
 * @module contexts/ThemeContext
 * 
 * Provides global theme state management for dark/light mode switching.
 * 
 * @description
 * This context manages the application's theme state (dark or light mode)
 * with persistent storage in localStorage. Automatically applies theme
 * changes to the document root element for CSS styling.
 * 
 * @example
 * ```tsx
 * // In provider
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * // In component
 * const { isDark, toggleTheme } = useTheme();
 * <button onClick={toggleTheme}>
 *   {isDark ? 'Light Mode' : 'Dark Mode'}
 * </button>
 * ```
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2025-12-28
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Theme context interface
 * 
 * @interface ThemeContextType
 * @property {boolean} isDark - Current theme state (true = dark, false = light)
 * @property {Function} toggleTheme - Toggle between dark and light modes
 */
interface ThemeContextType {
    /** True if dark mode is active, false for light mode */
    isDark: boolean;
    /** Toggle between dark and light theme */
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} Theme provider wrapper
 * 
 * @description
 * Provides theme state to all descendant components. Persists theme
 * preference in localStorage and applies appropriate CSS class to
 * document root element.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || saved === null; // Default to dark
    });

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Theme Hook
 * 
 * @hook
 * @returns {ThemeContextType} Theme context value
 * @throws {Error} If used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * const { isDark, toggleTheme } = useTheme();
 * ```
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

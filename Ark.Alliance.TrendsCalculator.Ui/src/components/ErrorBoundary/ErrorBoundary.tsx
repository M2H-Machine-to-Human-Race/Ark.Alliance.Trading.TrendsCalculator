/**
 * @fileoverview Error Boundary Component
 * @module components/ErrorBoundary
 * @description
 * React Error Boundary for graceful error handling in the UI.
 * Catches JavaScript errors anywhere in the child component tree.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches and displays errors in child components
 * 
 * @class ErrorBoundary
 * @extends {Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={styles.container}>
                    <div className={styles.card}>
                        <h1 className={styles.title}>⚠️ Something went wrong</h1>
                        <p className={styles.message}>
                            We're sorry, but an unexpected error occurred. Please try refreshing the page.
                        </p>

                        {this.state.error && (
                            <details className={styles.details}>
                                <summary>Error Details</summary>
                                <pre className={styles.errorText}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className={styles.actions}>
                            <button className={styles.button} onClick={this.handleReset}>
                                Try Again
                            </button>
                            <button className={styles.buttonSecondary} onClick={() => window.location.reload()}>
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

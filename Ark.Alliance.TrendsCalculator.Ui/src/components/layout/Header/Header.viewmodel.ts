/**
 * Header ViewModel
 * 
 * @fileoverview Logic for header component
 * 
 * CODE ONLY
 */

import { useState, useCallback } from 'react';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import { useTheme } from '../../../contexts/ThemeContext';

export function useHeaderViewModel() {
    const { isConnected } = useWebSocket();
    const { isDark, toggleTheme } = useTheme();

    // Binance connection state
    const [isBinanceConnected, setIsBinanceConnected] = useState(false);
    const [binanceStatus, setBinanceStatus] = useState<'disconnected' | 'testing' | 'connected' | 'error'>('disconnected');

    // Fetch initial status
    useState(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('/api/binance/status');
                const result = await response.json();
                if (result.success && result.data.status === 'connected') {
                    setBinanceStatus('connected');
                    setIsBinanceConnected(true);
                } else if (result.success) {
                    setBinanceStatus(result.data.status);
                    setIsBinanceConnected(false);
                }
            } catch (error) {
                console.error('Failed to fetch Binance status:', error);
            }
        };
        checkStatus();
    });

    const handleBinanceToggle = useCallback(async (enabled: boolean) => {
        if (enabled) {
            // Connect to Binance
            setBinanceStatus('testing');
            try {
                const response = await fetch('/api/binance/connect', { method: 'POST' });
                const result = await response.json();

                if (result.success) {
                    setBinanceStatus('connected');
                    setIsBinanceConnected(true);
                } else {
                    setBinanceStatus('error');
                    setIsBinanceConnected(false);
                    console.error('Binance connection failed:', result.error.message || result.error);
                }
            } catch (error) {
                console.error('Binance connection error:', error);
                setBinanceStatus('error');
                setIsBinanceConnected(false);
            }
        } else {
            // Disconnect from Binance
            try {
                await fetch('/api/binance/disconnect', { method: 'POST' });

                setBinanceStatus('disconnected');
                setIsBinanceConnected(false);
            } catch (error) {
                console.error('Binance disconnection error:', error);
            }
        }
    }, []);

    // Connection status for internal WebSocket
    const internalConnectionStatus = isConnected ? 'Connected' : 'Disconnected';
    const internalConnectionColor = isConnected ? '#10b981' : '#ef4444';

    // Binance connection status text
    const binanceStatusText = {
        disconnected: 'Disconnected',
        testing: 'Testing...',
        connected: 'Connected',
        error: 'Error',
    }[binanceStatus];

    const binanceStatusColor = {
        disconnected: '#6b7280',
        testing: '#f59e0b',
        connected: '#10b981',
        error: '#ef4444',
    }[binanceStatus];

    return {
        isDark,
        toggleTheme,
        internalConnectionStatus,
        internalConnectionColor,
        isBinanceConnected,
        binanceStatus,
        binanceStatusText,
        binanceStatusColor,
        handleBinanceToggle,
        isToggleDisabled: binanceStatus === 'testing',
    };
}

/**
 * @fileoverview WebSocket Context
 * @module contexts/WebSocketContext
 * 
 * Provides global WebSocket connection state management and lifecycle handling.
 * 
 * @description
 * This context manages the WebSocket connection to the backend server,
 * tracking connection status and providing reconnection functionality.
 * Automatically connects on mount and cleans up on unmount.
 * 
 * @example
 * ```tsx
 * // In provider
 * <WebSocketProvider>
 *   <App />
 * </WebSocketProvider>
 * 
 * // In component
 * const { isConnected, reconnect } = useWebSocket();
 * {!isConnected && <button onClick={reconnect}>Reconnect</button>}
 * ```
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2025-12-28
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import websocketService from '../services/websocket';

/**
 * WebSocket context interface
 * 
 * @interface WebSocketContextType
 * @property {boolean} isConnected - Current WebSocket connection status
 * @property {Function} reconnect - Manually trigger reconnection
 */
interface WebSocketContextType {
    /** True if WebSocket is connected, false otherwise */
    isConnected: boolean;
    /** Manually disconnect and reconnect the WebSocket */
    reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

/**
 * WebSocket Provider Component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} WebSocket provider wrapper
 * 
 * @description
 * Provides WebSocket connection state to all descendant components.
 * Automatically establishes connection on mount and handles cleanup
 * on unmount. Listens to connection events and updates state accordingly.
 */
export function WebSocketProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect on mount
        websocketService.connect();

        // Listen for connection status
        websocketService.on('connect', () => setIsConnected(true));
        websocketService.on('disconnect', () => setIsConnected(false));

        return () => {
            websocketService.disconnect();
        };
    }, []);

    const reconnect = () => {
        websocketService.disconnect();
        websocketService.connect();
    };

    return (
        <WebSocketContext.Provider value={{ isConnected, reconnect }}>
            {children}
        </WebSocketContext.Provider>
    );
}

/**
 * WebSocket Hook
 * 
 * @hook
 * @returns {WebSocketContextType} WebSocket context value
 * @throws {Error} If used outside WebSocketProvider
 * 
 * @example
 * ```tsx
 * const { isConnected, reconnect } = useWebSocket();
 * ```
 */
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
}

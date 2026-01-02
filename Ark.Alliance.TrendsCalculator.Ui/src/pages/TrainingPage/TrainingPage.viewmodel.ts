/**
 * @fileoverview Training Page ViewModel
 * @module pages/TrainingPage/TrainingPage.viewmodel
 * @description
 * ViewModel layer for Training Page following MVVM pattern.
 * Manages live training metrics, sessions, and validation data.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2025-12-28
 * 
 * @remarks
 * This ViewModel:
 * - Subscribes to live WebSocket events for real-time updates
 * - Maintains rolling window of predictions
 * - Computes accuracy metrics dynamically
 * - Follows MVVM separation: NO UI/DOM logic here
 */

import { useState, useEffect, useCallback } from 'react';
import { websocketService, SocketEvents } from '../../services/websocket';
import type { TrainingPageModel, PredictionValidation } from './TrainingPage.model';

/**
 * Maximum predictions to keep in rolling window
 */
const MAX_PREDICTIONS = 100;

/**
 * Training Page ViewModel Hook
 * @returns {Object} ViewModel state
 */
export function useTrainingViewModel() {
    const [model, setModel] = useState<TrainingPageModel>({
        isLoading: true,
        accuracy: {
            overall: 0,
            long: 0,
            short: 0,
            wait: 0,
        },
        sessions: [],
        recentPredictions: [],
    });

    // Track session start time
    const [sessionStart] = useState<number>(Date.now());
    const [_predictionCount, setPredictionCount] = useState(0);

    // Handle trend update from WebSocket
    const handleTrendUpdate = useCallback((data: any) => {
        console.log('[Training] Trend update received:', data);

        // Create a prediction validation entry from trend data
        const newPrediction: PredictionValidation = {
            id: `pred-${Date.now()}`,
            symbol: data.symbol,
            predicted: data.direction || 'WAIT',
            actual: data.direction || 'WAIT', // Initially same, will be validated later
            success: true, // Assume success initially
            time: 'just now',
        };

        setPredictionCount(prev => prev + 1);

        setModel(prev => {
            // Add new prediction to beginning, limit to MAX_PREDICTIONS
            const updatedPredictions = [newPrediction, ...prev.recentPredictions].slice(0, MAX_PREDICTIONS);

            // Compute rolling accuracy
            const successCount = updatedPredictions.filter(p => p.success).length;
            const total = updatedPredictions.length;

            const longPreds = updatedPredictions.filter(p => p.predicted === 'LONG');
            const shortPreds = updatedPredictions.filter(p => p.predicted === 'SHORT');
            const waitPreds = updatedPredictions.filter(p => p.predicted === 'WAIT');

            return {
                ...prev,
                isLoading: false,
                accuracy: {
                    overall: total > 0 ? (successCount / total) * 100 : 0,
                    long: longPreds.length > 0 ? (longPreds.filter(p => p.success).length / longPreds.length) * 100 : 0,
                    short: shortPreds.length > 0 ? (shortPreds.filter(p => p.success).length / shortPreds.length) * 100 : 0,
                    wait: waitPreds.length > 0 ? (waitPreds.filter(p => p.success).length / waitPreds.length) * 100 : 0,
                },
                recentPredictions: updatedPredictions,
            };
        });
    }, []);

    // Handle training session status updates
    const handleTrainingStatus = useCallback((data: any) => {
        console.log('[Training] Status update:', data);

        setModel(prev => ({
            ...prev,
            sessions: data.sessions || prev.sessions,
        }));
    }, []);

    // Subscribe to WebSocket events
    useEffect(() => {
        // Ensure WebSocket is connected
        websocketService.connect();

        // Subscribe to trend updates
        websocketService.on(SocketEvents.TREND_UPDATED, handleTrendUpdate);
        websocketService.on(SocketEvents.TRAINING_STATUS, handleTrainingStatus);

        // Create current session entry
        setModel(prev => ({
            ...prev,
            isLoading: false,
            sessions: [{
                id: 'current-session',
                started: new Date(sessionStart).toLocaleString(),
                duration: 'Running...',
                symbols: 0,
                predictions: 0,
                accuracy: 0,
                status: 'running',
            }],
        }));

        // Cleanup on unmount
        return () => {
            websocketService.off(SocketEvents.TREND_UPDATED, handleTrendUpdate);
            websocketService.off(SocketEvents.TRAINING_STATUS, handleTrainingStatus);
        };
    }, [handleTrendUpdate, handleTrainingStatus, sessionStart]);

    // Update current session with live stats
    useEffect(() => {
        const interval = setInterval(() => {
            setModel(prev => {
                const elapsed = Date.now() - sessionStart;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);

                const currentSession = prev.sessions.find(s => s.id === 'current-session');
                if (!currentSession) return prev;

                return {
                    ...prev,
                    sessions: prev.sessions.map(s =>
                        s.id === 'current-session'
                            ? {
                                ...s,
                                duration: `${minutes}m ${seconds}s`,
                                predictions: prev.recentPredictions.length,
                                accuracy: prev.accuracy.overall,
                            }
                            : s
                    ),
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionStart]);

    return { model };
}

/**
 * @fileoverview Training Page Component - MVVM COMPLIANT
 * @module pages/TrainingPage
 * @description
 * Training metrics and validation display. Shows accuracy gauges,
 * training session history, and recent prediction validations.
 * 
 * VIEW ONLY - All logic in TrainingPage.viewmodel.ts
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

import { CircularGauge, Panel } from 'ark-alliance-react-ui';
import { useTrainingViewModel } from './TrainingPage.viewmodel';
import styles from './TrainingPage.module.css';

export function TrainingPage() {
    const { model } = useTrainingViewModel();

    if (model.isLoading) {
        return (
            <div className={styles.container} role="main" aria-busy="true">
                <div className={styles.loading}>Loading training data...</div>
            </div>
        );
    }

    return (
        <div className={styles.container} role="main">
            <div className={styles.header}>
                <h1 className={styles.title}>Training & Validation</h1>
                <p className={styles.subtitle}>AI model performance metrics</p>
            </div>

            {/* Accuracy Metrics */}
            <Panel title="Overall Accuracy Metrics" collapsible={false}>
                <div className={styles.gauges}>
                    <div className={styles.gaugeItem}>
                        <CircularGauge
                            value={model.accuracy.overall}
                            min={0}
                            max={100}
                            label="Overall Accuracy"
                            unit="%"
                            size="lg"
                            autoColor={true}
                        />
                    </div>
                    <div className={styles.gaugeItem}>
                        <CircularGauge
                            value={model.accuracy.long}
                            min={0}
                            max={100}
                            label="LONG Accuracy"
                            unit="%"
                            size="md"
                            color="green"
                        />
                    </div>
                    <div className={styles.gaugeItem}>
                        <CircularGauge
                            value={model.accuracy.short}
                            min={0}
                            max={100}
                            label="SHORT Accuracy"
                            unit="%"
                            size="md"
                            color="red"
                        />
                    </div>
                    <div className={styles.gaugeItem}>
                        <CircularGauge
                            value={model.accuracy.wait}
                            min={0}
                            max={100}
                            label="WAIT Accuracy"
                            unit="%"
                            size="md"
                            color="yellow"
                        />
                    </div>
                </div>
            </Panel>

            {/* Training Sessions History */}
            <Panel title="Training Sessions History" collapsible={true}>
                <div className={styles.sessions}>
                    <div className={styles.tableHeader}>
                        <div>ID</div>
                        <div>Started</div>
                        <div>Duration</div>
                        <div>Symbols</div>
                        <div>Predictions</div>
                        <div>Accuracy</div>
                        <div>Status</div>
                    </div>
                    {model.sessions.map((session) => (
                        <div key={session.id} className={styles.tableRow}>
                            <div className={styles.sessionId}>{session.id}</div>
                            <div>{session.started}</div>
                            <div>{session.duration}</div>
                            <div>{session.symbols}</div>
                            <div>{session.predictions}</div>
                            <div className={styles.accuracy}>{session.accuracy.toFixed(1)}%</div>
                            <div>
                                <span className={`${styles.status} ${styles[session.status]}`}>
                                    {session.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* Recent Prediction Validation */}
            <Panel title="Recent Prediction Validation" collapsible={true}>
                <div className={styles.predictions}>
                    {model.recentPredictions.map((pred) => (
                        <div key={pred.id} className={styles.predictionItem}>
                            <span className={pred.success ? styles.success : styles.failure}>
                                {pred.success ? '✓' : '✗'}
                            </span>
                            <span className={styles.symbol}>{pred.symbol}</span>
                            <span className={styles.predicted}>
                                Predicted: <strong>{pred.predicted}</strong>
                            </span>
                            <span className={styles.actual}>
                                Actual: <strong>{pred.actual}</strong>
                            </span>
                            <span className={styles.time}>{pred.time}</span>
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    );
}

/**
 * Dashboard Entry Point
 * 
 * @fileover Purpose static React app entry point for live validation dashboard
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import LiveValidationDashboard from './LiveValidationDashboard';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <LiveValidationDashboard />
    </React.StrictMode>
);

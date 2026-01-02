/**
 * @fileoverview Type declarations for ark-alliance-react-ui
 * @module types/ark-alliance-react-ui
 * 
 * Temporary type definitions until package publishes .d.ts files.
 * @see https://www.npmjs.com/package/ark-alliance-react-ui
 */

declare module 'ark-alliance-react-ui' {
    import { FC, ReactNode, CSSProperties } from 'react';

    // ═══════════════════════════════════════════════════════════════════════
    // Panel Component
    // ═══════════════════════════════════════════════════════════════════════

    export interface PanelProps {
        title?: string;
        children?: ReactNode;
        className?: string;
        style?: CSSProperties;
        variant?: 'default' | 'glass' | 'solid' | 'bordered';
        collapsible?: boolean;
        defaultCollapsed?: boolean;
        headerActions?: ReactNode;
        footer?: ReactNode;
    }

    export const Panel: FC<PanelProps>;

    // ═══════════════════════════════════════════════════════════════════════
    // NeonButton Component
    // ═══════════════════════════════════════════════════════════════════════

    export interface NeonButtonProps {
        children?: ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        className?: string;
        style?: CSSProperties;
        variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
        size?: 'sm' | 'md' | 'lg';
        loading?: boolean;
        icon?: ReactNode;
        type?: 'button' | 'submit' | 'reset';
    }

    export const NeonButton: FC<NeonButtonProps>;

    // ═══════════════════════════════════════════════════════════════════════
    // NeonToggle Component  
    // ═══════════════════════════════════════════════════════════════════════

    export interface NeonToggleProps {
        checked?: boolean;
        onChange?: (checked: boolean) => void;
        disabled?: boolean;
        className?: string;
        label?: string;
        size?: 'sm' | 'md' | 'lg';
    }

    export const NeonToggle: FC<NeonToggleProps>;

    // ═══════════════════════════════════════════════════════════════════════
    // CircularGauge Component
    // ═══════════════════════════════════════════════════════════════════════

    export interface CircularGaugeProps {
        value: number;
        min?: number;
        max?: number;
        label?: string;
        size?: 'sm' | 'md' | 'lg' | number;
        color?: string;
        showValue?: boolean;
        className?: string;
        style?: CSSProperties;
        unit?: string;
        autoColor?: boolean;
    }

    export const CircularGauge: FC<CircularGaugeProps>;

    // ═══════════════════════════════════════════════════════════════════════
    // GlowCard Component
    // ═══════════════════════════════════════════════════════════════════════

    export interface GlowCardProps {
        children?: ReactNode;
        title?: string;
        subtitle?: string;
        className?: string;
        style?: CSSProperties;
        glowColor?: string;
        variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
        status?: 'info' | 'success' | 'warning' | 'error' | 'idle';
        onClick?: () => void;
        hoverable?: boolean;
        compact?: boolean;
        icon?: ReactNode;
    }

    export const GlowCard: FC<GlowCardProps>;

    // ═══════════════════════════════════════════════════════════════════════
    // FinancialChart Component
    // ═══════════════════════════════════════════════════════════════════════

    export interface ChartDataPoint {
        time: number | string;
        value?: number;
        open?: number;
        high?: number;
        low?: number;
        close?: number;
        volume?: number;
    }

    export interface FinancialChartProps {
        data?: ChartDataPoint[];
        candlestickData?: any[];
        predictions?: any[];
        symbol?: string;
        type?: 'line' | 'candlestick' | 'area' | 'bar';
        chartType?: string;
        title?: string;
        height?: number | string;
        width?: number | string;
        className?: string;
        style?: CSSProperties;
        showVolume?: boolean;
        showGrid?: boolean;
        showLegend?: boolean;
        isConnected?: boolean;
        isStreaming?: boolean;
        interval?: string;
        colors?: {
            up?: string;
            down?: string;
            line?: string;
            area?: string;
        };
        formatters?: {
            price?: (value: number) => string;
            time?: (value: number | string) => string;
        };
    }

    export const FinancialChart: FC<FinancialChartProps>;
}

declare module 'ark-alliance-react-ui/styles' {
    // CSS file import
}

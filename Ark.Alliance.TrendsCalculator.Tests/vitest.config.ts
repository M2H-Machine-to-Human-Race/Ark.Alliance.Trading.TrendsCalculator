import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'dist/**',
                '**/*.d.ts',
                '**/*.config.*',
                '**/fixtures/**'
            ]
        }
    },
    resolve: {
        alias: {
            '@backend': path.resolve(__dirname, '../Ark.Alliance.TrendsCalculator.Backend/src'),
            '@share': path.resolve(__dirname, '../Ark.Alliance.TrendsCalculator.Share/src'),
            '@infrastructure': path.resolve(__dirname, '../Ark.Alliance.TrendsCalculator.Backend/src/infrastructure'),
            '@domain': path.resolve(__dirname, '../Ark.Alliance.TrendsCalculator.Backend/src/domain'),
            '@application': path.resolve(__dirname, '../Ark.Alliance.TrendsCalculator.Backend/src/application'),
            // Trading providers library - main, subpaths, and source directories
            'ark-alliance-trading-providers-lib/Binance': path.resolve(__dirname, '../../Ark.Alliance.Trading.Providers.Lib/src/Ark.Alliance.Trading.Providers.Lib/Src/Binance'),
            'ark-alliance-trading-providers-lib/Common': path.resolve(__dirname, '../../Ark.Alliance.Trading.Providers.Lib/src/Ark.Alliance.Trading.Providers.Lib/Src/Common'),
            'ark-alliance-trading-providers-lib/Services': path.resolve(__dirname, '../../Ark.Alliance.Trading.Providers.Lib/src/Ark.Alliance.Trading.Providers.Lib/Src/Services'),
            'ark-alliance-trading-providers-lib': path.resolve(__dirname, '../../Ark.Alliance.Trading.Providers.Lib/src/Ark.Alliance.Trading.Providers.Lib/Src')
        }
    }
});

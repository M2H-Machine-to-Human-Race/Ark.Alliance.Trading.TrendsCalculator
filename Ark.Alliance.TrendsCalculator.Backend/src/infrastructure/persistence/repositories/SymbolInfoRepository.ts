/**
 * @fileoverview Symbol Info Repository
 * @module Data/repositories/SymbolInfoRepository
 */

import { DatabaseService } from '../DatabaseService';
import { SymbolInfo, SymbolInfoRow, rowToEntity, entityToRow } from '../entities/SymbolInfo';

export class SymbolInfoRepository {
    private static instance: SymbolInfoRepository | null = null;
    private dbService: DatabaseService;

    private constructor() {
        this.dbService = DatabaseService.getInstance();
    }

    static getInstance(): SymbolInfoRepository {
        if (!SymbolInfoRepository.instance) {
            SymbolInfoRepository.instance = new SymbolInfoRepository();
        }
        return SymbolInfoRepository.instance;
    }

    findBySymbol(symbol: string): SymbolInfo | null {
        const row = this.dbService.get<SymbolInfoRow>(
            'SELECT * FROM symbol_info WHERE symbol = ?',
            [symbol]
        );
        return row ? rowToEntity(row) : null;
    }

    findAll(): SymbolInfo[] {
        const rows = this.dbService.all<SymbolInfoRow>(
            'SELECT * FROM symbol_info ORDER BY symbol ASC'
        );
        return rows.map(rowToEntity);
    }

    findActive(): SymbolInfo[] {
        const rows = this.dbService.all<SymbolInfoRow>(
            'SELECT * FROM symbol_info WHERE status = ? ORDER BY symbol ASC',
            ['TRADING']
        );
        return rows.map(rowToEntity);
    }

    create(info: SymbolInfo): number {
        const row = entityToRow(info);

        this.dbService.run(`
            INSERT INTO symbol_info (
                symbol, base_asset, quote_asset, margin_asset, status, contract_type,
                min_price, max_price, tick_size, price_decimals, price_precision,
                min_qty, max_qty, step_size, qty_decimals, quantity_precision,
                min_notional, max_notional, max_num_orders, max_num_algo_orders,
                max_leverage, maint_margin_percent, required_margin_percent,
                volume_24h, volume_12h, volume_1h, volume_15m, quote_volume_24h,
                last_price, price_change_24h, price_change_percent_24h, high_24h, low_24h,
                onboard_date, delivery_date, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            row.symbol, row.base_asset, row.quote_asset, row.margin_asset, row.status, row.contract_type,
            row.min_price, row.max_price, row.tick_size, row.price_decimals, row.price_precision,
            row.min_qty, row.max_qty, row.step_size, row.qty_decimals, row.quantity_precision,
            row.min_notional, row.max_notional, row.max_num_orders, row.max_num_algo_orders,
            row.max_leverage, row.maint_margin_percent, row.required_margin_percent,
            row.volume_24h, row.volume_12h, row.volume_1h, row.volume_15m, row.quote_volume_24h,
            row.last_price, row.price_change_24h, row.price_change_percent_24h, row.high_24h, row.low_24h,
            row.onboard_date, row.delivery_date, row.last_updated
        ]);

        this.dbService.save();
        return this.dbService.lastInsertRowId();
    }

    update(symbol: string, info: Partial<SymbolInfo>): void {
        const row = entityToRow(info as SymbolInfo);

        this.dbService.run(`
            UPDATE symbol_info SET
                base_asset = COALESCE(?, base_asset),
                quote_asset = COALESCE(?, quote_asset),
                status = COALESCE(?, status),
                tick_size = COALESCE(?, tick_size),
                price_decimals = COALESCE(?, price_decimals),
                step_size = COALESCE(?, step_size),
                qty_decimals = COALESCE(?, qty_decimals),
                min_notional = COALESCE(?, min_notional),
                max_leverage = COALESCE(?, max_leverage),
                volume_24h = COALESCE(?, volume_24h),
                last_price = COALESCE(?, last_price),
                last_updated = ?
            WHERE symbol = ?
        `, [
            row.base_asset, row.quote_asset, row.status,
            row.tick_size, row.price_decimals,
            row.step_size, row.qty_decimals,
            row.min_notional, row.max_leverage,
            row.volume_24h, row.last_price,
            new Date().toISOString(),
            symbol
        ]);

        this.dbService.save();
    }

    upsert(info: SymbolInfo): void {
        const existing = this.findBySymbol(info.symbol);

        if (existing) {
            info.lastUpdated = new Date();
            this.update(info.symbol, info);
        } else {
            info.lastUpdated = new Date();
            this.create(info);
        }
    }

    delete(symbol: string): void {
        this.dbService.run('DELETE FROM symbol_info WHERE symbol = ?', [symbol]);
        this.dbService.save();
    }
}

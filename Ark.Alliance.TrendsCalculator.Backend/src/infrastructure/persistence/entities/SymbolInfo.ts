/**
 * Symbol Info Entity
 * Database entity representing Binance Futures symbol information
 */

export interface SymbolInfo {
    id?: number;
    symbol: string;

    // Symbol Details
    baseAsset: string;
    quoteAsset: string;
    marginAsset?: string;
    status: 'TRADING' | 'BREAK' | 'HALT';
    contractType?: string;

    // Price Filters
    minPrice?: number;
    maxPrice?: number;
    tickSize: number;
    priceDecimals: number;
    pricePrecision?: number;

    // Lot Size Filters
    minQty: number;
    maxQty?: number;
    stepSize: number;
    qtyDecimals: number;
    quantityPrecision?: number;

    // Notional Filters
    minNotional?: number;
    maxNotional?: number;

    // Market Limits
    maxNumOrders?: number;
    maxNumAlgoOrders?: number;

    // Leverage & Margin
    maxLeverage: number;
    maintMarginPercent?: number;
    requiredMarginPercent?: number;

    // Volume Statistics
    volume24h?: number;
    volume12h?: number;
    volume1h?: number;
    volume15m?: number;
    quoteVolume24h?: number;

    // Price Statistics
    lastPrice?: number;
    priceChange24h?: number;
    priceChangePercent24h?: number;
    high24h?: number;
    low24h?: number;

    // Metadata
    onboardDate?: number;
    deliveryDate?: number;

    // Timestamps
    lastUpdated: Date;
    createdAt?: Date;
}

/**
 * Database row representation (snake_case for SQLite)
 */
export interface SymbolInfoRow {
    id?: number;
    symbol: string;
    base_asset: string;
    quote_asset: string;
    margin_asset?: string;
    status: string;
    contract_type?: string;
    min_price?: number;
    max_price?: number;
    tick_size: number;
    price_decimals: number;
    price_precision?: number;
    min_qty: number;
    max_qty?: number;
    step_size: number;
    qty_decimals: number;
    quantity_precision?: number;
    min_notional?: number;
    max_notional?: number;
    max_num_orders?: number;
    max_num_algo_orders?: number;
    max_leverage: number;
    maint_margin_percent?: number;
    required_margin_percent?: number;
    volume_24h?: number;
    volume_12h?: number;
    volume_1h?: number;
    volume_15m?: number;
    quote_volume_24h?: number;
    last_price?: number;
    price_change_24h?: number;
    price_change_percent_24h?: number;
    high_24h?: number;
    low_24h?: number;
    onboard_date?: number;
    delivery_date?: number;
    last_updated: string;
    created_at?: string;
}

/**
 * Converts database row to entity
 */
export function rowToEntity(row: SymbolInfoRow): SymbolInfo {
    return {
        id: row.id,
        symbol: row.symbol,
        baseAsset: row.base_asset,
        quoteAsset: row.quote_asset,
        marginAsset: row.margin_asset,
        status: row.status as 'TRADING' | 'BREAK' | 'HALT',
        contractType: row.contract_type,
        minPrice: row.min_price,
        maxPrice: row.max_price,
        tickSize: row.tick_size,
        priceDecimals: row.price_decimals,
        pricePrecision: row.price_precision,
        minQty: row.min_qty,
        maxQty: row.max_qty,
        stepSize: row.step_size,
        qtyDecimals: row.qty_decimals,
        quantityPrecision: row.quantity_precision,
        minNotional: row.min_notional,
        maxNotional: row.max_notional,
        maxNumOrders: row.max_num_orders,
        maxNumAlgoOrders: row.max_num_algo_orders,
        maxLeverage: row.max_leverage,
        maintMarginPercent: row.maint_margin_percent,
        requiredMarginPercent: row.required_margin_percent,
        volume24h: row.volume_24h,
        volume12h: row.volume_12h,
        volume1h: row.volume_1h,
        volume15m: row.volume_15m,
        quoteVolume24h: row.quote_volume_24h,
        lastPrice: row.last_price,
        priceChange24h: row.price_change_24h,
        priceChangePercent24h: row.price_change_percent_24h,
        high24h: row.high_24h,
        low24h: row.low_24h,
        onboardDate: row.onboard_date,
        deliveryDate: row.delivery_date,
        lastUpdated: new Date(row.last_updated),
        createdAt: row.created_at ? new Date(row.created_at) : undefined
    };
}

/**
 * Converts entity to database row
 */
export function entityToRow(entity: SymbolInfo): Partial<SymbolInfoRow> {
    return {
        id: entity.id,
        symbol: entity.symbol,
        base_asset: entity.baseAsset,
        quote_asset: entity.quoteAsset,
        margin_asset: entity.marginAsset,
        status: entity.status,
        contract_type: entity.contractType,
        min_price: entity.minPrice,
        max_price: entity.maxPrice,
        tick_size: entity.tickSize,
        price_decimals: entity.priceDecimals,
        price_precision: entity.pricePrecision,
        min_qty: entity.minQty,
        max_qty: entity.maxQty,
        step_size: entity.stepSize,
        qty_decimals: entity.qtyDecimals,
        quantity_precision: entity.quantityPrecision,
        min_notional: entity.minNotional,
        max_notional: entity.maxNotional,
        max_num_orders: entity.maxNumOrders,
        max_num_algo_orders: entity.maxNumAlgoOrders,
        max_leverage: entity.maxLeverage,
        maint_margin_percent: entity.maintMarginPercent,
        required_margin_percent: entity.requiredMarginPercent,
        volume_24h: entity.volume24h,
        volume_12h: entity.volume12h,
        volume_1h: entity.volume1h,
        volume_15m: entity.volume15m,
        quote_volume_24h: entity.quoteVolume24h,
        last_price: entity.lastPrice,
        price_change_24h: entity.priceChange24h,
        price_change_percent_24h: entity.priceChangePercent24h,
        high_24h: entity.high24h,
        low_24h: entity.low24h,
        onboard_date: entity.onboardDate,
        delivery_date: entity.deliveryDate,
        last_updated: entity.lastUpdated ? entity.lastUpdated.toISOString() : new Date().toISOString()
    };
}

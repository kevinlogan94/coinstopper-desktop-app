// Coinbase API type definitions

export interface CurrencyAmount {
    value: string;
    currency: string;
}

export interface Account {
    uuid: string;
    name: string;
    currency: string;
    available_balance: CurrencyAmount;
    default: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    type: string;
    ready: boolean;
    hold: CurrencyAmount;
}

export interface AccountsResponse {
    accounts: Account[];
    has_next: boolean;
    cursor: string;
    size: number;
}

export interface Product {
    product_id: string;
    price: string;
    price_percentage_change_24h: string;
    volume_24h: string;
    volume_percentage_change_24h: string;
    base_increment: string;
    quote_increment: string;
    quote_min_size: string;
    quote_max_size: string;
    base_min_size: string;
    base_max_size: string;
    base_name: string;
    quote_name: string;
    watched: boolean;
    is_disabled: boolean;
    new: boolean;
    status: string;
    cancel_only: boolean;
    limit_only: boolean;
    post_only: boolean;
    trading_disabled: boolean;
    auction_mode: boolean;
    product_type: string;
    quote_currency_id: string;
    base_currency_id: string;
    fcm_trading_session_details: {
        is_session_open: boolean;
        open_time: string;
        close_time: string;
    };
    mid_market_price: string;
    base_display_symbol: string;
    quote_display_symbol: string;
    view_only: boolean;
    price_increment: string;
    product_venue: string;
    approximate_quote_24h_volume: string;
}

export interface GetProductsResponse {
    products: Product[];
    num_products: number;
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type OrderStatus = 
    | 'PENDING' 
    | 'OPEN' 
    | 'FILLED' 
    | 'CANCELLED' 
    | 'EXPIRED' 
    | 'FAILED' 
    | 'REJECTED';

export type TimeInForce = 
    | 'GOOD_UNTIL_CANCELLED' 
    | 'GOOD_UNTIL_DATE_TIME' 
    | 'IMMEDIATE_OR_CANCEL' 
    | 'FILL_OR_KILL';

export interface OrderConfiguration {
    market_market_ioc?: {
        quote_size: string;
        base_size: string;
    };
    limit_limit_gtc?: {
        base_size: string;
        limit_price: string;
        post_only: boolean;
    };
    limit_limit_gtd?: {
        base_size: string;
        limit_price: string;
        end_time: string;
        post_only: boolean;
    };
    stop_limit_stop_limit_gtc?: {
        base_size: string;
        limit_price: string;
        stop_price: string;
        stop_direction: 'STOP_DIRECTION_STOP_UP' | 'STOP_DIRECTION_STOP_DOWN';
    };
}

export interface CreateOrderRequest {
    client_order_id: string;
    product_id: string;
    side: OrderSide;
    order_configuration: OrderConfiguration;
}

export interface Order {
    order_id: string;
    client_order_id: string;
    product_id: string;
    user_id: string;
    order_configuration: OrderConfiguration;
    side: OrderSide;
    status: OrderStatus;
    time_in_force: TimeInForce;
    created_time: string;
    completion_percentage: string;
    filled_size: string;
    average_filled_price: string;
    fee: string;
    number_of_fills: string;
    filled_value: string;
    pending_cancel: boolean;
    size_in_quote: boolean;
    total_fees: string;
    size_inclusive_of_fees: boolean;
    total_value_after_fees: string;
    trigger_status: string;
    order_type: OrderType;
    reject_reason: string;
    settled: boolean;
    product_type: string;
    reject_message: string;
    cancel_message: string;
}

export interface CreateOrderResponse {
    order_id: string;
    product_id: string;
    side: OrderSide;
    client_order_id: string;
}

export interface GetOrderResponse {
    order: Order;
}

export interface GetOrdersResponse {
    orders: Order[];
    sequence: string;
    has_next: boolean;
    cursor: string;
}

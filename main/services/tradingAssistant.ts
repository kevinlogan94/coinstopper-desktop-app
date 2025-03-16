import { CBAdvancedTradeClient } from 'coinbase-api';
import { Logger } from './logger';
import { Account, AccountsResponse, Product, GetProductsResponse } from '../types/coinbase';

interface AppSettings {
    initialDeposit: number;
    quoteCurrency: string;
    blackList: string[];
}

interface TradingAssistantConfig {
    apiClient: CBAdvancedTradeClient;
    logger: Logger;
    appSettings: AppSettings;
}

export class TradingAssistant {
    constructor(config: TradingAssistantConfig) {
        this.apiClient = config.apiClient;
        this.logger = config.logger;
        this.appSettings = config.appSettings;
        this.quoteCurrency = config.appSettings.quoteCurrency;
    }

    private apiClient: CBAdvancedTradeClient;
    private balance: number = 0;
    private quoteCurrency: string;
    private bankReserve: number = 0;
    private logger: Logger;
    private appSettings: AppSettings;

    private deposit(amount: number): void {
        this.balance += amount;
        this.logger.info(`Deposited ${amount} ${this.quoteCurrency}. New balance: ${this.balance}`);
    }

    async getHoldings(): Promise<number> {
        try {
            const accounts: AccountsResponse = await this.retry(() => this.apiClient.getAccounts());
            const account = accounts.accounts.find((acc: Account) => acc.currency === this.quoteCurrency);
            let initialLoad = false;
            
            if (this.balance === 0) {
                this.deposit(this.appSettings.initialDeposit);
                initialLoad = true;
            }

            if (account) {
                const actualBalance = parseFloat(account.available_balance.value);
                if (actualBalance - this.bankReserve < this.balance) {
                    throw Error(`Insufficient Coinbase balance. Ledger balance: ${this.balance}, Coinbase balance: ${actualBalance}. Check your account.`);
                }
                this.logger.info(`Current holdings for ${this.quoteCurrency}: ${this.balance}`);
                return this.balance;
            } else {
                this.logger.warn(`No holdings found for ${this.quoteCurrency}.`);
                return 0;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error fetching holdings for ${this.quoteCurrency}: ${errorMessage}`);
            throw error;
        }
    }

    async retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === retries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Retry failed');
    }

    async getTradableCurrencies(): Promise<Product[]> {
        try {
            this.logger.debug('Fetching tradable currencies from Coinbase API');
            const response: GetProductsResponse = await this.apiClient.getProducts();

            const tradableCurrencies = response.products.filter((product: Product) => {
                const volume24h = parseFloat(product.approximate_quote_24h_volume);
                return product.quote_currency_id === this.quoteCurrency &&
                    this.appSettings.blackList.indexOf(product.product_id) < 0 &&
                    !product.trading_disabled &&
                    !product.is_disabled &&
                    !product.view_only &&
                    product.product_type === 'SPOT' &&
                    product.product_venue === 'CBE' &&
                    product.status === 'online' &&
                    volume24h >= 100000;
            });

            this.logger.info(`Found ${tradableCurrencies.length} tradable currencies.`);
            return tradableCurrencies;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error fetching tradable currencies: ${errorMessage}`);
            return [];
        }
    }
}
import { CBAdvancedTradeClient } from 'coinbase-api';
import * as fs from 'fs';
import { TrackerConfig } from 'main/models';

interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

interface Account {
  currency: string;
  available_balance: {
    value: string;
  };
}

interface OrderDetails {
  settled: boolean;
  status: string;
  filled_size: string;
  total_value_after_fees: string;
  average_filled_price: string;
  last_fill_time: string;
}

class CentralBank {
  private appSettings: TrackerConfig;
  private apiClient: CBAdvancedTradeClient;
  private logger: Logger;
  private quoteCurrency: string;
  private bankReserve: number;
  private ledgerPath: string;
  private ledger: any[];
  private balance: number;

  constructor(apiClient: CBAdvancedTradeClient, logger: Logger, appSettings: TrackerConfig) {
    this.appSettings = appSettings;
    this.apiClient = apiClient;
    this.logger = logger;
    this.quoteCurrency = appSettings.quoteCurrency;
    this.bankReserve = appSettings.bankReserve;
    this.ledgerPath = appSettings.ledgerPath;
    this.ledger = [];
    this.balance = 0;
  }

  updateBank(options: any) { 
    options.bankReserve && (this.bankReserve = options.bankReserve);
    options.quoteCurrency && (this.quoteCurrency = options.quoteCurrency);
  }

  async getHoldings(): Promise<number> {
    try {
      const accounts = await this.retry(() => this.apiClient.getAccounts());
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
      this.logger.error(`Error fetching holdings for ${this.quoteCurrency}: ${error.message}`);
      throw error;
    }
  }

  deposit(amount: number, symbol: string | null = null, description: string = 'Deposit') {
    if (amount <= 0) {
      this.logger.error('Deposit amount must be greater than 0.');
      return;
    }
    this.balance += amount;
    this.addToLedger(amount, symbol, description);
    this.logger.info(`Deposited ${amount} ${this.quoteCurrency}. New balance: ${this.balance}`);
  }

  withdraw(amount: number, symbol: string | null = null, description: string = 'Withdrawal') {
    if (amount <= 0) {
      this.logger.error('Withdrawal amount must be greater than 0.');
      return;
    }

    if (amount > this.balance) {
      this.logger.error('Insufficient funds for withdrawal.');
      return;
    }

    this.balance -= amount;
    this.addToLedger(-amount, symbol, description);
    this.logger.info(`Withdrew ${amount} ${this.quoteCurrency}. New balance: ${this.balance}`);
  }

  addToLedger(amount: number, symbol: string | null, description: string) {
    const transaction = {
      timestamp: new Date().toISOString(),
      amount,
      balance: this.balance,
      symbol: symbol || 'N/A',
      description,
    };
    this.ledger.push(transaction);
    this.saveLedger();
  }

  saveLedger() {
    try {
      fs.writeFileSync('./ledger.json', JSON.stringify(this.ledger, null, 2));
      this.logger.debug('Ledger saved successfully.');
    } catch (error) {
      this.logger.error(`Error saving ledger: ${error.message}`);
    }
  }

  loadLedger() {
    try {
      if (fs.existsSync('./ledger.json')) {
        const data = fs.readFileSync('./ledger.json', 'utf-8');
        this.ledger = JSON.parse(data);
        this.balance = this.ledger.length > 0 ? this.ledger[this.ledger.length - 1].balance : 0;
        this.logger.debug('Ledger loaded successfully.');
      }
    } catch (error) {
      this.logger.error(`Error loading ledger: ${error.message}`);
    }
  }

  adjustToMinimumIncrement(amount: number, minIncrement: string): number {
    const decimalPlaces = minIncrement.includes('.') ? minIncrement.split('.')[1].length : 0;
    let amountString = amount.toString();
    const decimalPointIndex = amountString.indexOf('.');

    if (decimalPointIndex !== -1) {
      const integerPart = amountString.slice(0, decimalPointIndex);
      const decimalPart = amountString.slice(decimalPointIndex + 1, decimalPointIndex + 1 + decimalPlaces);
      amountString = `${integerPart}.${decimalPart}`;
    }
    return parseFloat(amountString);
  }

  async getOrderData(orderId: string, retryIntervalMs: number = 3000, maxRetries: number = 10): Promise<any> {
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await this.retry(() => this.apiClient.getOrder({ order_id: orderId }));
        const orderDetails = response.order as OrderDetails;
        this.logger.debug(`Order details for ${orderId}: ${JSON.stringify(orderDetails)}`);
        if (orderDetails.settled) {
          const { filled_size: baseFilled, total_value_after_fees: quoteFilled, average_filled_price: basePrice, last_fill_time: fillTime } = orderDetails;
          return {
            orderId,
            baseFilled: parseFloat(baseFilled),
            quoteFilled: parseFloat(quoteFilled),
            basePrice: parseFloat(basePrice),
            fillTime: fillTime,
          };
        } else {
          console.log(`Order ${orderId} is not filled yet. Status: ${orderDetails.status}. Attempt ${attempt + 1} of ${maxRetries}. Retrying in ${retryIntervalMs / 1000} seconds...`);
          attempt++;
          await wait(retryIntervalMs);
        }
      } catch (error) {
        console.error(`Error fetching order data for order ${orderId}: ${error.message}`);
        attempt++;
        await wait(retryIntervalMs);
      }
    }

    return {
      success: false,
      message: `Order ${orderId} was not filled after ${maxRetries} attempts.`,
    };
  }

  async fetchCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await this.retry(() => this.apiClient.getPublicMarketTrades({ product_id: symbol } as any));
      const bid = parseFloat(response.best_bid);
      const ask = parseFloat(response.best_ask);
      return (bid + ask) / 2;
    } catch (error) {
      this.logger.error(`Error fetching current price for ${symbol}: ${error.message}\n${error.stack}`);
      throw error;
    }
  }

  async placeBuyOrder(symbol: string, amountUsd: number, increment: number): Promise<any> {
    const currentPrice = await this.fetchCurrentPrice(symbol);
    const timestamp = new Date().toISOString();

    if (!amountUsd || amountUsd <= 0) {
      this.logger.warn(`Invalid amount for buy order: ${amountUsd}`);
      throw `Invalid amount for buy order: ${amountUsd}`;
    }

    // Simulated buy logic
    if (this.appSettings.simulationMode) {
      const simulatedBaseAmount = (amountUsd * 0.99) / currentPrice;
      const orderDetails = {
        orderId: 'SIMULATED_ORDER_ID',
        side: 'BUY',
        baseAmount: parseFloat(simulatedBaseAmount.toPrecision(8)),
        currencyAmount: amountUsd,
        basePrice: currentPrice,
        timestamp,
      };
      this.withdraw(orderDetails.currencyAmount, symbol, `[SIMULATED] Purchase ${symbol} orderId ${orderDetails.orderId}`);
      this.logger.info(`[SIMULATION MODE] Simulated buy: ${simulatedBaseAmount.toFixed(8)} ${symbol} for ${amountUsd} USD at ${currentPrice} USD/${symbol}`);
      return orderDetails;
    }

    const amountToBuy = this.adjustToMinimumIncrement(amountUsd, increment.toString());

    try {
      const orderParams = {
        product_id: `${symbol}`,
        order_configuration: {
          market_market_ioc: {
            quote_size: amountToBuy.toString(),
          },
        },
        side: 'BUY',
        client_order_id: this.apiClient.generateNewOrderId(),
      };

      const response = await this.retry(async () => {
        const r = await this.apiClient.submitOrder(orderParams as any);
        if (r.success) {
          return r;
        }
        if (r.error_response) {
          const errorMessage = r.error_response.error_details || 
                              r.error_response.preview_failure_reason || 
                              r.error_response.error || 
                              'Unknown error';
          this.logger.error(`Error submitting order: ${errorMessage}`);
          throw new Error(errorMessage);
        }
        throw new Error('Unknown error submitting order');
      });

      this.logger.debug(`Order response: ${JSON.stringify(response)}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const orderData = await this.getOrderData(response.success_response?.order_id);

      const orderDetails = {
        orderId: response.success_response?.order_id,
        side: 'BUY',
        baseAmount: orderData.baseFilled,
        currencyAmount: orderData.quoteFilled,
        basePrice: orderData.basePrice,
        timestamp: orderData.fillTime
      };
      this.withdraw(orderDetails.currencyAmount, symbol, `Purchase ${symbol} orderId ${orderDetails.orderId}`);

      this.logger.info(`Buy: ${orderDetails.baseAmount.toPrecision(8)} ${symbol} for ${orderDetails.currencyAmount} USD at ${orderDetails.basePrice} USD/${symbol}`);
      return orderDetails;
    } catch (error) {
      this.logger.error(`Error placing buy order: ${JSON.stringify(error)}`);
      return null;
    }
  }

  async placeSellOrder(symbol: string, amount: number, increment: number): Promise<any> {
    const currentPrice = await this.fetchCurrentPrice(symbol);
    const timestamp = new Date().toISOString();

    if (!amount || amount <= 0) {
      this.logger.warn(`Invalid amount for sell order: ${amount}`);
      throw `Invalid amount for sell order: ${amount}`;
    }

    // Simulated sell logic
    if (this.appSettings.simulationMode) {
      const simulatedSellValue = amount * currentPrice * 0.99;
      const orderDetails = {
        orderId: 'SIMULATED_ORDER_ID',
        side: 'SELL',
        baseAmount: amount,
        currencyAmount: parseFloat(simulatedSellValue.toFixed(2)), // Positive for received
        basePrice: currentPrice,
        timestamp,
      };
      this.deposit(orderDetails.currencyAmount, symbol, `[SIMULATED] Sell ${symbol} OrderId ${orderDetails.orderId}`);
      this.logger.info(`[SIMULATION MODE] Simulated sell: ${amount.toFixed(8)} ${symbol} for ${simulatedSellValue.toFixed(2)} USD at ${currentPrice} USD/${symbol}`);
      return orderDetails;
    }

    const amountToSell = this.adjustToMinimumIncrement(amount, increment.toString());

    try {
      const orderParams = {
        product_id: `${symbol}`,
        order_configuration: {
          market_market_ioc: {
            base_size: amountToSell.toString(),
          },
        },
        side: 'SELL',
        client_order_id: this.apiClient.generateNewOrderId(),
      };

      const response = await this.retry(async () => {
        const r = await this.apiClient.submitOrder(orderParams as any);
        if (r.success) {
          return r;
        }
        if (r.error_response) {
          const errorMessage = r.error_response.error_details || 
                              r.error_response.preview_failure_reason || 
                              r.error_response.error || 
                              'Unknown error';
          this.logger.error(`Error submitting order: ${errorMessage}`);
          throw new Error(errorMessage);
        }
        throw new Error('Unknown error submitting order');
      });

      this.logger.debug(`Order response: ${JSON.stringify(response)}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const orderData = await this.getOrderData(response.success_response?.order_id);

      const orderDetails = {
        orderId: response.success_response?.order_id,
        side: 'SELL',
        baseAmount: orderData.baseFilled,
        currencyAmount: orderData.quoteFilled,
        basePrice: orderData.basePrice,
        timestamp: orderData.fillTime,
      };
      this.deposit(orderDetails.currencyAmount, symbol, `Sell ${symbol} OrderId ${orderDetails.orderId}`);
      this.logger.info(`Sell: ${orderDetails.baseAmount.toFixed(8)} ${symbol} for ${orderDetails.currencyAmount.toFixed(2)} USD at ${orderDetails.basePrice.toPrecision(6)} USD/${symbol}`);
      return orderDetails;
    } catch (error) {
      this.logger.error(`Error placing sell order: ${JSON.stringify(error)}`);
      return null;
    }
  }

  async getTradableCurrencies(): Promise<any[]> {
    try {
      this.logger.debug('Fetching tradable currencies from Coinbase API');
      const products = await this.retry(() => this.apiClient.getProducts());
      
      if (!products || !Array.isArray(products.products)) {
        this.logger.error('Failed to fetch products or invalid response format');
        return [];
      }

      // Filter products with decent market cap and volume
      const tradableCurrencies = products.products.filter((product: any) => {
        return product.quote_currency_id === this.appSettings.quoteCurrency &&
          this.appSettings.blackList.indexOf(product.base_currency_id) < 0 &&
          !product.trading_disabled && 
          product.status === 'online' &&
          product.volume_24h >= 100000;  // Example: Volume > $100K
      });

      // Sort by 24h volume (highest first)
      tradableCurrencies.sort((a: any, b: any) => {
        return parseFloat(b.volume_24h) - parseFloat(a.volume_24h);
      });

      // Format the response
      const formattedCurrencies = tradableCurrencies.map((product: any) => {
        return {
          symbol: product.base_currency_id,
          name: product.base_display_name || product.base_currency_id,
          price: parseFloat(product.price || '0'),
          volume24h: parseFloat(product.volume_24h || '0'),
          product_id: product.product_id,
          base_increment: product.base_increment,
          quote_increment: product.quote_increment
        };
      });

      this.logger.info(`Found ${formattedCurrencies.length} tradable currencies.`);
      return formattedCurrencies;
    } catch (error) {
      this.logger.error(`Error fetching tradable currencies: ${error.message}`);
      return [];
    }
  }

  private async retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i < retries - 1) {
          console.warn(`Retrying... (${i + 1}/${retries})`);
          await new Promise(res => setTimeout(res, delay));
        } else {
          throw error;
        }
      }
    }
  }
}

export default CentralBank;

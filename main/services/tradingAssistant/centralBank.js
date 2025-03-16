// Updated centralBank.js
const fs = require('fs');

class CentralBank {
    constructor(apiClient, logger, appSettings) {
        this.appSettings = appSettings;
        this.apiClient = apiClient;
        this.logger = logger;
        this.quoteCurrency = appSettings.quoteCurrency;
        this.bankReserve = appSettings.bankReserve;
        this.ledgerPath = appSettings.ledgerPath;
        this.ledger = [];
        this.balance = 0;
    }

    updateBank(options) { 
        options.bankReserve && (this.bankReserve = options.bankReserve);
        options.quoteCurrency && (this.quoteCurrency = options.quoteCurrency);
    }

    async getHoldings() {
        try {
            const accounts = await this.retry(() => this.apiClient.getAccounts());
            const account = accounts.accounts.find(acc => acc.currency === this.quoteCurrency);
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

    deposit(amount, symbol = null, description = 'Deposit') {
        if (amount <= 0) {
            this.logger.error('Deposit amount must be greater than 0.');
            return;
        }
        this.balance += amount;
        this.addToLedger(amount, symbol, description);
        this.logger.info(`Deposited ${amount} ${this.quoteCurrency}. New balance: ${this.balance}`);
    }

    withdraw(amount, symbol = null, description = 'Withdrawal') {
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

    addToLedger(amount, symbol, description) {
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

    adjustToMinimumIncrement(amount, minIncrement) {
        // Determine the number of decimal places in the minIncrement
        const decimalPlaces = minIncrement.includes('.') ? minIncrement.split('.')[1].length : 0;
    
        // Convert amount to string
        let amountString = amount.toString();
    
        // Find the decimal point position
        const decimalPointIndex = amountString.indexOf('.');
    
        if (decimalPointIndex !== -1) {
            // Slice the string to retain only up to the allowed decimal places
            const integerPart = amountString.slice(0, decimalPointIndex);
            const decimalPart = amountString.slice(decimalPointIndex + 1, decimalPointIndex + 1 + decimalPlaces);
            amountString = `${integerPart}.${decimalPart}`;
        }
    
        // Convert back to a float and return
        return parseFloat(amountString);
    }
    

    async getOrderData(orderId, retryIntervalMs = 3000, maxRetries = 10) {
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                // Fetch order details from the Coinbase Advanced API
                const response = await this.retry(() => this.apiClient.getOrder({order_id: orderId}));
                const orderDetails = response.order;
                this.logger.debug(`Order details for ${orderId}: ${JSON.stringify(orderDetails)}`);
                if (orderDetails.settled) {
                    const { filled_size: baseFilled, total_value_after_fees: quoteFilled, average_filled_price: basePrice, last_fill_time: fillTime } = orderDetails;

                    return {
                        orderId,
                        baseFilled: parseFloat(baseFilled),
                        quoteFilled: parseFloat(quoteFilled),
                        basePrice: parseFloat(basePrice),
                        fillTime: fillTime, // Normalize fill time
                    };
                } else {
                    console.log(`Order ${orderId} is not filled yet. Status: ${orderDetails.status}. Attempt ${attempt + 1} of ${maxRetries}. Retrying in ${retryIntervalMs / 1000} seconds...`);
                    attempt++;
                    await wait(retryIntervalMs); // Wait and retry
                }
            } catch (error) {
                console.error(`Error fetching order data for order ${orderId}: ${error.message}`);
                attempt++;
                await wait(retryIntervalMs); // Wait and retry if there's an error
            }
        }

        // If the loop exits without a filled order, return a failure response
        return {
            success: false,
            message: `Order ${orderId} was not filled after ${maxRetries} attempts.`,
        };
    }

    // Fetch current price for a symbol
    async fetchCurrentPrice(symbol) {
        try {
            const response = await this.retry(() => this.apiClient.getPublicMarketTrades({ product_id: symbol }));
            const bid = parseFloat(response.best_bid);
            const ask = parseFloat(response.best_ask);
            return (bid + ask) / 2;
        } catch (error) {
            this.logger.error(`Error fetching current price for ${symbol}: ${error.message}\n${error.stack}`);
            throw error;
        }
    }
    
    async placeBuyOrder(symbol, amountUsd, increment) {
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
            this.withdraw(orderDetails.currencyAmount, symbol, `[SIMULATED] Purchase ${symbol} orderId ${orderDetails.orderId}`)
            this.logger.info(`[SIMULATION MODE] Simulated buy: ${simulatedBaseAmount.toFixed(8)} ${symbol} for ${amountUsd} USD at ${currentPrice} USD/${symbol}`);
            return orderDetails;
        }

        const amountToBuy = this.adjustToMinimumIncrement(amountUsd, increment);

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
                 const r = await this.apiClient.submitOrder(orderParams);
                 if (r.success) {
                     return r;
                 }
                 this.logger.error(`Error submitting order: ${r.code} - ${r.message}`);
                 throw new Error(`${r.code} - ${r.message}`);
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
            this.withdraw(orderDetails.currencyAmount, symbol, `Purchase ${symbol} orderId ${orderDetails.orderId}`)


            this.logger.info(`Buy: ${orderDetails.baseAmount.toPrecision(8)} ${symbol} for ${orderDetails.currencyAmount} USD at ${orderDetails.basePrice} USD/${symbol}`);
            return orderDetails;
        } catch (error) {
            this.logger.error(`Error placing buy order: ${JSON.stringify(error)}`);
            return null;
        }
    };
    async placeSellOrder(symbol, amount, increment) {
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

        const amountToSell = this.adjustToMinimumIncrement(amount, increment);

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
                 const r = await this.apiClient.submitOrder(orderParams);
                 if (r.success) {
                     return r;
                 }
                 this.logger.error(`Error submitting order: ${r.code} - ${r.message}`);
                 throw new Error(`${r.code} - ${r.message}`);
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
    };

    async retry(fn, retries = 3, delay = 1000) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Attempt to execute the function
                return await fn();
            } catch (error) {
                // If the maximum attempts are reached, throw the error
                if (attempt === retries - 1) {
                    throw error;
                }
                // Wait for the specified delay before retrying
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Fetch tradable currencies with decent market cap and volume
    async getTradableCurrencies() {
        try {
            this.logger.debug('Fetching tradable currencies from Coinbase API');
            const products = await this.apiClient.getProducts();

            // Filter products with decent market cap and volume (adjust thresholds as needed)
            const tradableCurrencies = products.products.filter(product => {
                return product.quote_currency_id === this.appSettings.quoteCurrency &&
                    this.appSettings.blackList.indexOf(product.product_id) < 0 &&
                    !product.trading_disabled && !product.is_disabled && !product.view_only &&
                    product.product_type === 'SPOT' &&
                    product.product_venue === 'CBE' &&
                    product.status === 'online' &&
                    product.approximate_quote_24h_volume >= 100000  // Example: Volume > $1M
            });

            this.logger.info(`Found ${tradableCurrencies.length} tradable currencies.`);
            return tradableCurrencies;
        } catch (error) {
            this.logger.error(`Error fetching tradable currencies: ${error.message}\n${error.stack}`);
            return [];
        }
    }
}

module.exports = CentralBank;

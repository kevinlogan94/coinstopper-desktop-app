import * as fs from 'fs';
import { CBAdvancedTradeClient } from 'coinbase-api';
import Logger from './logger';
import CentralBank from './centralBank';
import { loadAllTrackingData, saveTrackingData } from './fileOperations';
import { TrackerFileConfig } from 'main/models';

class TrackerProcessor {
    private settings: any;
    private apiClient: CBAdvancedTradeClient;
    private logger: Logger;
    private centralBank: CentralBank;
    private trackingDataDirectory: string;

    constructor(settings: any, filePath: string) {
        this.settings = settings;
        this.settings.filePath = filePath;
        this.apiClient = new CBAdvancedTradeClient({ apiKey: this.settings.apiCredentials.apiKey, apiSecret: this.settings.apiCredentials.apiSecret });
        this.logger = new Logger(this.settings.logging.level, './logs');
        this.centralBank = new CentralBank(this.apiClient, this.logger, this.settings);
        this.trackingDataDirectory = this.settings.filePath + '/trackers/';
    }

    createDefaultTrackingData(productInfo: any): any {
        if (!productInfo) {
            throw new Error(`No product information found`);
        }

        const currentPrice = parseFloat(productInfo.price);

        // Return the default tracking data object
        return {
            parameters: this.settings.parameters,
            overrideParameters: false,
            autoBuyInsActive: false,
            manualPurchaseAmount: null,
            manualSell: false,
            symbol: productInfo.product_id,
            held: 0,
            heldValueUsd: 0,
            buyPrice: currentPrice,
            averageBuyPrice: 0,
            exitPrice: null,
            currentPrice: currentPrice,
            highestPrice: currentPrice,
            lowestPrice: currentPrice,
            percentageChange: 0,
            lastActionPrice: currentPrice,
            lastActionTime: null,
            lastAction: `Started new tracker at price: ${currentPrice}`,
            baseIncrement: productInfo.base_increment,
            quoteIncrement: productInfo.quote_increment,
            availableFunds: 0,
            maxAllocation: 0,
            datestamp: null,
            recommendation: {
                action: "HOLD",
                reason: "New tracker, no recommendation yet"
            },
            positions: [],
            errors: []
        };
    }

    async executeSingleBuy(trackingData: any): Promise<void> {
        const buyOrder = await this.centralBank.placeBuyOrder(trackingData.symbol, trackingData.maxAllocation, trackingData.quoteIncrement);

        trackingData.positions.push({
            buyOrder,
            sellOrder: null,
            plAmount: 0,
            plPercentage: 0,
            stop: null,
            limit: null
        });
        trackingData.buyPrice = buyOrder.basePrice;
        trackingData.highestPrice = buyOrder.basePrice;
        trackingData.lowestPrice = buyOrder.basePrice;
        trackingData.forceBuy = false;
        trackingData.lastAction = `Buy executed: ${JSON.stringify(buyOrder)}`;
        trackingData.lastActionPrice = buyOrder.basePrice;
        trackingData.lastActionTime = Date.now();
        saveTrackingData(this.trackingDataDirectory, trackingData);
        this.logger.info(`Executed buy for ${trackingData.symbol}: ${JSON.stringify(buyOrder)}`);
    }

    async executeSingleSell(trackingData: any, position: any): Promise<void> {
        const buyOrder = position.buyOrder;
        const symbol = trackingData.symbol;
        const amount = buyOrder.baseAmount;
        const increment = trackingData.baseIncrement;
        const sellOrder = await this.centralBank.placeSellOrder(symbol, amount, increment);
        position.sellOrder = sellOrder;
        position.limit = null;
        position.stop = null;
        position.plAmount = sellOrder.currencyAmount - buyOrder.currencyAmount;
        position.plPercentage = position.plAmount / buyOrder.currencyAmount * 100;
        trackingData.lastAction = `Sell executed: ${JSON.stringify(sellOrder)}`;
        trackingData.lastActionPrice = sellOrder.basePrice;
        trackingData.lastActionTime = Date.now();
        trackingData.highestPrice = trackingData.lastActionPrice;
        trackingData.lowestPrice = trackingData.lastActionPrice;
        this.logger.info(`Executed sell for ${trackingData.symbol}: ${JSON.stringify(sellOrder)}`);
        saveTrackingData(this.trackingDataDirectory, trackingData);
    }

    async getTradableCurrencies(): Promise<any[]> {
        try {
            this.logger.debug('Fetching tradable currencies from Coinbase API');
            const products = await this.apiClient.getProducts();

            const tradableCurrencies = products.products.filter((product: any) => {
                return product.quote_currency_id === this.settings.quoteCurrency &&
                    this.settings.blackList.indexOf(product.product_id) < 0 &&
                    !product.trading_disabled && !product.is_disabled && !product.view_only &&
                    product.product_type === 'SPOT' &&
                    product.product_venue === 'CBE' &&
                    product.status === 'online' &&
                    product.approximate_quote_24h_volume >= 100000;
            });

            this.logger.info(`Found ${tradableCurrencies.length} tradable currencies.`);
            return tradableCurrencies;
        } catch (error) {
            this.logger.error(`Error fetching tradable currencies: ${error.message}\n${error.stack}`);
            return [];
        }
    }

    getPositions(orders: any[]): any[] {
        if (!Array.isArray(orders)) {
            throw new Error("Input must be an array of order objects.");
        }

        const buyOrders = orders.filter(order => order.side === "BUY");
        const sellOrders = orders.filter(order => order.side === "SELL");
        const positions = [];

        for (const buyOrder of buyOrders) {
            let sellOrder = null;
            for (let i = 0; i < sellOrders.length; i++) {
                const sell = sellOrders[i];

                if (sell.baseAmount === buyOrder.baseAmount) {
                    sellOrder = sellOrders.splice(i, 1)[0];
                    break;
                }
            }
            positions.push({
                buyOrder,
                sellOrder,
                plAmount: sellOrder !== null ? sellOrder.currencyAmount - buyOrder.currencyAmount : 0,
                plPercentage: sellOrder !== null ? (sellOrder.currencyAmount - buyOrder.currencyAmount) / buyOrder.currencyAmount * 100 : 0,
                stop: null,
                limit: null
            });
        }

        return positions;
    }

    async processTrackers(): Promise<TrackerFileConfig[]> {
        try {
            await this.centralBank.loadLedger();
            if (!fs.existsSync(this.trackingDataDirectory)) {
                fs.mkdirSync(this.trackingDataDirectory, { recursive: true });
            }
            let trackingDataList = await loadAllTrackingData(this.trackingDataDirectory);
            this.logger.info(`Found ${trackingDataList.length} trackers.`);
            const products = await this.getTradableCurrencies();
            const whitelist = new Set(this.settings.whiteList ?? this.settings.whiteList);
            const blacklist = new Set(this.settings.blackList ?? this.settings.blackList);

            const filteredProducts = products.filter(product =>
                whitelist.has(product.product_id) && !blacklist.has(product.product_id)
            );

            const filteredSymbols = new Set(filteredProducts.map(x => x.product_id));

            trackingDataList = trackingDataList.filter(x => filteredSymbols.has(x.symbol));

            for (const product of filteredProducts) {
                const existingTracker = trackingDataList.find(tracker => tracker.symbol === product.product_id);
                if (!existingTracker) {
                    const trackingData = this.createDefaultTrackingData(product);
                    trackingDataList.push(trackingData);
                    saveTrackingData(this.trackingDataDirectory, trackingData);
                } else {
                    existingTracker.currentPrice = parseFloat(product.price);
                }
            }

            trackingDataList.forEach(tracker => {
                if (!tracker.overrideParameters) {
                    tracker.parameters = this.settings.parameters;
                }
            });

            for (const trackingData of trackingDataList) {
                try {
                    const product = filteredProducts.find((p) => p.product_id === trackingData.symbol);
                    if (product) {
                        trackingData.currentPrice = parseFloat(product.price);
                        if (trackingData.lastActionPrice) {
                            trackingData.percentageChange = ((trackingData.currentPrice - trackingData.lastActionPrice) / trackingData.lastActionPrice) * 100;
                        }
                        if (trackingData.currentPrice > trackingData.highestPrice) {
                            trackingData.highestPrice = trackingData.currentPrice;
                        }
                        if (trackingData.currentPrice < trackingData.lowestPrice || trackingData.lowestPrice === 0) {
                            trackingData.lowestPrice = trackingData.currentPrice;
                        }
                    }

                    const availableFunds = await this.centralBank.getAvailableFunds();
                    trackingData.availableFunds = availableFunds;
                    const maxAllocationPercentage = trackingData.parameters.maxAllocationPercentage || 10;
                    trackingData.maxAllocation = (availableFunds * maxAllocationPercentage) / 100;
                    // trackingData.recommendation = this.recommendations.getRecommendation(trackingData);
                    saveTrackingData(this.trackingDataDirectory, trackingData);
                    this.logger.info(`Processed tracker for ${trackingData.symbol}: ${JSON.stringify(trackingData.recommendation)}`);
                } catch (error) {
                    this.logger.error(`Error processing tracker for ${trackingData.symbol}: ${error.message}\n${error.stack}`);
                    trackingData.errors.push({
                        timestamp: Date.now(),
                        message: error.message,
                        stack: error.stack
                    });
                    saveTrackingData(this.trackingDataDirectory, trackingData);
                }
            }
            return trackingDataList;
        } catch (error) {
            this.logger.error(`Error in processTrackers: ${error.message}\n${error.stack}`);
            throw error;
        }
    }
}

export { TrackerProcessor };

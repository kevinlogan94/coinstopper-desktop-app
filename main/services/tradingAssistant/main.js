const fs = require('fs');
const path = require('path');
const { CBAdvancedTradeClient } = require('coinbase-api');
const Logger = require('./logger');
const CentralBank = require('./centralBank');
const MarketAnalyzer = require('./marketAnalyzer');
const Recommendations = require('./recommendations');
const { loadTrackingData, loadGlobalData, saveGlobalData, loadAllTrackingData, saveTrackingData, saveAllTrackingData } = require('./fileOperations');
const { availableMemory } = require('process');

export class TrackerProcessor {
    constructor(settings, filePath) {
        this.settings = settings;
        this.settings.filePath = filePath;
        this.apiClient = new CBAdvancedTradeClient({ apiKey: this.settings.apiCredentials.apiKey, apiSecret: this.settings.apiCredentials.apiSecret });
        this.logger = new Logger(this.settings.logging.level, './logs');
        this.centralBank = new CentralBank(this.apiClient, this.logger, this.settings);
        this.marketAnalyzer = new MarketAnalyzer(this.apiClient, this.logger, this.settings);
        this.recommendations = new Recommendations(this.logger);
        this.trackingDataDirectory = this.settings.filePath + '/trackers/';
    }

    createDefaultTrackingData(productInfo) {

        if (!productInfo) {
            throw new Error(`No product information found`);
        }

        const currentPrice = parseFloat(productInfo.price);

        // Return the default tracking data object
        return {
            parameters: settings.parameters,
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

    async executeSingleBuy(trackingData) {
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
        saveTrackingData(trackingDataDirectory, trackingData);
        this.logger.info(`Executed buy for ${trackingData.symbol}: ${JSON.stringify(buyOrder)}`);
    }

    async executeSingleSell(trackingData, position) {
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
        saveTrackingData(trackingDataDirectory, trackingData);
    }

    // Fetch tradable currencies with decent market cap and volume
    async getTradableCurrencies() {
        try {
            this.logger.debug('Fetching tradable currencies from Coinbase API');
            const products = await this.apiClient.getProducts();

            // Filter products with decent market cap and volume (adjust thresholds as needed)
            const tradableCurrencies = products.products.filter(product => {
                return product.quote_currency_id === this.settings.quoteCurrency &&
                    this.settings.blackList.indexOf(product.product_id) < 0 &&
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

    getPositions(orders) {
        if (!Array.isArray(orders)) {
            throw new Error("Input must be an array of order objects.");
        }


        // Separate buy and sell orders into separate arrays
        const buyOrders = orders.filter(order => order.side === "BUY");
        const sellOrders = orders.filter(order => order.side === "SELL");
        const positions = [];

        // Traverse the sellOrders array to match each sell with a buy
        for (const buyOrder of buyOrders) {
            let sellOrder = null;
            for (let i = 0; i < sellOrders.length; i++) {
                const sell = sellOrders[i];

                if (sell.baseAmount === buyOrder.baseAmount) {
                    // Exact match, remove the buy order
                    sellOrder = sellOrders.splice(i, 1)[0];
                    break; // Move to the next sell order
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

    async processTrackers() {
        try {
            await this.centralBank.loadLedger();
            if (!fs.existsSync(this.trackingDataDirectory)) {
                fs.mkdirSync(this.trackingDataDirectory, { recursive: true });
            }
            let trackingDataList = await loadAllTrackingData(this.trackingDataDirectory);
            this.logger.info(`Found ${trackingDataList.length} trackers.`);
            //we need to get all of the products
            const products = await this.marketAnalyzer.getTradableCurrencies();
            const whitelist = new Set(this.settings.whiteList ?? settings.whiteList);
            const blacklist = new Set(this.settings.blackList ?? settings.blackList);

            const filteredProducts = products.filter(product =>
                whitelist.has(product.product_id) && !blacklist.has(product.product_id)
            );

            const filteredSymbols = new Set(filteredProducts.map(x => x.product_id));

            trackingDataList = trackingDataList.filter(x => filteredSymbols.has(x.symbol));

            for (const product of filteredProducts) {
                const existingTracker = trackingDataList.find(tracker => tracker.symbol === product.product_id);
                if (!existingTracker) {
                    const trackingData = createDefaultTrackingData(product);
                    trackingDataList.push(trackingData);
                    saveTrackingData(this.trackingDataDirectory, trackingData);
                }
                else {
                    existingTracker.currentPrice = parseFloat(product.price)
                }
            }

            trackingDataList.forEach(tracker => { // use this loop to add new parameters to the tracker and apply globals
                if (tracker.autoBuyInsActive === undefined || tracker.autoBuyInsActive == null) {
                    tracker.autoBuyInsActive = true;
                }
                if (tracker.manualPurchaseAmount === undefined) {
                    tracker.manualPurchaseAmount = null;
                }
                if (tracker.manualSell === undefined) {
                    tracker.manualSell = null;
                }
                if (!tracker.overrideParameters)
                    tracker.parameters = this.settings.parameters;
            });

            let holdings = await this.centralBank.getHoldings();
            const activeTrackers = trackingDataList.reduce((p, c) => p + (c.autoBuyInsActive ? 1 : 0), 0);
            const activeTradableFunds = holdings + trackingDataList.filter(x => x.autoBuyInsActive).reduce((p, v) => v.heldValueUsd + p, 0);
            const maxAllocation = Math.min(activeTradableFunds * (1 - this.settings.priceDropBuyReservePercentage / 100) / (activeTrackers > 0 ? activeTrackers : 1), settings.maxAllocation ?? settings.maxAllocation);
            this.logger.info(`Found ${activeTrackers} auto buy trackers with funds ${activeTradableFunds} and max allocation ${maxAllocation}.`);

            for (const td of trackingDataList) {
                if (!td)
                    continue;
                console.log(td.symbol);

                let action = 'NONE';
                let reason = 'No actionable conditions detected'

                td.lowestPrice = Math.min(td.currentPrice, td.lowestPrice ?? Infinity);
                td.highestPrice = Math.max(td.currentPrice, td.highestPrice ?? 0);
                td.availableFunds = holdings - 1;
                td.maxAllocation = maxAllocation;

                //TODO: remove this after transition
                if (td.positions === null && td.orders?.length) {
                    td.positions = getPositions(td.orders);
                }

                //get all of the open positions for this symbol
                let openPositions = td.positions.filter(x => x.sellOrder === null);
                td.totalInvested = openPositions.reduce((p, c) => p + c.buyOrder.currencyAmount, 0);

                if (td.manualPurchaseAmount !== null) {
                    reason = `Manual purchase for ${td.manualPurchaseAmount} detected.`;
                    if (td.availableFunds >= td.manualPurchaseAmount) {
                        action = 'BUY';
                        reason = `${td.symbol}:: Manual purchase triggered, amount: ${td.manualPurchaseAmount}, bid price: ${td.currentPrice.toPrecision(6)}`;
                        this.logger.info(`${td.symbol}:: Manual purchase triggered, amount: ${td.manualPurchaseAmount}, bid price: ${td.currentPrice.toPrecision(6)}`);
                        td.maxAllocation = td.manualPurchaseAmount;
                        await executeSingleBuy(td);
                        holdings = await this.centralBank.getHoldings();
                        openPositions = td.positions.filter(x => x.sellOrder === null);
                        td.availableFunds = holdings - 1;
                    }
                    else {
                        reason += ` Funds depleted. Available funds: ${td.availableFunds.toFixed(2)}, Required funds: ${td.manualPurchaseAmount.toFixed(2)}`;
                    }
                    td.manualPurchaseAmount = null;
                }
                else if (!openPositions.length) {
                    //we're sold out of the coin and we're looking to buy back in
                    if (!td.exitPrice) {
                        td.exitPrice = td.currentPrice;
                        td.percentageChange = (td.currentPrice - td.exitPrice) / td.exitPrice * 100;
                        reason = `Awaiting reentry. No exit price detected. Setting at ${td.exitPrice}`;
                    }
                    else {
                        td.percentageChange = (td.currentPrice - td.exitPrice) / td.exitPrice * 100;
                        if (td.autoBuyInsActive) {

                            if (td.availableFunds >= td.maxAllocation) {
                                reason = 'Waiting for favorable reentry conditions.'
                                const isBuyCondition = td.percentageChange > td.parameters.reentryLimitPercentage ||
                                    td.percentageChange < -td.parameters.coolOffPercentage;
                                if (isBuyCondition) {
                                    action = 'BUY';
                                    reason = `Market reentry triggered.`;
                                    td.exitPrice = null;
                                    this.logger.info(`${td.symbol}:: Reentry triggered at ${td.currentPrice.toPrecision(6)}`);
                                    await executeSingleBuy(td);
                                    holdings = await this.centralBank.getHoldings();
                                    openPositions = td.positions.filter(x => x.sellOrder === null);
                                    td.availableFunds = holdings - 1;
                                }
                            }
                            else {
                                reason += ` Funds depleted. Available funds: ${td.availableFunds.toFixed(2)}, Required funds: ${td.maxAllocation.toFixed(2)}`;
                            }
                        }
                        else {
                            reason = 'Auto buy ins inactive';
                        }
                    }
                }
                else {
                    //calculate the pl for each open position
                    openPositions.forEach((position, i) => {
                        const buyOrder = position.buyOrder;
                        const esv = td.currentPrice * (1 - td.parameters.spreadPercentage / 100) * buyOrder.baseAmount;
                        const pla = esv - buyOrder.currencyAmount;
                        const plp = pla / buyOrder.currencyAmount * 100;
                        position.estSaleValue = esv;
                        position.plAmount = pla;
                        position.plPercentage = plp;

                        //calculate sell stop for position
                        const stopPercentage = position.plPercentage - td.parameters.trailingSellPercentage;
                        if (position.stop === null) {
                            if (stopPercentage >= td.parameters.targetProfitPercentage) {
                                position.stop = stopPercentage;
                            }
                        }
                        else {
                            if (stopPercentage > position.stop) {
                                position.stop = stopPercentage;
                            }
                        }
                    });

                    // Handle manual sell
                    if (td.manualSell === true) {
                        const lowestPosition = td.positions.filter(pos => !pos.sellOrder)
                            .sort((a, b) => a.buyOrder.basePrice - b.buyOrder.basePrice)[0];

                        if (lowestPosition) {
                            td.manualSell = false;
                            this.logger.info(`${td.symbol}:: Manual sell triggered pl: ${lowestPosition.plPercentage.toFixed(2)} price: ${td.currentPrice.toPrecision(6)}`);
                            await executeSingleSell(td, lowestPosition);
                            action = 'SELL';
                            reason = `Manual sell triggered.`;
                            holdings = await this.centralBank.getHoldings();
                            openPositions = td.positions.filter(x => x.sellOrder === null);
                        }
                    }
                    else {

                        const positionsReadyToSell = openPositions.filter(x => x.stop !== null && x.plPercentage <= x.stop);
                        //We iterate over this array like this because we have to await the sells
                        if (positionsReadyToSell.length) {
                            for (let i = 0; i < positionsReadyToSell.length; i++) {
                                const position = positionsReadyToSell[i];
                                this.logger.info(`${td.symbol}:: Sell triggered stop: ${position.stop.toFixed(2)} pl: ${position.plPercentage.toFixed(2)} price: ${td.currentPrice.toPrecision(6)}`);
                                position.stop = null;
                                //add single sell on position
                                await executeSingleSell(td, position);
                                action = 'SELL';
                                reason = `Target profit reached on investment at ${td.currentPrice}.`;
                                holdings = await this.centralBank.getHoldings();
                            }
                            openPositions = td.positions.filter(x => x.sellOrder === null);
                        }
                        else {
                            const lowestOpenPosition = openPositions.reduce((min, pos) => pos.buyOrder.basePrice < min.buyOrder.basePrice ? pos : min, openPositions[0]);

                            // Calculate buy limit for the lowest position if trading is active
                            if (lowestOpenPosition) {
                                if (td.autoBuyInsActive) {
                                    if (lowestOpenPosition.limit === null) {
                                        if (lowestOpenPosition.plPercentage < -td.parameters.dropBuyPercentage) {
                                            if (td.availableFunds >= td.maxAllocation) {
                                                lowestOpenPosition.limit = lowestOpenPosition.plPercentage + td.parameters.trailingBuyPercentage;
                                            }
                                            else {
                                                reason = `Drop-buy pct reached. Available funds: ${td.availableFunds.toFixed(2)}, Required funds: ${td.maxAllocation.toFixed(2)}`;
                                            }
                                        }
                                    } else {
                                        lowestOpenPosition.limit = Math.min(lowestOpenPosition.plPercentage + td.parameters.trailingBuyPercentage, lowestOpenPosition.limit);
                                    }

                                    if (lowestOpenPosition.limit !== null) {
                                        if (lowestOpenPosition.plPercentage >= lowestOpenPosition.limit) {
                                            if (td.availableFunds >= td.maxAllocation) {
                                                //trigger a buy
                                                await executeSingleBuy(td); //uses positions array, not positions temp
                                                // reset the limit on the prior lowest open order
                                                lowestOpenPosition.limit = null;
                                                holdings = await this.centralBank.getHoldings();
                                                action = 'BUY';
                                                reason = `Drop buy triggered at ${lowestOpenPosition.plPercentage}`;
                                                openPositions = td.positions.filter(x => x.sellOrder === null);
                                            }
                                            else {
                                                reason = `Drop-buy triggered. Available funds: ${td.availableFunds.toFixed(2)}, Required funds: ${td.maxAllocation.toFixed(2)}`;
                                            }
                                        }
                                    }
                                }
                                else {
                                    reason = 'Drop buy auto buy ins inactive';
                                }
                            }
                        }
                    }
                }

                const lp = td.positions.filter(pos => !pos.sellOrder)
                    .sort((a, b) => a.buyOrder.basePrice - b.buyOrder.basePrice)[0];
                if (lp) {
                    td.percentageChange = lp.plPercentage;
                }

                const totalBaseAmount = openPositions.reduce((sum, pos) => sum + pos.buyOrder.baseAmount, 0);
                const totalWeightedPrice = openPositions.reduce((sum, pos) => sum + pos.buyOrder.currencyAmount, 0);
                const avgBuyPrice = totalBaseAmount > 0 ? totalWeightedPrice / totalBaseAmount : 0;
                td.averageBuyPrice = avgBuyPrice;
                td.plAverage = avgBuyPrice ? (td.currentPrice * (1 - td.parameters.spreadPercentage / 100) - avgBuyPrice) / avgBuyPrice * 100 : 0;
                td.buyPrice = openPositions.length ? Math.min(...openPositions.map(pos => pos.buyOrder.basePrice)) : td.exitPrice ? td.exitPrice : 0;
                const ordersHeld = openPositions.reduce((p, c) => p + c.buyOrder.baseAmount, 0);
                td.held = ordersHeld;
                td.heldValueUsd = td.held * td.currentPrice;
                this.logger.info(`${td.symbol}:: action: ${action}, reason: ${reason}, price: ${td.currentPrice.toPrecision(6)}, held: ${td.held.toPrecision(8)}, value: ${td.heldValueUsd.toFixed(2)}, avgPrc: ${td.averageBuyPrice.toPrecision(6)} pl: ${td.plAverage.toFixed(2)} lpl: ${td.percentageChange.toFixed(2)}`);
            }
            saveAllTrackingData(trackingDataDirectory, trackingDataList);
            const heldCoinTotalValue = trackingDataList.reduce((p, v) => v.heldValueUsd + p, 0);
            const heldCoinInvestmentValue = trackingDataList.reduce((p, v) => p + v.positions.filter(x => x.sellOrder === null).reduce((l, c) => l + c.buyOrder.currencyAmount, 0), 0);
            const plTotal = ((heldCoinTotalValue + holdings) - (heldCoinInvestmentValue + holdings)) / (heldCoinInvestmentValue + holdings) * 100;
            this.logger.info(`Total CoinStopper portfolio investment in USD: $${(heldCoinInvestmentValue + holdings).toFixed(2)}`);
            this.logger.info(`Total CoinStopper portfolio value in USD: $${(heldCoinTotalValue + holdings).toFixed(2)}`);
            this.logger.info(`Total CoinStopper current investment p/l: ${plTotal.toFixed(2)}%. Based on value/investment. Unrealized profit/loss.`)
            this.logger.info(`Saved ${trackingDataList.length} tracking records.`);
        } catch (error) {
            this.logger.error(`Error in main loop: ${error.message}\n${error.stack}`);
            throw error;
        }
    }
}


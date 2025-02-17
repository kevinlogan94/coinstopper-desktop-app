export interface AppData {
  profiles: Array<Profile>;
}

export interface Profile {
  id: string;
  name: string;
  credentials: Array<Credential>;
  trackerConfig: TrackerConfig;
  appConfig: AppConfig;
}

export interface Credential {
  id: string;
  platform: string;
  apiKey?: string;
  apisecret?: string;
  username?: string;
  password?: string;
  additionalSettings?: Record<string, any>;
}

export interface AppConfig {
  trackerEnabled: boolean
}

//global config
export interface TrackerConfig {
  blackList: Array<string>; // List of trading pairs to exclude
  whiteList: Array<string>; // List of trading pairs to include
  initialDeposit: number; // Starting capital for trading
  maxAllocation: number; // Maximum allocation per trade
  bankReserve: number; // Minimum amount to keep as reserve
  simulationMode: boolean; // Whether to run the algorithm in simulation mode (no actual trades)
  parameters?: TrackerParameters; // Configuration for trading-specific parameters
}

export interface Transaction {
  timestamp: string; // ISO 8601 timestamp for when the transaction occurred
  amount: number; // Money used in the transaction
  balance: number; // Total amount of money in the fund
  symbol: string; // Coin symbol involved in the transaction (e.g., BTC, ETH, or N/A for non-coin transactions)
  description: string; // Description of the transaction (e.g., Deposit, Withdrawal, Trade, etc.)
}

export interface TrackerFileConfig {
  parameters: TrackerParameters;
  overrideParameters: boolean;
  autoBuyInsActive: boolean; // No longer buys anything for you but will still sell anything that is currently bought.
  manualPurchaseAmount: number | null; // If this is set, it will perform this purchase on the next run.
  manualSell: boolean | null; // If this is set, it will sell the lowest position(sells 3000 out of 3000, 3001, 3002). Once it's ran, it will flip it back to false. So, the user would need to set it to true again to sell the next one.
  symbol: string;
  held: number; //total amount of coin that you are invested in
  heldValueUsd: number; // total dollar amount that is invested in the coin.
  buyPrice: number;
  averageBuyPrice: number;
  exitPrice: number | null;
  currentPrice: number;
  highestPrice: number;
  lowestPrice: number;
  percentageChange: number;
  lastActionPrice: number;
  lastActionTime: number;
  lastAction: string;
  baseIncrement: string;
  quoteIncrement: string;
  availableFunds: number; // Total dollar amount 
  maxAllocation: number; // Amount that you are in a position to buy. So, if it's $5 we buy $5 dollars.
  datestamp: string;
  recommendation: Recommendation;
  positions: Position[];
  errors: Array<any>;
}

export interface TrackerParameters {
  coolOffPercentage: number;
  reentryLimitPercentage: number;
  spreadPercentage: number;
  targetProfitPercentage: number;
  trailingSellPercentage: number;
  dropBuyPercentage: number;
  trailingBuyPercentage: number;
}

export interface Recommendation {
  action: "BUY" | "SELL" | "HOLD";
  reason: string;
}

export interface Position {
  buyOrder: Order;
  sellOrder: Order | null;
  plAmount: number; // Only used to calcuate the pl percentage. Where it price was when you bought vs. where you are now. Essentially ROI for this specific position. ProfitLossAmount
  plPercentage: number; // ROI percentage

  // If set to 0, it will immedietly sell. 
  // stop = current plPercentage - trailingSellPercentage
  // The stop only gets reset if it's larger than the current stop.
  // Must pass (targetProfitPercentage + trailingSellPercentage) before it to set the stop. If price continues to rise, it will update it. 
  // If the current pl is <= the stop it will sell.
  stop: number | null; //percentage

  // pl + trailing buy percentage
  // Tells us when to buy and create another position.
  // New position gets created when it's pl is >= than the current limit. 
  // Must pass dropByPercentage to set the limit. If pl continues to drop, it will update it. 
  // The limit only gets reset if it's lower than the current limit.
  limit: number | null; // percentage
  estSaleValue?: number; //total sale. If you bought in for 102 but sell for 100. this would be 100 while plamount will be -2.
}

export interface Order {
  orderId: string;
  side: "BUY" | "SELL";
  baseAmount: number;
  currencyAmount: number;
  basePrice: number;
  timestamp: string;
}

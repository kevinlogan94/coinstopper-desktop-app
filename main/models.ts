export interface AppData {
  profiles: Array<Profile>;
}

export interface Profile {
  id: string;
  name: string;
  credentials: Array<Credential>;
  trackerConfig: TrackerConfig;
  appConfig: AppConfig;
  ledger: Array<Transaction>;
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
  runOnce: boolean; // Whether the algorithm should run only once or continuously
  maxSymbolsToTrack: number; // Maximum number of trading pairs to monitor simultaneously
  initialDeposit: number; // Starting capital for trading
  maxAllocation: number; // Maximum allocation per trade
  bankReserve: number; // Minimum amount to keep as reserve
  iterationIntervalMs: number; // Interval (in milliseconds) between each iteration
  apiRateLimitMs: number; // Minimum delay (in milliseconds) between API requests
  simulationMode: boolean; // Whether to run the algorithm in simulation mode (no actual trades)
  overrideParameters: boolean; // Whether to use custom parameters or defaults
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
  autoBuyInsActive: boolean;
  manualPurchaseAmount: number | null;
  manualSell: number | null;
  symbol: string;
  held: number;
  heldValueUsd: number;
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
  availableFunds: number;
  maxAllocation: number;
  datestamp: string;
  recommendation: Recommendation;
  positions: Position[];
  errors: string[];
}

export interface TrackerParameters {
  longHours: number;
  shortHours: number;
  longVelocityWindow: number;
  shortVelocityWindow: number;
  longBollingerPeriod: number;
  shortBollingerPeriod: number;
  coolOffHours: number;
  coolOffPercentage: number;
  reentryLimitPercentage: number;
  spreadPercentage: number;
  targetProfitPercentage: number;
  trailingSellPercentage: number;
  dropBuyPercentage: number;
  trailingBuyPercentage: number;
  stopLossPercentage: number;
}

export interface Recommendation {
  action: "BUY" | "SELL" | "HOLD";
  reason: string;
}

export interface Position {
  buyOrder: Order;
  sellOrder: Order | null;
  plAmount: number;
  plPercentage: number;
  stop: number | null;
  limit: number | null;
  estSaleValue?: number;
}

export interface Order {
  orderId: string;
  side: "BUY" | "SELL";
  baseAmount: number;
  currencyAmount: number;
  basePrice: number;
  timestamp: string;
  pl?: number;
}

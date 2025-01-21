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
  parameters?: Parameters; // Configuration for trading-specific parameters
}

export interface Transaction {
  timestamp: string; // ISO 8601 timestamp for when the transaction occurred
  amount: number; // Money used in the transaction
  balance: number; // Total amount of money in the fund
  symbol: string; // Coin symbol involved in the transaction (e.g., BTC, ETH, or N/A for non-coin transactions)
  description: string; // Description of the transaction (e.g., Deposit, Withdrawal, Trade, etc.)
}

export interface Tracker {
  symbol: string;
  active: boolean;
  bank: number;
  held: number;
  currentPrice: number; // Display in interface
  buyPrice: number;
  highestPrice: number;
  lowestPrice: number;
  percentageChange: number;
  baseIncrement: number;
  quoteIncrement: number;
  limits: Limits;
  parameters: Parameters;
  metrics: Metrics;
  recommendations: Recommendations;
  orders: Array<any>;
  errors: Array<any>;
  lastAction: string | null;
  forceTrade: boolean;
  datestamp: Date; // display in interface as last updated
}

//--------------- Tracker Models ----------------

export interface Limits {
  stopLossPrice: number | null;
  trailingStopPrice: number | null;
  targetProfitPrice: number | null;
  targetProfitReached: boolean;
  spreadCovered: boolean;
  triggerState: Action;
}

export interface BollingerConfig {
  bollingerStopPercentage: number;
  bollingerSlopeThreshold: number;
  bollingerPositionThreshold: number;
}

export interface Parameters {
  candleGranularity: CandleGranularity;
  longHours: number;
  shortHours: number;
  longVelocityWindow: number;
  shortVelocityWindow: number;
  bollingerPeriod: number;
  longBollingerPeriod: number;
  shortBollingerPeriod: number;
  buy: BollingerConfig;
  sell: BollingerConfig;
}

export interface Metrics {
  longMetrics: DurationMetrics;
  shortMetrics: DurationMetrics;
  combinedMetrics: CombinedMetrics;
}

export interface CombinedMetrics {
  rangeRatio: number;
  bottomRatio: number;
  topRatio: number;
  combinedPosition: number;
}

export interface DurationMetrics {
  currentPrice: number;
  pricePosition: number; //display in interface
  high: number;
  low: number;
  range: number;
  rangePct: number;
  mean: number;
  median: number;
  volatility: number; //display in interface
  trend: number; //display in interface
  velocity: number; //display in interface
  macd: {
    macd: number;
    signalLine: number;
    histogram: number;
  };
  rsi: number;
  ema: number;
  bollingerPosition: {
    upper: number;
    middle: number;
    lower: number;
    price: number;
    upperSlope: number;
    lowerSlope: number;
    pricePosition: number;
    range: number;
    averageRange: number;
  };
  start: Date;
  end: Date;
}

export interface Recommendations {
  buy: Action;
  sell: Action;
}

export interface Action {
  action: string; //enum
  reason: string;
  strength: number | undefined;
}

type CandleGranularity =
  | "ONE_MINUTE"
  | "FIVE_MINUTES"
  | "FIFTEEN_MINUTES"
  | "THIRTY_MINUTES"
  | "ONE_HOUR"
  | "TWO_HOURS"
  | "FOUR_HOURS"
  | "ONE_DAY";

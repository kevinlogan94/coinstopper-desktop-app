// import { CryptoSimple, CryptoProductData } from "main/services/coinbase";

// import { CryptoDetails } from "main/services/coinbase";

interface Window {
    electronAPI: {
        readAppData: () => Promise<AppData>,
        writeAppData: (appData) => Promise<void>,
        openExternal: (url: string) => void,
        validateCoinbaseCredentials: (apiKey: string, apiSecret: string) => Promise<boolean>,
        getCoinbaseBalance: (apiKey: string, apiSecret: string) => Promise<{ usdBalance: number; usdcBalance: number }>,
        getCryptoInvestmentInUSD: (apiKey: string, apiSecret: string) => Promise<number>,
        getCoinbaseCryptoProductData: (apiKey: string, apiSecret: string) => Promise<Array<CryptoDetails>>,
        getAllCoinbaseCrypto: (apiKey: string, apiSecret: string) => Promise<Array<CryptoDetails>>,
        startTradingAssistant: (profileId: string) => Promise<void>,
        stopTradingAssistant: (profileId: string) => Promise<void>,
        isTradingAssistantRunning: (profileId: string) => Promise<boolean>,
        getTrackersByProfileId: (profileId: string) => Promise<{ [symbol: string]: TrackerConfig }>,
        getTrackerMetricsByProfileId: (profileId: string) => Promise<ProfileTrackerMetrics>,
        createTrackerFile: (profileId: string, symbol: string, trackerConfig: TrackerFileConfig) => Promise<void>,
        editTrackerFile: (profileId: string, symbol: string, updatedConfig: TrackerFileConfig) => Promise<void>,
        
        // Ledger methods
        getLedger: (profileId: string) => Promise<Array<Transaction>>,
        addLedgerTransaction: (profileId: string, transaction: Transaction) => Promise<void>,
        createLedgerFile: (profileId: string, transactions?: Transaction[]) => Promise<void>,
    };
}
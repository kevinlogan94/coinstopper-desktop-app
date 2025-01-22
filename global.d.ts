// import { CryptoSimple, CryptoProductData } from "main/services/coinbase";

// import { CryptoDetails } from "main/services/coinbase";

interface Window {
    electronAPI: {
        readAppData: () => Promise<AppData>,
        writeAppData: (appData) => Promise<void>,
        refreshApp: () => Promise<void>,
        openExternal: (url: string) => void,
        validateCoinbaseCredentials: (apiKey: string, apiSecret: string) => Promise<boolean>,
        getCoinbaseBalance: (apiKey: string, apiSecret: string) => Promise<number>,
        getCryptoInvestmentInUSD: (apiKey: string, apiSecret: string) => Promise<number>,
        getCoinbaseCryptoProductData: (apiKey: string, apiSecret: string) => Promise<Array<CryptoDetails>>,
        getAllCoinbaseCrypto: (apiKey: string, apiSecret: string) => Promise<Array<CryptoDetails>>
    };
}
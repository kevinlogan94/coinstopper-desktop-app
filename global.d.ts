interface Window {
    electronAPI: {
        readAppData: () => Promise<AppData>,
        writeAppData: (appData) => Promise<void>,
        refreshApp: () => Promise<void>,
        openExternal: (url: string) => void,
        validateCoinbaseCredentials: (apiKey: string, apiSecret: string) => Promise<boolean>,
        getCoinbaseBalance: (apiKey: string, apiSecret: string) => Promise<number>
    };
}
import { ipcMain } from "electron";
import { CBAdvancedTradeClient } from "coinbase-api";

export const registerCoinbaseMethods = () => {
  ipcMain.handle(
    "coinbase-validate-credentials",
    async (_event, apiKey: string, apiSecret: string): Promise<Boolean> => {
      const client = CreateClient(apiKey, apiSecret);
      try {
        const response = await client.getAccounts();
        // If the request is successful, the API key is valid
        return true;
      } catch (error) {
        console.error("Failed to validate API key:", error.message);
        return false; // API key is invalid
      }
    }
  );

  // funds that are not invested but are sitting and waiting to be invested.
  ipcMain.handle(
    "coinbase-get-balance",
    async (_event, apiKey: string, apiSecret: string): Promise<number> => {
      const client = CreateClient(apiKey, apiSecret);
      try {
        const response = await client.getAccounts();

        //Cash Balance
        return response.accounts
          .filter(
            (account: any) =>
              account.type.toLowerCase().includes("fiat") &&
              parseFloat(account.available_balance.value) > 0
          )
          .reduce(
            (total: number, account: any) =>
              total + parseFloat(account.available_balance.value),
            0
          );
      } catch (error) {
        console.error("Error fetching fiat balance:", error.message);
        throw new Error("Failed to retrieve fiat balance.");
      }
    }
  );
};

ipcMain.handle(
  "coinbase-get-investments-in-USD",
  async (_event, apiKey: string, apiSecret: string): Promise<number> => {
    const client = CreateClient(apiKey, apiSecret);
    try {
      const response = await client.getAccounts();

      let totalInvestmentInUSD = 0;

      // Loop through all accounts to calculate crypto balances
      for (const account of response.accounts) {
        const balanceInCrypto = parseFloat(account.available_balance.value);
        if (
          account.type.toLowerCase().includes("crypto") &&
          balanceInCrypto > 0
        ) {
          // Construct the trading pair (e.g., BTC-USD)
          const tradingPair = `${account.currency}-USD`;

          try {
            // Fetch product information for the trading pair
            const product = await client.getProduct({
              product_id: tradingPair,
            });
            const usdRate = parseFloat(product.price);

            if (usdRate > 0) {
              const balanceInUSD = balanceInCrypto * usdRate;
              totalInvestmentInUSD += balanceInUSD;
            }
          } catch (innerError) {
            console.warn(
              `Failed to fetch product info for ${tradingPair}:`,
              innerError.message
            );
          }
        }
      }

      return totalInvestmentInUSD;
    } catch (error) {
      console.error("Error fetching crypto investments:", error.message);
      throw new Error("Failed to retrieve crypto investment in USD.");
    }
  }
);

export interface CryptoProductData {
  currency: string;
  balanceInCrypto: number;
  price: number;
  priceChange: number;
}

//Pull the crypto product data for what I have invested in.
ipcMain.handle(
  "coinbase-get-crypto-product-data",
  async (
    _event,
    apiKey: string,
    apiSecret: string
  ): Promise<Array<CryptoProductData>> => {
    const client = CreateClient(apiKey, apiSecret);
    try {
      const response = await client.getAccounts();

      const productData: Array<CryptoProductData> = [];

      // Loop through all accounts to gather product data
      for (const account of response.accounts) {
        const balanceInCrypto = parseFloat(account.available_balance.value);
        if (
          account.type.toLowerCase().includes("crypto") &&
          balanceInCrypto > 0
        ) {
          // Construct the trading pair (e.g., BTC-USD)
          const tradingPair = `${account.currency}-USD`;

          try {
            // Fetch product information for the trading pair
            const product = await client.getProduct({
              product_id: tradingPair,
            });
            const price = parseFloat(product.price);
            const priceChange = parseFloat(product.price_percentage_change_24h); // Assuming this field exists

            // Add data to the productData array
            productData.push({
              currency: account.currency,
              balanceInCrypto,
              price,
              priceChange,
            });
          } catch (innerError) {
            console.warn(
              `Failed to fetch product info for ${tradingPair}:`,
              innerError.message
            );
          }
        }
      }

      return productData;
    } catch (error) {
      console.error("Error fetching crypto product data:", error.message);
      throw new Error("Failed to retrieve crypto product data.");
    }
  }
);

export interface CryptoSimple {
  product_id: string;
  base_name: string;
}

//Get all coins available
ipcMain.handle(
  "coinbase-get-all-crypto",
  async (
    _event,
    apiKey: string,
    apiSecret: string
  ): Promise<Array<CryptoSimple>> => {
    const client = CreateClient(apiKey, apiSecret);
    try {
      // Fetch all products
      const response = await client.getProducts();

      // Filter for crypto products and map the result
      const cryptoProducts = response.products
        .filter((product: any) => product.quote_currency_id === "USD") // Assuming crypto pairs have USD as quote currency
        .map(
          (product: any) =>
            ({
              product_id: product.id,
              base_name: product.base_currency, // Base currency (e.g., BTC, ETH)
            } as CryptoSimple)
        );

      return cryptoProducts;
    } catch (error) {
      console.error("Error fetching all crypto products:", error.message);
      throw new Error("Failed to retrieve all crypto products.");
    }
  }
);

export const CreateClient = (
  apiKey: string,
  apiSecret: string
): CBAdvancedTradeClient => {
  return new CBAdvancedTradeClient({
    apiKey: apiKey,
    apiSecret: apiSecret.replace(/\\n/g, "\n"), //I've added this here because when it goes from Vue to Electron \n becomes \\n but we want \n
  });
};

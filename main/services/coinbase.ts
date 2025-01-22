import { ipcMain } from "electron";
import { CBAdvancedTradeClient } from "coinbase-api";
import { AdvTradeProduct } from "coinbase-api/dist/mjs/types/response/advanced-trade-client";

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

//Pull the crypto product data for what I have invested in.
//todo rename this
ipcMain.handle(
  "coinbase-get-crypto-product-data",
  async (
    _event,
    apiKey: string,
    apiSecret: string
  ): Promise<Array<CryptoDetails>> => {
    const client = CreateClient(apiKey, apiSecret);
    try {
      const response = await client.getAccounts();

      const productData: Array<CryptoDetails> = [];

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
            const priceInUSD = parseFloat(product.price);
            const priceChangePercentage24h = parseFloat(Number(product.price_percentage_change_24h).toFixed(2)); // Assuming this field exists
            

            // Add data to the productData array
            productData.push({
              product_id: product.product_id,
              base_name: product.base_name,
              currency: account.currency,
              balanceInCrypto,
              priceInUSD,
              priceChangePercentage24h, // round this
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

export interface CryptoDetails {
  product_id: string;
  base_name: string;
  currency: string;
  balanceInCrypto: number;
  priceInUSD: number;
  priceChangePercentage24h: number;
}

ipcMain.handle(
  "coinbase-get-all-crypto",
  async (
    _event,
    apiKey: string,
    apiSecret: string
  ): Promise<Array<CryptoDetails>> => {
    const client = CreateClient(apiKey, apiSecret);
    try {
      // Fetch all products
      const productResponse = await client.getProducts();

      // Fetch all accounts
      const accountResponse = await client.getAccounts();

      // Create a map of crypto balances by currency
      const cryptoBalances = accountResponse.accounts
      .filter((account: any) => {
        return (
          account.type.toLowerCase().includes("crypto") &&
          parseFloat(account.available_balance?.value || "0") > 0
        );
      })
      .map((account: any) => ({
        currency: account.currency,
        balanceInCrypto: parseFloat(account.available_balance?.value || "0"),
      }));

      // Filter and map crypto products with additional details
      const cryptoDetails: Array<CryptoDetails> = productResponse.products
        .filter((product: AdvTradeProduct) => product.quote_currency_id === "USD")
        .map((product: AdvTradeProduct) => {
          const cryptoBalance = cryptoBalances.find(
            (balance) => balance.currency === product.base_currency_id
          );
          
          const balanceInCrypto = cryptoBalance?.balanceInCrypto ?? 0;
          const priceInUSD = parseFloat(product.price || "0");
          const priceChangePercentage24h = parseFloat(Number(product.price_percentage_change_24h ?? 0).toFixed(2));

          return {
            product_id: product.product_id,
            base_name: product.base_name,
            currency: product.base_currency_id,
            balanceInCrypto,
            priceInUSD,
            priceChangePercentage24h,
          } as CryptoDetails;
        });

      return cryptoDetails;
    } catch (error) {
      console.error("Error fetching crypto product details:", error.message);
      throw new Error("Failed to retrieve crypto product details.");
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

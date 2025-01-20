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
              account.type.toLowerCase().includes("fiat") && parseFloat(account.available_balance.value) > 0
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

export const CreateClient = (
  apiKey: string,
  apiSecret: string
): CBAdvancedTradeClient => {
  return new CBAdvancedTradeClient({
    apiKey: apiKey,
    apiSecret: apiSecret.replace(/\\n/g, "\n"), //I've added this here because when it goes from Vue to Electron \n becomes \\n but we want \n
  });
};

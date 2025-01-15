import { ipcMain } from "electron";
import { CBAdvancedTradeClient } from "coinbase-api";

export const registerCoinbaseMethods = () => {
  ipcMain.handle(
    "coinbase-validate-credentials",
    async (_event, apiKey: string, apiSecret: string): Promise<Boolean> => {
      const client = new CBAdvancedTradeClient({
        apiKey: apiKey,
        apiSecret: apiSecret.replace(/\\n/g, '\n'), //I've added this here because when it goes from Vue to Electron \n becomes \\n but we want \n
      });
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
};

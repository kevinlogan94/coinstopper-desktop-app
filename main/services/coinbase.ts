import { ipcMain } from "electron";
import { CBAdvancedTradeClient } from "coinbase-api";

export const registerCoinbaseMethods = () => {
  ipcMain.handle(
    "coinbase-validate-credentials",
    async (): Promise<Boolean> => {
      const client = new CBAdvancedTradeClient({
        apiKey: "",
        apiSecret: "",
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
